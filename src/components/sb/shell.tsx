import { Link, useRouterState } from "@tanstack/react-router";
import { CircleDot, FlaskConical, Home, Menu, PanelLeft, PanelRight, Receipt, Search, Trophy, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { fmt, useStore } from "@/lib/store";
import { totalReturn } from "@/lib/slip-rules";
import { cn } from "@/lib/utils";
import { SlipPanel } from "./betslip";

const nav = [
  { to: "/", label: "Sports home", icon: Home },
  { to: "/live", label: "Live", icon: CircleDot },
  { to: "/football", label: "Football", icon: Trophy },
  { to: "/bets", label: "Bet slip & My bets", icon: Receipt },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const s = useStore();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [navOpen, setNavOpen] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  const onBetsPage = path === "/bets";
  const liveCount = s.noLive ? 0 : 6;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-topbar px-3 md:h-16 md:px-4">
        <button onClick={() => setNavOpen((v) => !v)} aria-label="Toggle navigation" className="hidden rounded-md bg-secondary p-2 md:block"><PanelLeft className="h-4 w-4" /></button>
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight md:text-xl">
          <span className="text-primary">Tide</span>bet
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="rounded-md bg-secondary px-3 py-1.5 text-right leading-tight">
            <p className="text-[10px] text-muted-foreground">Demo balance</p>
            <p className="text-sm font-semibold">{fmt(s.balance)} <span className="text-success">USDT</span></p>
          </div>
          <Link to="/" aria-label="Search" className="hidden rounded-md bg-secondary p-2.5 md:block"><Search className="h-4 w-4" /></Link>
          <button
            onClick={() => s.setPanelOpen(!s.panelOpen)}
            aria-label="Toggle bet slip panel"
            className={cn("relative hidden rounded-md bg-secondary p-2.5 lg:block", s.panelOpen && "ring-1 ring-primary")}
          >
            <PanelRight className="h-4 w-4" />
            {s.slip.length > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{s.slip.length}</span>}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Left nav (desktop) */}
        <nav aria-label="Main" className={cn("sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-2 md:flex", navOpen ? "w-56" : "w-14")}>
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} title={n.label} className={cn("flex items-center gap-3 rounded-md px-2.5 py-2 text-sm", active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground")}>
                <n.icon className={cn("h-4 w-4 shrink-0", n.to === "/live" && "text-live")} />
                {navOpen && <span className="truncate">{n.label}</span>}
                {navOpen && n.to === "/live" && liveCount > 0 && <span className="ml-auto text-xs text-live">{liveCount}</span>}
              </Link>
            );
          })}
          {navOpen && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="px-2.5 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Top competitions</p>
              {[["Premier League", "🏴"], ["Champions League", "🇪🇺"], ["LaLiga", "🇪🇸"], ["Serie A", "🇮🇹"], ["Bundesliga", "🇩🇪"]].map(([c, f]) => (
                <Link key={c} to="/football" className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground"><span>{f}</span>{c}</Link>
              ))}
            </div>
          )}
        </nav>

        <main className={cn("min-w-0 flex-1 px-3 py-4 md:px-6 md:py-6", s.slip.length > 0 && !onBetsPage ? "pb-36 md:pb-6" : "pb-24 md:pb-6")}>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Side panel (desktop) */}
        {s.panelOpen && !onBetsPage && (
          <aside aria-label="Bet slip" className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 border-l border-border bg-sidebar lg:block xl:w-[340px]">
            <SlipPanel onClose={() => s.setPanelOpen(false)} />
          </aside>
        )}
      </div>

      {/* Phone: bet slip bar */}
      {s.slip.length > 0 && !onBetsPage && (
        <button
          onClick={() => { s.setPanelTab("slip"); setSheet(true); }}
          className="fixed inset-x-2 bottom-[68px] z-40 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg lg:hidden"
        >
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-background px-1 text-xs font-bold text-foreground">{s.slip.length}</span>
          <span className="font-semibold">Bet slip</span>
          <span className="ml-auto text-sm">{s.block === "odds-changed" ? "Odds changed" : s.block === "suspended" ? "Suspended" : `Returns ${fmt(totalReturn(s.lines))} USDT`}</span>
        </button>
      )}

      {/* Phone: bottom nav */}
      <nav aria-label="Phone" className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-border bg-topbar md:hidden">
        <button onClick={() => setMenu(true)} className="flex flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground"><Menu className="h-5 w-5" />Menu</button>
        {[nav[0], nav[1], nav[3]].map((n) => {
          const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn("flex flex-col items-center justify-center gap-0.5 text-[11px]", active ? "text-primary" : "text-muted-foreground")}>
              <n.icon className="h-5 w-5" />{n.to === "/" ? "Sports" : n.to === "/bets" ? "My bets" : "Live"}
            </Link>
          );
        })}
      </nav>

      {/* Phone: slip sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close bet slip" className="absolute inset-0 bg-background/70" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border bg-popover">
            <SlipPanel onClose={() => setSheet(false)} />
          </div>
        </div>
      )}

      {/* Phone: menu */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-background/70" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-72 space-y-1 bg-sidebar p-3">
            <button onClick={() => setMenu(false)} aria-label="Close" className="mb-2 rounded p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-sidebar-accent"><n.icon className="h-4 w-4" />{n.label}</Link>
            ))}
          </div>
        </div>
      )}

      <DemoControls />
    </div>
  );
}

function DemoControls() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const btn = "rounded-md bg-secondary px-3 py-2 text-left text-sm hover:bg-accent";
  return (
    <div className="fixed bottom-[132px] right-3 z-40 md:bottom-4 md:left-4 md:right-auto">
      {open && (
        <div className="mb-2 w-60 space-y-1.5 rounded-xl border border-border bg-popover p-3 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo states</p>
          <button className={btn} style={{ width: "100%" }} onClick={s.demo.oddsChanged}>Odds changed</button>
          <button className={btn} style={{ width: "100%" }} onClick={s.demo.suspend}>Suspended</button>
          <button className={btn} style={{ width: "100%" }} onClick={s.demo.placed}>Bet placed</button>
          <button className={btn} style={{ width: "100%" }} onClick={s.demo.failed}>Bet failed</button>
          <label className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-sm">
            Nothing live
            <input type="checkbox" checked={s.noLive} onChange={(e) => s.setNoLive(e.target.checked)} className="accent-primary" />
          </label>
          <button className="w-full pt-1 text-xs text-muted-foreground hover:text-foreground" onClick={s.demo.reset}>Reset demo</button>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-full border border-border bg-popover px-3 py-2 text-sm font-medium shadow-lg">
        <FlaskConical className="h-4 w-4 text-primary" /> Demo
      </button>
    </div>
  );
}
