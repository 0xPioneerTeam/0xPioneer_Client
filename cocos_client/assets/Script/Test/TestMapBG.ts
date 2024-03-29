import { _decorator, Component, Node, Vec2, Vec3, Camera, UITransform, Input, input, Prefab, v2, v3 } from 'cc';
import * as cc from "cc";
import { TilePos, TileMapHelper, TileHexDirection } from '../Game/TiledMap/TileTool';
import { EventName } from '../Const/ConstDefine';
import { LocalDataLoader } from '../Utils/Global';
import NotificationMgr from '../Basic/NotificationMgr';
import ConfigConfig from '../Config/ConfigConfig';
import { ConfigType } from '../Const/Config';
const { ccclass, property } = _decorator;

@ccclass('TestMapBG')
export class TestMapBG extends Component {

    public addDynamicBlock(mapPos: Vec2) {
        this._tiledhelper.Path_AddDynamicBlock({
            TileX: mapPos.x,
            TileY: mapPos.y,
            canMoveTo: false
        });
    }
    public removeDynamicBlock(mapPos: Vec2) {
        this._tiledhelper.Path_RemoveDynamicBlock({
            TileX: mapPos.x,
            TileY: mapPos.y,
            canMoveTo: false
        });
    }
    public getAround(mapPos: Vec2): TilePos[] {
        mapPos = v2(Math.min(this._tiledhelper.width - 1, mapPos.x), Math.min(this._tiledhelper.height - 1, mapPos.y));
        return this._tiledhelper.Path_GetAround(this._tiledhelper.getPos(mapPos.x, mapPos.y));
    }
    public getAroundByDirection(mapPos: Vec2, direction: TileHexDirection): TilePos {
        mapPos = v2(Math.min(this._tiledhelper.width - 1, mapPos.x), Math.min(this._tiledhelper.height - 1, mapPos.y));
        return this._tiledhelper.Path_GetAroundByDirection(this._tiledhelper.getPos(mapPos.x, mapPos.y), direction);
    }
    public getPosWorld(x: number, y: number): Vec3 {
        return this._tiledhelper.getPosWorld(x, y);
    }
    public getTiledPos(worldPos: Vec3): TilePos {
        return this._tiledhelper.getPosByWorldPos(worldPos);
    }

    public getTiledMovePath(fromWorldPos: Vec3, toWorldPos: Vec3): TilePos[] {
        return this._tiledhelper.Path_FromTo(this._tiledhelper.getPosByWorldPos(fromWorldPos), this._tiledhelper.getPosByWorldPos(toWorldPos));
    }
    public getTiledMovePathByTiledPos(fromTilePos: Vec2, toTilePos: Vec2): TilePos[] {
        fromTilePos = v2(Math.min(this._tiledhelper.width - 1, fromTilePos.x), Math.min(this._tiledhelper.height - 1, fromTilePos.y));
        toTilePos = v2(Math.min(this._tiledhelper.width - 1, toTilePos.x), Math.min(this._tiledhelper.height - 1, toTilePos.y));
        return this._tiledhelper.Path_FromTo(this._tiledhelper.getPos(fromTilePos.x, fromTilePos.y), this._tiledhelper.getPos(toTilePos.x, toTilePos.y));
    }
    public isAllBlackShadow(x: number, y: number): boolean {
        return this._tiledhelper.Shadow_IsAllBlack(x, y);
    }
    public isBlock(mapPos: Vec2): boolean {
        return this._tiledhelper.Path_IsBlock(mapPos.x, mapPos.y);
    }

    @property(Prefab)
    tiledmap: Prefab;

    @property(Camera)
    mainCamera: Camera;

    _mouseDown: boolean = false;


    protected onLoad(): void {
        
    }

    async start() {

        
        
        this._mouseDown = false;
        let thisptr = this;

        let halfCameraWidth = this.mainCamera.camera.width / 2;
        let halfCameraHeight = this.mainCamera.camera.height / 2;

        let uiTrans = this.node.getComponent(UITransform);
        let halfMapWidth = uiTrans.contentSize.width / 2;
        let halfMapHeight = uiTrans.contentSize.height / 2;

        let moveDistX = halfMapWidth - halfCameraWidth;
        let moveDistY = halfMapHeight - halfCameraHeight;

        let downx = 0;
        let downy = 0;
        let mouseActionBeginTimeStamp: number = 0;
        this.node.on(Node.EventType.MOUSE_DOWN, (event: cc.EventMouse) => {
            thisptr._mouseDown = true;

            downx = event.getLocation().x;
            downy = event.getLocation().y;

            mouseActionBeginTimeStamp = new Date().getTime();
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event: cc.EventMouse) => {
            thisptr._mouseDown = false;
            var pos = event.getLocation();

        }, this);

        this.node.on(Node.EventType.MOUSE_LEAVE, (event: cc.EventMouse) => {
            thisptr._mouseDown = false;
        }, this);

        this.node.on(Node.EventType.MOUSE_WHEEL, (event: cc.EventMouse) => {
            let sc = thisptr.node.parent.scale.x;

            const useConf = ConfigConfig.getMapScaleConfig();
            if (useConf == null) return;

            if (event.getScrollY() > 0) {
                sc += 0.05;
            }
            else {
                sc -= 0.05;
            }
            if (sc > useConf.para[1]) {
                sc = useConf.para[1];
            }
            else if (sc < useConf.para[0]) {
                sc = useConf.para[0];
            }
            thisptr.node.parent.setScale(v3(sc, sc, sc));
            NotificationMgr.triggerEvent(EventName.MAP_SCALED, sc);
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: cc.EventMouse) => {
            if (thisptr._mouseDown) {

                let pos = this.mainCamera.node.position.add(new Vec3(-event.movementX, event.movementY, 0));
                if (pos.x < -moveDistX) {
                    pos.x = -moveDistX;
                }
                else if (pos.x > moveDistX) {
                    pos.x = moveDistX;
                }
                if (pos.y < -moveDistY) {
                    pos.y = -moveDistY;
                }
                else if (pos.y > moveDistY) {
                    pos.y = moveDistY;
                }
                this.mainCamera.node.setPosition(pos);
            }
            else {

            }
        }, this)

        this.InitTileMap();

        await LocalDataLoader.loadLocalDatas();
        NotificationMgr.triggerEvent(EventName.LOADING_FINISH);
    }
    
    private _tiledhelper: TileMapHelper = null;
    InitTileMap(): void {
        if (this.tiledmap == null)
            return;
        var node = cc.instantiate(this.tiledmap);
        this.node.addChild(node);

        const buildingView = this.node.getChildByName("BuildingContent");
        buildingView.removeFromParent();
        node.addChild(buildingView);

        const pioneerView = this.node.getChildByName("PioneerContent");
        pioneerView.removeFromParent();
        node.addChild(pioneerView);

        // force change shadow siblingIndex
        node.getChildByName("shadow").setSiblingIndex(99);
        node.getChildByName("shadow").active = false;

        var _tilemap = node.getComponent(cc.TiledMap);
        _tilemap.enableCulling = false;
        let c = new cc.Color(255, 255, 255, 0);
        _tilemap.getLayer("shadow").color = c;
        _tilemap.getLayer("block").color = new cc.Color(0, 0, 0, 0);

        //init tiledmap by a helper class
        this._tiledhelper = new TileMapHelper(_tilemap);
        this._tiledhelper.Shadow_Init(0, 75, null);
        this._tiledhelper._shadowhalftag = 73;
        this._tiledhelper._shadowhalf2tag = 74;

        //place building on blayer, will be coverd by shadow.
    }
   
}


