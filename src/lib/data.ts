// Sample data only — fictional prices, no real money.
export type SportId = "football" | "tennis" | "basketball";
export type CompetitionId = "epl" | "ucl" | "laliga" | "seriea" | "bundesliga" | "atp" | "nba";

export interface Team { id: string; name: string; short: string; color: string }
export interface Competition { id: CompetitionId; name: string; country: string; sport: SportId; flag: string }
export interface Match {
  id: string;
  competition: CompetitionId;
  home: Team;
  away: Team;
  status: "live" | "upcoming";
  minute?: number; // live minute; 45 + ht flag
  ht?: boolean;
  score?: [number, number];
  kickoff?: string; // display
  day?: string;
  result: [number, number, number]; // 1 X 2 base odds (or 1 / 2 for 2-way)
  twoWay?: boolean;
  more: number;
}

export const sports: { id: SportId; name: string }[] = [
  { id: "football", name: "Football" },
  { id: "tennis", name: "Tennis" },
  { id: "basketball", name: "Basketball" },
];

export const competitions: Competition[] = [
  { id: "epl", name: "Premier League", country: "England", sport: "football", flag: "🏴" },
  { id: "ucl", name: "Champions League", country: "Europe", sport: "football", flag: "🇪🇺" },
  { id: "laliga", name: "LaLiga", country: "Spain", sport: "football", flag: "🇪🇸" },
  { id: "seriea", name: "Serie A", country: "Italy", sport: "football", flag: "🇮🇹" },
  { id: "bundesliga", name: "Bundesliga", country: "Germany", sport: "football", flag: "🇩🇪" },
  { id: "atp", name: "ATP Finals", country: "Italy", sport: "tennis", flag: "🎾" },
  { id: "nba", name: "NBA", country: "USA", sport: "basketball", flag: "🏀" },
];
export const footballComps: CompetitionId[] = ["epl", "ucl", "laliga", "seriea", "bundesliga"];

const t = (id: string, name: string, short: string, color: string): Team => ({ id, name, short, color });
export const teams = {
  ars: t("ars", "Arsenal", "ARS", "oklch(0.58 0.22 27)"),
  bha: t("bha", "Brighton & Hove Albion", "BHA", "oklch(0.55 0.15 250)"),
  avl: t("avl", "Aston Villa", "AVL", "oklch(0.45 0.15 10)"),
  ful: t("ful", "Fulham", "FUL", "oklch(0.92 0 0)"),
  new: t("new", "Newcastle United", "NEW", "oklch(0.35 0 0)"),
  eve: t("eve", "Everton", "EVE", "oklch(0.45 0.16 260)"),
  liv: t("liv", "Liverpool", "LIV", "oklch(0.55 0.21 25)"),
  mun: t("mun", "Manchester United", "MUN", "oklch(0.55 0.22 28)"),
  rma: t("rma", "Real Madrid", "RMA", "oklch(0.95 0.02 90)"),
  bay: t("bay", "Bayern Munich", "BAY", "oklch(0.55 0.22 25)"),
  juv: t("juv", "Juventus", "JUV", "oklch(0.3 0 0)"),
  rom: t("rom", "Roma", "ROM", "oklch(0.5 0.17 30)"),
  atm: t("atm", "Atlético Madrid", "ATM", "oklch(0.55 0.2 25)"),
  sev: t("sev", "Sevilla", "SEV", "oklch(0.9 0.02 90)"),
  bar: t("bar", "Barcelona", "BAR", "oklch(0.45 0.17 300)"),
  vil: t("vil", "Villarreal", "VIL", "oklch(0.85 0.17 95)"),
  int: t("int", "Inter", "INT", "oklch(0.45 0.15 255)"),
  mil: t("mil", "AC Milan", "MIL", "oklch(0.52 0.2 25)"),
  lev: t("lev", "Bayer Leverkusen", "B04", "oklch(0.55 0.22 27)"),
  bvb: t("bvb", "Borussia Dortmund", "BVB", "oklch(0.85 0.17 95)"),
  psg: t("psg", "Paris Saint-Germain", "PSG", "oklch(0.4 0.15 260)"),
  mci: t("mci", "Manchester City", "MCI", "oklch(0.75 0.1 230)"),
  sin: t("sin", "J. Sinner", "SIN", "oklch(0.6 0.1 60)"),
  alc: t("alc", "C. Alcaraz", "ALC", "oklch(0.6 0.15 30)"),
  lal: t("lal", "LA Lakers", "LAL", "oklch(0.5 0.2 300)"),
  bos: t("bos", "Boston Celtics", "BOS", "oklch(0.55 0.15 150)"),
};

