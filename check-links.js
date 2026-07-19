#!/usr/bin/env node
/* Metab link checker. Requests every URL in data/concepts.json and reports
   dead or suspicious ones. Intended for CI (GitHub Action) or local runs:
   node check-links.js
   A link passes only if the response is HTTP 200 and the body has real
   content (rule 11). Soft-404s from Wikipedia return 404, so status
   checking is enough there; other hosts get a minimum-length body check. */

const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "concepts.json"), "utf8"));
const urls = new Map(); // url -> [ids]
for (const c of data.concepts || []) {
  for (const l of c.links || []) {
    if (!urls.has(l.url)) urls.set(l.url, []);
    urls.get(l.url).push(c.id);
  }
}

async function check(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "metab-link-check/1.0 (github.com/marenroemisch/metab)" } });
    if (res.status !== 200) return `HTTP ${res.status}`;
    const body = await res.text();
    if (body.length < 2000) return `thin content (${body.length} bytes)`;
    return null;
  } catch (e) {
    return e.message;
  }
}

(async () => {
  const failures = [];
  // sequential with a small delay: polite to Wikipedia, ~150 URLs max
  for (const [url, ids] of urls) {
    const problem = await check(url);
    if (problem) failures.push({ url, ids, problem });
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log(`check-links: ${urls.size} unique URLs checked.`);
  if (failures.length) {
    console.log(`\n${failures.length} FAILURE(S):`);
    for (const f of failures) console.log(`  ${f.url} [${f.ids.join(", ")}]: ${f.problem}`);
    process.exit(1);
  }
  console.log("All links resolve.");
})();
