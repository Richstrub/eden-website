#!/usr/bin/env python3
# Temporary job: geocode producer addresses (Nominatim, 1 request/second) and download bottle photos.
import json, os, time, urllib.request, urllib.parse
job = json.load(open('tmp/jobs.json'))
os.makedirs('out/bottles', exist_ok=True)
UA = 'eden-wine-maps/1.0 (edencny.com)'
BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
geo = {}
for g in job.get('geocode', []):
  res = None
  for q in [g.get('address'), g.get('q2')]:
    if not q: continue
    try:
      u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'format': 'json', 'limit': 1, 'q': q})
      r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30).read())
      if r: res = {'lat': float(r[0]['lat']), 'lng': float(r[0]['lon']), 'q': q, 'display': r[0].get('display_name', ''), 'type': r[0].get('type', '')}
    except Exception as e: print('geo fail', g['id'], e)
    time.sleep(1.2)
    if res: break
  geo[g['id']] = res
json.dump(geo, open('out/geo.json', 'w'), indent=1)
log = {}
for im in job.get('images', []):
  try:
    req = urllib.request.Request(im['url'], headers={'User-Agent': BROWSER, 'Referer': im.get('page') or im['url'], 'Accept': 'image/avif,image/webp,image/png,image/jpeg,*/*'})
    b = urllib.request.urlopen(req, timeout=40).read()
    ext = '.png' if b[:4] == b'\x89PNG' else '.webp' if b[8:12] == b'WEBP' else '.avif' if b'ftypavif' in b[:32] else '.jpg' if b[:2] == b'\xff\xd8' else '.bin'
    open(f"out/bottles/{im['id']}{ext}", 'wb').write(b); log[im['id']] = {'ok': True, 'bytes': len(b), 'ext': ext}
  except Exception as e:
    log[im['id']] = {'ok': False, 'error': str(e)[:200]}
json.dump(log, open('out/images.json', 'w'), indent=1)
print(sum(1 for v in log.values() if v['ok']), 'of', len(log), 'images')
