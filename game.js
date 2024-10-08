import { randomInt } from 'crypto';
import fs from 'fs';
import readline from 'readline';

function question(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

var gamepresets = JSON.parse(fs.readFileSync('./gamepresets/output.json', 'utf8'));

export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
        this.seasons = ["spring", "summer", "autumn", "winter"];
        this.gamedata = gamepresets[randomInt(0, gamepresets.length - 1)];
        // console.log(this.gamedata);

        // this.addPlayer("Player1", 1);
        // this.addPlayer("Player2", 1);
        // this.addPlayer("Player3", 1);
        // this.addPlayer("Player4", 1);

        // this.start();
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

    async start() {
        console.log("Game " + this.code + " started");

        // ArrayList<Theory> theories = new ArrayList<>();
        var theories = [];

        var xFound = false;
        var hasCon = false;
        var correct = false;
        var start;
        var end;
        var lastStart = 1;
        var theoAmount = 0;
        var finderOfX = -1;
        var theoryObject;
        // var xLoc = 8;
        var xLoc = parseInt(this.gamedata.planetx);
        var xPrediction;
        var preXLoc;
        var preObj;
        var postXLoc;
        var postObj;
        var theoryLocation;
        // var research = ["The dwarf planet is not within 2 sectors of a comet.", "All the gas clouds are in a band of 4 sectors or less.", "At least one asteroid is adjacent to a comet.", "The dwarf planet is adjacent to an asteroid.", "At least one gas cloud is adjacent to the dwarf planet.", "At least one gas cloud is directly opposite an asteroid."];
        var research = [this.gamedata.research.A.content, this.gamedata.research.B.content, this.gamedata.research.C.content, this.gamedata.research.D.content, this.gamedata.research.E.content, this.gamedata.research.F.content];
        var locVal = [];
        for (var i = 0; i < 4; i++) {
            // locVal[i][1] = i + 1;
            // locVal[i][0] = 1;
            locVal.push([1, i + 1]);
        }
        var itemmap = {"meteor": 0, "asteroid": 1, "dwarf": 2, "gas": 3, "empty": 4};
        // var sector = [1, 2, 3, 4, 4, 3, 0, 4, 1, 1, 0, 1];
        var sector = this.gamedata.sectors.map(x => itemmap[x]);
        //int[] sector = new int[12];
        /*for (int i = 0; i < 12; i++) {
            sector[i] = 4;
        } */

        while (!xFound) {

            Update.currentTurn(locVal[0][1]);
            // switch (input.nextLine().toLowerCase()) {
            switch (String(await question()).toLowerCase()) {
                case "survey":
                    // console.log("For what?");
                    // var obj = input.nextInt();
                    var obj = parseInt(await question("For what?"));
                    // console.log("Start Where?");
                    // var sStart = input.nextInt();
                    var sStart = parseInt(await question("Start Where?"));
                    // console.log("End Where");
                    // var sEnd = input.nextInt();
                    var sEnd = parseInt(await question("End Where?"));
                    // input.nextLine();
                    var range = 0;
                    var tsStart = sStart;
                    while (tsStart != (sEnd + 1) % 12) {
                        tsStart = (tsStart + 1) % 12;
                        range++;
                    }
                    if (range < 4) {
                        locVal[0][0] += 4;
                    } else {
                        locVal[0][0] += 3;
                    }
                    var amount = Function.search(sStart, range, obj, sector);
                    console.log("Your survey has found " + amount);
                    break;
                case "research":
                    // console.log("Choose Research");
                    // console.log(research[input.nextInt()]);
                    console.log(research[parseInt(await question("Choose Research")) - 1]);
                    // input.nextLine();
                    locVal[0][0] += 1;
                    break;
                case "target":
                    // console.log("Which Sector?");
                    // var targSec = input.nextInt();
                    var targSec = parseInt(await question("Which Sector?"));
                    // input.nextLine();
                    console.log("There is a " + sector[targSec - 1] + " in " + targSec);
                    locVal[0][0] += 4;
                    break;
                case "x":
                    // console.log("Enter Location of Planet X");
                    // xPrediction = input.nextInt();
                    xPrediction = parseInt(await question("Enter Location of Planet X"));
                    preXLoc = xPrediction - 1;
                    if (preXLoc == 0) {
                        preXLoc += 12;
                    }
                    // console.log("Enter object in sector " + preXLoc);
                    // preObj = input.nextInt();
                    preObj = parseInt(await question("Enter object in sector " + preXLoc));
                    postXLoc = (xPrediction + 1) % 12;
                    if (postXLoc == 0) {
                        postXLoc += 12;
                    }
                    // console.log("Enter object in sector " + postXLoc);
                    // postObj = input.nextInt();
                    postObj = parseInt(await question("Enter object in sector " + postXLoc));
                    // input.nextLine();
                    if (preObj == sector[preXLoc - 1] && postObj == sector[postXLoc - 1]
                        && xPrediction == xLoc) {
                        console.log("You have found Planet X");
                        finderOfX = locVal[0][1];
                        locVal[0][2] += 10;
                        xFound = true;
                    } else {
                        console.log("You have failed to find Planet X");
                    }
                    locVal[0][0] += 5;
            }

            Function.sort(locVal);
            for (var i = 0; i < 4; i++) {

                var secNum = locVal[i][0] % 12;
                if (secNum == 0) {
                    secNum += 12;
                }
                process.stdout.write("Player " + locVal[i][1] + " : " + " in " + secNum + " with " + locVal[i][2] + " | ");
            }
            start = locVal[0][0] % 12;
            if (start == 0) {
                start = 12;
            }
            end = (start + 5) % 12;
            if (end == 0) {
                end = 12;
            }
            console.log("Visible Sectors: " + start + " - " + end);

            for (var i = 1; i <= 10; i += 3) {
                for (var j = i; j <= locVal[0][0]; j += 12) {
                    if (j > lastStart) {
                        theoAmount++;
                    }
                }
            }
            for (var i = 0; i < theoAmount; i++) {
                for (var j = 0; j < 4; j++) {
                    // console.log("Player " + locVal[j][1] + ", Enter Theory Location");
                    // theoryLocation = input.nextLine();
                    theoryLocation = await question("Player " + locVal[j][1] + ", Enter Theory Location");
                    if ((theoryLocation !== "") && (theoryLocation !== null)) {
                        // console.log("Enter Object in Location");
                        // theoryObject = input.nextInt();
                        theoryObject = parseInt(theoryLocation);
                        // input.nextLine();
                        theories.push(new Theory(theoryObject, locVal[j][1], parseInt(theoryLocation)));
                    }

                    theories.forEach((theory) => { theory.position -= 1 });

                    for (var j = 1; j < 13; j++) {
                        theories.forEach((theory) => {
                            if ((theory.position == 0 || correct) && theory.sector == j) {
                                if (theory.type == sector[j - 1]) {
                                    console.log("Player " + theory.player + " is Correct, " + theory.type
                                        + " is in " + theory.sector);
                                    locVal[Function.findIndex(locVal, theory.player)][2] += 3;
                                    correct = true;
                                    if (theory.position == 0) {
                                        locVal[Function.findIndex(locVal, theory.player)][2]++;
                                    }
                                } else {
                                    console.log("Player " + theory.player + " is Incorrect, " + theory.type
                                        + "is not in " + theory.sector);
                                    locVal[Function.findIndex(locVal, theory.player)][0] += 1;
                                }
                            }
                        });
                    }
                    Function.sort(locVal);
                    for (var j = 0; j < 4; j++) {
                        var secNum = locVal[j][0] % 12;
                        if (secNum == 0) {
                            secNum += 12;
                        }
                        process.stdout.write(
                            "Player " + locVal[j][1] + " : " + " in " + secNum + " with " + locVal[j][2] + " | ");
                    }
                    start = locVal[0][0] % 12;
                    if (start == 0) {
                        start = 12;
                    }
                    end = (start + 5) % 12;
                    if (end == 0) {
                        end = 12;
                    }
                    console.log("Visible Sectors: " + start + " - " + end);
                }

                lastStart = locVal[0][0];
                theoAmount = 0;

                if (locVal[0][0] > 12 && !hasCon) {
                    // console.log("Planet X is not within 3 sectors of the dwarf planet.");
                    console.log(this.gamedata.research.X1.content);
                    hasCon = true;
                }
            }

            for (var i = Function.findIndex(locVal, finderOfX); i < 3; i++) {
                if (i == -1)
                    continue;
                var a, b, c;
                console.log(i, locVal);
                a = locVal[i + 1][0];
                b = locVal[i + 1][1];
                c = locVal[i + 1][2];
                locVal[i + 1][0] = locVal[i][0];
                locVal[i + 1][0] = locVal[i][1];
                locVal[i + 1][0] = locVal[i][2];
                locVal[i][0] = a;
                locVal[i][1] = b;
                locVal[i][2] = c;
            }
            for (var i = 0; i < 3; i++) {
                // console.log("Final Selection, Theory or X, Player " + locVal[i][1]);
                // if (input.nextLine().toLowerCase().equals("theory")) {
                if (String(await question("Final Selection, Theory or X, Player " + locVal[i][1])).toLowerCase() == "theory") {
                    for (var j = 0; j < 2; j++) {
                        // console.log("Enter Theory Location");
                        // theoryLocation = input.nextLine();
                        theoryLocation = await question("Enter Theory Location");
                        // console.log("Enter Theory Object");
                        // theoryObject = input.nextInt();
                        theoryObject = parseInt(theoryLocation);
                        if (sector[parseInt(theoryLocation) - 1] == theoryObject) {
                            console.log("Your Theory is Correct");
                            locVal[i][2] += 3;
                        } else {
                            console.log("Your Theory is Incorrect");
                        }
                        // input.nextLine();
                    }
                } else {
                    // console.log("Enter Location of Planet X");
                    // xLoc = input.nextInt();
                    xLoc = parseInt(await question("Enter Location of Planet X"));
                    preXLoc = xLoc - 1;
                    if (preXLoc == 0) {
                        preXLoc += 12;
                    }
                    // console.log("Enter object in sector " + preXLoc);
                    // preObj = input.nextInt();
                    preObj = parseInt(await question("Enter object in sector " + preXLoc));
                    postXLoc = (xLoc + 1) % 12;
                    if (postXLoc == 0) {
                        postXLoc += 12;
                    }
                    // console.log("Enter object in sector " + postXLoc);
                    // postObj = input.nextInt();
                    postObj = parseInt(await question("Enter object in sector " + postXLoc));
                    // input.nextLine();
                    if (preObj == sector[preXLoc - 1] && postObj == sector[postXLoc - 1]
                        && xLoc - 1 == Function.findIndex(sector, 5)) {
                        console.log("You have found Planet X");
                        locVal[0][2] += (locVal[3][0] - locVal[i][0]) * 2;
                    } else {
                        console.log("You have failed to find Planet X");
                    }
                }
            }
            for (var i = 0; i < 4; i++) {
                locVal[i][0] = locVal[i][1];
            }
            Function.sort(locVal);
            for (var i = 0; i < 4; i++) {
                console.log("Player " + locVal[i][1] + " Has " + locVal[i][2] + " Points");
            }
            console.log("The Winner is Player " + locVal[0][1]);
        }

    }
}

