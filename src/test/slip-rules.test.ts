import { describe, expect, it } from "vitest";
import { potentialReturn, slipBlock, totalStake, type SlipLine } from "@/lib/slip-rules";

const line = (p: Partial<SlipLine> = {}): SlipLine => ({ selId: "a", addedOdds: 1.3, currentOdds: 1.3, suspended: false, stake: 10, ...p });

describe("bet slip rules", () => {
  it("potential return is stake times decimal odds", () => {
    expect(potentialReturn(20, 1.8)).toBe(36);
  });
  it("odds change must be accepted before placing", () => {
    expect(slipBlock([line({ currentOdds: 1.25 })], 1000)).toBe("odds-changed");
  });
  it("suspended selection blocks placing", () => {
    expect(slipBlock([line({ suspended: true })], 1000)).toBe("suspended");
  });
  it("each single needs a stake and total stake is summed", () => {
    expect(slipBlock([line({ stake: 0 })], 1000)).toBe("no-stake");
    expect(totalStake([line({ stake: 5 }), line({ stake: 7.5 })])).toBe(12.5);
  });
  it("valid singles can be placed", () => {
    expect(slipBlock([line(), line({ selId: "b" })], 1000)).toBeNull();
  });
});
