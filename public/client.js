var socket = io.connect("http://localhost:4000/");


class Block {
    constructor(type) {

        this.type = type;
    }

}

class Map {
    constructor(map) {

        this.blockSize = map.blockSize;
        this.mapW = map.mapW
        this.mapH = map.mapH
        this.blocksPerRow = this.mapW / this.blockSize

        this.blocksList = new Array(this.blocksPerRow)

        for (let i = 0; i < this.blocksPerRow; ++i) {

            this.blocksList[i] = new Array(this.blocksPerRow)
            for (let j = 0; j < this.blocksPerRow; ++j) {


                this.blocksList[i][j] = new Block(0)

            }
        }
        console.log("this.blocksLists initialized")
        console.log(this.blocksList)
        for (let i = 0; i < this.blocksPerRow; ++i) {

            for (let j = 0; j < this.blocksPerRow; ++j) {


                this.blocksList[i][j] = new Block(map.blocksList[i][j].type)

            }
        }
        console.log("this.blocksLists updated from server")
        console.log(this.blocksList)
    }

    preRender(ctx)
    {
        var m_canvas = document.createElement('canvas');
        m_canvas.width = this.mapW;
        m_canvas.height = this.mapH;
        var m_context = m_canvas.getContext("2d");

        this.draw(m_context)
        return m_canvas
    }
    draw(ctx) {
        console.log("map.draw()")

        for (let i = 0; i < this.blocksPerRow; ++i) {

            for (let j = 0; j < this.blocksPerRow; ++j) {

                console.log("filling if type ")
                if (!(this.blocksList[i][j].type === 0)) {
                    console.log("filling")
                    ctx.fillStyle = "#dd2c32";
                    let x = i * this.blockSize;
                    let y = j * this.blockSize;
                    //console.log("map.draw() " +  obj.x.toString()+ "  "+obj.y.toString())
                    ctx.fillRect(x, y, this.blockSize, this.blockSize);
                }

            }
        }


    }
}

class Bunny {

    constructor(x, y, clientId, mapW, mapH, vX, vY, aX, aY, dx) {
        this.x = x;
        this.y = y;
        this.clientId = clientId;

        this.mapW = mapW
        this.mapH = mapH
        this.vX = vX;
        this.vY = vY
        this.aX = aX;
        this.aY = aY;
        this.dx = dx;

    }

    update() {
        this.updateKey('R')
    }

    updateKey(pressedKey) {
        if (pressedKey === 'L') {
            this.x = this.x - this.dx
        } else if (pressedKey === 'R') {
            this.x = this.x + this.dx
        }

    }

    moveXAxis(dx) {
        this.x = this.x + dx;
        if (this.x < 0) {
            this.x = 0
        }
        if (this.x > this.mapW) {
            this.x = this.mapW
        }
    }

    moveYAxis(dy) {
        this.y = this.y + dy;
        if (this.y < 0) {
            this.y = 0
        }
        if (this.y > this.mapH) {
            this.y = this.mapH
        }
    }

    updatePhysic(pressedKey) {

    }
    draw(ctx)
    {
        ctx.fillStyle = "#30dd3e";

        //console.log("map.draw() " +  obj.x.toString()+ "  "+obj.y.toString())
        ctx.fillRect(this.x, this.y, 20, 20
        );
    }

}

document.addEventListener('keydown', function (event) {
    let ret = 'N';
    if (event.keyCode == 37) {
        ret = 'L';
    } else if (event.keyCode == 39) {
        ret = 'R';
    } else if (event.keyCode == 38) {
        ret = 'U';
    } else if (event.keyCode == 40) {
        ret = 'D';
    }
    let pressedKey = ret;
    socket.emit("keyPressed", pressedKey);
});

class Game {
    constructor(map) {

        this.map = new Map(map);

        this.bunnysList = [];


        this.canvas = document.getElementById("myCanvas");
        this.ctx = this.canvas.getContext("2d");

       this.mapPreRender= this.map.preRender(this.ctx)


        console.log("req")



        window. requestAnimationFrame(()=> {this.draw()})

    }

    gameTick() {


    }


    draw() {

        console.log("Game.draw()")

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.mapPreRender,0,0)

        for (let i = 0; i < this.bunnysList.length; ++i) {

            this.bunnysList[i].draw(this.ctx)
        }






        window. requestAnimationFrame(()=> {this.draw()})
        ;

    }

    updateBunnysList(bunnysListJson) {
        this.bunnysList = []
        for (let i = 0; i < bunnysListJson.length; ++i) {


            this.bunnysList.push(new Bunny(bunnysListJson[i].x, bunnysListJson[i].y, bunnysListJson[i].clientId,
                bunnysListJson[i].mapW, bunnysListJson[i].mapH, bunnysListJson[i].vX, bunnysListJson[i].vY, bunnysListJson[i].aX,
                bunnysListJson[i].aY, bunnysListJson[i].dx))
        }
    }
}


let game


socket.on("map", function (m) {
    console.log(m)

    game = new Game(m)

});
socket.on("bunnysList", function (bunnysListJson) {
    console.log(typeof  bunnysListJson)
    console.log(  bunnysListJson)
    game.updateBunnysList( bunnysListJson)

});


