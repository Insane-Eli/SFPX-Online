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

}

class Player {
    constructor(name) {
        this.name = name;
    }
}