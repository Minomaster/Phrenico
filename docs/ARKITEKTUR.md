# Arkitektur

## Overblik

```
content/*.yaml ──(npm run content:build)──► src/content/generated/approved.json
   (lægegodkendt)     validering, fingeraftryk,         (indbygget i appen,
                      lægeverificerede eksempler         virker offline)
                                                               │
src/formulas/registry.ts ─── beregningskode ───┐               │
                                               ▼               ▼
                                   Appen (Expo Router): Søg · Formler · Sygdomme ·
                                   Favoritter · Mere, formel- og sygdomssider
```

- **Teknologi:** React Native + Expo SDK 57, TypeScript (strict), Expo Router.
- **Indhold:** YAML-filer, der valideres og samles i én JSON-fil ved build.
  Appen tjekker filen igen ved opstart (zod-skema) og viser intet indhold,
  hvis den ikke består.
- **Tilstand:** favoritter, "senest brugt", tema og accept af
  ansvarsfraskrivelsen gemmes lokalt (AsyncStorage via zustand). Der er
  ingen server, intet login og ingen patientdata.
- **Feedback:** åbner telefonens mail-app med en udfyldt mail (`mailto:`).

## Mapper

| Sti | Indhold |
| --- | --- |
| `src/app/` | Skærme (Expo Router). `(tabs)/` er bundmenuen. |
| `src/components/` | Genbrugelige UI-komponenter (design-systemet) |
| `src/theme/` | Farver, typografi, afstande, lys/mørk |
| `src/content/` | Skema, indlæsning, opslag, genereret indhold |
| `src/formulas/` | Formel-motor, decimal-parser, afrunding, registry |
| `src/search/` | Tekstsøgning og dansk sortering |
| `src/state/` | Lokalt gemte data (favoritter, historik, indstillinger) |
| `src/feedback/` | Opbygning af feedback-mailen, CPR-tjek |
| `src/config/` | App-navn, version, feedback-adresse, ansvarsfraskrivelse |
| `src/i18n/da.ts` | Al tekst i brugerfladen |
| `scripts/content/` | Build, tjek og fingeraftryk af indhold |
| `content/`, `demo-content/` | Godkendt indhold / pladsholderindhold |

## Sikkerhedsmekanismer

1. **Intet ugodkendt indhold i appen.** Kun sider med `status: approved`,
   godkendende læge, dato, kilde og et gyldigt fingeraftryk kommer med.
2. **Ingen stille ændringer.** Ændres en godkendt side, passer fingeraftrykket
   ikke, og buildet stopper, indtil siden er godkendt igen.
3. **Koden testes mod lægens eksempler** i hvert build, i `npm test` og i CI.
4. **Streng indtastning:** ugyldige tal, tvetydige tal (`1.000`), for mange
   decimaler og værdier uden for grænserne afvises med en forklaring og
   rettes aldrig.
5. **Beregn-knap:** resultatet vises først ved tryk og forsvinder ved enhver
   ændring. Det vises altid sammen med de brugte værdier og udregningen.
6. **Fail-safe:** giver koden en fejl, NaN eller uendelig, vises intet
   resultat. Består den indbyggede indholdsfil ikke kontrollen, vises intet
   indhold.
7. **Demo-indhold kan ikke udgives.** Det kræver en udviklingsversion
   (`__DEV__`) og `npm run demo`, og det har altid et DEMO-banner. Demo-filen
   kommer slet ikke med i en udgivet app (kontrolleret med et produktionsbuild).
8. **Sporbarhed:** hver side viser godkender, dato, version og
   fingeraftryk. Feedback-mails indeholder side-id, version og indholdsversion.
9. **Ingen patientdata:** intet sendes til servere. Feedback advarer mod
   patientoplysninger og blokerer CPR-numre.

## Kommandoer

| Kommando | Gør |
| --- | --- |
| `npm start` | Starter udviklingsserveren (godkendt indhold) |
| `npm run demo` | Starter med pladsholderindhold til designarbejde |
| `npm run web` / `npm run demo:web` | Samme i browseren (kun til forhåndsvisning) |
| `npm run content:build` | Validerer indholdet og skriver de genererede filer |
| `npm run content:check` | Tjekker indholdet uden at skrive (CI og EAS) |
| `npm run content:fingerprint -- <fil>` | Viser fingeraftrykket til godkendelsen |
| `npm run verify` | Indholdstjek, typecheck, lint og alle tests |

## Byg og udgiv

Appen bygges med EAS (Expo Application Services) i skyen, så iOS-versionen
ikke kræver en Mac: `npx eas-cli@latest build --profile preview` (til test)
eller `--profile production`. EAS kører automatisk `npm run content:check`
efter installation (`eas-build-post-install`), så en app aldrig kan bygges
med ugyldigt eller forældet indhold.

Før første udgivelse skal der vælges:

- `ios.bundleIdentifier` og `android.package` i `app.json` (fx et domæne, I ejer)
- feedback-adressen (`expo.extra.feedbackEmail` i `app.json`)
- den endelige tekst til ansvarsfraskrivelsen (`src/config/disclaimer.ts`)
- rigtigt app-ikon og logo (`assets/`, `src/components/AppLogo.tsx`)

## Regulatorisk (vigtigt før klinisk brug)

Software, der beregner doser til den enkelte patient, kan være **medicinsk
udstyr** efter EU-forordningen om medicinsk udstyr (MDR, 2017/745) og kræver i
så fald CE-mærkning, før den må bruges klinisk. En ansvarsfraskrivelse ændrer
ikke nødvendigvis på det. Afklar det med Lægemiddelstyrelsen og/eller en
regulatorisk rådgiver, og få ansvarsfraskrivelsen vurderet af en jurist.
Fundamentet understøtter dokumentationen (sporbarhed fra godkendt indhold til
app-version og automatiske tests af lægeverificerede eksempler), men gør ikke
i sig selv appen godkendt.
