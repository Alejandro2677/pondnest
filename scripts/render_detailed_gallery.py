from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import vtk, tempfile
root=Path(__file__).resolve().parents[1]
source=root/'public/models/gamegaga-r36hd-detailed.glb'
output=root/'public/models/gallery-r36hd-detailed.png'
renderer=vtk.vtkRenderer();renderer.SetBackground(.035,.038,.055)
window=vtk.vtkRenderWindow();window.OffScreenRenderingOn();window.AddRenderer(renderer);window.SetSize(760,840)
imp=vtk.vtkGLTFImporter();imp.SetFileName(str(source));imp.SetRenderWindow(window);imp.Update()
for pos,intensity in [((6,9,12),1.8),((-7,-3,7),.9),((-3,5,-8),1.5)]:
    light=vtk.vtkLight();light.SetLightTypeToSceneLight();light.SetPosition(*pos);light.SetFocalPoint(0,0,0);light.SetIntensity(intensity);renderer.AddLight(light)
images=[]
for xyz in [(0,-.5,11),(7,-.5,9),(-2,-.3,-11)]:
    cam=renderer.GetActiveCamera();cam.SetPosition(*xyz);cam.SetFocalPoint(0,0,0);cam.SetViewUp(0,1,0);cam.SetViewAngle(27)
    renderer.ResetCameraClippingRange();window.Render()
    c=vtk.vtkWindowToImageFilter();c.SetInput(window);c.Update()
    with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
        writer=vtk.vtkPNGWriter();writer.SetFileName(tmp.name);writer.SetInputConnection(c.GetOutputPort());writer.Write()
        images.append(Image.open(tmp.name).convert('RGB').copy())
font=lambda s,b=False:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans'+('-Bold' if b else '')+'.ttf',s)
cnv=Image.new('RGB',(2310,1030),(11,12,19));dr=ImageDraw.Draw(cnv)
dr.text((40,27),'PondNest  /  GAMEGAGA R36 HD',font=font(34,True),fill='white')
dr.text((40,81),'Visualización 3D con referencias recreadas · modelo aproximado',font=font(18),fill='#A39AAE')
for i,im in enumerate(images):
    x=12+i*765;cnv.paste(im,(x,118));dr.text((x+34,962),['FRONTAL','3/4 · VOLUMEN','TRASERA'][i],font=font(21,True),fill='white')
cnv.save(output,optimize=True);print(output,output.stat().st_size)
