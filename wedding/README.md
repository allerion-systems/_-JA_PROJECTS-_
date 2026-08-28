# Wedding HQ — 154 Guests

Planning toolkit for Joey's wedding, built the way a PM would run a job: one source of truth, a phased schedule, a budget with contingency, and a risk register — plus the part no construction project needs, which is getting your head right for the day itself.

## What's here

- **`playbook.md`** — the main document. Mental preparation, the math of a 154-person wedding (tables, invites, bar, catering), budget framework, and a risk register with mitigations.
- **`checklist.md`** — the full phased checklist, 12 months out through the day after.
- **`day-of-runsheet.md`** — hour-by-hour run sheet template for the wedding day. Fill in real times once the ceremony time is locked.
- **`budget-worksheet.csv`** — line-item budget tracker with typical percentage allocations. Open in Excel/Sheets/Numbers.
- **`guest-list.csv`** — guest list tracker template (household-level, with RSVP/meal/table columns).
- **`index.html`** — interactive planner dashboard: countdown, checklist with saved progress, and a headcount calculator. No build step — open it served locally like the rest of the site:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/wedding/
```

(It also works opened directly as a file — it doesn't fetch anything.)

## The one-sentence version

Lock the big three early (venue, date, headcount), put 10% contingency in the budget, appoint a day-of point person who is not you or your spouse, and remember that at 154 guests nobody will see the punch list — they'll remember the food, the music, and how happy you looked.
