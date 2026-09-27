/**
 * Runs every doctor-verified example of every formula through its code.
 * When real formulas are added, their examples are tested here automatically.
 */
import approved from '../../content/generated/approved.json';
import demo from '../../content/generated/demo.json';
import { bundleSchema } from '../../content/schema';
import { checkVerifiedExamples } from '../engine';
import { implementationsFor } from '../registry';

const bundles = [bundleSchema.parse(approved), bundleSchema.parse(demo)];
const cases = bundles.flatMap((bundle) =>
  bundle.formulas.flatMap((formula) =>
    checkVerifiedExamples(formula, implementationsFor(bundle.kind)[formula.id]).map((check) => ({
      name: `${bundle.kind}: ${formula.id} – ${check.description}`,
      check,
    })),
  ),
);

describe('doctor-verified examples', () => {
  it('exist for every formula in the bundles', () => {
    for (const bundle of bundles) {
      for (const formula of bundle.formulas) {
        expect(formula.verifiedExamples.length).toBeGreaterThan(0);
      }
    }
  });

  if (cases.length > 0) {
    it.each(cases)('$name', ({ check }) => {
      expect(check.problems).toEqual([]);
    });
  }
});
