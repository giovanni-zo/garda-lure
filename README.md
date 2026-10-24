# Garda Lure · versione 9.2

Interfaccia in italiano per scegliere una tecnica di pesca sul Garda.

- 44 tipi di esca: 20 hard bait e 24 combinazioni compatibili di montaggio
  e gomma, senza marche. Le 150 misure di base generano 244 profili montati
  e rigidi, con pesi adattati allo scenario.
- Varianti floating, suspending, sinking e deep distinte.
- Sagome low poly e 7 pesci. Tredici nuovi asset distinguono palette deep e
  shallow, soft shad costolato, swimbait liscio e gomme senza montaggio fisso.
  Le livree multicolore dipendono da esca, target, foraggio, luce, vento,
  struttura e limpidezza: argento/oro/rame per metalli, blu/argento con ventre
  bianco, oliva/perla, persico, perla, firetiger, pumpkin o nero/blu.
  Il persico per il luccio è una scelta contestuale, non una regola fissa.
- Sette montaggi per gomme: jig head, drop shot, Texas, Carolina, Ned, wacky
  e weightless. Compatibilità di forma, taglia, quota, peso montato e canna.
  Le combinazioni gomma + montaggio competono automaticamente con le esche
  rigide nella classifica. Nessuna selezione preventiva del montaggio.
  Ogni scheda contiene tre vignette low poly con recupero, pause e montaggio
  adattati allo scenario. Il filtro per tipo serve solo a esplorare i risultati.
- Flusso: pesce, zona/struttura, giorno/ora, acqua e potenza della canna.
  Specie e taglia sono sempre visibili. Meteo e acqua, quota, distanza, casting
  esatto e lenza sono regolabili. L’attività osservata è facoltativa nelle regolazioni avanzate. Il montaggio viene consigliato dall’app;
  la piombatura automatica può essere sostituita con un peso manuale.
  Fino a sei dimensioni per tipo, nei limiti del montaggio consigliato.
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
registra gli asset originali; `assets/illustrations/v8-prompts.json` registra
i tredici nuovi prompt e i riferimenti. Alcune livree sono native nella bitmap;
le altre usano maschere cromatiche SVG che conservano ventre bianco, metallo
e sfaccettature. Lo spybait usa un PNG ImageGen nello stesso stile low poly 3D degli altri
asset, con due eliche e senza paletta. Prompt e riferimenti: `assets/illustrations/spybait-prompts.json`.
Le vignette sono SVG dinamici con queste immagini e
geometrie di amo, piombo, lenza e frecce. Gli scarti di stile precedenti alla
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

- `node tests/scenarios.mjs`: 35 controlli di regressione più 27 controlli
  estesi su 252 scenari e su colori, taglia, meteo orario e cambio ora legale.
- `node tests/selector.mjs`: 35 controlli su coerenza di montaggi, profondità,
  vincoli canna, alternative e punteggi.
- `node tests/automatic-recommendations.mjs`: 38 controlli su 147 scenari e
  23.492 combinazioni compatibili: scelta automatica, montaggi distinti,
  peso montato, quota, canna, filtri, identità e apertura delle proposte.
- `node tests/presentations.mjs`: 25 controlli su 700 guide: tre vignette per
  tutti i tipi e target, pause, galleggiabilità, montaggi, taglie, quota e asset.
- `node tests/garda-cases.mjs`: 23 controlli su 252 scenari, derivati dal controllo
  dei resoconti: piombatura e lancio, wacky piombato, creature a drop shot,
  persici profondi in estate, trote invernali, attività osservata e crepuscolo.
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

Regole e fonti: `docs/color-evidence.md`, `docs/presentations.md` e
`docs/garda-field-checks.md`.
Prompt e asset: `assets/illustrations/prompts.json` e `v8-prompts.json`.
Gli asset visitati vengono conservati offline; il nucleo dell'app e il modello
sono precache. Il service worker aggiorna gli asset con versione 9.2.

## Correzioni 9.1

La piombatura automatica cerca il peso più leggero con controllo e margine di
lancio, rispettando il casting della canna; conserva la dimensione della gomma.
Wacky senza piombo o con 1–3 g, creature corte a drop shot e spybait con sei
misure sono inclusi nelle proposte automatiche. La quota del persico sullo
scalino estivo può comprendere 10–15 m; quella della trota invernale considera
la fascia alta anche lontano dalla sponda. Il fondale noto resta un limite.
Il drop shot non è riservato al freddo. Una sola regolazione facoltativa per
l’attività osservata adatta ricerca, tecnica e recupero. Nel limpido vento o
tramonto, da soli, non impongono una livrea bianca o nera.

## Tipi di esca 9.2

Ogni montaggio + forma della gomma è un tipo distinto nel catalogo, nel filtro
e nella classifica: drop shot shad, drop shot worm e drop shot creature non
condividono una sola riga. Ogni tipo sceglie la misura migliore per lo scenario,
con score e guida propri; il confronto misure espande le alternative dello
stesso tipo. La scheda conserva montaggio e forma cambiando dimensione.
La scelta resta automatica. Le combinazioni incompatibili non vengono create.
