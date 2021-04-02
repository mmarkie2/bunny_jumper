class PlayerSocketless {

    nick
    id
    score
    color

    constructor(nick, id, color, score) {

        this.nick = nick;
        this.id = id;
        this.color = color;
        this.score = score;
    }
}

module.exports.PlayerSocketless = PlayerSocketless;