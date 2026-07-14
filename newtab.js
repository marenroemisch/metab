/* Metab skeleton: loads the dataset, shows a random concept scenario-first. */

const CATEGORY_LABELS = {
  "thinking": "Thinking",
  "feeling": "Feeling",
  "relating": "Relating",
  "communicating": "Communicating"
};

let concepts = [];
let current = null;

async function init() {
  const res = await fetch(chrome.runtime.getURL("data/concepts.json"));
  const data = await res.json();
  concepts = data.concepts;
  showRandom();

  document.getElementById("reveal-btn").addEventListener("click", reveal);
  document.getElementById("another-btn").addEventListener("click", showRandom);
  document.getElementById("back-btn").addEventListener("click", backToScenario);
}

function showRandom() {
  let next = concepts[Math.floor(Math.random() * concepts.length)];
  // Avoid showing the same concept twice in a row (when more than one exists)
  while (concepts.length > 1 && current && next.id === current.id) {
    next = concepts[Math.floor(Math.random() * concepts.length)];
  }
  current = next;
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
  document.getElementById("category").textContent = CATEGORY_LABELS[c.category] || c.category;

  const scenarioView = document.getElementById("scenario-view");
  const conceptView = document.getElementById("concept-view");
  const footer = document.getElementById("card-footer");
  const backBtn = document.getElementById("back-btn");

  if (c.scenario) {
    // Scenario first: no footer, the only action is the reveal.
    setEmphasized(document.getElementById("scenario"), c.scenario);
    scenarioView.hidden = false;
    conceptView.hidden = true;
    footer.hidden = true;
    backBtn.hidden = true;
  } else {
    // No scenario available: show the concept directly, footer without back.
    scenarioView.hidden = true;
    fillConcept(c);
    conceptView.hidden = false;
    footer.hidden = false;
    backBtn.hidden = true;
  }
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
  // Breadcrumb
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

  // Often confused with
  const confused = document.getElementById("confused");
  if (c.confusedWith && c.confusedWith.note) {
    document.getElementById("confused-text").textContent = c.confusedWith.note;
    confused.hidden = false;
  } else {
    confused.hidden = true;
  }

  // Try it today
  const tryToday = document.getElementById("try-today");
  if (c.tryToday) {
    document.getElementById("try-text").textContent = c.tryToday;
    tryToday.hidden = false;
  } else {
    tryToday.hidden = true;
  }

  // Links
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

init();
