class PlayerSocketless {

    nick
    id
    score

    constructor(nick, id,score) {

        this.nick = nick;
        this.id = id;
        this.score=score;
    }
}

module.exports.PlayerSocketless = PlayerSocketless;