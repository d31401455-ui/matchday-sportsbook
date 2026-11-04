import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { findOutcome, initialSuspended, matches, resultMarket } from "./data";
import { cashOutValue, round2, slipBlock, type SlipLine } from "./slip-rules";

export interface Selection { selId: string; addedOdds: number; stake: string }
export interface PlacedBet {
  id: string; selId: string; pick: string; market: string; matchId: string; matchLabel: string;
  odds: number; stake: number; placedAt: string;
  status: "open" | "won" | "lost" | "cashed"; payout?: number;
}
export type SlipResult = { type: "placed"; count: number; stake: number } | { type: "failed"; reason: string } | null;

const seedBets: PlacedBet[] = [
  { id: "b1", selId: "ars-bha:1x2:0", pick: "Arsenal", market: "Match result", matchId: "ars-bha", matchLabel: "Arsenal v Brighton & Hove Albion", odds: 1.8, stake: 20, placedAt: "Nov 4 · 08:12", status: "open" },
  { id: "b2", selId: "juv-rom:btts:0", pick: "Yes", market: "Both teams to score", matchId: "juv-rom", matchLabel: "Juventus v Roma", odds: 1.9, stake: 15, placedAt: "Nov 4 · 08:30", status: "open" },
  { id: "s1", selId: "x", pick: "Over 2.5", market: "Total goals 2.5", matchId: "liv-mun", matchLabel: "Liverpool v Manchester United", odds: 1.75, stake: 25, placedAt: "Nov 1 · 15:02", status: "won", payout: 43.75 },
  { id: "s2", selId: "x", pick: "Inter", market: "Match result", matchId: "int-mil", matchLabel: "Inter v AC Milan", odds: 2.05, stake: 10, placedAt: "Oct 30 · 19:40", status: "lost", payout: 0 },
  { id: "s3", selId: "x", pick: "Draw", market: "Match result", matchId: "bvb-lev", matchLabel: "Borussia Dortmund v Bayer Leverkusen", odds: 3.6, stake: 5, placedAt: "Oct 28 · 18:10", status: "lost", payout: 0 },
  { id: "s4", selId: "x", pick: "Real Madrid", market: "Match result", matchId: "rma-bay", matchLabel: "Real Madrid v Barcelona", odds: 2.1, stake: 30, placedAt: "Oct 26 · 20:55", status: "cashed", payout: 41.2 },
];

interface Store {
  odds: (selId: string, base: number) => number;
  moves: Record<string, "up" | "down">;
  isSuspended: (selId: string) => boolean;
  minuteOf: (matchId: string, base?: number) => number | undefined;
  slip: Selection[];
  inSlip: (selId: string) => boolean;
  toggle: (selId: string) => void;
  remove: (selId: string) => void;
  clear: () => void;
  setStake: (selId: string, stake: string) => void;
  acceptChanges: () => void;
  removeSuspended: () => void;
  lines: (SlipLine & { pick: string; market: string; matchLabel: string; matchId: string; score?: string; minute?: number })[];
  block: ReturnType<typeof slipBlock>;
  place: (force?: "success" | "fail") => void;
  placing: boolean;
  result: SlipResult;
  dismissResult: () => void;
  bets: PlacedBet[];
  cashOut: (id: string) => void;
  cashOutOf: (b: PlacedBet) => number;
  balance: number;
  followed: string[];
  toggleFollow: (key: string) => void;
  noLive: boolean;
  setNoLive: (v: boolean) => void;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
  panelTab: "slip" | "bets";
  setPanelTab: (t: "slip" | "bets") => void;
  demo: { oddsChanged: () => void; suspend: () => void; placed: () => void; failed: () => void; reset: () => void };
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

const nudge = (v: number, dir: 1 | -1) => round2(Math.max(1.01, v + dir * Math.max(0.02, round2(v * 0.06))));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [over, setOver] = useState<Record<string, number>>({});
  const [moves, setMoves] = useState<Record<string, "up" | "down">>({});
  const [suspended, setSuspended] = useState<string[]>(initialSuspended);
  const [elapsed, setElapsed] = useState(0);
  const [slip, setSlip] = useState<Selection[]>([]);
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState<SlipResult>(null);
  const [bets, setBets] = useState<PlacedBet[]>(seedBets);
  const [balance, setBalance] = useState(1250);
  const [followed, setFollowed] = useState<string[]>(["comp:epl", "team:ars"]);
  const [noLive, setNoLive] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<"slip" | "bets">("slip");
  const slipRef = useRef(slip);
  slipRef.current = slip;

