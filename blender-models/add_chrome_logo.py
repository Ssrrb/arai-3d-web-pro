"""Add the supplied Chrome SVG beside the existing lid wordmark.

Run with Blender --background --factory-startup --python add_chrome_logo.py.
The requested .blend1 remains unchanged; the result is a separate .blend.
"""
import bpy
import json
import math
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector, Matrix
from io_curve_svg import import_svg

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'Arai Nimbus S1'
SVG = ROOT / 'Google_Chrome_icon_(February_2022).svg'
DEST = OUT / 'Arai_Nimbus_S1_Chrome.blend'
bpy.ops.wm.open_mainfile(filepath=str(OUT / 'Arai_Nimbus_S1_Concept.blend1'))
scene = bpy.context.scene
wordmark = bpy.data.objects['Rear lid secondary mark']
lid_collection = wordmark.users_collection[0]
original_names = set(bpy.data.objects.keys())
original_frame = scene.frame_current
original_camera = scene.camera
original_render_path = scene.render.filepath
original_resolution = (scene.render.resolution_x, scene.render.resolution_y)
original_samples = scene.cycles.samples

def enum_value(owner, prop, value):
    available = [item.identifier for item in owner.bl_rna.properties[prop].enum_items]
    assert value in available, (prop, value, available)
    setattr(owner, prop, value)

