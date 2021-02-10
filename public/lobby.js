let playerModule = require('./player');
let gameModule = require('./game');
let playerSocketlessModule = require('./playerSocketless');
let GLOBALModule=require('./../GLOBAL')
class Lobby {
    ownerId
    players
    lobbyId
    sockets
    game
    maxRounds = 5
    roundsCounter = 0
isGameStarted=false

    constructor(ownerPlayer) {


        this.players = [];
        this.game = null;
        if (ownerPlayer) {
            let ownerSocket = ownerPlayer.socket;
            this.ownerId = ownerPlayer.id;
            this.lobbyId = ownerPlayer.id;
            this.players.push(ownerPlayer);
            this.sendLobbyInit(ownerSocket);


            ownerSocket.on("startGameRequest", () => {
                this.isGameStarted=true
                this.startNewRound();
                ownerSocket.removeAllListeners("startGameRequest");
            });
        }

    }

    startNewRound() {
        this.game = new gameModule.Game(this.players, this);
    }

    static clientConstructor(inviteUrl, socket, isClientLobbyOwner) {

        let ret = new Lobby(null);
        ret.socket=socket;
        ret.socket.on("players", (players) => {
            ret.players = players;
            ret.clientShowPlayers(players);

        });


        ret.socket.on("map", (m) => {
            console.log(m)
            console.log("map received")

            ret.clientSideGame = new ClientSideGame(m, ret.socket);

        });
        ret.socket.on("endRound", () => {
            console.log("endRound received")
            ret.clientSideGame.destructor()

        });
        ret.clientDisplayLobbyMenu(inviteUrl,isClientLobbyOwner);

        return ret;
    }


    sendLobbyInit(socket) {
        let inviteUrl = GLOBALModule.GLOBAL.BASE_URL+"/invite/" + this.lobbyId;
        socket.emit("lobbyInit", inviteUrl);
        this.emitPlayers(socket)
    }

    emitPlayers(socket) {
        //change server players with socket field to lightweight  version
        let playersSocketless = [];
        for (let player of this.players) {
            playersSocketless.push(new playerSocketlessModule.PlayerSocketless(player.nick, player.id, player.score))
        }
        socket.emit("players", playersSocketless);

    }


    addPlayer(player) {
        this.players.push(player);
        this.sendLobbyInit(player.socket);
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
    }

    endRound(winnerPlayerSocketId) {
        for (let playerIter of this.players) {
            playerIter.socket.emit("endRound")
        }
        this.updateScoreboard(winnerPlayerSocketId)
        if (this.roundsCounter < this.maxRounds) {
            console.log("Winner")
            this.startNewRound();
            this.roundsCounter++;
        }

    }
    updateScoreboard(winnerPlayerSocketId)
    {
        this.players.find(x=>x.socket.id===winnerPlayerSocketId) && this.players.find(x=>x.socket.id===winnerPlayerSocketId).score++;
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
    }
    clientShowLobbyScreen() {

    }

    clientShowPlayers() {
        $("#players").empty();
        $("#players").append("<p  >" +"rank:"+ "</p>");
        for (let player of this.players) {

            $("#players").append("<p  class=\"btn btn-secondary disabled\">" + player.nick + player.id +"   score:   "+player.score+ "</p>");
        }
    }

    clientDisplayLobbyMenu(inviteUrl) {
        let visibility='visible'
        if(!isClientLobbyOwner)
        {
          visibility='hidden';
        }
        $("#menu").empty()
        $("#menu").append(
            "<div >invite url:<br><input id=\"inviteUrl\" >" +


            "<button id=\"copyInviteUrl\" class=\"btn btn-success\">copy invite url</button >\n" +
            "</div>\n" +
            "<button id=\"startGame\" class=\"btn btn-success\" style='visibility:" +visibility+"'> start Game</button>\n" +
            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>");

        $("#startGame").click( () => {
            this.socket.emit("startGameRequest");
        })
        $("#inviteUrl").val(inviteUrl);
        $("#copyInviteUrl").click(() => {
            /* Get the text field */
            let copyText = document.getElementById("inviteUrl");

            /* Select the text field */
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */

            /* Copy the text inside the text field */
            document.execCommand("copy");
        })

    }
}

module.exports.Lobby = Lobby;