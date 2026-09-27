# Beregningskode for formler

Hver formel består af to dele:

1. **Indholdet** i `content/formler/<id>.yaml`: felter, enheder, grænser,
   afrunding, tekster, kilder og lægens godkendelse. Se `docs/INDHOLD.md`.
2. **Koden**, der regner resultatet ud. Den ligger her i `src/formulas/`.

Koden må kun skrives, **efter** indholdsfilen er godkendt af en læge, og den
skal regne præcis det, der står i filen. Hverken udviklere eller AI må selv
finde eller "forbedre" formler.

## Sådan tilføjes koden til en godkendt formel

1. Opret `src/formulas/implementations/<id>.ts`:

   ```ts
   import { numberInput } from '../inputs';
   import type { FormulaImplementation } from '../types';

   export const minFormel: FormulaImplementation = {
     id: '<id>', // samme id som i YAML-filen
     compute: (inputs) => {
       const a = numberInput(inputs, '<feltId>');
       // … præcis den godkendte formel …
       return {
         outputs: { '<resultatId>': resultat }, // IKKE afrundet
         steps: ['Udregningen, som lægen kan kontrollere'],
       };
     },
   };
   ```

2. Tilføj den i `approvedImplementations` i `registry.ts`.
3. Kør `npm run content:build` og `npm run verify`. Buildet kører alle
   lægeverificerede eksempler (`verifiedExamples`) gennem koden. Ét forkert
   resultat stopper buildet.

## Regler for koden

- **Ingen afrunding i koden.** Motoren afrunder med det antal decimaler, der
  står i indholdsfilen (halvt op).
- **Ingen rettelse af input.** Motoren har allerede afvist ugyldige værdier og
  værdier uden for grænserne, før koden kaldes.
- **Ren funktion:** samme input giver altid samme resultat, og der er ingen
  sideeffekter, ingen netværk og ingen dato/tid.
- `numberInput` og `choiceInput` fra `inputs.ts` kaster en fejl, hvis en værdi
  mangler. Motoren viser så en fejlbesked i stedet for et resultat.
- Returnér `steps` (udregningen), så lægen kan se, hvordan resultatet opstod.

`demo/demoFormulas.ts` indeholder tre pladsholderformler (sum, produkt,
kvotient), som kun bruges til at vise designet (`npm run demo`) og til tests.
De er ikke medicinske.
