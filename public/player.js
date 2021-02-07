class Player {

    nick
    socket
    id
    score

    constructor(nick, socket, id) {
        this.nick = nick;
        this.socket = socket;
        this.id = id;
        this.score=0;
    }
}

module.exports.Player = Player;