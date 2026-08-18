# STOCKNOVA

**Smart Warehouse Operations & Order Fulfillment System**

A production-quality warehouse management demo for inventory tracking, stock movements, alerts, and smart reorder suggestions. Built as a complete working application (not a static mockup).

**Live demo:** [https://stockbuddy-pro.vercel.app](https://stockbuddy-pro.vercel.app)

---

## Features

- **Dashboard** — Live KPIs (products, units, low/out of stock, stock in/out today, inventory value), category breakdown, 7-day movement chart, stock status pie, recent activity, low-stock panel
- **Inventory** — Search, category & status filters, sorting, add / edit / delete products with validation and duplicate-SKU prevention
- **Stock In / Stock Out** — Validated movements, insufficient-stock protection, automatic transaction history
- **Alerts** — Automatic low-stock & out-of-stock detection with severity
- **Smart Reorder Suggestions** — Suggested order quantities based on recent outbound demand velocity (or 2× minimum when history is thin)
- **Reports** — Inventory summary, movement, category analysis, CSV export
- **Persistence** — LocalStorage with defensive parsing; realistic demo data seeded on first visit (or when empty)
- **Accessibility** — Semantic structure, labels, focus states, contrast-aware status badges
- **Responsive** — Desktop sidebar + collapsible mobile navigation

---

## Tech stack

| Layer | Technology |
|--------|------------|
| UI | React 19, TypeScript, Tailwind CSS 4, Radix UI, Lucide |
| Routing | TanStack Router / Start |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | React Context + pure business logic module |
| Storage | LocalStorage (browser-only) |
| Tests | Vitest |
| Deploy | Vercel |

---

## Project structure

```
src/
  components/warehouse/   # UI: shell, KPIs, forms, tables, badges
  components/ui/          # Shared Radix/shadcn primitives
  lib/warehouse/
    logic.ts              # Pure business rules (status, KPIs, stockIn/Out, reorder)
    logic.test.ts         # Unit tests
    storage.ts            # LocalStorage load/save/seed
    sample-data.ts        # First-launch demo catalog + transactions
    store.tsx             # React context bridge
    types.ts              # Domain types
  routes/                 # Pages: dashboard, inventory, stock-in/out, alerts, reports
```

Business logic is isolated in `logic.ts` so rules are never duplicated across pages and are easy to unit-test.

---

## Getting started

```bash
git clone https://github.com/phemanthsai08/stockbuddy-pro.git
cd stockbuddy-pro
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |

---

## Testing

Core warehouse rules are covered by unit tests:

- Stock status (in / low / out)
- Add / update / delete product + validation & duplicate SKU
- Stock in / stock out + insufficient stock rejection
- Dashboard KPI calculation
- Inventory filtering
- Smart reorder suggestions

```bash
npm test
```

---

## Demo data

On first load (or when stored inventory is empty), StockNova seeds ~16 realistic products across Electronics, Office Supplies, Packaging, Hardware, and Safety Equipment, plus sample stock-in/out transactions so charts and alerts look meaningful immediately.

Use **Reset demo data** from the UI (where available) or clear site data for the origin to re-seed.

---

## Challenge alignment

Built for **Smart Warehouse Operations & Order Fulfillment System**:

- Real working inventory & fulfillment flows (not hard-coded numbers)
- Automatic alerts and demand-aware reorder suggestions
- Clean separation of UI, business logic, and storage
- Automated tests for critical paths
- Accessible, responsive SaaS-style UI suitable for presentation

---

## License

Project demo / educational use.
