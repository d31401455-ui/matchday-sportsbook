import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CompetitionCard, Crest, FollowStar, LiveBadge, OddsButton, Clock } from "@/components/sb/bits";
import { allPlayers, competitions, footballComps, getComp, matches, resultMarket, searchableMarkets, sports, teams } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sports home — Tidebet" },
      { name: "description", content: "Live now, starting soon and top competitions in one place." },
      { property: "og:title", content: "Sports home — Tidebet" },
      { property: "og:description", content: "Live now, starting soon and top competitions in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

export function SportsNav({ active }: { active?: string }) {
  const { noLive } = useStore();
  const items = [
    { to: "/", label: "Home", key: "home" },
    { to: "/live", label: "Live", key: "live", n: noLive ? 0 : 6 },
    { to: "/football", label: "Football", key: "football" },
  ] as const;
  return (
    <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
      {items.map((i) => (
        <Link key={i.key} to={i.to} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm", active === i.key ? "bg-secondary font-semibold" : "text-muted-foreground hover:text-foreground")}>
          {i.label}{"n" in i && i.n ? <span className="text-live">{i.n}</span> : null}
        </Link>
      ))}
      {sports.slice(1).map((s) => (
        <Link key={s.id} to="/live" className="flex shrink-0 items-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground">{s.name}</Link>
      ))}
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const res = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (k.length < 2) return null;
    const ts = Object.values(teams).filter((t) => t.name.toLowerCase().includes(k)).slice(0, 4);
    return {
      teams: ts.map((t) => ({ t, m: matches.find((m) => m.home.id === t.id || m.away.id === t.id) })),
      players: allPlayers.filter((p) => p.name.toLowerCase().includes(k)).slice(0, 4),
      comps: competitions.filter((c) => c.name.toLowerCase().includes(k)),
      markets: searchableMarkets.filter((m) => m.toLowerCase().includes(k)).slice(0, 4),
    };
  }, [q]);
  const empty = res && !res.teams.length && !res.players.length && !res.comps.length && !res.markets.length;
  const H = ({ c }: { c: string }) => <p className="px-3 pb-1 pt-3 text-[11px] uppercase tracking-wider text-muted-foreground">{c}</p>;
  const row = "flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted";
  return (
    <div className="relative mb-4">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams, players, competitions or markets" aria-label="Search" className="w-full bg-transparent py-3 text-sm outline-none" />
        {q && <button onClick={() => setQ("")} aria-label="Clear search"><X className="h-4 w-4 text-muted-foreground" /></button>}
      </label>
      {res && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover pb-2 shadow-xl">
          {empty && <p className="p-4 text-sm text-muted-foreground">No results for “{q}”.</p>}
          {res.teams.length > 0 && <H c="Teams" />}
          {res.teams.map(({ t, m }) => m ? (
            <Link key={t.id} to="/match/$matchId" params={{ matchId: m.id }} className={row}><Crest team={t} />{t.name}<span className="ml-auto text-xs text-muted-foreground">{m.home.short} v {m.away.short}</span></Link>
          ) : null)}
          {res.players.length > 0 && <H c="Players" />}
          {res.players.map((p) => (
            <Link key={p.name} to="/match/$matchId" params={{ matchId: "ars-bha" }} search={{ g: "Goalscorers" }} className={row}>{p.name}<span className="ml-auto text-xs text-muted-foreground">Anytime goalscorer</span></Link>
          ))}
          {res.comps.length > 0 && <H c="Competitions" />}
          {res.comps.map((c) => (
            <Link key={c.id} to={c.sport === "football" ? "/football" : "/live"} className={row}><span>{c.flag}</span>{c.name}<span className="ml-auto text-xs text-muted-foreground">{c.country}</span></Link>
          ))}
          {res.markets.length > 0 && <H c="Markets" />}
          {res.markets.map((m) => (
            <Link key={m} to="/match/$matchId" params={{ matchId: "ars-bha" }} className={row}>{m}<span className="ml-auto text-xs text-muted-foreground">Arsenal v Brighton</span></Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ id }: { id: string }) {
  const m = matches.find((x) => x.id === id)!;
  const mk = resultMarket(m);
  return (
    <Link to="/match/$matchId" params={{ matchId: m.id }} className="block w-72 shrink-0 rounded-xl border border-border bg-card p-4 hover:border-primary/50">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{getComp(m.competition).name}</span>
        {m.status === "live" ? <span className="flex items-center gap-2"><LiveBadge /><Clock m={m} /></span> : <span>{m.day} · {m.kickoff}</span>}
      </div>
      {[m.home, m.away].map((t, i) => (
        <div key={t.id} className="mb-2 flex items-center gap-2 text-sm">
          <Crest team={t} size={22} /><span className="truncate">{t.name}</span>
          {m.score && <span className="ml-auto font-display font-bold">{m.score[i]}</span>}
        </div>
      ))}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {mk.outcomes.map((o, i) => <OddsButton key={o.id} selId={o.id} base={o.odds} compact label={i === 1 ? "Draw" : (i ? m.away : m.home).short} />)}
      </div>
    </Link>
  );
}

function Home() {
  const { followed, noLive } = useStore();
  const live = noLive ? [] : matches.filter((m) => m.status === "live" && m.competition !== "atp");
  const soon = matches.filter((m) => m.status === "upcoming" && m.day === "Today");
  const favs = followed.map((k) => {
    const [type, id] = k.split(":");
    return type === "comp" ? { k, label: getComp(id as never).name as string } : { k, label: (teams as Record<string, { name: string }>)[id ?? ""]?.name ?? id ?? "" };
  });
  return (
    <>
      <SearchBox />
      <SportsNav active="home" />

      {favs.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-display font-semibold">Following</h2>
          <div className="flex flex-wrap gap-2">
            {favs.map((f) => (
              <span key={f.k} className="flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm">
                {f.label}<FollowStar k={f.k} label={f.label} />
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Featured</h2>
        </div>
        <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 md:mx-0 md:px-0">
          {["ars-bha", "rma-bay", "juv-rom", "liv-mun"].map((id) => <FeaturedCard key={id} id={id} />)}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><span className="h-2 w-2 rounded-full bg-live" />Live now</h2>
          <Link to="/live" className="text-sm text-primary">View all live</Link>
        </div>
        {live.length ? <CompetitionCard title="In play" list={live} /> : <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">Nothing live right now — see Starting soon below.</p>}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Starting soon</h2>
        <CompetitionCard title="Today" list={soon} />
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Top competitions</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {footballComps.map((id) => {
            const c = getComp(id);
            return (
              <Link key={id} to="/football" hash={id} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-sm hover:border-primary/50">
                <span className="text-lg">{c.flag}</span>
                <span className="min-w-0"><span className="block truncate font-semibold">{c.name}</span><span className="text-xs text-muted-foreground">{matches.filter((m) => m.competition === id).length} matches</span></span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
