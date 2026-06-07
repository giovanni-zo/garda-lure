# Garda Lure Simulator Ultimate - PWA online

Questo pacchetto e' pronto per GitHub Pages, Netlify o Vercel.

## File principali

- index.html: il simulatore completo.
- manifest.webmanifest: rende l'app installabile come PWA.
- sw.js: cache offline di base e aggiornamento automatico del file HTML.
- icons/: icone app.
- .nojekyll: evita trasformazioni Jekyll su GitHub Pages.

## Metodo consigliato: GitHub Pages

1. Crea un account GitHub o accedi.
2. Crea un nuovo repository pubblico, per esempio `garda-lure-simulator`.
3. Carica tutti i file di questa cartella nella root del repository.
4. Vai in Settings -> Pages.
5. Source: Deploy from a branch.
6. Branch: main, folder: /root.
7. Salva. Dopo circa 1-3 minuti avrai un link pubblico.

## Aggiornare l'app

Per aggiornare:

1. sostituisci `index.html` con la nuova versione;
2. fai commit/upload su GitHub;
3. GitHub Pages pubblica automaticamente la nuova versione.

Il service worker usa una strategia network-first per `index.html`, quindi quando l'utente apre l'app online vede la versione nuova. Se cambi anche manifest, icone o service worker, modifica `CACHE_NAME` in `sw.js`, per esempio da `garda-lure-pwa-v1` a `garda-lure-pwa-v2`.

## Installazione sul telefono

- Android/Chrome: apri il link, menu browser, Aggiungi a schermata Home o Installa app.
- iPhone/Safari: apri il link, Condividi, Aggiungi alla schermata Home.

## Prossimo step opzionale

Aggiungere GPS + meteo live: posizione browser + chiamata API meteo, poi auto-impostazione di vento, pressione, nuvole, aria e spot piu' vicino.
