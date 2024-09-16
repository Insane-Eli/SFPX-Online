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

    async createGame() {
        var code = 0;
        await fetch(`http://${this.serverIP}:${4000}`, { mode: 'cors' }).then(data => {
            code = data.text();
        });
        return code;
    }

    send(data) {
        this.ws.send(data);
    }

}
