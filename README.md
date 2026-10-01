# presentations

Self-contained talks, published at `https://mavereecken.github.io/presentations/`.

## Adding a talk

1. Put the talk in `<year>/<Name>/` with an `index.html` at its root, e.g.
   `2026/Conference1/index.html` → `https://mavereecken.github.io/presentations/2026/Conference1/`.
2. `git add 2026/Conference1 && git commit -m "Add Conference1" && git push`.
3. The deploy takes about a minute (see the Actions tab).

Always share the URL **with** the trailing slash. Without it GitHub redirects,
which works, but relative paths are only correct after the redirect.

## Re-exporting a talk from the slides deck

A re-export overwrites `index.html`, including our fixes to its player (sound
recovery, loop watchdog). Re-apply them after every export:

    python3 scripts/patch_player.py 2026/gravigammanu/index.html

## Shared media

Clips used by several talks can go in `media/` and be referenced relatively,
e.g. `../../media/clip.mp4` from `2026/Conference1/index.html`.

## Visibility

- On deploy, CI adds `<meta name="robots" content="noindex, nofollow">` to every
  HTML page (`scripts/add_noindex.py`). The files in the repo are not changed.
- There is no index page at `/presentations/`, so talks are only reachable by
  direct link.
- This repo is **public**: unlisted means hard to find, not secret.

## Limits

GitHub rejects single files over 100 MB, and the published site should stay
under ~1 GB. Every committed version of a video stays in git history forever.
