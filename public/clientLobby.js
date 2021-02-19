let playerModule = require('./player');
let gameModule = require('./game');
let playerSocketlessModule = require('../public/playerSocketless');
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

    ;

    static clientConstructor(inviteUrl, socket, isClientLobbyOwner) {

        let ret = new Lobby(null);
        ret.socket = socket;
        ret.socket.on("players", (players) => {
            ret.players = players;
            ret.clientShowPlayers(players);

        });


        ret.socket.on("map", (m) => {
            console.log(m)
            console.log("map received")
            ret.clientDisplayInGameMenu();
            ret.clientSideGame = new ClientSideGame(m, ret.socket);

        });
        ret.socket.on("endRound", (winnerNick) => {
            console.log("endRound received")
            ret.clientShowRoundEndScreen(winnerNick)
            ret.clientSideGame.destructor()

        });
        ret.socket.on("endGame", () => {
            console.log("endGame received")
            ret.clientShowGameEndScreen();

        });
        ret.clientDisplayLobbyMenu(inviteUrl, isClientLobbyOwner);

        return ret;
    }


    clientShowRoundEndScreen(winnerPlayer) {

        $("#overCanvasDiv").empty();
        $("#overCanvasDiv").text(`Round winner: ${winnerPlayer}`);
        $("#overCanvasDiv").removeClass("hiddenElement");
        setTimeout(() => {
            $("#overCanvasDiv").addClass("hiddenElement");
        }, 2000)
    }

    clientShowPlayers() {
        $("#players").empty();
        $("#players").append("<p  >" + "rank:" + "</p>");
        for (let player of this.players) {

            $("#players").append("<p  class=\"btn btn-secondary disabled\" style='font-size:25px;color:" + player.color
                + "'>" + player.nick + player.id + "   score:   " + player.score + "</p>");
        }
    }

    clientDisplayLobbyMenu(inviteUrl) {
        let visibility = 'visible'
        if (!isClientLobbyOwner) {
            visibility = 'hidden';
        }
        $("#menu").empty()
        $("#menu").append(
            "<div >invite url:<br><input id=\"inviteUrl\" >" +


            "<button id=\"copyInviteUrl\" class=\"btn btn-success\">copy invite url</button >\n" +
            "</div>\n" +
            "<button id=\"startGame\" class=\"btn btn-success\" style='visibility:" + visibility + "'> start Game</button>\n" +
            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>");

        $("#startGame").click(() => {
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

    clientDisplayInGameMenu() {

        $("#menu").empty()
        $("#menu").append(
            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>")


        this.clientShowPlayers();
    }

    clientShowGameEndScreen() {

        $("#menu").empty()
        $("#menu").append(
            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>"
            + "<buuton id='playAgain' class='btn btn-success'>Play Again</buuton>")


        this.clientShowPlayers();
        $('#playAgain').click(() => {
            this.socket.emit("playAgainRequest");
        })
    }
}

