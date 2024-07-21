import NotificationMgr from "../../Basic/NotificationMgr";
import { InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
import { share } from "../../Net/msg/WebsocketMsg";
import NetGlobalData from "./Data/NetGlobalData";

export default class InnerBuildingDataMgr {
    private _data: Map<InnerBuildingType, UserInnerBuildInfo> = null;

    public loadObj() {
        this._initData();
    }
    //------------------------------------------------
    public get data() {
        return this._data;
    }

    public replaceData(netBuilding: share.Ibuilding_data) {
        const newObj = this._convertNetDataToObject(netBuilding);
        this._data.set(newObj.buildType, newObj);
    }
    public changePos(type: InnerBuildingType, pos: [number, number]) {
        if (!this._data.has(type)) {
            return;
        }
        this._data.get(type).pos = pos;
    }

    public getInnerBuildingLevel(buildingType: InnerBuildingType) {
        let level: number = 0;
        if (this._data.has(buildingType)) {
            level = this._data.get(buildingType).buildLevel;
        }
        return level;
    }
    //------------------------------------------------
    private _initData() {
        this._data = new Map();
        if (NetGlobalData.innerBuildings == null) {
            return;
        }
        for (const key in NetGlobalData.innerBuildings) {
            let building = NetGlobalData.innerBuildings[key];
            this._data.set(building.id as InnerBuildingType, this._convertNetDataToObject(building));
        }
    }

    private _convertNetDataToObject(netData: share.Ibuilding_data): UserInnerBuildInfo {
        const currentTime: number = new Date().getTime();
        return {
            buildType: netData.id as InnerBuildingType,
            buildLevel: netData.level,
            upgrading: netData.upgradeIng,
            upgradeBeginTimestamp: currentTime,
            upgradeEndTimestamp: currentTime + (netData.upgradeTotalTime - netData.upgradeCountTime) * 1000,
            troopIng: netData.troopIng,
            troopStartTime: currentTime,
            troopEndTime: currentTime + (netData.troopEndTime - netData.troopStartTime) * 1000,
            troopNum: netData.troopNum,
            pos: netData.pos,
        };
    }
}