class Player {

    nick
    socket
    id
    score
color
    constructor(nick, socket, id,color) {
        this.nick = nick;
        this.socket = socket;
        this.id = id;
        this.color = color;
        this.score=0;
    }
}

module.exports.Player = Player;