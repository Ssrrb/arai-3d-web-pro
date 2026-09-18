"""Rebuild the Arai Nimbus S1 convertible concept in Blender 5.x.

Run: Blender --background --factory-startup --python build_nimbus.py
Geometry is authored in millimeters; no external Python packages required.
"""
import bpy
import math
import json
import os
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'Arai Nimbus S1'
OUT.mkdir(exist_ok=True)
REF = ROOT / 'STRATUS - CHROMEBOOK 12_ CONVERTIBLE'
W, D, BASE_H, LID_T, GAP = 326.5, 229.0, 13.4, 4.8, 0.6
SCREEN_W = 14 * 25.4 * 16 / math.sqrt(16**2 + 9**2)
SCREEN_H = SCREEN_W * 9 / 16
PIVOT_Y, PIVOT_Z, LINK = 111.1, 4.0, 10.0
LID_D = 221.6
LID_CENTER_Y = -114.8  # local Y span -225.6 to -4.0; rear hinge sweep clearance
SCREEN_TOP = -212.0
SCREEN_Y = SCREEN_TOP + SCREEN_H/2

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.collections):
    if block.name != 'Collection':
        bpy.data.collections.remove(block)
scene = bpy.context.scene
scene.name = 'Nimbus S1 | Product & articulated CAD'
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.unit_settings.system_rotation = 'DEGREES'
scene['design_status'] = 'DIMENSIONAL CONCEPT — NOT OEM / NOT TOOLING RELEASE'
scene['dimension_basis'] = 'Nimbus S1 envelope; Stratus reference styling; proposed convertible adaptation'
scene['closed_envelope_mm'] = [W, D, 18.8]
scene['closed_height_excludes'] = '0.9 mm compliant rubber feet'
scene['display_diagonal_in'] = 14.0
scene['display_active_mm'] = [SCREEN_W, SCREEN_H]
scene['display_resolution'] = '1920 x 1080; 16:9'

def collection(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

BASE = collection('01 | Base shell and IMR deck')
INPUT = collection('02 | Spanish keyboard and touchpad')
PORT = collection('03 | I-O apertures and connectors')
HINGE = collection('04 | Dual-axis 360 degree hinge')
LID = collection('05 | Lid, matte bezel and 14 inch display')
DETAIL = collection('06 | Underside, feet and hardware')
DIM = collection('80 | Dimensions — toggle for CAD inspection')
STUDIO = collection('90 | Studio and cameras')
CUT = collection('98 | Parametric boolean tools — hidden')
REFERENCE = collection('99 | Packed source references — hidden')

def move(obj, col):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    col.objects.link(obj)
    return obj

def srgb(v):
    return v / 12.92 if v <= 0.04045 else ((v + 0.055)/1.055)**2.4

def rgba(h):
    h = h.lstrip('#')
    return tuple(srgb(int(h[i:i+2], 16)/255) for i in (0,2,4)) + (1,)

def material(name, color, roughness=0.5, metallic=0, coat=0, sheen=0, noise=False):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgba(color)
    m.use_nodes = True
    n = m.node_tree.nodes
    bs = n.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = rgba(color)
    bs.inputs['Roughness'].default_value = roughness
    bs.inputs['Metallic'].default_value = metallic
    bs.inputs['Coat Weight'].default_value = coat
    bs.inputs['Coat Roughness'].default_value = 0.28
    bs.inputs['Sheen Weight'].default_value = sheen
    bs.inputs['Sheen Roughness'].default_value = 0.4
    m['base_color_srgb'] = color
    if noise:
        geo = n.new('ShaderNodeNewGeometry'); geo.location=(-640,-140)
        tex = n.new('ShaderNodeTexNoise'); tex.location=(-430,-140)
        tex.inputs['Scale'].default_value = 9
        tex.inputs['Detail'].default_value = 2
        tex.inputs['Roughness'].default_value = 0.65
        bump = n.new('ShaderNodeBump'); bump.location=(-190,-120)
        bump.inputs['Strength'].default_value = 0.17
        bump.inputs['Distance'].default_value = 0.012
        m.node_tree.links.new(geo.outputs['Position'], tex.inputs['Vector'])
        m.node_tree.links.new(tex.outputs['Fac'], bump.inputs['Height'])
        m.node_tree.links.new(bump.outputs['Normal'], bs.inputs['Normal'])
        m['grain_pitch_mm_approx'] = 0.11
        m['micro_bump_distance_mm'] = 0.012
    return m

imr = material('MT11015 | #1A1A1A | IMR top cover & deck | R0.40', '#1A1A1A', 0.4, coat=0.20, sheen=0.12)
bottom = material('MT11015 | #1A1A1A | micrograin bottom | R0.65', '#1A1A1A', 0.65, noise=True)
bezel = material('MT11015 | #1A1A1A | dark matte bezel', '#1A1A1A', 0.65, noise=True)
rubber = material('Soft black | elastomer and seam', '#101214', 0.78)
keymat = material('Low profile keycaps | charcoal', '#212326', 0.48)
legend = material('Key legends | warm white', '#D1D5DA', 0.55)
metal = material('Connector stainless steel | satin', '#777E87', 0.28, metallic=0.85)
gold = material('Connector contact gold', '#CCAB65', 0.25, metallic=0.85)
blue = material('USB-A 3.1 insulator | deep blue', '#1A477E', 0.47)
glass = material('Webcam optical glass', '#142332', 0.13, metallic=0.25, coat=0.5)
dim_mat = material('CAD dimension ink', '#228ACC', 0.7)

def finish(o, mat, col, bevel=0):
    move(o,col)
    if mat: o.data.materials.append(mat)
    if bevel:
        b=o.modifiers.new('Edge radius | %.2f mm' % bevel,'BEVEL')
        b.width=bevel; b.segments=3
    if o.type == 'MESH':
        for p in o.data.polygons: p.use_smooth = len(p.vertices) == 4
        n=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
        n.keep_sharp=True; n.weight=30
    return o

def contour(w,h,r,n=12):
    r=min(r,w/2,h/2)
    points=[]
    for x,y,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for i in range(n+1):
            a=math.radians(start+i*90/n)
            points.append((x+r*math.cos(a),y+r*math.sin(a)))
    return points

def rr(name,w,h,d,loc,r,mat,col,bevel=0,plane='XY',ring=None):
    """Rounded prism, or an actual hollow ring, with exact nominal extents."""
    outer=contour(w,h,r)
    loops=[outer]
    if ring:
        iw,ih,ir=ring
        loops.append(contour(iw,ih,ir))
    def xyz(u,v,t):
        return (u,v,t) if plane=='XY' else (t,u,v)
    verts=[]
    for pts in loops:
        for t in (-d/2,d/2): verts.extend(xyz(u,v,t) for u,v in pts)
    n=len(outer); faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.append((i,j,n+j,n+i))
    if ring:
        for i in range(n):
            j=(i+1)%n
            faces += [(2*n+j,2*n+i,3*n+i,3*n+j), (j,i,2*n+i,2*n+j), (n+i,n+j,3*n+j,3*n+i)]
    else:
        faces.extend([tuple(reversed(range(n))),tuple(range(n,2*n))])
    mesh=bpy.data.meshes.new(name+' mesh'); mesh.from_pydata(verts,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); col.objects.link(o); o.location=loc
    return finish(o,mat,col,bevel)

def cylinder(name,r,d,loc,mat,col,axis='Z',verts=48,bevel=0.08):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=d, location=loc)
    o=bpy.context.object; o.name=name
    if axis=='X': o.rotation_euler[1]=math.pi/2
    if axis=='Y': o.rotation_euler[0]=math.pi/2
    return finish(o,mat,col,bevel)

