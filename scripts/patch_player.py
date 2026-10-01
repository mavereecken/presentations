#!/usr/bin/env python3
"""Re-apply our fixes to the player script of a slides export.

A re-export from the slides deck overwrites index.html, so run this after
every export:  python3 scripts/patch_player.py 2026/gravigammanu/index.html

Fixes:
- sound: when the browser refuses to play an audio clip with sound, show a
  hint and unmute on the next click (instead of staying muted for good), and
  retry with sound on every visit to the slide.
- loop: some browsers occasionally fail to wrap a looping clip and leave it
  frozen on its last frame; a watchdog restarts it.

Idempotent: an already-patched file is left alone. Fails loudly if the export's
player code has changed so a patch no longer matches.
"""
import sys

MARK = '/* patched: sound + loop */'

PATCHES = [
    # sound hint style
    ("  #black { inset: 0; background: #000; display: none; z-index: 9; }\n",
     "  #black { inset: 0; background: #000; display: none; z-index: 9; }\n"
     "  #soundhint { left: 50%; bottom: 28px; transform: translateX(-50%); font-size: 20px; background: rgba(9,15,28,.9); padding: 10px 22px; border-radius: 10px; border: 1px solid #4FC3B5; display: none; cursor: pointer; }\n"),
    # sound hint element
    ('<div id="black" class="ui"></div>\n',
     '<div id="black" class="ui"></div>\n'
     '<div id="soundhint" class="ui">🔇 The browser blocked sound. Click to play with sound.</div>\n'),
    ("(function () {\n  const stage",
     f"(function () {{ {MARK}\n  const stage"),
    ("    v.loop = !img.hasAttribute('data-audio');\n",
     "    v.loop = !img.hasAttribute('data-audio');\n"
     "    if (img.hasAttribute('data-audio')) v.dataset.audio = '1';\n"),
    ("e.stopPropagation(); v.paused ? v.play() : v.pause(); });",
     "e.stopPropagation(); if (unmute()) return; v.paused ? v.play() : v.pause(); });"),
    ("      const go = () => v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });\n",
     "      if (v.dataset.audio) v.muted = false;  // retry with sound on every visit\n"
     "      // browser refused sound: play muted and offer a click to unmute\n"
     "      const go = () => v.play().then(soundHint, () => { v.muted = true; soundHint(); v.play().catch(() => {}); });\n"),
    ("  function stopVideos(i) {",
     "  // audio clips that the browser forced to play muted on the current slide\n"
     "  const mutedAudio = () => videosOf(cur).filter(v => v.dataset.audio && v.muted);\n"
     "  function soundHint() { document.getElementById('soundhint').style.display = mutedAudio().length ? 'block' : 'none'; }\n"
     "  // called from a click, which browsers accept as permission to play sound\n"
     "  function unmute() {\n"
     "    const vs = mutedAudio(); if (!vs.length) return false;\n"
     "    vs.forEach(v => { v.muted = false; v.play().catch(() => { v.muted = true; }).finally(soundHint); });\n"
     "    soundHint(); return true;\n"
     "  }\n"
     "  // loop watchdog: restart a looping clip that ended or froze on its last frame\n"
     "  setInterval(() => videosOf(cur).forEach(v => {\n"
     "    if (!v.loop || !v.duration) return;\n"
     "    const atEnd = v.currentTime >= v.duration - 0.3;\n"
     "    if (v.ended || (atEnd && !v.paused && v.currentTime === v._last)) { v.currentTime = 0; v.play().catch(() => {}); }\n"
     "    v._last = v.currentTime;\n"
     "  }), 1000);\n"
     "  function stopVideos(i) {"),
    ("    cur = i; startVideos(i);\n",
     "    cur = i; startVideos(i); soundHint();\n"),
    ("if (e.target.closest('a,video:not([data-gif])')) return; next(); });\n",
     "if (e.target.closest('a,video:not([data-gif])')) return; if (!unmute()) next(); });\n"
     "  document.getElementById('soundhint').addEventListener('click', unmute);\n"),
]


def main(path):
    html = open(path, encoding='utf-8').read()
    if MARK in html:
        print(f'{path}: already patched')
        return
    for old, new in PATCHES:
        if html.count(old) != 1:
            sys.exit(f'{path}: patch anchor not found exactly once:\n{old}')
        html = html.replace(old, new)
    open(path, 'w', encoding='utf-8').write(html)
    print(f'{path}: patched')


if __name__ == '__main__':
    for p in sys.argv[1:] or sys.exit(__doc__):
        main(p)
