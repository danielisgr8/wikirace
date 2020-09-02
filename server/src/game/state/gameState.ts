import Player from "./player";
import Client from "../client";
import Round from "./round";

class GameState {
  public players: Array<Player>;
  public sessionId: string;
  public roundCount: number;
  public currentRound: Round | undefined;

  public constructor(sessionId: string) {
    this.sessionId = sessionId
    this.players = [];
    this.roundCount = 0;
  }

  public setUp(clients: Array<Client>): void {
    this.players = clients.map((client: Client) => new Player(client.id, client.name));
  }

  public setUpNextRound(): void {
    const nextRound = new Round();
    if(this.currentRound) nextRound.source = this.currentRound.dest;
    this.currentRound = nextRound;
  }

  public hasRoundStarted(): boolean {
    return this.currentRound?.started || false;
  }

  public hasRoundFinished(): boolean {
    return this.currentRound?.finishedCount === this.players.length;
  }
}

export default GameState;
