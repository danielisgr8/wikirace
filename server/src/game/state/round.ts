import Player from "./player";

class Round {
  public started: boolean;
  public times: { [playerId: number]: { rank: number, time: number } };
  public finishedCount: number;
  public source: string | undefined;
  public dest: string | undefined;

  public constructor() {
    this.started = false;
    this.times = {};
    this.finishedCount = 0;
  }

  public addTime(id: number, rank: number, time: number) {
    this.times[id] = { rank, time };
    this.finishedCount++;
  }

  public getOrderedTimes(): Array<{ id: number, time: number }> {
    return Object.entries(this.times)
      .sort(([, val1], [, val2]) => val1.rank - val2.rank)
      .map(([key, val]) => ({ id: Number(key), time: val.time }));
  }
}

export default Round;
