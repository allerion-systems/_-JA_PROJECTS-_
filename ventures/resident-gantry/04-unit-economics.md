# 04 — Unit Economics

Ruthless version up front: **on building #1, the Resident Gantry is roughly cost-neutral
at best.** The play is not "printing is cheap" — it isn't
([Construction Physics](https://www.construction-physics.com/p/3d-printed-buildings) is
the honest read) — the play is that the expensive steel was already in a crane-served
building's budget, the nomad kit amortizes across many jobs the way COBOD amortizes a
whole $420k machine, and every job eliminates the mobile-crane spread from erection.
Run the numbers yourself: `model/rg_model.py` (all assumptions are flags; 12 tests).

## 1. Anchor prices (cited)

| Item | Figure | Source |
|---|---|---|
| COBOD BOD2-class printer | ~$420,000 ("starting around €385,000") | [Printable Concrete, 2026](https://www.printableconcrete.com/best-3d-concrete-printers-reviewed/) |
| Other gantry printers | $300k–$950k (StroyBot); $205k+ (CyBe arm) | same |
| 5-ton single-girder bridge, 40 ft span | ~$40,000 (crane only) | [Mazzella](https://www.mazzellacompanies.com/learning-center/what-is-the-cost-of-an-overhead-crane/) |
| 10-ton single-girder bridge | ~$65,000 installed | same |
| Double-girder premium | +30–35% over single girder | same |
| Bridge crane overall range | $40,000–$100,000 before runway | same |

Everything below that is **estimate** — labeled E — until vendors quote.

## 2. The comparison that matters

Same building both ways: 48×120×24 crane-served fab shop, 10-ton crane, office/support space.

**Conventional**: PEMB shell + CMU or metal-panel walls + crane columns/runway + 10-ton
bridge + mobile crane on site for erection + stick-built or separately-craned interior
offices.

**RG-1**: runway first (dual-duty premium over a standard Class C runway: the girder
carries a light carriage at print duty; the premium is drives/detailing, estimated
**+15–25% on runway steel** [E]) + nomad kit day-rate + printed walls + gantry-erected
roof + Whitley pods set by the gantry.

Where RG-1 wins, loses, and washes:

- **Wins — erection lifting.** No mobile crane mobilization for roof steel, deck, panels,
  or module set. A month of intermittent hydro crane presence on a conventional job is
  real money; on RG-1 it's zero marginal cost. [E — priced in model]
- **Wins — the crane budget line.** The bridge, end trucks, and runway on the conventional
  side cost the same dollars and do nothing until occupancy. On RG-1 they work for their
  living from week one.
- **Wins later — reconfiguration.** Pods relocatable by the building's own crane for
  life; no priced comparable exists, so the model gives it zero value. It is not zero.
- **Loses — wall cost.** Printed wall material + nomad time vs. CMU: assume printed costs
  **more** until proven otherwise (model default: +15% [E]). Anyone who tells you printed
  walls are automatically cheaper is selling a printer.
- **Loses — engineering and firsts.** The dual-duty structural submittal, the mode
  interlock, the tolerance-compensation carriage prototype: one-time NRE, front-loaded on
  building #1. Model carries it explicitly instead of hiding it.
- **Washes — the building itself.** Foundations, slab, roof, MEP don't care who lifted them.

## 3. The nomad-kit business model (the actual venture)

The kit (carriage + fine-positioning + pump + controls) target cost: **$150k–$170k** [E]
(35–40% of a BOD2-class machine, because the steel stays home). It earns a day rate on
every RG-1 job, exactly like COBOD's machine earns across projects — but the customer's
budget already absorbed the gantry steel, so the kit's rate competes against *mobilizing
a whole printer*, not against owning one.

Model default: kit amortized over 3 years, 6 jobs/year at 20 print-days each [E].

**What the model actually says (run it):** at default estimates, RG-1 comes in
**+$71.5k on building #1** and **+$31.5k in steady state** against a $340.8k conventional
baseline — and no amount of utilization closes the gap, because at these defaults the
runway premium plus print operating cost roughly offsets the mobile-crane savings, leaving
the **printed-wall premium as the binding constraint**. The model's headline number:
printed walls must reach **~6% cheaper than CMU** (at 6 jobs/year) for steady-state
parity. Make walls 10% cheaper and the kit breaks even at ~4 jobs/year.

That is the venture in one sentence: **the Resident Gantry is a bet that printed-wall
costs cross CMU within the kit's 3-year amortization window** — via labor scarcity,
masonry price inflation, or print-speed gains — while the resident-steel trick removes
the machine-mobilization cost that kills that same bet for COBOD-style operators. If you
don't believe the crossing happens, don't build the kit. (The demo shop can still be
worth building at +$40–70k as prototype-plus-shop — that's a Gate 5 judgment, not a
spreadsheet one.)

## 4. What would change the answer

1. **Real quotes**: Whitley pods, runway steel, a printhead/pump vendor, mobile-crane
   rates in Louisville. Four phone calls replace four estimates.
2. **Print-day count**: if the demo shop's walls take 60 machine-days instead of 20, the
   day-rate math sags. COBOD claims 1 m² of double wall in ~5 minutes
   ([COBOD](https://cobod.com/solution/bod2/)); marketing numbers get a 2–3× haircut in
   the model.
3. **Insurance loading** on a self-built resident crane (`03` §4) — currently unpriced.
4. **The Misty Valley lesson**: check every vendor number against a second source. The
   last venture died in diligence because the seller's landed cost was off by 4×.
   That's the standard this file has to survive.
