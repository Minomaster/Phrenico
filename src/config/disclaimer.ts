/**
 * The disclaimer that must be accepted the first time the app is opened.
 *
 * ⚠ The text is a DRAFT. It must be reviewed (preferably by a lawyer) and
 * approved by the owner of the app before release. When the text is final:
 *   1. set DISCLAIMER_IS_DRAFT to false
 *   2. raise DISCLAIMER_VERSION by 1 every time the text changes, so every
 *      user has to accept the new text again.
 */
export const DISCLAIMER_VERSION = 1;
export const DISCLAIMER_IS_DRAFT = true;

export const DISCLAIMER_TEXT: { paragraphs: string[]; points: string[]; closing: string } = {
  paragraphs: [
    'Phrenico er et opslags- og beregningsværktøj til sundhedsfagligt personale. Indholdet bygger på kilder, der er fundet og kontrolleret af mennesker og godkendt af en læge.',
    'Appen erstatter ikke din kliniske vurdering, gældende instrukser eller en ordination.',
  ],
  points: [
    'Du er selv ansvarlig for at kontrollere alle indtastede værdier, før du bruger et resultat.',
    'Fejl i indtastningen og de konsekvenser, de måtte få for en patient, er brugerens eget ansvar og ikke udviklerens.',
    'Kontrollér altid resultatet mod din kliniske vurdering og de lokale retningslinjer.',
  ],
  closing: 'Ved at trykke »Accepter og fortsæt« bekræfter du, at du har læst og forstået ovenstående.',
};
