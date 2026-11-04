import { createFileRoute } from "@tanstack/react-router";
import { SlipPanel } from "@/components/sb/betslip";

export const Route = createFileRoute("/bets")({
  head: () => ({
    meta: [
      { title: "Bet slip & My bets — Tidebet" },
      { name: "description", content: "Place singles in USDT, track open bets and cash out." },
      { property: "og:title", content: "Bet slip & My bets — Tidebet" },
      { property: "og:description", content: "Place singles in USDT, track open bets and cash out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Bets,
});

function Bets() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-xl font-bold md:text-2xl">Bet slip &amp; My bets</h1>
      <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-card">
        <SlipPanel full />
      </div>
    </div>
  );
}
