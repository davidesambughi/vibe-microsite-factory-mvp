**Contract-Driven AI-First Development (v4)Goal**



**Costruire sistemi software affidabili e modulari in domini che il developer umano non conosce ancora a fondo, usando l'AI come partner cognitivo ed esecutivo, vincolato da contratti rigidi e pattern di integrazione espliciti.**



**Guiding Principles:**



**1.Model before you code. Prima si capisce e si modella il dominio, poi si scrive codice.**

**2.Think in pipelines. Ogni sistema va ridotto a input → trasformazioni → output.**

**3.Decompose cognitively. I moduli sono unità di responsabilità concettuale, non solo tecnica.**

**4.Architecture follows cognition. L'architettura tecnica deriva dalla decomposizione cognitiva, non il contrario.**

**5.Integration Patterns before connections. Specifica come i moduli comunicano (sync/async/error handling) prima di implementarli.**

**6.Contracts before implementation. Interfacce e schemi dati sono la fonte di verità e precedono il codice.**

**7.Bounded Delegation to AI (one module at a time) . Scegli un modulo. Fornisci all'AI:** 

* **il contratto di quel modulo,**
* **il ruolo del modulo nel flusso di integrazione (dal STEP 4.5),**
* **i vincoli tecnici (stack, pattern, cosa può/non può fare),**
* **stub o interfacce verso altri moduli.**
* **Chiedi l'implementazione solo di quel modulo, rispettando contratti e vincoli.**
* 
**8.AI code as a hypothesis. Il codice generato è un primo tentativo da validare, non il risultato finale.**

**9.Validate behavior, not style. Si giudicano gli output e il rispetto degli schemi, non la "bellezza" del codice.**

**10.Iterate via contracts. Ogni cambiamento di comportamento passa prima dai contratti e dai test, poi dal codice.**

**11.Refactor after success. Il refactoring avviene solo dopo il funzionamento end-to-end, senza cambiare il comportamento osservabile.**

**12.Document cognition. Decisioni, contratti e cambi di modello vanno tracciati per creare una traccia cognitiva del progetto.**



