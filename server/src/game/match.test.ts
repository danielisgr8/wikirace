import WebSocket from "ws";

import WebSocketEventManager from "../networking/websocketEventManager";
import { mocked } from "ts-jest/utils";
import { wsEvents } from "wikirace-shared";
import MatchModule from "./match";
import ModuleTester from "../test-util/moduleTester";
import GameState from "./state/gameState";
import Round from "./state/round";
import Player from "./state/player";
import { MaybeMockedDeep } from "ts-jest/dist/util/testing";
import Stopwatch from "../util/stopwatch";

jest.mock("../networking/websocketEventManager");
jest.mock("./state/gameState");
jest.mock("./state/round");
jest.mock("../util/stopwatch");
jest.mock("ws");

describe("MatchModule", () => {
  const wss = new WebSocket.Server();
  const wsem = new WebSocketEventManager(wss);
  const mockedWsem = mocked(wsem, true);
  const expectedEvents = [wsEvents.c_setSource, wsEvents.c_setDest, wsEvents.c_startRound, wsEvents.c_articleFound, wsEvents.c_endMatch];

  const gameState = new GameState("");
  const mockedGameState = mocked(gameState, true);

  gameState.currentRound = new Round({});
  const mockedRound = mocked(gameState.currentRound, true);

  let matchModule: MatchModule;
  let moduleTester: ModuleTester;
  let players: Array<Player>;

  beforeAll(() => {
    players = [
      new Player(0, "Daniel"),
      new Player(1, "Greg"),
      new Player(2, "Alexis")
    ];
  });

  beforeEach(() => {
    jest.resetAllMocks();

    mockedGameState.getPlayers.mockReturnValue(players);

    matchModule = new MatchModule(wsem, gameState);
    matchModule.run();

    moduleTester = new ModuleTester(mockedWsem, expectedEvents);
    moduleTester.setHandlers();
  });

  test("Event handlers are correctly set", () => {
    moduleTester.testEventHandlerAdding();
  });

  describe("Setting source", () => {
    const path = "/spaghetti";

    beforeEach(() => {
      gameState.currentRound.source = undefined;
    });

    describe("before round has started", () => {
      beforeEach(() => {
        mockedGameState.roundHasStarted = false;

        moduleTester.eventHandlers[wsEvents.c_setSource](0, { path });
      });

      test("successfully alters state", () => {
        expect(mockedRound.source).toEqual(path);
      });

      test("successfully notifies clients", () => {
        expect(mockedWsem.sendMessage.mock.calls.length).toBe(players.length - 1);
        mockedWsem.sendMessage.mock.calls.sort(([id1], [id2]) => id1 - id2).forEach(([id, event, data], index) => {
          expect(id).toBe(players[index + 1].id);
          expect(event).toBe(wsEvents.s_roundInfo);
          expect(data).toEqual({ sourcePath: path, destPath: null });
        });
      });
    });

  
    test("after round has started is a no-op", () => {
      mockedGameState.roundHasStarted = true;

      moduleTester.eventHandlers[wsEvents.c_setSource](0, { path });

      expect(mockedRound.source).toBe(undefined);
      expect(mockedWsem.sendMessage.mock.calls.length).toBe(0);
    });
  });

  describe("Setting destination", () => {
    const path = "/television";

    beforeEach(() => {
      gameState.currentRound.dest = undefined;
    });

    describe("before round has started", () => {
      beforeEach(() => {
        mockedGameState.roundHasStarted = false;

        moduleTester.eventHandlers[wsEvents.c_setDest](0, { path });
      });

      test("successfully alters state", () => {
        expect(mockedRound.dest).toEqual(path);
      });

      test("successfully notifies clients", () => {
        expect(mockedWsem.sendMessage.mock.calls.length).toBe(players.length - 1);
        mockedWsem.sendMessage.mock.calls.sort(([id1], [id2]) => id1 - id2).forEach(([id, event, data], index) => {
          expect(id).toBe(players[index + 1].id);
          expect(event).toBe(wsEvents.s_roundInfo);
          expect(data).toEqual({ sourcePath: null, destPath: path });
        });
      });
    });
  
    test("after round has started is a no-op", () => {
      mockedGameState.roundHasStarted = true;

      moduleTester.eventHandlers[wsEvents.c_setDest](0, { path });

      expect(mockedRound.dest).toBe(undefined);
      expect(mockedWsem.sendMessage.mock.calls.length).toBe(0);
    });
  });

  describe("Starting round", () => {
    describe("before round has started", () => {
      beforeEach(() => {
        mockedGameState.roundHasStarted = false;

        moduleTester.eventHandlers[wsEvents.c_startRound](0, null);
      });

      test("successfully alters state", () => {
        expect(mockedGameState.startRound.mock.calls.length).toBe(1);
      });

      test("successfully notifies clients", () => {
        mockedWsem.sendMessage.mock.calls.sort(([id1], [id2]) => id1 - id2).forEach(([id, event, data], index) => {
          expect(id).toBe(players[index].id);
          expect(event).toBe(wsEvents.s_roundStarted);
        });
      });
    });
  
    test("after round has started is a no-op", () => {
      mockedGameState.roundHasStarted = true;

      moduleTester.eventHandlers[wsEvents.c_startRound](0, null);

      expect(mockedGameState.startRound.mock.calls.length).toBe(0);
      expect(mockedWsem.sendMessage.mock.calls.length).toBe(0);
    });
  });

  describe("Article found", () => {
    describe("after round has started", () => {
      let mockedStopwatch: MaybeMockedDeep<Stopwatch>;
      let times: Array<number>;

      beforeAll(() => {
        times = new Array(players.length);
        for(let i = 0; i < players.length; i++) times[i] = 10 + i;
      });

      beforeEach(() => {
        mockedRound.hasFinished = false;
        mockedGameState.roundHasStarted = true;

        const mockedStopwatchModule = mocked(Stopwatch, true);
        expect(mockedStopwatchModule.mock.instances.length).toBe(1);
        mockedStopwatch = mocked(mockedStopwatchModule.mock.instances[0], true);

        times.forEach((time) => mockedStopwatch.getTime.mockReturnValueOnce(time));
        for(let i = 0; i < players.length - 1; i++) {
          mockedRound.finishedCount = i + 1;
          moduleTester.eventHandlers[wsEvents.c_articleFound](i, null);
        }
      });

      test("successfully alters state", () => {
        expect(mockedRound.addTime.mock.calls.length).toBe(players.length - 1);
        for(let i = 0; i < players.length - 1; i++) {
          const [id, time] = mockedRound.addTime.mock.calls[i];
          expect(id).toBe(i);
          expect(time).toBe(times[i]);
        }

        expect(mockedGameState.endRound.mock.calls.length).toBe(0);
      });

      test("successfully notifies clients", () => {
        expect(mockedWsem.sendMessage.mock.calls.length).toBe(players.length * (players.length - 1));
        for(let i = 0; i < players.length - 1; i++) {
          for(let j = 0; j < players.length; j++) {
            const [id, event, data] = mockedWsem.sendMessage.mock.calls[i * players.length + j];
            expect(id).toBe(j);
            expect(event).toBe(wsEvents.s_finishUpdate);
            expect(data.updates.length).toBe(1);
            expect(data.updates[0]).toEqual({ position: i + 1, id: i, time: times[i] });
          }
        }
      });

      describe("and round has finished", () => {
        const source = "source.lank";
        const dest = "dest.link";

        let leaderboard: Array<{ id: number, points: number, change: number }>;

        beforeEach(() => {
          leaderboard = [{ id: 123, points: 999, change: 50 }];

          mockedRound.hasFinished = true;
          mockedRound.finishedCount = players.length;
          mockedGameState.currentRound.source = source;
          mockedGameState.currentRound.dest = dest;
          mockedGameState.endRound.mockReturnValue(leaderboard);
          moduleTester.eventHandlers[wsEvents.c_articleFound](players.length - 1, null);
        });

        test("successfully alters state", () => {
          const [id, time] = mockedRound.addTime.mock.calls[players.length - 1];
          expect(id).toBe(players.length - 1);
          expect(time).toBe(times[players.length - 1]);

          expect(mockedGameState.endRound.mock.calls.length).toBe(1);
        });
  
        test("successfully notifies clients", () => {
          for(let i = 0; i < players.length; i++) {
            const [id, event, data] = mockedWsem.sendMessage.mock.calls[(players.length - 1) * players.length + i];
            expect(id).toBe(i);
            expect(event).toBe(wsEvents.s_finishUpdate);
            expect(data.updates.length).toBe(1);
            expect(data.updates[0]).toEqual({ position: players.length, id: players.length - 1, time: times[players.length - 1] });
          }

          for(let i = 0; i < players.length; i++) {
            const [id, event, data] = mockedWsem.sendMessage.mock.calls[Math.pow(players.length, 2) + i];
            expect(id).toBe(i);
            expect(event).toBe(wsEvents.s_leaderboard);
            expect(data.leaderboard).toEqual(leaderboard);
          }
        });

        test("successfully starts next round", () => {
          expect(mockedGameState.setUpNextRound.mock.calls.length).toBe(1);
        });

        test("successfully notifies clients of new round info", () => {
          const startIndex = Math.pow(players.length, 2) + players.length;
          for(let i = startIndex; i < startIndex + players.length; i++) {
            const [id, event, data] = mockedWsem.sendMessage.mock.calls[i];
            expect(id).toBe(i - startIndex);
            expect(event).toBe(wsEvents.s_roundInfo);
            expect(data.sourcePath).toEqual(source);
            expect(data.destPath).toBe(dest);
          }
        });
      })
    });

    test("before round has started is a no-op", () => {
      mockedGameState.roundHasStarted = false;

      moduleTester.eventHandlers[wsEvents.c_articleFound](0, null);

      expect(mockedRound.addTime.mock.calls.length).toBe(0);
      expect(mockedGameState.endRound.mock.calls.length).toBe(0);
      expect(mockedWsem.sendMessage.mock.calls.length).toBe(0);
    });
  });

  describe("Ending match", () => {
    let leaderboard: Array<{ id: number, points: number, change: number }>;
    let onMatchEnd: jest.Mock;

    beforeEach(() => {
      leaderboard = [{ id: 123, points: 999, change: 50 }];
      mockedGameState.endRound.mockReturnValue(leaderboard);

      onMatchEnd = jest.fn();
      matchModule.onMatchEnd = onMatchEnd;

      moduleTester.eventHandlers[wsEvents.c_endMatch](1, null);
    });

    test("successfully notifies clients", () => {
      expect(mockedWsem.sendMessage.mock.calls.length).toBe(players.length);
      mockedWsem.sendMessage.mock.calls.sort(([id1], [id2]) => id1 - id2).forEach(([id, event, data], index) => {
        expect(id).toBe(players[index].id);
        expect(event).toBe(wsEvents.s_results);
        expect(data.leaderboard).toEqual([{ id: leaderboard[0].id, points: leaderboard[0].points }]);
      });

      expect(onMatchEnd.mock.calls.length).toBe(1);
    });

    test("removed handlers", () => {
      moduleTester.testEventHandlerRemoval();
    });
  });
});