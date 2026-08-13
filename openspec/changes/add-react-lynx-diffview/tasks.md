## 1. Scaffold & toolchain

- [x] 1.1 Create `packages/lynx` package (`package.json`, `src/index.ts`, buildOptions, peerDeps for ReactLynx / without `react-dom`)
- [x] 1.2 Wire package into monorepo install + `scripts/build.ts` (and AGENTS.md package list)
- [x] 1.3 Spike: hello ReactLynx render from package entry; confirm peer/toolchain versions
- [x] 1.4 Add theme CSS with light/dark tokens aligned to react/utils color names
- [x] 1.5 Spike v2-Wrap layout on Lynx: one Split row = oldNum+oldContent|newNum+newContent (`DiffSplitContentLineWrap_v2` shape); confirm long text wraps and row height follows max(side) without dual scroll panes / useSyncHeight

## 2. DiffView shell & core lifecycle

- [x] 2.1 Implement `DiffView` shell: `data` / `diffFile` construction, theme init, `initRaw`, `buildSplitDiffLines` / `buildUnifiedDiffLines`, `initSyntax`, subscribe/notify, cleanup
- [x] 2.2 Call `setEnableBuildTemplate(false)` for the Lynx package
- [x] 2.3 Port context/config store pattern from react (ReactLynx-safe); verify DiffFile updates re-render under dual-thread rules
- [x] 2.4 Export `DiffView`, `SplitSide`, `DiffModeEnum`, and core re-exports from package entry

## 3. Content rendering (no HTML templates)

- [x] 3.1 Implement `DiffContent` for Lynx: plain + syntax runs via nested `<text>` / styles from AST and change ranges
- [x] 3.2 Map highlighter class names / inline styles to Lynx text colors (light/dark)
- [x] 3.3 Size line-number column from digit count; content column flexes and wraps

## 4. Unified view (wrap-first MVP)

- [x] 4.1 Implement Unified content / hunk / extend row components with Lynx `<view>` flex rows and wrapping content text
- [x] 4.2 Skip first hunk line; respect hidden lines and expand-enabled semantics consistent with react
- [x] 4.3 Wire `extendData` + `renderExtendLine` for Unified
- [x] 4.4 Smoke-test Unified: highlight on/off, light/dark, long-line wrap

## 5. Split view (v2 Wrap model MVP)

- [x] 5.1 Port Split structure from `DiffSplitViewWrap_v2`: single tree, `getSplitLines` + `DiffFileLineType` dispatcher (`DiffSplitViewLineWrap_v2`)
- [x] 5.2 Implement Wrap content/hunk/extend rows mirroring `*Wrap_v2` (one flex row both sides; empty placeholders); first-hunk skip / hidden lines
- [x] 5.3 One outer vertical `scroll-view` (not dual Normal panes); no-wrap dual HScroll deferred to follow-ups
- [x] 5.4 Smoke-test Split with multi-hunk sample and uneven long lines on left/right


## 6. Example, docs, release readiness

- [x] 6.1 Add `ui/lynx-example` demonstrating data and/or diffFile, Unified/Split toggle, theme, extend line, long-line wrap
- [x] 6.2 Write `packages/lynx/readme.md` with API table, wrap-first default, deferred list (widget / multiSelect / v2 / optional nowrap)
- [x] 6.3 Update root `README.md` packages/features to mention `@git-diff-view/lynx`
- [x] 6.4 Validate against `lynx-diffview` spec scenarios; record Lynx version / targets smoke-tested

## 7. Follow-ups (post-MVP)

- [ ] 7.1 Optional no-wrap Split (`diffViewWrap={false}`): dual containers + HScroll + Y sync, mirroring `DiffSplitViewNormal_v2`
- [ ] 7.2 Evaluate `<list>` virtualization for large diffs
- [ ] 7.3 Split scroll sync polish if not done in 5.3
- [ ] 7.4 Add-widget / multi-select only if product-required (Lynx-native redesign)
