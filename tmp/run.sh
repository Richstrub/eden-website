set -x
rm -rf out; mkdir -p out/maps
python3 tmp/job1.py
pip install -q numpy scipy matplotlib pillow
python3 tmp/fetch_data.py tmp/regions.json data
cp data/regions-z.json out/regions-z.json
python3 tmp/region_maps.py tmp/regions.json data out/maps
for d in data/*; do echo "$d $(ls $d/tiles | wc -l) tiles $(stat -c %s $d/osm.json 2>/dev/null) osm"; done > out/data-summary.txt
ls -la out/maps | head -80
