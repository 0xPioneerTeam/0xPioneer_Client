import { _decorator, Component, Node, ProgressBar, Label, SceneAsset, director, Button, EventHandler, EditBox, resources, Prefab, AssetManager } from 'cc';
import { Web3Helper } from '../../Game/MetaMask/EthHelper';
import { md5 } from '../../Utils/Md5';
import { ConfigMgr, LocalDataLoader, ResourcesMgr, UserInfoMgr } from '../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('FakeLoading')
export class FakeLoading extends Component {
    private _loaded: boolean = false;

    private _loadingView: Node = null;
    protected onLoad(): void {
        this._loadingView = this.node.getChildByName("LoadingUI");
    }
    async start() {
        this._loadingView.active = true;
        if (LocalDataLoader.loadStatus == 0) {
            await LocalDataLoader.loadLocalDatas();
        }
        // load prefab
        let loadRate: number = 0;
        
        resources.loadDir("decoration", Prefab, (finished: number, total: number, item: AssetManager.RequestItem) => {
           const currentRate = finished / total;
           if (currentRate > loadRate) {
               loadRate = currentRate;
               this._loadingView.getChildByName("ProgressBar").getComponent(ProgressBar).progress = loadRate;
           }
        }, (err: Error, data: Prefab[]) => {
            if (err != null) {
                return;
            }
            resources.preloadDir("preload/icon", ()=> {
                ResourcesMgr.Init((err: Error, file: any)=> {
                    console.log("exce gomain")
                    director.loadScene("main");
                });
            });
            
        });

        {
            //Find and Reg recall method.
            let b1 = this.node.getChildByName("btn-recall").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventRecall";
            b1.clickEvents.push(evthandler);
        }
        // {
        //     //Find and Reg next method.
        //     let b1 = this.node.getChildByName("btn-next").getComponent(Button);
        //     let evthandler = new EventHandler();
        //     evthandler._componentName = "CompLogin";
        //     evthandler.target = this.node;
        //     evthandler.handler = "OnEventNext";
        //     b1.clickEvents.push(evthandler);
        // }
        // {
        //     //Find and Reg next method.
        //     let b1 = this.node.getChildByName("btn-next-guest").getComponent(Button);
        //     let evthandler = new EventHandler();
        //     evthandler._componentName = "CompLogin";
        //     evthandler.target = this.node;
        //     evthandler.handler = "OnEventNext";
        //     evthandler.customEventData = "guest";
        //     b1.clickEvents.push(evthandler);
        // }

        let l = this.node.getChildByName("Label").getComponent(Label);
        l.string = "prepare metamask ing";

        // let b = await Web3Helper.LinkWallet();
        // l.string = "prepare metamask = " + b;
        // if (b) {
        //     l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        // }
    }

    async OnEventRecall() {
        let l = this.node.getChildByName("Label").getComponent(Label);
        l.string = "prepare metamask ing";
        let b = await Web3Helper.LinkWallet();
        l.string = "prepare metamask = " + b;
        if (b) {
            l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        }
    }
    OnEventNext(event: Event, customEventData: string) {
        if (customEventData == "guest") {
            UserInfoMgr.playerName = "guest";
        }
        else {
            if (Web3Helper.getPubAddr() == undefined || Web3Helper.getPubAddr() == "") {
                return;
            }
            UserInfoMgr.playerName = Web3Helper.getPubAddr().substring(0, 10);
        }
        if (this._loaded == false) {
            return;
        }
        director.loadScene("main");
    }
    update(deltaTime: number) {

    }

    private onTapLogin() {
        const codeEditBox = this.node.getChildByName("CodeInput").getComponent(EditBox);
        if (codeEditBox.string.length <= 0) {
            return;
        }
        let canEnter: boolean = false;
        let config = ConfigMgr.getConfigById("10002");
        if (config.length <= 0 || config[0].para == null || config[0].para.length <= 0) {
            canEnter = true;
        } else {
            for (const temple of config[0].para) {
                if (temple.toUpperCase() === md5(codeEditBox.string).toUpperCase()) {
                    canEnter = true;
                    break;
                }
            }
        }
        if (canEnter) {
            director.loadScene("main");
        }
    }
}


