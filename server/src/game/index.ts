import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

import WebSocketEventManager from "../networking/websocketEventManager";
import GameState from "./state/gameState";
import PregameModule from "./pregame";
import { wsEvents } from "wikirace-shared";

class GameModule {
  private wsem: WebSocketEventManager;
  private state: GameState;

  public constructor(wss: WebSocket.Server) {
    this.wsem = new WebSocketEventManager(wss, true);
    this.state = new GameState(uuidv4());
    this.wsem.setSessionID(this.state.sessionId);
  }

  public run(): void {
    const pregameModule = new PregameModule(this.wsem);
    pregameModule.onStart = (clients) => {
      this.state.setUp(clients);
      this.state.players.forEach((player) => {
        const otherPlayers = this.state.players.filter((el) => el.id !== player.id).map((el) => el.name);
        this.wsem.sendMessage(player.id, wsEvents.s_players, { players: otherPlayers });
      });
    };
    pregameModule.run();
  }
}

export default GameModule
