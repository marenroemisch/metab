/* Metab: loads the dataset and settings, shows a front-first card.
   The card front is a lived scenario for "self" categories and a
   description-without-naming for "world" categories (philosophy, art);
   the dataset's "categories" manifest declares which is which via "front".
   Settings (chrome.storage.local, key "metabSettings"):
     categories: { <category>: boolean }          // absent or true is shown; only explicit false hides it
     branches:   { "<category>/<branch>": boolean } // level-2 breadcrumb filters, same convention
     frequency:  "tab" | "day"                    // new card on every tab (default) or one card per day
     balance:    "proportional" | "balanced"      // random over all cards, or category first, then card
   Daily pick is remembered under "metabDaily" = { date: "YYYY-MM-DD", id }. */

const DEFAULT_SETTINGS = { categories: {}, branches: {}, frequency: "tab", balance: "proportional" };

/* Filled from the dataset's categories manifest on init. */
let categoryMeta = {};

/* Where "Report a problem" sends feedback. To open the extension to people
   without a GitHub account later, replace buildFeedbackUrl's return with a
   Google Form link (prefill the card via an entry.<id> query param). Nothing
   else needs to change. No email address is used anywhere, by design. */
const FEEDBACK_REPO = "marenroemisch/metab";

function buildFeedbackUrl(concept) {
  const version = chrome.runtime.getManifest().version;
  const term = concept ? concept.term : "(no card shown)";
  const id = concept ? concept.id : "-";
  const category = concept ? concept.category : "-";

  const title = `Card feedback: ${term}`;
  const body =
    `Card: ${term} (${id})\n` +
    `Category: ${category}\n` +
    `Version: ${version}\n\n` +
    `What is the problem? (accuracy, scenario, wording, link, categorization, other)\n\n` +
    `Describe it here:\n`;

  return `https://github.com/${FEEDBACK_REPO}/issues/new` +
    `?labels=feedback` +
    `&title=${encodeURIComponent(title)}` +
    `&body=${encodeURIComponent(body)}`;
}

let concepts = [];
let pool = [];
let settings = DEFAULT_SETTINGS;
let current = null;

/* Promise wrapper so we can await chrome.storage. */
function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
}

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/* A category is shown unless it is explicitly set to false. New categories added
   to the dataset later are therefore visible by default until the user opts out. */
function isEnabled(category) {
  return settings.categories[category] !== false;
}

/* Branch filters only exist for categories whose manifest declares branches
   (e.g. Philosophy: Ideas / Philosophers). Same absent-or-true convention. */
function branchEnabled(c) {
  const meta = categoryMeta[c.category];
  if (!meta || !meta.branches) return true;
  const branch = (c.breadcrumb && c.breadcrumb[1]) || "";
  return settings.branches[c.category + "/" + branch] !== false;
}

function buildPool() {
  pool = concepts.filter((c) => isEnabled(c.category) && branchEnabled(c));
}

function pickRandom(excludeId) {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  let candidates = pool;
  if (settings.balance === "balanced") {
    /* Category first (uniform among enabled categories with cards), then card.
       Keeps a small collection as present as a large one. */
    const byCat = {};
    pool.forEach((c) => { (byCat[c.category] = byCat[c.category] || []).push(c); });
    const cats = Object.keys(byCat);
    candidates = byCat[cats[Math.floor(Math.random() * cats.length)]];
    if (candidates.length === 1 && candidates[0].id === excludeId) candidates = pool;
  }

  let next = candidates[Math.floor(Math.random() * candidates.length)];
  let guard = 0;
  while (excludeId && next.id === excludeId && guard++ < 20) {
    next = candidates[Math.floor(Math.random() * candidates.length)];
  }
  return next;
}

async function init() {
  const [dataRes, stored] = await Promise.all([
    fetch(chrome.runtime.getURL("concepts.json")).then((r) => r.json()),
    storageGet(["metabSettings", "metabDaily"])
  ]);

  concepts = dataRes.concepts;
  (dataRes.categories || []).forEach((c) => { categoryMeta[c.id] = c; });
  settings = Object.assign({}, DEFAULT_SETTINGS, stored.metabSettings || {});
  settings.categories = settings.categories || {};
  settings.branches = settings.branches || {};
  buildPool();

  document.getElementById("reveal-btn").addEventListener("click", reveal);
  document.getElementById("another-btn").addEventListener("click", showAnother);
  document.getElementById("back-btn").addEventListener("click", backToScenario);
  const settingsBtn = document.getElementById("settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());
  }
  const feedbackBtn = document.getElementById("feedback-btn");
  if (feedbackBtn) {
    feedbackBtn.addEventListener("click", () => {
      window.open(buildFeedbackUrl(current), "_blank", "noopener,noreferrer");
    });
  }

  if (pool.length === 0) {
    renderEmpty();
    return;
  }

  await showInitial(stored.metabDaily);
}

/* On load: in daily mode restore today's pick if it still qualifies, otherwise
   choose and remember a new one. In per-tab mode always choose fresh. */
async function showInitial(daily) {
  if (settings.frequency === "day") {
    if (daily && daily.date === todayStr()) {
      const saved = pool.find((c) => c.id === daily.id);
      if (saved) {
        current = saved;
        render(current);
        return;
      }
    }
    current = pickRandom(null);
    await storageSet({ metabDaily: { date: todayStr(), id: current.id } });
    render(current);
    return;
  }
  current = pickRandom(null);
  render(current);
}

