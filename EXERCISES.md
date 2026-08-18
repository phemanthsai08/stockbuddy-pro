# StockNova — hands-on exercises

Do these in order. Each one locks in a real engineering skill.

## Level 1 — Run and observe (30 min)

1. Clone, `npm install`, `npm test`, `npm run dev`.
2. Open Dashboard → confirm **bin map** colors match Alerts.
3. **Fulfillment**: pick 3 products from different bins → Preview pick list → note step order → Fulfill.
4. Check Stock Out / Reports: same order reference appears on multiple lines.

**Checkpoint:** Explain to yourself why pick order is by location, not product name.

## Level 2 — Read the domain layer (45 min)

1. Open `src/lib/warehouse/logic.ts`.
2. Find `calculateStockStatus`, `stockOut`, `getReorderSuggestions`.
3. Open `fulfillment.ts` → `buildPickList` + `fulfillOrder`.
4. Open `locations.ts` → `buildBinMap` (worst status wins per bin).

**Write (in your notes):** What is a `Result<T>` and why not `throw`?

## Level 3 — Break and fix with tests (1 hr)

1. In `logic.test.ts`, temporarily change an expectation so a test fails. Run `npm test`.
2. Revert.
3. Add a new test: *stock-out of exactly available quantity should succeed and leave quantity 0*.
4. Implement if missing; keep all tests green.

**Checkpoint:** Tests are executable documentation of business rules.

## Level 4 — Extend a feature (2–3 hr)

Pick one:

**A. Reserve stock**  
- When pick list is previewed, mark units as reserved (new field or parallel map).  
- Fulfill consumes reserved; cancel releases.

**B. SKU scanner field**  
- On Stock Out, a text box that matches SKU on Enter and selects the product.

**C. Transfer between locations**  
- Move quantity from location A to B without changing total stock.

Keep logic pure + add tests before UI.

## Level 5 — Backend mindset (weekend)

Sketch (or build) the same domain with:

- `POST /products`, `POST /stock-out`, `POST /fulfill`
- Postgres tables: `products`, `transactions`
- Same validation rules in one service module

LocalStorage was a teaching stand-in for a database.

## Reflection questions

1. Why is fulfillment atomic?
2. Why sanitize LocalStorage input?
3. How would you add multi-user conflict (two pickers, one SKU)?
4. What belongs in UI vs domain vs storage?

When you can answer these without the code open, you have internalized the design.
