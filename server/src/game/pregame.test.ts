import WebSocket from "ws";
import { mocked } from "ts-jest/utils";
import PregameModule from "./pregame";
import WebSocketEventManager from "../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";
import ModuleTester from "../test-util/moduleTester";

jest.mock("../networking/websocketEventManager");
jest.mock("ws");

describe("PregameModule", () => {
  const wss = new WebSocket.Server();
  const wsem = new WebSocketEventManager(wss);
  const mockedWsem = mocked(wsem, true);
  const expectedEvents = [wsEvents.c_join, wsEvents.c_startMatch];

  let pregameModule: PregameModule;
  let moduleTester: ModuleTester;

  beforeEach(() => {
    jest.resetAllMocks();

    pregameModule = new PregameModule(wsem);
    pregameModule.run();

    moduleTester = new ModuleTester(mockedWsem, expectedEvents);
    moduleTester.setHandlers();
  });

  test("Event handlers are correctly set", () => {
    moduleTester.testEventHandlerAdding();
  });

  test("onStart is called when starting the match", () => {
    const onStart = jest.fn();
    pregameModule.onStart = onStart;

    moduleTester.eventHandlers[wsEvents.c_startMatch](1, null);

    expect(onStart.mock.calls.length).toBe(1);
  });

  test("Clients are added on join", () => {
    const epxectedClients = [
      { id: 0, name: "Daniel" },
      { id: 1, name: "Greg Name-ison" }
    ];

    let onStartRun = false;
    pregameModule.onStart = (clients) => {
      expect(clients).toEqual(epxectedClients);
      onStartRun = true;
    };

    epxectedClients.forEach((client) => {
      moduleTester.eventHandlers[wsEvents.c_join](client.id, { name: client.name });
    });

    moduleTester.eventHandlers[wsEvents.c_startMatch](1, null);
    expect(onStartRun).toBe(true);
  });

  test("Client reconnects are tracked", () => {
    const clients = [
      { id: 0, name: "Daniel" },
      { id: 1, name: "Greg Name-ison" }
    ];

    clients.forEach((client) => {
      moduleTester.eventHandlers[wsEvents.c_join](client.id, { name: client.name });
    });

    expect(mockedWsem.trackClientReconnect.mock.calls.length).toBe(2);
    clients.forEach((client, i) => {
      expect(mockedWsem.trackClientReconnect.mock.calls[i][0]).toBe(client.id);
    });
  });

  test("Event handlers are removed on match start", () => {
    moduleTester.testEventHandlerRemoval(() => moduleTester.eventHandlers[wsEvents.c_startMatch](1, null));
  });
});
