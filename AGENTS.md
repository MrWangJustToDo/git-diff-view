# AGENTS.md - Guidelines for AI Coding Agents

This document provides essential information for AI coding agents working on the `git-diff-view` codebase.

## Project Overview

A high-performance Git diff view component library supporting React, Vue, Solid, and Svelte.

- **Language:** TypeScript (strict mode, ESNext target)
- **Package Manager:** pnpm (v9.12.0+) with workspace monorepo
- **Build Tool:** Custom rollup-based tool (`project-tool`) with SWC
- **Styling:** TailwindCSS with PostCSS

## Build/Lint/Test Commands

```bash
pnpm install                  # Install dependencies
pnpm run build:packages       # Build all packages
pnpm run dev:packages         # Development mode for packages
pnpm run lint                 # Run ESLint: eslint --cache --ext ts,tsx .
pnpm run lint:fix             # Fix lint issues automatically
pnpm run prettier             # Format code with Prettier
pnpm run clean                # Remove dist/dev/.cache directories
pnpm run release              # Full release: lint + prettier + clean + build + release
```

### Development Servers

```bash
pnpm run dev:react            # React example (Vite)
pnpm run dev:vue              # Vue example (Vite)
pnpm run dev:solid            # Solid example
pnpm run dev:svelte           # Svelte package dev
pnpm run dev:cli              # CLI dev mode
```

### Running Tests

**Note:** No test framework is currently configured. There are no test files or test commands.

## Code Style Guidelines

### Formatting (from .prettierrc)

- **Semicolons:** Always required
- **Quotes:** Double quotes (`"`) - not single quotes
- **Indentation:** 2 spaces (no tabs)
- **Line width:** 120 characters maximum
- **Trailing commas:** ES5 style (arrays, objects)

### Import Organization

Order imports with blank lines between groups:
1. External dependencies (npm packages)
2. Internal monorepo packages (`@git-diff-view/*`)
3. Local relative imports
4. Type-only imports (at the end, using `import type`)

```typescript
import { memo, useEffect } from "react";
import { DiffFile, SplitSide } from "@git-diff-view/core";
import { useIsMounted } from "../hooks/useIsMounted";
import type { DiffHighlighter } from "@git-diff-view/core";
```

### Naming Conventions

| Element | Convention | Examples |
|---------|------------|----------|
| Variables/Functions | camelCase | `diffFile`, `getFile`, `parseInstance` |
| Classes/Interfaces/Types/Enums | PascalCase | `DiffFile`, `SplitLineItem`, `DiffLineType` |
| React Components | PascalCase | `DiffView`, `DiffSplitView` |
| Custom Hooks | `use` prefix | `useIsMounted`, `useDomWidth` |
| Component files | PascalCase | `DiffView.tsx` |
| Utility files | camelCase | `utils.ts`, `diff-file.ts` |
| Private class fields | `#` prefix (ES2022) | `#oldFileResult`, `#listeners` |
| Internal properties | `_` prefix | `_oldFileName`, `_isHidden` |
| CSS variable names | camelCase + `Name` suffix | `diffFontSizeName`, `emptyBGName` |

### TypeScript Patterns

- Use **interfaces** for object shapes/data structures
- Use **types** for unions, intersections, and utility types
- **Avoid `any`:** Use `unknown` with generics: `<T extends unknown>`
- **Optional chaining:** Use extensively: `diffFile?.clear?.()`

### Export Patterns

**Named exports only - no default exports:**

```typescript
export const DiffView = InnerDiffView;
export { SplitSide, DiffModeEnum };
export class DiffFile { ... }
```

**Barrel exports in `index.ts`:**

```typescript
export * from "./components/DiffView";
export * from "@git-diff-view/core";
```

### Error Handling

Use the `__DEV__` global for development-only warnings/errors:

```typescript
if (__DEV__) {
  console.warn('[@git-diff-view/core] The composed files are identical...');
}
```

- Prefix messages with package name: `[@git-diff-view/core]`
- Use defensive early returns rather than throwing exceptions
- `__DEV__` blocks are stripped in production builds

### React-Specific Patterns

- **Memo pattern:** `const MemoedComponent = memo(InternalComponent);`
- **forwardRef:** Add `displayName` after: `InnerDiffView.displayName = "DiffView";`
- **Context:** Use `DiffViewContext.Provider` for state management

## Project Structure

```
packages/
  core/           # Core diff parsing engine (@git-diff-view/core)
  react/          # React components (@git-diff-view/react)
  vue/            # Vue components (@git-diff-view/vue)
  solid/          # Solid components (@git-diff-view/solid)
  svelte/         # Svelte components (@git-diff-view/svelte)
  cli/            # CLI tool (@git-diff-view/cli)
  file/           # File comparison engine (@git-diff-view/file)
  utils/          # Shared utilities (@git-diff-view/utils)
  lowlight/       # Lowlight syntax highlighter
  shiki/          # Shiki syntax highlighter
ui/
  react-example/  # React demo app (Vite)
  vue-example/    # Vue demo app (Vite)
  solid-example/  # Solid demo app
  svelte-example/ # Svelte demo
scripts/          # Build scripts (ts-node)
```

## Package Dependencies

- `@git-diff-view/core` is the foundation (all framework packages depend on it)
- Framework packages (react, vue, solid, svelte) wrap the core
- `@git-diff-view/file` provides file-to-file comparison using the `diff` library
- Syntax highlighting via `lowlight` (highlight.js) or `shiki`

## ESLint Configuration

- Base config: `project-tool/baseLint`
- Ignored: `dist`, `dev`, `scripts`, `node_modules`, `next-*-example`, `packages/solid`, `packages/svelte`

## Important Notes

1. **No test infrastructure** - be cautious when modifying core logic
2. **Multi-framework support** - changes to core affect all framework bindings
3. **Performance critical** - this library handles large diffs; avoid unnecessary re-renders
4. **CSS variables** - styling uses CSS custom properties for theming
5. **Private fields** - use ES2022 `#` syntax for true private fields
