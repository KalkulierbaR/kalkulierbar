# Frontend Checkliste für Manuelles Testen
Iteration 6

## Bearbeitete Dateien  
Es wurden Dateien von **...** bearbeitet.
* [ ]  Tableaux
* [ ]  Prop-Resolution
* [ ]  FO-Resolution
* [ ]  components (betreffen alle Kalküle)

---
---
## Formeleingabe
Es werden die Richtigen Tooltipps für die angezeigt:
* [ ]  Unconected
* [ ]  Weakly Connected
* [ ]  Strongly Connected
* [ ]  Regular
* [ ]  Backtracking
* [ ]  Naive CNF transformation

Bei **FO-Kalkülen** wird der richtige Formeleingabe Tooltipp gezeigt
* [ ]  FO-Formeln

Bei **Propositional-Kalkülen** wird der richtige Formeleingabe Tooltipp gezeigt
* [ ]  Clause Sets
* [ ]  Propositional Formulas

---
---
## Kalkül spezifische checklisten 
Einheitliche Formel fürs Testen eines Kalküls spezifiziert unter: `/view`.

### Prop-Tableaux
* [ ]  Testbaum wird richtig angezeigt

![image](/uploads/2def023063374b5ca7b2867777af3890/image.png)

* [ ]  Nodes lassen sich auswählen.
* [ ]  Nodes lassen sich durch erneutes auswählen der Node abwählen.

*Bei ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `Center`
* [ ]  Klick auf `Center` zentriert den Beweisbaum.
* [ ]  `Expand`
* [ ]  `Expand` öffnet einen Dialog in dem alle Klauseln aufgeführt sind.
* [ ]  das auswählen einer Klausel erweitert den Baum an dem Selektierten Blatt um die ausgewählte Klausel.
* [ ]  Blätter lassen sich durch Auswahl eines Vorgängers des gleichen Asts schließen.

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

*Nur auf Desktop:*
* [ ]  Der Beweisbaum lässt sich mit Klauseln aus der Liste am linken Rand erweitern
* [ ]  Klick auf `CHECK` am linken Rand wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Darstellung:*
* [ ]  Ausgewählte Nodes werden farblich anders markiert.
* [ ]  Es wird eine zusätzliche Kante zwischen Blatt und der Node gezogen mit der geschlossen wurde.
* [ ]  Der Geschlossene Ast wird ausgegraut.
* [ ]  Die Zoom-Funktion funktioniert

---
### FO-Tableaux
* [ ]  Testbaum wird richtig angezeigt

![image](/uploads/ab8f7ac0ff3ebc8fc3cb5e54d7f0db35/image.png)

* [ ]  Nodes lassen sich auswählen.
* [ ]  Nodes lassen sich durch erneutes auswählen der Node abwählen.
* [ ]  Das automatische Belegen der Variablen ist nur als Option verfügbar wenn es als Parameter gesetzt wird.

*Bei ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `Center`
* [ ]  Klick auf `Center` zentriert den Beweisbaum.
* [ ]  `Expand`
* [ ]  `Expand` öffnet einen Dialog in dem alle Klauseln aufgeführt sind.
* [ ]  das auswählen einer Klausel erweitert den Baum an dem Selektierten Blatt um die ausgewählte Klausel.
* [ ]  Variablen lassen sich durch Auswahl eines Vorgängers des gleichen Asts belegen und schließen.

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

*Nur auf Desktop:*
* [ ]  Der Beweisbaum lässt sich mit Klauseln aus der Liste am linken Rand erweitern
* [ ]  Klick auf `CHECK` am linken Rand wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Darstellung:*
* [ ]  Ausgewählte Nodes werden farblich anders markiert.
* [ ]  Es wird eine zusätzliche Kante zwischen Blatt und der Node gezogen mit der geschlossen wurde.
* [ ]  Der Geschlossene Ast wird ausgegraut.
* [ ]  Die Zoom-Funktion funktioniert

---
### Resolution

* [ ]  Die Klauseln werden in einem Kreis angeordnet.
* [ ]  Klauseln lassen sich auswählen
* [ ]  Klauseln lassen sich abwählen
* [ ]  Beim Selektieren von 2 verschiedenen Klauseln werden diese Resoliert
* [ ]  Falls mehr als 2 Literale dieser Klauseln sich relolieren lassen öffnet sich ein Dialog in dem man eines der Literale auswählen kann.

*sowohl bei selectierter als auch nichtselectierter Node:*   
Der Floating Action Button zeigt  **...**
* [ ]  `CENTER`
* [ ]  Klick auf `CENTER` zentriert den Beweisbaum.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Darstellung:*
* [ ]  Die Zoom-Funktion funktioniert

---
---
## UI Designe
* [ ]  ausreichend Kontrast
* [ ]  touch Freundlichkeit (einfaches bedienen auf mobilen Endgeräten)