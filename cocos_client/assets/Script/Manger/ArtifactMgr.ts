import { SpriteFrame, sys } from "cc";
import { PioneerMgr, ResourcesMgr } from "../Utils/Global";
import ArtifactData from "../Model/ArtifactData";
import ArtifactConfig from "../Config/ArtifactConfig";
import ArtifactEffectConfig from "../Config/ArtifactEffectConfig";
import NotificationMgr from "../Basic/NotificationMgr";
import { EventName } from "../Const/ConstDefine";
import { ArtifactArrangeType, ArtifactProp, ArtifactPropValueType } from "../Const/Artifact";
import CLog from "../Utils/CLog";

export default class ArtifactMgr {
    private _maxArtifactLength: number = 100;
    private _localStorageKey: string = "artifact_data";
    private _localArtifactDatas: ArtifactData[] = [];

    private _itemIconSpriteFrames = {};

    public get artifactIsFull(): boolean {
        return this._localArtifactDatas.length >= this._maxArtifactLength;
    }
    public get maxItemLength(): number {
        return this._maxArtifactLength;
    }
    public get localArtifactDatas(): ArtifactData[] {
        return this._localArtifactDatas;
    }

    public constructor() {}

    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await ResourcesMgr.LoadABResource("icon/artifact/" + iconName + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }

    public async initData(): Promise<boolean> {
        // load local artifact data
        const jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if (jsonStr) {
            try {
                this._localArtifactDatas = JSON.parse(jsonStr);
                return true;
            } catch (e) {
                CLog.error("ArtifactMgr initData error", e);
                return false;
            }
        }
        return true;
    }

    public getOwnArtifactCount(artifactConfigId: string): number {
        let count: number = 0;
        for (const artifact of this._localArtifactDatas) {
            if (artifact.artifactConfigId == artifactConfigId) {
                count += artifact.count;
            }
        }
        return count;
    }

    public getPropEffValue(cLv: number) {
        const r = {
            prop: {}, // propType => { add: 0, mul: 0}
            eff: {}, // effectType => 0
        };

        for (let i = 0; i < this._localArtifactDatas.length; i++) {
            const artifact = this._localArtifactDatas[i];
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);

            // prop
            if (artifactConfig.prop.length > 0) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];

                    if (!r.prop[propType]) r.prop[propType] = { add: 0, mul: 0 };

                    if (propValue[0] == ArtifactPropValueType.ADD) {
                        r.prop[propType].add += propValue[0] * artifact.count;
                    } else if (propValue[0] == ArtifactPropValueType.MUL) {
                        r.prop[propType].mul += propValue[0] * artifact.count;
                    }
                }
            }

            // effect
            if (artifactConfig.effect.length > 0) {
                for (let j = 0; j < artifactConfig.effect.length; j++) {
                    const effectId = artifactConfig.effect[j];
                    const effConfig = ArtifactEffectConfig.getById(effectId);
                    const effectType = effConfig.type;

                    if (effConfig.unlock && effConfig.unlock > cLv) {
                        continue;
                    }

                    if (!r.eff[effectType]) r.eff[effectType] = 0;
                    r.eff[effectType] += effConfig.para[0] * artifact.count;
                }
            }
        }

        return r;
    }

    public addArtifact(artifacts: ArtifactData[]): void {
        if (artifacts.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const artifact of artifacts) {
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
            if (artifactConfig == null) continue;
            if (this.artifactIsFull) continue;

            changed = true;
            const exsitArtifacts = this._localArtifactDatas.filter((v) => v.artifactConfigId == artifact.artifactConfigId);
            if (exsitArtifacts.length > 0) {
                exsitArtifacts[0].count += artifact.count;
                exsitArtifacts[0].addTimeStamp = new Date().getTime();
            } else {
                artifact.addTimeStamp = new Date().getTime();
                this._localArtifactDatas.push(artifact);
            }

            if (artifactConfig.effect != null) {
                for (const temple of artifactConfig.effect) {
                    const effectData = ArtifactEffectConfig.getById(temple);
                }
            }
            if (artifactConfig.prop != null) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType: ArtifactProp = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];
                    if (propType == ArtifactProp.HP) {
                        PioneerMgr.pioneerChangeAllPlayerHpMax({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    } else if (propType == ArtifactProp.ATTACK) {
                        PioneerMgr.pioneerChangeAllPlayerAttack({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    }
                }
            }
        }
        if (changed) {
            sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));
            NotificationMgr.triggerEvent(EventName.ARTIFACT_CHANGE);
        }
    }

    public subArtifact(artifactConfigId: string, count: number): boolean {
        let idx = this._localArtifactDatas.findIndex((v) => {
            return v.artifactConfigId == artifactConfigId;
        });

        if (idx < 0) {
            return false;
        }

        if (this._localArtifactDatas[idx].count < count) {
            return false;
        }

        this._localArtifactDatas[idx].count -= count;

        const artifactConfig = ArtifactConfig.getById(artifactConfigId);
        if (artifactConfig != null) {
            // TODO: calc prop
        }

        if (this._localArtifactDatas[idx].count <= 0) {
            this._localArtifactDatas.splice(idx, 1);
        }

        sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));
        NotificationMgr.triggerEvent(EventName.ARTIFACT_CHANGE);

        return true;
    }

    public arrange(sortType: ArtifactArrangeType): void {
        // merge same item
        const singleItems: Map<string, ArtifactData> = new Map();
        for (let i = 0; i < this._localArtifactDatas.length; i++) {
            const item = this._localArtifactDatas[i];
            if (singleItems.has(item.artifactConfigId)) {
                const savedItem = singleItems.get(item.artifactConfigId);
                savedItem.count += item.count;
                savedItem.addTimeStamp = Math.max(savedItem.addTimeStamp, item.addTimeStamp);
                this._localArtifactDatas.splice(i, 1);
                i--;
            } else {
                singleItems.set(item.artifactConfigId, item);
            }
        }
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));

        if (sortType == ArtifactArrangeType.Recently) {
            this._localArtifactDatas.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ArtifactArrangeType.Rarity) {
            //bigger in front
            this._localArtifactDatas.sort((a, b) => {
                return ArtifactConfig.getById(b.artifactConfigId).rank - ArtifactConfig.getById(a.artifactConfigId).rank;
            });
        }

        NotificationMgr.triggerEvent(EventName.ARTIFACT_CHANGE);
    }
}
