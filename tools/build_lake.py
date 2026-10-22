"""Build a shared geographic mesh for the Garda 2D and 3D views.
Coastline: OSM relation 8569, ODbL. Bathymetry: explicit schematic surface,
not a survey, guided by supplied chart references. Preserve source metadata.
"""
import os
os.environ['MPLCONFIGDIR']='/tmp/garda-mpl'
import json,math,struct
from pathlib import Path
import numpy as np
from matplotlib.path import Path as MPath
from matplotlib.tri import Triangulation
ROOT=Path(__file__).resolve().parents[1]
d=json.loads((ROOT/'tools/garda-osm-source.json').read_text())
nodes={e['id']:[e['lon'],e['lat']] for e in d['elements'] if e['type']=='node'}
ways={e['id']:e for e in d['elements'] if e['type']=='way'}
relation=next(e for e in d['elements'] if e['type']=='relation' and e['id']==8569)
def chains(role):
 segments=[ways[m['ref']]['nodes'][:] for m in relation['members'] if m['type']=='way' and m['role']==role]
 rings=[]
 while segments:
  chain=segments.pop()
  while chain[0]!=chain[-1]:
   found=False
   for i,seg in enumerate(segments):
    if chain[-1]==seg[0]:chain+=seg[1:]
    elif chain[-1]==seg[-1]:chain+=seg[-2::-1]
    elif chain[0]==seg[-1]:chain=seg[:-1]+chain
    elif chain[0]==seg[0]:chain=seg[:0:-1]+chain
    else:continue
    segments.pop(i);found=True;break
   if not found:raise ValueError('Open OSM boundary')
  rings.append(np.array([nodes[n] for n in chain]))
 return rings
outer=max(chains('outer'),key=len)
holes=chains('inner')
# Polyline simplification in local kilometres, retaining coastline peninsulas.
scale=np.array([111.32*math.cos(math.radians(45.66)),111.32])
def simplify(p,tol=.012):
 if len(p)<3:return p
 a,b=p[0]*scale,p[-1]*scale
 line=b-a
 dist=np.linalg.norm((p*scale-a)-np.outer(np.clip(((p*scale-a)@line)/(line@line+1e-20),0,1),line),axis=1)
 k=int(np.argmax(dist))
 if dist[k]>tol:return np.vstack([simplify(p[:k+1],tol)[:-1],simplify(p[k:],tol)])
 return p[[0,-1]]
# Split a closed ring at a distant point before RDP.
def closed_simplify(p,tol):
 k=len(p)//2
 return np.vstack([simplify(p[:k+1],tol)[:-1],simplify(p[k:],tol)])
outer=closed_simplify(outer,.012)
holes=[closed_simplify(h,.004) for h in holes]
paths=[MPath(outer)]+[MPath(h) for h in holes]
def in_lake(p):
 inside=paths[0].contains_points(p)
 for path in paths[1:]:inside&=~path.contains_points(p)
 return inside
allp=np.vstack([outer,*holes]);bounds=[float(outer[:,0].min()),float(outer[:,1].min()),float(outer[:,0].max()),float(outer[:,1].max())]
origin=np.array([10.69,45.66])
segments=[]
for ring in [outer,*holes]:
 segments.extend(zip((ring[:-1]-origin)*scale,(ring[1:]-origin)*scale))
def distance(p):
 q=(p-origin)*scale;best=np.full(len(q),1e6)
 for a,b in segments:
  v=b-a;t=np.clip(((q-a)@v)/(v@v+1e-20),0,1)
  best=np.minimum(best,np.linalg.norm(q-a-t[:,None]*v,axis=1))
 return best

def line_dist(p,a,b):
 q=(p-origin)*scale;a=(np.array(a)-origin)*scale;b=(np.array(b)-origin)*scale;v=b-a
 t=np.clip(((q-a)@v)/(v@v),0,1)
 return np.linalg.norm(q-a-t[:,None]*v,axis=1)
