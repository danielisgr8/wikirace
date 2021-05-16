import WebSocket from "ws";

import GameModule from "./game";

const port = (process.env.PORT || 3002) as number;

const wss = new WebSocket.Server({ port }, () => console.log(`WebSocket server running at port ${port}`));
const gameModule = new GameModule(wss);
gameModule.run();
