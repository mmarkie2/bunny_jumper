class ClientSideGame {

    gameLoopIntervalId
    isRequestAnimationStopped
    map
    bunnysList

    constructor(map, socket) {

        this.map = Map.clientConstructor(map);
        this.socket = socket;
        this.bunnysList = [];
        this.bunniesListListener = (bunniesListJson) => {

            this.updateBunnysList(bunniesListJson)

        };
        this.socket.on("bunniesList", this.bunniesListListener);

        //prepering canvas for game engine
        this.canvas = document.getElementById("myCanvas");
        this.canvas.width = this.map.mapBlocksW * this.map.blockSize
        this.canvas.height = this.map.mapBlocksH * this.map.blockSize
        this.ctx = this.canvas.getContext("2d");

        this.mapPreRender = this.map.preRender(this.ctx)


        this.pressedKeys = {}
        this.setupKeyListeners()
        this.gameLoopIntervalId = setInterval(() => {
            this.update()
        }, 50)

        this.isRequestAnimationStopped = false;
        window.requestAnimationFrame(() => {
            this.draw()
        })

    }

    setupKeyListeners() {

        this.keydownListener = (event) => {
            let ret = 'N';
            if (event.key == 'ArrowLeft') {
                ret = 'L';
            } else if (event.key == 'ArrowRight') {
                ret = 'R';
            } else if (event.key == 'ArrowUp') {
                ret = 'U';
            } else if (event.key == 'ArrowDown') {
                ret = 'D';
            }

            this.pressedKeys[ret] = true;


            console.log(Object.keys(this.pressedKeys))


        }
        document.addEventListener('keydown', this.keydownListener);


        this.keyupListener = (event) => {
            let ret = 'N';
            if (event.key == 'ArrowLeft') {
                ret = 'L';
            } else if (event.key == 'ArrowRight') {
                ret = 'R';
            } else if (event.key == 'ArrowUp') {
                ret = 'U';
            } else if (event.key == 'ArrowDown') {
                ret = 'D';
            }

            console.log(this.pressedKeys)
            if (ret in this.pressedKeys)
                delete this.pressedKeys[ret]

        };
        document.addEventListener('keyup', this.keyupListener)
    }

    emitPressedKeys() {
        if (Object.keys(this.pressedKeys).length > 0) {
            console.log(Object.keys(this.pressedKeys))
            this.socket.emit("keyPressed", this.pressedKeys);
        }
    }

    update() {
        this.emitPressedKeys()

    }


    draw() {
        console.log("this.isRequestAnimationStopped", this.isRequestAnimationStopped)
        if (this.isRequestAnimationStopped === true) {
            console.log("this.isRequestAnimationStopped===true")
            return;
        }
        console.log(this)

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.mapPreRender, 0, 0)

        for (let i = 0; i < this.bunnysList.length; ++i) {

            this.bunnysList[i].draw(this.ctx, this.map.blockSize)
        }


        this.requestAnimationFrameId = window.requestAnimationFrame(() => {
            this.draw()
        })
        ;

    }

    updateBunnysList(bunnysListJson) {
        this.bunnysList = []
        for (let i = 0; i < bunnysListJson.length; ++i) {


            this.bunnysList.push(Bunny.clientConstructor(bunnysListJson[i].positionsHistory, bunnysListJson[i].clientId,
                bunnysListJson[i].mapW, bunnysListJson[i].mapH, bunnysListJson[i].vX, bunnysListJson[i].vY,
                bunnysListJson[i].aX,
                bunnysListJson[i].aY, bunnysListJson[i].dx, bunnysListJson[i].isInAir))
        }
    }

    destructor() {
        console.log(" endGame()")
        this.isRequestAnimationStopped = true;

        clearInterval(this.gameLoopIntervalId);
        this.socket.removeAllListeners("bunniesList");
        document.removeEventListener('keydown', this.keydownListener);
        document.removeEventListener('keyup', this.keyupListener);

    }
}