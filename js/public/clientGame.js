class ClientSideGame {

    gameLoopIntervalId
    isRequestAnimationStopped
    map
    bunniesList

    constructor(map, socket) {

        this.map = Map.clientConstructor(map);
        this.socket = socket;
        this.bunniesList = {};
        console.log( this.map)
        let onBunniesInitListener = (bunniesInits) => {
            console.log("bunniesInits")
            console.log(bunniesInits)
            for (let bunniesInit of bunniesInits) {


                this.bunniesList[bunniesInit.clientId] = new ClientBunny(bunniesInit.clientId, bunniesInit.bunnyW,
                    bunniesInit.bunnyH, bunniesInit.color, bunniesInit.RESPAWN_INVINCIBILITY_MILLISECONDS);
                console.log(this.bunniesList)
            }
            console.log(this.bunniesList)
        }
        this.socket.on("bunniesInits",
            onBunniesInitListener
        );


        let onBunniesUpdatesListener = (bunniesUpdates) => {
            for (let bunniesUpdate of bunniesUpdates) {

                this.bunniesList[bunniesUpdate.clientId].onNewDataFromServer(bunniesUpdate.positionsHistory, bunniesUpdate.isInAir);


            }

        }
        this.socket.on("bunniesUpdates",
            onBunniesUpdatesListener
        );


        let onBunnyDestroyedListener = (clientId) => {
            delete this.bunniesList[clientId];
        }
        this.socket.on("bunnyDestroyed",
            onBunnyDestroyedListener
        );
        let onBunnyInvincibleListener= (clientId) => {
            console.log("onBunnyInvincibleListener")
            this.bunniesList[clientId].onBunnyInvincible()
        }

this.socket.on("bunnyInvincible", onBunnyInvincibleListener)

        //prepering canvas for game engine
        this.canvas = document.getElementById("gameCanvas");
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


            if (ret in this.pressedKeys)
                delete this.pressedKeys[ret]

        };
        document.addEventListener('keyup', this.keyupListener)
    }

    emitPressedKeys() {
        if (Object.keys(this.pressedKeys).length > 0) {

            this.socket.emit("keyPressed", this.pressedKeys);
        }
    }

    update() {
        this.emitPressedKeys()

    }


    draw() {

        if (this.isRequestAnimationStopped === true) {
            // console.log("this.isRequestAnimationStopped===true")
            return;
        }


        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.mapPreRender, 0, 0)


        for (const [key, value] of Object.entries(this.bunniesList)) {
            value.draw(this.ctx)
        }

       

        this.requestAnimationFrameId = window.requestAnimationFrame(() => {
            this.draw()
        })
        ;

    }


    destructor() {
        console.log(" endGame()")
        this.isRequestAnimationStopped = true;

        clearInterval(this.gameLoopIntervalId);
        this.socket.removeAllListeners("bunniesInits");
        this.socket.removeAllListeners("bunniesUpdates");
        this.socket.removeAllListeners("bunnyDestroyed"
        )
        this.socket.removeAllListeners("bunnyInvincible"
        )
        document.removeEventListener('keydown', this.keydownListener);
        document.removeEventListener('keyup', this.keyupListener);


    }
}
