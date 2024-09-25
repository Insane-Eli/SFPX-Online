import { WebSocketServer } from 'ws';
import { createServer } from "http";
import PlanetXGame from './game.js';
import { randomInt } from 'crypto';

import connect from 'connect';
import serveStatic from 'serve-static';
import { Console } from 'console';

class GameInstance {
    constructor(code, difficulty) {
        this.code = code;
        this.difficulty = difficulty;

        var printPrefix = "Game " + code + ": ";

        this.game = new PlanetXGame(code);

        this.wss = new WebSocketServer({ port: code });

        this.clients = [];

        var self = this;

        console.log(printPrefix + "Started with difficulty " + difficulty);

        this.wss.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                var msg = data.toString();
                console.log(printPrefix + 'received:', msg);
                ws.send("echo: " + msg);

                try {
                    var json = JSON.parse(msg);
                    if (json.cmd) {
                        switch (json.cmd) {
                            case 'join':

                                var nametaken = false;

                                self.game.players.forEach(player => {
                                    if (player.name == json.value) {
                                        nametaken = true;
                                    }
                                });

                                if (self.game.players.length >= 4) {
                                    ws.send(`{"error":"Game is full"}`);
                                    console.log(printPrefix + "Rejecting player " + json.value + " because game is full");
                                    ws.terminate();
                                } else if (nametaken) {
                                    ws.send(`{"error":"Username is taken"}`);
                                    console.log(printPrefix + "Rejecting player " + json.value + " because username is taken");
                                    ws.terminate();
                                } else {
                                    console.log(printPrefix + "Adding Player " + json.value);
                                    self.game.addPlayer(json.value, difficulty);
                                    self.clients.push(ws);

                                    self.broadcast(`{"players":` + JSON.stringify(self.game.players) + `}`);
                                }
                                break;

                            case 'leave':
                                console.log(printPrefix + "Removing Player " + json.player);
                                self.game.removePlayer(json.player);

                                console.log('Client ' + json.player + ' Disconnected from Planet X Game Server ' + code);
                                if (self.game.players.length == 0) {
                                    console.log("Deleting Game " + code + " because no players are connected");
                                    Instances.splice(Instances.indexOf(this), 1);
                                }

                                break;

                            case 'ready':
                                self.game.getPlayer(json.player).ready = json.value;
                                console.log(printPrefix + "Setting Player " + json.player + " ready to " + json.value);
                                self.broadcast(`{"players":` + JSON.stringify(self.game.players) + `}`);
                                break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                    // return;
                }
            });

            ws.send(`{"msg":"Connected to Planet X Game Server ${code}}"`);
            console.log('Client Connected to Planet X Game Server ' + code);
        });

    }

    broadcast(data) {
        this.clients.forEach(client => {
            client.send(data);
        });
    }

}

var Instances = [];

console.log("\
     _____ _            _____                     _      ______          \n\
    |_   _| |          /  ___|                   | |     |  ___|        \n\
      | | | |__   ___  \\ `--.  ___  __ _ _ __ ___| |__   | |_ ___  _ __ \n\
      | | | '_ \\ / _ \\  `--. \\/ _ \\/ _` | '__/ __| '_ \\  |  _/ _ \\| '__|\n\
      | | | | | |  __/ /\\__/ /  __/ (_| | | | (__| | | | | || (_) | |   \n\
      \\_/ |_| |_|\\___| \\____/ \\___|\\__,_|_|  \\___|_| |_| \\_| \\___/|_|   \n\
    ");
console.log("\
  ______   __         ______     __   __     ______     ______      __  __    \n\
 /\\  == \\ /\\ \\       /\\  __ \\   /\\ \"-.\\ \\   /\\  ___\\   /\\__  _\\    /\\_\\_\\_\\   \n\
 \\ \\  _-/ \\ \\ \\____  \\ \\  __ \\  \\ \\ \\-.  \\  \\ \\  __\\   \\/_/\\ \\/    \\/_/\\_\\/_  \n\
  \\ \\_\\    \\ \\_____\\  \\ \\_\\ \\_\\  \\ \\_\\\\\"\\_\\  \\ \\_____\\    \\ \\_\\      /\\_\\/\\_\\ \n\
   \\/_/     \\/_____/   \\/_/\\/_/   \\/_/ \\/_/   \\/_____/     \\/_/      \\/_/\\/_/ \n\
    ");

console.log("Starting Webpage");

connect()
    .use(serveStatic('../'))
    .listen(80, () => { /*console.log('Webpage Started on Port 8080')*/ });

//create a server object:
createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // console.log("Created new Game on port " + gamecode);

    let body = "";
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        // console.log("HTTP Recieved: " + body);

        if (body < 10) {

            var difficulty = body;

            if (difficulty) {
                var gamecode = randomInt(4001, 4999);
                var used = []

                Instances.forEach(element => {
                    used.push(element.code);
                });

                while (used.includes(gamecode)) {
                    gamecode = randomInt(4001, 4999);
                }

                Instances.push(new GameInstance(gamecode, difficulty));

                res.write('{"code":' + gamecode + '}'); //write a response to the client
            }
        } else {

            var exists = false;
            var full = false;
            Instances.forEach(element => {
                // used.push(element.code);

                if (element.code == parseInt(body)) {
                    exists = true;

                    console.log("Game " + body + " exists and has " + element.game.players.length + " players");

                    if (element.game.players.length >= 4) {
                        full = true;
                        res.write("{\"message\":\"Game is full\"}");
                    }
                }
            });

            if (!exists) {
                console.log("Game " + body + " does not exist");
                res.write("{\"message\":\"Game does not exist\"}");
            }

            if (!full && exists) {
                res.write('{"message":""}');
            }
        }

        res.end(); //end the response
    });

}).listen(4000); //the server object listens on port 4000
// console.log("Webpage Started at http://" + (http.address().address == "::" ? "localhost" : http.address().address) + ":" + 8080);
// console.log("Webpage Started at http://planetx.local");

console.log("Waiting for game to be created...");