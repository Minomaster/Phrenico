/**
 * npm run content:build   – validates content/ and demo-content/ and writes
 *                           src/content/generated/approved.json and demo.json
 * npm run content:check   – the same checks, but only verifies that the
 *                           generated files are up to date (used in CI)
 *
 * The build stops (exit code 1) if any approved page lacks a source, an
 * approving doctor, a date or a valid fingerprint, if a formula has no code,
 * or if the code does not reproduce the doctor-verified examples.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { buildBundle, OUTPUT_FILES, relative, serializeBundle, type BundleKind, type Issue } from './lib';

const checkOnly = process.argv.includes('--check');
let failed = false;

function printIssues(issues: Issue[]) {
  for (const issue of issues) {
    const symbol = issue.level === 'error' ? '✖ FEJL  ' : '⚠ ADVARSEL';
    console.log(`  ${symbol} ${issue.file}\n      ${issue.message}`);
  }
}

for (const kind of ['approved', 'demo'] as BundleKind[]) {
  const label = kind === 'approved' ? 'Godkendt indhold (content/)' : 'Demo-indhold (demo-content/)';
  const { bundle, issues, skippedDrafts } = buildBundle(kind);
  const errors = issues.filter((issue) => issue.level === 'error');

  console.log(`\n${label}`);
  printIssues(issues);
  if (skippedDrafts.length > 0) {
    console.log(`  ℹ ${skippedDrafts.length} udkast er ikke med: ${skippedDrafts.join(', ')}`);
  }

  if (errors.length > 0) {
    failed = true;
    console.log(`  ✖ ${errors.length} fejl – intet er skrevet.`);
    continue;
  }

  const output = OUTPUT_FILES[kind];
  const serialized = serializeBundle(bundle);
  const summary = `${bundle.formulas.length} formler, ${bundle.diseases.length} sygdomme (indholdsversion ${bundle.contentVersion})`;

  if (checkOnly) {
    const current = existsSync(output) ? readFileSync(output, 'utf8') : '';
    if (current !== serialized) {
      failed = true;
      console.log(`  ✖ ${relative(output)} er ikke opdateret. Kør: npm run content:build`);
    } else {
      console.log(`  ✔ ${summary}`);
    }
  } else {
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(output, serialized);
    console.log(`  ✔ ${summary} → ${relative(output)}`);
  }
}

if (failed) {
  console.log('\nIndholdet er IKKE godkendt til appen. Ret fejlene ovenfor.');
  process.exit(1);
}
