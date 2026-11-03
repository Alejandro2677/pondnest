"""Generate a quick, non-photorealistic preview of the GLB, no WebGL needed."""
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import trimesh
import numpy as np
import math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
sc=trimesh.load(root/'public/models/gamegaga-r36hd-prototype.glb',force='scene')
W,H=1450,900
img=Image.new('RGB',(W,H),(10,11,18)); draw=ImageDraw.Draw(img)
for y in range(H):
    t=y/H
    draw.line((0,y,W,y), fill=(int(12+t*6),int(12+t*4),int(20+t*8)))
for cx in [365,1085]:
    glow=Image.new('RGBA',(W,H))
    gd=ImageDraw.Draw(glow)
    gd.ellipse((cx-250,190,cx+250,730),fill=(100,62,155,55))
    glow=glow.filter(ImageFilter.GaussianBlur(75))
    img=Image.alpha_composite(img.convert('RGBA'),glow).convert('RGB')

fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(fontpath,32)
fontsmall=ImageFont.truetype(fontpath,18)
mat_col={}
meshes=sc.dump()
print('preview meshes',len(meshes),'triangles',sum(len(m.faces) for m in meshes))
for ci,(yaw,cx) in enumerate([(0.24,364),(2.86,1084)]):
    ca,sa=np.cos(yaw),np.sin(yaw)
    ry=np.array([[ca,0,sa],[0,1,0],[-sa,0,ca]])
    rx=np.array([[1,0,0],[0,.991,-.134],[0,.134,.991]])
    R=rx@ry
    polys=[]
    for m in meshes:
        if not isinstance(m, trimesh.Trimesh) or len(m.faces)==0: continue
        fc=m.visual.material.baseColorFactor if getattr(m.visual,'material',None) else [130,130,135,255]
        if fc is None: fc=[130,130,135,255]
        if isinstance(fc[0],float) and max(fc)<=1: col=np.array(fc[:3])*255
        else: col=np.array(fc[:3],float)
        alpha=fc[3]/255 if len(fc)>3 else 1
        vs=(m.vertices@R.T)
        tri=vs[m.faces]
        n=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
        norm=np.linalg.norm(n,axis=1)+1e-8
        lit=np.clip((n@np.array([-.32,.55,.76]))/norm,0,1)
        # Face order painter, alpha approximated by tinting lavender to avoid expensive framebuffer blends.
        rgb=np.clip(col[None,:]*(.56+.44*lit[:,None])+(alpha<.99)*np.array([28,21,38])*(1-alpha),0,255).astype('uint8')
        depth=tri[:,:,2].mean(axis=1)
        for j in range(len(tri)):
            t=tri[j]
            # perspective, avoid extreme stretching
            z=8-t[:,2]
            p=np.column_stack((cx+ t[:,0]*152*(8/z),H/2-t[:,1]*152*(8/z)))
            polys.append((float(depth[j]), p.tolist(), tuple(int(v) for v in rgb[j])))
    polys.sort(key=lambda a:a[0])
    d=ImageDraw.Draw(img)
    for dep,p,color in polys:
        d.polygon([tuple(v) for v in p],fill=color)
    heading='VISTA FRONTAL · PROTOTIPO' if ci==0 else 'VISTA TRASERA · PROTOTIPO'
    d.text((cx-225,45),heading,font=fontsmall,fill=(205,202,219))
    d.text((cx-220,792),'Gamegaga R36 HD',font=font,fill=(244,237,251))
    d.text((cx-220,844),'Modelo aproximado, no réplica exacta',font=fontsmall,fill=(153,148,163))
img.save(root/'public/models/preview-r36hd-prototype.png',optimize=True)
print(root/'public/models/preview-r36hd-prototype.png')
