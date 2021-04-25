let socketModule = require('socket.io');
let bunnyModule = require('./bunny')
let mapModule = require('./map')
let GLOBALModule = require('../GLOBAL')

class Game {
    gameLoopIntervalId
    bunniesList
    mapBlocksW
    mapBlocksH
    blockSize
    map
    positionPool

    constructor(players, parentLobby) {
        this.players = players;
        this.parentLobby = parentLobby;
        this.bunniesList = []
        this.mapBlocksW = 23
        this.mapBlocksH = 22
        this.blockSize = 30
        this.map = mapModule.Map.serverConstructor(this.mapBlocksW, this.mapBlocksH, this.blockSize)
        this.map.mapTemplate();

        this.positionPool = [{
            x: 3 * this.blockSize,
            y: this.mapBlocksH * this.blockSize - 4 * this.blockSize
        },
            {
                x: 6 * this.blockSize,
                y: this.mapBlocksH * this.blockSize - 4 * this.blockSize
            },,
            {
                x: 11 * this.blockSize,
                y: this.mapBlocksH * this.blockSize - 4 * this.blockSize
            },
            {
                x: 4 * this.blockSize,
                y: 5 * this.blockSize
            },
            {
                x: 17 * this.blockSize,
                y: 8 * this.blockSize
            },
            {
                x: 19 * this.blockSize,
                y: 8 * this.blockSize
            }
        ]
        let i = 0;
        for (let player of players) {
            let positionHistory = [];
            positionHistory.push(this.positionPool[i]);
            i++;
            this.bunniesList.push(new bunnyModule.Bunny(positionHistory,
                player.socket.id, this.mapBlocksW * this.blockSize, this.mapBlocksH * this.blockSize, player.color))


            player.socket.emit("map", this.map)
            player.socket.emit("roundTimeInSeconds", GLOBALModule.GLOBAL.ROUND_LENGTH_SECONDS)
            this.emitBunniesInit();

            player.socket.on("keyPressed", (pressedKey) => {
                let a;
                this.bunniesList.find(x => x.clientId === player.socket.id)?.setPressedKey(pressedKey)

            })
        }
        for (let player of players)
        {
            this.emitBunnyInvincible(player.socket.id);
        }


        this.gameLoopIntervalId = setInterval(() => {
            this.update()
        }, 33);

        //end game if longer then 5 minute
        this.gameLoopTimeoutId = setTimeout(() => this.destructor(null), 1000 * GLOBALModule.GLOBAL.ROUND_LENGTH_SECONDS);

    }

    emitBunniesInit() {
        let bunniesInits = [];
        for (let bunny of this.bunniesList) {
            bunniesInits.push(bunny.getBunnyInit())
        }
        for (let player of this.players) {

            player.socket.emit("bunniesInits", bunniesInits);

        }


    }
    emitBunnyInvincible(id) {

        for (let player of this.players) {

            player.socket.emit("bunnyInvincible", id);

        }


    }
static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    checkForBunnyDestroyed() {
        for (let bunny of this.bunniesList) {
            if (bunny.deafeatedBy != null) {
                console.log("destroyed by " + bunny.deafeatedBy)

this.parentLobby.bunnyDefeated(bunny.deafeatedBy)
                let positionHistory = [];
                positionHistory.push(this.positionPool[Game.getRandomIntInclusive(0,this.positionPool.length-this.positionPool.length)]);
                this.bunniesList[this.bunniesList.indexOf(bunny)]= new bunnyModule.Bunny(positionHistory,
                    bunny.clientId, bunny.mapW,
                    bunny.mapH, bunny.color);

                this.emitBunnyInvincible(bunny.clientId);


            }

        }

    }

    emitBunnyDestroyed(clientId) {
        for (let iter of this.players) {
            iter.socket.emit("bunnyDestroyed", clientId)
        }
    }

    update() {
        for (let bunniesListElement of this.bunniesList) {
            bunniesListElement.update(this.map, this.bunniesList)
        }
        this.checkForBunnyDestroyed();

        let bunniesUpdates = [];
        for (let bunny of this.bunniesList) {
            bunniesUpdates.push(bunny.getBunnyUpdate())
        }
        for (let iter of this.players) {
            iter.socket.emit("bunniesUpdates", bunniesUpdates)
        }
    }

    destructor(winnerPlayerSocketId) {
        console.log("game ended, winner", winnerPlayerSocketId)
        //clearing timeout because game ended by player winning
        clearTimeout(this.gameLoopTimeoutId);

        for (let player of this.players) {
            player.socket.removeAllListeners("keyPressed");

        }
        clearInterval(this.gameLoopIntervalId)
        this.parentLobby.endGame(winnerPlayerSocketId);

    }
}

module.exports.Game = Game;
