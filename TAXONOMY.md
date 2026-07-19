# Metab Taxonomy

Categories are organized in two groups, declared in the dataset's `groups`/`categories` manifest. The **self** group (Thinking, Feeling, Relating, Communicating) covers dimensions of self-knowledge; its cards open with a lived scenario and are bound by the object-of-awareness rules and the Tuesday test. The **world** group (Philosophy, Art) covers bodies of knowledge outside you; its cards open with a description-without-naming and are bound by the recognition test.

## The branch principle

Branches exist for the reader, not the archive. A branch must be either (a) a distinction the reader understands instantly and might plausibly filter by, or (b) a closed, field-standard set that places the card in context after reveal. Editorial sorting conveniences get no branches. Consequence: the tree is flat almost everywhere, and the only third breadcrumb level in the product is the Plutchik emotion families, which are a closed scientific set (one-card families are fine there because the set is complete, not padded).

## The tree

| Category | Branch | Sub-branch | What lives there |
|---|---|---|---|
| Thinking | Mental Models | - | Deliberate thinking tools you apply (Inversion, First Principles, Occam's Razor) |
| | Cognitive Biases & Distortions | - | Systematic thinking errors that happen to you, from both the heuristics-and-biases tradition (Kahneman & Tversky) and the CBT tradition (Beck, Burns). The lab/clinic split is academic lineage, not something the reader experiences |
| | Mindsets | - | Beliefs about your own abilities (Growth Mindset, Learned Helplessness, Impostor Phenomenon; Dweck, Bandura, Seligman) |
| Feeling | Emotion Families | Joy, Sadness, Anger, Fear, Disgust, Surprise, Trust, Anticipation, Self-Conscious | Felt states. Plutchik's wheel for the family structure; Berkeley 27-emotion set as inclusion checklist; Self-Conscious added per Tracy & Robins / Tangney |
| | Emotional Skills | - | How feelings work and what you can do with them (Granularity, Affect Labeling, Reappraisal, Suppression, Mood vs. Emotion, Secondary Emotions; Barrett, Gross) |
| Relating | Reading People | - | What happens in your head about another person: empathy capacities and all the misreadings (Cognitive/Affective Empathy, Theory of Mind, Attribution Errors, Projection, Spotlight Effect) |
| | Social Forces | - | What pulls at you between people (Reciprocity, Social Proof, Bystander Effect, Emotional Contagion) |
| Communicating | Logical Fallacies | - | Broken arguments (Strawman, Ad Hominem, False Dilemma, Equivocation). Standard fallacy classes (relevance, presumption, ambiguity) are not used as sub-branches; they return only if the branch grows to justify them |
| | Persuasion | - | Techniques aimed at you, from classical rhetoric to influence research to interface design (Framing, Loaded Question, Scarcity, Dark Patterns) |
| | Constructive Communication | - | Skills for you (Steelmanning, Active Listening, I-Statements, NVC) |
| Philosophy | Ideas | - | Concepts, thought experiments, schools (Stoicism, Ship of Theseus, Existentialism) |
| | Philosophers | - | The people (Socrates, Kant, Beauvoir). Era sub-branches (Ancient, Medieval, Early Modern, Modern) may return when each holds at least three cards |
| Art | Movements | - | Movements and periods (Renaissance, Impressionism, Pop Art). "Art movement" is the field-standard organizing term; Renaissance and Baroque are strictly periods but are taught alongside movements everywhere |
| | Artists | - | The people (Rembrandt, Van Gogh, Kahlo). Era sub-branches (Old Masters, 19th Century, Modern) may return when each holds at least three cards |

Planned third Art branch: Artworks (image cards), see `artworks-proposal.md`.

## Categorization rules (self group)

Apply in order. Rule 1 decides most cases.

1. **Object of awareness.** When a user recognizes this concept in real life, what are they observing? Their own reasoning: Thinking. Their own emotional state: Feeling. Their perception of another person: Relating. An exchange of words: Communicating. Object of awareness beats academic origin: Mind Reading is a CBT cognitive distortion, but what the user observes is another person's supposed judgment of them, so it lives in Relating, not Thinking.
2. **Bias vs. fallacy.** Does it happen silently inside one head (bias, Thinking) or between people in language (fallacy, Communicating)? Confirmation bias needs no conversation. A strawman needs one.
3. **Socially triggered feelings stay in Feeling.** Envy, embarrassment, and jealousy are triggered by others but observed in yourself. Empathy goes to Relating because its object is the other person's state, not your own.
4. **Dual fits get one home.** Choose by the primary object of awareness, list the second reading under `related`. Example: Halo Effect is a judgment error (Thinking) about people (Relating); its primary object is your perception of a person, so Relating.
5. **The Tuesday test.** Every concept must support a 1-2 sentence scenario that could happen to a normal person on a normal Tuesday. Concepts that fail (Power Law Distribution, Pareto Principle as statistics) are out of scope regardless of fame. This test is the product boundary for the self group.

## Rules for world categories

1. **The recognition test** (replaces the Tuesday test here): at the reveal, a general reader should plausibly recognize the term, the person, or their work, even if they could not have named it. Stoicism, Socrates, Impressionism, and Van Gogh pass; supervenience and minor Mannerists fail. This is the product boundary for these categories.
2. **Persons: deceased and historically settled only.** No living figures, no active controversies. The portrait is built on work and thought; biography appears only as identifying fact, never as the hook. No ranking language ("greatest", "most important") anywhere.
3. **Origin is a guaranteed field.** It names the earliest documented formulation or the era the linked source gives. If the source offers no era, the entry is reframed toward the school or thinker who made the idea famous, or dropped.
4. **Opposed must be documented, not constructed** (rival school, rejected establishment, named counter-movement). Every card fills at least one of opposed / related; persons often have only related.

## Breadcrumb conventions

- 2 levels standard: `Category > Branch`. A third level exists only for closed field-standard sets, currently only the emotion families.
- Level 1 is always the category display name.
- On the card front, the breadcrumb shows at most 2 levels (category and branch), as a scoped hint for guessing. The full path appears after reveal.
- Breadcrumbs are category paths, not ontology claims. When science offers a structure we use it; otherwise the path is editorial.