export const matches: Match[] = [
  { id: "ars-bha", competition: "epl", home: teams.ars, away: teams.bha, status: "live", minute: 52, score: [1, 0], result: [1.3, 4.6, 11.0], more: 115 },
  { id: "avl-ful", competition: "epl", home: teams.avl, away: teams.ful, status: "live", minute: 45, ht: true, score: [0, 0], result: [2.25, 2.9, 3.6], more: 7 },
  { id: "new-eve", competition: "epl", home: teams.new, away: teams.eve, status: "live", minute: 58, score: [2, 1], result: [1.36, 4.75, 8.5], more: 6 },
  { id: "juv-rom", competition: "seriea", home: teams.juv, away: teams.rom, status: "live", minute: 49, score: [1, 1], result: [2.4, 3.1, 3.2], more: 6 },
  { id: "atm-sev", competition: "laliga", home: teams.atm, away: teams.sev, status: "live", minute: 37, score: [1, 0], result: [1.55, 3.9, 6.5], more: 8 },
  { id: "sin-alc", competition: "atp", home: teams.sin, away: teams.alc, status: "live", minute: 0, score: [1, 0], result: [1.62, 0, 2.25], twoWay: true, more: 24 },
  { id: "lal-bos", competition: "nba", home: teams.lal, away: teams.bos, status: "upcoming", kickoff: "01:30", day: "Tomorrow", result: [2.1, 0, 1.74], twoWay: true, more: 40 },
  { id: "rma-bay", competition: "ucl", home: teams.rma, away: teams.bay, status: "upcoming", kickoff: "20:00", day: "Today", result: [2.2, 3.7, 2.9], more: 142 },
  { id: "psg-int", competition: "ucl", home: teams.psg, away: teams.int, status: "upcoming", kickoff: "20:00", day: "Today", result: [1.95, 3.6, 3.8], more: 131 },
  { id: "liv-mun", competition: "epl", home: teams.liv, away: teams.mun, status: "upcoming", kickoff: "16:30", day: "Sun, Nov 8", result: [1.65, 4.0, 4.33], more: 120 },
  { id: "mci-new", competition: "epl", home: teams.mci, away: teams.eve, status: "upcoming", kickoff: "15:00", day: "Sat, Nov 7", result: [1.28, 5.75, 9.5], more: 118 },
  { id: "bar-vil", competition: "laliga", home: teams.bar, away: teams.vil, status: "upcoming", kickoff: "21:00", day: "Sat, Nov 7", result: [1.45, 4.75, 6.0], more: 98 },
  { id: "int-mil", competition: "seriea", home: teams.int, away: teams.mil, status: "upcoming", kickoff: "20:45", day: "Sun, Nov 8", result: [2.05, 3.4, 3.6], more: 101 },
  { id: "bvb-lev", competition: "bundesliga", home: teams.bvb, away: teams.lev, status: "upcoming", kickoff: "18:30", day: "Sat, Nov 7", result: [2.6, 3.6, 2.5], more: 104 },
];

export const getMatch = (id: string) => matches.find((m) => m.id === id);
export const getComp = (id: CompetitionId) => competitions.find((c) => c.id === id)!;
export const sportOf = (m: Match) => getComp(m.competition).sport;

export interface Outcome { id: string; label: string; odds: number }
export interface Market { id: string; name: string; group: string; outcomes: Outcome[]; cols?: number }

export const marketGroups = ["Popular", "Goals", "Halves", "Handicaps", "Goalscorers", "Corners & cards"] as const;

const players: Record<string, string[]> = {
  ars: ["B. Saka", "G. Jesus", "M. Ødegaard", "L. Trossard", "K. Havertz"],
  bha: ["D. Welbeck", "J. Pedro", "K. Mitoma", "S. March"],
};
export const allPlayers = Object.entries(players).flatMap(([team, ps]) => ps.map((p) => ({ name: p, team })));