def cut(target,cutter,name):
    for mod in list(cutter.modifiers): cutter.modifiers.remove(mod)
    cutter.hide_render=True; cutter.hide_set(True); cutter.display_type='WIRE'
    cutter['purpose']='Retained editable cutter; do not delete'
    b=target.modifiers.new(name,'BOOLEAN'); b.operation='DIFFERENCE'; b.solver='EXACT'; b.object=cutter
    # Keep all cuts before final bevel and weighted normals.
    target.modifiers.move(len(target.modifiers)-1,0)

fontpath='/System/Library/Fonts/Supplemental/Arial.ttf'
font=bpy.data.fonts.load(fontpath)
def label(name,txt,loc,size,mat,col=INPUT,align='CENTER',rotation=(0,0,0)):
    c=bpy.data.curves.new(name,'FONT'); c.body=txt; c.size=size; c.align_x=align; c.align_y='CENTER'
    c.font=font; c.resolution_u=4
    o=bpy.data.objects.new(name,c); col.objects.link(o); o.location=loc; o.rotation_euler=rotation
    c.materials.append(mat)
    return o

def line(name,points,thickness,mat,col=DIM):
    c=bpy.data.curves.new(name,'CURVE'); c.dimensions='3D'; c.bevel_depth=thickness; c.bevel_resolution=1
    s=c.splines.new('POLY'); s.points.add(len(points)-1)
    for p,co in zip(s.points,points): p.co=(*co,1)
    o=bpy.data.objects.new(name,c); col.objects.link(o); c.materials.append(mat)
    return o

# Lower moulding, 1.8 mm walls and a 2.1 mm floor.
base=rr('D-side | 326.50 x 229.00 x 10.05 | R8 plan',W,D,10.05,(0,0,5.025),8,bottom,BASE,0.65)
base['nominal_shell_envelope_mm']=[W,D,10.05]
base['side_wall_mm']=1.8; base['floor_mm']=2.1
cut(base,rr('TOOL | lower shell interior',W-3.6,D-3.6,11,(0,0,7.6),6.2,None,CUT),'Hollow lower shell | floor 2.10 mm')
seam=rr('C-D parting line | 0.20 mm',W-0.5,D-0.5,0.2,(0,0,10.15),7.8,rubber,BASE,0.03,ring=(W-4,D-4,6))
deck=rr('C-side | IMR palmrest and deck | top Z13.40',W,D,3.15,(0,0,11.825),8,imr,BASE,0.45)
cut(deck,rr('TOOL | keyboard pocket 299 x 109',299,109,4,(0,29,13.5),4.0,None,CUT),'Recessed keyboard pocket | depth 1.35 mm')
rr('Keyboard pocket floor',297.5,107.5,0.30,(0,29,12.00),3.7,rubber,INPUT,0.08)
cut(deck,rr('TOOL | touchpad pocket 116 x 62',116,62,1.8,(0,-70,13.5),2.3,None,CUT),'Precision touchpad recess')
rr('Touchpad perimeter | graphite trim',115.5,61.5,0.35,(0,-70,12.72),2.1,metal,INPUT,0.08)
rr('Centered touchpad | 114.6 x 60.6 mm',114.6,60.6,0.32,(0,-70,12.94),1.9,imr,INPUT,0.12)
cut(deck,rr('TOOL | front finger relief',36,10,1.8,(0,-115,13.55),3,None,CUT),'Front opening relief')

