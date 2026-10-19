# Sea from OpenStreetMap's coastline: draw the coastline, then flood-fill the sea from a point in open water.
# Used where the elevation data misses narrow sea lochs. Writes data/<id>/sea.npy (True = sea).
import json, sys, urllib.request, urllib.parse, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, 'tmp'); import region_maps as rm
reg = json.load(open(sys.argv[1]))[0]
W, S, E, N = reg['bbox']; pad = 0.05; bb = '%f,%f,%f,%f' % (S - pad, W - pad, N + pad, E + pad)
q = '[out:json][timeout:180];way["natural"="coastline"](%s);out geom;' % bb
r = None
for url in ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
    try: r = json.load(urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': 'eden-maps/1.0'}), timeout=240)); break
    except Exception as e: print('overpass', url, e)
ways = [e for e in (r or {}).get('elements', []) if e.get('geometry')]
print('coastline ways:', len(ways))
im = Image.new('L', (rm.W_PX, rm.H_PX), 0); d = ImageDraw.Draw(im)
for w in ways:
    pts = [rm.proj(reg, p['lat'], p['lon']) for p in w['geometry']]
    d.line(pts, fill=255, width=3)
wall = np.asarray(im) > 0
lab, n = ndimage.label(~wall)
seeds = reg.get('sea_seeds', [])
sea = np.zeros_like(wall)
for la, ln in seeds:
    x, y = rm.proj(reg, la, ln); k = lab[int(y), int(x)]
    if k: sea |= lab == k
sea |= ndimage.binary_dilation(sea, iterations=2) & wall   # the coastline itself belongs to the sea side
print('sea share: %.3f' % sea.mean())
np.save('data/%s/sea.npy' % reg['id'], sea)
