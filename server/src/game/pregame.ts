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
    if(Object.values(this.clients).length > 0) {
      this.wsem.sendMessage(id, wsEvents.s_lobbyUpdate, { players: Object.values(this.clients).map((client) => ({ id: client.id, name: client.name })) });
    }
    this.clients[id] = new Client(id, data.name);
    this.wsem.trackClientReconnect(id);
    this.broadcastMessage(wsEvents.s_lobbyUpdate, { players: [{ id, name: data.name }] }, id);
  }

  private startMatchHandler(): void {
    this.cleanUp();
    if(this.onStart) this.onStart(Object.values(this.clients));
  }

  protected getIds(): Array<number> {
    return Object.keys(this.clients).map((str) => Number(str));
  }
}

export default PregameModule;
