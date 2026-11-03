"""R36HD approximation from user-provided Alibaba screenshots; not an engineering model.
Generates a GLB with individual named meshes for scroll animations.
Requires numpy and trimesh. Model author: PondNest prototype.
"""
import math
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image
from trimesh.visual.material import PBRMaterial

OUT=Path(__file__).resolve().parents[1]/'public/models/gamegaga-r36hd-prototype.glb'
scene=trimesh.Scene()

def material(name, color, alpha=1.0, metallic=0.0, roughness=0.4, glow=False):
    rgb = list(color) if not isinstance(color,str) else [int(color[i:i+2],16) for i in (1,3,5)]
    return PBRMaterial(name=name, baseColorFactor=[*rgb,round(alpha*255)],
            metallicFactor=metallic, roughnessFactor=roughness,
            alphaMode='BLEND' if alpha<.99 else 'OPAQUE', doubleSided=alpha<.99,
            emissiveFactor=([v/255*.12 for v in rgb] if glow else None))

PURPLE=material('translucent lavender polymer', '#977dc9',.60,.05,.26)
PURPLE_EDGE=material('edge purple polymer', '#916bc4',.86,.03,.25)
PURPLE_BACK=material('rear lavender polymer','#7b5ca9',.75,.05,.4)
INNER=material('under shell internals','#3a3b4a',1,.05,.58)
BLACK=material('matte charcoal elastomer','#20212a',1,.04,.66)
DARK=material('plastic deep gray','#30333e',1,.04,.52)
BEZEL=material('glass bezel','#13131d',1,.15,.16)
SCREEN=material('screen midnight','#11182f',1,.02,.22,glow=True)
PINK=material('violet screen highlight','#b35af1',1,.02,.2,glow=True)
BLUE=material('cyan screen highlight','#24bbdf',1,.02,.24,glow=True)
ORANGE=material('orange screen highlight','#e66c38',1,.03,.28,glow=True)
GREEN=material('PCB dark green','#31564f',1,.15,.62)
SILVER=material('contacts','#b0b0ba',1,.65,.38)
YELLOW=material('Y label','#dcbd47',1,.01,.54)
RED=material('A label','#de5a62',1,.01,.54)
CYAN=material('X label','#67a4d4',1,.01,.54)
LIME=material('B label','#8dbb5c',1,.01,.54)

def add(mesh, name, mat, pos=(0,0,0), rotation=None):
    m=mesh.copy()
    if rotation:
        rx,ry,rz=rotation
        T=trimesh.transformations.euler_matrix(rx,ry,rz)
        m.apply_transform(T)
    m.apply_translation(pos)
    m.visual=trimesh.visual.TextureVisuals(material=mat)
    scene.add_geometry(m, geom_name=name, node_name=name)
    return m

def rounded_outline(w,h,r,steps=9):
    # CCW perimeter in the XY plane.
    centers=[(w/2-r,h/2-r,0,90),(-w/2+r,h/2-r,90,180),(-w/2+r,-h/2+r,180,270),(w/2-r,-h/2+r,270,360)]
    p=[]
    for cx,cy,a,b in centers:
        for i in range(steps+1):
            t=math.radians(a+(b-a)*i/steps)
            p.append((cx+r*math.cos(t),cy+r*math.sin(t)))
    # yields ccw from top-right to top-left to bottom-left to bottom-right
    return np.asarray(p)

def rbox(w,h,d,r=.12):
    outline=rounded_outline(w,h,r)
    n=len(outline)
    lower=np.column_stack([outline,np.full(n,-d/2)])
    upper=np.column_stack([outline,np.full(n,d/2)])
    vertices=np.vstack([lower,upper,[[0,0,-d/2],[0,0,d/2]]])
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.append((i,j,n+j))
        faces.append((i,n+j,n+i))
        faces.append((2*n,j,i))
        faces.append((2*n+1,n+i,n+j))
    mesh=trimesh.Trimesh(vertices=vertices,faces=np.asarray(faces),process=False)
    trimesh.repair.fix_normals(mesh)
    return mesh

def cyl(radius,depth,sections=40):
    return trimesh.creation.cylinder(radius=radius,height=depth,sections=sections)

def disc(name,x,y,z,radius,depth,mat):
    add(cyl(radius,depth),name,mat,(x,y,z))

def rect(name,x,y,z,w,h,d,mat,r=.035,rot=None):
    add(rbox(w,h,d,min(r,w*.4,h*.4)),name,mat,(x,y,z),rot)

def screw(x,y,z,i):
    disc(f'front_screw_{i}',x,y,z,.036,.018,SILVER)
    rect(f'front_screw_slot_{i}',x,y,z+.012,.035,.008,.004,DARK,.002)

# Body silhouette: same only approximate proportions as photographed shell.
rect('back_shell',0,0,-.175,2.52,4.56,.25,PURPLE_BACK,.21)
rect('middle_chassis',0,0,-.025,2.40,4.42,.19,INNER,.19)
rect('front_shell',0,0,.12,2.52,4.56,.16,PURPLE,.21)
# Visually shaded edges and a narrow perimeter moulding
rect('body_mid_edge',0,0,-.02,2.55,4.58,.085,PURPLE_EDGE,.21)
rect('body_inner_plate',0,-.75,.14,2.28,2.63,.020,material('visible internals behind translucent front','#514b65',.65),.15)

