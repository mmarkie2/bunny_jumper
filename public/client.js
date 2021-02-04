var socket = io.connect("http://localhost:4000/");


let game
let lobby;
let isPlayerCreated=false;
function createPlayer()
{
    if(isPlayerCreated===false)
    {
        socket.on("playerCreated", ()=>{
            isPlayerCreated=true;
        })
        socket.emit("createPlayerRequest",document.getElementById("nick").value );

    }

}
document.getElementById("createPlayer").onclick = () => {


    createPlayer();
};
document.getElementById("createLobby").onclick = () => {


    socket.emit("createLobbyRequest");
};
socket.on("lobbyInit", function () {
    lobby = Lobby.clientConstructor();

});



