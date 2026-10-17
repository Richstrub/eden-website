# Wine and spirit maps

The "About this wine / spirit" window shows a dark, engraved-style map of the region where the bottle is made, in the
website's charcoal, ivory and ember. One map serves every producer in a region: the page pins the producer itself
from the bottle's coordinates (`map.lat`/`map.lng` in `assets/wines/<id>.json`), using the area the map covers
(the SVG's `data-bbox`).

Maps live in `assets/images/wines/maps/<region>.jpg` (terrain) and `<region>.svg` (lettering, set in the site's
typefaces). A bottle points at its region's map with `map.art`.

To add regions:

1. List the producers' coordinates in a `points.json` and group them: `python3 clusters.py points.json regions.json`.
   Edit `regions.json` for titles, the line under the title (`sub`) and sea names (`sea`).
2. Download elevation and OpenStreetMap data (needs internet): `python3 fetch_data.py regions.json data`
3. Draw them: `python3 region_maps.py regions.json data assets/images/wines/maps`

Needs numpy, scipy, matplotlib and Pillow. Map data © OpenStreetMap contributors (ODbL); elevation: Mapzen /
AWS Terrain Tiles.
