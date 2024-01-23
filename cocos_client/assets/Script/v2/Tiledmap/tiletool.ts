import * as cc from 'cc';


export enum TileMapType {
    /**
     * @en Orthogonal orientation.
     * @property ORTHO
     * @type {Number}
     * @static
     */
    ORTHO = 0,
    /**
     * @en Hexagonal orientation.
     * @property HEX
     * @type {Number}
     * @static
     */
    HEX = 1,
    /**
     * Isometric orientation.
     * @property ISO
     * @type {Number}
     * @static
     */
    ISO = 2
}
export class TilePos {

    x: number;
    y: number;
    calc_x: number;
    calc_y: number;
    calc_z: number;

    worldx: number;
    worldy: number;
    toInfo(): string {
        return this.worldx + "," + this.worldy + "\n"
            + this.calc_x + "," + this.calc_y + "," + this.calc_z;
    }
    toInfoSingleLine(): string {
        return this.worldx + "," + this.worldy + " "
            + this.calc_x + "," + this.calc_y + "," + this.calc_z;
    }
    g: number;
    h: number;
}
export class TileMapHelper {
    constructor(tilemap: cc.TiledMap) {
        this._tilemap = tilemap;
        this.width = tilemap.getMapSize().width;
        this.height = tilemap.getMapSize().height;
        this.tilewidth = tilemap.getTileSize().width;
        this.tileheight = tilemap.getTileSize().height;
        this.type = tilemap.getMapOrientation() as number as TileMapType;
        if (this.type == TileMapType.ORTHO) {
            this.pixelwidth = this.tilewidth * this.width;
            this.pixelwidth = this.tileheight * this.height;
        }
        else if (this.type == TileMapType.HEX) {
            this.pixelwidth = this.tilewidth * this.width + this.tilewidth * 0.5;
            this.pixelheight = this.tileheight * this.height * 0.75 + this.tileheight * 0.5;
        }
        this.InitPos();
    }

    private _tilemap: cc.TiledMap
    private _pos: TilePos[];
    private _calcpos2pos: { [id: string]: TilePos } = {}
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    pixelwidth: number;
    pixelheight: number;
    type: TileMapType;

