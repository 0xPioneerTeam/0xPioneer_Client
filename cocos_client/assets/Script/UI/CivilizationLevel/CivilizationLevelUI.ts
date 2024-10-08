import { _decorator, Button, Color, instantiate, Label, Layout, Node, ProgressBar, RichText, Sprite, SpriteFrame, UITransform, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import { ArtifactMgr, ClvlMgr, ItemMgr, LanMgr } from "../../Utils/Global";
import { DataMgr } from "../../Data/DataMgr";
import ItemConfig from "../../Config/ItemConfig";
import GameMusicPlayMgr from "../../Manger/GameMusicPlayMgr";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { CLvlConditionType, CLvlEffect, CLvlEffectType, CLvlModel, LvlupConfigData } from "../../Const/Lvlup";
import { ItemConfigType } from "../../Const/Item";
import ArtifactConfig from "../../Config/ArtifactConfig";
import ConfigConfig from "../../Config/ConfigConfig";
import { ConfigType, WorldBoxThresholdParam, WorldTreasureBoxRarityShowNameParam } from "../../Const/Config";
import { InnerBuildingType } from "../../Const/BuildingDefine";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { NetworkMgr } from "../../Net/NetworkMgr";
const { ccclass, property } = _decorator;

@ccclass("CivilizationLevelUI")
export class CivilizationLevelUI extends ViewController {
    //------------------------------ data
    private _clevelDatas: CLvlModel[] = [];
    private _curSelectLevel: number = 1;
    //------------------------------ view
    private _curLevelTitle: Label = null;

    private _clevelProgress: ProgressBar = null;
    private _cLevelItemContent: Node = null;
    private _clevelItem: Node = null;

    private _buffItemContent: Node = null;
    private _buffItem: Node = null;

    private _rewardItemContent: Node = null;
    private _rewardItem: Node = null;

    private _conditionItemContent: Node = null;
    private _conditionItem: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._clevelDatas = ClvlMgr.getData();
        this._curSelectLevel = DataMgr.s.userInfo.data.level;

        const contentView = this.node.getChildByPath("Content");
        // contentView.getChildByPath("TopView/Title").getComponent(Label).string = LanMgr.getLanById("lanreplace200027");
        // contentView.getChildByPath("LeftView/BuffContent/Empty").getComponent(Label).string = LanMgr.getLanById("lanreplace200028");
        // contentView.getChildByPath("LeftView/RewardContent/Title").getComponent(Label).string = LanMgr.getLanById("lanreplace200029");
        // contentView.getChildByPath("LeftView/RewardContent/Empty").getComponent(Label).string = LanMgr.getLanById("lanreplace200028");
        // contentView.getChildByPath("LeftView/RewardContent/ReceiveButton/Title").getComponent(Label).string = LanMgr.getLanById("lanreplace200030");
        // contentView.getChildByPath("RightView/MaxTip").getComponent(Label).string = LanMgr.getLanById("lanreplace200031");
        // contentView.getChildByPath("DevelopButton/Title").getComponent(Label).string = LanMgr.getLanById("lanreplace200032");

        this._curLevelTitle = contentView.getChildByPath("TopView/CurLevel/Label").getComponent(Label);

        this._clevelProgress = contentView.getChildByPath("TopView/LevelShowContent/View/ProgressBar").getComponent(ProgressBar);
        this._cLevelItemContent = contentView.getChildByPath("TopView/LevelShowContent/View/Content");
        this._clevelItem = this._cLevelItemContent.getChildByPath("Item");
        this._clevelItem.removeFromParent();

        this._buffItemContent = contentView.getChildByPath("LeftView/BuffContent/ScrollView/View/Content");
        this._buffItem = this._buffItemContent.getChildByPath("Item");
        this._buffItem.removeFromParent();

        this._rewardItemContent = contentView.getChildByPath("LeftView/RewardContent/ScrollView/View/Content");
        this._rewardItem = this._rewardItemContent.getChildByPath("Item");
        this._rewardItem.removeFromParent();

        this._conditionItemContent = contentView.getChildByPath("RightView/ScrollView/View/Content");
        this._conditionItem = this._conditionItemContent.getChildByPath("Item");
        this._conditionItem.removeFromParent();

        for (let i = 0; i < this._clevelDatas.length; i++) {
            const clevelData = this._clevelDatas[i];
            const clevelItem = instantiate(this._clevelItem);
            this._cLevelItemContent.addChild(clevelItem);

            for (let j = 1; j <= 6; j++) {
                clevelItem.getChildByPath("Icon/icon_" + j).active = clevelData.age == j;
            }
            for (let j = 1; j <= 5; j++) {
                clevelItem.getChildByPath("level/img_" + j).active = clevelData.level == j;
            }
            clevelItem.getComponent(Button).clickEvents[0].customEventData = i.toString();
        }
        this._cLevelItemContent.getComponent(Layout).updateLayout();

        this._refreshUI();
        this._refreshConditionUI();
    }

    protected viewDidStart(): void {
        super.viewDidStart();
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._onInnerBuildingUpgradeFinished, this);
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._onUserInfoHeatChanged, this);
        NotificationMgr.addListener(NotificationName.USERINFO_CLVL_CONDTION_CHANGE, this._onUserInfoCLvlCondtionChanged, this);
        NotificationMgr.addListener(NotificationName.USERINFO_CLVL_REWARD_GET_CHANGE, this._onUserInfoCLvlRewardChanged, this);
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_LEVEL, this._onUerInfoLevelChanged, this);
    }

    protected viewPopAnimation(): boolean {
        return true;
    }

    protected contentView(): Node {
        return this.node.getChildByPath("Content");
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
        NotificationMgr.removeListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._onInnerBuildingUpgradeFinished, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._onUserInfoHeatChanged, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_CLVL_CONDTION_CHANGE, this._onUserInfoCLvlCondtionChanged, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_CLVL_REWARD_GET_CHANGE, this._onUserInfoCLvlRewardChanged, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_LEVEL, this._onUerInfoLevelChanged, this);
    }

    //----------------------------- function
    private async _refreshUI() {
        if (this._clevelDatas.length < 0 || this._curSelectLevel - 1 < 0 || this._curSelectLevel - 1 > this._cLevelItemContent.children.length - 1) {
            return;
        }
        // clevel item
        this._curLevelTitle.string = LanMgr.getLanById(this._clevelDatas[this._curSelectLevel - 1].name);

        const clevelItemContentLayout = this._cLevelItemContent.getComponent(Layout);
        this._cLevelItemContent.position = v3(
            (this._curSelectLevel - 1) * (-clevelItemContentLayout.spacingX - this._clevelItem.getComponent(UITransform).width),
            this._cLevelItemContent.position.y,
            this._cLevelItemContent.position.z
        );

        for (let i = 0; i < this._cLevelItemContent.children.length; i++) {
            const item = this._cLevelItemContent.children[i];
            item.getChildByPath("img_GradeBg_Select").active = i + 1 == this._curSelectLevel;
            item.getChildByPath("img_GradeBg").active = i + 1 != this._curSelectLevel;
        }

        // progress
        const curcLevelItemView = this._cLevelItemContent.children[DataMgr.s.userInfo.data.level - 1];
        if (curcLevelItemView != undefined) {
            const progressTransform = this._clevelProgress.getComponent(UITransform);
            this._clevelProgress.progress = Math.min(
                1,
                Math.max(0, progressTransform.convertToNodeSpaceAR(curcLevelItemView.worldPosition).x / progressTransform.width)
            );
        }

        // effect
        const curcLevelEffect = ClvlMgr.getCLvlEffectByLevel(DataMgr.s.userInfo.data.level);
        const effectView = this.node.getChildByPath("Content/LeftView/BuffContent/ScrollView");
        const emptyView = this.node.getChildByPath("Content/LeftView/BuffContent/Empty");

        const selectLevelEffect = ClvlMgr.getCLvlEffectByLevel(this._curSelectLevel);
        if (selectLevelEffect.size > 0) {
            effectView.active = true;
            emptyView.active = false;

            this._buffItemContent.destroyAllChildren();

            const worldBoxShowNames: string[] = (ConfigConfig.getConfig(ConfigType.WorldTreasureBoxRarityShowName) as WorldTreasureBoxRarityShowNameParam)
                .showNames;
            const showData: { title: string; valueColor: Color; value: string }[] = [];
            if (DataMgr.s.userInfo.data.level == this._curSelectLevel) {
                curcLevelEffect.forEach((value: CLvlEffect, key: CLvlEffectType) => {
                    const temp = {
                        title: value.title,
                        valueColor: new Color().fromHEX("#F3E4B1"),
                        value: "",
                    };
                    if (key == CLvlEffectType.WORLDBOXRANK) {
                        temp.value = LanMgr.getLanById(worldBoxShowNames[value.value - 1]);
                    } else if (key == CLvlEffectType.CITY_AND_PIONEER_VISION_RANGE) {
                        temp.value = value.value.toString();
                    } else {
                        temp.value = Math.floor(value.value * 100) + "%";
                    }
                    showData.push(temp);
                });
            } else {
                selectLevelEffect.forEach((value: CLvlEffect, key: CLvlEffectType) => {
                    const temp = {
                        title: value.title,
                        valueColor: new Color().fromHEX("#8EDA61"),
                        value: "",
                    };
                    let curCLvlEffectValue: number = -1;
                    curcLevelEffect.forEach((curValue: CLvlEffect, curKey: CLvlEffectType) => {
                        if (curKey == key) {
                            curCLvlEffectValue = curValue.value;
                        }
                    });
                    if (curCLvlEffectValue == -1) {
                        // new effect use green color
                        temp.valueColor = new Color().fromHEX("#8EDA61");
                    } else {
                        const gap = value.value - curCLvlEffectValue;
                        if (gap > 0) {
                            temp.valueColor = new Color().fromHEX("#8EDA61");
                        } else if (gap == 0) {
                            temp.valueColor = new Color().fromHEX("#F3E4B1");
                        } else {
                            temp.valueColor = new Color().fromHEX("#FF5353");
                        }
                    }
                    if (value.type == CLvlEffectType.WORLDBOXRANK) {
                        temp.value = LanMgr.getLanById(worldBoxShowNames[value.value - 1]);
                    } else if (value.type == CLvlEffectType.CITY_AND_PIONEER_VISION_RANGE) {
                        if (curCLvlEffectValue == -1) {
                            temp.value = "+" + value.value.toString();
                        } else {
                            const gap = value.value - curCLvlEffectValue;
                            if (gap >= 0) {
                                temp.value = "+" + gap;
                            } else {
                                temp.value = gap.toString();
                            }
                        }
                    } else {
                        if (curCLvlEffectValue == -1) {
                            temp.value = "+" + Math.floor(value.value * 100) + "%";
                        } else {
                            const gap = value.value - curCLvlEffectValue;
                            if (gap >= 0) {
                                temp.value = "+" + Math.floor(gap * 100) + "%";
                            } else {
                                temp.value = Math.floor(gap * 100) + "%";
                            }
                        }
                    }
                    showData.push(temp);
                });
            }
            for (let i = 0; i < showData.length; i++) {
                const data = showData[i];
                const item = instantiate(this._buffItem);
                this._buffItemContent.addChild(item);

                item.getChildByPath("Title").getComponent(Label).string = data.title;
                item.getChildByPath("Value").getComponent(Label).color = data.valueColor;
                item.getChildByPath("Value").getComponent(Label).string = data.value;
                item.getChildByPath("Line").active = i != 0;
            }
            this._buffItemContent.getComponent(Layout).updateLayout();
        } else {
            effectView.active = false;
            emptyView.active = true;
        }

        // reward
        const selectLevelRewards = this._clevelDatas[this._curSelectLevel - 1].rewards;
        const rewardView = this.node.getChildByPath("Content/LeftView/RewardContent/ScrollView");
        const rewardGetButton = this.node.getChildByPath("Content/LeftView/RewardContent/ReceiveButton");
        const rewardEmptyView = this.node.getChildByPath("Content/LeftView/RewardContent/Empty");
        if (selectLevelRewards.length > 0) {
            rewardView.active = true;
            rewardGetButton.active = true;
            rewardEmptyView.active = false;

            this._rewardItemContent.destroyAllChildren();
            for (let i = 0; i < this._clevelDatas[this._curSelectLevel - 1].rewards.length; i++) {
                const reward = this._clevelDatas[this._curSelectLevel - 1].rewards[i];

                let rank: number = 0;
                let icon: SpriteFrame = null;
                if (reward.type == ItemConfigType.Item) {
                    const config = ItemConfig.getById(reward.propId);
                    if (config == null) {
                        continue;
                    }
                    rank = config.grade;
                    icon = await ItemMgr.getItemIcon(config.icon);
                } else if (reward.type == ItemConfigType.Artifact) {
                    const config = ArtifactConfig.getById(reward.propId);
                    if (config == null) {
                        continue;
                    }
                    rank = config.rank;
                    icon = await ArtifactMgr.getItemIcon(config.icon);
                }
                if (rank == 0 || icon == null) {
                    continue;
                }
                const rewardItem = instantiate(this._rewardItem);
                this._rewardItemContent.addChild(rewardItem);

                for (let j = 1; j <= 5; j++) {
                    rewardItem.getChildByPath("Level" + j).active = j == rank;
                }
                rewardItem.getChildByPath("Icon").getComponent(Sprite).spriteFrame = icon;
                rewardItem.getChildByPath("Num/Value").getComponent(Label).string = reward.num.toString();
            }
            this._rewardItemContent.getComponent(Layout).updateLayout();

            // get reward button
            let isGetted: boolean = DataMgr.s.userInfo.data.CLvlRewardGetMap.get(this._curSelectLevel) === true;
            rewardGetButton.getComponent(Button).interactable = !isGetted && DataMgr.s.userInfo.data.level >= this._curSelectLevel;
            rewardGetButton.getComponent(Sprite).grayscale = isGetted || DataMgr.s.userInfo.data.level < this._curSelectLevel;
        } else {
            rewardView.active = false;
            rewardGetButton.active = false;
            rewardEmptyView.active = true;
        }
    }

    private _refreshConditionUI() {
        const maxTip = this.node.getChildByPath("Content/RightView/MaxTip");
        const conditionView = this.node.getChildByPath("Content/RightView/ScrollView");

        const conditions = this._clevelDatas[DataMgr.s.userInfo.data.level - 1]?.condition;
        if (conditions == undefined) {
            maxTip.active = true;
            conditionView.active = false;
            return;
        }

        maxTip.active = false;
        conditionView.active = true;
        this._conditionItemContent.destroyAllChildren();
        let isAllConditionFinish: boolean = true;
        for (let i = 0; i < conditions.length; i++) {
            const condition = conditions[i];
            const conditionItem = instantiate(this._conditionItem);

            this._conditionItemContent.addChild(conditionItem);

            conditionItem.getChildByPath("Title").getComponent(RichText).string = condition.title;

            let progress: number = 0;
            if (condition.type == CLvlConditionType.InnerBuildingLevelUpToSpecificLevel) {
                const innerBuildingLevel = DataMgr.s.innerBuilding.getInnerBuildingLevel(condition.innerBuildingCLvl.buildingId as InnerBuildingType);
                progress = innerBuildingLevel;
            } else if (condition.type == CLvlConditionType.HeatToSpecificLevel) {
                const heatValue: number = DataMgr.s.userInfo.data.heatValue.currentHeatValue;
                const worldBoxThreshold: number[] = (ConfigConfig.getConfig(ConfigType.WorldBoxThreshold) as WorldBoxThresholdParam).thresholds;
                const gapNum: number = 5;
                let heatLevel: number = gapNum;
                for (let i = 0; i < gapNum; i++) {
                    let endNum: number = worldBoxThreshold[i];
                    if (heatValue <= endNum) {
                        heatLevel = i + 1;
                        break;
                    }
                }
                progress = heatLevel;
            } else {
                for (const temp of DataMgr.s.userInfo.data.CLvlCondtion) {
                    if (temp.type == condition.type) {
                        if (
                            (temp.type == CLvlConditionType.CollectSpecificLevelResourceToSpecificTimes && temp.collect.level == condition.collect.level) ||
                            (temp.type == CLvlConditionType.ExploreSpecificLevelEventToSpecificTimes && temp.explore.level == condition.explore.level) ||
                            (temp.type == CLvlConditionType.GetSpecificRankPioneerToSpecificNum && temp.getRankPioneer.rank == condition.getRankPioneer.rank) ||
                            (temp.type == CLvlConditionType.GetSpecificLevelPioneerToSpecificNum &&
                                temp.getLevelPioneer.level == condition.getLevelPioneer.level) ||
                            (temp.type == CLvlConditionType.CostSpecificResourceToSpecificNum && temp.cost.itemId == condition.cost.itemId) ||
                            (temp.type == CLvlConditionType.KillSpecificMonsterToSpecificNum && temp.kill.level == condition.kill.level) ||
                            temp.type == CLvlConditionType.WinOtherPlayerToSpecificTimes
                        ) {
                            progress = temp.value;
                            break;
                        }
                    }
                }
            }

            conditionItem.getChildByPath("ProgressBar").getComponent(ProgressBar).progress = progress / condition.value;

            if (progress >= condition.value) {
                conditionItem.getChildByPath("CommonBg").active = false;
                conditionItem.getChildByPath("CompleteBg").active = true;
            } else {
                conditionItem.getChildByPath("CommonBg").active = true;
                conditionItem.getChildByPath("CompleteBg").active = false;

                conditionItem.getChildByPath("CommonBg/Progress/Total").getComponent(Label).string = condition.value.toString();
                conditionItem.getChildByPath("CommonBg/Progress/Value").getComponent(Label).string = progress.toString();

                isAllConditionFinish = false;
            }
        }
        this._conditionItemContent.getComponent(Layout).updateLayout();

        this.node.getChildByPath("Content/DevelopButton").getComponent(Button).interactable = isAllConditionFinish;
        this.node.getChildByPath("Content/DevelopButton").getComponent(Sprite).grayscale = !isAllConditionFinish;
    }

    //------------------------------ action
    private onTapClevelItem(event: Event, customEventData: string) {
        GameMusicPlayMgr.playTapButtonEffect();
        const index = parseInt(customEventData);
        this._curSelectLevel = index + 1;
        this._refreshUI();
    }

    private onTapReceive() {
        GameMusicPlayMgr.playTapButtonEffect();
        NetworkMgr.websocketMsg.player_level_reward({
            level: this._curSelectLevel,
        });
    }

    private onTapDevelop() {
        GameMusicPlayMgr.playTapButtonEffect();
        NetworkMgr.websocketMsg.player_level_up({});
    }

    private async onTapClose() {
        GameMusicPlayMgr.playTapButtonEffect();
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel(this.node);
    }

    //------------------------------ notify
    private _onInnerBuildingUpgradeFinished() {
        this._refreshConditionUI();
    }
    private _onUserInfoHeatChanged() {
        this._refreshConditionUI();
    }
    private _onUserInfoCLvlCondtionChanged() {
        this._refreshConditionUI();
    }
    private _onUserInfoCLvlRewardChanged() {
        this._refreshUI();
    }
    private _onUerInfoLevelChanged() {
        this._refreshUI();
        this._refreshConditionUI();
    }
}
