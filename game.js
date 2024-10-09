export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
        this.sectors = Array(12).fill(0).map((_, i) => i + 1); // 12 sectors
        this.planetXLocation = Math.floor(Math.random() * 12) + 1; // Random sector for Planet X
        this.research = [
            "The dwarf planet is not within 2 sectors of a comet.",
            "All the gas clouds are in a band of 4 sectors or less.",
            "At least one asteroid is adjacent to a comet.",
            "The dwarf planet is adjacent to an asteroid.",
            "At least one gas cloud is adjacent to the dwarf planet.",
            "At least one gas cloud is directly opposite an asteroid."
        ];
        this.playerTurns = 0; // Track player turns
    }

    // Adds a player to the game
    addPlayer(name, difficulty) {
        var season = this.getSeason();
        this.players.push(new Player(name, season, difficulty));
    }

    // Get the current season for the next player
    getSeason() {
        const seasons = ["Spring", "Summer", "Autumn", "Winter"];
        return seasons[this.players.length % 4];
    }

    // Remove a player
    removePlayer(name) {
        const index = this.players.findIndex(p => p.name === name);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    }

    // Start the game
    start() {
        console.log(`Game ${this.code} has started!`);
        this.takeTurns();
    }

    // Taking turns by cycling through the players
    takeTurns() {
        while (!this.isPlanetXFound()) {
            let currentPlayer = this.players[this.playerTurns % this.players.length];
            console.log(`${currentPlayer.name}'s turn. They are in the ${currentPlayer.season} season.`);
            
            // Example of possible action - survey, research, or find Planet X
            const action = prompt("Choose action: survey, research, target, x");
            switch (action.toLowerCase()) {
                case "survey":
                    this.handleSurvey(currentPlayer);
                    break;
                case "research":
                    this.handleResearch(currentPlayer);
                    break;
                case "target":
                    this.handleTarget(currentPlayer);
                    break;
                case "x":
                    this.handlePlanetXGuess(currentPlayer);
                    break;
                default:
                    console.log("Invalid action. Try again.");
            }
            this.playerTurns++;
        }
        this.declareWinner();
    }

    // Survey action
    handleSurvey(player) {
        const obj = parseInt(prompt("Survey for object type: "));
        const startSector = parseInt(prompt("Survey start sector: "));
        const endSector = parseInt(prompt("Survey end sector: "));

        const range = this.calculateRange(startSector, endSector);
        const amount = this.searchSectors(startSector, range, obj);

        console.log(`${player.name} has found ${amount} objects.`);
        player.points += range < 4 ? 4 : 3;
    }

    // Research action
    handleResearch(player) {
        const researchIndex = parseInt(prompt("Choose research number (0-5): "));
        console.log(this.research[researchIndex]);
        player.points += 1;
    }

    // Target action
    handleTarget(player) {
        const sector = parseInt(prompt("Target which sector?"));
        console.log(`There is a ${this.sectors[sector - 1]} object in sector ${sector}`);
        player.points += 4;
    }

    // Guess for Planet X location
    handlePlanetXGuess(player) {
        const guess = parseInt(prompt("Enter location of Planet X:"));
        const preXLoc = this.adjustSector(guess - 1);
        const postXLoc = this.adjustSector((guess + 1) % 12);

        const preObj = parseInt(prompt(`Enter object in sector ${preXLoc}`));
        const postObj = parseInt(prompt(`Enter object in sector ${postXLoc}`));

        if (preObj === this.sectors[preXLoc - 1] && postObj === this.sectors[postXLoc - 1] && guess === this.planetXLocation) {
            console.log("You have found Planet X!");
            player.points += 10;
            player.foundPlanetX = true;
        } else {
            console.log("You failed to find Planet X.");
            player.points += 5;
        }
    }

    // Check if Planet X is found by any player
    isPlanetXFound() {
        return this.players.some(player => player.foundPlanetX);
    }

    // Declare the winner of the game
    declareWinner() {
        const winner = this.players.reduce((max, player) => (player.points > max.points ? player : max), this.players[0]);
        console.log(`The winner is ${winner.name} with ${winner.points} points!`);
    }

    // Helper to calculate range between two sectors
    calculateRange(start, end) {
        let range = 0;
        let current = start;
        while (current !== (end + 1) % 12) {
            current = (current + 1) % 12;
            range++;
        }
        return range;
    }

    // Helper to search sectors for a specific object
    searchSectors(start, range, obj) {
        let count = 0;
        for (let i = 0; i < range; i++) {
            if (this.sectors[(start + i) % 12] === obj) {
                count++;
            }
        }
        return count;
    }

    // Adjust sector to wrap around 12
    adjustSector(sector) {
        return sector === 0 ? 12 : sector;
    }

}

// Player class definition
class Player {
    constructor(name, season, difficulty) {
        this.name = name;
        this.season = season;
        this.difficulty = difficulty;
        this.points = 0;
        this.foundPlanetX = false;
    }
}
