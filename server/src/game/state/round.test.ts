import Round from "./round";

describe("Round", () => {
  let round: Round;

  beforeEach(() => {
    round = new Round();
  });

  test("Correct initial values", () => {
    expect(round.started).toBe(false);
    expect(Object.entries(round.times).length).toBe(0);
    expect(round.finishedCount).toBe(0);
  })

  test("getOrderedTimes", () => {
    round.times = {
      5: { rank: 2, time: 123 },
      7: { rank: 1, time: 122 },
      6: { rank: 0, time: 121 },
      100: { rank: 3, time: 124 },
      50: { rank: 4, time: 125 }
    };
    const expectedIdOrder = [6, 7, 5, 100, 50];

    round.getOrderedTimes().forEach(({ id }, i) => {
      expect(id).toBe(expectedIdOrder[i]);
    });
  });
});
