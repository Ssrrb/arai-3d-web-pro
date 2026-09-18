"""Create a dimensioned vector drawing directly from the Blender build manifest."""
import json
import math
import base64
from pathlib import Path
from html import escape

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'Arai Nimbus S1'
s=json.loads((OUT/'model_specification.json').read_text())
W,D,H=s['closed_envelope_mm']; BH=s['base_shell_mm'][2]
SW,SH=s['display']['width_mm'],s['display']['height_mm']
svg=[]
def add(t): svg.append(t)
def text(x,y,t,size=22,fill='#213B51',anchor='start',weight=400,rotate=None):
    tr=f' transform="rotate({rotate} {x} {y})"' if rotate else ''
    add(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}"{tr}>{escape(t)}</text>')
def line(x1,y1,x2,y2,color='#567283',width=1.5,dash=None):
    st=f' stroke-dasharray="{dash}"' if dash else ''
    add(f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{color}" stroke-width="{width}"{st}/>')
def rect(x,y,w,h,r=0,fill='none',stroke='#294A61',sw=1.5):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def circle(x,y,r,fill='none',stroke='#294A61',sw=1.5):
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def dim(x1,y1,x2,y2,label,offset,horizontal=True):
    c='#167AA1'
    if horizontal:
        y=offset
        line(x1,y1,x1,y+8,c,1); line(x2,y2,x2,y+8,c,1)
        add(f'<path d="M{x1},{y}H{x2}" stroke="{c}" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>')
        text((x1+x2)/2,y-12,label,22,c,'middle',500)
    else:
        x=offset
        line(x1,y1,x+8,y1,c,1); line(x2,y2,x+8,y2,c,1)
        add(f'<path d="M{x},{y1}V{y2}" stroke="{c}" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>')
        text(x-13,(y1+y2)/2,label,22,c,'middle',500,-90)

add('''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2400" height="1840" viewBox="0 0 2400 1840">
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M8 0L0 4L8 8" fill="none" stroke="#167AA1" stroke-width="1.1"/></marker>
<pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#E6ECEF" stroke-width=".6"/></pattern></defs>
<rect width="2400" height="1840" fill="#F7F9FA"/><rect x="36" y="170" width="2328" height="1500" fill="url(#grid)"/>
<g font-family="Arial, Helvetica, sans-serif"><rect width="2400" height="168" fill="#142A3A"/>''')
logo=base64.b64encode((ROOT/'STRATUS - CHROMEBOOK 12_ CONVERTIBLE'/'arai-icon.png').read_bytes()).decode()
add(f'<image x="62" y="48" width="290" height="53.2" xlink:href="data:image/png;base64,{logo}"/>')
text(420,77,'NIMBUS S1',47,'#FFFFFF',weight=600)
text(420,120,'14-inch convertible concept  /  dimensional blueprint',24,'#B7CBD8')
text(2325,67,'REV A   ·   10 SEP 2026',22,'#B7CBD8','end')
text(2325,112,'UNITS mm   /   DO NOT SCALE',22,'#FFFFFF','end',600)

# Plan view of the base with the lid suppressed, aligned to its actual XY geometry.
k=2.56; x=151; y=309
text(73,224,'01',22,'#167AA1',weight=600)
text(120,224,'BASE PLAN',26,weight=600)
text(120,255,'Lid suppressed · keyboard / touchpad positions from model',19,'#617987')
rect(x,y,W*k,D*k,8*k,'#DDE5E9',sw=2.5)
rect(x+1.6*k,y+1.6*k,(W-3.2)*k,(D-3.2)*k,6.4*k,stroke='#91A5B1',sw=1)
def xy(xx,yy): return x+(xx+W/2)*k,y+(D/2-yy)*k
px,py=xy(-149.5,83.5)
rect(px,py,299*k,109*k,4*k,'#CCD8DE')
# Chromebook function-row glyphs are drawn as vector line icons (same primitives as
# the 3D model) instead of Unicode substitutes, which rendered as solid tofu blocks.
ICON_KEYS={'full','view','capture','dim','bright','mute','vol−','vol+','power','backspace'}
ICON_K=1.5
def draw_icon(symbol,kx,ky):
    def poly(pts):
        d=' '.join(('M' if i==0 else 'L')+f'{kx+px*ICON_K*k:.2f},{ky-py*ICON_K*k:.2f}' for i,(px,py) in enumerate(pts))
        add(f'<path d="{d}" fill="none" stroke="#35536A" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>')
    def arc(ax,ay,r,a0,a1,n=18):
        poly([(ax+r*math.cos(math.radians(a0+(a1-a0)*i/n)),ay+r*math.sin(math.radians(a0+(a1-a0)*i/n))) for i in range(n+1)])
    if symbol=='full':
        for sx in (-1,1):
            for sy in (-1,1): poly([(sx*.7,sy*1.4),(sx*1.8,sy*1.4),(sx*1.8,sy*.35)])
    elif symbol=='view':
        poly([(-1.8,-1.3),(1.8,-1.3),(1.8,1.3),(-1.8,1.3),(-1.8,-1.3)])
        poly([(-.8,-1.3),(-.8,1.3)])
    elif symbol in ('dim','bright'):
        r0=.65 if symbol=='dim' else .83
        arc(0,0,r0,0,360,24)
        for i in range(8):
            a=i*math.pi/4
            poly([((r0+.38)*math.cos(a),(r0+.38)*math.sin(a)),((r0+.95)*math.cos(a),(r0+.95)*math.sin(a))])
    elif symbol in ('mute','vol−','vol+'):
        poly([(-1.9,-.55),(-1.1,-.55),(-.15,-1.25),(-.15,1.25),(-1.1,.55),(-1.9,.55),(-1.9,-.55)])
        if symbol=='mute':
            poly([(.65,-.6),(1.8,.6)]); poly([(.65,.6),(1.8,-.6)])
        else:
            arc(.10,0,1.05,-55,55)
            if symbol=='vol+': arc(.10,0,1.75,-55,55)
    elif symbol=='capture':
        bw,bh=3.8,2.6
        add(f'<rect x="{kx-bw/2*ICON_K*k:.2f}" y="{ky-bh/2*ICON_K*k:.2f}" width="{bw*ICON_K*k:.2f}" height="{bh*ICON_K*k:.2f}" rx="{.55*ICON_K*k:.2f}" fill="none" stroke="#35536A" stroke-width="1.1"/>')
        add(f'<circle cx="{kx:.2f}" cy="{ky:.2f}" r="{.62*ICON_K*k:.2f}" fill="#35536A"/>')
    elif symbol=='power':
        arc(0,0,.9,110,430,28)
        poly([(0,.45),(0,1.5)])
    elif symbol=='backspace':
        poly([(-4.0,0),(-2.0,1.9),(4.0,1.9),(4.0,-1.9),(-2.0,-1.9),(-4.0,0)])
        poly([(-.1,1.0),(2.1,-1.0)]); poly([(-.1,-1.0),(2.1,1.0)])

for key in s['keyboard']:
    xx,yy=xy(key['x']-key['w']/2,key['y']+key['h']/2)
    rect(xx,yy,key['w']*k,key['h']*k,1.4*k,'#EFF3F5','#668293',.95)
    label=key['text']
    if label in ICON_KEYS:
        draw_icon(label,*xy(key['x'],key['y']))
    elif label!='space':
        text(xx+key['w']*k/2,yy+key['h']*k/2+4,label,10.2 if len(label)>3 else 12,'#35536A','middle')
tx,ty=xy(-58,-39)
rect(tx,ty,116*k,62*k,2.3*k,'#DBE4E9','#4B6D82',1.5)
rect(tx+1.8,ty+1.8,116*k-3.6,62*k-3.6,2*k,stroke='#A1B5C0',sw=1)
for hx in [-116,116]:
    hx0,hy=xy(hx-12.5,114.3)
    rect(hx0,hy,25*k,6.4*k,1.8*k,'#9BB0BD')
cx,_=xy(0,0)
line(cx,y-8,cx,y+D*k+10,'#95AAB7',1,'10 6 2 6')
dim(x,y+D*k,x+W*k,y+D*k,'326.50',y+D*k+43)
dim(x,y,x,y+D*k,'229.00',x-50,False)
text(x,y+D*k+86,'Corner radius R8.0 · base height 13.40 · deck bevel 0.45',20,'#617987')

# Display front elevation is dimensioned to the active area, not the bezel.
lx=1358; ly=310; LD=s['lid_shell_mm'][1]
text(1280,224,'02',22,'#167AA1',weight=600)
text(1327,224,'DISPLAY ELEVATION',26,weight=600)
text(1327,255,'Front of lid · 14-inch / 355.60 diagonal active area',19,'#617987')
rect(lx,ly,W*k,LD*k,7.5*k,'#D4E0E6',sw=2.5)
sx=lx+(W-SW)/2*k; sy=ly+(225.6-212)*k
rect(sx,sy,SW*k,SH*k,.8*k,'#ECF4F7','#3F6D88',1.8)
line(sx,sy,sx+SW*k,sy+SH*k,'#167AA1',1.5,'10 8')
text(sx+SW*k/2,sy+SH*k/2-14,'14.0″  /  355.60 mm',31,'#23546F','middle',500)
text(sx+SW*k/2,sy+SH*k/2+23,'1920 × 1080   ·   16:9',22,'#617987','middle')
circle(lx+W*k/2,ly+(225.6-219)*k,2.8*k,'#7894A5')
circle(lx+W*k/2,ly+(225.6-219)*k,1.4*k,'#274C63')
text(lx+W*k/2,ly+(225.6-18.5)*k+4,'ARAI',19,'#45677B','middle',600)
dim(sx,sy,sx+SW*k,sy,f'{SW:.3f} active',ly-26)
dim(sx+SW*k,sy,sx+SW*k,sy+SH*k,f'{SH:.3f} active',lx+W*k+51,False)
text(lx,ly+LD*k+80,'Cover thickness 4.80 · corner radius R7.5 · dark matte bezel',20,'#617987')

line(70,1015,2330,1015,'#C4D2DA')
# Both sides share a rear datum at drawing left, explicitly labeled.
def sideview(side,x,y):
    scale=3.72; width=D*scale; hh=H*scale
    title='LEFT I/O' if side=='L' else 'RIGHT I/O'
    text(x,1076,'03' if side=='L' else '04',22,'#167AA1',weight=600)
    text(x+47,1076,title,26,weight=600)
    text(x,1108,'Rear datum at left · nominal panel openings / proposed positions',19,'#617987')
    rect(x,y,width,hh,3.1*scale,'#E0E8ED',sw=2)
    lidbottom=y+4.8*scale
    line(x+5,lidbottom,x+width-5,lidbottom,'#567283',1)
    line(x+5,lidbottom+.6*scale,x+width-5,lidbottom+.6*scale,'#567283',1)
    text(x,y-15,'REAR',15,'#617987')
    text(x+width,y-15,'FRONT',15,'#617987','end')
    for i,p in enumerate(sorted([p for p in s['ports'] if p['side']==side],key=lambda p:p['from_rear_mm'])):
        xx=x+p['from_rear_mm']*scale
        yy=y+(H-p['z_mm'])*scale
        pw=p['panel_aperture_w_mm']*scale; ph=p['panel_aperture_h_mm']*scale
        if p['type']=='Status LED': circle(xx,yy,pw/2,'#B4E1EC')
        elif 'audio' in p['type']:
            circle(xx,yy,pw/2,'#C0CED7'); circle(xx,yy,3.5*scale/2,'#163749')
        else:
            rect(xx-pw/2,yy-ph/2,pw,ph,p.get('corner_radius_mm',.4)*scale,'#254456','#163749',1.1)
            if p['type'].startswith('USB-C'): rect(xx-3.4*scale,yy-.325*scale,6.8*scale,.65*scale,.3*scale,'#A0B5C0','none')
            if p['type']=='USB-A': rect(xx-5.7*scale,yy-1.75*scale,11.4*scale,1.55*scale,.18*scale,'#598AAC','none')
        number=i+1 if side=='L' else i+6
        ey=y+hh+27+(i%2)*30
        line(xx,yy+ph/2+3,xx,ey-12,'#718B9B',1)
        circle(xx,ey,13,'#F7F9FA','#7893A4',1)
        text(xx,ey+5,str(number),16,'#315970','middle',600)
    if side=='R':
        for name,rear,pw in [('P',D/2-39,8),('V',D/2-14,18)]:
            xx=x+rear*scale; yy=y+(H-6.4)*scale
            rect(xx-pw/2*scale,yy-1.4*scale,pw*scale,2.8*scale,1.2*scale,'#9FB3BF')
            text(xx,y+hh+48,name,17,'#617987','middle')
    dim(x+width,y,x+width,y+hh,'18.80',x+width+44,False)
    return y+hh+100

sideview('L',120,1160)
sideview('R',1320,1160)

# Exact coordinate table. Numbers correspond to the port leaders above.
text(120,1397,'PANEL APERTURES',20,'#213B51',weight=600)
text(515,1397,'W × H / Ø',18,'#617987')
text(770,1397,'FROM REAR',18,'#617987')
line(120,1411,1110,1411,'#B8CAD4')
ordered=sorted([p for p in s['ports'] if p['side']=='L'],key=lambda p:p['from_rear_mm'])+sorted([p for p in s['ports'] if p['side']=='R'],key=lambda p:p['from_rear_mm'])
for i,p in enumerate(ordered):
    yy=1439+i*31
    name=p['type'].replace('USB-C 1','USB-C').replace('USB-C 2','USB-C')
    text(125,yy,f'{i+1:02}   {p["side"]}  /  {name}',19)
    val=f'{p["panel_aperture_w_mm"]:.2f} × {p["panel_aperture_h_mm"]:.2f}'
    if 'audio' in p['type']: val='Ø5.20 housing / Ø3.50 bore'
    if p['type']=='Status LED': val='Ø1.30'
    text(515,yy,val,18)
    text(785,yy,f'{p["from_rear_mm"]:.2f}',19)
text(120,1730,'All port centers Z6.40 above base datum. No tolerances assigned.',18,'#617987')

text(1320,1397,'SURFACES & ARTICULATION',20,'#213B51',weight=600)
line(1320,1411,2275,1411,'#B8CAD4')
notes=[
('A / C surfaces','MT11015 · #1A1A1A · roughness 0.40 · IMR coat + sheen'),
('D surface','MT11015 · #1A1A1A · roughness 0.65 · fine micro-bump'),
('Closed stack','13.40 base + 0.60 clearance + 4.80 lid = 18.80'),
('Hinge concept','Dual axes · 10.00 spacing · 0° to 360° articulation'),
('Frame presets','1 closed / 41 laptop / 81 flat / 121 tent / 161 tablet'),
('Control keys','P: power · V: volume · Spanish keyboard with Ñ'),
]
for i,(a,b) in enumerate(notes):
    yy=1439+i*41
    text(1320,yy,a,18,'#617987'); text(1510,yy,b,17.5)
text(1320,1706,'Stratus styling adapted to the supplied Nimbus 14-inch envelope.',19,'#617987')
text(1320,1734,'0.90 mm compliant feet excluded from nominal closed height.',19,'#617987')

add('<rect x="0" y="1770" width="2400" height="70" fill="#E3EBEF"/>')
text(64,1813,'DESIGN CONCEPT — NOT OEM / NOT FOR TOOLING',21,'#213B51',weight=600)
text(2328,1813,'Port positions, hinge and internal construction are proposed.  /  SHEET 01',19,'#526F81','end')
add('</g></svg>')
(OUT/'07_Dimensioned_Blueprint.svg').write_text('\n'.join(svg))
print('BLUEPRINT_SVG_COMPLETE')