# ChromeOS keyboard with Spanish legends and independent rounded keycaps.
key_records=[]
def keyrow(labels,widths,y,h=15.1):
    gap=1.10; total=286.5
    unit=(total-gap*(len(widths)-1))/sum(widths)
    x=-total/2
    for index,(s,u) in enumerate(zip(labels,widths)):
        kw=unit*u; cx=x+kw/2
        if s=='↑ ↓':
            kh=(h-gap)/2
            for sym,yy in [('↑',y+(kh+gap)/2),('↓',y-(kh+gap)/2)]:
                rr('Key | '+sym,kw,kh,.95,(cx,yy,12.775),1.4,keymat,INPUT,.22)
                label('Legend | '+sym,sym,(cx,yy,13.27),2.25,legend)
                key_records.append({'text':sym,'x':cx,'y':yy,'w':kw,'h':kh})
            x+=kw+gap
            continue
        k=rr('Key | '+s.replace('\n',' / '),kw,h,0.95,(cx,y,12.775),1.4,keymat,INPUT,0.22)
        k['legend']=s; k['layout']='Spanish ISO-inspired Chromebook'
        if s!='space':
            label('Legend | '+s.replace('\n',' / '),s,(cx,y,13.27),2.25 if len(s)<3 else 1.8,legend)
        key_records.append({'text':s,'x':cx,'y':y,'w':kw,'h':h})
        x+=kw+gap

keyrow(['esc','←','↻','full','view','capture','dim','bright','mute','vol−','vol+','power'],[1]*12,74.0,10.8)
keyrow(['º','1 !','2 "','3 ·','4 $','5 %','6 &','7 /','8 (','9 )','0 =',"' ?",'¡','backspace'],[1]*13+[1.85],59.0)
keyrow(['tab','Q','W','E','R','T','Y','U','I','O','P','` ^','+ *'],[1.45]+[1]*12,41.8)
keyrow(['search','A','S','D','F','G','H','J','K','L','Ñ','´ ¨','intro'],[1.0]+[1]*11+[2.22],24.6)
keyrow(['Mayús','< >','Z','X','C','V','B','N','M',', ;','. :','− _','Mayús'],[1.55]+[1]*11+[1.65],7.4)
# Bottom row is width-balanced so the spacebar lands on the chassis centreline
# (the touchpad is chassis-centred, so an off-centre spacebar reads as a skewed deck).
keyrow(['ctrl','alt','space','alt gr','ctrl','←','↑ ↓','→'],[2.30,2.22,5.3,1.0,1.1,.75,.75,.75],-9.8)

# Vector-etched Chromebook function icons; no font-glyph substitutions.
for key in key_records:
    symbol=key['text']
    if symbol not in ['full','view','capture','dim','bright','mute','vol−','vol+','power','backspace']: continue
    old=bpy.data.objects.get('Legend | '+symbol)
    if old: bpy.data.objects.remove(old,do_unlink=True)
    cx,cy=key['x'],key['y']
    def stroke(points):
        line('Icon | '+symbol,[(cx+a,cy+b,13.29) for a,b in points],.095,legend,INPUT)
    def arc(x,y,r,a0,a1,n=18):
        stroke([(x+r*math.cos(math.radians(a0+(a1-a0)*i/n)),y+r*math.sin(math.radians(a0+(a1-a0)*i/n))) for i in range(n+1)])
    if symbol=='full':
        for sx in [-1,1]:
            for sy in [-1,1]: stroke([(sx*.7,sy*1.4),(sx*1.8,sy*1.4),(sx*1.8,sy*.35)])
    elif symbol=='view':
        stroke([(-1.8,-1.3),(1.8,-1.3),(1.8,1.3),(-1.8,1.3),(-1.8,-1.3)])
        stroke([(-.8,-1.3),(-.8,1.3)])
    elif symbol in ['dim','bright']:
        rr0=.65 if symbol=='dim' else .83
        arc(0,0,rr0,0,360,24)
        for i in range(8):
            a=i*math.pi/4
            stroke([((rr0+.38)*math.cos(a),(rr0+.38)*math.sin(a)),((rr0+.95)*math.cos(a),(rr0+.95)*math.sin(a))])
    elif symbol in ['mute','vol−','vol+']:
        stroke([(-1.9,-.55),(-1.1,-.55),(-.15,-1.25),(-.15,1.25),(-1.1,.55),(-1.9,.55),(-1.9,-.55)])
        if symbol=='mute':
            stroke([(.65,-.6),(1.8,.6)]); stroke([(.65,.6),(1.8,-.6)])
        else:
            arc(.10,0,1.05,-55,55)
            if symbol=='vol+': arc(.10,0,1.75,-55,55)
    elif symbol=='capture':
        stroke([(-1.9,-1.3),(1.9,-1.3),(1.9,1.3),(-1.9,1.3),(-1.9,-1.3)])
        arc(0,0,.62,0,360,20)
    elif symbol=='power':
        arc(0,0,.9,110,430,28)
        stroke([(0,.45),(0,1.5)])
    elif symbol=='backspace':
        stroke([(-4.0,0),(-2.0,1.9),(4.0,1.9),(4.0,-1.9),(-2.0,-1.9),(-4.0,0)])
        stroke([(-.1,1.0),(2.1,-1.0)]); stroke([(-.1,-1.0),(2.1,1.0)])

