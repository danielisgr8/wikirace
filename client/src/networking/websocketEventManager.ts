interface EventHandler {
  (data: any): void
}

/**
 * Client-side WebSocket event manager.
 * The `onLog` property of an instance can be set as a function receiving a log string.
 */
class WebSocketEventManager {
  public onLog: ((msg: string) => void) | undefined;

  private events: { [event: string]: EventHandler };
  private ws: WebSocket;
  private preOpenMessages: Array<string>;

  constructor(url: string, onOpen?: () => void) {
    this.events = {};
    this.ws = new WebSocket(url);
    this.preOpenMessages = [];

    this.ws.onopen = () => {
      if(this.onLog) this.onLog(`WebSocket opened at ${url}`);
      if(onOpen) onOpen();

      let msg: string | undefined;
      while((msg = this.preOpenMessages.shift())) this.ws.send(msg);
    };

    this.ws.onmessage = (message) => {
      const parsed = JSON.parse(message.data);
      if(!parsed.event) {
        if(this.onLog) this.onLog(`Invalid message received: ${parsed}`);
        return;
      }
      if(this.onLog) this.onLog(`Event ${parsed.event} received: ${JSON.stringify(parsed.data)}`);
      if(this.events[parsed.event]) this.events[parsed.event](parsed.data);
    };
  }

  addEventHandler(event: string, callback: EventHandler): void {
    this.events[event] = callback;
  }

  sendMessage(event: string, data: any): void {
    const msg = JSON.stringify({ event, data });
    if(this.onLog) this.onLog(`Sending: ${msg}`);
    if(this.ws.readyState === WebSocket.CONNECTING) {
      this.preOpenMessages.push(msg);
    } else {
      this.ws.send(msg);
    }
  }

  removeEventHandler(event: string): void {
    delete this.events[event];
  }
}

export default WebSocketEventManager;
