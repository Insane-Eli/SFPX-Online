export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
        this.seasons = ["spring", "summer", "autumn", "winter"];
    }

    addPlayer(name, difficulty) {
        var season = this.seasons[this.players.length];
        this.players.push(new Player(name, season, difficulty));
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

    start() {
        console.log("Game " + this.code + " started");
    }

}

class Player {
    constructor(name, season, difficulty) {
        this.name = name;
        this.ready = false;
        this.season = season;
        this.difficulty = difficulty;
    }
}