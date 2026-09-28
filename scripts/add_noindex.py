#!/usr/bin/env python3
"""Insert <meta name="robots" content="noindex, nofollow"> into every .html file.

Runs in CI on the copy being deployed; the source files are never modified.
Usage: add_noindex.py <dir>
"""
import re
import sys
from pathlib import Path

META = '<meta name="robots" content="noindex, nofollow">'
ROBOTS_TAG = re.compile(r'<meta[^>]*\bname\s*=\s*["\']?robots\b[^>]*>', re.I)
HEAD_OPEN = re.compile(r'<head(\s[^>]*)?>', re.I)
HTML_OPEN = re.compile(r'<html(\s[^>]*)?>', re.I)


def patch(text: str) -> str:
    if ROBOTS_TAG.search(text):
        return ROBOTS_TAG.sub(META, text, count=1)
    for pattern in (HEAD_OPEN, HTML_OPEN):
        m = pattern.search(text)
        if m:
            return text[: m.end()] + '\n' + META + text[m.end():]
    return META + '\n' + text


def main(root: str) -> None:
    n = 0
    for path in Path(root).rglob('*.htm*'):
        if path.suffix.lower() not in ('.html', '.htm'):
            continue
        text = path.read_text(encoding='utf-8', errors='surrogateescape')
        path.write_text(patch(text), encoding='utf-8', errors='surrogateescape')
        n += 1
    print(f'noindex added to {n} HTML file(s)')


if __name__ == '__main__':
    main(sys.argv[1])
