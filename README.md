# Osama Nabil — Portfolio

Static portfolio site (HTML/CSS/JS, no build step), English + Arabic (RTL).

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Design chooser (temporary, until one design is picked) |
| `design-1/` | Executive Dark — ink + mint, serif display, mirrors ahmedabouseif.com structure |
| `design-2/` | Paper Index — paper + vermilion, oversized grotesk, hover-preview index, masonry wall |
| `design-3/` | Bold Bento — violet + lime, bento hero, category rails, accordion |
| `assets/js/data.js` | All projects: titles/descriptions (EN/AR), categories, country, image list `[file, w, h]` |
| `assets/js/core.js` | Shared: profile (name, email), all UI strings EN/AR, language toggle, lightbox, reveal |
| `assets/css/lightbox.css` | Shared lightbox styles (each design tints it via `--lb-*` variables) |
| `assets/work/<slug>/NN.webp` | Project images; `01.webp` is the cover |
| `assets/img/` | Portrait, favicon, chooser previews |

## Content source

All project images come from the Google Drive folder "Work" (owner: osamanabil419700@gmail.com),
resized to max 1400px WebP. Excluded on purpose: blank pages, PDF duplicates, and the Liwa 2025
event photographs of people (only the designed collateral is shown).

## Editing

- Text / translations: `assets/js/core.js` → `strings.en` / `strings.ar`.
- Contact email: `assets/js/core.js` → `profile.email`.
- Add a project: put images in `assets/work/<slug>/` (cover = `01.webp`) and add an entry in `assets/js/data.js`.
- `?lang=ar` forces Arabic; the choice is remembered per browser.

## Picking the final design

1. Copy `design-N/index.html`, `style.css`, `app.js` to the repo root.
2. In the copied `index.html`: change `data-base="../"` to `data-base=""` and replace `../assets/` with `assets/`.
3. Delete `design-1/`, `design-2/`, `design-3/` and `assets/img/previews/`.

## Deploy (GitHub Pages)

1. Merge into `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. The `Deploy to GitHub Pages` workflow publishes on every push to `main`
   (site URL: `https://<owner>.github.io/<repo>/`).
