import { wsEvents } from "wikirace-shared";
import WebSocket from "ws";

import ReconnectMap from "./reconnectMap";

interface WebSocketMessage {
  event: string;
  data: any;
}

interface EventHandler {
  (id: number, data: any): void
}

class WebSocketEventManager {
  public onClose: ((id: number) => void) | undefined;

  private wss: WebSocket.Server;
  private handleReconnects: boolean;
  private events: { [eventName: string]: Array<EventHandler> };
  private clients: { [id: number]: WebSocket };
  private clientCount: number;
  private reconnectMap: ReconnectMap;
  private messageQueue: { [id: number]: Array<WebSocketMessage> };
  private sessionId: string | null = null;

  /**
   * If `handleReconnects` is `true`, WSEM will automatically indentify reconnected
   *  connections through `s_init` and `c_reconnect` messages. `setSessionID` must
   *  be called before reconnecting can be handled.
   * When handling reconnects, consumers of WSEM can use the original ID that identified
   *  the client.
   * @param wss 
   * @param onClose 
   * @param handleReconnects 
   */
  public constructor(wss: WebSocket.Server, handleReconnects = false) {
    this.wss = wss;
    this.handleReconnects = handleReconnects;

    this.events = {};
    this.clients = {};
    this.clientCount = 0;
    /** Maps original WS IDs to their new IDs. Used to handle reconnects. */
    this.reconnectMap = new ReconnectMap();
    /** Maps original WS IDs to queues of messages they should receive on reconnect. */
    this.messageQueue = {};
  }

  public run(): void {
    this.wss.on("connection", (ws) => {
      const id = this.clientCount++;
      this.clients[id] = ws;

      ws.on("message", (message) => {
        if(typeof message === "string") this.handleEvent(id, message);
        else new Error(`Message of unexpected type ${typeof message}: ${message}`);
      });

      ws.on("close", () => {
        if(this.onClose) this.onClose(id);
      });
    });

    if(this.handleReconnects) {
      this.addEventHandler(wsEvents.c_reconnect, (id, data) => {
        if(this.sessionId && data.sessionID === this.sessionId) {
          this.reconnectMap.addMapping(data.clientID, id);
          this.flushMessageQueue(data.clientID);
        }
      });
    }
  }

  /**
   * Set an ID unique to this session/game/etc. A UUIDv4 is sufficient.
   * @param id 
   */
  public setSessionID(id: string): void {
    this.sessionId = id;
  }

  /**
   * When called, the WSEM will begin tracking the given ID through reconnects.
   * `handleReconnects` must have been `true` in the constructor and `setSessionID`
   *  must have been called before this.
   * @param id 
   */
  public trackClientReconnect(id: number): void {
    if(this.handleReconnects && this.sessionId) this.sendMessage(id, wsEvents.s_init, { clientID: id, sessionID: this.sessionId });
  }

  private addToMessageQueue(id: number, msg: WebSocketMessage): void {
    if(!(id in this.messageQueue)) this.messageQueue[id] = [];
    this.messageQueue[id].push(msg);
  }

  /**
   * Send all the messages stored in the queue to the given original ID.
   * Messages are sent FIFO.
   * @param id 
   */
  private flushMessageQueue(id: number): void {
    if(!(id in this.messageQueue)) return;

    let msg: WebSocketMessage | undefined;
    while((msg = this.messageQueue[id].shift())) this.sendMessage(id, msg.event, msg.data, false);
  }

  public addEventHandler(eventName: string, callback: EventHandler): void {
    if(!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
  }

  public removeEventHandler(eventName: string, callback: EventHandler): void {
    if(this.events[eventName]) this.events[eventName] = this.events[eventName].filter((fn) => fn !== callback);
  }

  private handleEvent(id: number, message: string): void {
    console.log(`Received: ${message}`);
    const parsedMessage: WebSocketMessage = JSON.parse(message);
    if(this.handleReconnects && this.reconnectMap.hasOGFor(id)) id = this.reconnectMap.getOG(id);

    const handlers = this.events[parsedMessage.event];
    if(handlers) handlers.forEach((handler) => handler(id, parsedMessage.data));
  }

  public sendMessage(id: number, event: string, data: any, queue = true): void {
    const originalID = id;
    if(this.handleReconnects && this.reconnectMap.hasCurrentFor(id)) id = this.reconnectMap.getCurrent(id);
    const ws = this.clients[id];

    const msg = JSON.stringify({
      event,
      data
    });

    if(this.handleReconnects && (ws.readyState === 2 || ws.readyState === 3) && queue) {
      this.addToMessageQueue(originalID, { event, data });
    } else {
      console.log(`Sending: ${msg}`);
      ws.send(msg);
    }
  }
}

export default WebSocketEventManager;
export { EventHandler };
