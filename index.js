var express = require('express');
let socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function () {
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));


// game
class Block {
    constructor(type, isFloor) {
//types air=a grasss=g  water=w ice-i
        this.type = type;
        this.isFloor = isFloor
    }

}

class Map {
    constructor(mapBlockW, mapBlockH, blockSize) {
        this.blocksList = []

        this.blockSize = blockSize;
        this.mapBlocksW = mapBlockW
        this.mapBlocksH = mapBlockH

        for (let i = 0; i < this.mapBlocksW; ++i) {

            this.blocksList[i] = []
            for (let j = 0; j < this.mapBlocksH; ++j) {

                this.blocksList[i][j] = new Block('a', false)
            }
        }


    }


    mapTemplate() {
//floor

        const fs = require('fs');

        fs.readFile('map.json', (err, data) => {
            if (err) throw err;
            this.blocksList = JSON.parse(data);

        });

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
        this.aY = 0.16;
        this.dx = 3
        this.dy = 2
        this.dv = 2
        ;
        this.mapW = mapW
        this.mapH = mapH


        this.friction = 0.5


        this.pressedKey = 'N'
        this.lastPpressedKey = 'N'
        this.pressedKeyMultiplyier = 3
        this.pressedKeyIter = 0
        this.isInAir = false
        this.jumpCounter=0

    }

    update(map,bunniesList) {
        this.move()
        this.updatePhysic()
        this.colisionDetection(map,bunniesList)


    }

    move() {


        // console.log("this.pressedKey:  " + this.pressedKey)

let timeout=200;
        let timeWindow=60;
        for (let [key, value] of Object.entries(this.pressedKey)) {
            // console.log("this.pressedKey:  " + key)
            if (key === 'N') {
                continue
            } else if (key === 'L') {
                this.x = this.x - this.dx
            } else if (key === 'R') {
                this.x = this.x + this.dx
            } else if (key === 'U' ) {
                console.log(this.jumpCounter)
                if(this.jumpCounter===0 && this.isInAir === false)
                {

                    setTimeout(()=>{this.jumpCounter=1; console.log(" this.jumpCounter===1 !!!!!!!!!!!!!!!!!!!!!!! " )}, timeout)
                    setTimeout(()=>{this.jumpCounter=0 ;console.log(" this.jumpCounter===0 !!!!!!!!!!!!!!!!!!!!!!! " )},timeout+ timeWindow)

                    this.vY = -5
                }
                if(this.jumpCounter===1 )
                {

                    setTimeout(()=>{this.jumpCounter=0; console.log(" this.jumpCounter===1 !!!!!!!!!!!!!!!!!!!!!!! " )}, timeout)
                    setTimeout(()=>{this.jumpCounter=0 ;console.log(" this.jumpCounter===0 !!!!!!!!!!!!!!!!!!!!!!! " )},timeout+ timeWindow)

                    this.vY = this.vY-1
                }
                if(this.jumpCounter===2)
                {
                    this.jumpCounter=0
                    this.vY = this.vY-1

                }
            } else if (key === 'D') {
                this.y = this.y + this.dx
            }
        }
        if (this.pressedKeyIter < this.pressedKeyMultiplyier) {
            this.pressedKeyIter++
        } else {

            this.pressedKey = {}
            this.pressedKey['N'] = true
            this.lastPpressedKey= this.pressedKey
            this.pressedKeyIter = 0
            this.pressedKeyMultiplyier = 3
        }
    }


