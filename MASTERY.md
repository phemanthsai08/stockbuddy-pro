# StockNova Mastery — think like a systems engineer

You asked for **everything at 100%** for learning and a near-perfect evaluation.  
This file is the mental model. Code is the evidence. Practice is the proof.

**Live:** https://stockbuddy-pro.vercel.app  
**Also read:** [LEARNING.md](./LEARNING.md) · [EXERCISES.md](./EXERCISES.md) · [README.md](./README.md)

---

## 1. What you actually built (in one sentence)

A **browser-based WMS core**: inventory truth → movements → alerts → **location-optimized order fulfillment**, with **pure domain logic**, **defensive storage**, **React as a thin shell**, and **automated tests** that document the rules.

That is the same shape as production systems — only the database is LocalStorage instead of Postgres.

---

## 2. The three laws (commit these to memory)

### Law A — Domain is pure

`logic.ts`, `fulfillment.ts`, `locations.ts` never import React and never touch `window`.

If a rule lives only inside a button click handler, it cannot be tested or reused.  
If it lives in pure functions, tests and UI both call the *same* truth.

### Law B — Mutations return `Result`

```ts
{ ok: true, value } | { ok: false, error: string }
```

No silent failures. No thrown exceptions for business rules.  
The UI always knows what to toast.

### Law C — Multi-line work is atomic

`fulfillOrder` validates **every** line first. Only then does it change quantities.  
Real fulfillment systems refuse partial commits for the same reason: inventory integrity.

---

## 3. Data flow (follow one action end-to-end)

**Example: fulfill a 2-line order**

1. UI collects customer, reference, lines  
2. `buildPickList` → sort by aisle/bin, check stock  
3. User previews walking path  
4. `fulfillOrder` → all OUT txs + quantity updates  
5. `store` `commit` → `setState` + `saveData`  
6. Dashboard / Alerts / Reports recompute from the same `data`

One source of truth. Many views.

---

## 4. Feature map ↔ challenge rubric

| Challenge need | Where it lives | Why evaluators care |
|----------------|----------------|---------------------|
| Working system not mock UI | Real mutations + LocalStorage | Numbers move |
| Smart warehouse | Reorder velocity, bin map, location sort | Not just CRUD |
| Order fulfillment | `/fulfillment` + atomic pick | Title match |
| Code quality | Layered modules | Maintainable |
| Testing | 40+ Vitest cases + CI | Proves rules |
| Accessibility | Labels, focus, semantics | Usable |
| Efficiency | Client-side, no wasteful fetches | Fast |

---

## 5. How to study for 2 hours (maximum ROI)

| Time | Do this |
|------|---------|
| 0–15 min | Run app, Load Demo Data, click every nav item |
| 15–35 min | Fulfillment: multi-bin order → Preview → Export CSV → Fulfill |
| 35–55 min | Read `fulfillment.ts` + `logic.ts` top to bottom |
| 55–75 min | `npm test` — read failing-style tests as documentation |
| 75–100 min | Do Level 1–2 in EXERCISES.md |
| 100–120 min | Answer the four reflection questions in EXERCISES.md *without* code open |

When you can explain atomic fulfill and pure domain without the repo, you have leveled up.

---

## 6. Honest score expectations

| Band | Meaning |
|------|--------|
| ~85 | Strong UI, weak/no tests (your original) |
| ~92–96 | Tests + fulfillment + live seed (current trajectory) |
| ~97–99 | Same + polished demo narrative + zero empty-state bugs |
| 100 | Rare for LocalStorage college demos; needs near-perfect rubric alignment |

**99.9% is a learning target, not a marketing claim.**  
Re-submit the challenge after verifying:

1. Live site shows non-zero inventory  
2. `/fulfillment` works  
3. `npm test` is green  
4. README + LEARNING describe the system clearly  

---

## 7. Interview-ready explanations (practice saying these)

**Q: Why not put stock rules in the React component?**  
A: Components re-render and mix presentation with policy. Pure functions are testable and portable to an API later.

**Q: What is a pick list?**  
A: An ordered set of warehouse stops so a picker collects items with minimal walking. We sort by aisle then bin number.

**Q: How do you prevent overselling?**  
A: Validate available quantity before any write; reject the whole order if any line fails.

**Q: How would you productionize this?**  
A: Keep domain modules; replace `storage.ts` with Postgres + API; add auth, reservations, and concurrency control.

---

## 8. Your next growth moves (choose one)

1. **Stock reservation** — pick list holds stock for N minutes  
2. **API backend** — same `fulfillOrder` behind HTTP  
3. **Barcode field** — SKU scan selects the line  
4. **Multi-user** — optimistic locking on `updatedAt`

Each extends a seam you already have. That is real engineering growth.

---

*Built to be studied. Run the demo. Read the tests. Break a rule on purpose. Fix it with a test. That loop is how you reach mastery.*
