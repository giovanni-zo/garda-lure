# Garda Lure · versione 7.2

Interfaccia in italiano per scegliere una tecnica di pesca sul Garda.

- 24 tipi di esca, senza marche, con 144 profili di misura/peso.
- Varianti floating, suspending, sinking e deep distinte.
- 19 sagome low poly di esche e due nuove livree persico (riutilizzate per varianti della stessa
  sagoma) e 7 pesci. Le livree dipendono da esca, target, foraggio, luce e
  limpidezza: argento/oro/rame per metalli, persico per swimbait da luccio,
  perla, firetiger, pumpkin, marrone o nero/blu secondo lo scenario.
- Flusso: pesce, zona/struttura, giorno/ora, acqua e potenza della canna.
  Specie e taglia sono sempre visibili. Meteo e acqua, quota, distanza, casting
  esatto, lenza e montaggio sono regolabili; montaggio e piombatura automatici
  sono disattivabili. Sei dimensioni per ciascun tipo.
- Consigli con score, classifica completa filtrabile, confronto di tutte le
  misure, sette componenti del punteggio nella scheda, zone e mappe 2D/3D.
- Interfaccia ispirata a Liquid Glass, con contrasto, tastiera, movimento ridotto
  e fallback per browser senza backdrop-filter.

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

- `node tests/scenarios.mjs`: 35 controlli di regressione più 25 controlli
  estesi su 252 scenari e su colori, taglia, meteo orario e cambio ora legale.
- `node tests/selector.mjs`: 35 controlli su coerenza di montaggi, profondità,
  vincoli canna, alternative e punteggi.
- `python3 tests/geography.py`: sagoma, Sirmione, isole, griglia e GLB condiviso.
- Controllata in browser la selezione specie, il catalogo, i dettagli, il cambio
  cromatico e le viste 2D/3D. I controlli non misurano l'efficacia delle catture.

Il meteo orario usa Open-Meteo su richiesta per la zona scelta, senza necessità
di GPS. Il GPS sceglie la zona del Garda più vicina; a Open-Meteo vengono inviate
le coordinate di quella zona, non il punto GPS esatto. Data e ora sono quelle
dello scenario: il meteo corrente non le sostituisce. Sono mostrati aria,
pioggia, vento, nuvole e pressione; acqua, torbidità e risacca restano separati.
La previsione si può personalizzare e la provenienza passa a “Manuale”.
Alba/tramonto usano le equazioni NOAA e il fuso Europe/Rome.

Regole e fonti: `docs/color-evidence.md`. Prompt e asset: `assets/illustrations/prompts.json`.
Gli asset visitati vengono conservati offline; il nucleo dell'app e il modello
sono precache. Il service worker aggiorna gli asset con versione 7.2.
