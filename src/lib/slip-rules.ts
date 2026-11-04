// Pure bet-slip rules (singles only, decimal odds, USDT stakes).
export interface SlipLine { selId: string; addedOdds: number; currentOdds: number; suspended: boolean; stake: number }

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const potentialReturn = (stake: number, odds: number) => (stake > 0 ? round2(stake * odds) : 0);
export const oddsChanged = (l: SlipLine) => l.addedOdds !== l.currentOdds;
export const totalStake = (lines: SlipLine[]) => round2(lines.reduce((s, l) => s + (l.stake || 0), 0));
export const totalReturn = (lines: SlipLine[]) =>
  round2(lines.reduce((s, l) => s + potentialReturn(l.stake, l.currentOdds), 0));

export type SlipBlock = "empty" | "no-stake" | "odds-changed" | "suspended" | "balance" | null;
export function slipBlock(lines: SlipLine[], balance: number): SlipBlock {
  if (lines.length === 0) return "empty";
  if (lines.some((l) => l.suspended)) return "suspended";
  if (lines.some(oddsChanged)) return "odds-changed";
  if (lines.some((l) => !(l.stake > 0))) return "no-stake";
  if (totalStake(lines) > balance) return "balance";
  return null;
}

export const cashOutValue = (stake: number, placedOdds: number, currentOdds: number) =>
  round2(((stake * placedOdds) / currentOdds) * 0.95);
