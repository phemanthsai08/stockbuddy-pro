# What to learn from StockNova

This project is structured like a small real product. Studying it teaches patterns you will reuse in larger systems.

## 1. Separate pure logic from UI

| Layer | Files | Responsibility |
|-------|--------|----------------|
| **Domain / pure logic** | `src/lib/warehouse/logic.ts`, `fulfillment.ts` | Rules only — no React, no LocalStorage |
| **Persistence** | `storage.ts` | Load/save/sanitize |
| **React bridge** | `store.tsx` | Context + toasts + commit |
| **UI** | `routes/*`, `components/*` | Forms, charts, navigation |

**Why it matters:** you can unit-test stock rules without mounting React. Real WMS backends do the same: domain services vs HTTP vs DB.

## 2. Result type instead of throwing

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
```

Mutations return `Result` so the UI always shows a clear message and never leaves half-updated state. Fulfillment is **atomic**: validate all lines first, then apply all updates.

## 3. Order fulfillment = pick path optimization

`compareLocations` + `buildPickList` sort stops by aisle/bin (`A-2` before `A-12` before `B-03`). That mirrors how warehouses reduce walking time.

Try it: open **Fulfillment**, add products from different locations, **Preview pick list**, then fulfill.

## 4. Defensive persistence

`parseData` sanitizes every field. Corrupted LocalStorage must not crash the app. First visit (or empty catalog) seeds demo data.

## 5. Tests as documentation

```bash
npm test
```

Read `logic.test.ts` and `fulfillment.test.ts` — each `it(...)` name describes a business rule.

## 6. Ideas to extend (great practice)

1. **Reserve stock** when a pick list is created (status: reserved → shipped).
2. **Multi-warehouse** locations and transfer stock between sites.
3. **Backend API** (Node/FastAPI) + Postgres instead of LocalStorage.
4. **Barcode scan** field that focuses the matching SKU.
5. **Role-based UI** (picker vs manager).

## 7. Challenge tip

Re-submit GitHub + Vercel after each major improvement so the AI evaluator sees tests, fulfillment, and a live non-empty demo.
