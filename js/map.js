const fs = require('fs');

class Block {
    constructor(type, isFloor) {
//types air=a grasss=g  water=w ice=i
        this.type = type;
        this.isFloor = isFloor
    }

}

class Map {
    constructor() {

    }

    static serverConstructor(mapBlockW, mapBlockH, blockSize) {
        let map = new Map();
        map.mapBlocksW = mapBlockW
        map.mapBlocksH = mapBlockH
        map.blockSize = blockSize;

        map.blocksList = new Array(map.mapBlocksW)
        for (let i = 0; i < map.mapBlocksW; ++i) {

            map.blocksList[i] = []
            for (let j = 0; j < map.mapBlocksH; ++j) {

                map.blocksList[i][j] = new Block('a', false)
            }
        }

        return map;
    }

    static clientConstructor(mapOther) {

        let map = new Map();
        map.blockSize = mapOther.blockSize;
        map.mapBlocksW = mapOther.mapBlocksW
        map.mapBlocksH = mapOther.mapBlocksH


        map.blocksList = new Array(map.mapBlocksW)

        for (let i = 0; i < map.mapBlocksW; ++i) {

            map.blocksList[i] = new Array(map.mapBlocksH)
            for (let j = 0; j < map.mapBlocksH; ++j) {


                map.blocksList[i][j] = new Block(0)

            }
        }
        console.log("map.blocksLists initialized")
        console.log(mapOther.blocksList)
        for (let i = 0; i < map.mapBlocksW; ++i) {

            for (let j = 0; j < map.mapBlocksH; ++j) {


                map.blocksList[i][j] = new Block(mapOther.blocksList[i][j].type)

            }
        }
        console.log("map.blocksLists updated from server")
        console.log(map.blocksList)
        return map;
    }


    mapTemplate() {


        let rawdata = fs.readFileSync('./js/map.json');
        this.blocksList = JSON.parse(rawdata);
        let a;
    }


}

module.exports.Map = Map;