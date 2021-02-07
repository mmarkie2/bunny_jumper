let socketModule = require('socket.io');
let bunnyModule = require('./bunny')
let mapModule = require('./map')


class Game {
    gameLoopIntervalId
    bunniesList
    mapBlocksW
    mapBlocksH
    blockSize
    map

    constructor(players, parentLobby) {
        this.players = players;
        this.parentLobby = parentLobby;
        this.bunniesList = []
        this.mapBlocksW = 23
        this.mapBlocksH = 22
        this.blockSize = 30
        this.map = mapModule.Map.serverConstructor(this.mapBlocksW, this.mapBlocksH, this.blockSize)
        this.map.mapTemplate();


        let i = 0;
        for (let player of players) {
            let positionHistory = [];
            positionHistory.push({
                x: (3 + i) * this.blockSize,
                y: this.mapBlocksH * this.blockSize - 4 * this.blockSize
            });

            this.bunniesList.push(new bunnyModule.Bunny(positionHistory,
                player.socket.id, this.mapBlocksW * this.blockSize, this.mapBlocksH * this.blockSize, this))
            i = i + 2;

            player.socket.emit("map", this.map)
            player.socket.emit("bunniesList", this.bunniesList)
            player.socket.on("keyPressed", (pressedKey) => {
                let a;
                this.bunniesList.find(x => x.clientSocketId === player.socket.id).setPressedKey(pressedKey)

            })
        }


        this.gameLoopIntervalId = setInterval(() => {
            this.update()
        }, 33);

        //end game if longer then 5 minute
        setTimeout(() => this.destructor(null), 1000 * 7);

    }

    checkForBunnyDestroyed() {
        for (let bunniesListElement of this.bunniesList) {
            if (bunniesListElement.deafeatedBy != null) {
                console.log("destroyed by " + bunniesListElement.deafeatedBy)
                let idx = this.bunniesList.indexOf(bunniesListElement)
                this.bunniesList.splice(idx, 1);
                if (this.bunniesList.length == 1) {
                    this.destructor(this.bunniesList[0].clientSocketId);
                }

            }

        }

    }

    update() {
        for (let bunniesListElement of this.bunniesList) {
            bunniesListElement.update(this.map, this.bunniesList)
        }
        this.checkForBunnyDestroyed();

        for (let iter of this.players) {
            iter.socket.emit("bunniesList", this.bunniesList)
        }
    }

    destructor(winnerPlayerSocketId) {
        console.log("game ended, winner", winnerPlayerSocketId)

        for (let player of this.players) {
            player.socket.removeAllListeners("keyPressed");
        }
        clearInterval(this.gameLoopIntervalId)
        this.parentLobby.endRound(winnerPlayerSocketId);

    }
}

module.exports.Game = Game;