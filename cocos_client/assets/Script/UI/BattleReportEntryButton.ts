import { _decorator, Button, Component, Label, rect } from "cc";
import { UIName } from "../Const/ConstUIDefine";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import UIPanelManger from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import GameMusicPlayMgr from "../Manger/GameMusicPlayMgr";
import { NetworkMgr } from "../Net/NetworkMgr";
import { s2c_user, share } from "../Net/msg/WebsocketMsg";
import { RedPointView } from "./View/RedPointView";

const { ccclass } = _decorator;

@ccclass("BattleReportEntryButton")
export class BattleReportEntryButton extends Component {

    private _redPointValue: number = 0;

    private _redPointView: RedPointView = null;

    protected start(): void {

        this._redPointView = this.node.getChildByPath("RedPointView").getComponent(RedPointView);

        this.node.on(Button.EventType.CLICK, this.onClickButton, this);

        NetworkMgr.websocket.on("get_new_battle_report_red_point_res", this.get_new_battle_report_red_point_res);
        NetworkMgr.websocket.on("receive_new_battle_report_reward_res", this.receive_new_battle_report_reward_res);

        NetworkMgr.websocketMsg.get_new_battle_report_red_point({});
    }

    protected onDestroy(): void {
        this.node.off(Button.EventType.CLICK, this.onClickButton, this);

        NetworkMgr.websocket.off("get_new_battle_report_red_point_res", this.get_new_battle_report_red_point_res);
        NetworkMgr.websocket.off("receive_new_battle_report_reward_res", this.receive_new_battle_report_reward_res);
    }

    private _refreshRedPoint() {
        this._redPointView.refreshUI(this._redPointValue, true);
        this.node.getChildByPath("icon_WarReport_1").active = this._redPointValue <= 0;
        this.node.getChildByPath("icon_WarReport_2").active = this._redPointValue > 0;
    }

    //------------------------------- action
    private async onClickButton() {
        GameMusicPlayMgr.playTapButtonEffect();
        await UIPanelManger.inst.pushPanel(UIName.BattleReportUI);
    }

    //------------------------------- notify
    private get_new_battle_report_red_point_res = (e: any) => {
        const p: s2c_user.Iget_new_battle_report_red_point_res = e.data;
        if (p.res !== 1) {
            return;
        }
        this._redPointValue = p.num;
        this._refreshRedPoint();
    };

    private receive_new_battle_report_reward_res = (e: any) => {
        const p: s2c_user.Ireceive_new_battle_report_reward_res = e.data;
        if (p.res !== 1) {
            return;
        }
        NetworkMgr.websocketMsg.get_new_battle_report_red_point({});
    }
}
