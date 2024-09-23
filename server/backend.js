class PlanetXBackend {

    constructor() {
        this.serverIP = "localhost";
        this.ws = null;
        this.onRecieve = () => { };
        this.onConnect = () => { console.log("Connected") };
        this.onDisconnect = () => { console.log("Disconnected") };
    }

    joinGame(code, name) {
        this.ws = new WebSocket(`ws://${this.serverIP}:${code}`);

        this.ws.onopen = () => {
            this.onConnect();
            this.ws.send(`{"cmd": "join", "value": "${name}"}`);
        }

        this.ws.onmessage = (data) => {
            this.onRecieve(data.data);
        }

        this.ws.onclose = () => {
            this.onDisconnect();
        }
    }

    async createGame(difficulty) {
        var code = 0;
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: difficulty }).then(data => {
            code = data.text();
        });
        return code;
    }

    send(data) {
        this.ws.send(data);
    }

    async gameExists(code) {
        var exists = false;
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: code }).then(async data => {
            var data = await data.text();
            exists = JSON.parse(data).exists;
        });
        return exists;
    }

}
