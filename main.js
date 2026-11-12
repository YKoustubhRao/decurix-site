/* Decurix site: scroll reveals, the hero demo, the learning loop, downloads and the early-access list. */

// ---------------------------------------------------------------------------
// Downloads. Leave a url empty and that button says "Coming soon" and points at
// the early-access form. Fill it in when a build is published, e.g.
// "https://github.com/YKoustubhRao/decurix-site/releases/latest/download/Decurix-Setup-x64.exe"
// ---------------------------------------------------------------------------
const DOWNLOADS = {
  version: "v0.1.1",
  windows: {
    url: "https://github.com/YKoustubhRao/decurix-site/releases/latest/download/Decurix-Setup-x64.exe",
    file: "Decurix-Setup-x64.exe",
    size: "151 MB",
    sha256: "f1040f4fccf297c66b0c15743622c8d78236addb6c8ac3411808490b752797af",
  },
  linux: {
    url: "https://github.com/YKoustubhRao/decurix-site/releases/latest/download/Decurix-x86_64.AppImage",
    file: "Decurix-x86_64.AppImage",
    size: "154 MB",
    sha256: "5541e9a5914eda8c315430a04e07e7f1c022498091354e5cd1fcb3e670014420",
  },
};

// ---------------------------------------------------------------------------
// Waitlist. Signups are delivered by Web3Forms (https://web3forms.com) to the
// inbox the access key was created for. The key is safe to publish: it does
// not reveal the address and can only send to that one inbox.
// See website/README.md for the one-minute setup.
// ---------------------------------------------------------------------------
const WAITLIST = {
  endpoint: "https://api.web3forms.com/submit",
  accessKey: "d9ab1027-cf9c-4f6b-a29b-2ea57f0f1728",
};

document.documentElement.classList.remove("no-js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Small helpers ----------------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html != null) node.innerHTML = html;
  return node;
}

$("#year").textContent = new Date().getFullYear();

// --- Theme toggle (the app's: a stored choice wins, otherwise the system's) ---
$("#themeToggle")?.addEventListener("click", () => {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("decurix-theme", next); } catch {}
});

// --- Founder email, put together in the browser so scrapers don't harvest it ---
const mail = $("#founderEmail");
if (mail) {
  const addr = `${mail.dataset.u}@${mail.dataset.d}`;
  mail.href = `mailto:${addr}`;
  mail.querySelector("span").textContent = addr;
}

// --- The app replica's "Working on" card: its latest step, as the app polls it ---
const STEPS = [
  "Reading 214 invoices from the shared folder",
  "Sorting business from retail sales by customer",
  "Filling the return, one row per invoice",
  "Grouping retail sales by region and tax rate",
  "Checking totals against the sales register",
];
const actStep = $("#actStep");
const actTime = $("#actTime");
if (actStep && !reduceMotion) {
  let i = 0;
  let secs = 134;
  setInterval(() => {
    secs += 3;
    actTime.textContent = `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`;
  }, 3000);
  setInterval(() => {
    i = (i + 1) % STEPS.length;
    actStep.style.opacity = 0;
    setTimeout(() => { actStep.textContent = STEPS[i]; actStep.style.opacity = 1; }, 300);
  }, 3200);
}

// --- Downloads: the visitor's own system first ------------------------------
function detectOS() {
  const ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || "";
  if (/win/i.test(ua)) return "windows";
  if (/android|iphone|ipad|cros/i.test(navigator.userAgent)) return "";
  if (/linux|x11/i.test(ua)) return "linux";
  return "";
}
const OS_NAME = { windows: "Windows", linux: "Linux" };
const myOS = detectOS();
const anyLive = ["windows", "linux"].some((k) => DOWNLOADS[k].url);

["windows", "linux"].forEach((os) => {
  const d = DOWNLOADS[os];
  const btn = document.querySelector(`[data-dl="${os}"]`);
  const meta = document.querySelector(`[data-dl-meta="${os}"]`);
  const card = document.querySelector(`.dl[data-os="${os}"]`);
  if (!btn) return;
  if (os === myOS && card) {
    card.classList.add("is-mine");
    card.querySelector(".dl-badge").hidden = false;
  }
  if (d.url) {
    btn.href = d.url;
    btn.querySelector("span").textContent = `Download for ${OS_NAME[os]}`;
    if (meta) meta.textContent = [d.file, d.size, DOWNLOADS.version].filter(Boolean).join(" · ") + (d.sha256 ? `
SHA-256 ${d.sha256}` : "");
  } else {
    btn.classList.add("is-soon");
  }
});

