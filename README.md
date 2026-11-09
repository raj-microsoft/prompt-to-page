# Soft Orchard

An original fictional 3D jelly-fruit playground, built from Marina Budarina's freely accessible **Jelly Study** Vibe-code prompt in her [Curated Prompt Collection](https://budarina.design/prompts). No signup or paid tool was used; the collection is not redistributed.

## Run
Serve this directory with any static HTTP server (`python -m http.server 8115`). Runtime dependencies are vendored locally. No build step and no API keys.

## Play
Pull a fruit to stretch; release to settle. Tap a fruit to recolor, duplicate or remove. Drag empty space to orbit, wheel/pinch to zoom. Split uses a full stroke in Front view. Stack attaches pieces to a skewer. Six-piece limit; Reset starts over. Reduced motion starts paused.

## Method and honest scope
Followed the source's sequence: visual foundation and camera; elastic grabbing; fruit creation and context editing; closed-geometry splitting; skewer attachment; camera/touch refinement; stability/readability checks. Three.js WebGL rendering with a custom CPU rest-shape spring approximation substitutes for a GPU volumetric solver. Volume retention is approximate. Cuts rebuild closed extruded polygons rather than arbitrary tetrahedral volumes. Rind and interior details use original procedural materials/textures. This is expressive physics, not a scientific model.

Full attribution and limitations are visible in the site's How-this-was-made dialog. Outfit font is SIL OFL; Three.js is MIT (licenses in vendor/). All fruit and fallback geometry is original synthetic content.

## Verification
`npm ci` then `node verify.cjs` uses installed Microsoft Edge through Playwright. Tests cover local deformation/settling, tap/recolor/duplicate/remove, split into independent meshes, stack/unstack, limits/empty state, tuning, view presets, pause/resume, 390px overflow, provenance dialog and reduced-motion behavior. Set TEST_URL to verify a deployment. Screenshots/reports are local development evidence and not committed.

Impeccable detector: readability warnings fixed; only cream-palette taste warning remains, intentionally retained because the source explicitly prescribes warm off-white. DESIGN.md records the exception.
