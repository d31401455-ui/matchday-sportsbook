# Matchday Sportsbook

We're building a sportsbook. Design the five pages players will use most.
Build a clickable prototype: 5 pages, phone and desktop, in our site shell (top bar, left nav, side panel).
Match and beat the attached wireframes for desktop (1440px) and phone (390px).

1. Sports home
- Live now
- Starting soon
- Top competitions
- Sports nav
- Search: teams, players, competitions, markets

2. Live
- Every match in play
- Filter by sport and competition
- Live score and clock
- Nothing live: show Starting soon

3. Football
- Premier League, Champions League, LaLiga, Serie A, Bundesliga
- Match result odds on each row
- Follow a team or competition

4. Match page
- Example: Arsenal v Brighton, live
- Scoreboard: score, clock
- Market groups: Popular, Goals, Halves, Handicaps, Goalscorers, Corners & cards
- Odds moving, markets suspended

5. Bet slip + My bets
- Tap odds, add to slip
- Singles only
- Decimal odds, stakes in USDT
- Stake, odds, potential return
- Odds changed: player must accept
- Selection suspended
- Bet placed, bet failed
- My bets: open, settled, cash out
- Bet slip and My bets share one page

Out of scope:
- Multis, accumulators, bet builder
- Boosts, free bets, promos
- Outrights, specials
- Stats widgets, match trackers
- AI search

What to deliver:
- All 5 pages, linked.
- Works at 390px (phone) and 1440px (desktop).
- Bet slip on phones: a bar at the bottom.
- A clickable prototype. Front end only.
- Sample data only: no real players, no real money. Just a few realistic matches and games (Arsenal vs Brighton 1-0 52', Aston Villa vs Fulham, Newcastle vs Everton, Real Madrid vs Bayern, Juventus vs Roma). Include interactive controls to trigger state demos: Odds changed, Suspended, Bet placed, Bet failed.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4001858b-b3a0-41bd-89f7-ac66e5dafb47).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
