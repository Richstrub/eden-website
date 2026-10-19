set -x
rm -rf out; mkdir -p out/maps
pip install -q numpy scipy matplotlib pillow
python3 tmp/fetch_data.py tmp/regions.json data
python3 tmp/region_maps.py tmp/regions.json data out/maps
python3 - <<'PY'
import json, numpy as np, glob, os
# how high does the elevation data put Loch Broom's water? (sample along the loch)
import sys; sys.path.insert(0, 'tmp')
try:
    import region_maps as rm
    r = json.load(open('tmp/regions.json'))[0]
    dem = rm.load_dem(r, 'data/' + r['id']) if hasattr(rm, 'load_dem') else None
    print('dem', None if dem is None else dem.shape)
except Exception as e: print('probe failed', e)
PY
