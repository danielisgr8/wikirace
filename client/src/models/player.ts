class Player {
  public id: number;
  public name: string;
  public time: number;
  public score: number;
  public change: number;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.time = 0;
    this.score = 0;
    this.change = 0;
  }
}

export default Player;
