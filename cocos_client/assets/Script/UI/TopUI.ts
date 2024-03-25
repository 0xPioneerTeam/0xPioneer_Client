import { Component, Label, ProgressBar, Node, Sprite, _decorator, Tween, v3, warn, EventHandler, Button, randomRangeInt, UIOpacity, instantiate, tween } from 'cc';
import { EventName, ResourceCorrespondingItem } from '../Const/ConstDefine';
import { ItemMgr, LvlupMgr, NotificationMgr, UIPanelMgr, UserInfoMgr } from '../Utils/Global';
import { FinishedEvent, UserInfoEvent } from '../Const/Manager/UserInfoMgrDefine';
import { ItemMgrEvent } from '../Const/Manager/ItemMgrDefine';
import { UIName } from '../Const/ConstUIDefine';
import { CivilizationLevelUpUI } from './CivilizationLevelUpUI';
const { ccclass, property } = _decorator;


@ccclass('TopUI')
export default class TopUI extends Component implements UserInfoEvent, ItemMgrEvent {


    @property(Label)
    txtPlayerName: Label = null;

    @property(Label)
    txtPlayerLV: Label = null;

    @property(Label)
    txtLvProgress: Label = null;

    @property(Label)
    txtMoney: Label = null;

    @property(Label)
    txtEnergy: Label = null;

    @property(ProgressBar)
    lvProgress: ProgressBar = null;

    @property(Sprite)
    sprPlayerHead: Sprite = null;

    private _started: boolean = false;
    private _dataLoaded: boolean = false;

    private _expAnimLabel: Label = null;
    protected onLoad(): void {

        this._expAnimLabel = this.node.getChildByPath("progressLv/AnimLabel").getComponent(Label);
        this._expAnimLabel.node.active = false;

        UserInfoMgr.addObserver(this);
        ItemMgr.addObserver(this);


        NotificationMgr.addListener(EventName.LOADING_FINISH, this.loadOver, this);
    }

    start() {
        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        UserInfoMgr.removeObserver(this);
        ItemMgr.removeObserver(this);
    }

    private loadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this.refreshTopUI();
        }
    }

    refreshTopUI() {
        const info = UserInfoMgr;
        this.txtPlayerName.string = info.playerName;
        this.txtPlayerLV.string = "C.LV" + info.level;
        this.txtLvProgress.string = `${info.exp}/${1000}`;
        this.txtMoney.string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Gold).toString();
        this.txtEnergy.string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Energy).toString();

        const lvlupConfig = LvlupMgr.getConfigByLvl(info.level);
        const maxExp = lvlupConfig[0].exp;
        this.lvProgress.progress = Math.min(1, info.exp / maxExp);
        this.node.getChildByPath("progressLv/txtLvProgress").getComponent(Label).string = info.exp + "/" + maxExp;

        const resourceView = this.node.getChildByName("Resource");
        resourceView.getChildByPath("Food/Label").getComponent(Label).string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Food).toString();
        resourceView.getChildByPath("Wood/Label").getComponent(Label).string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood).toString();
        resourceView.getChildByPath("Stone/Label").getComponent(Label).string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone).toString();
        resourceView.getChildByPath("Troops/Label").getComponent(Label).string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop).toString();
    }

    private _playExpGettedAnim(getExpValue: number, playOver: () => void = null) {
        if (getExpValue <= 0) {
            return;
        }
        const animNode: Node = instantiate(this._expAnimLabel.node);
        animNode.setParent(this._expAnimLabel.node.parent);
        animNode.active = true;
        animNode.getComponent(Label).string = "+" + getExpValue;
        animNode.position = v3(
            animNode.position.x,
            animNode.position.y - 30,
            animNode.position.z
        );
        tween(animNode)
            .to(0.4, { position: v3(animNode.position.x, animNode.position.y + 30, animNode.position.z) })
            .call(() => {
                animNode.destroy();
                if (playOver != null) {
                    playOver();
                }
            })
            .start();
    }

    //------------------------------------------------ action
    private async onTapPlayerInfo() {
        await UIPanelMgr.openPanel(UIName.PlayerInfoUI);
    }
    //-----------------------------------------------
    // userinfoevent
    playerNameChanged(value: string): void {
        this.refreshTopUI();
    }
    playerExpChanged(value: number): void {
        this._playExpGettedAnim(value, () => {
            this.refreshTopUI();
        });
    }
    async playerLvlupChanged(value: number): Promise<void> {
        const levelConfig = LvlupMgr.getConfigByLvl(value);
        if (levelConfig.length > 0) {
            const view = await UIPanelMgr.openPanel(UIName.CivilizationLevelUpUI);
            if (view != null) {
                view.getComponent(CivilizationLevelUpUI).refreshUI(levelConfig[0]);
            }
        }
    }

    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string, delayTime: number): void {

    }
    finishEvent(event: FinishedEvent): void {

    }
    getProp(propId: string, num: number): void {

    }
    gameTaskOver(): void {

    }
    taskProgressChanged(taskId: string): void {

    }
    taskFailed(taskId: string): void {

    }
    generateTroopTimeCountChanged(leftTime: number): void {

    }

    //-----------------------------------------------
    // ItemMgrEvent
    itemChanged(): void {
        this.refreshTopUI();
    }
}