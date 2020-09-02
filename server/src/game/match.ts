import NetworkingGameModule from "./networkingGameModule";
import WebSocketEventManager from "../networking/websocketEventManager";
import GameState from "./state/gameState";
import { wsEvents } from "wikirace-shared";

class MatchModule extends NetworkingGameModule {
  state: GameState;

  public constructor(wsem: WebSocketEventManager, state: GameState) {
    super(wsem);

    this.state = state;
    this.eventTuples = [
      [wsEvents.c_setSource, this.setSourceHandler],
      [wsEvents.c_setDest, this.setDestHandler],
      [wsEvents.c_startRound, this.startRoundHandler],
      [wsEvents.c_articleFound, this.articleFoundHandler],
      [wsEvents.c_endMatch, this.endMatchHandler]
    ];

    this.bindHandlers();
  }

  public run(): void {
    this.addHandlers();

    this.state.setUpNextRound();
    
  }

  protected cleanUp(): void {
    this.removeHandlers();
  }

  private broadcastMessage(event: string, data: any, ignoreId?: number) {
    this.state.players.forEach((player) => {
      if(ignoreId && ignoreId === player.id) return;
      this.wsem.sendMessage(player.id, event, data);
    }, this);
  }

  private getRoundInfo(): { source: string | null, dest: string | null } {
    return {
      source: this.state.currentRound?.source || null,
      dest: this.state.currentRound?.dest || null
    };
  }

  private setSourceHandler(id: number, data: { path: string }): void {
    if(this.state.currentRound) {
      if(this.state.currentRound.source === data.path) return;
      this.state.currentRound.source = data.path;
     this.broadcastMessage(wsEvents.s_roundInfo, this.getRoundInfo(), id);
    }
  }

  private setDestHandler(id: number, data: { path: string }): void {
    if(this.state.currentRound) {
      if(this.state.currentRound.dest === data.path) return;
      this.state.currentRound.dest = data.path;
      this.broadcastMessage(wsEvents.s_roundInfo, this.getRoundInfo(), id);
    }
  }

  private startRoundHandler() {
    
  }

  private articleFoundHandler(id: number) {

  }

  private endMatchHandler() {

  }
}

export default MatchModule;
