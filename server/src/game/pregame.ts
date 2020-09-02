import NetworkingGameModule from "./networkingGameModule";
import WebSocketEventManager from "../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";

import Client from "./client";

class PregameModule extends NetworkingGameModule {
  public onStart: ((clients: Array<Client>) => void) | undefined;

  private clients: { [id: number]: Client };

  public constructor(wsem: WebSocketEventManager) {
    super(wsem);

    this.clients = {};
    this.eventTuples = [
      [wsEvents.c_join, this.joinHandler],
      [wsEvents.c_startMatch, this.startMatchHandler]
    ];

    this.bindHandlers();
  }

  public run(): void {
    this.addHandlers();
  }

  protected cleanUp(): void {
    this.removeHandlers();
  }

  private joinHandler(id: number, data: { name: string }): void {
    this.clients[id] = new Client(id, data.name);
    this.wsem.trackClientReconnect(id);
  }

  private startMatchHandler(): void {
    this.cleanUp();
    if(this.onStart) this.onStart(Object.values(this.clients));
  }
}

export default PregameModule;
