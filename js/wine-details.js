/* Eden: the longer story behind a wine, shown when a guest taps it on the website menu or the iPad menu.
 * Matched to the menu by name: every word in "match" must appear in the wine's name (vintage, accents and case don't
 * matter), so it keeps working when the menu editor changes the price or the vintage line.
 *   about   paragraphs of the in-depth description
 *   facts   [label, value] pairs (grapes, method, ageing…)
 *   awards  { score, by, note }  critics' scores and honours, newest first
 *   image   { src, alt, credit }  bottle photo, kept in assets/images/wines/ (tall and narrow, about 560 px wide)
 *   map     { lat, lng, place, art }  where the winery is; art = Eden's engraved-style map made with
 *           tools/wine-map/make_map.py (without it, a regular street map is shown)
 * Sources are listed with each wine so the details can be checked.
 */
window.EDEN_WINE_DETAILS = [
  {
    match: 'raventos blanc nit',
    producer: 'Raventós i Blanc',
    region: 'Conca del Riu Anoia · Penedès, Catalonia, Spain',
    about: [
      'De Nit (Catalan for “of the night”) is the rosé sparkling wine of Raventós i Blanc, a family estate in Sant Sadurní d’Anoia, just west of Barcelona. The Raventós family has farmed this land since 1497. In 1872 Josep Raventós Fatjó made the first traditional-method sparkling wine in Spain from native grapes, and the family later helped create the Cava appellation.',
      'In 2012 they left Cava to champion a stricter, place-based designation of their own, Conca del Riu Anoia: only native grape varieties, grown in the valley of the river Anoia, organic farming, and at least 18 months of aging. That is why the label reads Conca del Riu Anoia rather than Cava. Today Pepe Raventós, the 21st generation, farms the estate’s vines and woodland biodynamically, and its marine soils, full of ancient fossils, give the wines their saline edge.',
      'The 2023 is a blend of Xarel·lo, Macabeu and Parellada, with a splash of Monastrell for its pale pink color. It is made like Champagne, with its second fermentation in the bottle, then rests 18 months on its lees before disgorging, finished Extra Brut with very little added sugar. Expect wild strawberry, red currant, citrus peel and white flowers, then red berries, blood orange and grapefruit on a fine, silky mousse with a long, saline finish.'
    ],
    facts: [
      ['Grapes', '50% Xarel·lo, 34% Macabeu, 9% Parellada, 7% Monastrell'],
      ['Method', 'Traditional method, second fermentation in bottle'],
      ['Aging', '18 months on the lees'],
      ['Style', 'Extra Brut (about 4 g/l), rosé'],
      ['Alcohol', '12.15%'],
      ['Farming', 'Certified organic, biodynamic estate']
    ],
    awards: [
      { score: '93', by: 'Falstaff', note: 'Rosé Trophy Europe 2025: “a stylish food companion”' },
      { score: '92', by: 'Robert Parker’s Wine Advocate', note: '“More than a rosé. Pleasure per dollar.”' },
      { score: '90', by: 'Wine Spectator', note: '“A raw silk–like mousse and well-cut acidity”' },
      { score: '', by: 'The New York Times', note: 'Eric Asimov’s 2025 holiday picks: “It’s not Champagne, but it’s delicious bubbly.”' }
    ],
    image: { src: 'assets/images/wines/raventos-de-nit.jpg', alt: 'A bottle of Raventós i Blanc de Nit rosé', credit: 'Photo: Raventós i Blanc' },
    map: { lat: 41.433574, lng: 1.795787, place: 'Raventós i Blanc · Sant Sadurní d’Anoia, Catalonia', art: 'assets/images/wines/raventos-map.svg' },
    sources: ['wine.com (winemaker notes, Wine Advocate and Wine Spectator scores)', 'falstaff.com (Rosé Trophy Europe 2025)', 'raventos.com (estate history, press)', 'skurnik.com (importer notes)']
  }
];
