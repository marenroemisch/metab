# Metab Editorial Rules

Content style rules for every entry in `data/concepts.json`. These apply to AI-drafted batches and community contributions alike. Structural rules (categories, breadcrumbs) live in `TAXONOMY.md`.

## Definitions

1. **Never name other emotions or concepts inside a definition.** A definition that says "fear pointed at the future" forces the reader to hold two concepts at once. Describe the felt quality directly ("a diffuse sense of threat"). The one sanctioned place for cross-concept comparison is the "often confused with" field.
2. **No valence judgments, ever.** No "negative emotion", "positive feeling", "bad", "unpleasant" as classification. Emotions are described by what they do and how they work, not rated. Descriptive words about felt quality (heavy, quiet, restless, sour) are fine; verdicts are not.
3. **Definitions must be recognizably derived from the linked source.** Fetch the source's actual definition first and write from it. Tweaking is allowed and expected: shorten, omit confusing detail, add helpful context, reword to satisfy rules 1-2. Free invention is not. The test: a reviewer reading the definition next to the linked source must see the lineage.
4. Length: 1-3 sentences. The second sentence earns its place by adding mechanism or consequence, not repetition.

## Scenarios

5. Second person, 1-2 sentences, Tuesday test (a normal person, a normal day).
5a. **Skill-card exemption.** Cards in skills branches (Emotional Skills, Constructive Communication) may use up to 4 sentences, because showing a skill often needs a before/after contrast that a felt state does not. The cap is a ceiling, not a target.
6. **Emphasis device, used sparingly:** wrap the word or phrase that points at the puzzle in underscores (`_something_ in you goes flat`). The card renders it in italics. Use only where a scenario naturally contains such a pivot word. Forcing it on every card wears it out; a handful per batch is the ceiling.
7. **The scenario must accurately and clearly show the feeling, in 1-2 simple sentences.** Concrete moment beats clever metaphor: "you scroll through dozens of contacts and find no one to call" shows loneliness; "watching everyone through glass" decorates it. If the reader cannot feel the shape of the answer before the reveal, the scenario has failed.
7a. **Fingerprint rule.** Every scenario must contain at least one distinctive anchor that fits only its concept. A scenario that equally supports three neighboring concepts (overconfidence, Dunning-Kruger, bluffing) has failed even if it is vivid. Mirrors rule 14 for description cards.
7b. **Plain words, contradiction on the surface.** State the facts of the situation explicitly enough that a non-native reader catches the point on first pass. If the reader must infer what actually happened from a turn of phrase ("the number felt more trustworthy"), the scenario is dressing the point up instead of showing it.

## Try Today

8. **No generic prompts.** "Name the feeling" and "notice it today" are banned as defaults (affect labeling itself is the one entry allowed to be about naming).
9. **Mine the concept for its own depth.** Each concept usually contains a functional or transformative angle: disillusionment is also the freeing from an illusion, envy is data about what you want, resentment marks an unvoiced boundary. The Try Today should hand the reader that angle as one small action or reframe. If no such angle exists, a precise observation prompt is acceptable; a platitude is not.

## Links

10. **Wikipedia first, Wiktionary as fallback.** No other sources unless neither covers the concept, and then only stable, non-commercial pages.
11. Every link must be verified to resolve with real content before shipping. Client-rendered pages that cannot be machine-verified count as unverified.

## Often confused with

12. The field is labeled "Often confused with" everywhere: UI, review docs, discussions. The pair must be genuinely confusable in lived experience, not merely adjacent. The note states the distinction in two short contrasting sentences where possible.
12a. Actively check every entry for a strong candidate before shipping. Missing pairs where a great one exists (grief/mourning, granularity/emotional intelligence) count as gaps.

## Description cards (world categories: Philosophy, Art)

14. **The front describes without naming.** It never contains the term, its obvious cognates, or a giveaway proper noun. Fingerprint rule: at least one distinctive, verifiable anchor that fits only this answer (the painted porch, the one sold painting, the insult that became a name). A front that fits ten answers has failed, exactly as a scenario that fits ten feelings has failed.
15. **Prefer the lived echo where it exists.** If the idea cashes out in experience (Ship of Theseus, dichotomy of control), a second-person moment is the strongest description-without-naming. Third-person portraits are for entries with no lived moment (persons, most movements). Same card kind, writing choice only.
16. **Reveal order:** term and breadcrumb, definition, origin, opposed, related, often confused with, try today, links. Definitions remain source-derived (rule 3 verbatim); origin dates and opposition claims are facts and get verified against the linked source at batch time like links. No quality verdicts on ideas, artists, or works (rule 2, extended). Try Today only where the concept yields a non-generic action; common for ideas and movements, rare for persons, better absent than forced.

17. **Bridge rule (should, not must).** Every world card tries to name one link into the self group, in related, often-confused-with, or the definition's second sentence: Stoicism points at cognitive reappraisal, Impressionism at perception. Skip it where it would be forced; a fake bridge is worse than none. This is what keeps the world group tethered to the me-tab thesis.

## Process

13. Reviewer feedback on any entry becomes a rule here when it generalizes. This file is the memory of those decisions.
13a. Every batch passes the gates in `QC.md` before it reaches review. Machine-checkable rules live in `validate.js`; run it after any dataset change.
