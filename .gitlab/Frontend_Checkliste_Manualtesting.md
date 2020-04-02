# Frontend Checkliste für Manuelles Testen
Stand Iteration 10

## Bearbeitete Dateien  
Es wurden Dateien von **...** bearbeitet.
* [ ]  Tableaux
* [ ]  Resolution
* [ ]  DPLL
* [ ]  NC-Tableaux
* [ ]  Components (betreffen alle Kalküle)


## Landingpage
Alle Verfügbaren Kalkühle sind auswählbar:
* [ ]  Prop-Tableaux
* [ ]  FO-Tableaux
* [ ]  Prop-Resolution
* [ ]  FO-Resolution
* [ ]  DPLL
* [ ]  NC-Tableaux

## Admin Interface
Einloggen:
* [ ]  das Wechseln in die Admin Einstellung ist nur mit dem richtigen Key möglich (definiert in kbar-state.json im Backend)

Eingeloggt:
* [ ]  die Formeleingabe wird um den Button `Add Example` erweitert.
* [ ]  Klick auf `Add Example` öffnet einen Dialog in dem Name und Beschreibung des Beispiels angegeben werden können.
* [ ]  Die Beispiele werden um den Button `delete` erweitert.
* [ ]  Klick auf `delete` entfernt das Beispiel.
* [ ]  Kalküle können aus- bzw. angeschaltet werden.
* [ ]  Das Ausloggen ist möglich.


## Formeleingabe
Es werden die richtigen Tooltipps für Kalküloptionen angezeigt:
* [ ]  Unconnected
* [ ]  Weakly Connected
* [ ]  Strongly Connected
* [ ]  Regular
* [ ]  Backtracking
* [ ]  Naive CNF transformation
* [ ]  Manual unification
* [ ]  No visual help
* [ ]  Highlight resolution partners
* [ ]  Rearrange resolution partners

Beispiele
* [ ]  Beispiele, sofern bisher definiert, sind auswählbar

Bei **FO-Kalkülen** wird die richtige Format-Erklärung gezeigt
* [ ]  FO-Formeln
* [ ]  Bei Eingabe von "/.." oder "\\.." im Formel-Input wird Autovervollständigung für Quantoren vorgeschlagen.

Bei **Propositional-Kalkülen** wird die richtige Format-Erklärung gezeigt
* [ ]  Clause Sets
* [ ]  Propositional Formulas

## Kalkülspezifische Checklisten 
Einheitliche Formel fürs Testen eines Kalküls spezifiziert als Beispiel.

### Tableaux

View
* [ ]  Prop-Testbaum wird richtig angezeigt

![image](/uploads/2def023063374b5ca7b2867777af3890/image.png)

* [ ]  FO-Testbaum wird richtig angezeigt

![image](/uploads/ab8f7ac0ff3ebc8fc3cb5e54d7f0db35/image.png)

* [ ]  Nodes lassen sich auswählen.
* [ ]  Nodes lassen sich verschieben.
* [ ]  Nodes lassen sich durch erneutes auswählen der Node abwählen.

*Bei ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `RESET VIEW`
* [ ]  Klick auf `RESET VIEW` zentriert den Beweisbaum.
* [ ]  `EXPAND`
* [ ]  `EXPAND` öffnet einen Dialog in dem alle Klauseln aufgeführt sind.
* [ ]  Das Auswählen einer Klausel erweitert den Baum am selektierten Blatt um die ausgewählte Klausel.
* [ ]  Blätter lassen sich durch Auswahl eines Vorgängers des gleichen Asts schließen.
* [ ]  Sofern eine geschlossene Node vorhanden ist, `LEMMA`.
* [ ]  `LEMMA` markiert alle auswählbaren Klauseln.

*Bei nicht ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `RESET VIEW`
* [ ]  Klick auf `RESET VIEW` zentriert den Beweisbaum.
* [ ]  `NEXT LEAF`
* [ ]  Klick auf `NEXT LEAF` wählt das nächste offene Blatt aus und zentriert darauf.
* [ ]  `UNDO`
* [ ]  Klick auf `UNDO` setzt den Beweisbaum zurück auf den Stand vor dem letzten Move.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.
* [ ]  `DOWNLOAD`
* [ ]  Klick auf `DOWNLOAD` speichert den aktuellen State lokal.

*Bei FO-Tablaux:*
* [ ]  Das automatische Belegen der Variablen ist nur als Option verfügbar wenn es als Parameter gesetzt wird.

*Darstellung:*
* [ ]  Ausgewählte Nodes werden farblich anders markiert.
* [ ]  Es wird eine zusätzliche Kante zwischen Blatt und der Node gezogen mit der geschlossen wurde.
* [ ]  Der geschlossene Ast wird ausgegraut.
* [ ]  Die Zoom-Funktion funktioniert.
* [ ]  Lemma Klauseln werden umrandet markiert.
* [ ]  Wählt man eine Lemma Klausel, wird eine Linie zur Lemma source gezeichnet.


