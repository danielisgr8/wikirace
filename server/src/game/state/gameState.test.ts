import GameState from "./gameState";
import Client from "../client";
import Player from "./player";
import Round, { Status as RoundStatus } from "./round";

import { mocked } from "ts-jest/utils";
import { MaybeMockedDeep } from "ts-jest/dist/util/testing";

jest.mock("./round");

describe("GameState", () => {
  const sessionId = "testSessionId";

  let gameState: GameState;
  let mockedRound: MaybeMockedDeep<typeof Round>;

  const getCurrentMockedRound = () => {
    return mocked(mockedRound.mock.instances[mockedRound.mock.instances.length - 1], true);
  };

  beforeAll(() => {
    mockedRound = mocked(Round, true);
  });

  beforeEach(() => {
    jest.resetAllMocks();

    gameState = new GameState(sessionId);
  });

  test("getPlayers returns correctly-ordered players", () => {
    const clients = [
      new Client(1, "Client1"),
      new Client(0, "Client0"),
      new Client(4, "Client4"),
      new Client(3, "Client3")
    ];

    const expectedPlayers = [
      new Player(0, "Client0"),
      new Player(1, "Client1"),
      new Player(3, "Client3"),
      new Player(4, "Client4"),
    ];

    gameState.setUp(clients);
    
    expect(gameState.getPlayers()).toEqual(expectedPlayers);
  });

  test("setUpNextRound sets next round's source to previous' destination", () => {
    const path = "rad-path.biz";
    gameState.currentRound.dest = path;
    gameState.setUpNextRound();
    expect(gameState.currentRound.source).toBe(path);
  });

  test("setUpNextRound updates round count", () => {
    expect(gameState.roundCount).toBe(1);
    gameState.setUpNextRound();
    expect(gameState.roundCount).toBe(2);
  });

  describe("endRound", () => {
    let mockedRoundInstance: MaybeMockedDeep<Round>;

    beforeEach(() => {
      const clients = [
        new Client(0, "Client0"),
        new Client(1, "Client1"),
        new Client(2, "Client2"),
      ];
      gameState.setUp(clients);

      mockedRoundInstance = getCurrentMockedRound();
    });

    test("endRound throws exception if round has not started", () => {
      mockedRoundInstance.status = RoundStatus.Unstarted;

      expect(() => gameState.endRound()).toThrow();
    });

    test("endRound throws exception if round has already ended", () => {
      mockedRoundInstance.status = RoundStatus.Ended;

      expect(() => gameState.endRound()).toThrow();
    });

    test("returns correct data when all players finished", () => {
      mockedRoundInstance.status = RoundStatus.Started;
      mockedRoundInstance.getOrderedTimes.mockReturnValue([
        { id: 2, time: 123 },
        { id: 0, time: 124 },
        { id: 1, time: 125 }
      ]);

      let expectedScores = [
        { id: 0, points: 2, change: 2 },
        { id: 1, points: 1, change: 1 },
        { id: 2, points: 3, change: 3 }
      ];
      let actualScores = gameState.endRound();

      expect(actualScores.sort(({ id: id1 }, { id: id2 }) => id1 - id2)).toEqual(expectedScores);

      gameState.setUpNextRound();
      gameState.startRound();
      getCurrentMockedRound().getOrderedTimes.mockReturnValue([
        { id: 1, time: 123 },
        { id: 2, time: 124 },
        { id: 0, time: 125 }
      ]);

      expectedScores = [
        { id: 0, points: 3, change: 1 },
        { id: 1, points: 4, change: 3 },
        { id: 2, points: 5, change: 2 }
      ];
      actualScores = gameState.endRound();

      expect(actualScores.sort(({ id: id1 }, { id: id2 }) => id1 - id2)).toEqual(expectedScores);
    });

    test("returns correct data when not all players finished", () => {
      mockedRoundInstance.status = RoundStatus.Started;
      mockedRoundInstance.getOrderedTimes.mockReturnValue([
        { id: 2, time: 123 },
        { id: 0, time: 124 }
      ]);

      const expectedScores = [
        { id: 0, points: 2, change: 2 },
        { id: 1, points: 0, change: 0 },
        { id: 2, points: 3, change: 3 }
      ];
      const actualScores = gameState.endRound();

      expect(actualScores.sort(({ id: id1 }, { id: id2 }) => id1 - id2)).toEqual(expectedScores);
    });
  });

  test("hasRoundStarted", () => {
    const mockedRoundInstance = getCurrentMockedRound();

    mockedRoundInstance.status = RoundStatus.Unstarted;
    expect(gameState.roundHasStarted).toBe(false);

    mockedRoundInstance.status = RoundStatus.Started;
    expect(gameState.roundHasStarted).toBe(true);

    mockedRoundInstance.status = RoundStatus.Ended;
    expect(gameState.roundHasStarted).toBe(true);
  });
});