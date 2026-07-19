#!/usr/bin/env node
/* Metab dataset validator.
   Usage: node validate.js [--strict]
   Encodes the mechanical parts of EDITORIAL.md and TAXONOMY.md.
   Errors always fail (exit 1). Warnings fail only with --strict.
   Judgment rules (source derivation, fingerprint, Try Today depth) cannot be
   machine-checked; they live in QC.md as manual gates. */

const fs = require("fs");
const path = require("path");

const strict = process.argv.includes("--strict");
const file = path.join(__dirname, "concepts.json");

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`[${id}] ${msg}`);
const warn = (id, msg) => warnings.push(`[${id}] ${msg}`);

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.error("FATAL: concepts.json does not parse: " + e.message);
  process.exit(1);
}

const concepts = data.concepts || [];
const manifest = data.categories || [];
const catById = Object.fromEntries(manifest.map((c) => [c.id, c]));
const groupIds = new Set((data.groups || []).map((g) => g.id));

/* --- manifest sanity --- */
for (const c of manifest) {
  if (!groupIds.has(c.group)) err("manifest", `category "${c.id}" points to unknown group "${c.group}"`);
  if (!["scenario", "description"].includes(c.front)) err("manifest", `category "${c.id}" has invalid front "${c.front}"`);
}

/* --- id registry --- */
const ids = new Set();
for (const c of concepts) {
  if (ids.has(c.id)) err(c.id, "duplicate id");
  ids.add(c.id);
}

/* Emotion terms for the names-in-definitions check (EDITORIAL rule 1). */
const feelingTerms = concepts
  .filter((c) => c.category === "feeling")
  .map((c) => c.term.toLowerCase());

/* Valence phrases (EDITORIAL rule 2). Conservative list to avoid false hits. */
const valence = [
  /\bnegative (emotion|feeling)s?\b/i,
  /\bpositive (emotion|feeling)s?\b/i,
  /\b(unpleasant|pleasant) (emotion|feeling)s?\b/i,
  /\bbad (emotion|feeling)s?\b/i,
  /\b(greatest|most important|best)\b(?!-)/i, // ranking language, world rule 2; allows compounds like "best-studied"
];

/* Crude sentence counter; abbreviation-safe enough for warnings. */
function sentences(text) {
  return (text.replace(/\b(vs|e\.g|i\.e|etc|Dr|St|Mr|Mrs)\./g, "$1")
    .match(/[.!?]+(\s|$)/g) || []).length || 1;
}

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SKILL_BRANCHES = new Set(["Emotional Skills", "Constructive Communication"]);
let emphasisCount = 0;

