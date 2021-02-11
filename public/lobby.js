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
    maxRounds
    roundsCounter = 0
isGameStarted=false
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
            this.colorPool=["#FF5733",
                "#FF33E6",
                "#E8F616",
                "#091A6A",]

            this.addPlayer( ownerPlayer);
            this.sendLobbyInit( this.ownerSocket);

this.startGameListener= ()=>
{
    this.isGameStarted=true
    this.startNewRound();
    this. ownerSocket.removeAllListeners("startGameRequest");
};
            this. ownerSocket.on("startGameRequest", this.startGameListener);
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
           ret. clientDisplayInGameMenu();
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
            playersSocketless.push(new playerSocketlessModule.PlayerSocketless(player.nick, player.id,player.color, player.score))
        }
        socket.emit("players", playersSocketless);

    }


    addPlayer(player) {
        let availableColor;
        let i=0;
        do
        {
            availableColor=this.colorPool[i]
            i++;
        }
        while(this.players.find(x=>x.color===availableColor))

        player.color=availableColor;
        this.players.push(player);
        this.sendLobbyInit(player.socket);
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
        if(this.players.length===4)
        {
            this.isGameStarted=true;
        }
    }

    endRound(winnerPlayerSocketId) {
        let winnerNick=null;
        if(winnerPlayerSocketId)
        {
            winnerNick= this.players.find(x=>x.socket.id===winnerPlayerSocketId) .nick
        }

        for (let playerIter of this.players) {
            playerIter.socket.emit("endRound",winnerNick)
        }
        this.updateScoreboard(winnerPlayerSocketId)
        if (this.roundsCounter < this.maxRounds) {
            console.log("Winner")
            setTimeout(()=>this.startNewRound(),1000);

            this.roundsCounter++;
        }
        else
        {
            this.endGame()
        }

    }
    endGame()
    {
        for (let player of this.players) {
            player.socket.emit("endGame")
        }
        let playAgainRequestListener= ()=>
        {
            console.log(" playAgainListener")
            this.ownerSocket.removeAllListeners("playAgainRequest")
            for (let player of this.players) {
                player.score=0;
            }
            for (let player of this.players) {
                this.emitPlayers(player.socket)
            }
            this.roundsCounter=0;
            this.startGameListener()
        }
       this.ownerSocket.on("playAgainRequest",playAgainRequestListener)

    }
    updateScoreboard(winnerPlayerSocketId)
    {
        this.players.find(x=>x.socket.id===winnerPlayerSocketId) && this.players.find(x=>x.socket.id===winnerPlayerSocketId).score++;
        for (let playerIter of this.players) {
            this.emitPlayers(playerIter.socket)
        }
    }
    clientShowRoundEndScreen(winnerPlayer)
    {

        $("#overCanvasDiv").empty();
        $("#overCanvasDiv").text(`Round winner: ${winnerPlayer}`);
        $("#overCanvasDiv").removeClass( "hiddenElement" );
        setTimeout(()=>{
            $("#overCanvasDiv").addClass( "hiddenElement" );
        },2000)
    }

    clientShowPlayers() {
        $("#players").empty();
        $("#players").append("<p  >" +"rank:"+ "</p>");
        for (let player of this.players) {

            $("#players").append("<p  class=\"btn btn-secondary disabled\" style='font-size:25px;color:"+player.color
                +"'>" + player.nick + player.id +"   score:   "+player.score+ "</p>");
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
    clientDisplayInGameMenu() {

        $("#menu").empty()
        $("#menu").append(

            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>")


        this.clientShowPlayers();
    }
    clientShowGameEndScreen()
    {

        $("#menu").empty()
        $("#menu").append(

            "<div id=\"players\"  class=\"border border-success rounded-lg\"></div>"
        +"<buuton id='playAgain' class='btn btn-success'>Play Again</buuton>")


        this.clientShowPlayers();
        $('#playAgain').click(()=>{
            this.socket.emit("playAgainRequest");
        })
    }
}

module.exports.Lobby = Lobby;