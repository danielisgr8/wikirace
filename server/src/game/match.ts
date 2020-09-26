import NetworkingGameModule from "./networkingGameModule";
import WebSocketEventManager from "../networking/websocketEventManager";
import GameState from "./state/gameState";
import { wsEvents } from "wikirace-shared";
import Stopwatch from "../util/stopwatch";

class MatchModule extends NetworkingGameModule {
  public onMatchEnd: (() => void) | undefined;

  private state: GameState;
  private stopwatch: Stopwatch;

  public constructor(wsem: WebSocketEventManager, state: GameState) {
    super(wsem);

    this.state = state;
    this.stopwatch = new Stopwatch();

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
  }

  protected cleanUp(): void {
    this.removeHandlers();
  }

  private setUpNextRound(): void {
    this.state.setUpNextRound();
    this.broadcastMessage(wsEvents.s_roundInfo, this.getRoundInfo());
  }

  private getRoundInfo(): { sourcePath: string | null, destPath: string | null } {
    return {
      sourcePath: this.state.currentRound.source || null,
      destPath: this.state.currentRound.dest || null
    };
  }

  private setSourceHandler(id: number, data: { path: string }): void {
    if(!this.state.roundHasStarted) {
      if(this.state.currentRound.source === data.path) return;
      this.state.currentRound.source = data.path;
      this.broadcastMessage(wsEvents.s_roundInfo, this.getRoundInfo(), id);
    }
  }

  private setDestHandler(id: number, data: { path: string }): void {
    if(!this.state.roundHasStarted) {
      if(this.state.currentRound.dest === data.path) return;
      this.state.currentRound.dest = data.path;
      this.broadcastMessage(wsEvents.s_roundInfo, this.getRoundInfo(), id);
    }
  }

  private startRoundHandler(): void {
    if(!this.state.roundHasStarted) {
      this.state.startRound();
      this.stopwatch.start();
      this.broadcastMessage(wsEvents.s_roundStarted, null);
    }
  }

  private articleFoundHandler(id: number): void {
    if(this.state.roundHasStarted) {
      try {
        const time = this.stopwatch.getTime();
        this.state.currentRound.addTime(id, time);

        this.broadcastMessage(wsEvents.s_finishUpdate, { updates: [{ id, time, position: this.state.currentRound.finishedCount }] });
        if(this.state.currentRound.hasFinished) {
          const leaderboard = this.state.endRound();
          this.broadcastMessage(wsEvents.s_leaderboard, { leaderboard });
          this.setUpNextRound();
        }
      } catch(err) {
        console.error(err.toString());
      }
    }
  }

  private endMatchHandler(): void {
    if(!this.state.roundHasStarted) this.state.startRound();
    const leaderboard = this.state.endRound().map(({ id, points }) => ({ id, points }));
    this.broadcastMessage(wsEvents.s_results, { leaderboard });

    if(this.onMatchEnd) this.onMatchEnd();

    this.cleanUp();
  }

  protected getIds(): Array<number> {
    return this.state.getPlayers().map((player) => player.id);
  }
}

export default MatchModule;
