# Colori, condizioni e foraggio del Garda

Le livree sono una scelta iniziale per il tipo di esca e lo scenario: non esiste
un colore universalmente migliore o una graduatoria sperimentale per ogni punto
del Garda. La scelta locale di imitare persico oppure agone/alborella è una
regola del modello basata sul foraggio presente, non un risultato di prove di
cattura comparative. Il foraggio osservato dall'utente ha precedenza.

## Regole implementate

- Metalli (rotanti, ondulanti, spintail, blade, jig): argento con acqua limpida
  e luce sufficiente; oro con cielo molto coperto o acqua velata; rame/arancio
  con acqua torbida. L'alternativa argento/oro resta visibile nella scheda.
- Swimbait per il luccio: persico naturale in acqua limpida; agone/alborella
  se l'utente segnala quel foraggio; perla in acqua velata; firetiger in acqua
  torbida. Di notte si privilegia una silhouette scura.
- Gomme finesse: green pumpkin in acqua limpida; nero/blu in acqua torbida o
  di notte. Creature: marrone/gambero nel limpido, nero/blu nel torbido.
- Spinnerbait e chatterbait: chiaro/naturale nel limpido, perla nel velato,
  bianco/chartreuse nel torbido, nero/blu di notte.
- Superficie: naturale con luce e acqua limpida; perla nel velato; nero per
  silhouette con poca luce o visibilità scarsa.

La visibilità nel punteggio mantiene peso limitato. Specie, taglia, quota,
struttura, casting e peso montato restano determinanti. Un foraggio segnalato
aggiunge solo 2–3 punti alle tecniche coerenti. La pioggia è mostrata nel meteo;
non viene trasformata automaticamente in torbidità dell'acqua.

## Fonti consultate il 23 ottobre 2026

- Mepps, consigli sul rapporto tra luce e finitura: argento con sole,
  oro con cielo coperto, rame dopo pioggia/acqua sporca:
  https://www.mepps.com/mepps-tactics/article/inland-trout-tips-tactics/435
- Mepps, riflessione, colore dell'acqua e contrasto:
  https://www.mepps.com/mepps-tactics/article/color-technology-what-you-see-is-not-what-you-get/77
- Bassmaster, colori delle gomme: naturali/traslucidi nel limpido e colori
  scuri/opachi in bassa visibilità:
  https://www.bassmaster.com/bass-basics/news/the-texas-rig-part-5-soft-plastic-colors/
- Regione Lombardia / inLombardia, fauna e ambienti del Garda, compresi agone,
  alborella, persico e luccio:
  https://www.in-lombardia.it/visitare-la-lombardia/vacanza-al-lago/pesca-sportiva
- Discussioni di pescatori consultate come esperienza aneddotica, senza
  trasformarle in pesi di efficacia o risultati sperimentali:
  https://www.reddit.com/r/Fishing/comments/11g1a22/
  https://www.reddit.com/r/Fishing/comments/1e8ceg6/

## Meteo e luce

- Open-Meteo, previsioni orarie, timezone Europe/Rome, vento in m/s:
  https://open-meteo.com/en/docs
- NOAA, equazioni di declinazione solare, equazione del tempo e alba/tramonto:
  https://gml.noaa.gov/grad/solcalc/solareqns.PDF

Il modello solare considera latitudine, longitudine, data, anno bisestile e ora
legale. Non include l'orizzonte montuoso specifico di ogni sponda. Il meteo
scaricato usa esattamente la data e l'ora selezionate; fuori dall'intervallo
restituito non ripiega su un'altra ora. Acqua, limpidezza e risacca sono dati
separati, inseriti dall'utente o stimati stagionalmente per l'acqua.

## Grafica

Le nuove immagini persico naturale sono modifiche ImageGen dei due asset
low poly originali (soft shad e glide bait). Le barre sono parte della bitmap;
le altre livree usano filtri CSS coerenti con la palette raccomandata.
Il colore di una livrea non cambia il peso, la galleggiabilità o il montaggio.
