import WebSocket from "ws";

import WebSocketEventManager from "./websocketEventManager";
import { MaybeMockedDeep, mocked } from "ts-jest/dist/util/testing";
import ReconnectMap from "./reconnectMap";
import { wsEvents } from "wikirace-shared";

jest.mock("ws");
jest.mock("./reconnectMap");

describe("WebSocketEventManager", () => {
  let wss: WebSocket.Server;
  let wsem: WebSocketEventManager;
  let ws: WebSocket;

  let connectionCallback: (ws: WebSocket) => void;
  let wsMessageCallback: (data: WebSocket.Data) => void;
  let wsCloseCallback: () => void;

  let mockedWss: MaybeMockedDeep<WebSocket.Server>;
  let mockedWs: MaybeMockedDeep<WebSocket>;

  beforeAll(() => {
    wss = new WebSocket.Server();
    mockedWss = mocked(wss, true);

    ws = new WebSocket("");
    mockedWs = mocked(ws, true);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockedWs.readyState = WebSocket.OPEN;
  });

  const getWsCallbacks = (websocket: MaybeMockedDeep<WebSocket>) => {
    const maybeMessageCall = websocket.on.mock.calls.find(([event]) => event === "message");
    if(!maybeMessageCall) fail();
    const messageCallback = maybeMessageCall[1];

    const maybeCloseCall = websocket.on.mock.calls.find(([event]) => event === "close");
    if(!maybeCloseCall) fail();
    const closeCallback = maybeCloseCall[1];

    return [messageCallback, closeCallback];
  };

  const setUpWsem = () => {
    wsem.run();

    const maybeConnectionCall = mockedWss.on.mock.calls.find(([event]) => event === "connection");
    if(!maybeConnectionCall) fail();
    connectionCallback = maybeConnectionCall[1];

    connectionCallback(ws);

    [wsMessageCallback, wsCloseCallback] = getWsCallbacks(mockedWs);
  };

  const runReconnectAgnosticTests = () => {
    describe("addEventHandler", () => {
      const eventName = "event";
      const msg = { event: eventName, data: { favoriteColor: "Cream", favoriteSalad: "I eat Cobb like it's my job" }};
  
      const testHandlers = (handlers: Array<jest.Mock>) => {
        handlers.forEach((handler) => wsem.addEventHandler(eventName, handler));
  
        wsMessageCallback(JSON.stringify(msg));
        handlers.forEach((handler) => {
          expect(handler.mock.calls.length).toBe(1);
          const [ id, data ] = handler.mock.calls[0];
          expect(id).toBe(0);
          expect(data).toEqual(msg.data);
        });
      };

      test("addEventHandler has handler called when event is received", () => {
        const handler = jest.fn();
        testHandlers([handler]);
      });
  
      test("addEventHandler has multiple handlers called for same event", () => {
        const handlers = [ jest.fn(), jest.fn() ];
        testHandlers(handlers);
      });
    });

    test("onClose is called on WebSocket close", () => {
      const onClose = jest.fn();
      wsem.onClose = onClose;
      wsCloseCallback();

      expect(onClose.mock.calls.length).toBe(1);
      expect(onClose.mock.calls[0][0]).toBe(0);
    });

    test("removeEventHandler correctly removes handler", () => {
      const eventName = "c_dinosaursAttacked";

      const activeHandler = jest.fn();
      const removedHandler = jest.fn();

      wsem.addEventHandler(eventName, activeHandler);
      wsem.addEventHandler(eventName, removedHandler);

      wsem.removeEventHandler(eventName, removedHandler);

      wsMessageCallback(JSON.stringify({
        event: eventName,
        data: null
      }));

      expect(activeHandler.mock.calls.length).toBe(1);
      expect(removedHandler.mock.calls.length).toBe(0);
    });

    test("sendMessage sends data to WebSocket", () => {
      const eventName = "s_droppedMyIceCream";
      const data = { number: 5, string: "myString" };

      wsem.sendMessage(0, eventName, data);

      expect(mockedWs.send.mock.calls.length).toBe(1);
      const msg = JSON.parse(mockedWs.send.mock.calls[0][0]);
      expect(msg.event).toBe(eventName);
      expect(msg.data).toEqual(data);
    });

    test("sendMessage throws error for non-existent WebSocket ID", () => {
      expect(() => wsem.sendMessage(999, "event", null)).toThrow();
    });

    test("reset clears event handlers and clients", () => {
      const eventName = "event";

      const handler = jest.fn();
      wsem.addEventHandler(eventName, handler);

      wsem.reset();

      expect(mockedWs.terminate.mock.calls.length).toBe(1);

      wsMessageCallback(JSON.stringify({
        event: eventName,
        data: null
      }));
      expect(handler.mock.calls.length).toBe(0);

      expect(() => wsem.sendMessage(0, eventName, null)).toThrow();
    });
  };

  describe("handleReconnects is false", () => {
    beforeEach(() => {
      wsem = new WebSocketEventManager(wss);
      setUpWsem();
    });

    runReconnectAgnosticTests();
  });

  describe("handleReconnects is true", () => {
    let mockedReconnectMap: MaybeMockedDeep<ReconnectMap>;

    beforeEach(() => {
      wsem = new WebSocketEventManager(wss, true);
      setUpWsem();

      mockedReconnectMap = mocked(mocked(ReconnectMap, true).mock.instances[0], true);
      mockedReconnectMap.hasCurrentFor.mockReturnValue(false);
    });

    runReconnectAgnosticTests();

    describe("trackClientReconnect", () => {
      test("is a no-op when sessionId is not set", () => {
        wsem.trackClientReconnect(0);
        expect(mockedWs.send.mock.calls.length).toBe(0);
      });

      test("sends s_init message when sessionId is set", () => {
        const sessionId = "123";
        wsem.setSessionId(sessionId);

        wsem.trackClientReconnect(0);

        expect(mockedWs.send.mock.calls.length).toBe(1);
        const message = JSON.parse(mockedWs.send.mock.calls[0][0]);
        expect(message.event).toBe(wsEvents.s_init);
        expect(message.data).toEqual({ clientId: 0, sessionId });
      });
    });

    describe("receiving c_reconnect from client", () => {
      test("is a no-op when sessionId is not set", () => {
        wsMessageCallback(JSON.stringify({ clientId: 0, sessionId: "whatever" }));

        expect(mockedReconnectMap.addMapping.mock.calls.length).toBe(0);
        expect(mockedWs.send.mock.calls.length).toBe(0);
      });

      describe("sessionId is set", () => {
        const sessionId = "123";

        let reconnectedWs: WebSocket;
        let mockedReconnectedWs: MaybeMockedDeep<WebSocket>;

        let reconnectedWsMessageCallback: (data: WebSocket.Data) => void;

        const reconnect = () => {
          reconnectedWsMessageCallback(JSON.stringify({
            event: wsEvents.c_reconnect,
            data: { clientId: 0, sessionId: sessionId }
          }));
        }

        beforeEach(() => {
          wsem.setSessionId(sessionId);

          reconnectedWs = new WebSocket("");
          mockedReconnectedWs = mocked(reconnectedWs, true);
          // All instances of WebSocket get the same mock implementations. The implementations must be differentiated
          mockedReconnectedWs.on = jest.fn();
          mockedReconnectedWs.send = jest.fn();
          mockedReconnectedWs.readyState = WebSocket.OPEN;

          connectionCallback(reconnectedWs);
          [reconnectedWsMessageCallback] = getWsCallbacks(mockedReconnectedWs);
        });

        test("reconnectMap correctly sets mapping", () => {
          reconnect();

          expect(mockedReconnectMap.addMapping.mock.calls.length).toBe(1);
          const call = mockedReconnectMap.addMapping.mock.calls[0];
          expect(call[0]).toBe(0);
          expect(call[1]).toBe(1);
        });

        test("missed messages are sent", () => {
          mockedWs.readyState = WebSocket.CLOSED;

          const queuedEvent1 = wsEvents.s_leaderboard;
          const queuedData1 = { blah: "blah" };

          const queuedEvent2 = wsEvents.s_players;
          const queuedData2 = { property: "value" };

          wsem.sendMessage(0, queuedEvent1, queuedData1);
          wsem.sendMessage(0, wsEvents.s_results, { thisShould: "not be queued" }, false);
          wsem.sendMessage(0, queuedEvent2, queuedData2, true);

          mockedReconnectMap.hasCurrentFor.mockImplementation((id) => id === 0);
          mockedReconnectMap.getCurrent.mockImplementation((id) => id === 0 ? 1 : -1);

          reconnect();

          expect(mockedReconnectedWs.send.mock.calls.length).toBe(2);

          const message1 = JSON.parse(mockedReconnectedWs.send.mock.calls[0][0]);
          expect(message1.event).toBe(queuedEvent1);
          expect(message1.data).toEqual(queuedData1);

          const message2 = JSON.parse(mockedReconnectedWs.send.mock.calls[1][0]);
          expect(message2.event).toBe(queuedEvent2);
          expect(message2.data).toEqual(queuedData2);
        });

        test("sends s_error when event sessionId is incorrect", () => {
          reconnectedWsMessageCallback(JSON.stringify({
            event: wsEvents.c_reconnect,
            data: { clientId: 0, sessionId: sessionId + "wrong" }
          }));

          expect(mockedReconnectedWs.send.mock.calls.length).toBe(1);
          const message = JSON.parse(mockedReconnectedWs.send.mock.calls[0][0]);
          expect(message.event).toBe(wsEvents.s_error);
          expect(message.data.code).toBe(0);
        });
      });
    });

    describe("reset", () => {
      // TODO:
    });
  });
});