  const odds = useCallback((selId: string, base: number) => over[selId] ?? base, [over]);
  const isSuspended = useCallback(
    (selId: string) => suspended.includes(selId) || suspended.includes(selId.split(":").slice(0, 2).join(":")) || suspended.includes(selId.split(":")[0]),
    [suspended],
  );
  const minuteOf = useCallback((matchId: string, base?: number) => {
    const m = matches.find((x) => x.id === matchId);
    if (!m || m.status !== "live" || m.ht || base === undefined || base === 0) return base;
    return Math.min(90, base + Math.floor(elapsed / 60));
  }, [elapsed]);

  // Live clock + gentle odds drift on live match-result prices not in the slip.
  useEffect(() => {
    const clock = setInterval(() => setElapsed((e) => e + 1), 1000);
    const drift = setInterval(() => {
      const live = matches.filter((m) => m.status === "live");
      const m = live[Math.floor(Math.random() * live.length)];
      const outs = resultMarket(m).outcomes.filter((x) => !slipRef.current.some((s) => s.selId === x.id));
      const out = outs[Math.floor(Math.random() * outs.length)];
      if (!out) return;
      const dir = Math.random() > 0.5 ? 1 : -1;
      setOver((p) => ({ ...p, [out.id]: nudge(p[out.id] ?? out.odds, dir) }));
      setMoves((p) => ({ ...p, [out.id]: dir > 0 ? "up" : "down" }));
      setTimeout(() => setMoves((p) => { const n = { ...p }; delete n[out.id]; return n; }), 1800);
    }, 4000);
    return () => { clearInterval(clock); clearInterval(drift); };
  }, []);

  const currentOdds = (selId: string) => {
    const f = findOutcome(selId);
    return f ? odds(selId, f.outcome.odds) : 0;
  };

  const lines = slip.map((s) => {
    const f = findOutcome(s.selId)!;
    return {
      selId: s.selId, addedOdds: s.addedOdds, currentOdds: currentOdds(s.selId), suspended: isSuspended(s.selId),
      stake: parseFloat(s.stake) || 0, pick: f.outcome.label, market: f.market.name, matchId: f.match.id,
      matchLabel: `${f.match.home.name} v ${f.match.away.name}`,
      score: f.match.score ? `${f.match.score[0]}–${f.match.score[1]}` : undefined,
      minute: f.match.status === "live" ? minuteOf(f.match.id, f.match.minute) : undefined,
    };
  });
  const block = slipBlock(lines, balance);

  const toggle = (selId: string) => {
    if (isSuspended(selId)) return;
    setResult(null);
    setSlip((p) => (p.some((s) => s.selId === selId) ? p.filter((s) => s.selId !== selId) : [...p, { selId, addedOdds: currentOdds(selId), stake: "" }]));
  };

