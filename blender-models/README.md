# Blender → Three.js

Both viewers load `public/models/Arai_Nimbus_S1_Concept.glb` using the shared URL
in `src/utils/nimbusModel.ts`. The root-level GLB/STL/backup are not served.

## Rebuild the web model

Run with Blender 5.x from the repository root (on macOS the executable is
`/Applications/Blender.app/Contents/MacOS/Blender`):

```sh
Blender --background --factory-startup --python-exit-code 1 --python blender-models/export_web.py
Blender --background --factory-startup --python-exit-code 1 --python blender-models/validate_web.py
bun run test:model
bun run lint
bun run build
```

- Input: `Arai Nimbus S1/Arai_Nimbus_S1_Chrome.blend` (preserved unchanged).
- Editable corrected output: `Arai Nimbus S1/Arai_Nimbus_S1_Web.blend`, opened
  at 112°, with live Boolean modifiers, drivers and the export/refinement source
  packed as Blender text blocks.
- Served output: `../public/models/Arai_Nimbus_S1_Concept.glb`, closed bind pose,
  millimeter coordinates, original dual-spindle hierarchy, no baked animations.

`export_apply=True` is required. Exporting the raw meshes leaves a solid deck
above all 74 keys and loses the touchpad, screen and connector cutouts. Only
product geometry and optional CAD annotations are selected; cutters and studio
objects are not exported. The viewers still normalize GLTFLoader node names.

`refine_open_lid.py` adds a continuous upper hinge barrel and rounds/extends the
central lower lid edge, using `image7.webp` as the visual reference. A rear
chassis channel provides clearance through the folding sweep. It also rotates
the **whole** Chromebook lockup (icon + text) around its center. The exterior
ARAI decal is rotated separately; its shared texture and lower-bezel logo are
not flipped.

Validation checks real exported geometry with Three.js raycasts: keyboard and
touchpad visibility, no daylight between the hinges, upright ARAI/Chromebook
artwork and fixed keys through all five fold modes. The Blender check samples
lid/spine/chassis intersections every 5° and at the five actual web poses.

Bump the shared model URL revision after replacing an export to avoid stale
browser caches. Do not patch the GLB binary or disable depth testing to expose
hidden parts.
