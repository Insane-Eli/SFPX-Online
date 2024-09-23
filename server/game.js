export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
        this.seasons = ["winter", "spring", "summer", "autumn"];
    }

    addPlayer(name) {
        var season = this.seasons[this.players.length];
        this.players.push(new Player(name, season));
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
    constructor(name, season) {
        this.name = name;
        this.ready = false;
        this.season = season;
    }
}