# STOCKNOVA

**Smart Warehouse Operations & Order Fulfillment System**

A production-quality warehouse management demo for inventory tracking, stock movements, **order fulfillment with location-sorted pick lists**, alerts, and smart reorder suggestions. Built as a complete working application (not a static mockup).

**Live demo:** [https://stockbuddy-pro.vercel.app](https://stockbuddy-pro.vercel.app)

**Learn the architecture:** see [LEARNING.md](./LEARNING.md)

---

## Features

- **Dashboard** — Live KPIs, charts, recent activity, low-stock panel, Load Demo Data
- **Inventory** — Search, filters, sorting, add / edit / delete with validation
- **Stock In / Stock Out** — Validated movements, insufficient-stock protection
- **Order Fulfillment** — Multi-line orders, **pick list sorted by aisle/bin**, atomic fulfill (all lines or none)
- **Alerts** — Low / out of stock + **smart reorder suggestions** (demand velocity)
- **Reports** — Summaries + CSV export
- **Persistence** — Defensive LocalStorage; demo seed when empty
- **Tests** — **37 unit tests** (Vitest) + GitHub Actions CI
- **Accessibility & responsive** UI

---

## Tech stack

| Layer | Technology |
|--------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide |
| Routing | TanStack Router / Start |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | React Context + pure business logic |
| Storage | LocalStorage |
| Tests | Vitest + GitHub Actions |
| Deploy | Vercel |

---

## Project structure

```
src/lib/warehouse/
  logic.ts           # Stock rules, KPIs, reorder
  logic.test.ts
  fulfillment.ts     # Pick lists + atomic multi-line fulfill
  fulfillment.test.ts
  storage.ts         # LocalStorage only
  store.tsx          # React bridge
  types.ts
routes/
  fulfillment.tsx    # Order fulfillment UI
  ...
```

---

## Getting started

```bash
git clone https://github.com/phemanthsai08/stockbuddy-pro.git
cd stockbuddy-pro
npm install
npm run dev
npm test
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run all unit tests |
| `npm run test:watch` | Watch mode |

---

## How to demo fulfillment

1. Open **Fulfillment** in the sidebar.
2. Add 2–3 products from **different locations**.
3. Click **Preview pick list** — steps appear in aisle/bin order (not product name order).
4. Click **Fulfill order** — inventory and transactions update together.

---

## Challenge alignment

- Real inventory + **order fulfillment** (challenge title match)
- Smart alerts / reorder
- Pure logic + automated tests + CI
- Non-empty live demo with seed data

---

## License

Project demo / educational use.
