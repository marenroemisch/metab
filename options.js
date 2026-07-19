/* Metab settings page. Writes to chrome.storage.local under "metabSettings".
   Structure is driven by the dataset's "groups" and "categories" manifest:
   categories render grouped under their group heading, and categories that
   declare branches (Philosophy: Ideas / Philosophers, Art: Movements / Artists)
   get indented sub-toggles. Datasets without a manifest fall back to a flat
   list derived from the concepts, so nothing breaks on older data. */

const DEFAULT_SETTINGS = { categories: {}, branches: {}, frequency: "tab", balance: "proportional" };

let settings = DEFAULT_SETTINGS;
let manifest = { groups: [], categories: [] };
let savedTimer = null;

function storageGet(keys) {
  return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}
function storageSet(obj) {
  return new Promise((resolve) => chrome.storage.local.set(obj, resolve));
}

function labelFor(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/* Fallback when the dataset carries no manifest: one flat group. */
function manifestFromData(concepts) {
  const seen = [];
  concepts.forEach((c) => {
    if (c.category && !seen.includes(c.category)) seen.push(c.category);
  });
  return {
    groups: [{ id: "all", label: "" }],
    categories: seen.map((id) => ({ id, label: labelFor(id), group: "all" }))
  };
}

function categoryEnabled(id) {
  return settings.categories[id] !== false;
}
function branchKey(catId, branch) {
  return catId + "/" + branch;
}
function branchEnabled(catId, branch) {
  return settings.branches[branchKey(catId, branch)] !== false;
}

/* True if at least one category (with at least one enabled branch, where
   branches exist) would remain on after applying the pending change. */
function anythingLeftOn(change) {
  return manifest.categories.some((cat) => {
    let catOn = categoryEnabled(cat.id);
    if (change.category === cat.id && change.branch === undefined) catOn = change.value;
    if (!catOn) return false;
    if (!cat.branches) return true;
    return cat.branches.some((b) => {
      let on = branchEnabled(cat.id, b);
      if (change.category === cat.id && change.branch === b) on = change.value;
      return on;
    });
  });
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

function makeToggleRow(label, checked, className, onChange) {
  const row = document.createElement("label");
  row.className = className;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;

  const span = document.createElement("span");
  span.textContent = label;

  input.addEventListener("change", () => onChange(input));

  row.appendChild(input);
  row.appendChild(span);
  return { row, input };
}

function renderToggles() {
  const wrap = document.getElementById("category-toggles");
  wrap.textContent = "";

  manifest.groups.forEach((group) => {
    const cats = manifest.categories.filter((c) => c.group === group.id);
    if (!cats.length) return;

    if (group.label) {
      const heading = document.createElement("div");
      heading.className = "toggle-group-heading";
      heading.textContent = group.label;
      wrap.appendChild(heading);
    }

    cats.forEach((cat) => {
      const subInputs = [];

      const catToggle = makeToggleRow(cat.label, categoryEnabled(cat.id), "toggle-row", (input) => {
        if (!input.checked && !anythingLeftOn({ category: cat.id, value: false })) {
          input.checked = true;
          return;
        }
        settings.categories[cat.id] = input.checked;
        subInputs.forEach((si) => { si.disabled = !input.checked; });
        save();
      });
      wrap.appendChild(catToggle.row);

      (cat.branches || []).forEach((branch) => {
        const sub = makeToggleRow(branch, branchEnabled(cat.id, branch), "toggle-row toggle-sub", (input) => {
          if (!input.checked && !anythingLeftOn({ category: cat.id, branch, value: false })) {
            input.checked = true;
            return;
          }
          settings.branches[branchKey(cat.id, branch)] = input.checked;
          save();
        });
        sub.input.disabled = !categoryEnabled(cat.id);
        subInputs.push(sub.input);
        wrap.appendChild(sub.row);
      });
    });
  });
}

function bindRadios(name, key) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((radio) => {
    radio.checked = radio.value === settings[key];
    radio.addEventListener("change", () => {
      if (radio.checked) {
        settings[key] = radio.value;
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
  settings.branches = settings.branches || {};

  manifest = (dataRes.categories && dataRes.categories.length)
    ? { groups: dataRes.groups || [{ id: "all", label: "" }], categories: dataRes.categories }
    : manifestFromData(dataRes.concepts);

  renderToggles();
  bindRadios("frequency", "frequency");
  bindRadios("balance", "balance");
}

init();
