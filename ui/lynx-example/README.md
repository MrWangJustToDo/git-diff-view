# lynx-example

Demo for `@git-diff-view/lynx` (ReactLynx).

## Run

```bash
# from repo root
pnpm install
pnpm run build:packages   # or build lynx package alone once wired
pnpm run dev:lynx
```

Requires Lynx Explorer / supported Lynx target for on-device preview. See [Lynx quick start](https://lynxjs.org/).

**Important:** `lynx.config.ts` aliases `@git-diff-view/lowlight` and `@lezer/markdown` to stubs (Unicode `\p{...}` regexes break Lynx bytecode). The demo uses `@git-diff-view/lezer` via `registerHighlighter` for syntax colors — see `packages/lynx/readme.md`.

Styling uses Tailwind v3 + `@lynx-js/tailwind-preset` (`rsbuild-plugin-tailwindcss`). Package source is scanned when aliased; import `packages/lynx/src/tailwind.css` in the example entry.

## Checklist

- [ ] Toggle Split / Unified
- [ ] Toggle light / dark
- [ ] Toggle highlight (lezer on/off)
- [ ] Long line wraps; Split row grows with content
- [ ] Extend line under new side line 77
