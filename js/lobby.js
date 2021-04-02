let playerModule = require('./player');
let gameModule = require('./game');
let playerSocketlessModule = require('./public/playerSocketless');
let GLOBALModule = require('../GLOBAL')

class Lobby {
    ownerId
    players
    lobbyId
    sockets
    game
    maxRounds
    roundsCounter = 0
    isGameStarted = false
    colorPool
    ownerSocket

    constructor(ownerPlayer) {


        this.players = [];
        this.game = null;
        if (ownerPlayer) {
            this.maxRounds = GLOBALModule.GLOBAL.ROUNDS_MAX;

            this.ownerSocket = ownerPlayer.socket;
            this.ownerId = ownerPlayer.id;
            this.lobbyId = ownerPlayer.id;
            this.colorPool = ["#FF5733",
                "#FF33E6",
                "#E8F616",
                "#07070a",]

            this.addPlayer(ownerPlayer);
            this.sendLobbyInit(this.ownerSocket);

            this.startGameListener = () => {
                this.isGameStarted = true
                this.startNewRound();
                this.ownerSocket.removeAllListeners("startGameRequest");
            };
            this.ownerSocket.on("startGameRequest", this.startGameListener);
        }

    }

    startNewRound() {
        this.game = new gameModule.Game(this.players, this);
    }


    sendLobbyInit(socket) {
        let inviteUrl = GLOBALModule.GLOBAL.BASE_URL + "/" + this.lobbyId;
        socket.emit("lobbyInit", inviteUrl);
        this.emitPlayers(socket)
    }

    emitPlayers(socket) {
        //change server players with socket field to lightweight  version
        let playersSocketless = [];
        for (let player of this.players) {
            playersSocketless.push(new playerSocketlessModule.PlayerSocketless(player.nick, player.id, player.color, player.score))
        }
        socket.emit("players", playersSocketless);

    }


    addPlayer(player) {
        let availableColor;
        let i = 0;
        do {
            availableColor = this.colorPool[i]
            i++;
        }
        while (this.players.find(x => x.color === availableColor))

        player.color = availableColor;
        this.players.push(player);
        this.sendLobbyInit(player.socket);
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
        if (this.players.length === 4) {
            this.isGameStarted = true;
        }
    }

    endRound(winnerPlayerSocketId) {
        let winnerNick = null;
        if (winnerPlayerSocketId) {
            winnerNick = this.players.find(x => x.socket.id === winnerPlayerSocketId).nick
        }

        for (let playerIter of this.players) {
            playerIter.socket.emit("endRound", winnerNick)
        }
        this.updateScoreboard(winnerPlayerSocketId)
        if (this.roundsCounter < this.maxRounds) {
            console.log("Winner")
            setTimeout(() => this.startNewRound(), 1000);

            this.roundsCounter++;
        } else {
            this.endGame()
        }

    }

    endGame() {
        for (let player of this.players) {
            player.socket.emit("endGame")
        }
        let playAgainRequestListener = () => {
            console.log(" playAgainListener")
            this.ownerSocket.removeAllListeners("playAgainRequest")
            for (let player of this.players) {
                player.score = 0;
            }
            for (let player of this.players) {
                this.emitPlayers(player.socket)
            }
            this.roundsCounter = 0;
            this.startGameListener()
        }
        this.ownerSocket.on("playAgainRequest", playAgainRequestListener)

    }

    updateScoreboard(winnerPlayerSocketId) {
        this.players.find(x => x.socket.id === winnerPlayerSocketId) && this.players.find(x => x.socket.id === winnerPlayerSocketId).score++;
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
    }


}

module.exports.Lobby = Lobby;