# Retained through-wall cutters and connector assemblies.
ports=[]
def aperture(kind,side,y,w,h,r,z=6.4):
    sign=-1 if side=='L' else 1
    x=sign*W/2
    tool=rr('TOOL | '+side+' '+kind+' aperture',w,h,10,(x,y,z),r,None,CUT,plane='YZ')
    cut(base,tool,'Through wall | '+side+' '+kind)
    lip=rr(side+' | '+kind+' | machined connector rim',w-.12,h-.12,0.65,(x-sign*.15,y,z),max(.1,r-.06),metal,PORT,.05,plane='YZ',ring=(w-.78,h-.78,max(.1,r-.39)))
    rr(side+' | '+kind+' | cavity backing',w-.35,h-.35,.35,(x-sign*4.7,y,z),max(.1,r-.2),rubber,PORT,0.02,plane='YZ')
    ports.append({'type':kind,'side':side,'y_mm':y,'from_rear_mm':D/2-y,'z_mm':z,'panel_aperture_w_mm':w,'panel_aperture_h_mm':h,'corner_radius_mm':r,'basis':'Proposed nominal; OEM connector drawings not supplied'})
    lip['nominal_aperture_mm']=[w,h]; lip['rear_datum_mm']=D/2-y
    if kind.startswith('USB-C'):
        rr(side+' | USB-C central tongue',6.8,.65,4.0,(x-sign*2.6,y,z),.28,rubber,PORT,.05,plane='YZ')
        for i in range(12):
            yy=y+(i-5.5)*.48
            rr(side+' | USB-C contact %02d'%i,.19,.06,2,(x-sign*1.9,yy,z+.36),.02,gold,PORT,0,plane='YZ')
    elif kind=='USB-A':
        rr('L | USB-A blue tongue',11.4,1.55,5.2,(x-sign*2.6,y,z+1),.18,blue,PORT,.07,plane='YZ')
        for i in range(4):
            rr('L | USB-A contact %d'%i,1.05,.09,3,(x-sign*1.8,y+(i-1.5)*2.3,z+.18),.03,gold,PORT,0,plane='YZ')
    elif kind=='MicroSD':
        rr('L | MicroSD guide tongue',10,.3,4,(x-sign*2.5,y,z-.45),.08,rubber,PORT,.03,plane='YZ')
    text={'USB-C 1':'USB-C','USB-C 2':'USB-C','USB-A':'USB-A','MicroSD':'microSD','Kensington':'LOCK'}.get(kind,kind)
    rotation=(math.pi/2,0,sign*math.pi/2)
    label(side+' | port legend '+kind,text,(x+sign*.04,y,10.95),1.4,legend,PORT,rotation=rotation)
    return tool

aperture('USB-C 1','L',77,9.2,3.6,1.8)
aperture('USB-A','L',45,14.2,6.8,.65)
aperture('MicroSD','L',-13,12.0,1.8,.35)
aperture('USB-C 2','R',72,9.2,3.6,1.8)
aperture('Kensington','R',99,7.0,3.0,.5)

# Audio aperture: outer housing 5.2 mm; precise 3.5 mm clear bore.
audio_y=13
audio_tool=cylinder('TOOL | 5.2 mm audio housing',2.6,10,(-W/2,audio_y,6.4),None,CUT,'X',64,0)
cut(base,audio_tool,'Audio housing through wall | dia 5.20')
ring=rr('L | Audio jack | 3.50 mm clear bore',5.15,5.15,.8,(-W/2+.12,audio_y,6.4),2.575,metal,PORT,.02,plane='YZ',ring=(3.5,3.5,1.75))
rr('L | Audio barrel sleeve',4.5,4.5,4.0,(-W/2+2.3,audio_y,6.4),2.25,rubber,PORT,0,plane='YZ',ring=(3.5,3.5,1.75))
cylinder('L | Audio black cavity',1.8,.2,(-W/2+4.5,audio_y,6.4),rubber,PORT,'X',48,0)
label('L | Audio legend','AUDIO',(-W/2-.04,audio_y,10.95),1.35,legend,PORT,rotation=(math.pi/2,0,-math.pi/2))
ports.append({'type':'3.5 mm audio','side':'L','y_mm':audio_y,'from_rear_mm':D/2-audio_y,'z_mm':6.4,'panel_aperture_w_mm':5.2,'panel_aperture_h_mm':5.2,'clear_bore_mm':3.5,'basis':'Proposed nominal'})

led=material('Status LED | soft white light pipe','#B9DFEF',.25)
bs=led.node_tree.nodes.get('Principled BSDF'); bs.inputs['Emission Color'].default_value=rgba('#B9DFEF'); bs.inputs['Emission Strength'].default_value=2
ledtool=cylinder('TOOL | Status LED aperture',.65,7,(-W/2,96,6.4),None,CUT,'X',32,0)
cut(base,ledtool,'Status indicator | dia 1.30')
cylinder('L | Status LED lens',.59,.4,(-W/2+.07,96,6.4),led,PORT,'X',32,.04)
ports.append({'type':'Status LED','side':'L','y_mm':96,'from_rear_mm':18.5,'z_mm':6.4,'panel_aperture_w_mm':1.3,'panel_aperture_h_mm':1.3,'basis':'Proposed nominal'})

# Convertible physical controls on the right, as in the Stratus source.
for name,y,w in [('Power button',39,8),('Volume rocker',14,18)]:
    tool=rr('TOOL | '+name,w,2.8,6,(W/2,y,6.4),1.2,None,CUT,plane='YZ')
    cut(base,tool,'Right side | '+name)
    rr('R | '+name,w-.5,2.3,.7,(W/2-.10,y,6.4),1.0,keymat,PORT,.08,plane='YZ')
label('R | Power label','POWER',(W/2+.04,39,10.95),1.3,legend,PORT,rotation=(math.pi/2,0,math.pi/2))
label('R | Volume label','−   +',(W/2+.04,14,10.95),1.8,legend,PORT,rotation=(math.pi/2,0,math.pi/2))

# Bottom fasteners and four compliant feet.
for i,(x,y) in enumerate([(-145,-95),(0,-95),(145,-95),(-151,0),(151,0),(-145,94),(0,94),(145,94),(0,9)]):
    tool=cylinder('TOOL | Screw counterbore %02d'%i,2,1.0,(x,y,.05),None,CUT,'Z',32,0)
    cut(base,tool,'Underside counterbore %02d'%i)
    cylinder('Bottom screw | %02d'%i,1.55,.35,(x,y,.38),metal,DETAIL,'Z',32,.10)
    line('Screw slot | %02d'%i,[(x-.8,y,.195),(x+.8,y,.195)],.13,rubber,DETAIL)
for i,(x,y) in enumerate([(-113,-91),(113,-91),(-113,91),(113,91)]):
    rr('Rubber foot | %d'%i,34,11,1.15,(x,y,-.325),3.8,rubber,DETAIL,.35)

