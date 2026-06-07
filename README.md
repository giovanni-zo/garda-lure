# Garda Lure Simulator Ultimate - PWA

Questa cartella e' pronta per GitHub Pages.

## File inclusi

- `index.html`: simulatore completo.
- `manifest.webmanifest`: rende l'app installabile.
- `sw.js`: service worker per cache/offline e aggiornamenti semplici.
- `icons/`: icone app.
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
