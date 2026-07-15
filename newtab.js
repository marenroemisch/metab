/* Metab: loads the dataset and settings, shows a scenario-first card.
   Settings (chrome.storage.local, key "metabSettings"):
     categories: { <category>: boolean }  // a category absent or true is shown; only explicit false hides it
     frequency:  "tab" | "day"            // new card on every tab (default) or one card per day
   Daily pick is remembered under "metabDaily" = { date: "YYYY-MM-DD", id }. */

const CATEGORY_LABELS = {
  "thinking": "Thinking",
  "feeling": "Feeling",
  "relating": "Relating",
  "communicating": "Communicating"
};

const DEFAULT_SETTINGS = { categories: {}, frequency: "tab" };

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

function buildPool() {
  pool = concepts.filter((c) => isEnabled(c.category));
}

function pickRandom(excludeId) {
  if (pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  let next = pool[Math.floor(Math.random() * pool.length)];
  while (excludeId && next.id === excludeId) {
    next = pool[Math.floor(Math.random() * pool.length)];
  }
  return next;
}

async function init() {
  const [dataRes, stored] = await Promise.all([
    fetch(chrome.runtime.getURL("concepts.json")).then((r) => r.json()),
    storageGet(["metabSettings", "metabDaily"])
  ]);

  concepts = dataRes.concepts;
  settings = Object.assign({}, DEFAULT_SETTINGS, stored.metabSettings || {});
  settings.categories = settings.categories || {};
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

function render(c) {
  document.getElementById("category").textContent = CATEGORY_LABELS[c.category] || labelFor(c.category);

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
  document.getElementById("scenario-view").hidden = true;
  document.getElementById("concept-view").hidden = false;
  document.getElementById("card-footer").hidden = false;
  document.getElementById("back-btn").hidden = !current.scenario;
}

function backToScenario() {
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
  document.getElementById("confused").hidden = true;
  document.getElementById("try-today").hidden = true;
  document.getElementById("links").hidden = true;
}

init();
