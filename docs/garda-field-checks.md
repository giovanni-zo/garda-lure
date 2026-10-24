# Riscontri dal Garda · 24 ottobre 2026

Questi resoconti hanno fatto emergere lacune da correggere, non coefficienti di
probabilità di cattura. Dove non sono dichiarati temperatura, vento misurato,
profondità o attrezzatura, i test usano ipotesi esplicite. Una singola cattura non
implica che quella tecnica debba vincere sempre. L’interfaccia mantiene i consigli
brevi; il dettaglio delle regole resta nella documentazione.

## Casi utili e correzioni

- Alessandro Pesci, gara a Toscolano del 18 ottobre 2026: acqua limpida con
  pioggia, apatia iniziale, soft bait piccole a drop shot con soste; attivazione
  successiva con vento da nord. La ricerca automatica del piombo ora conserva
  le gomme piccole nei lanci lunghi e il drop shot compete anche in autunno.
  Resoconto personale ospitato da un distributore:
  https://www.plus-fishing.com/en/blog/terza-tappa-campionato-italiano-street-fishing
- Deihlos e jinx, settembre 2019: wacky con piccolo piombo sopra l’amo;
  jinx riporta anche una creature a drop shot al passaggio lago/Mincio.
  Ora sono proposte compatibili, senza obbligare l’utente a scegliere il rig.
  L’uscita di Deihlos era in belly boat: non valida le distanze da riva.
  https://www.barsch-alarm.de/community/threads/bass-trip-an-den-gardasee.36887/page-3
- Stoney0066, resoconto del 29 luglio 2014 dopo un viaggio a Brenzone: persici
  a drop shot in almeno 10–15 m. La quota estiva automatica sugli scalini dei
  bacini profondi non è più limitata a 2–6 m. Non significa che tutti i persici
  estivi stiano profondi; attività osservata e fondo noto modificano la ricerca.
  https://www.anglerboard.de/threads/wie-auf-raubfisch-am-gardasee.287885/
- bavariabeni, agosto 2016: tra le esche usate con successo compare lo spybait.
  È ora una categoria distinta con sei misure, sagoma e recupero dedicati.
  https://www.anglerboard.de/threads/bass-im-gardasee.318913/page-2
- Alessio Turriziani, febbraio 2014: ricerca della lacustre invernale nella
  fascia alta, anche a 40–50 m dalla riva. La stima invernale comprende questo
  schema e non forza sempre una ricerca vicina e profonda. Articolo personale
  con riferimenti commerciali, non una misura della distribuzione dei pesci.
  https://www.pescaok.it/lacustre-la-sfida-sul-lago-di-garda.html/
- Tenaf e Redcreek, PIPAM: al Corno e verso San Vigilio vengono descritti
  recuperi molto rapidi e piccoli artificiali bianchi/argento al calare della
  luce. Il comportamento osservato può cambiare il recupero; il crepuscolo non
  impone una livrea nera. La pesca a mosca non è equiparata allo spinning.
  https://pipam.it/FORUM/THREAD.php?Messages=96&Title=PERSICO+REALE+A+MOSCA&threadid=3426
- Christoph Oepp: gomme naturali e offset nelle erbe di Lazise/Cisano, piombi
  diversi con vento/onde e shad per lucci sui pendii. Conferma generale di
  famiglia e taglia; i pesi esatti restano specifici di condizioni e attrezzatura.
  https://www.hechtundbarsch.ch/blogs/ratgeber/angeln-am-gardasee

## Verifiche riproducibili

`node tests/garda-cases.mjs` verifica portata e peso senza ingrandire la gomma,
peso manuale, wacky leggermente piombato, esclusione di wacky eccessivamente
pesanti, creature a drop shot, quote stagionali e fondo noto, attività e recupero,
continuità cromatica al tramonto e contenuti dello spybait. Include quattro
classi di canna, sette specie e tre stati di attività.

Le altre suite controllano pesi, ordine, identità dei profili, tre vignette per
ogni tipo/specie, asset, meteo e vincoli. La matrice estesa dell’audit usa 14.112
scenari. I controlli del software non dimostrano l’efficacia sul pescato; per
aspio e lucioperca mancano ancora resoconti locali abbastanza dettagliati per
una taratura empirica. Non sono stati inventati dati locali per colmare il vuoto.
