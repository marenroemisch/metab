# Metab

Learn how your mind works, one new tab at a time.

Metab replaces your browser's new tab page with one small card: a mental model, a cognitive bias or fallacy, an emotion, or a rhetorical technique. Cards open with a real-life situation first. You guess what is going on, then reveal the concept.

## Categories

Four dimensions of self-knowledge (see `TAXONOMY.md` for the full tree and categorization rules):

- **Thinking** - mental models about your own cognition, biases, distortions, mindsets
- **Feeling** - emotions and how they work
- **Relating** - how you read and misread other people
- **Communicating** - fallacies, rhetoric, and constructive techniques

## Install (unpacked, for development)

1. Download or clone this repository.
2. Open `chrome://extensions` (Chrome) or `brave://extensions` (Brave).
3. Enable **Developer mode** (toggle, top right).
4. Click **Load unpacked** and select this folder.
5. Open a new tab.

After editing files, click the reload icon on the extension card and open a new tab to see changes.

## Project structure

```
manifest.json        Extension manifest (Manifest V3)
newtab.html          The new tab page
newtab.css           Styles (light and dark mode)
newtab.js            Display logic
data/concepts.json   The content library
icons/               Extension icons
```

## Contributing

The content library lives in `data/concepts.json`. One object per concept:

| Field | Required | Description |
|---|---|---|
| `id` | yes | kebab-case, unique |
| `term` | yes | Display name |
| `category` | yes | `thinking`, `feeling`, `relating`, or `communicating` |
| `breadcrumb` | yes | Category path per `TAXONOMY.md`, broad to specific, 2-3 levels |
| `definition` | yes | 1-3 sentences, plain language |
| `scenario` | no | 1-2 sentence real-life situation shown before the reveal |
| `confusedWith` | no | `{ id, note }` for a commonly confused concept |
| `tryToday` | no | One small application prompt |
| `links` | no | `[{ label, url }]`, prefer stable sources like Wikipedia |
| `related` | no | Array of concept ids |

Contributions welcome via pull request. Definitions must be accurate and links must resolve.

## Status

Early skeleton. Planned: settings (category filter, daily mode), seen-tracking with spaced resurfacing, browsable category tree, library search.

## License

MIT
