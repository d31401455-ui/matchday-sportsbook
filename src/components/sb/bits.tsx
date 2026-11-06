import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Lock, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { getComp, marketsFor, resultMarket, type Match, type Team } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function Crest({ team, size = 20 }: { team: Team; size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full border border-border font-display font-bold text-background"
      style={{ width: size, height: size, background: team.color, fontSize: size * 0.36 }}
      aria-hidden
    >
      {team.short.slice(0, 1)}
    </span>
  );
}

export function LiveBadge() {
  return <span className="rounded bg-live px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">Live</span>;
}

export function Clock({ m }: { m: Match }) {
  const { minuteOf } = useStore();
  if (m.status !== "live") return <span className="text-muted-foreground">{m.kickoff}</span>;
  if (m.ht) return <span className="font-semibold">HT</span>;
  if (m.twoWay) return <span className="font-semibold">Set 2</span>;
  return <span className="font-semibold text-live">{minuteOf(m.id, m.minute)}′</span>;
}

export function OddsButton({ selId, label, base, compact, wide }: { selId: string; label: string; base: number; compact?: boolean; wide?: boolean }) {
  const { odds, moves, isSuspended, inSlip, toggle } = useStore();
  const v = odds(selId, base);
  const mv = moves[selId];
  const sus = isSuspended(selId);
  const on = inSlip(selId);
  return (
    <button
      type="button"
      disabled={sus}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(selId); }}
      aria-pressed={on}
      aria-label={`${label} at ${v.toFixed(2)}${sus ? ", suspended" : ""}`}
      className={cn(
        "group relative flex min-w-0 rounded-md text-left transition-colors",
        wide ? "items-center justify-between px-3 py-3" : "flex-col px-3 py-2",
        compact && "px-2 py-1.5",
        on ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent",
        sus && "cursor-not-allowed opacity-50",
        mv === "up" && "flash-up", mv === "down" && "flash-down",
      )}
    >
      <span className={cn("truncate text-xs", on ? "text-primary-foreground" : "text-muted-foreground", wide && "text-sm text-foreground")}>{label}</span>
      <span className={cn("flex items-center gap-1 font-display text-sm font-semibold", on ? "text-primary-foreground" : "text-odds")}>
        {sus ? <Lock className="h-3.5 w-3.5" /> : v.toFixed(2)}
        {mv === "up" && <TrendingUp className="h-3 w-3 text-success" />}
        {mv === "down" && <TrendingDown className="h-3 w-3 text-live" />}
      </span>
    </button>
  );
}

export function MatchRow({ m }: { m: Match }) {
  const { isSuspended } = useStore();
  const mk = resultMarket(m);
  const sus = isSuspended(mk.id);
  const [open, setOpen] = useState(false);
  const quick = open && !m.twoWay ? marketsFor(m).filter((x) => ["dc", "tg25", "btts"].some((k) => x.id.endsWith(`:${k}`))) : [];
  return (
    <div className="border-t border-border">
    <Link
      to="/match/$matchId"
      params={{ matchId: m.id }}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-3 py-3 hover:bg-muted/40 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1.4fr)_48px] md:items-center md:px-4"
    >
      <div className="col-span-2 flex items-center gap-2 text-xs md:col-span-1 md:flex-col md:items-start md:gap-1">
        {m.status === "live" ? <LiveBadge /> : <span className="text-muted-foreground">{m.day}</span>}
        <Clock m={m} />
      </div>
      <div className="min-w-0 space-y-1.5 text-sm">
        {[m.home, m.away].map((t, i) => (
          <div key={t.id} className="flex items-center gap-2">
            <Crest team={t} />
            <span className="truncate">{t.name}</span>
            {m.score && <span className="ml-auto font-display font-semibold">{m.score[i]}</span>}
          </div>
        ))}
      </div>
      <div className="col-span-2 row-start-3 md:col-span-1 md:row-start-auto">
        {sus ? (
          <div className="flex h-12 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium text-warning">
            <Lock className="h-4 w-4" /> Suspended
          </div>
        ) : (
          <div className={cn("grid gap-2", m.twoWay ? "grid-cols-2" : "grid-cols-3")}>
            {mk.outcomes.map((o, i) => (
              <OddsButton key={o.id} selId={o.id} base={o.odds} label={m.twoWay ? (i ? m.away.short : m.home.short) : i === 1 ? "Draw" : (i ? m.away : m.home).name} />
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Hide quick markets" : "Show quick markets"}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className={cn("row-start-2 flex items-center justify-end gap-0.5 self-center rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted md:row-start-auto", open && "bg-muted text-foreground")}
      >
        +{m.more} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
    </Link>
    {open && (
      <div className="space-y-3 bg-muted/30 px-3 pb-3 pt-1 md:px-4 md:pl-[88px]">
        {quick.map((q) => (
          <div key={q.id}>
            <p className="mb-1.5 text-xs text-muted-foreground">{q.name}</p>
            <div className={cn("grid gap-2", q.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
              {q.outcomes.map((o) => <OddsButton key={o.id} selId={o.id} base={o.odds} label={o.label} />)}
            </div>
          </div>
        ))}
        <Link to="/match/$matchId" params={{ matchId: m.id }} className="flex items-center gap-1 text-sm font-medium text-primary">
          All {m.more} markets <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    )}
    </div>
  );
}

export function FollowStar({ k, label }: { k: string; label: string }) {
  const { followed, toggleFollow } = useStore();
  const on = followed.includes(k);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(k); }}
      aria-pressed={on}
      aria-label={on ? `Unfollow ${label}` : `Follow ${label}`}
      className="rounded p-1 hover:bg-muted"
    >
      <Star className={cn("h-4 w-4", on ? "fill-gold text-gold" : "text-muted-foreground")} />
    </button>
  );
}

export function CompetitionCard({ comp, list, title, showFollow = true }: { comp?: ReturnType<typeof getComp>; list: Match[]; title?: string; showFollow?: boolean }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center gap-2 px-3 py-3 md:px-4">
        {comp && <span aria-hidden>{comp.flag}</span>}
        <h3 className="truncate font-display font-semibold">{title ?? comp?.name}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">{list.length} {list.length === 1 ? "match" : "matches"}</span>
        {comp && showFollow && <FollowStar k={`comp:${comp.id}`} label={comp.name} />}
        <span className="ml-auto hidden text-xs text-muted-foreground md:block">Match result</span>
      </header>
      {list.map((m) => <MatchRow key={m.id} m={m} />)}
    </section>
  );
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h1 className="font-display text-xl font-bold md:text-2xl">{children}</h1>
      {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
    </div>
  );
}
