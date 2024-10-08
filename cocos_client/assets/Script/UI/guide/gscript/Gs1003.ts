import { view, UITransform, Button, find, ProgressBar, EventHandler, NodeEventType, Vec3 } from "cc";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { NotificationName } from "../../../Const/Notification";
import GameMainHelper from "../../../Game/Helper/GameMainHelper";
import RookieStepMgr from "../../../Manger/RookieStepMgr";
import { GsBase } from "./GsBase";
import GameMusicPlayMgr from "../../../Manger/GameMusicPlayMgr";
import { InnerBuildingType } from "../../../Const/BuildingDefine";


export class Gs1003 extends GsBase {
    gsStart() {
        super.gsStart();
    }

    protected update(dt: number): void {
        let isGameShowOuter = GameMainHelper.instance.isGameShowOuter;
        if(isGameShowOuter)
        {
            this._guide_step = 1;
        }else{
            this._guide_step = 2;
            if(!this._innerBuildingController){
                this.initBinding();
                return;
            }
            let ExploreView = this._innerBuildingController.getBuildingByKey(InnerBuildingType.House)
            if(ExploreView){
                //collecting
                if(ExploreView.building && ExploreView.building.upgrading){
                    this._guide_step = -1;
                    return;
                }
            }
        }
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
            const House = this._innerBuildingController.getBuildingByKey(InnerBuildingType.House).node;
            GameMainHelper.instance.changeGameCameraPosition(Vec3.ZERO, true);
            GameMainHelper.instance.changeGameCameraZoom(1, true);
            RookieStepMgr.instance().maskView.configuration(false, House.worldPosition, House.getComponent(UITransform).contentSize, () => {
                RookieStepMgr.instance().maskView.hide();
                let button = House.getChildByName('clickNode').getComponent(Button);
                EventHandler.emitEvents(button.clickEvents);
                this._guide_step = 3;
            });
        }
    }

}