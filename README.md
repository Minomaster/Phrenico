# Phrenico

Opslags- og beregningsapp til unge læger (Android og iOS): formler til
dosisberegning, information om sygdomme (årsager, symptomer, behandling),
søgning, favoritter og feedback til udvikleren.

> **Status: fundament.** Appen har design, navigation, alle skærme og de
> generiske motorer (søgning, favoritter, formel-motor, feedback,
> godkendelsestjek), men **intet medicinsk indhold og ingen rigtige formler**.
> Det lægges ind senere, når det er fundet manuelt og godkendt af en læge.
> Se [docs/INDHOLD.md](docs/INDHOLD.md).

## Kom i gang

Kræver Node.js 22.

```bash
npm install
npm start          # med det godkendte indhold (tomt indtil videre)
npm run demo       # med pladsholderindhold, så designet kan ses
```

Åbn appen i **Expo Go** på telefonen (scan QR-koden), eller tryk `w` for
browseren. `npm run demo:web` åbner demo-visningen direkte i browseren.

Før du committer:

```bash
npm run verify     # indholdstjek, typecheck, lint og alle tests
```

## Dokumentation

- [docs/DESIGN.md](docs/DESIGN.md): farver, typografi, skærme og de trufne designvalg
- [docs/INDHOLD.md](docs/INDHOLD.md): hvordan lægegodkendt indhold kommer i appen
- [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md): opbygning, sikkerhedsmekanismer, byg og udgivelse
- [src/formulas/README.md](src/formulas/README.md): sådan skrives koden til en godkendt formel

## Den vigtigste regel

Hverken udviklere eller AI må selv finde medicinsk viden, formler eller
kilder. Alt medicinsk indhold findes manuelt af mennesker og godkendes af en
læge. Koden sørger for, at kun godkendt og uændret indhold kan komme i appen.