    getPos(x: number, y: number): TilePos {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return null;
        return this._pos[y * this.width + x];
    }
    getPosWorld(x: number, y: number): cc.Vec3 {
        let outv = new cc.Vec3();

        let pos = this.getPos(x, y)
        let iv = new cc.Vec3(pos.worldx - this.pixelwidth * 0.5, this.pixelheight * 0.5 - pos.worldy, 0);
        // outv.x = iv.x;
        // outv.y = iv.y;
        // outv.x *= 0.25;
        // outv.y *= 0.25;
        // outv.x += this.pixelwidth*0.5
        // outv.z = 0;
        cc.Vec3.transformMat4(outv, iv, this._tilemap.node.worldMatrix)
        return outv;
    }
    getPosByCalcPos(x: number, y: number, z: number): TilePos {
        var index = this.getCalcPosKey(x, y, z)
        //console.log("index=" + x + "," + y + "," + z + "=>" + index);
        return this._calcpos2pos[index];
    }
    getCalcPosKey(x: number, y: number, z: number): string {
        return (x | 0).toString() + "_" + (y | 0).toString() + "_" + (z | 0).toString();
    }
    getPosKey(x: number, y: number): number {
        return (y * this.width + x) | 0;
    }
    getPosByWorldPos(worldpos: cc.Vec3): TilePos {
        let invmat = this._tilemap.node.worldMatrix.clone().invert();
        let outv = new cc.Vec3();
        cc.Vec3.transformMat4(outv, worldpos, invmat);

        let wxfornode = outv.x + this.pixelwidth * 0.5;
        let wyfornode = this.pixelheight * 0.5 - outv.y;
        //console.log("wx=" + wxfornode + "," + wyfornode);
        if (this.type == TileMapType.ORTHO) {
            //srcx = x*this.tilewidth ~ (x+1)*this.tilewidth
            //srcy =y ~y+1
            let x = (wxfornode / this.tilewidth) | 0
            let y = (wyfornode / this.tileheight) | 0
            return this.getPos(wxfornode, wyfornode);
        }
        else if (this.type == TileMapType.HEX) {
            //srcx = x ~ (x+1)
            //srcx2 = x+0.5 ~ (x+1.5)
            let x1 = (wxfornode / this.tilewidth) | 0;
            let x2 = (wxfornode / this.tilewidth + 0.5) | 0;

            //srcy =  y*0.75 -0.5   -0.5 y*0.75

            let y = ((wyfornode) / (this.tileheight * 0.75) + 1) | 0;

            //console.log("sx=" + x1 + "-" + x2 + "," + y);
            let poss: TilePos[] = []
            var pos1 = this.getPos(x1, y - 1);
            var pos2 = this.getPos(x1, y);
            var pos3 = this.getPos(x1, y + 1);
            var pos4 = this.getPos(x2, y - 1);
            var pos5 = this.getPos(x2, y);
            var pos6 = this.getPos(x2, y + 1);
            if (pos1 != null) poss.push(pos1);
            if (pos2 != null) poss.push(pos2);
            if (pos3 != null) poss.push(pos3);
            if (pos4 != null) poss.push(pos4);
            if (pos5 != null) poss.push(pos5);
            if (pos6 != null) poss.push(pos6);
            var dist = 10000;
            var outpos: TilePos = null;
            var wnpos = new cc.Vec3(wxfornode, wyfornode, 0);
            for (var i = 0; i < poss.length; i++) {
                var p = poss[i];
                var d = cc.Vec3.distance(wnpos, new cc.Vec3(p.worldx, p.worldy, 0));
                if (d < dist) {
                    dist = d;
                    outpos = p;
                }
            }
            return outpos;
        }

    }
    private InitPos() {
        this._pos = [];//TilePos[this.width * this.height];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let p = new TilePos()
                p.x = x;
                p.y = y;
                if (this.type == 0) {
                    p.calc_x = x;
                    p.calc_y = y;
                    p.calc_z = 0;
                    p.worldx = (x + 0.5) * this.tilewidth;
                    p.worldy = (y + 0.5) * this.tileheight;

                }
                else if (this.type == 1)//hex
                {
                    var cross = y % 2 == 1;
                    p.worldx = (x + 0.5) * this.tilewidth;
                    if (cross)
                        p.worldx += this.tilewidth * 0.5;
                    p.worldy = (y - 0.5) * (this.tileheight * 0.75);//- this.tileheight * 0.5 * 0.75;

                    p.calc_x = x - ((y / 2) | 0);
                    p.calc_y = y;
                    p.calc_z = 0 - p.calc_x - p.calc_y;
                }
                this._pos[y * this.width + x] = p;
                this._calcpos2pos[this.getCalcPosKey(p.calc_x, p.calc_y, p.calc_z)] = p;
            }
        }
    }

    _shadowtiles: cc.TiledTile[];
    _shadowtag: number;
    _shadowcleantag: number;
    Shadow_Init(cleantag: number, shadowtag: number, layername: string = "shadow"): void {
        this._shadowcleantag = cleantag;
        this._shadowtag = shadowtag;
        var layer = this._tilemap.getLayer(layername);
        layer.node.active = true;
        this._shadowtiles = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var _node = new cc.Node();


                let t = _node.addComponent(cc.TiledTile);

                t.x = x;
                t.y = y;
                t.grid = this._shadowtag;
                _node.parent = layer.node;

                this._shadowtiles[y * this.width + x] = t;

            }
        }
    }
    Shadow_Earse(pos: TilePos, extlen: number = 1): void {
        //console.log("pos=" + pos.x + "," + pos.y + ":" + pos.worldx + "," + pos.worldy);
        //for (var z = pos.calc_z - extlen; z <= pos.calc_z + extlen; z++) {
        let vx = 10000;
        let vy = 10000;
        for (var y = pos.calc_y - extlen; y <= pos.calc_y + extlen; y++) {
            for (var x = pos.calc_x - extlen; x <= pos.calc_x + extlen; x++) {
                var z = 0 - x - y;
                if (z < pos.calc_z - extlen || z > pos.calc_z + extlen)
                    continue;
                var gpos = this.getPosByCalcPos(x, y, z);
                //console.log("calcpos=" + x + "," + y + "," + z + "->" + gpos.x + "," + gpos.y);
                if (gpos != null) {
                    if (vx > gpos.x)
                        vx = gpos.x;
                    if (vy > gpos.y)
                        vy = gpos.y;
                    var s = this._shadowtiles[gpos.y * this.width + gpos.x];
                    //console.log("find node-" + s.x + "," + s.y + " wpos=" + gpos.worldx + "," + gpos.worldy);
                    s.grid = this._shadowcleantag;
                }
            }
        }
        //}
        this._tilemap.getLayer("shadow").updateViewPort(vx, vy, extlen * 2 + 1, extlen * 2 + 1);
    }

    Shadow_Reset() {
        for (var i = 0; i < this._shadowtiles.length; i++) {
            this._shadowtiles[i].grid = this._shadowtag;
        }
        this._tilemap.getLayer("shadow").updateViewPort(0, 0, this.width, this.height);
    }

    _blocked: boolean[] = []
    Path_InitBlock(emptytag: number = 0, layername: string = "block") {
        let arr = this._tilemap.getLayer(layername).tiles

        for (var y = 0; y < this.height; y++) {

            for (var x = 0; x < this.width; x++) {
                var block = arr[y * this.height + x] != emptytag;
                if (block)
                    this._blocked[y * this.height + x] = true;
                else {
                    this._blocked[y * this.height + x] = false;
                }
            }
        }
    }
    Path_GetAround(pos: TilePos): TilePos[] {
        let around: TilePos[] = [];
        var p0 = this.getPosByCalcPos(pos.calc_x - 1, pos.calc_y, pos.calc_z + 1);
        if (p0 != null) around.push(p0);
        var p1 = this.getPosByCalcPos(pos.calc_x + 1, pos.calc_y, pos.calc_z - 1);
        if (p1 != null) around.push(p1);
        var p2 = this.getPosByCalcPos(pos.calc_x + 1, pos.calc_y - 1, pos.calc_z);
        if (p2 != null) around.push(p2);
        var p3 = this.getPosByCalcPos(pos.calc_x - 1, pos.calc_y + 1, pos.calc_z);
        if (p3 != null) around.push(p3);
        var p4 = this.getPosByCalcPos(pos.calc_x, pos.calc_y + 1, pos.calc_z - 1);
        if (p4 != null) around.push(p4);
        var p5 = this.getPosByCalcPos(pos.calc_x, pos.calc_y - 1, pos.calc_z + 1);
        if (p5 != null) around.push(p5);
        return around;
    }
    Path_DistPos(a: TilePos, b: TilePos): number {
        var dx = (a.calc_x - b.calc_x);
        if (dx < 0) dx *= -1;
        var dy = (a.calc_y - b.calc_y);
        if (dy < 0) dy *= -1;
        var dz = (a.calc_z - b.calc_z);
        if (dz < 0) dz *= -1;
        //max
        return (dx > dy) ? (dx > dz ? dx : dz) : (dy > dz ? dy : dz);
    }
    Path_Equal(a: TilePos, b: TilePos): boolean {
        return a.calc_x == b.calc_x && a.calc_y == b.calc_y;
    }
    Path_Contains(list: TilePos[], pos: TilePos): boolean {
        for (var i = 0; i < list.length; i++) {
            if (this.Path_Equal(list[i], pos))
                return true;
        }
        return false;
    }
    Path_FromTo(from: TilePos, to: TilePos, limitstep = 100): TilePos[] {

        var openPathTiles: TilePos[] = [];
        var closedPathTiles: TilePos[] = [];

        var currentTile = from;

        currentTile.g = 0;
        currentTile.h = this.Path_DistPos(from, to);

        // push first point to opentable
        openPathTiles.push(currentTile);

        for (var i = 0; i < limitstep; i++)
        // while (openPathTiles.Count != 0)
        {
            //     sort and get lowest F
            openPathTiles.sort((a, b) => (a.g + a.h) - (b.g + b.h));
            currentTile = openPathTiles[0];

            //    move current from open to close
            var ic = openPathTiles.indexOf(currentTile);
            openPathTiles.splice(ic, 1);
            closedPathTiles.push(currentTile);

            var g = currentTile.g + 1;

            //  if(close have target, final it.)
            if (closedPathTiles.indexOf(to) >= 0) {
                break;
            }

            //    searach around
            var apprivateTiles = this.Path_GetAround(currentTile);
            for (var i = 0; i < apprivateTiles.length; i++)
            //     foreach (Tile adjacentTile in currentTile.apprivateTiles)
            {
                var adjacentTile = apprivateTiles[i];


                //block skip
                if (this._blocked[adjacentTile.y * this.height + adjacentTile.x])
                    continue;


                //skip closed
                if (closedPathTiles.indexOf(adjacentTile) >= 0) {
                    continue;
                }

                //  if new,add and calc g h
                if (openPathTiles.indexOf(adjacentTile) < 0) {
                    adjacentTile.g = g;
                    adjacentTile.h = this.Path_DistPos(adjacentTile, to);
                    openPathTiles.push(adjacentTile);
                }
                //    try to use low g
                else if ((adjacentTile.g + adjacentTile.h) > g + adjacentTile.h) {
                    adjacentTile.g = g;
                }
            }
        }

        // List<Tile> finalPathTiles = new List<Tile>();
        let path: TilePos[] = [];

        // final output
        if (closedPathTiles.indexOf(to) >= 0) {
            currentTile = to;
            path.push(currentTile);

            for (var i = to.g - 1; i >= 0; i--) {

                //find and push
                for (var j = 0; j < closedPathTiles.length; j++) {
                    var pnode = closedPathTiles[j];
                    if (pnode.g == i && this.Path_DistPos(pnode, currentTile) == 1) {
                        currentTile = pnode;
                        path.push(currentTile);
                        break;
                    }

                }

            }

            path.reverse();
        }

        return path




        return null;


    }
}


