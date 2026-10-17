set -x
rm -rf out; mkdir -p out/maps
pip install -q numpy scipy matplotlib pillow
python3 tmp/fetch_data.py tmp/regions.json data
python3 tmp/region_maps.py tmp/regions.json data out/maps
for d in data/*; do echo "$d $(ls $d/tiles 2>/dev/null | wc -l) tiles $(stat -c %s $d/osm.json 2>/dev/null) osm"; done > out/data-summary.txt
