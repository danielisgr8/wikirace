import WebSocketEventManager, { EventHandler } from "../networking/websocketEventManager";

abstract class NetworkingGameModule {
  protected wsem: WebSocketEventManager;
  /** Tuple of event name and handler (respectively) */
  protected eventTuples: Array<[string, EventHandler]>;

  protected constructor(wsem: WebSocketEventManager) {
    this.wsem = wsem;
    this.eventTuples = [];
  }

  public abstract run(): void;

  protected abstract cleanUp(): void;

  protected bindHandlers(): void {
    this.eventTuples.forEach(([event, handler], i) => {
      this.eventTuples[i] = [event, handler.bind(this)];
    }, this);
  }

  protected addHandlers(): void {
    this.eventTuples.forEach(([event, handler]) => this.wsem.addEventHandler(event, handler));
  }

  protected removeHandlers(): void {
    this.eventTuples.forEach(([event, handler]) => this.wsem.removeEventHandler(event, handler));
  }

  protected abstract getIds(): Array<number>;

  protected broadcastMessage(event: string, data: any, ignoreId?: number): void {
    this.getIds().forEach((id) => {
      if(ignoreId !== undefined && ignoreId === id) return;
      this.wsem.sendMessage(id, event, data);
    }, this);
  }
}

export default NetworkingGameModule;
