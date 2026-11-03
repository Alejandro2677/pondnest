"""Render GLB to front/back PNG for design review (requires VTK + Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import vtk
import tempfile

root=Path(__file__).resolve().parents[1]
source=root/'public/models/gamegaga-r36hd-prototype.glb'
output=root/'public/models/preview-r36hd-prototype.png'

renderer=vtk.vtkRenderer();renderer.SetBackground(.035,.038,.055)
window=vtk.vtkRenderWindow();window.OffScreenRenderingOn();window.AddRenderer(renderer);window.SetSize(700,780)
imp=vtk.vtkGLTFImporter();imp.SetFileName(str(source));imp.SetRenderWindow(window);imp.Update()
light=vtk.vtkLight();light.SetLightTypeToSceneLight();light.SetPosition(2,8,12);light.SetFocalPoint(0,0,0);light.SetIntensity(1.5);renderer.AddLight(light)
fill=vtk.vtkLight();fill.SetLightTypeToSceneLight();fill.SetPosition(-5,0,-10);fill.SetFocalPoint(0,0,0);fill.SetIntensity(1.2);renderer.AddLight(fill)
images=[]
for xyz in [(3,-1,10),(3,-1,-10)]:
    cam=renderer.GetActiveCamera()
    cam.SetPosition(*xyz);cam.SetFocalPoint(0,0,0);cam.SetViewUp(0,1,0);cam.SetViewAngle(35)
    renderer.ResetCameraClippingRange();window.Render()
    capture=vtk.vtkWindowToImageFilter();capture.SetInput(window);capture.Update()
    with tempfile.NamedTemporaryFile(suffix='.png') as t:
        out=vtk.vtkPNGWriter();out.SetFileName(t.name);out.SetInputConnection(capture.GetOutputPort());out.Write()
        images.append(Image.open(t.name).convert('RGB').copy())

def font(size,bold=False):
    p='/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if bold else '')+'.ttf'
    return ImageFont.truetype(p,size)
canvas=Image.new('RGB',(1440,940),(11,12,19))
d=ImageDraw.Draw(canvas)
d.text((52,26),'PondNest   /   R36 HD',font=font(31,True),fill='#FFFFFF')
d.text((53,74),'Primer modelo 3D basado en fotografías del proveedor',font=font(17),fill='#A6A3B1')
for i,im in enumerate(images):
    x=18+i*710
    canvas.paste(im,(x,125))
    d=ImageDraw.Draw(canvas)
    d.text((x+36,858),['FRONTAL · 3D','TRASERA · 3D'][i],font=font(20,True),fill='#EBE6F5')
    d.text((x+36,897),'PROTOTIPO · DETALLES POR VERIFICAR',font=font(14),fill='#8F899B')
canvas.save(output,optimize=True)
print('Preview:',output,output.stat().st_size)
