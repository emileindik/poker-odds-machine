import { describe, it, expect } from "@jest/globals";
import { Calculator, Input } from ".";

describe("Calculator", () => {
  it("should show player 1 beating player 2 by a lot", () => {
    const firstHand = "Ac,Ad";
    const secondHand = "7c,2d";
    const input: Input = {
      hands: [firstHand, secondHand],
      numPlayers: 2,
      iterations: 10000,
    };
    const calculator = new Calculator(input);
    const results = calculator.simulate();
    expect(results[firstHand].winPercent).toBeGreaterThan(70);
  });
});
