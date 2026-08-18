# What to learn from StockNova

This is a small product with the same *shape* as larger systems. Study the seams, not only the screens.

Also do: **[EXERCISES.md](./EXERCISES.md)** — guided practice path.

---

## Architecture (memorize this diagram)

```
┌─────────────────────────────────────────────┐
│  UI (routes + components)                   │
│  forms, charts, bin map, toasts             │
└─────────────────┬───────────────────────────┘
                  │ calls
┌─────────────────▼───────────────────────────┐
│  store.tsx (React Context)                  │
│  commit → saveData + setState + toast       │
└─────────────────┬───────────────────────────┘
                  │ pure functions
┌─────────────────▼───────────────────────────┐
│  logic.ts · fulfillment.ts · locations.ts   │
│  Result<T>, no React, no LocalStorage       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  storage.ts                                 │
│  parse/sanitize · seed · persist            │
└─────────────────────────────────────────────┘
```

**Rule of thumb:** if a function needs `window` or JSX, it is not domain logic.

---

## 1. Pure logic vs UI

| Layer | Files | Responsibility |
|-------|--------|----------------|
| Domain | `logic.ts`, `fulfillment.ts`, `locations.ts` | Rules only |
| Persistence | `storage.ts` | Load/save/sanitize |
| Bridge | `store.tsx` | Context + toasts + commit |
| UI | `routes/*`, `components/*` | Presentation |

You can unit-test stock rules without mounting React — same idea as backend service tests.

---

## 2. `Result` instead of throw

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

UI always gets a message. Fulfillment is **atomic**: validate every line, then apply every line. No half-shipped orders.

---

## 3. Order fulfillment = path optimization

`compareLocations` + `buildPickList` sort by aisle/bin (`A-2` → `A-12` → `B-03`). Real warehouses optimize walking distance the same way.

Demo: **Fulfillment** → multi-location lines → Preview → Fulfill.

---

## 4. Bin map = aggregate by location

`buildBinMap` groups SKUs into bins and paints the **worst** status in that bin. Managers scan space, not tables.

---

## 5. Defensive persistence

`parseData` never trusts LocalStorage. Bad rows are dropped; negatives clamped. Empty catalog re-seeds demo data.

In production, replace this layer with SQL + migrations; **keep the domain functions**.

---

## 6. Tests as living specs

```bash
npm test
```

| File | Focus |
|------|--------|
| `logic.test.ts` | Status, CRUD, stock in/out, KPIs, filters, reorder |
| `fulfillment.test.ts` | Pick path, atomic fulfill |
| `locations.test.ts` | Bin aggregation |
| `storage.test.ts` | Corrupt JSON resilience |

CI (GitHub Actions) runs the same command on every push.

---

## 7. Growth path after this project

1. Reserve / release stock on pick lists  
2. REST or tRPC API + Postgres  
3. Auth roles (picker vs manager)  
4. Optimistic concurrency (version column on product)  
5. Event log instead of only current quantity  

---

## Challenge tip

After changes, confirm Vercel is green, live demo shows data (or Load Demo Data), then **re-submit** GitHub + Vercel URLs so the evaluator sees tests, fulfillment, and a living UI.