# Real through-floor speaker perforations; one unionless multi-island cutter.
ventparts=[]
for sign in [-1,1]:
    for a in range(13):
        for b in range(5):
            x=sign*(119+a*1.9); y=-76+b*1.9
            o=cylinder('TOOL | speaker hole',.53,3.5,(x,y,1.05),None,CUT,'Z',12,0)
            for m in list(o.modifiers): o.modifiers.remove(m)
            ventparts.append(o)
    rr(('L' if sign<0 else 'R')+' | speaker acoustic mesh',30,13,.25,(sign*130.4,-72.2,2.6),1.5,rubber,DETAIL,0)
bpy.ops.object.select_all(action='DESELECT')
for o in ventparts: o.hide_set(False); o.select_set(True)
bpy.context.view_layer.objects.active=ventparts[0]
bpy.ops.object.join()
v=bpy.context.object; v.name='TOOL | 130 speaker perforations dia 1.06'
cut(base,v,'Through-floor speaker perforations | 130 x dia 1.06')
rr('Underside model label plate',76,21,.12,(0,-47,-.02),1.2,keymat,DETAIL,.03)
label('Underside identification','ARAI   /   NIMBUS S1\nCONVERTIBLE CONCEPT   •   REV A',(0,-47,-.10),2.0,legend,DETAIL,rotation=(math.pi,0,0))

# A double-axis hinge provides the extra offset needed for tablet mode.
control=bpy.data.objects.new('CONTROL | Lid opening angle (0–360 degrees)',None)
HINGE.objects.link(control); control.empty_display_type='PLAIN_AXES'; control.empty_display_size=12
control['opening_degrees']=112.0
control.id_properties_ui('opening_degrees').update(min=0,max=360,description='0 closed; 112 laptop; 180 flat; 270 tent; 360 tablet')
axisa=bpy.data.objects.new('Hinge A | lower spindle, stage 2',None); HINGE.objects.link(axisa); axisa.location=(0,PIVOT_Y,PIVOT_Z)
axisb=bpy.data.objects.new('Hinge B | display spindle, stage 1',None); HINGE.objects.link(axisb); axisb.parent=axisa; axisb.location=(0,0,LINK)
for obj,expr in [(axisa,'-max(0,min(a,360)-180)*pi/180'),(axisb,'-min(max(a,0),180)*pi/180')]:
    f=obj.driver_add('rotation_euler',0); drv=f.driver; drv.expression=expr
    var=drv.variables.new(); var.name='a'; var.type='SINGLE_PROP'; var.targets[0].id=control; var.targets[0].data_path='["opening_degrees"]'
for x in [-116,116]:
    cut(deck,rr('TOOL | hinge deck clearance',29,14,8,(x,111,13),2,None,CUT),'Rear hinge pocket')
    for axis,localz,name in [(axisa,0,'lower'),(axisb,0,'upper')]:
        o=cylinder('Hinge | '+name+' barrel '+str(x),3.2,25,(x,0,localz),imr,HINGE,'X',64,.16)
        o.parent=axis
        for xx in [x-12.2,x+12.2]:
            o=cylinder('Hinge | satin end ring',3.23,.7,(xx,0,localz),metal,HINGE,'X',64,.08); o.parent=axis
    o=rr('Hinge | rotating link '+str(x),22,4.4,10,(x,0,5),1.8,imr,HINGE,.3); o.parent=axisa

def lidparent(obj):
    obj.parent=axisb
    return obj

cover=lidparent(rr('A-side | IMR top cover | 326.50 x 221.60',W,LID_D,4.0,(0,LID_CENTER_Y,2.8),7.5,imr,LID,.6))
front=lidparent(rr('B-side | matte display bezel',W-.65,LID_D-.65,1.0,(0,LID_CENTER_Y,.5),7.2,bezel,LID,.18))
for x in [-116,116]:
    lidparent(rr('Hinge | display mounting tongue '+str(x),20,8,2.2,(x,-4,1.7),1.2,imr,HINGE,.18))
screen_tool=lidparent(rr('TOOL | Active display window',SCREEN_W+.3,SCREEN_H+.3,4,(0,SCREEN_Y,0),.8,None,CUT))
cut(front,screen_tool,'14 inch 16:9 display opening')
cut(cover,screen_tool,'Display module recess')

# Actual source ChromeOS desktop sampled from the front elevation. A 16:9 crop
# keeps the shelf icons round instead of stretching the 12.2-inch image.
screenmat=bpy.data.materials.new('14 inch LCD | ChromeOS source desktop | Emission')
screenmat.use_nodes=True; ns=screenmat.node_tree.nodes; ns.clear()
output=ns.new('ShaderNodeOutputMaterial'); output.location=(370,0)
emit=ns.new('ShaderNodeEmission'); emit.location=(140,0); emit.inputs['Strength'].default_value=.9
tex=ns.new('ShaderNodeTexImage'); tex.location=(-200,0)
tex.image=bpy.data.images.load(str(REF/'image7.webp')); tex.image.pack()
screenmat.node_tree.links.new(tex.outputs['Color'],emit.inputs['Color']); screenmat.node_tree.links.new(emit.outputs[0],output.inputs['Surface'])
def imageplane(name,w,h,loc,mat,col,face_down=False,uv_bounds=(0,0,1,1)):
    verts=[(-w/2,-h/2,0),(w/2,-h/2,0),(w/2,h/2,0),(-w/2,h/2,0)]
    face=(3,2,1,0) if face_down else (0,1,2,3)
    mesh=bpy.data.meshes.new(name+' mesh'); mesh.from_pydata(verts,[],[face]); mesh.update()
    o=bpy.data.objects.new(name,mesh); col.objects.link(o); o.location=loc; mesh.materials.append(mat)
    uv=mesh.uv_layers.new(name='UVMap')
    u0,v0,u1,v1=uv_bounds
    # The display top is the negative-Y edge when the lid is closed.
    coords=[(u0,v1),(u1,v1),(u1,v0),(u0,v0)] if face_down else [(u0,v0),(u1,v0),(u1,v1),(u0,v1)]
    for loop in mesh.loops: uv.data[loop.index].uv=coords[loop.vertex_index]
    return o