  const doPlace = (outcome: "success" | "fail", ls = lines) => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      if (outcome === "fail") {
        setResult({ type: "failed", reason: "We couldn't place your bet. Your balance hasn't changed — please try again." });
        return;
      }
      const stake = round2(ls.reduce((s, l) => s + l.stake, 0));
      const now = new Date();
      const stamp = `Nov 4 · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setBets((p) => [
        ...ls.map((l, i) => ({ id: `n${Date.now()}${i}`, selId: l.selId, pick: l.pick, market: l.market, matchId: l.matchId, matchLabel: l.matchLabel, odds: l.currentOdds, stake: l.stake, placedAt: stamp, status: "open" as const })),
        ...p,
      ]);
      setBalance((b) => round2(b - stake));
      setSlip([]);
      setResult({ type: "placed", count: ls.length, stake });
    }, 900);
  };

  const ensureDemoSlip = () => {
    if (slipRef.current.length) return null;
    const selId = "ars-bha:1x2:0";
    const sel = { selId, addedOdds: currentOdds(selId), stake: "10" };
    setSlip([sel]);
    return sel;
  };

  const demo = {
    oddsChanged: () => {
      const seeded = ensureDemoSlip();
      const targets = seeded ? [seeded] : slipRef.current;
      setResult(null);
      setOver((p) => {
        const n = { ...p };
        targets.forEach((s, i) => { n[s.selId] = nudge(n[s.selId] ?? s.addedOdds, i % 2 ? 1 : -1); });
        return n;
      });
      setPanelOpen(true); setPanelTab("slip");
    },
    suspend: () => {
      const seeded = ensureDemoSlip();
      const target = seeded ?? slipRef.current[0];
      setResult(null);
      setSuspended((p) => [...p, target.selId]);
      setPanelOpen(true); setPanelTab("slip");
    },
    placed: () => {
      const seeded = ensureDemoSlip();
      setPanelOpen(true); setPanelTab("slip");
      if (seeded) {
        const f = findOutcome(seeded.selId)!;
        doPlace("success", [{ selId: seeded.selId, addedOdds: seeded.addedOdds, currentOdds: seeded.addedOdds, suspended: false, stake: 10, pick: f.outcome.label, market: f.market.name, matchId: f.match.id, matchLabel: `${f.match.home.name} v ${f.match.away.name}` }]);
      } else doPlace("success");
    },
    failed: () => { ensureDemoSlip(); setPanelOpen(true); setPanelTab("slip"); doPlace("fail"); },
    reset: () => { setOver({}); setSuspended(initialSuspended); setSlip([]); setResult(null); setNoLive(false); setBets(seedBets); setBalance(1250); },
  };

  const cashOutOf = (b: PlacedBet) => {
    const f = findOutcome(b.selId);
    return cashOutValue(b.stake, b.odds, f ? odds(b.selId, f.outcome.odds) : b.odds);
  };

  const value: Store = {
    odds, moves, isSuspended, minuteOf, slip,
    inSlip: (id) => slip.some((s) => s.selId === id),
    toggle,
    remove: (id) => setSlip((p) => p.filter((s) => s.selId !== id)),
    clear: () => setSlip([]),
    setStake: (id, stake) => setSlip((p) => p.map((s) => (s.selId === id ? { ...s, stake } : s))),
    acceptChanges: () => setSlip((p) => p.map((s) => ({ ...s, addedOdds: currentOdds(s.selId) }))),
    removeSuspended: () => setSlip((p) => p.filter((s) => !isSuspended(s.selId))),
    lines, block,
    place: (force) => { if (!block || force) doPlace(force ?? "success"); },
    placing, result, dismissResult: () => setResult(null),
    bets,
    cashOut: (id) => setBets((p) => p.map((b) => (b.id === id ? { ...b, status: "cashed", payout: cashOutOf(b) } : b))).valueOf(),
    cashOutOf, balance,
    followed,
    toggleFollow: (k) => setFollowed((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k])),
    noLive, setNoLive, panelOpen, setPanelOpen, panelTab, setPanelTab, demo,
  };
  // credit cash-out to balance
  const cashOut = value.cashOut;
  value.cashOut = (id) => { const b = bets.find((x) => x.id === id); if (b) setBalance((x) => round2(x + cashOutOf(b))); cashOut(id); };

  return <Ctx.Provider value={useMemo(() => value, [value])}>{children}</Ctx.Provider>;
}

export const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
