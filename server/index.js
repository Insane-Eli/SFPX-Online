import { WebSocketServer } from 'ws';
import { createServer } from "http";
import PlanetXGame from './game.js';
import { randomInt } from 'crypto';

class GameInstance {
    constructor(code) {
        this.code = code;

        var game = this.game = new PlanetXGame(code);
        // this.game = game;

        this.wss = new WebSocketServer({ port: code });

        this.clients = [];

        var self = this;

        this.wss.on('connection', function connection(ws) {
            ws.on('message', function message(data) {
                var msg = data.toString();
                console.log('received:', msg);
                ws.send("echo: " + msg);

                try {
                    var json = JSON.parse(msg);
                    if (json.cmd) {
                        switch (json.cmd) {
                            case 'join':

                                var nametaken = false;

                                game.players.forEach(player => {
                                    if (player.name == json.value) {
                                        nametaken = true;
                                    }
                                });

                                if (game.players.length >= 4) {
                                    ws.send(`{"error":"Game is full"}`);
                                    console.log("Rejecting player " + json.value + " because game is full");
                                    ws.terminate();
                                } else if (nametaken) {
                                    ws.send(`{"error":"Username is taken"}`);
                                    console.log("Rejecting player " + json.value + " because username is taken");
                                    ws.terminate();
                                } else {
                                    console.log("Adding Player " + json.value);
                                    game.addPlayer(json.value);
                                    self.clients.push(ws);
                                    // console.log('{"players":' + JSON.stringify(game.players) + '}');

                                    self.broadcast(`{"players":` + JSON.stringify(game.players) + `}`);
                                }
                                break;

                            case 'leave':
                                console.log("Removing Player " + json.player);
                                game.removePlayer(json.player);

                                console.log('Client ' + json.player + ' Disconnected from Planet X Game Server ' + code);
                                if (game.players.length == 0) {
                                    console.log("Deleting Game " + code + " because no players are connected");
                                    Instances.splice(Instances.indexOf(this), 1);
                                }

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

console.log("Waiting for game to be created...");

//create a server object:
createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    var gamecode = randomInt(4000, 5000);
    var used = []

    Instances.forEach(element => {
        used.push(element.code);
    });

    while (used.includes(gamecode)) {
        gamecode = randomInt(4000, 5000);
    }

    Instances.push(new GameInstance(gamecode));

    res.write('{"code":' + gamecode + '}'); //write a response to the client
    console.log("Created new Game on port " + gamecode);


    res.end(); //end the response
}).listen(4000); //the server object listens on port 8080