# Reference crop x=463..1135, y=247..625 (672 x 378 pixels, exactly 16:9).
lcd=lidparent(imageplane('Display active area | %.3f x %.3f mm'%(SCREEN_W,SCREEN_H),SCREEN_W,SCREEN_H,(0,SCREEN_Y,.28),screenmat,LID,True,(463/1600,1-625/900,1135/1600,1-247/900)))
lcd['active_diagonal_mm']=355.6; lcd['active_dimensions_mm']=[SCREEN_W,SCREEN_H]
lcd['resolution']='1920 × 1080'; lcd['source']='Packed ChromeOS desktop from supplied image7.webp, 16:9 crop'

logo_img=bpy.data.images.load(str(REF/'arai-icon.png')); logo_img.pack()
logo_mat=bpy.data.materials.new('ARAI | supplied transparent silver brand artwork'); logo_mat.use_nodes=True
n=logo_mat.node_tree.nodes; n.clear()
out=n.new('ShaderNodeOutputMaterial'); mix=n.new('ShaderNodeMixShader'); trans=n.new('ShaderNodeBsdfTransparent'); p=n.new('ShaderNodeBsdfPrincipled'); it=n.new('ShaderNodeTexImage'); it.image=logo_img
p.inputs['Metallic'].default_value=.65; p.inputs['Roughness'].default_value=.32
logo_mat.node_tree.links.new(it.outputs['Color'],p.inputs['Base Color']); logo_mat.node_tree.links.new(it.outputs['Alpha'],mix.inputs[0]); logo_mat.node_tree.links.new(trans.outputs[0],mix.inputs[1]); logo_mat.node_tree.links.new(p.outputs[0],mix.inputs[2]); logo_mat.node_tree.links.new(mix.outputs[0],out.inputs[0])
rear_logo=lidparent(imageplane('Arai logo | rear cover | supplied artwork',64,64*380/2072,(0,-116,4.82),logo_mat,LID))
# Upright when viewed from behind the OPEN lid; rotate in the decal's plane.
# Do not rotate the shared texture: the lower-bezel logo is already correct.
rear_logo.rotation_euler.z=math.pi
lidparent(imageplane('Arai logo | lower bezel | supplied artwork',30,30*380/2072,(0,-18.5,-.03),logo_mat,LID,True))
lidparent(label('Rear lid secondary mark','chromebook',(-125,-198,4.84),5,legend,LID,align='LEFT'))
for name,r,z,mat in [('camera surround',2.8,-.06,rubber),('HD webcam glass',1.4,-.17,glass),('camera lens',.67,-.24,metal)]:
    lidparent(cylinder('Bezel | '+name,r,.13,(0,-219,z),mat,LID,'Z',48,.02))
for x in [-8,8]:
    lidparent(cylinder('Bezel | microphone',.48,.12,(x,-219,-.10),rubber,LID,'Z',24,.02))
for x in [-151,151]:
    for y in [-214,-10]:
        lidparent(rr('B-side | screen standoff',4.5,1.4,.24,(x,y,-.1),.6,rubber,LID,.08))

# Native CAD guides, hidden for the product presentation.
def dimension(a,b,txt,offset,axis='X'):
    z=20
    if axis=='X':
        p=(a[0],offset,z); q=(b[0],offset,z)
        line('Dim '+txt,[p,q],.12,dim_mat)
        for x,y in [a,b]:
            line('Extension '+txt,[(x,y,z),(x,offset+3,z)],.08,dim_mat)
            line('Tick '+txt,[(x-2,offset-2,z),(x+2,offset+2,z)],.14,dim_mat)
        label('Dimension '+txt,txt,((a[0]+b[0])/2,offset+5,z),4,dim_mat,DIM)
    else:
        line('Dim '+txt,[(offset,a[1],z),(offset,b[1],z)],.12,dim_mat)
        for x,y in [a,b]:
            line('Extension '+txt,[(x,y,z),(offset+3,y,z)],.08,dim_mat)
            line('Tick '+txt,[(offset-2,y-2,z),(offset+2,y+2,z)],.14,dim_mat)
        label('Dimension '+txt,txt,(offset-5,(a[1]+b[1])/2,z),4,dim_mat,DIM,rotation=(0,0,math.pi/2))
dimension((-W/2,-D/2),(W/2,-D/2),'326.50 mm',-136)
dimension((-W/2,-D/2),(-W/2,D/2),'229.00 mm',-183,'Y')
line('Closed height | 18.80 mm',[(192,-114.5,0),(192,-114.5,18.8)],.12,dim_mat)
for z in [0,18.8]:
    line('Closed height extension',[(163.25,-114.5,z),(195,-114.5,z)],.08,dim_mat)
    line('Closed height tick',[(190,-114.5,z-2),(194,-114.5,z+2)],.13,dim_mat)
label('Closed height caption','18.80 mm CLOSED',(200,-114.5,9.4),3.5,dim_mat,DIM,align='LEFT',rotation=(math.pi/2,0,0))
label('CAD status','NIMBUS S1 / CONVERTIBLE CONCEPT\nALL DIMENSIONS IN mm · NOMINAL', (0,-151,20),3.2,dim_mat,DIM)
DIM.hide_render=True; DIM.hide_viewport=True

# Pack original references in the file and make them available in the Image Editor.
for fn in ['image3.webp','image4.webp','image10.webp']:
    img=bpy.data.images.load(str(REF/fn)); img.pack(); img.use_fake_user=True
for i,fn in enumerate(['image3.webp','image4.webp','image7.webp','image10.webp']):
    o=bpy.data.objects.new('REF | '+fn,None); REFERENCE.objects.link(o)
    o.empty_display_type='IMAGE'; o.data=bpy.data.images.get(fn); o.empty_display_size=326.5; o.location=(700+i*350,0,0)
