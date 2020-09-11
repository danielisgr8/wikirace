import Player from "./player";

enum Status {
  Unstarted,
  Started,
  Ended
};

class Round {
  private players: { [id: number]: Player };
  private playerCount: number;
  private playerTimes: { [id: number]: number };
  
  public status: Status;
  public source: string | undefined;
  public dest: string | undefined;
  public finishedCount: number;

  public constructor(players: { [id: number]: Player }) {
    this.players = players;
    this.playerCount = Object.keys(players).length;
    this.status = Status.Unstarted;
    this.playerTimes = {};
    this.finishedCount = 0;
  }

  get hasFinished(): boolean { return this.finishedCount === this.playerCount }

  public addTime(id: number, time: number): void {
    if(id in this.players) {
      if(id in this.playerTimes) throw new Error(`Player with ID ${id} has already finished.`);
      this.playerTimes[id] = time;
      this.finishedCount++;
    } else {
      throw new Error(`ID ${id} does not correspond to a player.`);
    }
  }

  public getOrderedTimes(): Array<{ id: number, time: number }> {
    return Object.entries(this.playerTimes)
            .sort(([, time1], [, time2]) => time1 - time2)
            .map(([id, time]) => ({ id: Number(id), time }));
  }
}

export default Round;
export { Status };
