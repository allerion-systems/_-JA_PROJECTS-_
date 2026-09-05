# 06 — Kill Tests

The tests that would disprove this idea, in the order they should be run, cheapest first.
Run them **before** spending on steel, lawyers, or pride. If a gate fails, the idea dies
at that gate — write down why, and keep the pieces that survive.

## Gate 1 — Tolerance compensation bench test (~$15–25k [E], 60 days)

**Claim under test:** a carriage-mounted fine-positioning stage can hold ±5 mm nozzle
path on rails built to CMAA 70 crane tolerance (±1/4" per 20 ft rate of change,
[MHI/CMAA FAQ](https://og.mhi.org/downloads/industrygroups/cmaa/faqs/most-asked-action-alerts.pdf)).

Rig: 40 ft of deliberately imperfect rail, a dumb trolley, a ±50 mm XY servo stage, a
laser reference, a marker instead of a nozzle. Pass: ±5 mm over full travel at print
speed, repeated 20×, including after thermal drift overnight. **Fail ⇒ the machine is
paper.** No compensation, no invention — the runway would need machine-tool tolerance,
and the economics die with that requirement.

## Gate 2 — Professional prior-art search (~$3–8k, 30 days, parallel with Gate 1)

`[SIGN-OFF: registered patent attorney]` on the questions in `02-prior-art-scan.md` §5.
**Fail ⇒** someone already filed the conversion concept. Then the fallback position is
being a practitioner, not an owner: the demo shop may still make sense as a build, but
stop spending on IP and check whether *their* claims block us.

## Gate 3 — The four phone calls (free, 2 weeks)

1. **Whitley Manufacturing** ([whitleyman.com](https://www.whitleyman.com/)): KY KIBS
   status, pod pricing, craneable module specs, appetite for a pilot.
2. **A printhead/materials vendor with a live AC509 ESR**: will their listed wall system
   run on a third-party carriage? (`03` §1 Route A hinges on this.)
3. **A crane builder** (e.g., regional Mazzella-class shop): dual-duty runway premium
   over standard Class C — is +15–25% [E] real, or is it +60%?
4. **Commercial insurance broker**: will anyone write the resident-conversion at
   non-punitive rates? (`03` §4.)

**Fail ⇒** any hard "no" that survives a second vendor reprices `04` and may kill the
demo building's budget. Two hard no's on (2) or (4) kill the current architecture.

## Gate 4 — Economics with real quotes (free once Gate 3 lands)

Re-run `model/rg_model.py` with quoted numbers replacing every [E]. The model's headline
output is `wall_premium_for_parity_pct` — the printed-wall cost position (vs. CMU) at
which steady-state RG-1 matches conventional. At defaults it is **−5.9%**: printed walls
must be ~6% cheaper than block, which they are not today. Pass: quoted numbers move
parity to ≥ −3% **and** a credible wall-cost trajectory crosses it within the kit's
amortization window. Fail ⇒ park the venture; revisit when printing costs, masonry labor,
or crane rental rates move. (Parking with a working model is cheap; the re-run is free.)

## Gate 5 — The demo building is the pilot plant

Only after 1–4 pass: build the Misty Valley cut shop as RG-1 #001, on our own dime, with
the building official briefed from day one (`03` §5). The building we needed anyway is
the prototype — worst case we own a conventional-cost shop with a good crane and an
expensive story. That bounded downside is the whole reason the demo building was chosen.

## Standing kill conditions (any time, any gate)

- Housing or crane-less buildings creep into the pitch ⇒ someone is lying to themselves;
  re-read `04` §2. The system is for crane-served buildings only.
- A safety incident path appears that the mode interlock can't close ⇒ stop; redesign or
  stop entirely. A suspended-load accident on a machine we invented is not a survivable
  first chapter.
- Print-day counts from Gate 1/5 exceed 3× the model's assumption ⇒ the day-rate business
  collapses; the resident half may still be a decent way to erect our own shop, but it is
  not a venture.

## What survives even total failure

The dual-duty runway engineering package (`03` §3) and the tolerance-compensation carriage
(Gate 1) each have standalone value — the first as a service to PEMB builders, the second
as a retrofit product for existing gantry printer owners running on imperfect site rails.
Salvage is a feature of good kill tests, not a consolation prize.