def rgba(color):
    color = color.lstrip('#')
    if len(color) == 3:
        color = ''.join(c * 2 for c in color)
    values = [int(color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values) + (1.0,)

# Import the source paths unchanged. Blender's SVG importer does not support
# gradient fills, so reconstruct those fills as native shader nodes below.
ET.register_namespace('', 'http://www.w3.org/2000/svg')
xml = ET.parse(SVG)
root = xml.getroot()
ns = {'s': 'http://www.w3.org/2000/svg'}
gradients = {g.attrib['id']: g for g in root.findall('.//s:linearGradient', ns)}
parts = []
labels = iter(['White ring', 'Red', 'Blue center', 'Yellow', 'Green'])
for element in list(root):
    tag = element.tag.split('}')[-1]
    if tag == 'defs':
        continue
    style = dict(s.split(':', 1) for s in element.attrib.get('style', '').split(';') if ':' in s)
    fill = style.get('fill', element.attrib.get('fill'))
    if fill == 'none':
        root.remove(element)
        continue
    label = next(labels)
    name = 'Chrome logo | ' + label
    gradient = gradients[fill[5:-1]] if fill.startswith('url(#') else None
    color = gradient.find('s:stop', ns).attrib['stop-color'] if gradient is not None else fill
    element.set('id', name)
    element.set('style', 'fill:' + color)
    parts.append((name, fill, gradient))

with tempfile.TemporaryDirectory(prefix='arai_chrome_') as temp_dir:
    import_path = Path(temp_dir) / 'Chrome_import.svg'
    xml.write(import_path, encoding='unicode')
    import_svg.load_svg(bpy.context, str(import_path), True)

bpy.context.view_layer.update()
objects = [bpy.data.objects[name] for name, _, _ in parts]
all_points = [o.matrix_world @ Vector(p) for o in objects for p in o.bound_box]
lo = Vector(tuple(min(p[i] for p in all_points) for i in range(3)))
hi = Vector(tuple(max(p[i] for p in all_points) for i in range(3)))
center = (lo + hi) / 2
svg_width = hi.x - lo.x
normalization = Matrix.Scale(48 / svg_width, 4) @ Matrix.Translation(-center)

# The reference icon is 27 px across against a 105 px wordmark, with 7 px gap.
# Match that relationship to the existing text, preserving its placement.
text_points = [wordmark.matrix_basis @ Vector(p) for p in wordmark.bound_box]
text_left = min(p.x for p in text_points)
text_right = max(p.x for p in text_points)
text_center_y = (min(p.y for p in text_points) + max(p.y for p in text_points)) / 2
text_width = text_right - text_left
diameter = text_width * 27 / 105
gap = text_width * 7 / 105
logo_center = Vector((text_left - gap - diameter / 2, text_center_y, wordmark.location.z))

root_obj = bpy.data.objects.new('Chrome logo | lid artwork control', None)
lid_collection.objects.link(root_obj)
root_obj.parent = wordmark.parent
root_obj.location = logo_center
root_obj.scale = (diameter / 48,) * 3
root_obj.empty_display_size = 3
root_obj['source_svg'] = SVG.name
root_obj['diameter_mm'] = diameter
root_obj['gap_to_wordmark_mm'] = gap
root_obj['reference'] = 'STRATUS - CHROMEBOOK 12_ CONVERTIBLE/image3.webp'
root_obj['placement'] = 'Left of existing chromebook text; shared lid hinge parent'

def make_material(label, fill, gradient):
    material = bpy.data.materials.new('Chrome SVG | ' + label)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    shader = next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Roughness'].default_value = .45
    shader.inputs['Metallic'].default_value = 0
    if gradient is None:
        color = rgba(fill)
        shader.inputs['Base Color'].default_value = color
        material.diffuse_color = color
        return material
    stops = gradient.findall('s:stop', ns)
    material.diffuse_color = rgba(stops[-1].attrib['stop-color'])
    # Imported curve coordinates are normalized to [-24,24], with +Y up.
    # Express the original SVG gradient parameter as dot(objectXY, d) + b.
    start = Vector((float(gradient.attrib['x1']) - 24, 24 - float(gradient.attrib['y1']), 0))
    end = Vector((float(gradient.attrib['x2']) - 24, 24 - float(gradient.attrib['y2']), 0))
    direction = (end - start) / (end - start).length_squared
    tex = nodes.new('ShaderNodeTexCoord')
    dot = nodes.new('ShaderNodeVectorMath')
    enum_value(dot, 'operation', 'DOT_PRODUCT')
    dot.inputs[1].default_value = direction
    offset = nodes.new('ShaderNodeMath')
    enum_value(offset, 'operation', 'ADD')
    offset.inputs[1].default_value = -start.dot(direction)
    ramp = nodes.new('ShaderNodeValToRGB')
    enum_value(ramp.color_ramp, 'interpolation', 'LINEAR')
    for item, stop in zip(ramp.color_ramp.elements, stops):
        item.position = float(stop.attrib['offset'])
        item.color = rgba(stop.attrib['stop-color'])
    links = material.node_tree.links
    links.new(tex.outputs['Object'], dot.inputs[0])
    links.new(dot.outputs['Value'], offset.inputs[0])
    links.new(offset.outputs[0], ramp.inputs[0])
    links.new(ramp.outputs['Color'], shader.inputs['Base Color'])
    tex.location = (-700, 0)
    dot.location = (-480, 0)
    offset.location = (-270, 0)
    ramp.location = (-90, 160)
    shader.location = (190, 100)
    return material

import_collections = set()
for index, (name, fill, gradient) in enumerate(parts):
    obj = bpy.data.objects[name]
    obj.data.transform(normalization @ obj.matrix_world)
    obj.matrix_world = Matrix.Identity(4)
    for col in list(obj.users_collection):
        import_collections.add(col)
        col.objects.unlink(obj)
    lid_collection.objects.link(obj)
    obj.parent = root_obj
    obj.location = (0, 0, index * .004 / (diameter / 48))
    obj.data.resolution_u = 32
    obj.data.render_resolution_u = 48
    obj.data.materials.clear()
    obj.data.materials.append(make_material(name.split(' | ')[-1], fill, gradient))
    obj['source_svg'] = SVG.name
for col in import_collections:
    if not col.objects and not col.children:
        bpy.data.collections.remove(col)

source_text = bpy.data.texts.new('SOURCE | Google Chrome icon February 2022.svg')
source_text.write(SVG.read_text())
bpy.context.view_layer.update()
assert wordmark.data.body == 'chromebook'
assert set(original_names).issubset(bpy.data.objects.keys())
assert len(bpy.data.objects) == len(original_names) + 6

# Verify the artwork remains exactly attached through all five hinge poses.
for frame in (1, 41, 81, 121, 161):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    expected = wordmark.parent.matrix_world @ logo_center
    assert (root_obj.matrix_world.translation - expected).length < .0001
scene.frame_set(original_frame)

# Open the finished model with the closed lid visible for easy inspection.
scene.frame_set(1)
scene.camera = bpy.data.objects['CAM 05 | top orthographic']
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'VIEW_3D':
            space = area.spaces.active
            space.region_3d.view_rotation = scene.camera.rotation_euler.to_quaternion()
            space.region_3d.view_location = (0, 0, 18.8)
            space.region_3d.view_distance = 390
            enum_value(space.region_3d, 'view_perspective', 'ORTHO')
            space.overlay.show_overlays = False

# Save the reusable model before rendering temporary review cameras.
bpy.ops.wm.save_as_mainfile(filepath=str(DEST))
print('SAVED_CHROME_MODEL', str(DEST), flush=True)

scene.frame_set(1)
bpy.context.view_layer.update()
studio = bpy.data.collections['90 | Studio and cameras']
camera_data = bpy.data.cameras.new('Chrome placement verification')
enum_value(camera_data, 'type', 'ORTHO')
camera_data.clip_end = 20000
camera_obj = bpy.data.objects.new('Chrome placement verification', camera_data)
studio.objects.link(camera_obj)
scene.camera = camera_obj
scene.render.resolution_x = 1500
scene.render.resolution_y = 1000
scene.cycles.samples = 32
scene.cycles.use_denoising = True
enum_value(scene.render.image_settings, 'file_format', 'PNG')
enum_value(scene.cycles, 'device', 'CPU')

def render_top(name, center_local, scale):
    center_world = wordmark.parent.matrix_world @ Vector(center_local)
    camera_obj.location = center_world + Vector((0, 0, 700))
    camera_obj.rotation_euler = (0, 0, 0)
    camera_data.ortho_scale = scale
    scene.render.filepath = str(OUT / name)
    bpy.ops.render.render(write_still=True)
    print('RENDERED', scene.render.filepath, flush=True)

render_top('Chrome_logo_detail.png', ((logo_center.x - diameter / 2 + text_right) / 2, text_center_y, 4.85), 39)
render_top('Chrome_logo_cover.png', (0, -114.8, 4.85), 360)
print('CHROME_VALIDATION', json.dumps({'source': 'Arai_Nimbus_S1_Concept.blend1', 'output': DEST.name, 'editable_curves': 5, 'diameter_mm': diameter, 'gap_mm': gap, 'parent': root_obj.parent.name, 'hinge_poses_verified': 5, 'original_objects_preserved': len(original_names)}), flush=True)
