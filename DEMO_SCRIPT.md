# 3-minute demo script (challenge / viva)

Use this when presenting StockNova.

---

### 0:00–0:20 — Hook

> “StockNova is a smart warehouse system: live inventory, alerts, and **order fulfillment with location-sorted pick lists** — not a static UI.”

Open: https://stockbuddy-pro.vercel.app  
If empty → click **Load Demo Data**.

---

### 0:20–0:50 — Dashboard

Point to:

- KPIs computed from data (not hard-coded)
- **Bin map** — colors show worst status per location
- Charts update after movements

> “Managers see space and risk at a glance.”

---

### 0:50–1:20 — Inventory + Stock

- Search / filter a SKU  
- Stock Out a small qty → show quantity drop  
- Mention insufficient stock is **rejected**

---

### 1:20–2:20 — Fulfillment (hero feature)

1. Open **Fulfillment**  
2. Add 2–3 products from **different bins**  
3. **Preview pick list** → show step order is by location, not name  
4. Optional: **Export CSV**  
5. **Fulfill** → inventory + transactions update together  

> “Atomic multi-line fulfill — same idea as production WMS.”

---

### 2:20–2:45 — Alerts + reorder

Open **Alerts** → smart reorder suggestions from demand velocity.

---

### 2:45–3:00 — Engineering close

> “Domain logic is pure TypeScript with unit tests and CI. LocalStorage stands in for a database so the demo runs fully client-side. The same rules could sit behind an API tomorrow.”

Mention: `bun run test` → 81 tests green.

---

### Backup answers

| Question | Answer |
|----------|--------|
| Why LocalStorage? | Fast offline demo; storage layer is swappable |
| Security? | Client demo; validation + sanitize; real deploy needs auth + server |
| Biggest design choice? | Pure domain + Result type + atomic fulfill |
