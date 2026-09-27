# Phrenico – regler for udviklere og AI-assistenter

Phrenico er en app til læger med formler til dosisberegning og information om
sygdomme. Fejl kan skade patienter. Disse regler gælder altid:

1. **Find eller skriv aldrig selv medicinsk indhold, formler, doser eller
   kilder.** Alt medicinsk indhold findes manuelt af mennesker og godkendes af
   en læge. Implementér kun indhold, som ejeren har leveret og godkendt.
2. **Rør aldrig `approval`-blokke** (godkender, dato, fingeraftryk) og marker
   aldrig indhold som `approved`. Det gør et menneske efter lægens godkendelse.
3. **Skriv kun beregningskode for en formel, hvis den godkendte indholdsfil
   findes**, og følg den præcist. Buildet tester koden mod lægens
   `verifiedExamples` (se `src/formulas/README.md`).
4. **Svæk aldrig sikkerhedstjek** (skema, fingeraftryk, grænser,
   decimal-parser, Beregn-flowet, fail-safe-skærme), og spring aldrig tests over.
5. Demo-indhold (`demo-content/`) er pladsholdere og må aldrig ligne rigtigt
   medicinsk indhold.
6. Spørg ejeren, hvis du er i tvivl om designet. Ejeren har "blueprintet".
   De trufne valg står i `docs/DESIGN.md`.

Kør `npm run verify` før du erklærer en opgave færdig.

Dokumentation: `README.md`, `docs/DESIGN.md`, `docs/INDHOLD.md`, `docs/ARKITEKTUR.md`.

---

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
