import { view, UITransform, Button, find, EventHandler, NodeEventType, Node } from "cc";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { NotificationName } from "../../../Const/Notification";
import GameMainHelper from "../../../Game/Helper/GameMainHelper";
import RookieStepMgr from "../../../Manger/RookieStepMgr";
import { GsBase } from "./GsBase";
import { DataMgr } from "../../../Data/DataMgr";
import { TileMapHelper } from "../../../Game/TiledMap/TileTool";
import { MapPioneerType } from "../../../Const/PioneerDefine";
import { UIHUDController } from "../../UIHUDController";
import { LanMgr } from "../../../Utils/Global";
import GameMusicPlayMgr from "../../../Manger/GameMusicPlayMgr";


export class Gs1010 extends GsBase{
    private _resMonster:Node;
    private _monsterData;
    gsStart() {
        super.gsStart();
    }

    protected update(dt: number): void {
        let isGameShowOuter = GameMainHelper.instance.isGameShowOuter;
        if(!isGameShowOuter)
        {
            this._guide_step = 1;
            return;
        }
        if(!this._shadowController){
            this.initBinding();
            return;
        }
        if(!this._resMonster){
            let monsterData = this._findResourceMonster();
            if(monsterData){
                this._monsterData = monsterData;
                this._resMonster = this._pioneerController.getPioneerByUniqueId(monsterData.uniqueId);
            }
        }
        if(this._resMonster){
            let actionView = this._tileMapController.actionView;
            if(!actionView.node.active){
                this._guide_step = 2;
                return;
            }
            if(actionView.interactPioneer != this._monsterData){
                actionView.node.active = false;
                //worning
                UIHUDController.showCenterTip(LanMgr.getLanById("1100205"));
                return;
            }else{
                this._guide_step = 3;
            }
        }
    }

    _findResourceMonster(){
        let citySlot = DataMgr.s.mapBuilding.getSelfMainCitySlotId();
        let pioneers = DataMgr.s.pioneer.getAll()
        let resBds = pioneers.filter(pioneer=>{
            if(pioneer.type != MapPioneerType.hred){
                return false;
            }
            if(pioneer.uniqueId.split("|")[0] != citySlot){
                return false;
            }
            if(this._shadowController.tiledMapIsAllBlackShadow(pioneer.stayPos.x,pioneer.stayPos.y)){
                return false;
            }
            return true;
        });
        const mainCity = DataMgr.s.mapBuilding.getSelfMainCityBuilding();
        let cityPos = TileMapHelper.INS.getPos(mainCity.stayMapPositions[0].x,mainCity.stayMapPositions[0].y);
        let minMonster;
        let minLen = 99999;
        resBds.forEach(pioneer=>{
            let buildingPos = TileMapHelper.INS.getPos(pioneer.stayPos.x,pioneer.stayPos.y);
            let len = TileMapHelper.INS.Path_DistPos(cityPos,buildingPos);
            if(len < minLen){
                minLen = len;
                minMonster = pioneer;
            }
        });
        return minMonster;
    }

    
    protected onEnable(): void {
        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_TAP_TASK_PANEL, this._onTapGuideTask, this);
    }

    protected onDisable(): void {
        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_TAP_TASK_PANEL, this._onTapGuideTask, this);
    }
    
    _onTapGuideTask(){
        this.initBinding();
        if(this._guide_step == 1){
            const innerOuterChangeButton = this.mainUI.node.getChildByPath("CommonContent/InnerOutChangeBtnBg");
            RookieStepMgr.instance().maskView.configuration(false, innerOuterChangeButton.worldPosition, innerOuterChangeButton.getComponent(UITransform).contentSize, () => {
                RookieStepMgr.instance().maskView.hide();
                GameMusicPlayMgr.playTapButtonEffect();
                GameMainHelper.instance.changeInnerAndOuterShow();
                this._guide_step = 2;
            });
        }
        if(this._guide_step == 2){
            const view = this._resMonster;
            if(!view){
                return;
            }
            this.fouceMainCity();
            RookieStepMgr.instance().maskView.configuration(true, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                RookieStepMgr.instance().maskView.hide();
                GameMusicPlayMgr.playTapButtonEffect();
                this._tileMapController._clickOnMap(view.worldPosition);
                this._guide_step = 3;
                this.scheduleOnce(()=>{
                    this._onTapGuideTask();
                },0.5);
            });
        }
        if(this._guide_step == 3){
            let actionView = this._tileMapController.actionView;
            if(!actionView){
                return;
            }
            let node = actionView.node.getChildByPath('ActionView/Action');
            let view = node.children[0];
            if(!view){
                return;
            }
            RookieStepMgr.instance().maskView.configuration(true, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                actionView.hide();
                RookieStepMgr.instance().maskView.hide();
                let btn = view.getComponent(Button);
                let event = new Event(NodeEventType.TOUCH_START);
                EventHandler.emitEvents(btn.clickEvents,event);
            });
        }
        
    }


}