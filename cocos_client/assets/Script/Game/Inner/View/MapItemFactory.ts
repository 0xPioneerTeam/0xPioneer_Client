import { _decorator, Component, Node, Vec2, Vec3, CCString, CCInteger, UIOpacity, log, Prefab, instantiate, Label } from 'cc';
import { MapItem } from '../../../BasicView/MapItem';
import { EventName } from '../../../Const/ConstDefine';
import { GameMain } from '../../../GameMain';
import EventMgr from '../../../Manger/EventMgr';
import InnerBuildingMgr from '../../../Manger/InnerBuildingMgr';
import UserInfoMgr, { UserInfoEvent, UserInnerBuildInfo, FinishedEvent } from '../../../Manger/UserInfoMgr';
import CommonTools from '../../../Tool/CommonTools';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';
import CountMgr, { CountType } from '../../../Manger/CountMgr';
import LanMgr from '../../../Manger/LanMgr';
import ItemMgr from '../../../Manger/ItemMgr';
import ArtifactMgr from '../../../Manger/ArtifactMgr';
import { ArtifactEffectType } from '../../../Model/ArtifactData';

const { ccclass, property } = _decorator;

@ccclass('MapItemFactory')
export class MapItemFactory extends MapItem implements UserInfoEvent {


    @property(CCString)
    buildID = "1";

    @property(InnerBuildUI)
    private buildInfoUI: InnerBuildUI = null;

    @property([Prefab])
    private buildPfbList: Prefab[] = [];

    private buildData: UserInnerBuildInfo = null;
    private _upgradeIng = false;

    private _showBuilding: Node = null;
    private _recruitCountTime: Label = null;
    override _onClick() {
        super._onClick();

        if (this._upgradeIng) {

            // useLanMgr
            GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201001"));
            // GameMain.inst.UI.ShowTip("The building is being upgraded, please wait.");

            return;
        }

        if (this.buildData == null) {
            return;
        }
        if (this.buildData.buildID == "3" && this.buildData.buildLevel > 0) {
            if (UserInfoMgr.Instance.isGeneratingTroop) {
                
                // useLanMgr
                GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201002"));
                // GameMain.inst.UI.ShowTip("Recruiting…Please wait…");

                return;
            }
            GameMain.inst.UI.recruitUI.show(true);
            GameMain.inst.UI.recruitUI.refreshUI(true);
        } else {
            GameMain.inst.UI.factoryInfoUI.refreshUI(this.buildData);
            GameMain.inst.UI.factoryInfoUI.show(true);
        }
    }

    onLoad(): void {
        if (this.node.getChildByName("RecruitTime") != null) {
            this._recruitCountTime = this.node.getChildByName("RecruitTime").getComponent(Label);
            this._recruitCountTime.node.active = false;
        }
    }

    start() {
        super.start();
        const innerBuildData = UserInfoMgr.Instance.innerBuilds;
        this.buildData = innerBuildData.get(this.buildID);
        this.refresh();

        EventMgr.on(EventName.BUILD_LEVEL_UP, this.onLevelUP, this);
        UserInfoMgr.Instance.addObserver(this);
    }

    protected onEnable(): void {

    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        UserInfoMgr.Instance.removeObserver(this);
    }


    refresh() {
        if (this.buildData == null) {
            return;
        }
        this.buildInfoUI?.refreshUI(this.buildData);
        if (this.buildData.buildLevel < this.buildPfbList.length) {
            if (this._showBuilding != null) {
                this._showBuilding.destroy();
            }
            const buildView = instantiate(this.buildPfbList[this.buildData.buildLevel]);
            this.node.addChild(buildView);
            this._showBuilding = buildView;
        }
        this.buildInfoUI.node.setSiblingIndex(999);
    }

    onLevelUP(buildId) {
        if (buildId != this.buildID) {
            return;
        }
        this.onUpgrade();
    }

    onUpgrade() {
        if (this._upgradeIng) {

            // useLanMgr
            GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201003"));
            // GameMain.inst.UI.ShowTip("The building is being upgraded, please wait.");

            return;
        }
        let canUpgrade: boolean = true;
        const buildingInfo = InnerBuildingMgr.Instance.getInfoById(this.buildData.buildID);
        if (this.buildData.buildLevel < buildingInfo.maxLevel) {

            // artifact effect
            const artifactPropEff = ArtifactMgr.Instance.getPropEffValue();
            let artifactTime = 0;
            if (artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME]) {
                artifactTime = artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME];
            }
            let artifactResource = 0;
            if (artifactPropEff.eff[ArtifactEffectType.BUILDING_LVLUP_RESOURCE]) {
                artifactResource = artifactPropEff.eff[ArtifactEffectType.BUILDING_LVLUP_RESOURCE];
            }

            // resource save waiting changed
            const nextLevelInfo = buildingInfo.up[this.buildData.buildLevel + 1];
            for (const resource of nextLevelInfo.cost) {
                let needNum = resource.num;
                // total num
                needNum = Math.floor(needNum - (needNum * artifactResource));

                if (ItemMgr.Instance.getOwnItemCount(parseInt(resource.type)) < needNum) {
                    canUpgrade = false;
                    break;
                }
            }
            if (!canUpgrade) {

                // useLanMgr
                GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201004"));
                // GameMain.inst.UI.ShowTip("Insufficient resources for building upgrades");
                
                return;
            }
            this._upgradeIng = true;
            for (const resource of nextLevelInfo.cost) {
                let needNum = resource.num;
                // total num
                needNum = Math.floor(needNum - (needNum * artifactResource));
                ItemMgr.Instance.subItem(parseInt(resource.type), needNum);
            }
            UserInfoMgr.Instance.upgradeBuild(this.buildID);
            UserInfoMgr.Instance.explorationValue += nextLevelInfo.progress;
            // exp
            if (nextLevelInfo.exp) UserInfoMgr.Instance.exp += nextLevelInfo.exp;


            let up_time = 5;
            // total time
            up_time = Math.floor(up_time - (up_time * artifactTime));
            if (up_time < 0) up_time = 1;

            GameMain.inst.innerSceneMap.playBuildAnim(this.node, up_time, () => {
                this.refresh();
                this._upgradeIng = false;
            });
            this.buildInfoUI.setProgressTime(up_time);
        }
    }


    //---------------------------------------------------
    // UserInfoEvent
    playerNameChanged(value: string): void {

    }
    playerExplorationValueChanged?(value: number): void {

    }
    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string, delayTime: number): void {

    }
    finishEvent(event: FinishedEvent): void {

    }
    taskProgressChanged(taskId: string): void {

    }
    taskFailed(taskId: string): void {

    }
    getProp(propId: string, num: number): void {

    }
    gameTaskOver(): void {

    }
    generateTroopTimeCountChanged(leftTime: number): void {
        if (this._recruitCountTime != null) {
            if (leftTime > 0) {
                this._recruitCountTime.node.active = true;
                this._recruitCountTime.string = CommonTools.formatSeconds(leftTime);
            } else {
                this._recruitCountTime.node.active = false;
            }
        }
    }
}


