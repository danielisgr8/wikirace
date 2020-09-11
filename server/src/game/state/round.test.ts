import Round, { Status as RoundStatus } from "./round";
import Player from "./player";

describe("Round", () => {
  let players: Array<Player>;
  let round: Round;

  beforeEach(() => {
    players = [
      new Player(0, "Daniel"),
      new Player(1, "Greg"),
      new Player(2, "Samson")
    ];
    round = new Round(players);
  });

  test("Correct initial values", () => {
    expect(round.status).toBe(RoundStatus.Unstarted);
    expect(round.getOrderedTimes().length).toBe(0);
  });

  test("When player does not exist, addTime throws an error", () => {
    expect(() => round.addTime(3, 10)).toThrow();
  });

  test("When player has already finished, addTime throws an error", () => {
    round.addTime(0, 10);
    expect(() => round.addTime(0, 11)).toThrow();
  });

  test("getOrderedTimes", () => {
    round.addTime(1, 123);
    round.addTime(2, 124);
    round.addTime(0, 125);

    const expectedIdOrder = [1, 2, 0];
    round.getOrderedTimes().forEach(({ id }, i) => {
      expect(id).toBe(expectedIdOrder[i]);
    });
  });

  test("hasFinished", () => {
    round.addTime(1, 123);
    expect(round.hasFinished).toBe(false);

    round.addTime(2, 124);
    expect(round.hasFinished).toBe(false);

    round.addTime(0, 125);
    expect(round.hasFinished).toBe(true);
  });
});
