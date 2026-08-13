/**
 * Lynx-safe stub for `@lezer/markdown`.
 *
 * Real `@lezer/markdown` uses Unicode property escapes (`\\p{S}|\\p{P}`) that
 * Lynx's JS engine rejects during bytecode encode.
 */

export const parser = {
  parse: (_input: string): never => {
    throw new Error("[@git-diff-view/lynx] @lezer/markdown is stubbed on Lynx");
  },
};
