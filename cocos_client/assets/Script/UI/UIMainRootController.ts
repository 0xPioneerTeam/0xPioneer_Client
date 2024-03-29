import { CCBoolean, Component, ImageAsset, _decorator } from "cc";
import { ItemMgr, UIPanelMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import ViewController from "../BasicView/ViewController";
import { ECursorStyle, ECursorType } from "../Const/ConstDefine";
import { MouseCursor } from "./MouseCursor";
import NotificationMgr from "../Basic/NotificationMgr";
import ItemData from "../Model/ItemData";
import { NotificationName } from "../Const/Notification";

const { ccclass, property } = _decorator;


@ccclass('UIMainRootController')
export class UIMainRootController extends ViewController {

    @property([ImageAsset])
    cursorImages: ImageAsset[] = [];

    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[ECursorType.Common].nativeUrl);

        UIPanelMgr.setUIRootView(this.node);

        await UIPanelMgr.openPanel(UIName.MainUI);

        if (this.canShowRookieGuide && !UserInfoMgr.isFinishRookie) {
            await UIPanelMgr.openPanel(UIName.RookieGuide);
        }
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        NotificationMgr.addListener(NotificationName.CHANGE_CURSOR, this.cursorChanged, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_CURSOR, this.cursorChanged, this);
    }

    private cursorChanged(type: ECursorType) {
        if (type >= this.cursorImages.length) {
            type = 0;
        }
        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[type].nativeUrl);
    }
}