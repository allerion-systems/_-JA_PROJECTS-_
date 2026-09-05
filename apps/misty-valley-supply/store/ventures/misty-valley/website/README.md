# Misty Valley Supply — website

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies.
Same pattern as the rest of this repo.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

A plain `file://` open works too — nothing here fetches anything at runtime.

## Before this goes live

Everything that needs a real value lives in one place: the `CONFIG` object at
the top of `js/site.js`. Placeholders start with `TODO` and render in orange in
the footer, so nothing fake can quietly ship.

| Field | What to set |
|---|---|
| `phone` | Main number customers should call |
| `email` | Sales / quotes inbox |
| `address` | Street address of the Bonnieville yard |
| `hours` | Confirm the hours are right |
| `formEndpoint` | See below |

**The quote form.** With `formEndpoint` empty, submitting opens the visitor's
email client with the request pre-filled and addressed to `CONFIG.email`. That
works on any static host with no backend, and it is a perfectly reasonable way
to launch.

To take real submissions, create a free endpoint at
[Formspree](https://formspree.io) (or use Netlify Forms if hosting there) and
paste the URL into `CONFIG.formEndpoint`. The form will POST to it and show an
inline confirmation.

## Claims to verify before publishing

The copy was written to be defensible, but two things are still assertions
about the business rather than about the world. Confirm both:

- **"10+ yrs"** in the hero — check against Misty Valley Contracting's actual
  founding date.
- **Driving distances** in the Coverage section — approximate, worth a check.
- **Product list** — `index.html` lists sizes and gauges under *Products*.
  Trim it to what Misty Valley will genuinely stock or can reliably get. It is
  much better to list less and always have it.

**What the copy deliberately does NOT claim:** it does not say the company is
SFIA certified, holds an ICC-ES evaluation report, or that its product is
listed in any UL design. Those are specific credentials with specific
requirements (see `../03-product-compliance-risk.md`), and claiming them before
they exist would be a real problem. The Quality section promises documentation
and verification — things Misty Valley controls — and the fine print points
buyers to ask for the specific listing on their job. **If and when the
certifications are earned, that section should be updated to name them.**

## Hosting

Anything that serves static files. The cheapest good options:

- **GitHub Pages** — free; point it at this directory
- **Netlify** or **Cloudflare Pages** — free tier, custom domain, and Netlify
  Forms removes the need for Formspree
- Whatever host the existing Misty Valley Contracting site is on

Buy `mistyvalleysupply.com` before announcing anything.

## Structure

```
index.html          one page, sectioned; anchors drive the nav
css/styles.css      all styles; palette and type are set as CSS variables
js/site.js          CONFIG, contact rendering, mobile nav, form handling
```

## Design notes

Industrial on purpose. The audience is a commercial GC's purchasing agent and a
drywall sub's owner — people who are unimpressed by soft startup design and who
respond to legibility, specificity, and a phone number that works. Hence the
condensed uppercase headings, the safety-orange accent, the hard-edged cards,
and the print stylesheet (someone will print this and put it in a bid folder).

Accessibility: skip link, semantic landmarks, labelled form fields, visible
focus rings, `aria-expanded` on the mobile toggle, and a
`prefers-reduced-motion` block.
