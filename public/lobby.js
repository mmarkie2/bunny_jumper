let playerModule=require('./player');
let gameModule=require('./game');
let playerSocketlessModule=require('./playerSocketless');
class Lobby {
    ownerId
    players
    roomId
    sockets
    game
    constructor(ownerPlayer) {


        this.players = [];
this.game=null;
        if (ownerPlayer) {
            let ownerSocket=  ownerPlayer.socket;
            this.ownerId = ownerSocket.id;
            this.roomId = this.generateRoomId();
           this.players.push(new playerModule.Player(ownerSocket.id,ownerSocket));
            this.sendLobbyInit(ownerSocket);
            ownerSocket.on("startGameRequest",  ()=> {
                this.game=new  gameModule.Game(this.players);

            });
        }

    }

    static clientConstructor() {
        let ret =new Lobby(null);
        socket.on("players",  (players)=> {
            ret.players=players;
            ret. clientShowPlayers(players);

        });
        document.getElementById("startGame").onclick = () => {
            socket.emit("startGameRequest");
        };
        socket.on("map", function (m) {
            console.log(m)
            console.log("map received")
            game = new Game(m)

        });
        socket.on("bunnysList", function (bunnysListJson) {
            console.log(typeof bunnysListJson)
            console.log(bunnysListJson)
            game.updateBunnysList(bunnysListJson)

        });

        return ret;
    }

    generateRoomId() {
        this.roomId = this.ownerId;
    }

    sendLobbyInit(socket) {

        socket.emit("lobbyInit");
       this. sendPlayers(socket)
    }
    sendPlayers(socket) {
     //change server players with socket field to lightweight  version
        let playersSocketless=[];
for (let player of this.players)
{
    playersSocketless.push(new playerSocketlessModule.PlayerSocketless(player.nick, player.socket.id))
}
        socket.emit("players",playersSocketless);

    }
    startGame() {
        for (let player of this.players)
        {

          player.socket.emit("startGame")
        }
    }

    addPlayer() {

    }

    clientShowLobbyScreen() {

    }

    clientShowPlayers() {
        for (let player of this.players)
        {

            $( "#players" ).append( "<p>"+player.nick+"</p>" );
        }
    }
}

module.exports.Lobby = Lobby;