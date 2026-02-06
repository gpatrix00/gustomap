

## Miglioramento Navigazione Mappa - Dettaglio Recensione

### Obiettivo
Quando l'utente clicca su un pin nella mappa, la mappa deve scomparire e deve aprirsi la vista completa della recensione, permettendo una navigazione fluida.

### Soluzione Proposta

Il cambiamento e semplice ma efficace: quando si apre il dettaglio di una recensione dalla mappa, la vista passa automaticamente alla modalita lista e si apre il dettaglio. In questo modo la mappa scompare e l'utente puo navigare la recensione senza distrazioni.

### Modifiche Tecniche

**File: `src/pages/Index.tsx`**

Modificare il handler `onReviewClick` nella `MapView` per:
1. Cambiare la vista da "map" a "list" (`setViewMode("list")`)
2. Aprire il dettaglio della recensione

```text
onReviewClick={(id) => {
  const review = reviews.find((r) => r.id === id);
  if (review) {
    setViewMode("list");  // <- Aggiungere questa linea
    handleReviewClick(review);
  }
}}
```

### Comportamento Risultante

1. Utente visualizza la mappa con i pin delle recensioni
2. Clicca su un pin
3. La mappa scompare, la vista torna alla lista
4. Si apre la Sheet con il dettaglio completo della recensione (a schermo intero)
5. Quando chiude il dettaglio, si trova nella vista lista
6. Puo tornare alla mappa usando il toggle in alto

### Vantaggi
- Modifica minima e non invasiva (1 riga di codice)
- La mappa viene smontata completamente, liberando risorse
- L'esperienza utente e coerente con il resto dell'app
- Il pulsante "indietro" nella recensione funziona gia correttamente