def bathy(p):
 lon,lat=p.T;shore=distance(p)
 northmax=np.interp(lat,[45.56,45.60,45.65,45.70,45.74,45.79,45.84,45.88],[170,250,310,346,340,310,245,80])
 westbasin=178*np.exp(-.5*((lon-10.595)/.040)**2-.5*((lat-45.535)/.052)**2)
 eastbasin=82*np.exp(-.5*((lon-10.703)/.044)**2-.5*((lat-45.535)/.059)**2)
 south=np.maximum(westbasin,eastbasin)
 blend=np.clip((lat-45.575)/.045,0,1)
 maxdepth=south*(1-blend)+northmax*blend
 coastal=np.where(lat>45.67,.18,np.where(lat<45.51,.85,.32))
 coastal=np.where((lon>10.69)&(lat<45.59),.75,coastal)
 depth=maxdepth*(1-np.exp(-shore/coastal))
 ridge=line_dist(p,[10.608,45.493],[10.675,45.583])
 ridge_strength=np.exp(-.5*(ridge/.65)**2)*np.clip((45.60-lat)/.025,0,1)
 depth=depth*(1-.78*ridge_strength)
 # Independent Salò gulf and Manerba shelves, visually matching the reference's lobes.
 salo=(lon<10.55)&(lat>45.585)&(lat<45.622)
 depth=np.where(salo,110*(1-np.exp(-shore/.19)),depth)
 manerba=np.exp(-.5*((lon-10.56)/.013)**2-.5*((lat-45.57)/.025)**2)
 depth*=1-.35*manerba
 depth=np.where(shore<.006,0,depth)
 return np.clip(depth,0,346)

nx,ny=190,300
xs=np.linspace(bounds[0],bounds[2],nx);ys=np.linspace(bounds[1],bounds[3],ny)
xx,yy=np.meshgrid(xs,ys);gridp=np.column_stack([xx.ravel(),yy.ravel()]);mask=in_lake(gridp)
z=np.full(len(gridp),-1.,dtype=float);z[mask]=bathy(gridp[mask]);grid=z.reshape(ny,nx)
shorepoints=allp[:-1]
points=np.vstack([gridp[mask],shorepoints])
# Triangulate geographic km space; reject cross-land faces using midpoints as well as centroids.
xy=(points-origin)*scale
tri=Triangulation(xy[:,0],xy[:,1]);faces=tri.triangles
valid=in_lake(points[faces].mean(axis=1))
for i,j in [(0,1),(1,2),(2,0)]:valid &= in_lake((points[faces[:,i]]+points[faces[:,j]])/2)
faces=faces[valid]
depths=bathy(points);depths[len(gridp[mask]):]=0
# A kilometre in the scene is one model unit; vertical exaggeration 8, consistent in metadata.
exaggeration=8
pos=np.column_stack([xy[:,0],-depths/1000*exaggeration,-xy[:,1]]).astype('<f4')
# Color scale shared by both map renderers: warm shallow shelves, teal, then pale deep troughs.
stops=np.array([0,3,8,20,50,100,200,346],dtype=float)
colors=np.array([[238,173,106],[247,216,125],[181,217,131],[73,198,173],[38,174,200],[58,181,206],[112,212,226],[198,242,244]],dtype=float)/255
srgb=np.column_stack([np.interp(depths,stops,colors[:,i]) for i in range(3)])
linear=np.where(srgb<=.04045,srgb/12.92,((srgb+.055)/1.055)**2.4)
color=np.column_stack([linear,np.ones(len(points))]).astype('<f4')
# Correct winding for upper lakebed surface.
v1=pos[faces[:,1]]-pos[faces[:,0]];v2=pos[faces[:,2]]-pos[faces[:,0]];cross=np.cross(v1,v2)
flip=cross[:,1]<0;faces[flip]=faces[flip][:,[0,2,1]]
norm=np.zeros_like(pos)
for f,n in zip(faces,np.cross(pos[faces[:,1]]-pos[faces[:,0]],pos[faces[:,2]]-pos[faces[:,0]])):
 for idx in f:norm[idx]+=n
norm/=np.maximum(np.linalg.norm(norm,axis=1,keepdims=True),1e-8)
indices=faces.astype('<u4').ravel()
chunks=[];views=[];accessors=[]
def add(array,typ,component):
 raw=array.tobytes();offset=sum(len(x) for x in chunks);chunks.append(raw+b'\0'*((-len(raw))%4))
 views.append({'buffer':0,'byteOffset':offset,'byteLength':len(raw)})
 a={'bufferView':len(views)-1,'componentType':component,'count':len(array),'type':typ}
 if typ=='VEC3' and len(accessors)==0:a.update(min=array.min(axis=0).tolist(),max=array.max(axis=0).tolist())
 accessors.append(a);return len(accessors)-1
