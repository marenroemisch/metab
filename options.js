/* Metab settings page. Writes to chrome.storage.local under "metabSettings".
   The category list is derived from the dataset, so any categories added later
   (including future collections such as philosophy, psychology, or art) appear
   here automatically with no change to this file. */

const CATEGORY_LABELS = {
  "thinking": "Thinking",
  "feeling": "Feeling",
  "relating": "Relating",
  "communicating": "Communicating"
};

const DEFAULT_SETTINGS = { categories: {}, frequency: "tab" };

let settings = DEFAULT_SETTINGS;
let savedTimer = null;

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
}

function labelFor(id) {
  return CATEGORY_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1);
}

/* Distinct categories in the order they first appear in the dataset. */
function categoriesInData(concepts) {
  const seen = [];
  concepts.forEach((c) => {
    if (c.category && !seen.includes(c.category)) seen.push(c.category);
  });
  return seen;
}

function isEnabled(category) {
  return settings.categories[category] !== false;
}

function flashSaved() {
  const note = document.getElementById("saved-note");
  note.hidden = false;
  if (savedTimer) clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { note.hidden = true; }, 1200);
}

async function save() {
  await storageSet({ metabSettings: settings });
  flashSaved();
}

function renderCategoryToggles(categories) {
  const wrap = document.getElementById("category-toggles");
  wrap.textContent = "";

  categories.forEach((cat) => {
    const row = document.createElement("label");
    row.className = "toggle-row";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isEnabled(cat);
    input.dataset.category = cat;

    const span = document.createElement("span");
    span.textContent = labelFor(cat);

    input.addEventListener("change", () => onToggle(input, categories));

    row.appendChild(input);
    row.appendChild(span);
    wrap.appendChild(row);
  });
}

/* Keep at least one category on. If the user unticks the last one, refuse and
   re-tick it rather than leaving them with an empty new tab. */
function onToggle(input, categories) {
  const cat = input.dataset.category;
  const wouldEnable = input.checked;

  if (!wouldEnable) {
    const anyOtherOn = categories.some(
      (c) => c !== cat && settings.categories[c] !== false
    );
    if (!anyOtherOn) {
      input.checked = true;
      return;
    }
  }

  settings.categories[cat] = wouldEnable;
  save();
}

function renderFrequency() {
  document.querySelectorAll('input[name="frequency"]').forEach((radio) => {
    radio.checked = radio.value === settings.frequency;
    radio.addEventListener("change", () => {
      if (radio.checked) {
        settings.frequency = radio.value;
        save();
      }
    });
  });
}

async function init() {
  const [dataRes, stored] = await Promise.all([
    fetch(chrome.runtime.getURL("concepts.json")).then((r) => r.json()),
    storageGet(["metabSettings"])
  ]);

  settings = Object.assign({}, DEFAULT_SETTINGS, stored.metabSettings || {});
  settings.categories = settings.categories || {};

  renderCategoryToggles(categoriesInData(dataRes.concepts));
  renderFrequency();
}

init();
