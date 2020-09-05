import WebSocket from "ws";
import { mocked } from "ts-jest/utils";

import PregameModule from "./pregame";
import WebSocketEventManager, { EventHandler } from "../networking/websocketEventManager";
import { wsEvents } from "wikirace-shared";

jest.mock("../networking/websocketEventManager");
jest.mock("ws");

describe("PregameModule", () => {
  const wss = new WebSocket.Server();
  const wsem = new WebSocketEventManager(wss);
  const mockedWsem = mocked(wsem, true);
  const expectedEvents = [wsEvents.c_join, wsEvents.c_startMatch];

  let pregameModule: PregameModule;
  let startMatchHandler: EventHandler;
  let joinHandler: EventHandler;

  const getHandler = (eventName: String): EventHandler => {
    const call = mockedWsem.addEventHandler.mock.calls.find(([event]) => event === eventName);
    if(call) return call[1];
    else fail();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    pregameModule = new PregameModule(wsem);
    pregameModule.run();

    startMatchHandler = getHandler(wsEvents.c_startMatch);
    joinHandler = getHandler(wsEvents.c_join);
  });

  test("Event handlers are correctly set", () => {
    expect(mockedWsem.addEventHandler.mock.calls.length).toBe(expectedEvents.length);
    expect(mockedWsem.addEventHandler.mock.calls.map(([event]) => event).sort()).toEqual(expectedEvents.sort());
  });

  test("onStart is called when starting the match", () => {
    const onStart = jest.fn();
    pregameModule.onStart = onStart;

    startMatchHandler(1, null);

    expect(onStart.mock.calls.length).toBe(1);
  });

  test("Clients are added on join", () => {
    const epxectedClients = [
      { id: 0, name: "Daniel" },
      { id: 1, name: "Greg Name-ison" }
    ];

    pregameModule.onStart = (clients) => {
      expect(clients).toEqual(epxectedClients);
    };

    epxectedClients.forEach((client) => {
      joinHandler(client.id, { name: client.name });
    });

    startMatchHandler(1, null);
  });

  test("Client reconnects are tracked", () => {
    const clients = [
      { id: 0, name: "Daniel" },
      { id: 1, name: "Greg Name-ison" }
    ];

    clients.forEach((client) => {
      joinHandler(client.id, { name: client.name });
    });

    expect(mockedWsem.trackClientReconnect.mock.calls.length).toBe(2);
    clients.forEach((client, i) => {
      expect(mockedWsem.trackClientReconnect.mock.calls[i][0]).toBe(client.id);
    });
  });

  test("Event handlers are removed on match start", () => {
    startMatchHandler(1, null);

    expect(mockedWsem.removeEventHandler.mock.calls.sort(([event1], [event2]) => event1.localeCompare(event2)))
      .toEqual(expectedEvents.sort().map((event) => [event, getHandler(event)]));
  });
});
