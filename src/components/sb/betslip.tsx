import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Lock, X, XCircle } from "lucide-react";
import { useState } from "react";
import { fmt, useStore } from "@/lib/store";
import { oddsChanged, potentialReturn, totalReturn, totalStake } from "@/lib/slip-rules";
import { cn } from "@/lib/utils";

const USDT = () => <span className="ml-1 rounded-full bg-success px-1 text-[9px] font-bold text-background">₮</span>;

export function SlipTabs({ onClose }: { onClose?: () => void }) {
  const { panelTab, setPanelTab, slip, bets } = useStore();
  const open = bets.filter((b) => b.status === "open").length;
  return (
    <div className="flex items-center gap-1 border-b border-border p-3">
      {([["slip", "Bet slip", slip.length], ["bets", "My bets", open]] as const).map(([k, l, n]) => (
        <button key={k} onClick={() => setPanelTab(k)} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium", panelTab === k ? "bg-secondary" : "text-muted-foreground hover:text-foreground")}>
          {l}
          {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{n}</span>}
        </button>
      ))}
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="ml-auto rounded p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
      )}
    </div>
  );
}

export function BetSlip() {
  const s = useStore();
  const { lines, block, result, placing } = s;

  if (result?.type === "placed") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h3 className="font-display text-lg font-bold">Bet placed</h3>
        <p className="text-sm text-muted-foreground">{result.count} single{result.count > 1 ? "s" : ""} · {fmt(result.stake)} USDT staked</p>
        <div className="flex gap-2">
          <button onClick={() => { s.dismissResult(); s.setPanelTab("bets"); }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">View my bets</button>
          <button onClick={s.dismissResult} className="rounded-md bg-secondary px-4 py-2 text-sm">Done</button>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-medium">Your bet slip is empty</p>
        <p className="text-sm text-muted-foreground">Tap any odds to add a selection.</p>
        <Link to="/live" className="mt-2 inline-flex items-center gap-1 text-sm text-primary">See live matches <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  const stake = totalStake(lines);
  const ret = totalReturn(lines);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className="flex items-center justify-between text-sm">
          <span><b>Singles</b> <span className="text-muted-foreground">· {lines.length} selection{lines.length > 1 ? "s" : ""}</span></span>
          <button onClick={s.clear} className="text-muted-foreground hover:text-foreground">Clear all</button>
        </div>
        {result?.type === "failed" && (
          <div role="alert" className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
            <div><b>Bet failed</b><p className="text-muted-foreground">{result.reason}</p></div>
            <button onClick={s.dismissResult} aria-label="Dismiss" className="ml-auto self-start"><X className="h-4 w-4" /></button>
          </div>
        )}
        {block === "odds-changed" && (
          <div role="alert" className="flex gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <span>Odds have changed. Review and accept the new odds to continue.</span>
          </div>
        )}
        {block === "suspended" && (
          <div role="alert" className="flex items-center gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
            <Lock className="h-5 w-5 shrink-0 text-warning" />
            <span className="flex-1">A selection is suspended. Remove it to place your other bets.</span>
          </div>
        )}
        {lines.map((l) => {
          const changed = oddsChanged(l);
          const sel = s.slip.find((x) => x.selId === l.selId)!;
          return (
            <div key={l.selId} className={cn("rounded-lg border bg-secondary/60 p-3", l.suspended ? "border-warning/60" : changed ? "border-warning/40" : "border-transparent")}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.pick}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.market} · {l.matchLabel}
                    {l.score && <span className="text-live"> {l.score}{l.minute ? ` · ${l.minute}′` : ""}</span>}
                  </p>
                </div>
                <div className="text-right">
                  {l.suspended ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-warning"><Lock className="h-3.5 w-3.5" />Suspended</span>
                  ) : changed ? (
                    <span className="font-display font-bold">
                      <s className="mr-1 text-xs text-muted-foreground">{l.addedOdds.toFixed(2)}</s>
                      <span className={l.currentOdds > l.addedOdds ? "text-success" : "text-live"}>{l.currentOdds.toFixed(2)}</span>
                    </span>
                  ) : (
                    <span className="font-display font-bold text-odds">{l.currentOdds.toFixed(2)}</span>
                  )}
                </div>
                <button onClick={() => s.remove(l.selId)} aria-label={`Remove ${l.pick}`} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              {!l.suspended && (
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex flex-1 items-center gap-1 rounded-md border border-input bg-background px-2 focus-within:ring-2 focus-within:ring-ring">
                    <span className="text-xs text-muted-foreground">USDT</span>
                    <input
                      inputMode="decimal"
                      aria-label={`Stake for ${l.pick}`}
                      placeholder="0.00"
                      value={sel.stake}
                      onChange={(e) => s.setStake(l.selId, e.target.value.replace(/[^0-9.]/g, ""))}
                      className="w-full bg-transparent py-2 text-sm outline-none"
                    />
                  </label>
                  <div className="text-right text-xs">
                    <p className="text-muted-foreground">Returns</p>
                    <p className="font-semibold">{l.stake > 0 ? fmt(potentialReturn(l.stake, l.currentOdds)) : "—"}</p>
                  </div>
                </div>
              )}
              {!l.suspended && (
                <div className="mt-2 flex gap-1.5">
                  {[5, 10, 25, 50].map((q) => (
                    <button key={q} onClick={() => s.setStake(l.selId, String(q))} className="flex-1 rounded bg-muted py-1 text-xs text-muted-foreground hover:text-foreground">{q}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-3 border-t border-border p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total stake <b className="text-foreground">{fmt(stake)}</b><USDT /></span>
          <span className="text-muted-foreground">Potential return <b className="text-foreground">{fmt(ret)}</b><USDT /></span>
        </div>
        {block === "odds-changed" ? (
          <button onClick={s.acceptChanges} className="w-full rounded-md bg-warning py-3 font-semibold text-background">Accept odds changes</button>
        ) : block === "suspended" ? (
          <button onClick={s.removeSuspended} className="w-full rounded-md bg-secondary py-3 font-semibold">Remove suspended selection</button>
        ) : (
          <button
            onClick={() => s.place()}
            disabled={!!block || placing}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-40"
          >
            {placing && <Loader2 className="h-4 w-4 animate-spin" />}
            {placing ? "Placing…" : block === "no-stake" ? "Enter a stake" : block === "balance" ? "Not enough balance" : `Place bet${lines.length > 1 ? "s" : ""} · ${fmt(stake)} USDT`}
          </button>
        )}
      </div>
    </div>
  );
}

export function MyBets({ full }: { full?: boolean }) {
  const s = useStore();
  const [tab, setTab] = useState<"open" | "settled">("open");
  const [confirm, setConfirm] = useState<string | null>(null);
  const open = s.bets.filter((b) => b.status === "open");
  const settled = s.bets.filter((b) => b.status !== "open");
  const list = tab === "open" ? open : settled;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="m-3 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
        {([["open", `Open (${open.length})`], ["settled", `Settled (${settled.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-md py-2 text-sm font-medium", tab === k ? "bg-background" : "text-muted-foreground")}>{l}</button>
        ))}
      </div>
      <div className={cn("min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3", full && "md:grid md:grid-cols-2 md:gap-3 md:space-y-0")}>
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No {tab} bets.</p>}
        {list.map((b) => {
          const co = s.cashOutOf(b);
          return (
            <div key={b.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{b.pick}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.market} · {b.matchLabel}</p>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-muted-foreground">Odds</p><p className="font-semibold text-odds">{b.odds.toFixed(2)}</p></div>
                <div><p className="text-muted-foreground">Stake</p><p className="font-semibold">{fmt(b.stake)} USDT</p></div>
                <div><p className="text-muted-foreground">{b.status === "open" ? "To return" : "Returned"}</p><p className="font-semibold text-success">{fmt(b.status === "open" ? b.stake * b.odds : b.payout ?? 0)} USDT</p></div>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Placed {b.placedAt}</p>
              {b.status === "open" && (
                confirm === b.id ? (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { s.cashOut(b.id); setConfirm(null); }} className="flex-1 rounded-md bg-success py-2 font-semibold text-background">Confirm {fmt(co)} USDT</button>
                    <button onClick={() => setConfirm(null)} className="rounded-md bg-secondary px-3">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirm(b.id)} className="mt-2 w-full rounded-md border border-success/50 py-2 font-semibold text-success hover:bg-success/10">Cash out {fmt(co)} USDT</button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { open: "bg-primary/15 text-primary", won: "bg-success/15 text-success", lost: "bg-destructive/15 text-destructive", cashed: "bg-warning/15 text-warning" };
  return <span className={cn("shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold capitalize", map[status])}>{status === "cashed" ? "Cashed out" : status}</span>;
}

export function SlipPanel({ onClose, full }: { onClose?: () => void; full?: boolean }) {
  const { panelTab } = useStore();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SlipTabs onClose={onClose} />
      {panelTab === "slip" ? <BetSlip /> : <MyBets full={full} />}
    </div>
  );
}
