# content/: det lægegodkendte indhold

Her ligger appens rigtige medicinske indhold. Mapperne er tomme, indtil det
første indhold er godkendt af en læge.

- `formler/`: én YAML-fil pr. formel
- `sygdomme/`: én YAML-fil pr. sygdomsside
- `skabeloner/`: skabeloner med forklaring af hvert felt (bygges ikke ind)

Kun filer med `approval.status: approved` og et gyldigt fingeraftryk kommer med
i appen. Læs hele arbejdsgangen i [`docs/INDHOLD.md`](../docs/INDHOLD.md).

> Hverken udviklere eller AI må selv finde medicinsk viden, formler eller
> kilder. Alt indhold her er fundet af mennesker og godkendt af en læge.
