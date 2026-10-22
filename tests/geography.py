import json,struct,math
from pathlib import Path
r=Path(__file__).resolve().parents[1]
s=(r/'assets/garda-lake-data.js').read_text();d=json.loads(s[len('window.GardaLakeData='):-2])
assert len(d['outer'])>1000
assert d['outer'][0]==d['outer'][-1]
assert len(d['holes'])>=5
assert len(d['depths'])==d['nx']*d['ny']
def inside(lon,lat,ring):
 hit=False
 for a,b in zip(ring,ring[1:]):
  if (a[1]>lat)!=(b[1]>lat) and lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0]:hit=not hit
 return hit
def water(lon,lat):return inside(lon,lat,d['outer']) and not any(inside(lon,lat,h) for h in d['holes'])
assert not water(10.609,45.486),'Sirmione peninsula must remain land'
assert water(10.591,45.49),'Water west of Sirmione must remain lake'
assert water(10.54,45.602),'Salò gulf must remain lake'
assert not water(10.49,45.70)
assert all(-1<=z<=346 for z in d['depths'])
blob=(r/'assets/lake-garda-v6.glb').read_bytes();magic,version,length=struct.unpack('<III',blob[:12]);assert magic==0x46546c67 and version==2 and length==len(blob)
n,kind=struct.unpack('<II',blob[12:20]);gltf=json.loads(blob[20:20+n]);assert len(gltf['meshes'][0]['primitives'])==2
assert gltf['meshes'][0]['primitives'][1]['mode']==1,'3D contour lines must be included'
assert not d['surveyedDepths']
print('Coast, Sirmione, islands, depth grid and shared 3D geometry checks passed.')