    setPressedKey(pressedKey) {
        this.pressedKey = pressedKey
    }
    hitDetectionWithBunnies(map,bunniesList)
    {
        if(bunniesList==null)
        {
            bunniesList=[]
        }
for (let bunnysIter of bunniesList)
{
   if( bunnysIter.clientId!==this.clientId)
   {
       //top
       let isTop = false, isBot = false, isLeft = false, isRight = false
       if (this.y < bunnysIter.y + map.blockSize) {
           isTop = true
       }
       //bot
       if (this.y + map.blockSize > bunnysIter.y) {
           isBot = true
       }
       //left
       if (this.x + map.blockSize >bunnysIter.x) {
           isLeft = true
       }
       //right
       if (this.x < bunnysIter.x + map.blockSize) {
           isRight = true
       }

       if(isLeft && isRight &&  isBot)
       {
           let offset = map.blockSize * 1 / 2

           if (isTop && isBot) {

               //bot
               if (this.y + map.blockSize - offset > bunnysIter.y + map.blockSize) {

                   console.log("IM HIT============================================IM HIT")
               }
           }



       }
   }
}

    }
//colision and is in air
    colisionDetection(map,bunniesList) {

        //colision with bunnies
       this. hitDetectionWithBunnies(map,bunniesList)

        //colision with blocks

        this.isInAir = true;
        for (let i = 0; i < map.mapBlocksW; ++i) {


            for (let j = 0; j < map.mapBlocksH; ++j) {

                let blocksIter = map.blocksList[i][j]
                if (blocksIter.type !== 'a') {
                    let iterX = i * map.blockSize
                    let iterY = j * map.blockSize

                    //isInAir


                    //top
                    let isTop = false, isBot = false, isLeft = false, isRight = false
                    if (this.y < iterY + map.blockSize) {
                        isTop = true
                    }
                    //bot
                    if (this.y + map.blockSize > iterY) {
                        isBot = true
                    }
                    //left
                    if (this.x + map.blockSize > iterX) {
                        isLeft = true
                    }
                    //right
                    if (this.x < iterX + map.blockSize) {
                        isRight = true
                    }

                    let offset = map.blockSize * 1 / 2
                    let isFinalTop = false, isFinalBot = false, isFinalLeft = false, isFinalRight = false;
                    if ((isLeft && isRight)) {

                        if (isTop && isBot) {
                            //top
                            if (this.y + offset < iterY) {

                                isFinalTop = true
                            }
                            //bot
                            if (this.y + map.blockSize - offset > iterY + map.blockSize) {

                                isFinalBot = true
                            }
                        }

                    }

                    if (isTop && isBot) {

                        if (isLeft && isRight) {
                            //left
                            if (this.x + offset < iterX) {

                                isFinalLeft = true
                            }
                            //right
                            if (this.x + map.blockSize - offset > iterX + map.blockSize) {

                                isFinalRight = true
                            }
                        }

                    }

                    if (isFinalTop) {
                        if (blocksIter.isFloor === true) {
                          //  console.log("on the floor")
                            this.isInAir = false;
                            this.vY = 0
                        }
                        this.y = iterY - map.blockSize
                    }

                    if (isFinalBot) {
                        this.y = iterY + map.blockSize
                        this.vY = 0
                    }
                    if (isFinalLeft && !isFinalTop) {
                        this.x = iterX - map.blockSize
                    }
                    if (isFinalRight && !isFinalTop) {
                        this.x = iterX + map.blockSize
                    }

                }


            }
        }
    }


    updatePhysic() {


        this.vX = this.vX + this.aX * this.dv;
        this.vY = this.vY + this.aY * this.dv;


        this.x = this.x + this.vX * this.dx;
     //   console.log("y delta: " + this.vY * this.dy)
        this.y = this.y + this.vY * this.dy;


    }

}


// Socket setup & pass server

class Game {
    constructor() {
        this.io = socket(server);
        this.bunnysList = []
        this.mapBlocksW = 23
        this.mapBlocksH = 22
        this.blockSize = 30
        this.map = new Map(this.mapBlocksW, this.mapBlocksH , this.blockSize)
        this.map.mapTemplate();
        this.socketsList = []

        this.io.on('connection', (socket) => {
            this.socketsList.push(socket)
            console.log('made socket connection', socket.id);
            this.bunnysList.push(new Bunny(3* this.blockSize,
                this.mapBlocksH * this.blockSize- 5* this.blockSize,
                socket.id, this.mapBlocksW* this.blockSize ,this.mapBlocksH * this.blockSize,this))
            socket.emit("map", this.map)
            socket.emit("bunnysList", this.bunnysList)
            socket.on("keyPressed", (pressedKey) => {
                console.log(socket.id + " pressed: ");
                console.log(pressedKey);
                this.bunnysList.find(function (elem) {
                    return elem.clientId === socket.id;
                }).setPressedKey(pressedKey)


            });
        });


        setInterval(() => {
            this.update()
        }, 33);

    }


    update() {
        for (let bunnysListElement of this.bunnysList) {
            bunnysListElement.update(this.map,this.bunnysList)
        }
        for (let iter of this.socketsList) {
            iter.emit("bunnysList", this.bunnysList)
        }
    }

}

let game = new Game()








