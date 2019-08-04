import store from '@/store'
import formatter from '@/utils/timeFormatter'

let Getters = {};

Getters.item = {
  byItemId (itemId) {
    // if (itemId === "furni") return {
    //   "itemId": "furni",
    //   "name": "家具",
    //   "sortId": 9999,
    //   "rarity": 0,
    //   "itemType": "FURN",
    //   "spriteCoord": [0, 0]
    // };
    return this.all(false).find(el => {
      return el.itemId === itemId
    })
  },
  all (sort=true) {
    if (!store.state.data.items) return [];
    let r = store.state.data.items;
    r.forEach(el => {
      const meta = {
        CARD_EXP: {
          name: "作战记录",
          icon: "mdi-card-bulleted",
          color: "light-blue"
        },
        MATERIAL: {
          name: "材料",
          icon: "mdi-cube-outline",
          color: "lime"
        },
        FURN: {
          name: "家具",
          icon: "mdi-lamp",
          color: "blue-grey"
        }
      };
      
      el.meta = meta[el.itemType]
    });
    if (sort) r.sort((a, b) => a.sortId - b.sortId)
    return r
  }
}
Getters.limitations = {
  byStageId (stageId) {
    return store.state.data.limitations.find(el => {
      return el.name === stageId
    })
  }
}
Getters.statistics = {
  byItemId (itemId) {
    let result = store.state.data.resultMatrix.matrix.filter(el => {
      return el.itemId === itemId
    });

    result.forEach(el => {
      let stage = Getters.stages.byStageId(el.stageId);

      el.stage = stage;
      el.zone = Getters.zones.byZoneId(el.stage.zoneId);

      el.percentage = (el.quantity / el.times);
      el.percentageText = `${(el.percentage * 100).toFixed(2)}%`;

      el.apPPR = (stage.apCost / el.percentage).toFixed(2)
    });
    return result
  },
  byStageId (stageId) {
    let result = store.state.data.resultMatrix.matrix.filter(el => {
      return el.stageId === stageId
    });
    let stage = Getters.stages.byStageId(stageId);
    result.forEach(el => {
      el.item = Getters.item.byItemId(el.itemId);
      el.percentage = (el.quantity / el.times);
      el.percentageText = `${(el.percentage * 100).toFixed(2)}%`;

      el.apPPR = (stage.apCost / el.percentage).toFixed(2)
    });
    return result
  }
},
Getters.stages = {
  byStageId (stageId) {
    return store.state.data.stages.find(el => {
      return el.stageId === stageId
    })
  },
  byParentZoneId (zoneId) {
    return store.state.data.stages.filter(el => {
      return el.zoneId === zoneId
    })
  }
},
Getters.zones = {
  getIcon (zoneType) {
    const ICON_MAP = {
      "MAINLINE": "mdi-checkerboard",
      "WEEKLY": "mdi-treasure-chest",
      "ACTIVITY": "mdi-sack"
    };
    return ICON_MAP[zoneType]
  },
  byZoneId (zoneId) {
    return this.all().find(el => {
      return el.zoneId === zoneId
    })
  },
  byType (type) {
    return this.all().filter(el => {
      return el.type === type
    });
  },
  all () {
    let zones = store.state.data.zones;
    if (!zones) return [];

    zones.forEach((object) => {
      object.icon = this.getIcon(object.type);

      object.isActivity = object.type === "ACTIVITY";
      if (object.isActivity) {
        object.activityActiveTime = formatter.dates([object.openTime, object.closeTime]);

        object.isOutdated = formatter.isOutdated(object.closeTime)
      }
    });
    return zones
  }
}

export default Getters