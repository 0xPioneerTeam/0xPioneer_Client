import { _decorator, CCBoolean, Component, instantiate, Node, Prefab, Sprite, UITransform, v3, Vec2 } from "cc";
import { DEV, EDITOR } from "cc/env";
import GameMainHelper from "../Helper/GameMainHelper";
import { TILEMAP_SIZE } from "../../Const/ConstDefine";
const { ccclass, property } = _decorator;

@ccclass("MapTag")
export class MapTag extends Component {
    @property(CCBoolean)
    block: boolean = false;

    @property({
        visible() {
            return this.block;
        },
        displayName: "block data",
        type: [Vec2],
    })
    blockData: Vec2[] = [];

    @property({
        visible() {
            return this.block;
        },
        type: Prefab,
    })
    blockNodePb: Prefab;

    @property(CCBoolean)
    _blockDraw: boolean;

    @property({
        visible() {
            return this.block;
        },
        displayName: "show block data",
        type: CCBoolean,
    })
    set blockDraw(v: boolean) {
        this._blockDraw = v;
        if (DEV && EDITOR) {
            let blockNode = this.node.getChildByName("__BLOCKNODE");
            if (v) {
                if (!blockNode) {
                    blockNode = new Node("__BLOCKNODE");
                    blockNode.addComponent(UITransform);
                    this.node.addChild(blockNode);
                }
                if (!this.blockNodePb) {
                    console.warn("map block show need bind: blockNodePb");
                    return;
                }
                //  to update size 30*30
                let tilewidth = 128 * TILEMAP_SIZE + 64; //128*30 + 64
                let tileheight = 96 * TILEMAP_SIZE + 32; //96*30 + 32
                let tileNodeWidth = 128;
                let tileNodeHeight = 128;
                let blockUITrans = blockNode.getComponent(UITransform);
                let nodeTrans = this.node.parent.getComponent(UITransform);
                this.blockData.forEach(async (data, index) => {
                    let node = instantiate(this.blockNodePb);
                    let ui = node.getComponent(UITransform);
                    ui.setContentSize(128 / this.node.scale.x, 128 / this.node.scale.y);
                    var cross = data.y % 2 != 0;
                    var worldx = (data.x + 0.5) * tileNodeWidth - tilewidth / 2;
                    if (cross) worldx += tileNodeWidth * 0.5;
                    var worldy = tileheight / 2 - (data.y * (tileNodeHeight * 0.75) + tileNodeHeight / 2);
                    let vv2 = nodeTrans.convertToWorldSpaceAR(v3(worldx, worldy, 0));
                    let vv = blockUITrans.convertToNodeSpaceAR(vv2);
                    node.setPosition(vv);
                    console.log(`block data x${data.x},y${data.y}  convert x${vv.x},y${vv.y}`);
                    blockNode.addChild(node);
                });
            } else {
                if (blockNode) {
                    blockNode.removeFromParent();
                    blockNode.destroy();
                }
            }
        }
    }

    get blockDraw() {
        return this._blockDraw;
    }

    private _bindingShadowNodes: Node[];

    start() {
        if (!EDITOR) {
            let children = this.node.children;
            let uitrans = this.node.getComponent(UITransform);
            if (!uitrans) {
                this.node.addComponent(UITransform);
            }
            this._bindingShadowNodes = [];
            let shadowNode = GameMainHelper.instance.shadowBuildNode;
            let shadowUITrans = shadowNode.getComponent(UITransform);
            for (let i = children.length - 1; i >= 0; i--) {
                const node = children[i];
                let sp = node.getComponent(Sprite);
                if (sp && sp.spriteFrame && (sp.spriteFrame.name == "Shadow" || sp.spriteFrame.name == "Pond_01_Tex")) {
                    let worldPostion = uitrans.convertToWorldSpaceAR(node.position);
                    node.removeFromParent();
                    node.setPosition(shadowUITrans.convertToNodeSpaceAR(worldPostion));
                    shadowNode.addChild(node);
                    this._bindingShadowNodes.push(node);
                }
            }
        }
    }

    update(deltaTime: number) {}

    protected onDisable(): void {
        if (this._bindingShadowNodes) {
            this._bindingShadowNodes.forEach((node) => {
                node.removeFromParent();
            });
        }
    }

    protected onEnable(): void {
        if (this._bindingShadowNodes) {
            let shadowNode = GameMainHelper.instance.shadowBuildNode;
            this._bindingShadowNodes.forEach((node) => {
                if (node.parent == null) {
                    shadowNode.addChild(node);
                }
            });
        }
    }
}