### Resolution

View
* [ ]  Prop-Resolution Test wird richtig angezeigt

![image](/uploads/67911aefed537371732734c6c8ef49ce/image.png)

* [ ]  FO-Resolution Test wird richtig angezeigt

![image](/uploads/3e94c1096989330bdf4953c596d1c09d/image.png)


* [ ]  Die Klauseln werden in einem Kreis angeordnet.
* [ ]  man kann zwichen Kreis und Grid view wechseln
* [ ]  Klauseln lassen sich auswählen.
* [ ]  Klauseln lassen sich abwählen.
* [ ]  Klauseln lassen sich verschieben.
* [ ]  Beim Selektieren von 2 verschiedenen Klauseln werden diese resolviert.
* [ ]  Falls mehr als 2 Literale dieser Klauseln sich resolvieren lassen öffnet sich ein Dialog in dem man eines der Literale auswählen kann.

*Sowohl bei selektierter als auch nichtselektierter Node:*   
Der Floating Action Button zeigt  **...**
* [ ]  `CENTER`
* [ ]  Klick auf `CENTER` zentriert den Kreis bzw das Grid.
* [ ]  Falls mindestens eine Klausel ausgeblendet ist, `SHOW ALL`.
* [ ]  Klick auf `SHOW ALL` blendet alle ausgebelndeten Klauseln ein.

*Bei selektierter Node:*
* [ ]  `FACTORIZE`
* [ ]  Klick auf `FACTORIZE` faktorisiert doppelte Literale.
* [ ]  `HYPER RESOLUTION`
* [ ]  Klick auf `HYPER RESOLUTION` ermöglicht es mehrere Klauseln direkt zu resolvieren..
* [ ]  `HIDE CLAUSE`
* [ ]  Klick auf `HIDE CLAUSE` blendet die Ausgewählte Klausel aus.

*Bei nicht selektierter Node:*
* [ ]  `DOWNLOAD`
* [ ]  Klick auf `DOWNLOAD` speichert den aktuellen State lokal.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.

*Darstellung:*
* [ ]  Die Zoom-Funktion funktioniert

### DPLL

View
* [ ]  DPLL Test wird richtig angezeigt

![image](/uploads/bfe3bab1c1962d065b4149557a7964b9/image.png)

* [ ]  Nodes lassen sich auswählen und zeigen den aktuellen Stand der Klauselmenge
* [ ]  Beim auswählen von zwei Klauseln öffnet sich der `Choose Literal` Dialog.

*Sowohl bei selektierter als auch nichtselektierter Node:*   
Der Floating Action Button zeigt  **...**
* [ ]  `PRUNE`
* [ ]  Klick auf `PRUNE` setzt den Beweisbaum bis zur selektierten Node zurück.
* [ ]  `SPLIT`
* [ ]  Klick auf `SPLIT` öffnet den `Select Literal` Dialog.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.
* [ ]  `DOWNLOAD`
* [ ]  Klick auf `DOWNLOAD` speichert den aktuellen State lokal.

### NC-Tablaux

View
* [ ]  NC-Tablaux Test wird richtig angezeigt, nach Anwendung des Alpha moves

![nc_tablauxe](/uploads/5d345edd8874ff3187ca280bc02e7f2b/nc_tablauxe.PNG)

* [ ]  Nodes lassen sich auswählen.
* [ ]  Nodes lassen sich verschieben.
* [ ]  Nodes lassen sich durch erneutes auswählen der Node abwählen.

*Bei ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `RESET VIEW`
* [ ]  Klick auf `RESET VIEW` zentriert den Beweisbaum.
* [ ]  bei Auswahl von `(((∀X: ¬R(f(X))) ∧ (R(f(a)) ∨ ¬R(f(b)))) ∧ (∀X: R(f(X))))` `ALPHA`
* [ ]  bei Auswahl von `(R(f(a)) ∨ ¬R(f(b)))` `BETA`
* [ ]  bei Auswahl von `R(f(X_1))` `GAMMA`

*Bei nicht ausgewählter Klausel:*  
Floating Action Button zeigt **...**
* [ ]  `RESET VIEW`
* [ ]  Klick auf `RESET VIEW` zentriert den Beweisbaum.
* [ ]  `UNDO`
* [ ]  Klick auf `UNDO` setzt den Beweisbaum zurück auf den Stand vor dem letzten Move.
* [ ]  `CHECK`
* [ ]  Klick auf `CHECK` wirft Konfetti sofern der Beweis laut Backend geschlossen ist.
* [ ]  `DOWNLOAD`
* [ ]  Klick auf `DOWNLOAD` speichert den aktuellen State lokal.

*Darstellung:*
* [ ]  Ausgewählte Nodes werden farblich anders markiert.
* [ ]  Es wird eine zusätzliche Kante zwischen Nodes gezogen mit denen geschlossen wurde.
* [ ]  Der geschlossene Ast wird ausgegraut.
* [ ]  Die Zoom-Funktion funktioniert.
