# Color and mounted cover rendering · v9.3

The color recommendation still comes from `GardaColors.pick`. Cards, detail
images, alternative colors and retrieve diagrams share the same treatment.
The chroma mask detects muted olive and brown as well as blue and green.
Neutral steel and white strands remain outside the body recoloring mask;
the luminance ramp separates the colored back from the pale belly. Warm
orange details are retained. Original artwork is used directly when its
colors already match the recommendation.

`GardaRigArt.cover` composes the existing low-poly plastic image with separate
faceted weights, shaded hooks and line. All 24 compatible rig/plastic types
use their own assembled cover. It uses the same automatic setup as the
recommendation engine, including weighted wacky and protected jig hooks.
No rig choice is added to the main controls.

- Jig: attached head and exposed or protected hook.
- Drop shot: nose hook, vertical leader and terminal sinker below the plastic.
- Texas: bullet immediately before the offset hook.
- Carolina: bullet, bead, swivel, separate leader and offset hook.
- Ned: upright compact plastic on a flat mushroom head.
- Wacky: hook through the middle of the worm; split shot only when weighted.
- Weightless: offset hook without an added weight.

Creature bodies are reversed so the hook enters the tail. Cropped SVG viewports
normalize the transparent padding of the original raster images without
creating or downloading additional bitmap assets. The rig components are
schematic; their screen spacing and proportions do not indicate dimensions.

Validation: `node tests/artwork.mjs` checks all mounted profiles in three
visibility/depth scenarios, including their alternative palettes (744 covers).
`--preview` writes a local visual comparison page under `output/`.
