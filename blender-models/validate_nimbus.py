"""Independent quantitative checks on the saved Blender deliverable."""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'Arai Nimbus S1'
scene=bpy.context.scene
checks=[]
def check(name,ok,actual):
    checks.append({'check':name,'pass':bool(ok),'actual':actual})
def bounds(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    pts=[ev.matrix_world@Vector(p) for p in ev.bound_box]
    return [[min(p[i] for p in pts) for i in range(3)],[max(p[i] for p in pts) for i in range(3)]]
def find(prefix): return next(o for o in bpy.data.objects if o.name.startswith(prefix))
check('Metric / millimeters / scale 0.001',scene.unit_settings.system=='METRIC' and scene.unit_settings.length_unit=='MILLIMETERS' and abs(scene.unit_settings.scale_length-.001)<1e-9,[scene.unit_settings.system,scene.unit_settings.length_unit,scene.unit_settings.scale_length])
scene.frame_set(1)
base=find('D-side |'); deck=find('C-side |'); cover=find('A-side |')
bb=bounds(base); db=bounds(deck); cb=bounds(cover)
closed=[bb[1][0]-bb[0][0],bb[1][1]-bb[0][1],cb[1][2]-bb[0][2]]
check('Closed nominal envelope 326.5 x 229 x 18.8 mm',all(abs(a-b)<.015 for a,b in zip(closed,[326.5,229,18.8])),closed)
check('Base top 13.4 mm',abs(db[1][2]-13.4)<.015,db[1][2])
lcd=find('Display active area |'); w,h=lcd['active_dimensions_mm']
check('14-inch diagonal / 16:9 active panel',abs(math.hypot(w,h)-355.6)<1e-6 and abs(w/h-16/9)<1e-6,[w,h,math.hypot(w,h),w/h])
check('LCD Emission node exists',any(n.type=='EMISSION' for n in lcd.data.materials[0].node_tree.nodes),[n.type for n in lcd.data.materials[0].node_tree.nodes])
spec=json.loads((OUT/'model_specification.json').read_text())
types=[p['type'] for p in spec['ports']]
check('All seven requested I/O features represented',len([t for t in types if t.startswith('USB-C')])==2 and all(t in types for t in ['USB-A','MicroSD','Kensington','3.5 mm audio','Status LED']),types)
check('Live chassis port Boolean cutters',len([m for m in base.modifiers if m.type=='BOOLEAN'])>=8,[m.name for m in base.modifiers if m.type=='BOOLEAN'])
check('Bevel modifiers retained',all(any(m.type=='BEVEL' for m in o.modifiers) for o in [base,deck,cover]),[o.name for o in [base,deck,cover]])
for prefix,rough in [('MT11015 | #1A1A1A | IMR',.4),('MT11015 | #1A1A1A | micrograin',.65)]:
    mat=next(m for m in bpy.data.materials if m.name.startswith(prefix)); node=mat.node_tree.nodes.get('Principled BSDF')
    val=node.inputs['Roughness'].default_value
    target=((26/255+.055)/1.055)**2.4
    col=list(node.inputs['Base Color'].default_value)
    check(prefix+' roughness & linearized color',abs(val-rough)<1e-6 and all(abs(v-target)<1e-6 for v in col[:3]),{'roughness':val,'base_color_linear':col})
bottommat=base.data.materials[0]
check('Bottom micro-noise feeds Bump normal',any(n.type=='BUMP' for n in bottommat.node_tree.nodes) and any(n.type=='TEX_NOISE' for n in bottommat.node_tree.nodes),[n.type for n in bottommat.node_tree.nodes])
scene.frame_set(161); tablet=bounds(cover)
check('360-degree tablet cover clears base underside',tablet[1][2]<-.89,{'tablet_cover_max_z':tablet[1][2],'base_floor_z':bb[0][2],'rubber_feet_min_z':-.9})
check('Both hinge stages reach 180 degrees',all(abs(abs(bpy.data.objects[n].rotation_euler.x)-math.pi)<1e-5 for n in ['Hinge A | lower spindle, stage 2','Hinge B | display spindle, stage 1']),{n:list(bpy.data.objects[n].rotation_euler) for n in ['Hinge A | lower spindle, stage 2','Hinge B | display spindle, stage 1']})

# Sample lid/base surface intersections through the motion. This is a geometric
# interference check for the major mouldings, not a production hinge certification.
def bvh_world(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=ev.to_mesh()
    verts=[ev.matrix_world@v.co for v in mesh.vertices]
    faces=[list(p.vertices) for p in mesh.polygons]
    result=BVHTree.FromPolygons(verts,faces,all_triangles=False,epsilon=0.00001)
    ev.to_mesh_clear()
    return result
scene.frame_set(1)
static={'base':bvh_world(base),'deck':bvh_world(deck)}
control=bpy.data.objects['CONTROL | Lid opening angle (0–360 degrees)']
control.animation_data_clear()
collisions=[]
for angle in range(0,361,15):
    control['opening_degrees']=angle; control.update_tag(); bpy.context.view_layer.update()
    for lidpart in [cover,find('B-side | matte display bezel')]:
        moving=bvh_world(lidpart)
        for name,fixed in static.items():
            overlaps=moving.overlap(fixed)
            if overlaps: collisions.append({'angle':angle,'moving':lidpart.name,'fixed':name,'triangle_overlaps':len(overlaps)})
check('Major lid mouldings clear chassis in 25 sampled poses',not collisions,collisions or 'No surface intersections at 0,15,…,360 degrees')
control['opening_degrees']=0; control.update_tag(); bpy.context.view_layer.update()
packed=[i.name for i in bpy.data.images if i.packed_file]
check('Logo and all four source images packed',all(n in packed for n in ['arai-icon.png','image3.webp','image4.webp','image7.webp','image10.webp']),packed)
check('Spanish keyboard includes Ñ',any(o.type=='FONT' and o.data.body=='Ñ' for o in bpy.data.objects),len([o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith('Key |')]))
# Verify open topology of a side aperture by ray casting at a clear point offset
# from each tongue. The first intersection must be inside the shell, not the wall.
scene.frame_set(1); deps=bpy.context.evaluated_depsgraph_get(); ev=base.evaluated_get(deps)
for p in spec['ports']:
    sg=-1 if p['side']=='L' else 1
    z=p['z_mm'] + (p['panel_aperture_h_mm']*.26 if not 'audio' in p['type'] else 0)
    origin=Vector((sg*180,p['y_mm'],z)); direction=Vector((-sg,0,0))
    # Base is in local coordinates translated in Z.
    origin_local=ev.matrix_world.inverted()@origin
    hit,loc,normal,index=ev.ray_cast(origin_local,direction,distance=45)
    world=ev.matrix_world@loc if hit else None
    check('Through-wall aperture ray: '+p['side']+' '+p['type'],not hit or abs(world.x)<160.8,{'hit_shell_within_45mm':hit,'first_hit_world':list(world) if hit else None})
scene.frame_set(41)
result={'all_passed':all(c['pass'] for c in checks),'checks':checks,'object_count':len(bpy.data.objects),'blender_version':bpy.app.version_string,'blender_file':bpy.data.filepath}
(OUT/'validation.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
