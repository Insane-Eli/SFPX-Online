export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
    }

    addPlayer(name) {
        this.players.push(new Player(name));
    }

    removePlayer(name) {
        this.players.splice(this.players.indexOf(name), 1);
    }

    getPlayer(name) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].name == name) {
                return this.players[i];
            }
        }
    }

}

class Player {
    constructor(name) {
        this.name = name;
        this.ready = false;
    }
}