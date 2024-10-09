class PlanetXGame {
    constructor(code) {
        this.code = code;
        this.players = [];
        this.seasons = ["spring", "summer", "autumn", "winter"];
    }

    addPlayer(name, difficulty) {
        const season = this.seasons[this.players.length % this.seasons.length]; // To cycle through seasons if players > 4
        this.players.push(new Player(name, season, difficulty));
        console.log(`Player ${name} added with difficulty ${difficulty} in season ${season}`);
    }

    removePlayer(name) {
        const index = this.players.findIndex(player => player.name === name);
        if (index !== -1) {
            console.log(`Player ${this.players[index].name} removed`);
            this.players.splice(index, 1);
        } else {
            console.log(`Player ${name} not found`);
        }
    }

    getPlayer(name) {
        const player = this.players.find(player => player.name === name);
        if (player) {
            return player;
        } else {
            console.log(`Player ${name} not found`);
            return null;
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

    setReady() {
        this.ready = true;
        console.log(`Player ${this.name} is ready`);
    }
}

// Example usage in Node.js
const game = new PlanetXGame("X-123");

// Adding players
game.addPlayer("Eli", "hard");
game.addPlayer("Max", "medium");

// Getting player info
const eli = game.getPlayer("Eli");
console.log(eli);

// Removing a player
game.removePlayer("Max");

// Start the game
game.start();

