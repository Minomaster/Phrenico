# Indhold og godkendelse

Denne side beskriver, hvordan lægegodkendt indhold kommer ind i Phrenico, og
hvilke sikkerhedstjek det skal igennem. **Hverken udviklere eller AI må selv
finde medicinsk viden, formler eller kilder.** Alt medicinsk indhold findes
manuelt af mennesker og kontrolleres af en læge, før det lægges ind.

## Kort fortalt

```
Kilde fundet af et menneske
        │
        ▼
1. Udkast        content/formler/<id>.yaml eller content/sygdomme/<id>.yaml
                 status: draft  →  kommer ALDRIG med i appen
        │
        ▼
2. Lægens kontrol  Lægen læser den færdige fil (eller en demo-visning) og
                   godkender præcis den tekst og de tal, der står der
        │
        ▼
3. Godkendelse   approvedBy, approvedAt, status: approved
                 + fingeraftryk:  npm run content:fingerprint -- <fil>
        │
        ▼
4. Build         npm run content:build   (stopper ved enhver fejl)
        │
        ▼
5. Kontrol       npm run verify  (kører også automatisk i CI og i EAS-builds)
```

## Hvor ligger hvad

| Mappe | Indhold |
| --- | --- |
| `content/formler/` | Én YAML-fil pr. formel. **Det rigtige, godkendte indhold.** |
| `content/sygdomme/` | Én YAML-fil pr. sygdomsside. |
| `content/skabeloner/` | Skabeloner med forklaring af hvert felt. Bygges aldrig ind i appen. |
| `demo-content/` | Pladsholderindhold (ikke medicinsk), kun til design og test. |
| `src/content/generated/` | Genererede filer. Rettes aldrig i hånden. |
| `src/formulas/registry.ts` | Kobler hver formel til koden, der regner den ud. |

## Arbejdsgang trin for trin

### 1. Opret et udkast

Kopiér `content/skabeloner/formel.yaml` (eller `sygdom.yaml`) til
`content/formler/<id>.yaml`. Filnavnet skal være det samme som `id`. Udfyld
filen med det indhold, lægen har leveret. Lad `approval.status` være `draft`.

Et udkast kommer aldrig med i appen. Fejl i et udkast giver kun en advarsel,
så man kan arbejde på det i ro.

### 2. Lægens kontrol

Lægen skal godkende **den færdige fil**, ikke kun kildematerialet. Det
beskytter mod tastefejl ved indtastningen, fx at "0,5" er blevet til "5".
For formler skal lægen også levere og kontrollere de
**lægeverificerede eksempler** (`verifiedExamples`): konkrete indtastninger
og det resultat, de skal give. Medtag gerne grænseværdier.

### 3. Registrér godkendelsen

Når lægen har godkendt filen:

```bash
npm run content:fingerprint -- content/formler/<id>.yaml
```

Kopiér fingeraftrykket ind i filen, og udfyld resten:

```yaml
approval:
  status: approved
  approvedBy:
    name: <Lægens navn>
    title: <fx Overlæge, afdeling>
  approvedAt: 2026-01-15
  reviewBy: 2027-01-15        # valgfrit: hvornår siden skal gennemgås igen
  fingerprint: <64 tegn fra kommandoen>
```

Fingeraftrykket er beregnet ud fra alt i filen undtagen `approval`. Ændres
blot ét tegn i indholdet bagefter, passer fingeraftrykket ikke, og **appen kan
ikke bygges**, før lægen har godkendt den nye version. Kommentarer, citationstegn
og rækkefølgen af felter påvirker ikke fingeraftrykket.

### 4. For formler: skriv beregningskoden

Se [`src/formulas/README.md`](../src/formulas/README.md). Koden skal regne
præcis det, der står i den godkendte fil, og den skal ramme alle
lægeverificerede eksempler, ellers stopper buildet.

### 5. Byg og kontrollér