const heroDl = document.querySelector("[data-dl-hero]");
const heroNote = document.querySelector("[data-dl-note]");
if (heroDl && myOS && DOWNLOADS[myOS].url) {
  heroDl.href = DOWNLOADS[myOS].url;
  heroDl.querySelector("span").textContent = `Download for ${OS_NAME[myOS]}`;
  if (heroNote) heroNote.innerHTML = `Also for ${OS_NAME[myOS === "windows" ? "linux" : "windows"]} · <a href="#download">all downloads</a>`;
} else if (heroDl && !anyLive) {
  heroDl.querySelector("span").textContent = "Download";
  if (heroNote) heroNote.textContent = "Windows and Linux · first public builds coming soon";
}
const dlFoot = document.querySelector("[data-dl-foot]");
if (dlFoot && anyLive) dlFoot.innerHTML = "Free while in early access. Windows may warn about a new app: choose <b>More info → Run anyway</b>.";

// --- The learning loop: the arc walks the five steps ------------------------
const loopArc = $("#loopArc");
const loopNodes = [...document.querySelectorAll(".loop-node")];
if (loopArc && loopNodes.length) {
  let k = 0;
  const show = () => {
    const i = k % loopNodes.length;
    loopNodes.forEach((n, j) => n.classList.toggle("on", j === i));
    // The arc is 61 degrees long; its head lands on node i (nodes sit 72 degrees apart from the top).
    loopArc.style.transform = `rotate(${-151 + 72 * k}deg)`;
  };
  show();
  if (!reduceMotion) setInterval(() => { k += 1; show(); }, 2200);
}

// --- Reveal on scroll -------------------------------------------------------
const revealables = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealables.forEach((n, i) => {
    // Stagger siblings that enter together.
    const sibs = n.parentElement ? [...n.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
    n.style.transitionDelay = `${Math.min(sibs.indexOf(n), 6) * 70}ms`;
    io.observe(n);
  });
} else {
  revealables.forEach((n) => n.classList.add("in"));
}

// ---------------------------------------------------------------------------
// Hero demo: a worker reconciles a bank statement, asks once, remembers the
// answer, and only reports done after the totals agree on screen.
// ---------------------------------------------------------------------------
const ROWS = [
  { date: "01 Sep", party: "Northwind Traders", amount: 12400, ref: "INV-2264" },
  { date: "03 Sep", party: "Acme Supplies", amount: 8950, ref: "INV-2271" },
  { date: "07 Sep", party: "Payroll: September", amount: 210000, ref: "PAY-09" },
  { date: "11 Sep", party: "Bluebird Logistics", amount: 18320, ref: "INV-2280" },
  { date: "14 Sep", party: "Acme Supplies", amount: 8950, ref: "INV-2291", ask: true },
  { date: "19 Sep", party: "Zenith Software", amount: 42000, ref: "INV-2285" },
  { date: "24 Sep", party: "City Power & Light", amount: 6640, ref: "INV-2288" },
  { date: "28 Sep", party: "Office rent", amount: 175000, ref: "RENT-09" },
];
const TOTAL = ROWS.reduce((s, r) => s + r.amount, 0);

const sheet = $("#sheet");
const log = $("#log");
const cursor = $("#cursor");
const totalEl = $("#total");
const screen = $(".demo-screen");
let rowEls = [];

const STATUS = {
  wait: '<span class="st st-wait">· queued</span>',
  ok: '<span class="st st-ok">✓ matched</span>',
  entered: '<span class="st st-ok">✓ entered</span>',
  ask: '<span class="st st-ask">? asking</span>',
};

