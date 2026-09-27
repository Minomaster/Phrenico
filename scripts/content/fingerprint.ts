/**
 * npm run content:fingerprint -- content/formler/min-formel.yaml
 *
 * Prints the approval fingerprint for one or more content files (all files
 * in content/ if none are given). Use it AFTER the doctor has checked the
 * final file: copy the fingerprint into `approval.fingerprint`, together with
 * `approvedBy`, `approvedAt` and `status: approved`.
 */
import path from 'node:path';

import { fingerprintOf, listContentFiles, readYaml, relative, ROOT, SOURCE_DIRS } from './lib';

const args = process.argv.slice(2);
const files =
  args.length > 0
    ? args.map((arg) => path.resolve(process.cwd(), arg))
    : [...listContentFiles(SOURCE_DIRS.approved, 'formula'), ...listContentFiles(SOURCE_DIRS.approved, 'disease')];

if (files.length === 0) {
  console.log('Ingen indholdsfiler fundet i content/formler eller content/sygdomme.');
}

for (const file of files) {
  const { data, errors } = readYaml(file);
  console.log(`\n${relative(file)}`);
  if (errors.length > 0 || !data || typeof data !== 'object' || Array.isArray(data)) {
    console.log(`  ✖ Kan ikke læses: ${errors.join('; ') || 'filen er tom'}`);
    process.exitCode = 1;
    continue;
  }
  const raw = data as Record<string, unknown>;
  const approval = (raw.approval ?? {}) as { status?: unknown; fingerprint?: unknown };
  const fingerprint = fingerprintOf(raw);
  const stored =
    approval.fingerprint === undefined
      ? 'intet gemt fingeraftryk'
      : approval.fingerprint === fingerprint
        ? 'gemt fingeraftryk PASSER'
        : 'gemt fingeraftryk PASSER IKKE (indholdet er ændret)';
  console.log(`  fingerprint: ${fingerprint}`);
  console.log(`  status: ${String(approval.status ?? 'mangler')} · ${stored}`);
}

console.log(`\n(Rodmappe: ${ROOT})`);
