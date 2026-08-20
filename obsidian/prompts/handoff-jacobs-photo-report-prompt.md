# Handoff agent prompt — Jacobs photo report + customer update + schedule

**Use:** paste the block below into the Handoff AI teammate with the site photos attached to the project.
**Project in Handoff:** "Scott Jacobs Residence - Terrace Decks (Moisture Shield)" / "Scott Jacobs - 1320 North Beckley Station Road"
**Before sending:** fill the three `[BRACKETS]` in the prompt. Nothing goes to the client without Joey's review — see the guardrails section.

---

## The prompt

```
You are working on the Scott Jacobs Residence project for R&B Roofing and Remodeling.
I've attached today's site photos. Produce three deliverables, in this order.

PROJECT FACTS — use these, don't re-derive them
- Client: Scott Jacobs, Vice President, Wescott Development
  scott@wescottdevelopment.com · C: 502.475.9246 · has active Client Portal access
- Site: 1320 N Beckley Station Rd, Louisville, KY 40245
- Scope of work:
  1. Deck-over of the two rear 2nd-story concrete bay terraces — MoistureShield
     decking over Instadeck pedestal system
  2. Kitchen roof leak — vent boots and terrace perimeter
  3. Permit and shop drawings (current: REV2-RB-SHOP-DWG-PEDESTAL-Jacobs-Residence)
- Material ordered 8/12: 43 cases Instadeck + 75 pcs of 20-ft board
- Material history: initial shipment was short (19 of ~43 cases). Balance was
  re-sourced from the supplier's sister plant and DELIVERED 8/18. Full material
  is now on site. This delay is the reason the schedule moved.
- R&B contacts: Joey Allee, Chief Estimator (502) 938-2771, joeya@gottaberandb.com;
  Scott Waldman, GM. Installer: Misty Valley Contracting.

DELIVERABLE 1 — PHOTO REPORT
Build a dated photo report for the project record. For each photo:
- Caption it with location (which terrace — identify as North/South or left/right
  as seen from the yard), what it shows, and work status
- Group into sections: Material Received · Substrate & Pedestal Layout ·
  Decking Installation · Roofing / Vent Boots · Open Items

Then add these summary sections:

a) MATERIAL RECEIVED — this is important. We have NO written delivery
   confirmation from the supplier for this order. This report is our delivery
   record. From the photos, log: number of cases and boards visible, product
   and color/SKU on any visible packaging label, and whether the two shipments
   (initial + sister-plant balance) appear to be the same color and dye lot.
   If a packing slip or BOL is visible in any photo, transcribe it in full.
   If you cannot confirm color/dye-lot match from the photos, say so explicitly
   and flag it as an open item — do not assume it matches.

b) PERCENT COMPLETE — estimate by scope line (terrace 1 decking, terrace 2
   decking, roofing/vent boots), based only on what the photos actually show.

c) QUALITY / OPEN ITEMS — anything visible that needs attention: pedestal
   spacing or leveling, board gapping, perimeter/edge detail, flashing at the
   terrace perimeter, debris or protection of finished surfaces.

DELIVERABLE 2 — CUSTOMER UPDATE (draft for review, do not send)
Write a short update to Scott Jacobs for the Client Portal — plain, professional,
no filler, under 200 words. It must:
- Lead with current status and what the photos show
- State plainly that the material shortfall from the supplier caused the delay,
  that all material is now on site as of 8/18, and that install is underway.
  Own the delay. Do not blame the supplier by name and do not over-explain.
- Give the revised completion date: [FILL IN — substantial completion date]
- Say what happens next and when he'll hear from us again
- Close with: if this date moves, he hears it from us the day we know

Do NOT mention, reference, or attach any invoice or payment request in this
update. Billing on this project is being handled separately.

DELIVERABLE 3 — SCHEDULE UPDATE
Update the project schedule in Handoff to reflect the actual sequence:
- Material fully on site: 8/18
- Terrace 1 decking: [FILL IN — start/finish]
- Terrace 2 decking: [FILL IN — start/finish]
- Roofing / vent boots and terrace perimeter: [FILL IN]
- Punch and final walk with client: [FILL IN]
Flag any task whose original baseline date has now passed, and show the slip
in days against the original baseline.

RULES
- Report only what the photos actually show. If something is unclear or not
  pictured, list it under "Needs field verification" — never fill a gap with
  an assumption.
- Every date you state must trace to something I've given you or to a photo.
  If you need a date I haven't provided, ask me for it rather than estimating.
- Prepare the customer update as a DRAFT for my review. Do not send it, do not
  publish it to the portal, and do not notify the client until I approve it.
```

---

## Fill these before you paste

| Bracket | What it needs |
|---|---|
| Substantial completion date | Driven by what the photos show plus crew availability. Don't commit until you've seen the install rate on terrace 1. |
| Terrace 1 / terrace 2 dates | Terrace 2 can't start until terrace 1 frees the crew |
| Roofing / punch dates | Vent boots and terrace perimeter can run parallel to decking if you have the man |

## Why the customer update is draft-only

Scott Jacobs has objected to R&B's paperwork twice in two weeks — the estimate
payment terms on 8/7 ("incorrect again"), and invoice HNDF-10312-027 on 8/10
("This a typo?"). He is a VP at a development company and reads what we send.
A schedule update that arrives with a billing reference attached, or with a date
that slips again, costs more than the delay did.

Two things to square before or alongside this update, both outside the Handoff
agent's lane:
- The signed estimate was voided 8/6 and no replacement signature is on record.
  He offered on 8/7 to sign a corrected version on the spot.
- Invoice HNDF-10312-027 ($29,994.50, "Final Payment due at Completion") went out
  8/10 marked due on receipt, before completion. That's Scott Waldman's and
  Donna's call, not the agent's.

## One habit note

Check the draft for leftover `[BRACKETS]` before it goes anywhere. An Oldham
County permit supplement is sitting in Drafts right now with its placeholder
line still in the body.
