class Client {
  public id: number;
  public name: string;

  public constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  public equals(obj: any): boolean {
    if(obj === null || !(obj instanceof Client)) return false;
    return this.id === obj.id && this.name === obj.name;
  }
}

export default Client;
