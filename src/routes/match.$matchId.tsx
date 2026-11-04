import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, Lock, Search } from "lucide-react";
import { useState } from "react";
import { Crest, FollowStar, OddsButton } from "@/components/sb/bits";
import { getComp, getMatch, marketGroups, marketsFor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/match/$matchId")({
  validateSearch: (s: Record<string, unknown>): { g?: string } => (typeof s["g"] === "string" ? { g: s["g"] } : {}),
  loader: ({ params }) => {
    const m = getMatch(params.matchId);
    if (!m) throw notFound();
    return { title: `${m.home.name} v ${m.away.name}` };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.title} odds — Tidebet` : "Match — Tidebet";
    return {
      meta: [
        { title: t },
        { name: "description", content: "Live score, clock and every market for this match." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Live score, clock and every market for this match." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: MatchPage,
});

function MatchPage() {
  const { matchId } = Route.useParams();
  const { g } = Route.useSearch();
  const m = getMatch(matchId)!;
  const s = useStore();
  const [group, setGroup] = useState<string>(g && (marketGroups as readonly string[]).includes(g) ? g : "Popular");
  const [q, setQ] = useState("");
  const [closed, setClosed] = useState<string[]>([]);
  const all = marketsFor(m);
  const list = all.filter((x) => (q ? x.name.toLowerCase().includes(q.toLowerCase()) || x.outcomes.some((o) => o.label.toLowerCase().includes(q.toLowerCase())) : x.group === group));
  const comp = getComp(m.competition);
  const minute = s.minuteOf(m.id, m.minute);

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link to={m.status === "live" ? "/live" : "/football"} aria-label="Back" className="rounded-md bg-secondary p-2"><ChevronLeft className="h-4 w-4" /></Link>
        <nav aria-label="Breadcrumb" className="no-scrollbar flex items-center gap-2 overflow-x-auto whitespace-nowrap text-muted-foreground">
          <Link to="/football" className="hover:text-foreground">Football</Link><span>/</span>
          <Link to="/football" hash={comp.id} className="hover:text-foreground">{comp.name}</Link><span>/</span>
          <span className="text-foreground">{m.home.short} – {m.away.short}</span>
        </nav>
      </div>

      <section className="mb-4 rounded-xl border border-border bg-card p-4 md:p-6">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{comp.name}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {[m.home, m.away].map((t, i) => (
            <div key={t.id} className={cn("flex min-w-0 flex-col items-center gap-2 text-center md:flex-row md:gap-3", i === 0 ? "col-start-1 md:text-left" : "col-start-3 row-start-1 md:flex-row-reverse md:text-right")}>
              <Crest team={t} size={48} />
              <div className="min-w-0">
                <p className="line-clamp-2 font-display font-bold md:text-lg">{t.name}</p>
                <div className={cn("mt-1 flex justify-center", i === 0 ? "md:justify-start" : "md:justify-end")}><FollowStar k={`team:${t.id}`} label={t.name} /></div>
              </div>
            </div>
          ))}
          <div className="col-start-2 row-start-1 text-center">
            {m.score ? (
              <div className="flex items-center gap-2 font-display text-3xl font-bold" aria-label={`Score ${m.score[0]} ${m.score[1]}`}>
                <span className="rounded-md bg-secondary px-3 py-1">{m.score[0]}</span>–<span className="rounded-md bg-secondary px-3 py-1">{m.score[1]}</span>
              </div>
            ) : (
              <p className="font-display text-2xl font-bold">{m.kickoff}</p>
            )}
            <p className="mt-2 text-sm">
              {m.status === "live" ? (
                <span className="inline-flex items-center gap-1.5 rounded bg-live/15 px-2 py-0.5 font-semibold text-live"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" />LIVE {m.ht ? "HT" : m.twoWay ? "Set 2" : `${minute}′`}</span>
              ) : <span className="text-muted-foreground">{m.day}</span>}
            </p>
          </div>
        </div>
      </section>

      <label className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search markets or players" aria-label="Search markets" className="w-full bg-transparent py-3 text-sm outline-none" />
      </label>

      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5" role="tablist">
        {marketGroups.map((gr) => (
          <button key={gr} role="tab" aria-selected={group === gr && !q} onClick={() => { setGroup(gr); setQ(""); }} className={cn("shrink-0 rounded-lg px-3 py-2 text-sm", group === gr && !q ? "bg-secondary font-semibold" : "text-muted-foreground hover:text-foreground")}>
            {gr} <span className="text-muted-foreground">{all.filter((x) => x.group === gr).length}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No markets match “{q}”.</p>}
        {list.map((mk) => {
          const isClosed = closed.includes(mk.id);
          const sus = s.isSuspended(mk.id);
          return (
            <section key={mk.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <button onClick={() => setClosed((p) => (isClosed ? p.filter((x) => x !== mk.id) : [...p, mk.id]))} className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={!isClosed}>
                <span className="flex items-center gap-2 font-display font-semibold">{mk.name}{sus && <span className="flex items-center gap-1 rounded bg-warning/15 px-2 py-0.5 text-xs text-warning"><Lock className="h-3 w-3" />Suspended</span>}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !isClosed && "rotate-180")} />
              </button>
              {!isClosed && (
                <div className={cn("grid gap-2 border-t border-border p-3", mk.cols === 2 ? "grid-cols-1 sm:grid-cols-2" : mk.outcomes.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3")}>
                  {mk.outcomes.map((o) => <OddsButton key={o.id} selId={o.id} base={o.odds} label={o.label} wide />)}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
