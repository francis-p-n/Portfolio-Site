# Nav & dock icons

Hand-drawn SVGs dropped in this folder replace the emoji glyphs in the home
window's nav and in the dock. The filename must match the window id:

| file          | used by            |
| ------------- | ------------------ |
| `home.svg`    | dock only          |
| `about.svg`   | nav + dock         |
| `articles.svg`| nav + dock         |
| `projects.svg`| nav + dock         |
| `links.svg`   | nav + dock         |
| `faq.svg`     | nav + dock ("working with me") |
| `contact.svg` | nav + dock         |

Anything missing falls back to the emoji it shipped with, so a partial set is
fine — add them one at a time if you like.

## Source

Doodle Icons by Khushmeen Sidhu — https://khushmeen.com/icons.html

The author's own page states: *"Free icons for commercial and personal use
under CC0 license - no attribution required."* Note that Iconfinder mirrors the
same set under CC BY 4.0; the CC0 grant on the author's site is the one this
project relies on. Keep the license file from the download alongside these
icons if it ships with one.

## Preparing a file

- Strip any hardcoded `width`/`height`; keep the `viewBox`.
- Leave `stroke`/`fill` attributes in place — the stylesheet rewrites them to
  `currentColor` so the icons follow light/dark mode automatically.
- These are inlined into the page at runtime, so keep them small and free of
  `<script>`, external references, or ids that could collide across files.
