#!/usr/bin/env python3
"""Eden wine maps: download what tools/wine-map/region_maps.py needs for each region in regions.json.

  tiles/   AWS Terrain Tiles (Terrarium PNGs), zoom chosen to suit the region's size
  osm.json OpenStreetMap rivers, towns and villages, and named lakes, from the Overpass API

Usage: python3 tools/wine-map/fetch_data.py regions.json <data folder>      (needs internet; standard library only)
Map data © OpenStreetMap contributors (ODbL). Elevation: Mapzen / AWS Terrain Tiles.
"""
import json, math, os, sys, time, urllib.request, urllib.parse

UA = {'User-Agent': 'eden-wine-maps/1.0 (edencny.com)'}
OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']


def zoom_for(bbox, width=2400):
  W, S, E, N = bbox
  m_px = (E - W) * 111320 * math.cos(math.radians((S + N) / 2)) / width
  for z in range(13, 5, -1):
    tile_m = 156543.03 * math.cos(math.radians((S + N) / 2)) / 2 ** z
    if tile_m >= m_px * 0.75: return z
  return 6


def tiles(bbox, z):
  W, S, E, N = bbox
  def tx(l): return int((l + 180) / 360 * 2 ** z)
  def ty(a):
    r = math.radians(a); return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z)
  return [(x, y) for x in range(tx(W), tx(E) + 1) for y in range(ty(N), ty(S) + 1)]


def get(url, data=None, tries=4, timeout=180):
  for k in range(tries):
    try:
      req = urllib.request.Request(url, data=data, headers=UA)
      return urllib.request.urlopen(req, timeout=timeout).read()
    except Exception as e:
      print('  retry', k + 1, url[:90], e); time.sleep(4 * (k + 1))
  return None


def main():
  regions = json.load(open(sys.argv[1])); root = sys.argv[2]
  for r in regions:
    W, S, E, N = r['bbox']; pad = 0.03
    d = os.path.join(root, r['id']); os.makedirs(os.path.join(d, 'tiles'), exist_ok=True)
    z = r.get('z') or zoom_for(r['bbox']); r['z'] = z
    tl = tiles((W - pad, S - pad, E + pad, N + pad), z)
    print(r['id'], 'zoom', z, len(tl), 'tiles')
    def one(t):
      x, y = t; f = os.path.join(d, 'tiles', f'{z}_{x}_{y}.png')
      if os.path.exists(f): return
      b = get(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png')
      if b: open(f, 'wb').write(b)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(16) as ex: list(ex.map(one, tl))
    if os.path.exists(os.path.join(d, 'osm.json')): continue
    bb = f'{S - pad},{W - pad},{N + pad},{E + pad}'
    q = (f'[out:json][timeout:180];('
         f'way["waterway"="river"]({bb});'
         f'node["place"~"^(city|town|village)$"]["name"]({bb});'
         f'way["natural"="water"]["name"]({bb});'
         f'relation["natural"="water"]["name"]({bb});'
         f');out geom;')
    for host in OVERPASS:
      b = get(host, urllib.parse.urlencode({'data': q}).encode(), tries=2)
      if b and b.lstrip().startswith(b'{'):
        open(os.path.join(d, 'osm.json'), 'wb').write(b); break
      time.sleep(5)
    time.sleep(3)
  json.dump(regions, open(os.path.join(root, 'regions-z.json'), 'w'), indent=1)


if __name__ == '__main__':
  main()
