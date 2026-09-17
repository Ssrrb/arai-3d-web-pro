"""Check the editable web model's hinge sweep (does not modify the .blend).
Run: Blender --background --factory-startup --python validate_web.py
"""
from pathlib import Path

import bpy
from mathutils.bvhtree import BVHTree

path = Path(__file__).resolve().parent / 'Arai Nimbus S1' / 'Arai_Nimbus_S1_Web.blend'
bpy.ops.wm.open_mainfile(filepath=str(path))
scene = bpy.context.scene
objects = bpy.data.objects
control = objects['CONTROL | Lid opening angle (0–360 degrees)']
control.animation_data_clear()


def bvh(obj):
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    tree = BVHTree.FromPolygons(
        [evaluated.matrix_world @ v.co for v in mesh.vertices],
        [tuple(p.vertices) for p in mesh.polygons],
        epsilon=0.00001,
    )
    evaluated.to_mesh_clear()
    return tree


fixed = [next(o for o in objects if o.name.startswith(prefix)) for prefix in ['C-side |', 'D-side |']]
lid = [next(o for o in objects if o.name.startswith(prefix)) for prefix in ['A-side |', 'B-side | matte display bezel']]
spine = objects['Hinge | continuous center spine']
static = [(o, bvh(o)) for o in fixed]
collisions = []
def check_pose(pose):
    bpy.context.view_layer.update()
    moving = [(o, bvh(o)) for o in [*lid, spine]]
    for obj, tree in moving:
        for base, base_tree in static:
            if tree.overlap(base_tree):
                collisions.append((pose, obj.name, base.name))
    for obj, tree in moving[:2]:
        if tree.overlap(moving[2][1]):
            collisions.append((pose, obj.name, spine.name))


for angle in sorted(set(range(0, 361, 5)) | {112}):
    control['opening_degrees'] = angle
    control.update_tag()
    check_pose(angle)

# The web's stand/tent poses deliberately use both stages rather than the
# sequential Blender driver, so validate their actual spindle angles too.
import math
axis_a = objects['Hinge A | lower spindle, stage 2']
axis_b = objects['Hinge B | display spindle, stage 1']
for axis in [axis_a, axis_b]:
    axis.driver_remove('rotation_euler', 0)
for name, a, b in [('closed', 0, 0), ('laptop', 0, -112),
                   ('stand', -140, -145), ('tent', -120, -140),
                   ('tablet', -180, -180)]:
    axis_a.rotation_euler.x = math.radians(a)
    axis_b.rotation_euler.x = math.radians(b)
    check_pose(name)
assert not collisions, f'Hinge sweep intersections: {collisions}'
print('WEB_HINGE_OK: no lid/spine/chassis intersections through 0–360 degrees (5-degree samples + five web poses)', flush=True)