```bash
npm run content:build   # validerer og skriver src/content/generated/approved.json
npm run verify          # indholdstjek, typer, lint og alle tests
```

Commit både YAML-filen og den genererede JSON-fil. I en pull request kan man
så se præcis, hvilket indhold der kommer ind i appen.

## Hvad buildet tjekker

Buildet stopper, hvis en godkendt side:

- mangler kilde (`sources`), godkendende læge (`approvedBy`) eller dato (`approvedAt`)
- er ændret efter godkendelsen (fingeraftrykket passer ikke)
- har et filnavn, der ikke svarer til `id`, eller et `id`, der bruges to gange
- henviser til en side, der ikke findes
- (formel) mangler beregningskode eller ikke rammer et lægeverificeret eksempel
- (formel) har et eksempel med en værdi uden for de tilladte grænser

Buildet advarer (uden at stoppe), hvis:

- en side linker til en side, der endnu ikke er godkendt (linket skjules i appen)
- datoen for næste gennemgang (`reviewBy`) er overskredet (vises også på siden)

Appen tjekker desuden den indbyggede indholdsfil, når den starter. Består den
ikke kontrollen, viser appen en fejlside og **intet indhold**, hellere end
delvist indhold.

## Felter

### Fælles for formler og sygdomme

| Felt | Vises i appen som | Krav |
| --- | --- | --- |
| `id` | (bruges i links og favoritter) | små bogstaver a–z, tal og bindestreger. Skift det aldrig. |
| `title` | Titel øverst og i lister | påkrævet |
| `summary` | Kort beskrivelse under titlen og i lister | påkrævet |
| `keywords` | (bruges kun af søgningen) | synonymer, forkortelser |
| `sources` | Kilde og godkendelse → Kilder | mindst én |
| `approval` | Linjen "Godkendt af …" og sektionen Kilde og godkendelse | se ovenfor |
| `version` | Kilde og godkendelse → Version | hæves med 1 ved hver ændring |

### Formel (`content/formler/`)

| Felt | Vises i appen som |
| --- | --- |
| `inputs` | Felterne. `kind: number` (tal med enhed, `min`, `max`, `maxDecimals`) eller `kind: choice` (valgmuligheder). |
| `outputs` | Resultatboksen. `decimals` styrer afrundingen (halvt op). |
| `documentation` | Fold-ud: Dokumentation |
| `example` | Fold-ud: Eksempel på brug |
| `verifiedExamples` | Vises ikke. Bruges til automatisk at teste koden. |
| `relatedDiseases` | Relaterede sygdomme nederst |

### Sygdom (`content/sygdomme/`)

| Felt | Vises i appen som |
| --- | --- |
| `causes` | Årsager |
| `symptoms` | Symptomer |
| `treatment` | Behandling (praktisk vejledning) |
| `relatedFormulas` | Relaterede formler |

### Tekstblokke

Al brødtekst skrives som en liste af blokke:

```yaml
causes:
  - type: paragraph
    text: Almindelig tekst. **Fed tekst** markeres med to stjerner.
  - type: bullets
    items: [Punkt, Punkt]
  - type: steps          # nummererede trin
    items: [Første trin, Andet trin]
  - type: warning        # fremhævet advarsel
    text: Vigtig advarsel.
```

Der findes ingen anden formatering, så teksten altid vises præcis som godkendt.

## Sikkerhedsregler i formel-motoren

- Tal skrives med komma (`12,5`). Punktum accepteres også (`12.5`), men
  `1.000` afvises som tvetydigt, fordi det på dansk normalt betyder tusind.
- Værdier uden for `min`–`max`, for mange decimaler eller ugyldig tekst bliver
  **afvist med en forklaring og aldrig rettet eller afrundet**.
- Resultatet vises først, når lægen trykker **Beregn**, og forsvinder, så
  snart et felt ændres.
- Resultatet vises sammen med de værdier, det er beregnet ud fra, og selve
  udregningen.
- Giver koden en fejl, NaN eller uendelig, vises der intet resultat.
