import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CompetitionCard, PageTitle } from "@/components/sb/bits";
import { competitions, matches, sportOf, sports, type CompetitionId, type SportId } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live betting — Tidebet" },
      { name: "description", content: "Every match in play with live scores, clocks and odds." },
      { property: "og:title", content: "Live betting — Tidebet" },
      { property: "og:description", content: "Every match in play with live scores, clocks and odds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Live,
});

function Live() {
  const { noLive } = useStore();
  const [sport, setSport] = useState<SportId | "all">("all");
  const [comp, setComp] = useState<CompetitionId | "all">("all");
  const live = noLive ? [] : matches.filter((m) => m.status === "live");
  const bySport = live.filter((m) => sport === "all" || sportOf(m) === sport);
  const shown = bySport.filter((m) => comp === "all" || m.competition === comp);
  const comps = competitions.filter((c) => bySport.some((m) => m.competition === c.id));
  const chip = (on: boolean) => cn("shrink-0 rounded-lg px-3 py-2 text-sm", on ? "bg-secondary font-semibold" : "text-muted-foreground hover:text-foreground");

  return (
    <>
      <PageTitle sub={`${live.length} in play`}>Live now</PageTitle>
      <div className="no-scrollbar mb-3 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5" role="tablist" aria-label="Sport">
        <button className={chip(sport === "all")} onClick={() => { setSport("all"); setComp("all"); }}>All <span className="text-muted-foreground">{live.length}</span></button>
        {sports.map((s) => (
          <button key={s.id} className={chip(sport === s.id)} onClick={() => { setSport(s.id); setComp("all"); }}>
            {s.name} <span className="text-muted-foreground">{live.filter((m) => sportOf(m) === s.id).length}</span>
          </button>
        ))}
      </div>
      {comps.length > 1 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto" aria-label="Competition">
          <button onClick={() => setComp("all")} className={cn("shrink-0 rounded-full border px-3 py-1 text-xs", comp === "all" ? "border-primary text-primary" : "border-border text-muted-foreground")}>All competitions</button>
          {comps.map((c) => (
            <button key={c.id} onClick={() => setComp(c.id)} className={cn("shrink-0 rounded-full border px-3 py-1 text-xs", comp === c.id ? "border-primary text-primary" : "border-border text-muted-foreground")}>{c.flag} {c.name}</button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <>
          <div className="mb-6 rounded-xl border border-border bg-card p-6 text-center">
            <p className="font-semibold">Nothing live right now</p>
            <p className="text-sm text-muted-foreground">These matches start soon — add them to your slip now.</p>
          </div>
          <h2 className="mb-2 font-display text-lg font-semibold">Starting soon</h2>
          <CompetitionCard title="Next up" list={matches.filter((m) => m.status === "upcoming").slice(0, 5)} />
        </>
      ) : (
        <div className="space-y-4">
          {competitions.filter((c) => shown.some((m) => m.competition === c.id)).map((c) => (
            <CompetitionCard key={c.id} comp={c} list={shown.filter((m) => m.competition === c.id)} />
          ))}
        </div>
      )}
    </>
  );
}