/* "Show another" reshuffles. In daily mode the user is deliberately overriding,
   so the new card becomes today's remembered pick. */
async function showAnother() {
  current = pickRandom(current ? current.id : null);
  if (settings.frequency === "day" && current) {
    await storageSet({ metabDaily: { date: todayStr(), id: current.id } });
  }
  render(current);
}

/* Renders text with _underscore emphasis_ as <em>, HTML-escaped first. */
function setEmphasized(el, text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  el.innerHTML = escaped.replace(/_([^_]+)_/g, "<em>$1</em>");
}

/* Category label. On the front (before reveal) it includes the branch as a
   scoped hint ("Thinking › Mental Models"), never a third level. After reveal
   it shrinks to the category alone; the full breadcrumb is on the card. */
function categoryLabel(c, revealed) {
  const meta = categoryMeta[c.category];
  const base = (meta && meta.label) || labelFor(c.category);
  if (revealed) return base;
  const branch = c.breadcrumb && c.breadcrumb[1];
  return branch ? base + " › " + branch : base;
}

function render(c) {
  const meta = categoryMeta[c.category];
  document.getElementById("category").textContent = categoryLabel(c, !c.scenario);

  const isDescription = meta && meta.front === "description";
  document.getElementById("back-btn").innerHTML =
    "&larr; " + (isDescription ? "Back to the description" : "Back to the situation");

  const scenarioView = document.getElementById("scenario-view");
  const conceptView = document.getElementById("concept-view");
  const footer = document.getElementById("card-footer");
  const backBtn = document.getElementById("back-btn");

  if (c.scenario) {
    setEmphasized(document.getElementById("scenario"), c.scenario);
    scenarioView.hidden = false;
    conceptView.hidden = true;
    footer.hidden = true;
    backBtn.hidden = true;
  } else {
    scenarioView.hidden = true;
    fillConcept(c);
    conceptView.hidden = false;
    footer.hidden = false;
    backBtn.hidden = true;
  }
}

/* Turns an unknown category id into a readable label (forward-compatible with
   future categories or collections like philosophy, psychology, art). */
function labelFor(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function reveal() {
  fillConcept(current);
  document.getElementById("category").textContent = categoryLabel(current, true);
  document.getElementById("scenario-view").hidden = true;
  document.getElementById("concept-view").hidden = false;
  document.getElementById("card-footer").hidden = false;
  document.getElementById("back-btn").hidden = !current.scenario;
}

function backToScenario() {
  document.getElementById("category").textContent = categoryLabel(current, false);
  document.getElementById("concept-view").hidden = true;
  document.getElementById("scenario-view").hidden = false;
  document.getElementById("card-footer").hidden = true;
}

function fillConcept(c) {
  const bc = document.getElementById("breadcrumb");
  bc.textContent = "";
  (c.breadcrumb || []).forEach((part, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "›";
      bc.appendChild(sep);
    }
    bc.appendChild(document.createTextNode(part));
  });

  document.getElementById("term").textContent = c.term;
  document.getElementById("definition").textContent = c.definition;

  const origin = document.getElementById("origin");
  if (c.origin) {
    document.getElementById("origin-text").textContent = c.origin;
    origin.hidden = false;
  } else {
    origin.hidden = true;
  }

  fillTermList("opposed", "opposed-list", c.opposed);
  fillTermList("related-terms", "related-list", c.relatedTerms);

  const confused = document.getElementById("confused");
  if (c.confusedWith && c.confusedWith.note) {
    document.getElementById("confused-text").textContent = c.confusedWith.note;
    confused.hidden = false;
  } else {
    confused.hidden = true;
  }

  const tryToday = document.getElementById("try-today");
  if (c.tryToday) {
    document.getElementById("try-text").textContent = c.tryToday;
    tryToday.hidden = false;
  } else {
    tryToday.hidden = true;
  }

  const links = document.getElementById("links");
  links.textContent = "";
  (c.links || []).forEach((l) => {
    const a = document.createElement("a");
    a.href = l.url;
    a.textContent = l.label + " ↗";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    links.appendChild(a);
  });
  links.hidden = !(c.links && c.links.length);
}

/* Renders opposed / relatedTerms entries ({term, note, id?}) as "Term. Note" items. */
function fillTermList(wrapId, listId, items) {
  const wrap = document.getElementById(wrapId);
  const list = document.getElementById(listId);
  list.textContent = "";
  if (!items || !items.length) {
    wrap.hidden = true;
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = item.term;
    li.appendChild(strong);
    if (item.note) li.appendChild(document.createTextNode(" " + item.note));
    list.appendChild(li);
  });
  wrap.hidden = false;
}

/* Shown when every category is switched off (or the enabled ones are empty). */
function renderEmpty() {
  document.getElementById("category").textContent = "";
  document.getElementById("scenario-view").hidden = true;
  document.getElementById("card-footer").hidden = true;
  const conceptView = document.getElementById("concept-view");
  conceptView.hidden = false;
  document.getElementById("breadcrumb").textContent = "";
  document.getElementById("term").textContent = "Nothing to show";
  document.getElementById("definition").textContent =
    "Every category is currently switched off. Open settings to turn at least one back on.";
  document.getElementById("origin").hidden = true;
  document.getElementById("opposed").hidden = true;
  document.getElementById("related-terms").hidden = true;
  document.getElementById("confused").hidden = true;
  document.getElementById("try-today").hidden = true;
  document.getElementById("links").hidden = true;
}

init();
