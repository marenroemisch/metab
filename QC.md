# Metab Quality Control Protocol

Binding for every AI drafting or editing content. Purpose: nothing reaches Marén's review that a machine or a careful pre-reviewer could have caught. Her review is for editorial judgment, not defect hunting.

## The gates, in order

Every batch (new cards or edits) passes all four gates before a review doc is produced. A review doc without the attestation header below is not ready for her.

**Gate 1 - Sources.** For every new or changed definition: fetch the linked source, write the definition from its lead, then re-read them side by side (EDITORIAL rule 3). Verify every link resolves with real content at fetch time. Verify origin dates and opposition claims against the source (rule 16). Record the fetch date.

**Gate 2 - Machine validation.** Run `node validate.js` on the dataset with the batch staged in. Zero errors required. Every warning is either fixed or explained in the review doc. New permanent-dangling references need a stated reason.

**Gate 3 - Fingerprint pass.** For each card, name its two nearest neighbors (in the dataset or in common knowledge) and check the front against them: does this front fit only its own answer (rules 7a, 14)? Fix or flag every failure. Then sweep the batch once against the full rule list: definitions 1-4, scenarios 5-7b, Try Today 8-9, confused pairs 12-12a (actively hunt missing strong pairs), world cards 14-16 plus the bridge rule.

**Gate 4 - Adversarial read.** Read the batch once as Marén: blunt, hunting for valence verdicts, invented definition content, scenarios that decorate instead of show, generic Try Todays, giveaway fronts. Fix what the read finds before she sees it. If nothing was found, the read was not adversarial enough; the historical base rate of her findings per batch is not zero.

## Attestation header

Every review doc starts with:

```
QC: sources fetched and compared <date> | validate.js clean (N warnings, explained below) | fingerprint pass done, K cards revised | adversarial read done, M fixes
```

The numbers matter: they tell her whether the gates actually ran or were rubber-stamped.

## The ratchet

When her review catches a defect class twice, it stops being a review item:
- mechanically checkable -> new check in `validate.js`, same session
- judgment-based -> new numbered rule in `EDITORIAL.md` (existing rule 13) and, if a gate missed it, a named item in Gate 3's sweep list

The goal is a monotone decline in findings per batch. If a batch produces more findings than the previous one, the next batch does not start until the cause is a new rule or check.
