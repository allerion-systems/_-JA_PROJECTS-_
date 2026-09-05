/* Misty Valley Supply — site behaviour.
 *
 * Everything Ben and Joey need to fill in lives in CONFIG below. Change it
 * here once and it updates everywhere on the page. Nothing else in this file
 * should need editing.
 */

const CONFIG = {
  // ---- FILL THESE IN ------------------------------------------------------
  // Placeholders are deliberately obvious so nothing fake ever ships live.
  phone:   "TODO — main phone",
  email:   "TODO — sales email",
  address: "TODO — street address, Bonnieville, KY 42713",
  hours:   "Mon–Fri, 7:00am – 4:00pm CT",

  // Where the quote form posts. Until this is set, the form opens the
  // visitor's email client with the message pre-filled, which works with no
  // backend at all. To take real submissions, create a free endpoint at
  // formspree.io (or use Netlify Forms) and paste the URL here.
  formEndpoint: "", // e.g. "https://formspree.io/f/xxxxxxxx"
  // -------------------------------------------------------------------------
};

const isPlaceholder = (v) => !v || String(v).startsWith("TODO");

/* -------------------------------------------------------------- contact */

function renderContact() {
  const list = document.getElementById("contactList");
  if (!list) return;

  const rows = [
    { label: "Phone",   value: CONFIG.phone,   href: (v) => `tel:${v.replace(/[^\d+]/g, "")}` },
    { label: "Email",   value: CONFIG.email,   href: (v) => `mailto:${v}` },
    { label: "Address", value: CONFIG.address, href: null },
    { label: "Hours",   value: CONFIG.hours,   href: null },
  ];

  list.innerHTML = "";
  for (const row of rows) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = row.label;
    li.appendChild(label);

    if (isPlaceholder(row.value)) {
      const em = document.createElement("em");
      em.textContent = row.value || "TODO";
      em.style.color = "#e8620d";
      li.appendChild(em);
    } else if (row.href) {
      const a = document.createElement("a");
      a.href = row.href(row.value);
      a.textContent = row.value;
      li.appendChild(a);
    } else {
      li.appendChild(document.createTextNode(row.value));
    }
    list.appendChild(li);
  }
}

/* ------------------------------------------------------------------ nav */

function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Close the mobile menu after tapping a link.
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ----------------------------------------------------------------- form */

function initForm() {
  const form = document.getElementById("quoteForm");
  const note = document.getElementById("formNote");
  if (!form || !note) return;

  const setNote = (msg, kind) => {
    note.textContent = msg;
    note.className = "form-note" + (kind ? ` is-${kind}` : "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate required fields ourselves so the message is useful.
    const required = ["name", "company", "email"];
    let firstBad = null;
    for (const id of required) {
      const el = form.elements[id];
      const bad = !el.value.trim() ||
        (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
      el.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = el;
    }
    if (firstBad) {
      setNote("Please fill in your name, company, and a valid email address.", "err");
      firstBad.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    if (CONFIG.formEndpoint) {
      setNote("Sending…");
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        setNote("Thanks — we've got it. We'll come back to you with a package price and a delivery schedule.", "ok");
      } catch (err) {
        setNote("That didn't go through. Please call or email us directly and we'll pick it up from there.", "err");
      }
      return;
    }

    // No endpoint configured: fall back to composing an email. Works on a
    // plain static host with no backend at all.
    if (isPlaceholder(CONFIG.email)) {
      setNote("This form isn't connected yet — set CONFIG.email and CONFIG.formEndpoint in js/site.js.", "err");
      return;
    }

    const lines = [
      `Name:     ${data.name}`,
      `Company:  ${data.company}`,
      `Email:    ${data.email}`,
      `Phone:    ${data.phone || "-"}`,
      `Project:  ${data.project || "-"}`,
      `Needed:   ${data.needed || "-"}`,
      `Scope:    ${data.scope || "-"}`,
      "",
      data.details || "",
    ].join("\n");

    const href = `mailto:${CONFIG.email}` +
      `?subject=${encodeURIComponent(`Quote request — ${data.company}`)}` +
      `&body=${encodeURIComponent(lines)}`;
    window.location.href = href;
    setNote("Opening your email app with the request filled in — just hit send.", "ok");
  });
}

/* ----------------------------------------------------------------- init */

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  renderContact();
  initNav();
  initForm();
});
