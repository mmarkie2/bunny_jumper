class Block {
    constructor(type, isFloor) {
//types air=a grasss=g  water=w ice-i
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

    preRender(ctx) {
        var m_canvas = document.createElement('canvas');
        m_canvas.width = this.mapBlocksW * this.blockSize;
        m_canvas.height = this.mapBlocksH * this.blockSize;
        var m_context = m_canvas.getContext("2d");

        this.drawMapFromImage(m_context, "assets/newmap.png")
        return m_canvas
    }

    draw(ctx) {


        for (let i = 0; i < this.mapBlocksW; ++i) {

            for (let j = 0; j < this.mapBlocksH; ++j) {
                let x = i * this.blockSize;
                let y = j * this.blockSize;

                if (this.blocksList[i][j].type === 'g') {
                    ctx.fillStyle = "#30dd3e";
                } else if (this.blocksList[i][j].type === 'i') {
                    ctx.fillStyle = "#b2dadd";
                } else if (this.blocksList[i][j].type === 'w') {
                    ctx.fillStyle = "#2f32dd";
                } else {
                    ctx.fillStyle = "#4ebadd";
                }
                ctx.fillRect(x, y, this.blockSize, this.blockSize);

            }
        }


    }

    drawMapFromImage(ctx, imagePath) {

        let img = new Image();
        img.onload = () => {

            ctx.drawImage(img, 0, 0, this.mapBlocksW * this.blockSize, this.mapBlocksH * this.blockSize)
        }
        img.src = imagePath;


    }


}
