import json, time, urllib.request, urllib.parse, sys
q = json.load(open('tmp/geo-q.json')); out = []
for x in q:
    for prov in ['nominatim', 'census']:
        try:
            if prov == 'nominatim':
                u = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': x['q'], 'format': 'jsonv2', 'limit': 3, 'countrycodes': 'us', 'addressdetails': 0})
                r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'eden-site-partners/1.0 (info@edencny.com)'}), timeout=30))
                res = [{'lat': float(a['lat']), 'lng': float(a['lon']), 'name': a.get('display_name'), 'type': a.get('type'), 'class': a.get('category')} for a in r]
                time.sleep(1.2)
            else:
                u = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?' + urllib.parse.urlencode({'address': x['q'], 'benchmark': 'Public_AR_Current', 'format': 'json'})
                r = json.load(urllib.request.urlopen(u, timeout=30))
                res = [{'lat': m['coordinates']['y'], 'lng': m['coordinates']['x'], 'name': m['matchedAddress'], 'type': 'census'} for m in r['result']['addressMatches']]
        except Exception as e:
            res = [{'error': str(e)}]
        out.append({'id': x['id'], 'q': x['q'], 'provider': prov, 'results': res})
json.dump(out, open('out/geo.json', 'w'), indent=1)
