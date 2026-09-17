"""Native Blender refinements for the open-lid web deliverable.

The reference has a continuous dark hinge spine, not daylight between the two
hinges. Keep the 360-degree linkage: recess the chassis around the spine and
round the lid's lower edge concentrically around the upper spindle.
"""
import math

import bpy
from mathutils import Vector


def refine_open_lid():
    objects = bpy.data.objects
    a = objects['Hinge A | lower spindle, stage 2']
    b = objects['Hinge B | display spindle, stage 1']
    hinge_collection = a.users_collection[0]
    cutters = bpy.data.collections['98 | Parametric boolean tools — hidden']
    bezel = objects['B-side | matte display bezel']
    cover = next(o for o in objects if o.name.startswith('A-side |'))
    deck = next(o for o in objects if o.name.startswith('C-side |'))
    base = next(o for o in objects if o.name.startswith('D-side |'))

    def move(obj, collection):
        for col in list(obj.users_collection):
            col.objects.unlink(obj)
        collection.objects.link(obj)
        return obj

    def box(name, dimensions, location, parent=None):
        bpy.ops.mesh.primitive_cube_add(size=1)
        obj = bpy.context.object
        obj.name = name
        obj.dimensions = dimensions
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.parent = parent
        obj.location = location
        move(obj, cutters)
        return obj

    def boolean(target, tool, operation, name):
        tool.hide_render = True
        tool.hide_set(True)
        tool.display_type = 'WIRE'
        tool['purpose'] = 'Retained editable hinge clearance tool; do not export'
        mod = target.modifiers.new(name, 'BOOLEAN')
        mod.operation = operation
        mod.solver = 'EXACT'
        mod.object = tool
        # Preserve the original cuts, then evaluate these refinements BEFORE the
        # finishing bevel/weighted normals. Difference must follow lip union.
        index = next((i for i, m in enumerate(target.modifiers)
                      if m.type != 'BOOLEAN'), len(target.modifiers) - 1)
        target.modifiers.move(len(target.modifiers) - 1, index)

    spine_name = 'Hinge | continuous center spine'
    if spine_name not in objects:
        # Continuous upper barrel, with the same radius as the existing hinges.
        # Do NOT fill the space between both axes with a solid block: the lid's
        # lower lip needs that sweep volume when it passes 110–180 degrees.
        # The barrel follows stage A; stage B rotates concentrically around it.
        radius, half_width, link = 3.2, 103.0, 10.0
        profile = [(radius * math.cos(i * 2 * math.pi / 96),
                    link + radius * math.sin(i * 2 * math.pi / 96))
                   for i in range(96)]
        n = len(profile)
        verts = [(x, y, z) for x in [-half_width, half_width] for y, z in profile]
        faces = [tuple(reversed(range(n))), tuple(range(n, 2 * n))]
        faces += [(i, (i + 1) % n, (i + 1) % n + n, i + n) for i in range(n)]
        mesh = bpy.data.meshes.new(spine_name)
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        spine = bpy.data.objects.new(spine_name, mesh)
        hinge_collection.objects.link(spine)
        spine.parent = a
        mesh.materials.append(bezel.data.materials[0])
        for face in mesh.polygons:
            face.use_smooth = len(face.vertices) == 4
        spine['reference'] = 'image7.webp: continuous lower display / hinge junction'
        spine['radius_mm'] = radius

        # A narrow rear channel houses the spine without filling the existing
        # keyboard recess or colliding with the base during the second stage.
        channel = box('TOOL | continuous spine chassis channel',
                      (207.0, 9.0, 22.0), (0, a.location.y + 1.0, 8.0))
        for target in [base, deck]:
            boolean(target, channel, 'DIFFERENCE', 'Continuous spine rear clearance')

        # Extend only the central lower lid edge into the old 4 mm sweep gap.
        # Rounded spindle clearance replaces that rectangular missing strip.
        for target, z, height in [(cover, 2.8, 4.0), (bezel, 0.5, 1.0)]:
            lip = box('TOOL | ' + target.name[:6] + ' center lip union',
                      (206.0, 4.6, height), (0, -2.3, z), b)
            boolean(target, lip, 'UNION', 'Continuous center lid lip')
        bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=3.4, depth=208.0)
        clearance = bpy.context.object
        clearance.name = 'TOOL | center lip upper spindle clearance'
        clearance.parent = b
        clearance.location = (0, 0, 0)
        clearance.rotation_euler = (0, math.pi / 2, 0)
        move(clearance, cutters)
        for target in [cover, bezel]:
            boolean(target, clearance, 'DIFFERENCE', 'Rounded upper spindle clearance | 0.20 mm')

    # Rotate the complete Chromebook lockup, not just its text or the shared
    # hinge: preserve the Chrome symbol's placement to the left of the wordmark.
    lockup_name = 'Chromebook lockup | upright lid artwork'
    if lockup_name not in objects:
        wordmark = objects['Rear lid secondary mark']
        chrome = objects.get('Chrome logo | lid artwork control')
        parts = [wordmark] + ([chrome] if chrome else [])
        bpy.context.view_layer.update()
        inv = b.matrix_world.inverted()
        bounds = []
        for root in parts:
            for obj in [root, *root.children_recursive]:
                if obj.type in {'MESH', 'CURVE', 'FONT'}:
                    bounds += [inv @ obj.matrix_world @ Vector(p) for p in obj.bound_box]
        center = Vector(tuple((min(p[i] for p in bounds) + max(p[i] for p in bounds)) / 2 for i in range(3)))
        lockup = bpy.data.objects.new(lockup_name, None)
        wordmark.users_collection[0].objects.link(lockup)
        lockup.parent = b
        lockup.location = center
        bpy.context.view_layer.update()
        for obj in parts:
            world = obj.matrix_world.copy()
            obj.parent = lockup
            obj.matrix_world = world
        lockup.rotation_euler.z = math.pi
        lockup['orientation'] = 'Upright when viewed from behind the open lid'
    bpy.context.view_layer.update()
