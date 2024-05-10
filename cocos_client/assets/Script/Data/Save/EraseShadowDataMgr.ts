import { Vec2 } from "cc";
import CLog from "../../Utils/CLog";

export class EraseShadowDataMgr {
    private _data: Vec2[];
    private _baseKey: string = "erase_shadow";
    private _key: string = "";

    public constructor() {}

    public async loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                for (const vec of JSON.parse(data)) {
                    this._data.push(new Vec2(vec.x, vec.y));
                }
            }

            CLog.debug("EraseShadowDataMgr: loadObj, ", this._data);
        }
    }

    public getObj() {
        return this._data;
    }

    public addObj(data: Vec2) {
        this._data.push(data);
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}