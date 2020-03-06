# Frontend Checkliste für Manuelles Testen
stand Iteration 8

## Bearbeitete Dateien  
Es wurden Dateien von **...** bearbeitet.
* [ ]  Tableaux
* [ ]  Resolution
* [ ]  DPLL
* [ ]  components (betreffen alle Kalküle)


## Landingpage
Alle Verfügbaren Kalkühle sind auswählbar:
* [ ]  Prop-Tableaux
* [ ]  FO-Tableaux
* [ ]  Prop-Resolution
* [ ]  FO-Resolution
* [ ]  DPLL


## Formeleingabe
Es werden die Richtigen Tooltipps für die angezeigt:
* [ ]  Unconected
* [ ]  Weakly Connected
* [ ]  Strongly Connected
* [ ]  Regular
* [ ]  Backtracking
* [ ]  Naive CNF transformation
* [ ]  Manual unification
* [ ]  No visual help
* [ ]  Highlight resolution partners
* [ ]  Rearrange resolution partners

Bei **FO-Kalkülen** wird der richtige Formeleingabe Tooltipp gezeigt
* [ ]  FO-Formeln
* [ ]  Bei Eingabe von "/.." oder "\\.." im formular input wird Autovervollständigung vorgeschlagen.

Bei **Propositional-Kalkülen** wird der richtige Formeleingabe Tooltipp gezeigt
* [ ]  Clause Sets
* [ ]  Propositional Formulas

## Kalkül spezifische checklisten 
Einheitliche Formel fürs Testen eines Kalküls spezifiziert unter: `/view`.

### Tableaux
* [ ]  Prop-Testbaum wird richtig angezeigt

![image](/uploads/2def023063374b5ca7b2867777af3890/image.png)

* [ ]  FO-Testbaum wird richtig angezeigt

![image](/uploads/ab8f7ac0ff3ebc8fc3cb5e54d7f0db35/image.png)

* [ ]  Nodes lassen sich auswählen.
* [ ]  Nodes lassen sich durch erneutes auswählen der Node abwählen.

*Bei ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `CENTER`
* [ ]  Klick auf `CENTER` zentriert den Beweisbaum.
* [ ]  `EXPAND`
* [ ]  `EXPAND` öffnet einen Dialog in dem alle Klauseln aufgeführt sind.
* [ ]  das auswählen einer Klausel erweitert den Baum an dem Selektierten Blatt um die ausgewählte Klausel.
* [ ]  Blätter lassen sich durch Auswahl eines Vorgängers des gleichen Asts schließen.
* [ ]  Sofern eine Geschloßene Node vorhanden ist, `LEMMA`.
* [ ]  `LEMMA` markiert alle auswählbaren Klauseln.

*Bei nicht ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `CENTER`
* [ ]  Klick auf `CENTER` zentriert den Beweisbaum.
* [ ]  `NEXT LEAF`
* [ ]  Klick auf `NEXT LEAF` wählt das nächste offene Blatt aus und zentriert darauf.
* [ ]  `BACKTRACK`
* [ ]  Klick auf `BACKTRACK` setzt den Beweisbaum zurück auf den Stand vor dem letzten Move.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Bei FO-Tablaux:*
* [ ]  Das automatische Belegen der Variablen ist nur als Option verfügbar wenn es als Parameter gesetzt wird.

*Nur auf Desktop:*
* [ ]  Der Beweisbaum lässt sich mit Klauseln aus der Liste am linken Rand erweitern
* [ ]  Klick auf `CHECK` am linken Rand wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Darstellung:*
* [ ]  Ausgewählte Nodes werden farblich anders markiert.
* [ ]  Es wird eine zusätzliche Kante zwischen Blatt und der Node gezogen mit der geschlossen wurde.
* [ ]  Der Geschlossene Ast wird ausgegraut.
* [ ]  Die Zoom-Funktion funktioniert.
* [ ]  Lemma Klauseln werden umrandet makiert.
* [ ]  Wählt man eine Lemma Klausel, wird eine Linie zur Lemma source gezeichnet.


### Resolution

* [ ]  Prop-Resolution Test wird richtig angezeigt

![image](/uploads/67911aefed537371732734c6c8ef49ce/image.png)

* [ ]  FO-Resolution Test wird richtig angezeigt

![image](/uploads/3e94c1096989330bdf4953c596d1c09d/image.png)

* [ ]  Die Klauseln werden in einem Kreis angeordnet.
* [ ]  Klauseln lassen sich auswählen.
* [ ]  Klauseln lassen sich abwählen.
* [ ]  Beim Selektieren von 2 verschiedenen Klauseln werden diese Resoliert.
* [ ]  Falls mehr als 2 Literale dieser Klauseln sich relolieren lassen öffnet sich ein Dialog in dem man eines der Literale auswählen kann.

*Sowohl bei selectierter als auch nichtselectierter Node:*   
Der Floating Action Button zeigt  **...**
* [ ]  `CENTER`
* [ ]  Klick auf `CENTER` zentriert den Beweisbaum.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.
* [ ]  Falls mindestens eine Klausel ausgeblendet ist, `SHOW ALL`.
* [ ]  Klick auf `SHOW ALL` blendet alle ausgebelndeten Klauseln ein.

*Bei selectierter Node:*
* [ ]  `FACTORIZE`
* [ ]  Klick auf `FACTORIZE` Faktorisiert doppelte Literale.
* [ ]  `HIDE CLAUSE`
* [ ]  Klick auf `HIDE CLAUSE` blendet die Ausgewählte Klausel aus.

*Darstellung:*
* [ ]  Die Zoom-Funktion funktioniert

### DPLL

* [ ]  DPLL Test wird richtig angezeigt

![image](/uploads/bfe3bab1c1962d065b4149557a7964b9/image.png)

* [ ]  Nodes lassen sich auswählen und zeigen den aktuellen stand des Klausel satzes
* [ ]  Beim auswählen von zwei Klauseln öffnet sich der `Choose Literal` Dialog.

*Sowohl bei selectierter als auch nichtselectierter Node:*   
Der Floating Action Button zeigt  **...**
* [ ]  `PRUNE`
* [ ]  Klick auf `PRUNE` setzt den Beweisbaum bis zur selektierten Node zurück.
* [ ]  `SPLIT`
* [ ]  Klick auf `SPLIT` öffnet den `Select Literal` Dialog.

## UI Designe
* [ ]  ausreichend Kontrast
* [ ]  touch Freundlichkeit (einfaches bedienen auf mobilen Endgeräten)