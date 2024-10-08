class PlanetXBackend {

    constructor(port) {
        this.serverIP = location.href.split("/")[2].split(":")[0];
        this.port = port;
        this.ws = null;
        if (this.port) {
            this.ws = new WebSocket(`ws://${this.serverIP}:${port}`);
        }
        this.name = null;
        this.difficulty = 0;
        this.onRecieve = () => { };
        this.onConnect = () => { console.log("Connected") };
        this.onDisconnect = () => { console.log("Disconnected") };
    }

    joinGame(code, name, difficulty) {
        this.ws = new WebSocket(`ws://${this.serverIP}:${code}`);
        this.port = code;
        this.name = name;
        this.difficulty = difficulty;

        this.ws.onopen = () => {
            this.onConnect();
            this.ws.send(`{"cmd": "join", "value": "${name}", "difficulty": ${difficulty}}`);
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
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: difficulty })
            .then((response) => response.text())
            .then((text) => {
                code = text;
            });
        return code;
    }

    send(data) {
        this.ws.send(data);
    }

    async checkGame(code) {
        var error = "";
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: code })
            .then(response => response.text())
            .then(data => {
                error = JSON.parse(data).message;
            });
        return error;
    }

    async reboot() {
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors', method: 'POST', headers: { 'Content-Type': 'application/json' }, body: "restart" }).then(() => { location.reload(); });
    }

}
