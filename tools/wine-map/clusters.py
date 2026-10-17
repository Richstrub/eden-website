#!/usr/bin/env python3
"""Eden wine maps: group producers into map regions.

Producers close enough to share one map (it stays at most MAX_KM across) are grouped; each group gets a 3:2 map area
centred on its producers with room around them. Titles come from the most common "mapRegion" in the group; edit
regions.json afterwards for nicer titles, the line under the title ("sub") and sea names, then run fetch_data.py and
region_maps.py.

Usage: python3 tools/wine-map/clusters.py points.json regions.json
  points.json: [{"id": "...", "lat": .., "lng": .., "mapRegion": "...", "sub": "..."}]
  Writes regions.json and adds "region" to each point in points.json.
"""
import json, math, sys
from collections import Counter

MAX_KM, MIN_KM, PAD = 150, 64, 1.45


def km_span(pts):
  lat0 = sum(p['lat'] for p in pts) / len(pts)
  xs = [p['lng'] * 111.32 * math.cos(math.radians(lat0)) for p in pts]; ys = [p['lat'] * 110.57 for p in pts]
  return max(xs) - min(xs), max(ys) - min(ys)


def width_needed(pts):
  w, h = km_span(pts)
  return max(w, h * 1.5) * PAD + 18


def slug(s):
  import unicodedata, re
  s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
  return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def main():
  pts = json.load(open(sys.argv[1]))
  groups = []
  for p in sorted(pts, key=lambda p: (p.get('mapRegion', ''), p['lat'])):
    best = None
    for g in groups:
      wn = width_needed(g + [p])
      if wn <= MAX_KM and (best is None or wn < best[0]): best = (wn, g)
    if best: best[1].append(p)
    else: groups.append([p])
  regions, used = [], set()
  for g in groups:
    title = Counter(p.get('mapRegion', '') for p in g).most_common(1)[0][0] or 'Where it’s made'
    sub = Counter(p.get('sub', '') for p in g).most_common(1)[0][0]
    rid = slug(title) or 'region'
    k = 2
    while rid in used: rid = slug(title) + f'-{k}'; k += 1
    used.add(rid)
    lat0 = (max(p['lat'] for p in g) + min(p['lat'] for p in g)) / 2
    lng0 = (max(p['lng'] for p in g) + min(p['lng'] for p in g)) / 2
    wkm = max(MIN_KM, width_needed(g)); hkm = wkm / 1.5
    dlng = wkm / (111.32 * math.cos(math.radians(lat0))); dlat = hkm / 110.57
    # nudge so no producer sits under the title box (top-left corner)
    W, E, S, N = lng0 - dlng / 2, lng0 + dlng / 2, lat0 - dlat / 2, lat0 + dlat / 2
    for p in g:
      fx, fy = (p['lng'] - W) / dlng, (N - p['lat']) / dlat
      if fx < 0.25 and fy < 0.2: W -= dlng * (0.25 - fx); E -= dlng * (0.25 - fx)
    regions.append({'id': rid, 'title': title, 'sub': sub, 'bbox': [round(W, 5), round(S, 5), round(E, 5), round(N, 5)], 'members': [p['id'] for p in g]})
    for p in g: p['region'] = rid
  json.dump(regions, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
  json.dump(pts, open(sys.argv[1], 'w'), indent=1, ensure_ascii=False)
  for r in regions: print(r['id'], len(r['members']), r['bbox'])


if __name__ == '__main__':
  main()
