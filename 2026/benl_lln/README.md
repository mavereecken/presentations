# LIGO-Virgo-KAGRA O4 highlights — standalone slides

Matthias Vereecken · Belgian-Dutch Gravitational Wave Meeting · UCLouvain · 7–9 Oct 2026

A static site: no build step and no server code, and nothing loads from the internet (fonts are bundled).

## Unpacking
The site comes as two zips (part 1 and part 2). Unzip both into the same place; together they make one `lvk-o4-highlights/` folder.

## Hosting
Upload the whole folder to any static host (GitHub Pages, Netlify, a university web space, S3…) and open `index.html`.
To preview locally, run `python3 -m http.server` in this folder and go to http://localhost:8000.
(Opening `index.html` straight from disk also works in most browsers.)

## Controls
| Key | Action |
|---|---|
| → ↓ Space PgDn / click right side / swipe left | next slide |
| ← ↑ PgUp / click left third / swipe right | previous slide |
| Home / End | first / last slide |
| number + Enter | jump to slide |
| G or Esc | overview of all slides (by section) |
| N | speaker notes |
| F | full screen |

Each slide has its own URL (`index.html#12`), so you can link straight to a slide.
Videos play with their sound and loop while their slide is shown; click one to pause it. Browsers only allow sound after you have pressed a key or clicked once, so if you open a link straight to a video slide, the clip starts muted and its sound comes on at your first key press or click.
Printing from the browser (Save as PDF) gives one slide per page.

## Files
- `index.html`: all 59 slides
- `deck.css`, `deck.js`: the viewer
- `assets/`: images and videos (four animated GIFs were converted to looping MP4s to save space)
- `fonts/`: IBM Plex Sans and Space Grotesk (SIL Open Font License)
