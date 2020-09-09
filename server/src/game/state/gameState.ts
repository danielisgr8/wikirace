import Player from "./player";
import Client from "../client";
import Round from "./round";

class GameState {
  private players: { [id: number]: Player};
  private playerCount: number;

  public sessionId: string;
  public roundCount: number;
  public currentRound: Round;

  public constructor(sessionId: string) {
    this.sessionId = sessionId
    this.players = {};
    this.playerCount = 0;
    this.roundCount = 1;
    this.currentRound = new Round(this.players);
  }

  /**
   * Returns an array of players in increasing order by ID
   */
  public getPlayers(): Array<Player> {
    return Object.values(this.players);
  }

  public setUp(clients: Array<Client>): void {
    clients.forEach((client) => this.players[client.id] = new Player(client.id, client.name));
    this.playerCount = Object.values(this.players).length;
  }

  public setUpNextRound(): void {
    const nextRound = new Round(this.players);
    nextRound.source = this.currentRound.dest;
    this.currentRound = nextRound;
    this.roundCount++;
  }

  public endRound(): Array<{ id: number, points: number, change: number }> {
    const objResult: { [id: string]: { points: number, change: number }} = {};
    Object.keys(this.players).forEach((key) => objResult[key] = { points: 0, change: 0 });

    this.currentRound.getOrderedTimes().forEach(({ id }, index) => {
      const pointsThisRound = this.playerCount - index;
      this.players[id].score += pointsThisRound;

      objResult[id].change = pointsThisRound;
      objResult[id].points = this.players[id].score;
    });

    return Object.keys(objResult).map((key) => ({ id: Number(key), points: objResult[key].points, change: objResult[key].change }));
  }
}

export default GameState;
