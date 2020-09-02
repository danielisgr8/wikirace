class ReconnectMap {
  private ogToCurrent: { [id: number]: number };
  private currentToOG: { [id: number]: number };

  public constructor() {
    this.ogToCurrent = {};
    this.currentToOG = {};
  }

  public addMapping(og: number, current: number): void {
    this.ogToCurrent[og] = current;
    this.currentToOG[current] = og;
  }

  public getOG(current: number): number {
    return this.currentToOG[current];
  }

  public getCurrent(og: number): number {
    return this.ogToCurrent[og];
  }

  public hasCurrentFor(og: number): boolean {
    return og in this.ogToCurrent;
  }

  public hasOGFor(current: number): boolean {
    return current in this.currentToOG;
  }
}

export default ReconnectMap;
