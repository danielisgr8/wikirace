import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

import WebSocketEventManager from "../networking/websocketEventManager";
import GameState from "./state/gameState";
import PregameModule from "./pregame";
import { wsEvents } from "wikirace-shared";
import MatchModule from "./match";

class GameModule {
  private wsem: WebSocketEventManager;
  private state: GameState;

  public constructor(wss: WebSocket.Server) {
    this.wsem = new WebSocketEventManager(wss, true);
    this.state = new GameState(uuidv4());
    this.wsem.setSessionId(this.state.sessionId);
  }

  public run(): void {
    this.wsem.run();
    const pregameModule = new PregameModule(this.wsem);
    pregameModule.onStart = (clients) => {
      this.state.setUp(clients);
      const names = this.state.getPlayers().map((player) => player.name);
      this.state.getPlayers().forEach((player) => {
        this.wsem.sendMessage(player.id, wsEvents.s_players, { players: names });
      });

      const matchModule = new MatchModule(this.wsem, this.state);
      matchModule.onMatchEnd = () => console.log("Match ended");
      matchModule.run();
    };
    pregameModule.run();
  }
}

export default GameModule;
