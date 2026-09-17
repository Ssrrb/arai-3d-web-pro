"""Export the evaluated Blender model used by BOTH Three.js viewers.

Run from any directory:
  Blender --background --factory-startup --python /path/to/export_web.py

Keeps the original Chrome .blend unchanged. Saves an editable Web .blend with
live modifiers, then bakes those modifiers only in public/models/*.glb.
Geometry remains in millimeters; the viewers apply their existing 0.001 scale.
"""
import math
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'Arai Nimbus S1'
SOURCE = OUT / 'Arai_Nimbus_S1_Chrome.blend'
BLEND = OUT / 'Arai_Nimbus_S1_Web.blend'
GLB = ROOT.parent / 'public' / 'models' / 'Arai_Nimbus_S1_Concept.glb'

bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene
sys.path.insert(0, str(ROOT))
from refine_open_lid import refine_open_lid
refine_open_lid()

# Absolute assignment makes re-exporting idempotent. Blender Z is the decal's
# normal (glTF Y); rotating around X would flip it into/through the lid.
logo = bpy.data.objects['Arai logo | rear cover | supplied artwork']
logo.rotation_euler.z = math.pi
assert bpy.data.objects['Arai logo | lower bezel | supplied artwork'].rotation_euler.z == 0

# Preserve the editable model and open it in the same laptop pose as the web tour.
scene.frame_set(41)
scene.camera = bpy.data.objects['CAM 01 | open hero, left I-O']
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            view = area.spaces.active.region_3d
            view.view_rotation = scene.camera.rotation_euler.to_quaternion()
            view.view_location = (0, 0, 85)
            view.view_distance = 550
            view.view_perspective = 'CAMERA'
for filename in ['export_web.py', 'refine_open_lid.py']:
    text = bpy.data.texts.get('WEB SOURCE | ' + filename) or bpy.data.texts.new('WEB SOURCE | ' + filename)
    text.clear()
    text.write((ROOT / filename).read_text())
bpy.ops.object.select_all(action='DESELECT')
deck = next(o for o in bpy.data.objects if o.name.startswith('C-side |'))
deck.select_set(True)
bpy.context.view_layer.objects.active = deck
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))

# Export the closed bind pose, retaining BOTH spindle nodes and their hierarchy.
# Three.js owns the articulation, so no baked animation should fight its hinges.
scene.frame_set(1)
bpy.ops.object.select_all(action='DESELECT')
for collection in bpy.data.collections:
    # Keep optional CAD annotations for the inspector's toggle, but never export
    # boolean cutters, references, studio lights, cameras, or the studio floor.
    if collection.name[:2] not in {'01', '02', '03', '04', '05', '06', '80'}:
        continue
    collection.hide_viewport = False
    for obj in collection.objects:
        if obj.name.startswith('CONTROL'):
            continue
        obj.hide_set(False)
        obj.select_set(True)
bpy.context.view_layer.update()

GLB.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=str(GLB),
    export_format='GLB',
    use_selection=True,
    # Essential: without this the solid uncut deck hides keys AND their legends.
    # It also preserves the touchpad recess, I/O apertures and screen opening.
    export_apply=True,
    export_animations=False,
    export_current_frame=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
)
print('WEB_MODEL_EXPORTED', str(GLB), flush=True)