REFERENCE.hide_render=True; REFERENCE.hide_viewport=True

for frame,angle in [(1,0),(41,112),(81,180),(121,270),(161,360)]:
    control['opening_degrees']=angle; control.keyframe_insert(data_path='["opening_degrees"]',frame=frame)
    scene.timeline_markers.new({0:'CLOSED · 18.80 mm',112:'LAPTOP · 112°',180:'FLAT · 180°',270:'TENT · 270°',360:'TABLET · 360°'}[angle],frame=frame)
scene.frame_start=1; scene.frame_end=161; scene.frame_set(41)

# Product studio with broad reflections that reveal matte-black geometry.
floor=material('Studio ground | mist','#D9DEDF',.78)
rr('Studio ground',20000,20000,2,(0,0,-1.95),10,floor,STUDIO,0)
world=bpy.data.worlds.new('Neutral studio world'); world.use_nodes=True; world.node_tree.nodes['Background'].inputs[0].default_value=(.36,.39,.43,1); world.node_tree.nodes['Background'].inputs[1].default_value=.45; scene.world=world
def area(name,loc,power,size,target,color=(1,1,1),shape='DISK',size_y=None):
    dat=bpy.data.lights.new(name,'AREA'); dat.energy=power; dat.shape=shape; dat.size=size; dat.color=color
    if size_y: dat.size_y=size_y
    o=bpy.data.objects.new(name,dat); STUDIO.objects.link(o); o.location=loc; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o
area('Key | large left softbox',(-370,-290,530),9500000,460,(0,10,50),(1,.95,.90))
area('Fill | frontal softbox',(330,-380,300),6000000,380,(0,0,70),(.84,.92,1))
area('Rim | long overhead strip',(0,370,410),13000000,450,(0,0,70),(1,1,1),'RECTANGLE',160)
area('Port grazing light',(-440,20,90),1900000,240,(0,0,25),(.86,.92,1),'RECTANGLE',70)

def camera(name,loc,target,scale):
    d=bpy.data.cameras.new(name); d.type='ORTHO'; d.ortho_scale=scale; d.clip_start=.1; d.clip_end=20000
    o=bpy.data.objects.new(name,d); STUDIO.objects.link(o); o.location=loc; o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o
hero=camera('CAM 01 | open hero, left I-O',(-405,-555,335),(0,15,88),500)
rearcam=camera('CAM 02 | closed cover',(380,-470,430),(0,0,0),450)
rightcam=camera('CAM 03 | right I-O',(480,-130,155),(115,33,10),238)
leftcam=camera('CAM 04 | left I-O detail',(-480,3,125),(-133,36,7),208)
topcam=camera('CAM 05 | top orthographic',(0,0,800),(0,0,0),385)
frontcam=camera('CAM 06 | front orthographic',(0,-800,117),(0,0,117),400)
sidecam=camera('CAM 07 | left orthographic',(-800,0,10),(0,0,10),270)
bottomcam=camera('CAM 08 | underside',(0,0,-800),(0,0,0),385)
tabletcam=camera('CAM 09 | tablet proof',(-370,-480,-290),(0,0,-1),475)
scene.camera=hero
scene.render.engine='CYCLES'; scene.cycles.samples=48; scene.cycles.use_denoising=True
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='METAL'; prefs.get_devices()
    for dev in prefs.devices: dev.use=dev.type=='METAL'
    scene.cycles.device='GPU'
except Exception:
    scene.cycles.device='CPU'
scene.render.resolution_x=1600; scene.render.resolution_y=1200; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.image_settings.color_mode='RGBA'
scene.view_settings.view_transform='AgX'
scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=-0.25
for lamp in bpy.data.lights:
    lamp.energy *= 0.4
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.20
scene.render.film_transparent=False
scene.render.image_settings.color_depth='8'

def fit_camera(cam,collections,padding=1.15):
    bpy.context.view_layer.update()
    inv=cam.matrix_world.inverted(); points=[]
    deps=bpy.context.evaluated_depsgraph_get()
    for col in collections:
        for obj in col.objects:
            if obj.type not in {'MESH','FONT','CURVE'} or obj.hide_render: continue
            ev=obj.evaluated_get(deps)
            points += [inv @ (ev.matrix_world @ Vector(p)) for p in ev.bound_box]
    lo=[min(p[i] for p in points) for i in range(2)]
    hi=[max(p[i] for p in points) for i in range(2)]
    cam.data.ortho_scale=max(hi[0]-lo[0],(hi[1]-lo[1])*scene.render.resolution_x/scene.render.resolution_y)*padding
    cam.location += cam.rotation_euler.to_quaternion() @ Vector(((lo[0]+hi[0])/2,(lo[1]+hi[1])/2,0))
fit_camera(hero,[BASE,INPUT,PORT,HINGE,LID,DETAIL])

for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.clip_end=20000
            a.spaces.active.region_3d.view_distance=550
            a.spaces.active.region_3d.view_location=(0,0,85)
            a.spaces.active.region_3d.view_rotation=hero.rotation_euler.to_quaternion()
            a.spaces.active.region_3d.view_perspective='CAMERA'
            a.spaces.active.shading.type='MATERIAL'
            a.spaces.active.overlay.show_floor=False

