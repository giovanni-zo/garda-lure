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
- Imitazioni di pesce: blu/argento con ventre bianco su sassi e acqua aperta;
  oliva/perla nel molto limpido e calmo; perla nella combinazione di profondità e scarsa luce. Il vento da solo non
  sostituisce una livrea naturale in acqua limpida.
  Per il luccio il persico è automatico solo sul bordo delle erbe in acqua
  limpida e relativamente bassa, oppure quando viene segnalato quel foraggio.
  Agone/alborella osservati hanno precedenza. Il luccio nel torbido con grandi
  swimbait può orientare al firetiger. Nel buio con acqua velata, lucioperca/perla e
  nero/blu per il contrasto; nel limpido restano disponibili i naturali.
  Entro un’ora da alba/tramonto non viene imposto un cambio al nero. Hard minnow nel velato: oro/nero con gola arancio.
- Gomme finesse: green pumpkin in acqua limpida; nero/blu in acqua torbida o
  di notte. Creature: marrone/gambero nel limpido, nero/blu nel torbido.
- Spinnerbait e chatterbait: blu/bianco nel limpido e calmo, oliva per il bass
  tra le erbe; bianco/chartreuse con vento o acqua velata/torbida; nero/blu di notte.
  Il bianco resta distinto dal chartreuse e le parti metalliche sono neutre.
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
- Bassmaster / Russ Lane, colori dello spinnerbait e chiarezza dell’acqua:
  https://www.bassmaster.com/how-to/news/frugal-angler-spinnerbait/
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

Tredici nuovi PNG ImageGen separano le forme e aggiungono livree a più colori.
Il deep jerk ha corpo allungato e paletta lunga; il deep crank è più panciuto
con paletta lunga e larga; le varianti shallow hanno palette corte. Le gomme
sono prive di amo/testina fissi, per poter rappresentare il montaggio scelto
nelle vignette senza mostrare una testina da jig in un drop shot.

I filtri SVG isolano le zone colorate blu/verdi, conservando ventre chiaro,
ami e palette metalliche; oro e rame dei metalli usano una maschera di
luminanza. Le gomme nero/blu usano un filtro sul corpo intero per convertire anche
i marroni e i ventri chiari in sfumature scure e blu, conservando le faccette.
Le livree native bypassano il filtro. Le barre del persico sono
parte della bitmap, con sagome separate per shad costolato, swimbait liscio
e glide. Colore e grafica non cambiano peso o galleggiabilità.

## Verifica locale del 24 ottobre 2026

Il confronto con resoconti del Garda sostiene le livree naturali e alcune
varianti di contrasto come scelte iniziali, ma non identifica un unico colore
migliore. Non sono stati attribuiti ai colori coefficienti di efficacia derivati
dal numero di catture raccontate. Una differenza di luce, vento o quota non
cancella automaticamente il foraggio osservato nel limpido.
Vedere `garda-field-checks.md` per le fonti e i casi di confronto.
