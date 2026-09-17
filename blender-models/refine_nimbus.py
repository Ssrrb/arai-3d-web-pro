"""Presentation refinement of the saved model; preserves all CAD geometry."""
import bpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'Arai Nimbus S1'
STAGE=OUT/'review'/'revision_01'
STAGE.mkdir(parents=True,exist_ok=True)
scene=bpy.context.scene
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-0.25
for lamp in bpy.data.lights:
    lamp.energy *= 0.4
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.20
scene.frame_set(41)
cam=bpy.data.objects['CAM 01 | open hero, left I-O']
scene.camera=cam
scene.render.resolution_x=1600; scene.render.resolution_y=1200
bpy.context.view_layer.update()
inv=cam.matrix_world.inverted(); points=[]; deps=bpy.context.evaluated_depsgraph_get()
for col in bpy.data.collections:
    if not col.name[:2] in ['01','02','03','04','05','06']: continue
    for obj in col.objects:
        if obj.type not in {'MESH','FONT','CURVE'} or obj.hide_render: continue
        ev=obj.evaluated_get(deps)
        points += [inv @ (ev.matrix_world @ Vector(p)) for p in ev.bound_box]
lo=[min(p[i] for p in points) for i in range(2)]
hi=[max(p[i] for p in points) for i in range(2)]
cam.data.ortho_scale=max(hi[0]-lo[0],(hi[1]-lo[1])*1600/1200)*1.15
cam.location += cam.rotation_euler.to_quaternion() @ Vector(((lo[0]+hi[0])/2,(lo[1]+hi[1])/2,0))
scene.cycles.samples=64
scene.render.filepath=str(STAGE/'01_Open_Hero.png')
bpy.ops.render.render(write_still=True)
text=bpy.data.texts.get('BUILD SOURCE | build_nimbus.py'); text.clear(); text.write((ROOT/'build_nimbus.py').read_text())
bpy.ops.wm.save_as_mainfile(filepath=str(STAGE/'Arai_Nimbus_S1_Concept.blend'))
print('REFINEMENT_PREVIEW_COMPLETE',flush=True)