function buildSheet() {
  sheet.querySelectorAll(".row:not(.head)").forEach((r) => r.remove());
  rowEls = ROWS.map((r) => {
    const row = el(
      "div",
      "row",
      `<span class="date">${r.date}</span><span class="party">${r.party}</span>` +
        `<span class="num">${fmt(r.amount)}</span><span class="status">${STATUS.wait}</span>`
    );
    sheet.appendChild(row);
    return row;
  });
  totalEl.textContent = "—";
  totalEl.classList.remove("ok");
}

function setStatus(i, key) {
  rowEls[i].querySelector(".status").innerHTML = STATUS[key];
}

function trimLog() {
  while (log.children.length > 16) log.firstElementChild.remove();
}

function entry(kind, icon, html) {
  const node = el("div", `entry ${kind}`, `<span class="ic">${icon}</span><span>${html}</span>`);
  log.appendChild(node);
  trimLog();
  return node;
}

function bubble(kind, who, html, chips = []) {
  const chipHtml = chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>` : "";
  const node = el("div", `bubble ${kind}`, `<span class="who">${who}</span>${html}${chipHtml}`);
  log.appendChild(node);
  trimLog();
  return node;
}

function moveCursor(i, click = false) {
  const row = rowEls[i];
  if (!row) return;
  const status = row.querySelector(".status");
  const x = status.offsetLeft + 24;
  const y = row.offsetTop + row.offsetHeight / 2 - 2;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  if (click) {
    setTimeout(() => {
      cursor.classList.remove("click");
      void cursor.offsetWidth; // restart the ripple
      cursor.classList.add("click");
    }, 650);
  }
}

async function countTotal() {
  const start = performance.now();
  const dur = 1100;
  return new Promise((resolve) => {
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      totalEl.textContent = fmt(TOTAL * eased);
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

async function matchRow(i) {
  const r = ROWS[i];
  rowEls.forEach((n) => n.classList.remove("active"));
  rowEls[i].classList.add("active");
  moveCursor(i, true);
  await sleep(900);
  setStatus(i, "ok");
  rowEls[i].classList.remove("active");
  entry("ok", "✓", `${r.party} matched to <b>${r.ref}</b>`);
  await sleep(450);
}

async function runDemo() {
  buildSheet();
  log.innerHTML = "";
  cursor.style.transform = `translate(${screen.clientWidth * 0.55}px, 60px)`;
  await sleep(700);

  entry("act", "▸", "Opened <b>statement_sep.pdf</b> and the ledger");
  await sleep(800);
  entry("act", "▸", `Reading ${ROWS.length} statement lines`);
  await sleep(700);

  for (let i = 0; i < 4; i++) await matchRow(i);

  // The one it can't decide alone.
  const ai = ROWS.findIndex((r) => r.ask);
  const a = ROWS[ai];
  rowEls[ai].classList.add("flag");
  moveCursor(ai, true);
  await sleep(900);
  setStatus(ai, "ask");
  entry("act", "▸", "Second payment to Acme Supplies, but only one invoice in the ledger");
  await sleep(900);
  bubble(
    "ask",
    "Needs your answer",
    `Acme Supplies was paid <b>${fmt(a.amount)}</b> twice (3 Sep and 14 Sep). The ledger has one invoice. Duplicate payment, or a second invoice?`,
    ["📎 2 screenshots", "statement line 5", "INV-2271"]
  );
  await sleep(2200);
  const typing = bubble("you", "You", '<span class="typing"><i></i><i></i><i></i></span>');
  await sleep(1400);
  typing.remove();
  bubble("you", "You", "Second invoice, INV-2291. Enter it.");
  await sleep(1000);
  entry("memo", "✎", "Remembered: Acme can bill twice a month. Check the invoice number before flagging.");
  await sleep(1000);
  moveCursor(ai, true);
  await sleep(800);
  rowEls[ai].classList.remove("flag");
  rowEls[ai].classList.add("new");
  setStatus(ai, "entered");
  entry("ok", "✓", `Entered <b>${a.ref}</b> in the ledger`);
  await sleep(600);

  for (let i = ai + 1; i < ROWS.length; i++) await matchRow(i);

  // Done means checked, not claimed.
  entry("act", "▸", "Checking the work before reporting");
  await countTotal();
  totalEl.classList.add("ok");
  await sleep(300);
  entry("ok", "✓", `Statement <b>${fmt(TOTAL)}</b> = ledger <b>${fmt(TOTAL)}</b>`);
  await sleep(700);
  bubble("done", "Done · checked on screen", `${ROWS.length} of ${ROWS.length} lines matched, 1 invoice entered.`, [
    "1 question",
    "0 guesses",
    "16 screenshots",
  ]);
  await sleep(6000);
}

function renderStaticDemo() {
  buildSheet();
  ROWS.forEach((r, i) => setStatus(i, r.ask ? "entered" : "ok"));
  totalEl.textContent = fmt(TOTAL);
  totalEl.classList.add("ok");
  const a = ROWS.find((r) => r.ask);
  bubble("ask", "Needs your answer", `Acme Supplies was paid <b>${fmt(a.amount)}</b> twice. Duplicate payment, or a second invoice?`, ["📎 2 screenshots"]);
  bubble("you", "You", "Second invoice, INV-2291. Enter it.");
  entry("memo", "✎", "Remembered: Acme can bill twice a month.");
  entry("ok", "✓", `Statement <b>${fmt(TOTAL)}</b> = ledger <b>${fmt(TOTAL)}</b>`);
  bubble("done", "Done · checked on screen", `${ROWS.length} of ${ROWS.length} lines matched, 1 invoice entered.`, ["1 question", "0 guesses"]);
  cursor.style.display = "none";
}

if (sheet && log) {
  if (reduceMotion) {
    renderStaticDemo();
  } else {
    (async () => {
      // Loop forever; the page is a teaser, the demo is the product's heartbeat.
      for (;;) await runDemo();
    })();
  }
}

// ---------------------------------------------------------------------------
// Waitlist forms
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const JOINED_KEY = "decurix-waitlist-joined";

function markDone(form, text) {
  form.classList.remove("is-error");
  form.classList.add("is-done");
  form.querySelector(".form-note").innerHTML = text;
}

function alreadyJoined() {
  try {
    return localStorage.getItem(JOINED_KEY) === "1";
  } catch {
    return false;
  }
}

document.querySelectorAll("[data-waitlist]").forEach((form) => {
  const note = form.querySelector(".form-note");
  const button = form.querySelector("button");
  const label = button.querySelector("span");
  const defaultNote = note.textContent;
  const defaultLabel = label.textContent;

  if (alreadyJoined()) markDone(form, "<b>You're on the list.</b> We'll email you about access and releases.");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    form.classList.remove("is-error");

    if (!EMAIL_RE.test(email)) {
      form.classList.add("is-error");
      note.textContent = "That email doesn't look right. Mind checking it?";
      form.email.focus();
      return;
    }
    // A bot ticked the hidden honeypot. Read it defensively: a form without the field must still submit.
    const trap = form.elements.namedItem("botcheck");
    if (trap && trap.checked) return;

    if (!WAITLIST.accessKey) {
      console.warn("Decurix early access: set WAITLIST.accessKey in main.js (see website/README.md).");
      form.classList.add("is-error");
      note.textContent = "The waitlist opens in a moment. Please try again shortly.";
      return;
    }

    button.disabled = true;
    label.textContent = "Joining…";
    note.textContent = defaultNote;

    try {
      // Plain form data, not JSON: a "simple" request needs no CORS preflight.
      const body = new FormData();
      body.append("access_key", WAITLIST.accessKey);
      body.append("subject", "New Decurix early-access signup");
      body.append("from_name", "Decurix website");
      body.append("email", email);
      body.append("message", `${email} asked for Decurix early access.`);
      body.append("page", location.href);
      const res = await fetch(WAITLIST.endpoint, { method: "POST", headers: { Accept: "application/json" }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

      try {
        localStorage.setItem(JOINED_KEY, "1");
      } catch {}
      document.querySelectorAll("[data-waitlist]").forEach((f) =>
        markDone(f, "<b>You're on the list.</b> We'll email you about access and releases.")
      );
    } catch (err) {
      console.error("Decurix waitlist:", err);
      form.classList.add("is-error");
      note.textContent = "Something went wrong on our side. Please try again.";
      button.disabled = false;
      label.textContent = defaultLabel;
    }
  });
});
