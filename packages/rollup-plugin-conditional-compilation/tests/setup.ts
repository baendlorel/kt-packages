import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export const loadjs = (name: string) => readFileSync(join(import.meta.dirname, '..', '.mock', name), 'utf-8');
