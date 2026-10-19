# add named sea lochs / bays (OSM natural=bay areas) to a region's map data as water, for coasts where the
# elevation data misses narrow sea lochs
import json, sys, time, urllib.request, urllib.parse
reg = json.load(open(sys.argv[1]))[0]; f = 'data/%s/osm.json' % reg['id']
W, S, E, N = reg['bbox']; bb = '%f,%f,%f,%f' % (S, W, N, E)
q = '[out:json][timeout:120];(way["natural"="bay"]["name"](%s);relation["natural"="bay"]["name"](%s););out geom;' % (bb, bb)
for url in ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
    try:
        r = json.load(urllib.request.urlopen(urllib.request.Request(url, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': 'eden-maps/1.0'}), timeout=180)); break
    except Exception as e: print('overpass', url, e); r = {'elements': []}
els = r.get('elements', [])
print('bays:', [(e['type'], e.get('tags', {}).get('name')) for e in els])
d = json.load(open(f))
for e in els:
    e.setdefault('tags', {})['natural'] = 'water'
    if e['type'] == 'way' and e.get('geometry') and (e['geometry'][0]['lat'], e['geometry'][0]['lon']) != (e['geometry'][-1]['lat'], e['geometry'][-1]['lon']): continue
    d['elements'].append(e)
json.dump(d, open(f, 'w'))