class Update {

    // make methods static to avoid having to create a new object

    static currentTurn(turn){
        //Currently moving players number
        
    }

    static playerInfo(){

    }

    static actionResult(){

    }

    static theoryTime(){

    }

    static endgame(){

    }

}

class Recieve {

    playerAction(){

    }

    theory(){

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

class Theory {

    constructor(type, player, sector) {
        this.position = 3;
        this.type = type;
        this.player = player;
        this.sector = sector;
    }
}

class Function {

    static sort(locVal) {

        var a, b, c;
        var d = true;

        while (d) {

            d = false;

            for (var i = 0; i < 3; i++) {

                if (locVal[i][0] > locVal[i + 1][0]) {

                    a = locVal[i][0];
                    b = locVal[i][1];
                    c = locVal[i][2];
                    locVal[i][0] = locVal[i + 1][0];
                    locVal[i][1] = locVal[i + 1][1];
                    locVal[i][2] = locVal[i + 1][2];
                    locVal[i + 1][0] = a;
                    locVal[i + 1][1] = b;
                    locVal[i + 1][2] = c;
                    d = true;
                }
            }
        }
        return locVal;
    }

    static search(start, range, obj, sector) {
        var amount = 0;
        start--;
        for (var i = 0; i < range; i++) {
            if (obj == sector[start + i]) {
                amount++;
            }
        }
        return amount;
    }

    static findIndex(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][1] == element) {
                return i;
            }
        }
        return -1;
    }
}

new PlanetXGame(4001);