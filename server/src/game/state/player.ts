class Player {
  public id: number;
  public name: string;
  public score: number;

  public constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.score = 0;
  }
}

export default Player;
