import { createFileRoute } from "@tanstack/react-router";
import { CompetitionCard, Crest, FollowStar, PageTitle } from "@/components/sb/bits";
import { footballComps, getComp, matches, teams } from "@/lib/data";

export const Route = createFileRoute("/football")({
  head: () => ({
    meta: [
      { title: "Football odds — Tidebet" },
      { name: "description", content: "Premier League, Champions League, LaLiga, Serie A and Bundesliga match odds." },
      { property: "og:title", content: "Football odds — Tidebet" },
      { property: "og:description", content: "Premier League, Champions League, LaLiga, Serie A and Bundesliga match odds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Football,
});

function Football() {
  const followTeams = [teams.ars, teams.rma, teams.juv, teams.liv, teams.bay, teams.new];
  return (
    <>
      <PageTitle sub="Match result odds">Football</PageTitle>
      <section className="mb-5">
        <p className="mb-2 text-sm text-muted-foreground">Follow teams to see them first on Sports home</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {followTeams.map((t) => (
            <span key={t.id} className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pl-2 pr-1 text-sm">
              <Crest team={t} />{t.name}<FollowStar k={`team:${t.id}`} label={t.name} />
            </span>
          ))}
        </div>
      </section>
      <div className="space-y-4">
        {footballComps.map((id) => (
          <div key={id} id={id} className="scroll-mt-20">
            <CompetitionCard comp={getComp(id)} list={matches.filter((m) => m.competition === id)} />
          </div>
        ))}
      </div>
    </>
  );
}
