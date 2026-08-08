/**
 * src/lib/pickByHash.ts
 *
 * Deterministically picks one of a fixed set of options for a given string
 * key (e.g. a user's name or a trip's id), so the same key always renders
 * the same option — used for avatar fallback gradients and trip cover
 * gradients. The hash arithmetic must stay byte-identical to its prior
 * inline copies: changing it reshuffles which option every existing
 * key maps to.
 */

export function pickByHash<T>(key: string, options: readonly T[]): T {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length];
}
