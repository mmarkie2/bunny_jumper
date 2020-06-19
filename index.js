var express = require('express');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function () {
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));


// game
class Block {
    constructor(type) {
//types air=0 grasss=1
        this.type = type;
    }

}

class Map {
    constructor(mapW, mapH, blockSize) {
        this.blocksList = []

        this.blockSize = blockSize;
        this.mapW = mapW
        this.mapH = mapH
        this.blocksPerRow = this.mapW / this.blockSize
        for (let i = 0; i < this.blocksPerRow; ++i) {

            this.blocksList[i] = []
            for (let j = 0; j < this.blocksPerRow; ++j) {

                this.blocksList[i][j] = new Block(0)
            }
        }
    }

    addBlock(x, y, type) {
        this.blocksList.push(new Block(x, y, type))
    }

    mapTemplate() {
//floor
        for (let i = 0; i < this.blocksPerRow; ++i) {

            this.blocksList[i][this.blocksPerRow - 1] = new Block(1)
        }

        for (let i = 0; i < this.blocksPerRow; ++i) {

            this.blocksList[i][0] = new Block(1)
        }

        for (let i = 0; i < this.blocksPerRow; ++i) {

            this.blocksList[0][i] = new Block(1)
            this.blocksList[this.blocksPerRow - 1][i] = new Block(1)
        }


        this.blocksList[2][3] = new Block(1)
    }
}

class Bunny {
    constructor(x, y, clientId, mapW, mapH) {
        this.x = x;
        this.y = y;
        this.clientId = clientId;
        this.vX = 0;
        this.vY = 0;
        this.aX = 0;
        this.aY = 0;
        this.dx = 2
        ;
        this.mapW = mapW
        this.mapH = mapH
        this.friction = 0.5
    }

    update(map) {
        this.colisionDetection(map)
    }

    updateKey(pressedKey) {
        if (pressedKey === 'L') {
            this.x = this.x - this.dx
        } else if (pressedKey === 'R') {
            this.x = this.x + this.dx
        } else if (pressedKey === 'U') {
            this.y = this.y - this.dx
        } else if (pressedKey === 'D') {
            this.y = this.y + this.dx
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

    colisionDetection(m) {
        for (let i = 0; i < m.blocksPerRow; ++i) {


            for (let j = 0; j < m.blocksPerRow; ++j) {

                let blocksIter = m.blocksList[i][j]
                if (blocksIter.type !== 0) {
                    let iterX = i * m.blockSize
                    let iterY = j * m.blockSize
                    //top
                    let isTop = false, isBot = false, isLeft = false, isRight = false
                    if (this.y < iterY + m.blockSize) {
                        isTop = true
                    }
                    //bot
                    if (this.y + m.blockSize > iterY) {
                        isBot = true
                    }
                    //left
                    if (this.x + m.blockSize > iterX) {
                        isLeft = true
                    }
                    //right
                    if (this.x < iterX + m.blockSize) {
                        isRight = true
                    }

let offset= m.blockSize*2/3
                    let isFinalTop=false,isFinalBot=false,isFinalLeft=false,isFinalRight=false;
                    if ((isLeft && isRight)) {

                        if (isTop && isBot) {
                            //top
                            if (this.y+offset < iterY) {
                                console.log("top")
                                isFinalTop=true
                            }
                            //bot
                            if (this.y +m.blockSize-offset> iterY+m.blockSize) {
                                console.log("bot")
                                isFinalBot=true
                            }
                        }

                    }

                    if (isTop && isBot) {

                        if (isLeft && isRight) {
                            //left
                            if (this.x+offset < iterX) {
                                console.log("left")
                                isFinalLeft=true
                            }
                            //right
                            if (this.x  +m.blockSize-offset> iterX+m.blockSize) {
                                console.log("right")
                                isFinalRight=true
                            }
                        }

                    }

                    if(isFinalTop)
                    {
                        this.y=iterY-m.blockSize
                    }
                    if(isFinalBot)
                    {
                        this.y=iterY+m.blockSize
                    }
                    if(isFinalLeft)
                    {
                        this.x=iterX-m.blockSize
                    }
                    if(isFinalRight)
                    {
                        this.x=iterX+m.blockSize
                    }

                }


            }
        }
    }


    updatePhysic() {
        this.vX = this.vX + this.aX * this.dx;
        this.vY = this.vY + this.aY * this.dx;

        this.x = this.x + this.vX * this.dx;
        this.y = this.y + this.vY * this.dx;
    }

}


// Socket setup & pass server
var io = socket(server);
let bunnysList = []
mapWidth = 600
mapHeight = 600
blockSize = 20
map = new Map(mapWidth, mapHeight, blockSize)
map.mapTemplate();
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    bunnysList.push(new Bunny(20, 20, socket.id, mapWidth, mapHeight))
    socket.emit("map", map)
    socket.emit("bunnysList", bunnysList)
    socket.on("keyPressed", function (pressedKey) {
        console.log(socket.id + " pressed: " + pressedKey);

        bunnysList.find(function (elem) {
            return elem.clientId === socket.id;
        }).updateKey(pressedKey)

        socket.emit("bunnysList", bunnysList)
    });
});

function sendPositionsData() {

}

function onTimerTick() {
    bunnysList.forEach(function (elem) {
        elem.update(map)
    })
}

setInterval(onTimerTick, 400);


