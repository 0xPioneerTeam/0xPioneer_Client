import { _decorator, Button, Component, instantiate, Label, Layout, Node, PageView, ScrollView, Toggle, UITransform, v2, v3, Vec2, Widget } from "cc";
import ViewController from "../../BasicView/ViewController";
import UIPanelManger from "../../Basic/UIPanelMgr";
import GameMusicPlayMgr from "../../Manger/GameMusicPlayMgr";
import { DataMgr } from "../../Data/DataMgr";
import { PlayerInfoItem } from "../View/PlayerInfoItem";
import { MapPioneerActionType, MapPioneerObject, MapPioneerType, MapPlayerPioneerObject } from "../../Const/PioneerDefine";
import GameMainHelper from "../../Game/Helper/GameMainHelper";
import CommonTools from "../../Tool/CommonTools";
import { UIName } from "../../Const/ConstUIDefine";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { GameMgr, LanMgr } from "../../Utils/Global";
import { MapBuildingObject } from "../../Const/MapBuilding";
import { TilePos } from "../../Game/TiledMap/TileTool";
import { MapBuildingType } from "../../Const/BuildingDefine";
import { MapInteractType, ResourceData } from "../../Const/ConstDefine";
import ConfigConfig from "../../Config/ConfigConfig";
import { ConfigType, WormholeMatchConsumeParam, WormholeTeleportConsumeParam } from "../../Const/Config";
import { UIHUDController } from "../UIHUDController";
import { CircularList, CircularListDelegate } from "../../BasicView/CircularList";
const { ccclass, property } = _decorator;

@ccclass("DispatchUI")
export class DispatchUI extends ViewController implements CircularListDelegate {
    private _interactType: MapInteractType;
    private _interactBuilding: MapBuildingObject;
    private _interactPioneer: MapPioneerObject;
    private _targetPos: Vec2;
    private _tempShowCostEnergy: number = 0;
    private _step: number;
    private _moveSpeed: number = 0;
    private _actionCallback: (confirmed: boolean, actionPioneerUnqueId: string, movePath: TilePos[], isReturn: boolean) => void = null;

    private _isReturn: boolean = true;

    private _returnTitle: Node = null;
    private _returnSwitchButton: Node = null;
    private _playerShowView: CircularList = null;
    private _playerContentView: Node = null;
    private _playerLeftSwitchButton: Node = null;
    private _playerRightSwitchButton: Node = null;
    private _playerItem: Node = null;

    private _playerShowData: MapPlayerPioneerObject[] = [];
    private _playerShowItems: Node[] = [];

    public configuration(
        interactType: MapInteractType,
        interactBuilding: MapBuildingObject,
        interactPioneer: MapPioneerObject,
        targetPos: Vec2,
        tempShowCostEnergy: number,
        step: number,
        moveSpeed: number,
        actionCallback: (confirmed: boolean, actionPioneerUnqueId: string, movePath: TilePos[], isReturn: boolean) => void
    ) {
        this._interactType = interactType;
        this._interactBuilding = interactBuilding;
        this._interactPioneer = interactPioneer;
        this._targetPos = targetPos;
        this._tempShowCostEnergy = tempShowCostEnergy;
        this._step = step;
        this._moveSpeed = moveSpeed;
        this._actionCallback = actionCallback;
        this._refreshUI();
    }

