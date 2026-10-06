# Garda Lure Simulator Ultimate - PWA

## Mappa 3D del Garda — Higgsfield

La sezione Mappa apre il fondale 3D. Trascina per ruotare, usa rotella/pinch per zoomare, scegli una zona o la vista dall'alto. Toccare il fondale seleziona uno spot e aggiorna le informazioni di pesca. Il pulsante **Mappa 2D · pesca** riapre la mappa originale e i suoi filtri.

Il modello è stato creato con Higgsfield 3D Jutsu usando la geometria e il modello batimetrico stimato di Garda Lure. Gli screenshot IMG_9074, IMG_9075 e IMG_9076 guidano la rappresentazione del fondale, i colori costieri e le isobate. Non contengono un rilievo completo: le quote restano stime, non profondità misurate. Il rilievo verticale è amplificato 12 volte rispetto alla scala orizzontale.

- Progetto modificabile: https://higgsfield.ai/3d-jutsu/55e2ca63-1933-4585-83e5-45fae99607c3
- Modello portabile: `assets/lake-garda.glb` (circa 3 MB, 20.472 triangoli per il fondale).
- Anteprima: `assets/lake-garda-preview.png`.
- La pagina PWA, il visualizzatore e il modello sono inclusi nella cache offline dopo il primo caricamento online.
- Visualizzatore: Google model-viewer 4.1.0, Apache 2.0; licenza in `vendor/model-viewer-LICENSE.txt`.

Per pubblicare questa versione, carica **tutta la cartella**, incluse `assets/` e `vendor/`. L'HTML richiede un server HTTP/HTTPS per la vista 3D (ad esempio GitHub Pages); un'apertura diretta con `file://` può bloccare il caricamento del modello. Anche `garda_lure_simulator_hd_map_jdm_v6.html` usa questi file condivisi nella cartella PWA.

Questa cartella e' pronta per GitHub Pages.

## File inclusi

- `index.html`: simulatore completo.
- `manifest.webmanifest`: rende l'app installabile.
- `sw.js`: service worker per cache/offline e aggiornamenti semplici.
- `icon-192.png`, `icon-512.png`: icone app.
- `.nojekyll`: evita elaborazioni inutili di GitHub Pages.

## Pubblicazione gratis con GitHub Pages

1. Crea un account GitHub.
2. Crea un nuovo repository pubblico, per esempio `garda-lure-simulator`.
3. Carica tutti i file di questa cartella nella root del repository.
4. Vai in `Settings` -> `Pages`.
5. In `Build and deployment`, scegli `Deploy from a branch`.
6. Scegli branch `main` e cartella `/ (root)`, poi `Save`.
7. Dopo poco la app sara' online a un indirizzo simile a:
   `https://TUO-USERNAME.github.io/garda-lure-simulator/`

## Aggiornare l'app

Per aggiornare logica, esche o mappa:

1. Modifica `index.html`.
2. Carica il nuovo `index.html` nel repository.
3. Premi `Commit changes`.
4. Riapri l'app: il service worker usa network-first per la pagina HTML, quindi prova sempre a prendere la versione online piu' recente.

Per aggiornamenti grossi puoi anche cambiare `CACHE_NAME` dentro `sw.js`, per esempio da `garda-lure-pwa-v1` a `garda-lure-pwa-v2`.

## Aggiornamento GPS + meteo live
Questa versione aggiunge il bottone **Usa GPS + meteo live**. Funziona solo online in HTTPS, quindi su GitHub Pages va bene. Il browser chiede il permesso posizione, imposta la zona del Garda più vicina e aggiorna temperatura aria, vento, pressione, nuvolosità, onda stimata e temperatura acqua stimata.