for (const c of concepts) {
  const id = c.id || "(no id)";
  const cat = catById[c.category];
  const isWorld = cat && cat.group === "world";

  /* required fields */
  for (const f of ["id", "term", "category", "breadcrumb", "scenario", "definition", "links"]) {
    if (!c[f] || (Array.isArray(c[f]) && c[f].length === 0)) err(id, `missing required field "${f}"`);
  }
  if (c.id && !kebab.test(c.id)) err(id, "id is not kebab-case");
  if (!cat) { err(id, `unknown category "${c.category}"`); continue; }

  /* breadcrumbs (TAXONOMY conventions) */
  const bc = c.breadcrumb || [];
  if (bc[0] !== cat.label) err(id, `breadcrumb[0] "${bc[0]}" must equal category label "${cat.label}"`);
  if (bc.length < 2) err(id, "breadcrumb needs at least Category > Branch");
  if (bc.length > 3) err(id, "breadcrumb deeper than 3 levels");
  if (bc.length === 3 && !(c.category === "feeling" && bc[1] === "Emotion Families"))
    err(id, "third breadcrumb level is reserved for Feeling > Emotion Families");
  if (cat.branches && !cat.branches.includes(bc[1]))
    err(id, `branch "${bc[1]}" not in manifest branches [${cat.branches}]`);

  /* group-specific schema (EXPANSION-2 spec) */
  if (isWorld) {
    if (!c.origin) err(id, "world card missing guaranteed field origin");
    if (!(c.opposed && c.opposed.length) && !(c.relatedTerms && c.relatedTerms.length))
      err(id, "world card must fill at least one of opposed / relatedTerms");
  } else {
    for (const f of ["origin", "opposed", "relatedTerms"])
      if (c[f]) err(id, `self card carries world-only field "${f}"`);
  }

  /* scenario/front length (rules 5, 14; skill-card exemption cap 4) */
  if (c.scenario) {
    const n = sentences(c.scenario);
    const cap = !isWorld && SKILL_BRANCHES.has(bc[1]) ? 4 : 2;
    if (n > cap) warn(id, `front has ~${n} sentences (cap ${cap})`);
    const em = (c.scenario.match(/_[^_]+_/g) || []).length;
    emphasisCount += em;
    if ((c.scenario.split("_").length - 1) % 2 !== 0) err(id, "unbalanced underscore emphasis in front");
    if (isWorld) {
      /* rule 14: front must not name the answer */
      for (const w of c.term.toLowerCase().split(/[\s-]+/))
        if (w.length > 4 && new RegExp(`\\b${w}`, "i").test(c.scenario))
          warn(id, `front may name its answer ("${w}")`);
    }
  }

  /* definitions (rules 1, 2, 4) */
  if (c.definition) {
    if (sentences(c.definition) > 3) warn(id, "definition longer than 3 sentences");
    if (c.category === "feeling")
      for (const t of feelingTerms)
        if (t !== c.term.toLowerCase() && new RegExp(`\\b${t}\\b`, "i").test(c.definition))
          err(id, `definition names another emotion ("${t}")`);
    for (const re of valence)
      if (re.test(c.definition)) err(id, `valence/ranking language in definition (${re})`);
  }

  /* em dashes anywhere in card text (house style) */
  for (const f of ["scenario", "definition", "tryToday", "origin"])
    if (typeof c[f] === "string" && c[f].includes("—")) warn(id, `em dash in ${f}`);

  /* links (rules 10, 11 format side; resolution is check-links.js) */
  for (const l of c.links || []) {
    if (!l.url || !/^https:\/\//.test(l.url)) err(id, `link url missing or not https: ${l.url}`);
    else if (!/wikipedia\.org|wiktionary\.org/.test(l.url)) warn(id, `non-Wikipedia/Wiktionary source: ${l.url}`);
  }

  /* references */
  for (const r of c.related || [])
    if (!ids.has(r)) warn(id, `related -> "${r}" does not resolve`);
  const cw = c.confusedWith;
  if (cw) {
    if (!cw.note) err(id, "confusedWith without note");
    if (cw.id && !ids.has(cw.id)) warn(id, `confusedWith.id -> "${cw.id}" does not resolve`);
  }
  for (const f of ["opposed", "relatedTerms"])
    for (const e of c[f] || []) {
      if (!e.term || !e.note) err(id, `${f} entry needs term and note`);
      if (e.id && !ids.has(e.id)) warn(id, `${f}.id -> "${e.id}" does not resolve`);
    }
}

/* emphasis budget (rule 6): a handful per batch; global heuristic */
if (emphasisCount > Math.ceil(concepts.length / 5))
  warnings.push(`[global] ${emphasisCount} emphasized pivots across ${concepts.length} cards; rule 6 budget is roughly 1 in 5`);

/* --- report --- */
console.log(`Metab validate: ${concepts.length} concepts checked.`);
if (errors.length) { console.log(`\n${errors.length} ERROR(S):`); errors.forEach((e) => console.log("  " + e)); }
if (warnings.length) { console.log(`\n${warnings.length} warning(s):`); warnings.forEach((w) => console.log("  " + w)); }
if (!errors.length && !warnings.length) console.log("Clean.");
process.exit(errors.length || (strict && warnings.length) ? 1 : 0);
