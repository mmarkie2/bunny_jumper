class Bunny {
    constructor(positionsHistory, clientSocketId, mapW, mapH) {

        this.positionsHistoryLength = 5;
        this.positionsHistory = positionsHistory;

        this.clientSocketId = clientSocketId;
        this.vX = 0;
        this.vY = 0;
        this.aX = 0;
        this.aY = 0.16;
        this.dx = 4
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
        this.jumpCounter = 0

        this.deafeatedBy = null;
    }

    //client constructor
    static clientConstructor(positionsHistory, clientSocketId, mapW, mapH, vX, vY, aX, aY, dx, isInAir) {
        let bunny = new Bunny(positionsHistory, clientSocketId, mapW, mapH);

        bunny.clientSocketId = clientSocketId;

        bunny.mapW = mapW
        bunny.mapH = mapH

        bunny.vX = vX;
        bunny.vY = vY
        bunny.aX = aX;
        bunny.aY = aY;
        bunny.dx = dx;
        bunny.isInAir = isInAir

        return bunny;
    }


    changePosition(x, y) {
        if (this.positionsHistory.length >= this.positionsHistoryLength)
            this.positionsHistory.pop();

        this.positionsHistory.unshift({x: x, y: y});
    }

    getX() {
        return this.positionsHistory[0].x;
    }

    getY() {
        return this.positionsHistory[0].y;
    }

    update(map, bunniesList) {
        this.move()
        this.updatePhysic()
        this.collisionDetection(map, bunniesList)


    }

    move() {


        // console.log("this.pressedKey:  " + this.pressedKey)

        let timeout = 200;
        let timeWindow = 60;
        for (let [key, value] of Object.entries(this.pressedKey)) {
            // console.log("this.pressedKey:  " + key)
            if (key === 'N') {
                continue
            } else if (key === 'L') {

                this.changePosition(this.getX() - this.dx, this.getY())
            } else if (key === 'R') {
                this.changePosition(this.getX() + this.dx, this.getY())
            } else if (key === 'U') {

                if (this.jumpCounter === 0 && this.isInAir === false) {

                    setTimeout(() => {
                        this.jumpCounter = 1;
                        // console.log(" this.jumpCounter===1 !!!!!!!!!!!!!!!!!!!!!!! ")
                    }, timeout)
                    setTimeout(() => {
                        this.jumpCounter = 0;
                        // console.log(" this.jumpCounter===0 !!!!!!!!!!!!!!!!!!!!!!! ")
                    }, timeout + timeWindow)

                    this.vY = -5
                }
                if (this.jumpCounter === 1) {

                    setTimeout(() => {
                        this.jumpCounter = 2;
                        // console.log(" this.jumpCounter===1 !!!!!!!!!!!!!!!!!!!!!!! ")
                    }, timeout)
                    setTimeout(() => {
                        this.jumpCounter = 0;
                        // console.log(" this.jumpCounter===0 !!!!!!!!!!!!!!!!!!!!!!! ")
                    }, timeout + timeWindow)

                    this.vY = this.vY - 1
                }
                // if (this.jumpCounter === 2) {
                //     this.jumpCounter = 0
                //     this.vY = this.vY - 1
                //
                // }
            } else if (key === 'D') {
                this.changePosition(this.getX(), this.getY() + this.dy);
            }
        }
        if (this.pressedKeyIter < this.pressedKeyMultiplyier) {
            this.pressedKeyIter++
        } else {

            this.pressedKey = {}
            this.pressedKey['N'] = true
            this.lastPpressedKey = this.pressedKey
            this.pressedKeyIter = 0
            this.pressedKeyMultiplyier = 3
        }
    }


    setPressedKey(pressedKey) {
        this.pressedKey = pressedKey
    }

    hitDetectionWithBunnies(map, bunniesList) {
        if (bunniesList == null) {
            bunniesList = []
        }
        for (let bunnysIter of bunniesList) {
            if (bunnysIter.clientSocketId !== this.clientSocketId) {
                //top
                let isTop = false, isBot = false, isLeft = false, isRight = false
                if (this.getY() < bunnysIter.getY() + map.blockSize) {
                    isTop = true
                }
                //bot
                if (this.getY() + map.blockSize > bunnysIter.getY()) {
                    isBot = true
                }
                //left
                if (this.getX() + map.blockSize > bunnysIter.getX()) {
                    isLeft = true
                }
                //right
                if (this.getX() < bunnysIter.getX() + map.blockSize) {
                    isRight = true
                }

                if (isLeft && isRight && isBot && isTop) {
                    let offset = map.blockSize * 1 / 2

                    //bot
                    if (this.getY() > bunnysIter.getY() + offset) {

                        this.deafeatedBy = bunnysIter.clientSocketId;
                    }


                }
            }
        }

    }

//colision and is in air
    collisionDetection(map, bunniesList) {

        //colision with bunnies
        this.hitDetectionWithBunnies(map, bunniesList)

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
                    let isTopOfBunnyPassed = false, isBotOfBunnyPassed = false, isLeftOfBunnyPassed = false,
                        isRightOfBunnyPassed = false

                    if (this.getY() < iterY + map.blockSize) {
                        isTopOfBunnyPassed = true
                    }
                    //bot
                    if (this.getY() + map.blockSize > iterY) {
                        isBotOfBunnyPassed = true
                    }
                    //left
                    if (this.getX() + map.blockSize > iterX) {
                        isLeftOfBunnyPassed = true
                    }
                    //right
                    if (this.getX() < iterX + map.blockSize) {
                        isRightOfBunnyPassed = true
                    }

                    let offset = map.blockSize * 1 / 2
                    let isFinalTop = false, isFinalBot = false, isFinalLeft = false, isFinalRight = false;
                    if ((isLeftOfBunnyPassed && isRightOfBunnyPassed) && isTopOfBunnyPassed && isBotOfBunnyPassed) {

                        let lastPosition = {x: this.getX(), y: this.getY()};
                        ;
                        for (let i = 0; i < this.positionsHistory.length; ++i) {
                            let position = this.positionsHistory[i];
                            let previousRelativePosition = this.returnRelativePositionOfSecondObject(iterX, iterY,
                                position.x, position.y, map.blockSize)
                            if (previousRelativePosition === 'i') {

                                this.positionsHistory.shift();
                                --i;

                            } else {
                                if (previousRelativePosition === 't') {

                                    this.changePosition(this.getX(), iterY - map.blockSize);
                                    if (blocksIter.isFloor === true) {
                                        //  console.log("on the floor")
                                        this.isInAir = false;
                                        this.vY = 0;
                                    }
                                } else if (previousRelativePosition === 'd') {
                                    this.changePosition(lastPosition.x, iterY + map.blockSize);
                                    this.vY = 0;
                                    //disable futher holding up button to stay in air
                                    this.jumpCounter = 0;
                                } else if (previousRelativePosition === 'l') {
                                    this.changePosition(iterX - map.blockSize, lastPosition.y);
                                } else if (previousRelativePosition === 'r') {
                                    this.changePosition(iterX + map.blockSize, lastPosition.y);
                                }
                                break;
                            }

                        }


                    }
                }
            }
        }
    }

    returnRelativePositionOfSecondObject(x1, y1, x2, y2, blockSize) {

        let deltaX = x2 - x1;
        let deltaY = y2 - y1;

        if (Math.abs(deltaX) <= Math.abs(deltaY)) {
            if (Math.abs(deltaY) < blockSize) {
                return 'i';
            } else if (deltaY >= 0) {
                return 'd';
            } else {
                return 't';
            }


        } else {
            if (Math.abs(deltaX) < blockSize) {
                return 'i';
            } else if (deltaX >= 0) {
                return 'r';
            } else {
                return 'l';
            }
        }


    }

    updatePhysic() {


        this.vX = this.vX + this.aX * this.dv;
        this.vY = this.vY + this.aY * this.dv;


        this.changePosition(this.getX() + this.vX * this.dx, this.getY() + this.vY * this.dy);


    }

    //client side

    draw(ctx, blockSize) {
        ctx.fillStyle = "#ddaa5f";
        if (this.isInAir) {
            console.log("in air")
            ctx.fillStyle = "#dd0fb3";
        }
        //console.log("map.draw() " +  obj.x.toString()+ "  "+obj.y.toString())
        ctx.fillRect(this.getX(), this.getY(), blockSize, blockSize
        );
    }

}

module.exports.Bunny = Bunny;