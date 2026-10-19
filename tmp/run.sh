set -x
rm -rf out; mkdir -p out/maps
pip install -q numpy scipy matplotlib pillow
python3 tmp/geo.py
python3 tmp/fetch_data.py tmp/regions.json data
python3 tmp/region_maps.py tmp/regions.json data out/maps
