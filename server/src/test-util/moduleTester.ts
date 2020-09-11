import WebSocketEventManager, { EventHandler } from "../networking/websocketEventManager";
import { MaybeMockedDeep } from "ts-jest/dist/util/testing";

class ModuleTester {
  private mockedWsem: MaybeMockedDeep<WebSocketEventManager>;
  private expectedEvents: Array<string>;

  public eventHandlers: { [event: string]: EventHandler };

  constructor(mockedWsem: MaybeMockedDeep<WebSocketEventManager>, expectedEvents: Array<string>) {
    this.mockedWsem = mockedWsem;
    this.expectedEvents = expectedEvents;
    this.eventHandlers = {};
  }

  public getHandler(eventName: String): EventHandler {
    const call = this.mockedWsem.addEventHandler.mock.calls.find(([event]) => event === eventName);
    if(call) return call[1];
    else fail();
  }

  public setHandlers(): void {
    this.expectedEvents.forEach((event) => {
      this.eventHandlers[event] = this.getHandler(event);
    });
  }

  public testEventHandlerAdding() {
    expect(this.mockedWsem.addEventHandler.mock.calls.length).toBe(this.expectedEvents.length);
    this.setHandlers();
  }

  public testEventHandlerRemoval(runBefore: Function): void {
    runBefore();

    expect(this.mockedWsem.removeEventHandler.mock.calls.sort(([event1], [event2]) => event1.localeCompare(event2)))
      .toEqual(this.expectedEvents.sort().map((event) => [event, this.eventHandlers[event]]));
  }
}

export default ModuleTester;
