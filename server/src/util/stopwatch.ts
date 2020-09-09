class Stopwatch {
  private startTime: number | undefined;

  public start(): void {
    this.startTime = Date.now();
  }

  public getTime(): number {
    if(this.startTime) return (Date.now() - this.startTime) / 1000;
    else throw new Error("Stopwatch must be started before getting time.");
  }
}

export default Stopwatch;