spec={'model':'Arai Nimbus S1 / Stratus-inspired convertible concept','units':'mm','closed_envelope_mm':[W,D,18.8],'base_shell_mm':[W,D,BASE_H],'lid_shell_mm':[W,LID_D,LID_T],'closed_gap_mm':GAP,'rubber_foot_projection_mm':.9,'display':{'diagonal_inches':14,'width_mm':SCREEN_W,'height_mm':SCREEN_H,'aspect':'16:9','resolution':[1920,1080]},'hinge':{'type':'Sequential dual-axis concept','range_degrees':[0,360],'lower_axis_yz_mm':[PIVOT_Y,PIVOT_Z],'axis_spacing_mm':LINK,'frame_presets':{'1':'closed','41':'112 degrees','81':'180 degrees','121':'270 degrees','161':'360 degrees'}},'ports':ports,'keyboard':key_records,'assumptions':['Overall closed height interpreted as 18.8 mm after user authorized adaptation; excludes compliant feet.','Nimbus 14-inch dimensions govern; Stratus 12.2-inch references provide styling and convertible mechanism inspiration.','Port apertures and rear-datum positions are exact modeled nominal proposals, not measured OEM data.','Aperture dimensions are not manufacturing tolerances or connector compliance certification.','HDMI, stylus garage and LTE components are not added to the requested Nimbus I/O configuration.','360-degree mechanism is a conceptual two-axis linkage; mechanical endurance and internal flex routing are not engineered.','MT11015 is approximated by the specified color/roughness and a procedural micro-bump; no measured surface sample supplied.']}
spec['hinge']['lid_rear_sweep_clearance_mm']=4.0
spec['hinge']['lid_local_y_span_mm']=[-225.6,-4.0]
(OUT/'model_specification.json').write_text(json.dumps(spec,indent=2,ensure_ascii=False))

readme='''ARAI NIMBUS S1 — CONVERTIBLE CONCEPT / REV A

UNITS: Metric, millimeters, unit scale 0.001. Geometry is authored 1 unit = 1 mm.
NOMINAL CLOSED ENVELOPE: 326.50 W × 229.00 D × 18.80 H mm, excluding 0.90 mm rubber feet.
BASE: 13.40 mm. CLOSED CLEARANCE: 0.60 mm. LID: 4.80 mm.
DISPLAY: 14 inch / 355.60 mm diagonal, 16:9, 1920 × 1080.

OPEN THE FILE: Default pose is frame 41, 112 degrees. Use timeline markers:
1 closed, 41 laptop, 81 flat, 121 tent, 161 tablet. Hinge control custom property
"opening_degrees" drives sequential upper/lower axes. The timeline is animated.
For a custom angle, change or remove its animation before setting the property.

EDIT: Shell bevel and aperture Boolean modifiers remain live. Cutters are hidden
individually in collection 98. Unhide a cutter to edit it; keep it in the file.
Collection 80 contains native millimeter dimension guides; enable in viewport.
Original product views, brand artwork, screen texture and the font are packed.
Nine labeled orthographic/product cameras are available.
Studio collection 90 is hidden in the viewport for unobstructed CAD inspection;
it remains enabled for product renders. Hide its ground for custom tablet renders.

MATERIALS: Principled BSDF linearized sRGB #1A1A1A. Deck/top cover R0.40,
coat weight 0.20, sheen weight 0.12. Bottom R0.65, procedural micro-noise bump.
Display uses an Emission shader and a 16:9 crop of the supplied ChromeOS desktop.

BASIS: The user requested a Nimbus model and authorized adapting the 12.2-inch
Stratus references. Nimbus dimensions govern this 14-inch convertible concept.
The 360-degree mechanism, thickness split, port apertures/locations, keyboard,
wall thickness and detail geometry are design proposals, not OEM measurements.
The 18.8 mm height is interpreted as the closed product, not base-only height.
HDMI/stylus/LTE are omitted from the Nimbus port brief. Physical power/volume
controls follow the convertible reference. Weight is not simulated or certified.
This is an editable polygonal CAD-style Blender model, not a parametric B-rep,
STEP solid, tolerance drawing, certified mechanism or tooling release.
See model_specification.json for all proposed dimensions and assumptions.
'''
(OUT/'README.txt').write_text(readme)
txt=bpy.data.texts.new('START HERE | Nimbus dimensions & use'); txt.write(readme)
txt=bpy.data.texts.new('BUILD SOURCE | build_nimbus.py'); txt.write(Path(__file__).read_text())
bpy.ops.file.pack_all()
bpy.ops.object.select_all(action='DESELECT'); deck.select_set(True); bpy.context.view_layer.objects.active=deck
scene.render.filepath=str(OUT/'01_Open_Hero.png')
STUDIO.hide_viewport=True
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Arai_Nimbus_S1_Concept.blend'))

def render(name,cam,frame=41,x=1600,y=1200,samples=48,hide=()):
    scene.frame_set(frame); scene.camera=cam
    scene.render.resolution_x=x; scene.render.resolution_y=y; scene.cycles.samples=samples
    for c in hide: c.hide_render=True
    scene.render.filepath=str(OUT/name)
    bpy.ops.render.render(write_still=True)
    for c in hide: c.hide_render=False

if os.environ.get('NIMBUS_SKIP_RENDER') != '1':
    render('01_Open_Hero.png',hero)
    render('02_Closed_Cover.png',rearcam,1,1600,1200)
    render('03_Left_IO.png',leftcam,1,1600,650)
    render('04_Right_IO.png',rightcam,1,1600,850)
    # Tablet underside faces the viewer. Ground must be hidden for this view.
    floor_obj=bpy.data.objects.get('Studio ground'); floor_obj.hide_render=True
    area('Tablet underside softbox',(-350,-300,-420),5200000,430,(0,0,0))
    render('05_Tablet_360.png',tabletcam,161,1600,1200)
    render('06_Underside.png',bottomcam,1,1500,1150,48,(LID,))
    floor_obj.hide_render=False
    bpy.data.objects['Tablet underside softbox'].hide_render=True

scene.frame_set(41); scene.camera=hero; scene.cycles.samples=64
scene.render.resolution_x=1600; scene.render.resolution_y=1200
scene.render.filepath=str(OUT/'01_Open_Hero.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Arai_Nimbus_S1_Concept.blend'))
print('NIMBUS_BUILD_COMPLETE',str(OUT),flush=True)
