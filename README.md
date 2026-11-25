# Spain 2027 Planner

Two linked web pages for planning the Spain trip together:

- **`tv.html`** — the big screen. Walks the group through four steps: rank the routes, vote on ideas base by base (with photos and short videos), settle the split votes, and lay the must-dos onto days.
- **`phone.html`** — everyone's companion. Vote (Must do / If time / Skip), rank routes, add and edit idea cards, comment, schedule days, park loose ideas, see flights, and undo changes.
- **`setup.html`** — owner only: guest list, starter content, flights.

Hosted on GitHub Pages; live data in Firebase (Firestore + Auth). Only people on the guest list can sign in — enforced by the Firestore security rules in `firestore.rules` (the real owner email lives only in the Firebase console, not in this repo).

## Try it without signing in

Open `phone.html?demo` and `tv.html?demo` in two tabs of the same browser. Demo data stays in that browser. Add `&as=Kim` (etc.) to act as someone else.

## Files

| Path | What |
|---|---|
| `js/store.js` | Firebase + demo backends behind one small API |
| `js/common.js` | Sign-in, live state, voting/tier logic, actions, undo history |
| `js/seed.js` | The 4 route options and starter idea cards |
| `js/tv.js`, `js/phone.js` | The two sites |
| `firestore.rules` | Security rules template (replace `OWNER_EMAIL`) |
