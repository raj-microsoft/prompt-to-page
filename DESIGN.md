# Soft Orchard design system

## Shipped world
The source prompt pins warm off-white, charcoal, Outfit Bold, enormous background lettering and a volumetric pear. These deliberate choices override generic palette/font saturation warnings. The original identity is Soft Orchard, a fictional material study.

## Tokens
Ground #f4f3ed; ink #292b26; secondary #65685d; rules #d8d9cf; active #333a2c; focus #536e29. Outfit self-hosted under SIL OFL. Body 16px/1.65 in the documentation dialog; control labels 12–14px; display scales with viewport and uses -0.04em tracking. Main type is intentionally larger than the generic 6rem recommendation, as required by the source.

## Composition
One full-height playground with text behind the transparent WebGL canvas. Top brand bar, centered fruit controls, bottom floating toolbar, quiet lower-right description. Toolbar wraps at 700px; no permanent sidebar. Taps expose compact local editing controls. Provenance uses an accessible native dialog because it intentionally interrupts the full-screen interaction.

## Interaction and motion
Rest-shape spring deformation is user-triggered, never looping decorative animation. Empty-space drag orbits, pointer on geometry grabs locally, pinch zooms, cutting uses explicit mode and stroke. Stacking attaches centers and constrains layer-normal travel. Reduced motion starts paused; Resume opts in. Keyboard-operable control buttons and camera arrow keys. No confetti, fake progress or decorative badges.

## Assets
All fruit geometry, procedural canvas textures, shadows and preview geometry are original synthetic content. No stock imagery or generated photographs. No shipping raster files; review screenshots are development evidence only. Three.js MIT and Outfit OFL notices are in vendor/.

## Known simplifications
CPU rest-shape spring solver rather than a GPU volumetric solver; approximate shape/volume retention, not exact conservation. Extruded planar polygon cuts rather than arbitrary 3D tetrahedral cuts. Interior details are procedural textures. Six-piece limit. Split forces frontal orientation. The visible on-page How-this-was-made disclosure describes these substitutions.