const o = (mid: string, label: string, odds: number, i: number): Outcome => ({ id: `${mid}:${i}`, label, odds });
const mk = (matchId: string, key: string, name: string, group: string, outs: [string, number][], cols?: number): Market => {
  const mid = `${matchId}:${key}`;
  return { id: mid, name, group, cols, outcomes: outs.map(([l, od], i) => o(mid, l, od, i)) };
};

export function resultMarket(m: Match): Market {
  const outs: [string, number][] = m.twoWay
    ? [[m.home.name, m.result[0]], [m.away.name, m.result[2]]]
    : [[m.home.name, m.result[0]], ["Draw", m.result[1]], [m.away.name, m.result[2]]];
  return mk(m.id, "1x2", "Match result", "Popular", outs);
}

export function marketsFor(m: Match): Market[] {
  const h = m.home.name, a = m.away.name, id = m.id;
  const ps = players[m.home.id] ?? [`${m.home.short} Forward`, `${m.home.short} Winger`];
  const pa = players[m.away.id] ?? [`${m.away.short} Forward`, `${m.away.short} Winger`];
  return [
    resultMarket(m),
    mk(id, "dc", "Double chance", "Popular", [[`${h} or draw`, 1.03], [`${h} or ${a}`, 1.18], [`Draw or ${a}`, 3.3]]),
    mk(id, "tg25", "Total goals 2.5", "Popular", [["Over 2.5", 2.73], ["Under 2.5", 1.44]]),
    mk(id, "btts", "Both teams to score", "Popular", [["Yes", 2.4], ["No", 1.53]]),
    mk(id, "next", "Next goal", "Goals", [[h, 1.85], ["No goal", 5.5], [a, 3.4]]),
    mk(id, "tg15", "Total goals 1.5", "Goals", [["Over 1.5", 1.36], ["Under 1.5", 3.05]]),
    mk(id, "tg35", "Total goals 3.5", "Goals", [["Over 3.5", 5.2], ["Under 3.5", 1.14]]),
    mk(id, "2h", "2nd half result", "Halves", [[h, 2.05], ["Draw", 2.1], [a, 5.8]]),
    mk(id, "2htg", "2nd half total goals 1.5", "Halves", [["Over 1.5", 3.1], ["Under 1.5", 1.33]]),
    mk(id, "ah1", "Asian handicap -1.5 / +1.5", "Handicaps", [[`${h} -1.5`, 3.25], [`${a} +1.5`, 1.32]]),
    mk(id, "eh1", "Handicap -1", "Handicaps", [[`${h} -1`, 2.15], ["Draw (-1)", 3.5], [`${a} +1`, 2.8]]),
    mk(id, "ags", "Anytime goalscorer", "Goalscorers", [...ps.map((p, i): [string, number] => [p, +(2.6 + i * 0.9).toFixed(2)]), ...pa.map((p, i): [string, number] => [p, +(5.5 + i * 1.5).toFixed(2)])], 2),
    mk(id, "cor", "Total corners 9.5", "Corners & cards", [["Over 9.5", 1.8], ["Under 9.5", 1.95]]),
    mk(id, "crd", "Total cards 3.5", "Corners & cards", [["Over 3.5", 2.1], ["Under 3.5", 1.67]]),
  ];
}

// Markets suspended from the start (sample: Newcastle v Everton after a VAR check)
export const initialSuspended = ["new-eve:1x2", "atm-sev:1x2"];

export function findOutcome(selId: string): { match: Match; market: Market; outcome: Outcome } | null {
  const matchId = selId.split(":")[0];
  const match = getMatch(matchId);
  if (!match) return null;
  for (const market of marketsFor(match)) {
    const outcome = market.outcomes.find((x) => x.id === selId);
    if (outcome) return { match, market, outcome };
  }
  return null;
}

export const searchableMarkets = ["Match result", "Double chance", "Total goals", "Both teams to score", "Next goal", "Anytime goalscorer", "Asian handicap", "Total corners", "Total cards", "2nd half result"];
