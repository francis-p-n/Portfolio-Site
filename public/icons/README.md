# Nav & dock icons

Hand-drawn SVGs dropped in this folder replace the emoji glyphs in the home
window's nav and in the dock. The filename must match the window id:

| file             | used by                        | source file in the pack        |
| ---------------- | ------------------------------ | ------------------------------ |
| `home.svg`       | dock only                      | `interface/home.svg`           |
| `about.svg`      | nav + dock                     | `interface/user.svg`           |
| `articles.svg`   | nav + dock                     | `interface/note.svg`           |
| `projects.svg`   | nav + dock                     | `objects/paint-brush.svg`      |
| `links.svg`      | nav + dock                     | `interface/paper-clip-2.svg`   |
| `faq.svg`        | nav + dock ("working with me") | `interface/question.svg`       |
| `contact.svg`    | nav + dock                     | `interface/mail.svg`           |
| `theme-dark.svg` | theme toggle, light mode       | `weather/night.svg`            |
| `theme-light.svg`| theme toggle, dark mode        | `weather/sunny.svg`            |
| `sfx-on.svg`     | sound toggle, unmuted          | `interface/volume-up.svg`      |
| `sfx-off.svg`    | sound toggle, muted            | `interface/mute.svg`           |

Anything missing falls back to the emoji it shipped with, so a partial set is
fine — add them one at a time if you like. To change which drawing a slot uses,
just overwrite the file; nothing in the code names the pack's own filenames.

## Source

Doodle Icons by Khushmeen Sidhu — https://khushmeen.com/icons.html

The files here are copies from that pack, with their internal clip-path ids
renamed per file. The runtime also suffixes every id on injection, so the same
icon can appear in both the nav and the dock without colliding.

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
