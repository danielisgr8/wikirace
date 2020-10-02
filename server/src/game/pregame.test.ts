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

  test("s_lobbyUpdate sent successfully", () => {
    const clients = [
      { id: 0, name: "Daniel" },
      { id: 1, name: "Greg Name-ison" }
    ];

    moduleTester.eventHandlers[wsEvents.c_join](clients[0].id, { name: clients[0].name });

    expect(mockedWsem.sendMessage.mock.calls.length).toBe(0);

    moduleTester.eventHandlers[wsEvents.c_join](clients[1].id, { name: clients[1].name });

    expect(mockedWsem.sendMessage.mock.calls.length).toBe(2);
    mockedWsem.sendMessage.mock.calls.sort(([id1], [id2]) => id1 - id2);

    const firstCall = mockedWsem.sendMessage.mock.calls[0];
    expect(firstCall[0]).toBe(0);
    expect(firstCall[1]).toBe(wsEvents.s_lobbyUpdate);
    expect(firstCall[2].players).toEqual([{ id: clients[1].id, name: clients[1].name }]);

    const secondCall = mockedWsem.sendMessage.mock.calls[1];
    expect(secondCall[0]).toBe(1);
    expect(secondCall[1]).toBe(wsEvents.s_lobbyUpdate);
    expect(secondCall[2].players).toEqual([{ id: clients[0].id, name: clients[0].name }]);
  });
});
