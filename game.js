export default class PlanetXGame {

    constructor(code) {
        this.code = code;
        this.players = [];
        this.seasons = ["spring", "summer", "autumn", "winter"];

        this.addPlayer("Player1", 1);
        this.addPlayer("Player2", 1);
        this.addPlayer("Player3", 1);
        this.addPlayer("Player4", 1);

        this.start();
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
        var xLoc = 8;
        var xPrediction;
        var preXLoc;
        var preObj;
        var postXLoc;
        var postObj;
        var theoryLocation;
        var research = ["The dwarf planet is not within 2 sectors of a comet.", "All the gas clouds are in a band of 4 sectors or less.", "At least one asteroid is adjacent to a comet.", "The dwarf planet is adjacent to an asteroid.", "At least one gas cloud is adjacent to the dwarf planet.", "At least one gas cloud is directly opposite an asteroid."];
        var locVal = [];
        for (var i = 0; i < 4; i++) {
            locVal[i][1] = i + 1;
            locVal[i][0] = 1;
        }
        var sector = [1, 2, 3, 4, 4, 3, 0, 4, 1, 1, 0, 1];
        //int[] sector = new int[12];
        /*for (int i = 0; i < 12; i++) {
            sector[i] = 4;
        } */

        while (!xFound) {

            Update.currentTurn(locVal[0][1]);
            switch (input.nextLine().toLowerCase()) {
                case "survey":
                    console.log("For what?");
                    var obj = input.nextInt();
                    console.log("Start Where?");
                    var sStart = input.nextInt();
                    console.log("End Where");
                    var sEnd = input.nextInt();
                    input.nextLine();
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
                    console.log("Choose Research");
                    console.log(research[input.nextInt()]);
                    input.nextLine();
                    locVal[0][0] += 1;
                    break;
                case "target":
                    console.log("Which Sector?");
                    var targSec = input.nextInt();
                    input.nextLine();
                    console.log("There is a " + sector[targSec - 1] + " in " + targSec);
                    locVal[0][0] += 4;
                    break;
                case "x":
                    console.log("Enter Location of Planet X");
                    xPrediction = input.nextInt();
                    preXLoc = xPrediction - 1;
                    if (preXLoc == 0) {
                        preXLoc += 12;
                    }
                    console.log("Enter object in sector " + preXLoc);
                    preObj = input.nextInt();
                    postXLoc = (xPrediction + 1) % 12;
                    if (postXLoc == 0) {
                        postXLoc += 12;
                    }
                    console.log("Enter object in sector " + postXLoc);
                    postObj = input.nextInt();
                    input.nextLine();
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
                System.out.print("Player " + locVal[i][1] + " : " + " in " + secNum + " with " + locVal[i][2] + " | ");
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
                    console.log("Player " + locVal[j][1] + ", Enter Theory Location");
                    theoryLocation = input.nextLine();
                    if ((!theoryLocation.isEmpty())) {
                        console.log("Enter Object in Location");
                        theoryObject = input.nextInt();
                        input.nextLine();
                        theories.add(new Theory(theoryObject, locVal[j][1], Integer.parseInt(theoryLocation)));
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
                        System.out.print(
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
                    console.log("Planet X is not within 3 sectors of the dwarf planet.");
                    hasCon = true;
                }
            }

            for (var i = Function.findIndex(locVal, finderOfX); i < 3; i++) {
                var a, b, c;
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
                console.log("Final Selection, Theory or X, Player " + locVal[i][1]);
                if (input.nextLine().toLowerCase().equals("theory")) {
                    for (var j = 0; j < 2; j++) {
                        console.log("Enter Theory Location");
                        theoryLocation = input.nextLine();
                        console.log("Enter Theory Object");
                        theoryObject = input.nextInt();
                        if (sector[Integer.parseInt(theoryLocation) - 1] == theoryObject) {
                            console.log("Your Theory is Correct");
                            locVal[i][2] += 3;
                        } else {
                            console.log("Your Theory is Incorrect");
                        }
                        input.nextLine();
                    }
                } else {
                    console.log("Enter Location of Planet X");
                    xLoc = input.nextInt();
                    preXLoc = xLoc - 1;
                    if (preXLoc == 0) {
                        preXLoc += 12;
                    }
                    console.log("Enter object in sector " + preXLoc);
                    preObj = input.nextInt();
                    postXLoc = (xLoc + 1) % 12;
                    if (postXLoc == 0) {
                        postXLoc += 12;
                    }
                    console.log("Enter object in sector " + postXLoc);
                    postObj = input.nextInt();
                    input.nextLine();
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

    currentTurn(turn){
        //Currently moving players number
        
    }

    playerInfo(){

    }

    actionResult(){

    }

    theoryTime(){

    }

    endgame(){

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

    sort(locVal) {

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

    search(start, range, obj, sector) {
        var amount = 0;
        start--;
        for (var i = 0; i < range; i++) {
            if (obj == sector[start + i]) {
                amount++;
            }
        }
        return amount;
    }

    findIndex(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][1] == element) {
                return i;
            }
        }
        return -1;
    }

    findIndex(array, element) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return i;
            }
        }
        return -1;
    }
}