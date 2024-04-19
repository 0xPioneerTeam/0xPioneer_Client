import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node } from "cc";
import { NPCNameLangType } from "../../Const/ConstDefine";
import { LanMgr, TaskMgr, UserInfoMgr } from "../../Utils/Global";
import ViewController from "../../BasicView/ViewController";
import { UIName } from "../../Const/ConstUIDefine";
import NotificationMgr from "../../Basic/NotificationMgr";
import { CountType } from "../../Const/Count";
import { NotificationName } from "../../Const/Notification";
import { ItemGettedUI } from "../ItemGettedUI";
import { TalkConfigData } from "../../Const/Talk";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { DataMgr } from "../../Data/DataMgr";
const { ccclass, property } = _decorator;

@ccclass("DialogueUI")
export class DialogueUI extends ViewController {
    public dialogShow(talk: TalkConfigData, talkOverCallback: () => void = null) {
        this._talk = talk;
        this._talkOverCallback = talkOverCallback;
        this._dialogStep = 0;
        this._refreshUI();
    }

    private _talk: TalkConfigData = null;
    private _talkOverCallback: () => void;
    private _dialogStep: number = 0;
    private _roleNames: string[] = [
        "artisan",
        "doomsdayGangBigTeam",
        "doomsdayGangSpy",
        "doomsdayGangTeam",
        "hunter",
        "prophetess",
        "rebels",
        "secretGuard",
    ];
    private _roleViewNameMap: Map<NPCNameLangType, string> = new Map();
    protected viewDidLoad(): void {
        super.viewDidLoad();

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this._refreshUI, this);

        this._roleViewNameMap.set(NPCNameLangType.Artisan, "artisan");
        this._roleViewNameMap.set(NPCNameLangType.DoomsdayGangBigTeam, "doomsdayGangBigTeam");
        this._roleViewNameMap.set(NPCNameLangType.DoomsdayGangSpy, "doomsdayGangSpy");
        this._roleViewNameMap.set(NPCNameLangType.Hunter, "hunter");
        this._roleViewNameMap.set(NPCNameLangType.Prophetess, "prophetess");
        this._roleViewNameMap.set(NPCNameLangType.SecretGuard, "secretGuard");
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this._refreshUI, this);
    }

    private _refreshUI() {
        if (this._talk == null || this._dialogStep > this._talk.messsages.length - 1) {
            return;
        }

        // useLanMgr
        // this.node.getChildByPath("Dialog/NextButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");

        const dialogView = this.node.getChildByName("Dialog");
        const selectView = this.node.getChildByName("SelectView");

        dialogView.getChildByName("NextButton").active = true;
        dialogView.getChildByName("dialog_bg").getComponent(Button).interactable = true;

        const currentMesssage = this._talk.messsages[this._dialogStep];
        if (currentMesssage.type == null || currentMesssage.type == "0") {
            dialogView.active = true;
            selectView.active = false;
            dialogView.getChildByName("name_bg").active = false;
            dialogView.getChildByName("player_name").active = false;
            if (this._roleViewNameMap.has(currentMesssage.name)) {
                dialogView.getChildByName("name_bg").active = true;
                dialogView.getChildByPath("name_bg/Label").getComponent(Label).string = LanMgr.getLanById(currentMesssage.name);
            } else if (currentMesssage.name == NPCNameLangType.DefaultPlayer) {
                dialogView.getChildByName("player_name").active = true;
                dialogView.getChildByPath("player_name/Label").getComponent(Label).string = DataMgr.s.userInfo.data.name;
            }

            dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.getLanById(currentMesssage.text);

            for (const roleName of this._roleNames) {
                if (this._roleViewNameMap) dialogView.getChildByName(roleName).active = roleName == this._roleViewNameMap.get(currentMesssage.name);
            }
        } else if (currentMesssage.type == "1") {
            if (currentMesssage.text != undefined) {
                dialogView.active = true;
                dialogView.getChildByName("name_bg").active = false;
                dialogView.getChildByName("player_name").active = false;

                dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.getLanById(currentMesssage.text);

                for (const roleName of this._roleNames) {
                    dialogView.getChildByName(roleName).active = false;
                }
            } else {
                dialogView.active = false;
            }
            selectView.active = true;
            dialogView.getChildByName("NextButton").active = false;
            dialogView.getChildByName("dialog_bg").getComponent(Button).interactable = false;

            for (let i = 0; i < 3; i++) {
                const button = selectView.getChildByName("Button_" + i);
                if (i < currentMesssage.select.length) {
                    button.active = true;

                    button.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById(currentMesssage.select[i]);

                    button.getComponent(Button).clickEvents[0].customEventData = i.toString();
                } else {
                    button.active = false;
                }
            }
        }
    }

    private _talkOver() {
        //talk over
        const talkId = this._talk.id;
        if (UserInfoMgr.afterTalkItemGetData.has(talkId)) {
            setTimeout(async () => {
                if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI) || UIPanelManger.inst.panelIsShow(UIName.SecretGuardGettedUI)) {
                    UserInfoMgr.afterCivilizationClosedShowItemDatas.push(...UserInfoMgr.afterTalkItemGetData.get(talkId));
                } else {
                    const result = await UIPanelManger.inst.pushPanel(UIName.ItemGettedUI);
                    if (result.success) {
                        result.node.getComponent(ItemGettedUI).showItem(UserInfoMgr.afterTalkItemGetData.get(talkId));
                    }
                }
                UserInfoMgr.afterTalkItemGetData.delete(talkId);
            });
        }
        // talk used
        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_USE_NEW_TALK, this._talk.id);
        if (this._talkOverCallback != null) {
            this._talkOverCallback();
        }
    }

    //------------------------------------------------ action
    private onTapNext() {
        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            UIPanelManger.inst.popPanel();
            this._talkOver();
        } else {
            this._refreshUI();
        }
    }

    private onTapAction(event: Event, customEventData: string) {
        if (this._talk == null) {
            return;
        }
        TaskMgr.talkSelected(this._talk.id, parseInt(customEventData));
        DataMgr.s.count.addObj_selectDialog({
            selectText: customEventData,
        });

        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            UIPanelManger.inst.popPanel();
            this._talkOver();
        } else {
            this._refreshUI();
        }
    }
}