# Screen, positioned close to top edge. Use graphics not copied from real game art.
rect('screen_bezel',0,.92,.240,2.20,2.33,.08,BEZEL,.11)
# Textured screen (cropped/rectified from the provided supplier reference photo).
# Supplier image is only for local design prototyping, not publication rights.
screen_img = Image.open(OUT.parent / 'r36hd-screen-reference.jpg').convert('RGB')
screen_mat = PBRMaterial(name='supplier screenshot reference', baseColorFactor=[255,255,255,255],
    baseColorTexture=screen_img, metallicFactor=0, roughnessFactor=.29)
sw,sh,z = 2.04,2.14,.304
verts=np.asarray([[-sw/2,-sh/2,z],[sw/2,-sh/2,z],[sw/2,sh/2,z],[-sw/2,sh/2,z]])
tex=trimesh.Trimesh(vertices=verts, faces=[[0,1,2],[0,2,3]],process=False)
tex.visual=trimesh.visual.TextureVisuals(uv=np.asarray([[0,0],[1,0],[1,1],[0,1]],dtype=float),material=screen_mat)
tex.apply_translation([0,.92,0])
scene.add_geometry(tex,geom_name='screen_reference_image',node_name='screen_reference_image')

# D-pad. Distinct arms with clean beveled outline.
rect('controls_dpad_vertical',-.82,-.66,.30,.215,.70,.085,BLACK,.035)
rect('controls_dpad_horizontal',-.82,-.66,.308,.69,.215,.083,BLACK,.035)
# Small centre light from shell.
disc('controls_dpad_center',-.82,-.66,.357,.086,.012,DARK)
# ABXY action buttons, positions roughly matched to screenshot (not exact)
for name,x,y,lab in [('X',.70,-.55,CYAN),('Y',.47,-.79,LIME),('A',.94,-.80,RED),('B',.70,-1.04,YELLOW)]:
    disc(f'controls_{name}_base',x,y,.310,.163,.110,BLACK)
    disc(f'controls_{name}_inlay',x,y,.370,.115,.014,DARK)
    # tiny colored raised label squares (functional labelling illustrated)
    rect(f'controls_{name}_accent',x,y,.382,.067,.025,.009,lab,.003)
# Dual thumb sticks with grooved rubber pads.
for side,x in [('left',-.78),('right',.78)]:
    disc(f'controls_stick_{side}_socket',x,-1.71,.326,.325,.078,DARK)
    disc(f'controls_stick_{side}_stem',x,-1.71,.365,.245,.092,BLACK)
    disc(f'controls_stick_{side}_cap',x,-1.71,.430,.205,.045,DARK)
    disc(f'controls_stick_{side}_center',x,-1.71,.458,.135,.015,BLACK)
# Two tiny center buttons below the dpad/ABXY.
for name,x in [('select',-.18),('start',.18)]:
    disc(f'controls_{name}',x,-1.23,.305,.107,.050,BLACK)
# Little central function key
for x in [-.15,.15]:
    rect(f'controls_center_function_{x}',x,-.78,.29,.13,.07,.025,DARK,.018)
# Top middle perforation slots from photo.
for i in range(6):
    rect(f'controls_grille_{i}',-.37+i*.15,-.65,.27,.071,.125,.013,DARK,.02)

# Rear shell embossing. Rear faces -z, user sees when rotated.
rect('back_battery_hatch',0,-.32,-.325,1.59,1.82,.050,PURPLE_EDGE,.095)
for i in range(9):
    rect(f'back_vent_{i}',0,-.43+i*.12,-.358,1.25,.029,.018,PURPLE_BACK,.009)
for i,x in enumerate([-.86,-.28,.28,.86]):
    # Four protruding rear shoulder triggers with dark caps, as photographed.
    rect(f'back_trigger_{i}',x,.77,-.390,.46,.75,.16,BLACK,.10,rot=(0,0,(i-1.5)*-.055))
    rect(f'back_trigger_highlight_{i}',x,.77,-.475,.30,.52,.018,DARK,.065)
# Screw heads at four corners
for i,(x,y) in enumerate([(-1.04,2.01),(1.04,2.01),(-1.04,-2.05),(1.04,-2.05)]):
    screw(x,y,.209,i)
# Side ports approximated, not verified product hardware.
for i,y in enumerate([.54,-.62]):
    rect(f'side_detail_{i}',1.278,y,-.02,.02,.29,.18,DARK,.008)
# top and bottom edge details, no labelled claims
rect('edge_top_port',0,2.294,-.025,.38,.02,.15,DARK,.009)
rect('edge_bottom_detail',0,-2.294,-.02,.48,.02,.13,DARK,.009)

OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_bytes(trimesh.exchange.gltf.export_glb(scene, include_normals=True))
print('Wrote',OUT,OUT.stat().st_size,'bytes',len(scene.geometry),'named meshes')
