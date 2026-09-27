import type { InputValues } from './types';

/**
 * Helpers for formula implementations to read validated inputs. They throw if
 * a value is missing or has the wrong type, which the engine turns into an
 * error message instead of a result. A wrong result is never shown.
 */
export function numberInput(inputs: InputValues, id: string): number {
  const value = inputs[id];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Input "${id}" is not a number`);
  }
  return value;
}

export function choiceInput(inputs: InputValues, id: string): string {
  const value = inputs[id];
  if (typeof value !== 'string') {
    throw new TypeError(`Input "${id}" is not a choice`);
  }
  return value;
}
