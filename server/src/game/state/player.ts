class Player {
  public id: number;
  public name: string;
  public score: number;

  public constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.score = 0;
  }

  public equals(obj: any) {
    if(obj === null || !(obj instanceof Player)) return false;
    return this.id === obj.id && this.name === obj.name && this.score === obj.score;
  }
}

export default Player;
