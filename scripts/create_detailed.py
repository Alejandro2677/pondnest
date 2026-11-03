"""PondNest R36 HD v0.3: photograph-textured 2.5D/product model with real geometry.
Reference photos include user-approved generated reconstructions, so the geometry is
artistic and NOT a manufacturing-accurate reconstruction of any real hardware.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals
import trimesh, numpy as np, cv2, math, random
random.seed(29)

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/models/gamegaga-r36hd-detailed.glb'
FRONT=Path('/mnt/data/consola_retro_transparente_con_coche_de_carreras.png')
BACK=Path('/mnt/data/consola_retro_transparente_con_placa_visible.png')
OUT.parent.mkdir(parents=True,exist_ok=True)
tex_dir=OUT.parent/'textures_v03'; tex_dir.mkdir(exist_ok=True)
scene=trimesh.Scene()
W,H,D=2.57,4.18,.41
# image crop corresponds to shell bounds in both studio-view source images
SRC_F=Image.open(FRONT).convert('RGBA').crop((273,39,973,1179))
SRC_B=Image.open(BACK).convert('RGBA').crop((275,39,971,1177)).resize(SRC_F.size,Image.Resampling.LANCZOS)
TW,TH=SRC_F.size
sx=lambda px:(px-273)/700*W-W/2
sy=lambda py:H/2-(py-39)/1140*H

def rgba_mat(name,col=(255,255,255),alpha=1.0,rough=.35,metal=.02,tex=None):
    return PBRMaterial(name=name,baseColorFactor=[*col,int(alpha*255)],
        baseColorTexture=tex,metallicFactor=metal,roughnessFactor=rough,
        alphaMode='BLEND' if alpha<.999 or (tex is not None and tex.mode=='RGBA') else 'OPAQUE',
        doubleSided=True)
PURP=rgba_mat('smoked lavender translucent polycarbonate',(134,91,207),.47,.19,.03)
PURP_EDGE=rgba_mat('light transmissive purple rim',(168,125,224),.75,.21,.03)
PURP_GLOSS=rgba_mat('shiny lavender molding',(157,104,211),.88,.16,.08)
PURP_BLACK=rgba_mat('violet dark PCB coat',(48,38,69),1,.59)
DARK=rgba_mat('molded near-black rubber',(20,21,27),1,.77)
DARK_SOFT=rgba_mat('fine-grain rubber',(36,36,44),1,.87)
BORDER=rgba_mat('glass bezel',(13,12,21),1,.2,.18)
GLASS=rgba_mat('smoked glass',(92,91,111),.31,.07,.08)
METAL=rgba_mat('polished connector trim',(146,150,164),1,.22,.8)
SILV=rgba_mat('satin detail',(174,165,196),1,.34,.44)
PCB=rgba_mat('dark purple circuit board',(58,53,84),1,.65)
LED=rgba_mat('blue status LED',(45,206,255),1,.13)

def add(mesh,name,mat,pos=(0,0,0)):
    mesh=mesh.copy();mesh.apply_translation(pos)
    mesh.visual=TextureVisuals(material=mat)
    scene.add_geometry(mesh,geom_name=name,node_name=name)

def rounded_outline(w,h,r,steps=16):
    p=[]
    for cx,cy,a,b in [(w/2-r,h/2-r,0,90),(-w/2+r,h/2-r,90,180),(-w/2+r,-h/2+r,180,270),(w/2-r,-h/2+r,270,360)]:
        for i in range(steps+1):
            ang=math.radians(a+(b-a)*i/steps)
            p.append((cx+r*math.cos(ang),cy+r*math.sin(ang)))
    return np.asarray(p)

def loft(name,layers,mat):
    # (w, h, r, z) rings and caps, smooth shading through vertex normals
    rings=[np.column_stack([rounded_outline(w,h,r),np.full(len(rounded_outline(w,h,r)),z)]) for w,h,r,z in layers]
    n=len(rings[0]);v=np.vstack(rings);f=[]
    for k in range(len(rings)-1):
        for i in range(n):
            j=(i+1)%n
            f.extend([(k*n+i,k*n+j,(k+1)*n+j),(k*n+i,(k+1)*n+j,(k+1)*n+i)])
    v=np.vstack([v,np.array([[0,0,layers[0][3]],[0,0,layers[-1][3]]])]);b=len(layers)*n
    for i in range(n):
        j=(i+1)%n;f.append((b,j,i));f.append((b+1,(len(layers)-1)*n+i,(len(layers)-1)*n+j))
    m=trimesh.Trimesh(vertices=v,faces=np.asarray(f),process=False)
    trimesh.repair.fix_normals(m)
    add(m,name,mat)

# side shell, layered seams + reliable thickness (not featureless slab)
loft('front_translucent_sidewall',[(2.42,4.01,.205,-.167),(2.54,4.13,.231,-.14),(2.57,4.18,.245,-.084),(2.57,4.18,.245,.111),(2.54,4.15,.243,.170)],PURP)
loft('back_translucent_rear_wall',[(2.53,4.14,.233,-.243),(2.57,4.18,.245,-.189),(2.56,4.17,.241,-.151)],PURP_EDGE)
loft('front_highlight_rim',[(2.56,4.18,.245,.159),(2.49,4.11,.224,.179),(2.48,4.10,.222,.183)],PURP_GLOSS)
# interior dark chassis; a flat distinct removable layer
loft('middle_frame',[(2.36,3.96,.188,-.125),(2.38,3.98,.188,.08)],PURP_BLACK)

# Photo masks: visually trustworthy at front and rear instead of guessed flat buttons
# oversample mask edges to avoid serrated edges in the glTF alpha texture
front=SRC_F.copy()
mask=Image.new('L',(TW,TH),0); md=ImageDraw.Draw(mask)
md.rounded_rectangle([1,1,TW-2,TH-2],radius=55,fill=255)
# screen removed from shell texture and made into its own piece
md.rounded_rectangle([292-273,54-39,952-273,593-39],radius=39,fill=0)
# front button voids (approximate based on generated reference pixels)
controls=[('X',833,673,43),('Y',768,743,45),('A',900,739,46),('B',833,813,46),
          ('select',563,891,36),('start',683,891,36),('fn',623,819,42),
          ('stickL',408,979,99),('stickR',830,979,101)]
for name,x,y,r in controls:
    cx,cy=x-273,y-39;md.ellipse([cx-r,cy-r,cx+r,cy+r],fill=0)
md.rounded_rectangle([307-273,637-39,511-273,845-39],radius=32,fill=0)
front.putalpha(mask.filter(ImageFilter.GaussianBlur(.72)))
front.save(tex_dir/'front_shell_with_cutouts.png')

def textured_plane(name,tex,x0,x1,y0,y1,z,reverse=False):
    # x,y bounds in model space. World orientation of back face reversed to match rear-facing view.
    v=np.array([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],float)
    if reverse:
        # screenshot left corresponds world right when facing rear camera
        v=np.array([[x1,y0,z],[x0,y0,z],[x0,y1,z],[x1,y1,z]],float)
    faces=np.array([[0,1,2],[0,2,3]]) if not reverse else np.array([[0,2,1],[0,3,2]])
    m=trimesh.Trimesh(vertices=v,faces=faces,process=False)
    # all source photos are oriented upright in standard UV placement
    m.visual=TextureVisuals(uv=np.array([[0,0],[1,0],[1,1],[0,1]],float),material=rgba_mat(name+' texture',tex=tex,rough=.31))
    scene.add_geometry(m,geom_name=name,node_name=name)

textured_plane('front_shell_photo',front,-W/2,W/2,-H/2,H/2,.194)
# screen material cut directly from front photo; full bezel, crisp 1:1 source
screen=SRC_F.crop((292-273,54-39,952-273,593-39))
sm=Image.new('L',screen.size,0); ImageDraw.Draw(sm).rounded_rectangle([1,1,*[p-1 for p in screen.size]],radius=40,fill=255)
screen.putalpha(sm.filter(ImageFilter.GaussianBlur(.55)))
screen.save(tex_dir/'screen.png')
# screen physical backing, raised proud of front shell
loft('screen_bezel_depth',[(2.40,1.94,.15,.182),(2.43,1.98,.15,.226)],BORDER) if False else None
# use minimal front-side depth-recess geometry below photo screen
# crop coordinate = 292..952, 54..593
textured_plane('screen_image_and_bezel',screen,sx(292),sx(952),sy(593),sy(54),.245)
# an inner glass film to catch reflections: faint translucent strip on top edge

def torus(name,major,minor,z,x,y,mat):
    # ring lies parallel to XY plane
    theta=np.linspace(0,2*np.pi,65,endpoint=False);phi=np.linspace(0,2*np.pi,13,endpoint=False)
    v=[];f=[]
    for a in theta:
        for b in phi:
            r=major+minor*math.cos(b)
            v.append((x+r*math.cos(a),y+r*math.sin(a),z+minor*math.sin(b)))
    for i in range(len(theta)):
        for j in range(len(phi)):
            a=i*len(phi)+j;b=((i+1)%len(theta))*len(phi)+j;c=((i+1)%len(theta))*len(phi)+(j+1)%len(phi);d=i*len(phi)+(j+1)%len(phi)
            f.extend([(a,b,c),(a,c,d)])
    mesh=trimesh.Trimesh(vertices=v,faces=f,process=False);mesh.fix_normals();add(mesh,name,mat)

def cyl(name,x,y,z,r,depth,mat,sections=64):
    add(trimesh.creation.cylinder(radius=r,height=depth,sections=sections),name,mat,(x,y,z))

def mesh_box(name,w,h,d,at,mat,r=.03):
    # rounded box with straight extrusion, bevel seam visually drawn by layers
    arr=rounded_outline(w,h,min(r,w/2-.001,h/2-.001));n=len(arr)
    v=np.vstack([np.column_stack([arr,np.full(n,-d/2)]),np.column_stack([arr,np.full(n,d/2)]),[[0,0,-d/2],[0,0,d/2]]]);f=[]
    for i in range(n):
        j=(i+1)%n;f.extend([(i,j,n+j),(i,n+j,n+i),(2*n,j,i),(2*n+1,n+i,n+j)])
    m=trimesh.Trimesh(vertices=v,faces=np.asarray(f),process=False);m.fix_normals();add(m,name,mat,at)

# Pseudo PCB visible through face cutouts or along sides, clearly decorative/not verified internals
mesh_box('middle_pcb',2.20,3.8,.034,(0,0,.080),PCB,.18)
for k,(x,y) in enumerate([(-.65,1.2),(.69,1.3),(-.2,.45),(.27,.3),(-.62,-1.1),(.63,-1.15),(-.15,-1.65)]):
    mesh_box('middle_electronic_chip_%02d'%k,.29+random.random()*.10,.27+random.random()*.10,.046,(x,y,.125),DARK_SOFT,.02)
# screen's rear dark assembly when floated
mesh_box('screen_panel_body',2.32,1.93,.058,(0,.91,.213),BORDER,.12)

# face controls: true 3D embossed shapes with photo textures on top; each named
# type controls_ groups are animatable separately
for label,x,y,r in controls:
    xx,yy=sx(x),sy(y)
    if label.startswith('stick'):
        torus('controls_'+label+'_polycarbonate_ring',r*W/700*.84,.021,.254,xx,yy,PURP_GLOSS)
        cyl('controls_'+label+'_socket',xx,yy,.274,r*W/700*.86,.095,DARK_SOFT)
        cyl('controls_'+label+'_shaft',xx,yy,.330,r*W/700*.65,.114,DARK)
        cyl('controls_'+label+'_rubber_cap',xx,yy,.395,r*W/700*.72,.050,DARK_SOFT)
        torus('controls_'+label+'_rubber_grip',r*W/700*.65,.009,.419,xx,yy,DARK)
        z=.438
    elif label in 'XYAB':
        cyl('controls_'+label+'_support',xx,yy,.252,r*W/700*.94,.075,DARK)
        cyl('controls_'+label+'_rounded_button',xx,yy,.300,r*W/700*.82,.055,DARK_SOFT)
        z=.338
    else:
        cyl('controls_'+label+'_button_plunger',xx,yy,.255,r*W/700*.87,.065,DARK)
        z=.297
    localr=r+4
    patch=SRC_F.crop((x-localr-273,y-localr-39,x+localr-273,y+localr-39))
    alpha=Image.new('L',patch.size,0)
    ImageDraw.Draw(alpha).ellipse([5,5,patch.size[0]-6,patch.size[1]-6],fill=255)
    patch.putalpha(alpha.filter(ImageFilter.GaussianBlur(1)))
    patch.save(tex_dir/('ctrl_'+label+'.png'))
    size=(localr*2)*W/700
    textured_plane('controls_'+label+'_photo',patch,xx-size/2,xx+size/2,yy-size/2,yy+size/2,z)

# Dpad cross physical body and texture silhouette
c_x,c_y=sx(408),sy(741)
mesh_box('controls_dpad_vertical',.21,.70,.090,(c_x,c_y,.288),DARK,.035)
mesh_box('controls_dpad_horizontal',.70,.21,.095,(c_x,c_y,.294),DARK,.035)
patch=SRC_F.crop((301-273,634-39,515-273,848-39))
alpha=Image.new('L',patch.size,0);a=ImageDraw.Draw(alpha)
# union of vertical and horizontal parts
middle=patch.size[0]/2; w=65
# mask with overlapping rects
ImageDraw.Draw(alpha).rounded_rectangle([middle-w/2,4,middle+w/2,patch.size[1]-4],radius=10,fill=255)
ImageDraw.Draw(alpha).rounded_rectangle([4,middle-w/2,patch.size[0]-4,middle+w/2],radius=10,fill=255)
patch.putalpha(alpha.filter(ImageFilter.GaussianBlur(.8)))
patch.save(tex_dir/'dpad.png')
textured_plane('controls_dpad_photo',patch,sx(301),sx(515),sy(848),sy(634),.350)

# center grille is part of front shell, but add physical silver edges
for j in range(3):
    mesh_box('controls_middle_ridge_%d'%j,.33,.018,.008,(0,sy(649+j*25),.222),PURP_GLOSS,.006)
cyl('controls_status_led',sx(623),sy(890),.235,.018,.016,LED)

# back image and the 4 triggers, with individually floating pieces
back=SRC_B.copy()
backmask=Image.new('L',(TW,TH),0);bd=ImageDraw.Draw(backmask)
bd.rounded_rectangle([1,1,TW-2,TH-2],radius=52,fill=255)
# rear image source approximate triggers bounds in its pixel space
BTRIG=[(308,355,448,519),(460,354,606,519),(654,354,791,519),(808,354,954,519)]
# adjust coords to crop-relative coords: back has x from 275 y from39
for x1,y1,x2,y2 in BTRIG:
    bd.rounded_rectangle([x1-275,y1-39,x2-275,y2-39],radius=16,fill=0)
back.putalpha(backmask.filter(ImageFilter.GaussianBlur(.65)))
back.save(tex_dir/'back_shell_with_cutouts.png')
textured_plane('back_shell_photo',back,-W/2,W/2,-H/2,H/2,-.249,reverse=True)
for j,(x1,y1,x2,y2) in enumerate(BTRIG):
    # rear camera-left maps to model world-right
    xm=-(x1+x2-2*275)/(2*696)*W+W/2
    ym=H/2-(y1+y2-2*39)/(2*1138)*H
    ww=(x2-x1)/696*W;hh=(y2-y1)/1138*H
    mesh_box(f'back_trigger_{j}_base',ww*.96,hh*.91,.135,(xm,ym,-.294),DARK,.105)
    mesh_box(f'back_trigger_{j}_top',ww*.93,hh*.85,.049,(xm,ym,-.380),DARK_SOFT,.09)
    photo=SRC_B.crop((x1-275,y1-39,x2-275,y2-39))
    alph=Image.new('L',photo.size,0);ImageDraw.Draw(alph).rounded_rectangle([2,2,photo.width-2,photo.height-2],radius=18,fill=255)
    photo.putalpha(alph.filter(ImageFilter.GaussianBlur(1)))
    textured_plane(f'back_trigger_{j}_photo',photo,xm-ww/2,xm+ww/2,ym-hh/2,ym+hh/2,-.411,reverse=True)

# Rear cover molded seams, vents and screws (some features decorative)
for i in range(14):
    yy=-.15-i*.057
    mesh_box(f'back_rear_vent_{i}',1.70,.009,.009,(0,yy,-.255),PURP_GLOSS,.003)
for i,(x,y) in enumerate([(-1.02,1.86),(1.02,1.86),(-1.02,-1.86),(1.02,-1.86)]):
    cyl(f'back_corner_screw_{i}',x,y,-.277,.026,.012,METAL)

# Side details refer to fuzzy supplier photos, please do not imply precise port mapping.
# side window and black slider on right from user's crop
mesh_box('side_right_power_slider',.038,.32,.16,(W/2+.017,1.02,.015),DARK,.018)
mesh_box('side_right_slot',.032,.10,.055,(W/2+.025,-.45,-.01),DARK,.010)
mesh_box('side_left_moulding',.025,.58,.09,(-W/2-.01,.53,-.013),PURP_GLOSS,.009)
# minor internal board edge exposed via transparent side
mesh_box('middle_visible_side_edge',.048,2.9,.11,(W/2-.10,-.15,-.003),PCB,.012)
for i in range(10):
    mesh_box(f'middle_edge_component_{i}',.034,.035,.019,(W/2-.088,-1.15+i*.20,.053),METAL,.005)

# Bottom USB-C ports, headphone; conceptual since exact geometry unverified
for i,x in enumerate([-.54,.54]):
    # front-facing port holes oriented along lower side, axis Y
    shell=trimesh.creation.box(extents=(.32,.019,.085))
    add(shell,f'bottom_connector_{i}_outer',METAL,(x,-H/2-.005,-.013))
    add(trimesh.creation.box(extents=(.225,.021,.043)),f'bottom_connector_{i}_cavity',DARK,(x,-H/2-.017,-.010))
# cylinder rotated from z-axis to y-axis
jack=trimesh.creation.cylinder(.071,.019,sections=36)
jack.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
add(jack,'bottom_headphone_jack',DARK,(0,-H/2-.019,-.013))

OUT.write_bytes(trimesh.exchange.gltf.export_glb(scene,include_normals=True))
print('Created:',OUT, 'size MB',round(OUT.stat().st_size/1024**2,2),'meshes',len(scene.geometry))
