import WebSocket from "ws";

import GameModule from "./game";

const port = 81;

const wss = new WebSocket.Server({ port }, () => console.log(`WebSocket server running at port ${port}`));
const gameModule = new GameModule(wss);
gameModule.run();
