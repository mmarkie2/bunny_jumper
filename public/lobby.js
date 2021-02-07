let playerModule = require('./player');
let gameModule = require('./game');
let playerSocketlessModule = require('./playerSocketless');

class Lobby {
    ownerId
    players
    lobbyId
    sockets
    game
maxRounds=5
    roundsCounter=0
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
               this. startNewGame();

            });
        }

    }
startNewGame()
{
    this.game = new gameModule.Game(this.players,this);
}
    static clientConstructor(inviteUrl,socket) {
        this.socket=socket;
        let ret = new Lobby(null);
        this.socket.on("players", (players) => {
            ret.players = players;
            ret.clientShowPlayers(players);

        });
        document.getElementById("startGame").onclick = () => {
            this.socket.emit("startGameRequest");
        };
        $("#inviteUrl").val(inviteUrl);
        this.socket.on("map",  (m)=> {
            console.log(m)
            console.log("map received")

           this.clientSideGame=  new ClientSideGame(m, this.socket);

        });
        this.socket.on("endRound",  ()=> {
            console.log("endRound received")
            this.clientSideGame.destructor()

        });


        return ret;
    }


    sendLobbyInit(socket) {
let inviteUrl="http://127.0.0.1:4000/invite/"+this.lobbyId;
        socket.emit("lobbyInit",inviteUrl);
        this.sendPlayers(socket)
    }

    sendPlayers(socket) {
        //change server players with socket field to lightweight  version
        let playersSocketless = [];
        for (let player of this.players) {
            playersSocketless.push(new playerSocketlessModule.PlayerSocketless(player.nick, player.id))
        }
        socket.emit("players", playersSocketless);

    }



    addPlayer(player ) {
        this.players.push(player);
        this.sendLobbyInit(player.socket);
        for (let playerIter of this.players) {
            this.sendPlayers(playerIter.socket)
        }
    }
    endRound(winnerPlayerSocketId)
    {
        for (let playerIter of this.players) {
            playerIter.socket.emit("endRound")
        }
        if( this.roundsCounter<this.maxRounds)
        {
            console.log("Winner")
           this.startNewGame();
            this.roundsCounter++;
        }

    }
    clientShowLobbyScreen() {

    }

    clientShowPlayers() {
        $("#players").empty();
        for (let player of this.players) {

            $("#players").append("<p>" + player.nick +  player.id+"</p>");
        }
    }
    clientDisplayLobbyMenu()
    {

    }
}

module.exports.Lobby = Lobby;