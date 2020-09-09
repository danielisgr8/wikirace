import Round from "./round";
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
    expect(round.started).toBe(false);
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
});
