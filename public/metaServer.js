let lobby = require('./lobby')
let playerModule=require('./player');
var express = require('express');
let socket = require('socket.io');
const path = require('path');

class MetaServer {


    lobbys

    constructor() {
        // App setup
        this.app = express();

// Static files
        this.app.use(express.static('public'));
        this.app.set("view engine", "ejs");

        this.server =  this.app.listen(4000, function () {
            console.log('listening for requests on port 4000,');
        });
        this.io = socket( this.server);
        this.socketsList = [];
        this.players = [];
        this.lobbys = [];

        this.routesInit();

        this.io.on('connection', (socket) => {
            this.socketsList.push(socket)
            console.log('made socket connection', socket.id);
            socket.on("createPlayerRequest", (nick) => {

                this.players.push(new playerModule.Player(nick, socket,this.generateId()));
                socket.emit("playerCreated");


            });
            socket.on("createLobbyRequest", () => {
                console.log('lobby created for ', socket.id);
                let player=this.players.find(x => x.socket.id === socket.id);
                if (player)
                {
                    this.lobbys.push(new lobby.Lobby(player));
                }



            });
            socket.on("joinLobby", (lobbyId) => {


            });
        });


    }
    routesInit()
{
    this.app.get('/invite/:lobbyId', function (req, res) {
        let lobbyId = req.params.lobbyId;
        console.log('invite for ',lobbyId);

        res.render("indexMain", {lobbyId: lobbyId});
    });
    this.app.get('/', function (req, res) {


        res.render("indexMain" ,{lobbyId: "null"});
    });
    this.app.get('*',function (req, res) {
        res.render("indexMain" ,{lobbyId: "null"});
    });


}
   generateId()

   {
       let id;
       let isAlreadyUsed=false;
do
{
     id='_' + Math.random().toString(10).substr(2, -1);

    for(let player of this.players)
    {
        if (id===player.id)
        {
            isAlreadyUsed=true;
        }
    }
}

       while(isAlreadyUsed===true)
return id;
   }
}

module.exports.MetaServer = MetaServer;










