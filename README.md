# Garda Lure · versione 6.6

Interfaccia in italiano per scegliere una tecnica di pesca sul Garda.

- 24 tipi di esca, senza marche, con 72 profili di misura/peso.
- Varianti floating, suspending, sinking e deep distinte.
- 19 illustrazioni low poly di esche (riutilizzate per varianti della stessa
  sagoma) e 7 pesci. In acqua limpida i colori restano naturali; con acqua
  velata diventano oro/rame; in acqua torbida chartreuse.
- Flusso: pesce, zona/struttura, giorno/ora, acqua e potenza della canna.
  Montaggio e piombatura sono automatici; condizioni e quota si possono regolare.
- Consigli, zone, catalogo per tipi, scheda di dettaglio, mappa 2D e 3D.

## Aprire o pubblicare

Dalla cartella principale: `python3 -m http.server 8765 --bind 127.0.0.1`.
Aprire `http://127.0.0.1:8765/garda_lure_pwa_gps_meteo_v2/`.
Per pubblicare, caricare l'intera cartella su un hosting statico HTTPS.
La copia `garda_lure_pwa_gps_meteo_v2 2` è sincronizzata. I vecchi HTML e ZIP
standalone sono archivi storici, non questa versione.

## Immagini

Gli asset finali si trovano in `assets/illustrations/`. Sono PNG con trasparenza,
generati con lo strumento integrato ImageGen. `assets/illustrations/prompts.json`
registra soggetti, stile e file. Le varianti di colore sono applicate nel sito,
senza duplicare i file delle immagini. Gli scarti di stile precedenti alla
richiesta low poly non sono inclusi.

## Mappe

Entrambe le viste usano un unico perimetro geografico e un'unica superficie:

- Costa: OpenStreetMap, relazione 8569, scaricata il 22 ottobre 2026.
  Fonte: https://www.openstreetmap.org/relation/8569
- Dati originali: `tools/garda-osm-source.json`; perimetro portabile:
  `assets/geodata/lake-garda-coast.geojson`.
- Attribuzione: © OpenStreetMap contributors, ODbL 1.0.
  https://www.openstreetmap.org/copyright
- `assets/garda-lake-data.js`: costa, isole e griglia di profondità della vista 2D.
- `assets/lake-garda-v6.glb`: lo stesso fondale in 3D, con le stesse isobate.
- `assets/lake-garda-v6-metadata.json`: scala, origine geografica e provenienza.
- La penisola di Sirmione è parte della costa, non un'isola o un foro artificiale.
- Le profondità sono una superficie schematica costruita seguendo le forme
  delle tre immagini fornite (IMG_9074/75/76). Non sono dati C-MAP estratti o un
  rilievo batimetrico misurato. Non viene riprodotta la carta proprietaria.
- Rilievo verticale amplificato ×8. Le coordinate 3D sono riferite alla stessa
  origine e scala in km della vista 2D.

Ricostruzione: `python3 tools/build_lake.py` (richiede NumPy e Matplotlib).
Il viewer model-viewer locale mantiene la sua licenza Apache 2.0 in `vendor/`.

## Logica e verifiche

`assets/lure-types.js` contiene la tassonomia generica; non c'è più il database
commerciale. `assets/recommendation-engine.js` gestisce montaggi, profondità,
casting, vegetazione e ordinamento. `assets/simple-fishing.js` gestisce il nuovo
flusso visivo; `assets/garda-map.js` gestisce entrambe le viste geografiche.

- `node tests/selector.mjs`: 35 controlli su coerenza di montaggi, profondità,
  vincoli canna, alternative e punteggi.
- `python3 tests/geography.py`: sagoma, Sirmione, isole, griglia e GLB condiviso.
- Controllata in browser la selezione specie, il catalogo, i dettagli, il cambio
  cromatico e le viste 2D/3D. I controlli non misurano l'efficacia delle catture.

GPS/meteo usa Open-Meteo su richiesta. Le coordinate sono inviate al servizio;
acqua e trasparenza restano condizioni inserite o stagionali. Gli asset visitati
vengono conservati offline; il nucleo dell'app e il modello sono precache.
