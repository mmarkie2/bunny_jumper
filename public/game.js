let socketModule = require('socket.io');
let bunnyModule = require('./bunny')
let mapModule = require('./map')


class Game {
    constructor(players) {
        this.players=players;
        this.bunnysList = []
        this.mapBlocksW = 23
        this.mapBlocksH = 22
        this.blockSize = 30
        this.map = mapModule.Map.serverConstructor(this.mapBlocksW, this.mapBlocksH, this.blockSize)
        this.map.mapTemplate();
        

        let i=0;
        for (let player of players)
        {
            let positionHistory = [];
            positionHistory.push({
                x: (3+i) * this.blockSize,
                y: this.mapBlocksH * this.blockSize - 4 * this.blockSize
            });

            this.bunnysList.push(new bunnyModule.Bunny(positionHistory,
                player.socket.id, this.mapBlocksW * this.blockSize, this.mapBlocksH * this.blockSize, this))
        i=i+2;

            player.socket.emit("map", this.map)
            player.socket.emit("bunnysList", this.bunnysList)
            player.socket.on("keyPressed", (pressedKey) => {
                // console.log(socket.id + " pressed: ");
                // console.log(pressedKey);
                this.bunnysList.find(function (elem) {
                    return elem.clientId === player.socket.id;
                }).setPressedKey(pressedKey)



            });
        }




        setInterval(() => {
            this.update()
        }, 33);

    }

    checkForBunnyDestroyed() {
        for (let bunniesListElement of this.bunnysList) {
            if (bunniesListElement.deafeatedBy != null) {
                console.log("destroyed by " + bunniesListElement.deafeatedBy)
                let idx = this.bunnysList.indexOf(bunniesListElement)
                this.bunnysList.splice(idx, 1);


            }

        }

    }

    update() {
        for (let bunnysListElement of this.bunnysList) {
            bunnysListElement.update(this.map, this.bunnysList)
        }
        this.checkForBunnyDestroyed();

        for (let iter of this.players) {
            iter.socket.emit("bunnysList", this.bunnysList)
        }
    }

}

module.exports.Game = Game;