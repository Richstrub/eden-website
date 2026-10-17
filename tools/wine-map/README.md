# Wine maps

`make_map.py` draws the engraved, old-world style map shown in a wine's "About this wine" window
(parchment, hill shading, contour lines, engraved coastline, rivers, and the lettering, compass rose and scale bar).

It writes `assets/images/wines/<name>.jpg` (the picture) and `<name>.svg` (the lettering over it). Point the wine's
`map.art` in `js/wine-details.js` at the `.svg`.

To make one for another wine, add an entry to `CONFIGS` in the script (map area, winery, towns, labels), then fetch:
- `tiles/`: AWS Terrain Tiles (Terrarium, zoom 12) covering the area,
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/12/<x>/<y>.png`, saved as `12_<x>_<y>.png`
- `osm.json`: rivers from the Overpass API, `[out:json];way["waterway"="river"](<s>,<w>,<n>,<e>);out geom;`

and run `python3 tools/wine-map/make_map.py <data folder> assets/images/wines/<name> <config name>`.
Needs numpy, scipy, matplotlib and Pillow.