pa=add(pos,'VEC3',5126);na=add(norm,'VEC3',5126);ca=add(color,'VEC4',5126);ia=add(indices,'SCALAR',5125)
# Contour segments and coastline use the identical sampled surface in 3D.
linepoints=[]
for level in [5,10,20,30,50,75,100,150,200,250,300,340]:
 for yy in range(ny-1):
  for xx in range(nx-1):
   zs=[grid[yy,xx],grid[yy,xx+1],grid[yy+1,xx+1],grid[yy+1,xx]]
   if min(zs)<0 or min(zs)>level or max(zs)<level:continue
   ps=[(xx,yy),(xx+1,yy),(xx+1,yy+1),(xx,yy+1)];hits=[]
   for i in range(4):
    j=(i+1)%4
    if (zs[i]<level)!=(zs[j]<level):
     t=(level-zs[i])/(zs[j]-zs[i]);gx=ps[i][0]+t*(ps[j][0]-ps[i][0]);gy=ps[i][1]+t*(ps[j][1]-ps[i][1])
     lon=xs[0]+gx*(xs[-1]-xs[0])/(nx-1);lat=ys[0]+gy*(ys[-1]-ys[0])/(ny-1)
     hits.append([(lon-origin[0])*scale[0],-level/1000*exaggeration+.007,-(lat-origin[1])*scale[1]])
   for i in range(0,len(hits)-1,2):linepoints.extend(hits[i:i+2])
for ring in [outer,*holes]:
 for a,b in zip(ring,ring[1:]):
  for lon,lat in [a,b]:linepoints.append([(lon-origin[0])*scale[0],.008,-(lat-origin[1])*scale[1]])
line_accessor=add(np.array(linepoints,dtype='<f4'),'VEC3',5126)
binary=b''.join(chunks)
gltf={'asset':{'version':'2.0','generator':'Garda Lure geographic mesh v6'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0}],'meshes':[{'primitives':[{'attributes':{'POSITION':pa,'NORMAL':na,'COLOR_0':ca},'indices':ia,'material':0}]}],'materials':[{'doubleSided':True,'pbrMetallicRoughness':{'metallicFactor':0,'roughnessFactor':.88},'emissiveFactor':[0,0,0]}],'buffers':[{'byteLength':len(binary)}],'bufferViews':views,'accessors':accessors}
gltf['extensionsUsed']=['KHR_materials_unlit']
gltf['materials'].append({'pbrMetallicRoughness':{'baseColorFactor':[.02,.10,.12,1]},'extensions':{'KHR_materials_unlit':{}}})
gltf['meshes'][0]['primitives'].append({'attributes':{'POSITION':line_accessor},'mode':1,'material':1})
j=json.dumps(gltf,separators=(',',':')).encode();j+=b' '*((-len(j))%4)
glb=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary
(ROOT/'assets/lake-garda-v6.glb').write_bytes(glb)
geo={'bounds':bounds,'origin':origin.tolist(),'scale':scale.tolist(),'outer':np.round(outer,7).tolist(),'holes':[np.round(h,7).tolist() for h in holes],'nx':nx,'ny':ny,'depths':np.round(grid,1).ravel().tolist(),'colorStops':stops.tolist(),'colors':(colors*255).astype(int).tolist(),'verticalExaggeration':exaggeration,'source':'OpenStreetMap contributors, relation 8569, ODbL','surveyedDepths':False}
geo['contours']=[]
for a,b in zip(linepoints[::2],linepoints[1::2]):
 if a[1]>=0:continue
 level=round((-a[1]+.007)/exaggeration*1000)
 geo['contours'].append([level,round(origin[0]+a[0]/scale[0],7),round(origin[1]-a[2]/scale[1],7),round(origin[0]+b[0]/scale[0],7),round(origin[1]-b[2]/scale[1],7)])
(ROOT/'assets/garda-lake-data.js').write_text('window.GardaLakeData='+json.dumps(geo,separators=(',',':'))+';\n')
(ROOT/'assets/geodata/lake-garda-coast.geojson').write_text(json.dumps({'type':'Feature','properties':{'source':'OpenStreetMap relation 8569','license':'ODbL'},'geometry':{'type':'Polygon','coordinates':[geo['outer'],*geo['holes']]}},separators=(',',':')))
(ROOT/'assets/lake-garda-v6-metadata.json').write_text(json.dumps({'bounds':bounds,'shorelineVertices':len(outer),'islands':len(holes),'meshVertices':len(pos),'triangles':len(faces),'verticalExaggeration':exaggeration,'origin':origin.tolist(),'scale':scale.tolist(),'depths':'schematic surface, not surveyed','coastline':'https://www.openstreetmap.org/relation/8569','license':'OpenStreetMap ODbL','reference':'User-provided IMG_9074/9075/9076'},indent=2))
print(json.dumps({'bounds':bounds,'coast':len(outer),'holes':len(holes),'vertices':len(pos),'triangles':len(faces),'glbBytes':len(glb)}))