    protected viewDidLoad(): void {
        super.viewDidLoad();

        // this.node.getChildByPath("ContentView/Title").getComponent(Label).string = LanMgr.getLanById("lanreplace200033");
        // this.node.getChildByPath("ContentView/ReturnTitle").getComponent(Label).string = LanMgr.getLanById("lanreplace200035");
        this.node.getChildByPath("ContentView/ListButton/Label").getComponent(Label).string = LanMgr.getLanById("850000");

        const localReturn = localStorage.getItem("__interactReturn");
        this._isReturn = localReturn == "false" ? false : true;

        this._returnTitle = this.node.getChildByPath("ContentView/ReturnTitle");
        this._returnSwitchButton = this.node.getChildByPath("ContentView/ReturnSwitchButton");
        this._playerShowView = this.node.getChildByPath("ContentView/CircularList").getComponent(CircularList);
        this._playerShowView.delegate = this;
        this._playerItem = this._playerShowView.node.getChildByPath("Item");
        // this._playerItem.getChildByPath("CostView/CostTime").getComponent(Label).string = LanMgr.getLanById("lanreplace200034");
        this._playerItem.removeFromParent();

        this._playerLeftSwitchButton = this.node.getChildByPath("ContentView/SwitchToLeftButton");
        this._playerRightSwitchButton = this.node.getChildByPath("ContentView/SwitchToRightButton");
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        this._prepareData();
        this._refreshUI();

        NotificationMgr.addListener(NotificationName.MAP_PIONEER_HP_CHANGED, this._onPioneerHpChange, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_ENERGY_CHANGED, this._onPioneerEnergyChange, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_HP_CHANGED, this._onPioneerHpChange, this);
        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_ENERGY_CHANGED, this._onPioneerEnergyChange, this);
    }

    //------------------------------- local function
    private _prepareData() {
        this._playerShowData = [];
        const players = DataMgr.s.pioneer.getAllSelfPlayers();
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            if (player.NFTId == null) {
                continue;
            }
            if (this._interactType == MapInteractType.MainBack && player.actionType != MapPioneerActionType.staying) {
                continue;
            }
            this._playerShowData.push(player);
        }
        if (this._playerShowData.length == 0) {
            UIPanelManger.inst.popPanel(this.node);
            UIHUDController.showCenterTip("All the pioneers are in the city");
            return;
        }
    }

    private _refreshUI() {
        this._playerShowView.reloadUI();

        this._playerLeftSwitchButton.active = this._playerShowView.canCircular();
        this._playerRightSwitchButton.active = this._playerShowView.canCircular();

        // not support return actions
        this._returnSwitchButton.active =
            this._interactType != MapInteractType.WmMark &&
            this._interactType != MapInteractType.WmMatch &&
            this._interactType != MapInteractType.WmRecall &&
            this._interactType != MapInteractType.WmTeleport &&
            this._interactType != MapInteractType.MainBack;
        this._returnSwitchButton.getChildByPath("Selected").active = this._isReturn;
        this._returnTitle.active = this._returnSwitchButton.active;
    }

    //-------------------------- action
    private onTapClose() {
        GameMusicPlayMgr.playTapButtonEffect();
        UIPanelManger.inst.popPanel(this.node);
        if (this._actionCallback != null) {
            this._actionCallback(false, null, [], false);
        }
    }
    private onTapLeftSwitch(isLongPress: boolean) {
        GameMusicPlayMgr.playTapButtonEffect();
        this._playerShowView.switchToLeft(isLongPress ? 0.1 : 0.3);
    }
    private onTapRightSwitch(isLongPress: boolean) {
        GameMusicPlayMgr.playTapButtonEffect();
        this._playerShowView.swithToRight(isLongPress ? 0.1 : 0.3);
    }
    private onTapList() {
        GameMusicPlayMgr.playTapButtonEffect();
        UIPanelManger.inst.pushPanel(UIName.PlayerDispatchListUI);
    }
    private onReturnCheckToggle() {
        this._isReturn = !this._isReturn;
        localStorage.setItem("__interactReturn", this._isReturn.toString());
        this._returnSwitchButton.getChildByPath("Selected").active = this._isReturn;
    }
    //----------------------------------------------- notification
    private _onPioneerHpChange() {
        this._prepareData();
        this._refreshUI();
    }
    private _onPioneerEnergyChange() {
        this._prepareData();
        this._refreshUI();
    }
    //------------------------------------------------ CircularListDelegate
    public circularListTotalNum(): number {
        return this._playerShowData.length;
    }
    public circularListUpdateNode(node: Node, index: number): void {
        const player = this._playerShowData[index];
        node.getComponent(PlayerInfoItem).refreshUI(player);
        const itemCostView = node.getChildByPath("CostView");
        let beginPos: Vec2 = player.stayPos;
        let sparePositions: Vec2[] = [];
        let targetStayPostions: Vec2[] = [];
        if (this._interactBuilding != null) {
            sparePositions = this._interactBuilding.stayMapPositions.slice();
            targetStayPostions = this._interactBuilding.stayMapPositions.slice();
            if (this._interactBuilding.type == MapBuildingType.city && sparePositions.length == 7) {
                sparePositions.splice(3, 1);
            }
        } else if (this._interactPioneer != null) {
            if (this._interactPioneer.type == MapPioneerType.player || this._interactPioneer.type == MapPioneerType.npc) {
                targetStayPostions = [this._interactPioneer.stayPos];
            }
        }
        const moveGap = Math.abs(beginPos.x - this._targetPos.x) + Math.abs(beginPos.y - this._targetPos.y);
        if (moveGap >= 200) {
            itemCostView.getChildByPath("Content/Value").getComponent(Label).string = ">99";
            itemCostView.getChildByPath("CostTime/Value").getComponent(Label).string = "--:--:--";
        } else {
            const movePath: TilePos[] = GameMgr.findTargetLeastMovePath(beginPos, this._targetPos, sparePositions, targetStayPostions);
            const trueCostEnergy: number =
                this._interactType == MapInteractType.MainBack
                    ? 0
                    : GameMgr.getMapActionCostEnergy(movePath.length, this._interactBuilding != null ? this._interactBuilding.uniqueId : null);
            if (trueCostEnergy > 99) {
                itemCostView.getChildByPath("Content/Value").getComponent(Label).string = ">99";
                itemCostView.getChildByPath("CostTime/Value").getComponent(Label).string = "--:--:--";
            } else {
                itemCostView.getChildByPath("Content/Value").getComponent(Label).string = trueCostEnergy + "";
                const perStepTime: number = (GameMainHelper.instance.tiledMapTilewidth * 0.5) / player.speed;
                itemCostView.getChildByPath("CostTime/Value").getComponent(Label).string = CommonTools.formatSeconds(
                    perStepTime * movePath.length * (this._isReturn ? 1 : 1)
                );
            }
        }
    }

    public circularListTapItem(index: number): void {
        GameMusicPlayMgr.playTapButtonEffect();
        if (index < 0 || index > this._playerShowData.length - 1) {
            return;
        }
        const player = this._playerShowData[index];
        if (player == undefined) {
            return;
        }
        if (player.actionType != MapPioneerActionType.inCity && player.actionType != MapPioneerActionType.staying) {
            NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, LanMgr.getLanById("203002"));
            return;
        }
        if (this._interactType != MapInteractType.Collect && this._interactType != MapInteractType.MainBack && player.hp <= 0) {
            NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, LanMgr.getLanById("1100204"));
            return;
        }
        let beginPos: Vec2 = player.stayPos;
        let sparePositions: Vec2[] = [];
        let targetStayPostions: Vec2[] = [];
        if (this._interactBuilding != null) {
            sparePositions = this._interactBuilding.stayMapPositions.slice();
            targetStayPostions = this._interactBuilding.stayMapPositions.slice();
            if (this._interactBuilding.type == MapBuildingType.city && sparePositions.length == 7) {
                // center pos cannot use to cal move path
                sparePositions.splice(3, 1);
            }
        } else if (this._interactPioneer != null) {
            if (this._interactPioneer.type == MapPioneerType.player || this._interactPioneer.type == MapPioneerType.npc) {
                targetStayPostions = [this._interactPioneer.stayPos];
            }
        }
        const moveGap = Math.abs(beginPos.x - this._targetPos.x) + Math.abs(beginPos.y - this._targetPos.y);
        if (moveGap >= 200) {
            // donnot use a* to calculate move path
            NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, "Insufficient Energy");
            return;
        }
        const movePath: TilePos[] = GameMgr.findTargetLeastMovePath(beginPos, this._targetPos, sparePositions, targetStayPostions);
        const trueCostEnergy: number =
            this._interactType == MapInteractType.MainBack
                ? 0
                : GameMgr.getMapActionCostEnergy(movePath.length, this._interactBuilding != null ? this._interactBuilding.uniqueId : null);
        if (player.energyMax < trueCostEnergy) {
            NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, "Insufficient Energy");
            return;
        }
        if (player.energy < trueCostEnergy) {
            if (trueCostEnergy < 99) {
                GameMgr.showBuyEnergyTip(player.uniqueId);
            } else {
                //todo show message
                //NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, LanMgr.getLanById(""));
            }
            return;
        }

        let times: number = 0;
        let consumeConfigs: [number, string, number][] = null;
        if (this._interactType == MapInteractType.WmMatch) {
            times = DataMgr.s.userInfo.data.wormholeMatchTimes;
            consumeConfigs = (ConfigConfig.getConfig(ConfigType.WormholeMatchConsume) as WormholeMatchConsumeParam).consumes;
        } else if (this._interactType == MapInteractType.WmTeleport) {
            times = DataMgr.s.userInfo.data.wormholeTeleportTimes;
            consumeConfigs = (ConfigConfig.getConfig(ConfigType.WormholeTeleportConsume) as WormholeTeleportConsumeParam).consumes;
        }
        if (consumeConfigs != null) {
            let consume: [number, string, number] = null;
            for (const element of consumeConfigs) {
                if (element[0] == times + 1) {
                    consume = element;
                    break;
                }
            }
            if (consume == null) {
                consume = consumeConfigs[consumeConfigs.length - 1];
            }
            if (consume != null) {
                let ownedNum: number = DataMgr.s.item.getObj_item_count(consume[1]);
                if (ownedNum < consume[2]) {
                    NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_RESOURCE_TYPE_TIP, "Insufficient Resouces");
                    return;
                }
            }
        }

        UIPanelManger.inst.popPanel(this.node);
        if (this._actionCallback != null) {
            this._actionCallback(true, player.uniqueId, movePath, this._isReturn);
        }
    }
}
