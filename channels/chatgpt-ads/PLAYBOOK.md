# ChatGPT Ads — MVS playbook

*2026-09-05. Self-serve exists: ads.openai.com (beta Ads Manager, no spend minimum
since May 2026, CPC ~$3–5, CPM as low as ~$25). Ads show as labeled "Sponsored"
placements to free/Go-tier users only; answers themselves aren't influenced.
Sources: openai.com/index/new-ways-to-buy-chatgpt-ads, openai.com/index/testing-ads-in-chatgpt.*

## Verdict: real channel, wrong week. DO NOT SPEND until the launch gates pass.

A $4 click landing on a prototype with placeholder pricing and no fulfillment is a
$4 donation. Same discipline as any paid channel.

### Launch gates (all required before the first dollar)
1. Site live on a real domain (Netlify), checkout or intake actually delivering
   (email/SMS wired, or the counter demonstrably calling every lead same-day).
2. Real prices on the products being advertised; photos on those SKUs.
3. A phone number a human answers, and delivery promises MVS can keep.
4. Tracking: UTM-tagged landing URLs + a lead log, so cost-per-lead is measurable
   from week one.

## Why this channel fits MVS unusually well
The configurator teardown found nobody in the category serves an instant answer.
ChatGPT users ask task-shaped questions ("how many squares is a 30x40 roof",
"what does OSHA require for roof edges") — MVS's whole identity is answering
those with a price attached.

## First three campaigns (in order, ~$20–30/day total to start)
1. **Takeoffs, $18/sheet** — highest intent, lowest friction, pure margin.
   Queries: plan takeoff service, material takeoff cost, estimating help.
   Ad: "Upload your plans, get quantities back in 48 hours — $18 a sheet."
2. **Roof measurement reports** — "Aerial roof report for any address, $36."
3. **Design Center** — sheds/decks/screens: "Design it in 3D, priced live,
   free quote by text." Broadest audience, run last, judge by quote submissions.

Geo: start US-wide only if the fulfillment is digital (takeoffs/reports are);
materials campaigns stay Louisville–Nashville corridor when geo-targeting allows.

## Budget math (why small tests only)
At $4 CPC and a 5% lead rate, a lead costs ~$80 — fine against a $148K framing
package, absurd against a $27 hard hat. Advertise SERVICES (takeoffs, reports,
design-build intakes) and package-level offers, never commodity SKUs.

## The free half of the channel (do this regardless, worth more than the ads)
AI assistants recommending MVS organically is the durable win:
- The MCP endpoint + /.well-known/offer-manifest.json (deploying now) makes MVS
  machine-quotable — the only supplier in the corridor an agent can price against.
- AEO: product pages already lead with the governing code cite; keep that — it is
  exactly what answer engines quote.
- Once live, submit the domain to Bing/Google indexing day one; answer engines
  inherit from search indices.

## Next actions
- [ ] Pass the launch gates (site live is in flight today).
- [ ] Create the ad account at ads.openai.com (Joey — needs a payment method).
- [ ] Draft 3 ad variants per campaign at launch; kill anything above $120/lead
      for services after the first $150 of spend.
