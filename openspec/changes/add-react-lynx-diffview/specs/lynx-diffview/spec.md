## Purpose

Provides a ReactLynx DiffView package so consumers can render git/file diffs on Lynx’s cross-platform UI runtime (iOS, Android, and Lynx Web) with an API aligned to `@git-diff-view/react`, while reusing `@git-diff-view/core` for parsing and highlighting data.

## ADDED Requirements

### Requirement: Package exposes DiffView for ReactLynx
The system SHALL provide a published package that exports a `DiffView` component usable under ReactLynx (not `react-dom`), and SHALL re-export the core types needed for consumers (`DiffFile`, `SplitSide`, `DiffModeEnum`, and related highlighter types as applicable).

#### Scenario: Import DiffView from the Lynx package
- **WHEN** a ReactLynx app imports `DiffView` from the Lynx package
- **THEN** the component is available without requiring `react-dom` or `@git-diff-view/react`

### Requirement: Data and DiffFile input modes
The system SHALL accept either raw `data` (`oldFile`, `newFile`, `hunks`) or a pre-built `diffFile` (`DiffFile` instance), matching the dual entry modes of `@git-diff-view/react`.

#### Scenario: Render from raw data
- **WHEN** `DiffView` is given valid `data` with hunks
- **THEN** the view initializes a `DiffFile`, builds split and/or unified lines as needed, and renders the diff

#### Scenario: Render from DiffFile instance
- **WHEN** `DiffView` is given a prepared `diffFile`
- **THEN** the view uses that instance (or a clone/bundle merge consistent with react package behavior) and renders without requiring `data`

### Requirement: Split and Unified view modes
The system SHALL support `diffViewMode` for Split and Unified presentation. Both Unified and Split MUST be available in MVP with Lynx-native layouts (not HTML tables).

#### Scenario: Unified mode
- **WHEN** `diffViewMode` selects Unified
- **THEN** the view renders a single-column sequence of hunk, content, and extend rows as applicable

#### Scenario: Split mode
- **WHEN** `diffViewMode` selects Split
- **THEN** the view renders old and new sides in a Lynx-native side-by-side layout

### Requirement: Wrap-first content layout
MVP DiffView SHALL use the wrap layout model aligned with `@git-diff-view/react` v2 Wrap: long lines wrap within the content column, and Split mode SHALL render each logical line as a **single row containing both old and new sides** (not two independently horizontally scrolling side containers). The package MUST NOT require browser canvas measurement, `ResizeObserver` cross-pane height sync, or dual HScroll panes to achieve this MVP Split layout. Unified mode SHALL use a single column (wrap vs no-wrap only affects that column’s text behavior).

#### Scenario: Long line wraps in Unified
- **WHEN** a content line exceeds the content column width in Unified mode
- **THEN** the text wraps onto subsequent visual lines and the row height grows to fit

#### Scenario: Split wrap uses one row for both sides
- **WHEN** Split mode renders a content line where left and right text lengths differ
- **THEN** both sides appear in the same row container and the row height accommodates the taller side without a second side-only scroll container or browser `useSyncHeight`-style sync

#### Scenario: No-wrap dual-pane Split is out of MVP
- **WHEN** a consumer reads MVP documentation for Split no-wrap / independent horizontal scroll per side
- **THEN** that behavior is listed as deferred (react v2 Normal model), not as the MVP default

### Requirement: Theme and syntax highlighting
The system SHALL support light and dark themes via `diffViewTheme` and optional syntax highlighting via `diffViewHighlight` / `registerHighlighter`. Highlighted content MUST be rendered from syntax AST or plain text data, not from HTML string templates injected into the host.

#### Scenario: Dark theme with highlight enabled
- **WHEN** `diffViewTheme` is `dark` and `diffViewHighlight` is true with a usable highlighter
- **THEN** content lines show theme-appropriate colors and syntax colors derived from highlighter output

#### Scenario: Highlight disabled
- **WHEN** `diffViewHighlight` is false
- **THEN** content lines render plain text with add/delete/context styling only

### Requirement: Extend line customization
The system SHALL support `extendData` and `renderExtendLine` so consumers can attach custom UI under specific old/new line numbers, consistent with the react package contract.

#### Scenario: Extend data present for a line
- **WHEN** `extendData` contains data for a visible line and `renderExtendLine` is provided
- **THEN** the custom extend UI is rendered associated with that line

#### Scenario: No extend data
- **WHEN** a line has no matching `extendData` entry
- **THEN** no extend row is rendered for that line

### Requirement: First hunk line is omitted
The system SHALL omit the leading hunk row for the first content block in both Split and Unified modes, matching existing DiffView rendering semantics.

#### Scenario: First content block
- **WHEN** the display sequence starts at the first content block
- **THEN** no hunk row is shown before that block’s content

### Requirement: Cross-platform Lynx targets
The Lynx DiffView MUST be implemented against Lynx’s platform-agnostic element model so the same package can run on Lynx’s supported targets (including native mobile and Lynx Web) without a separate Web-only implementation. Documentation MUST state the Lynx version range used for smoke testing.

#### Scenario: Same package on multiple Lynx targets
- **WHEN** a consumer builds the example or app for more than one Lynx-supported target using the same `@git-diff-view/lynx` package
- **THEN** no target-specific DiffView fork is required for basic Unified/Split rendering

### Requirement: Documented API parity and deferred features
The package documentation MUST list which `@git-diff-view/react` props/behaviors are supported in the current release and which are deferred (at minimum: add-widget, multi-select, experimental v2 split, and any unsupported nowrap/horizontal-scroll mode). Deferred features MUST NOT be advertised as supported until implemented.

#### Scenario: Consumer checks deferred features
- **WHEN** a consumer reads the Lynx package documentation for add-widget or multi-select
- **THEN** the docs state that those features are deferred (or describe support if later implemented)

### Requirement: No dependency on browser DOM APIs for MVP rendering
MVP rendering MUST NOT require `document`, `window`, `ResizeObserver`, canvas text measurement, or HTML table elements to display wrapping Unified or Split diffs.

#### Scenario: Render without DOM globals
- **WHEN** DiffView runs in a ReactLynx environment without browser DOM globals used by the react package hooks
- **THEN** Unified and Split wrap-first views still render correctly

### Requirement: In-repo example application
The repository SHALL include a Lynx example app under `ui/lynx-example` that demonstrates DiffView with at least data or diffFile input, Unified/Split toggle, theme, and an extend-line sample.

#### Scenario: Example demonstrates core modes
- **WHEN** a developer runs the in-repo Lynx example
- **THEN** they can switch Unified/Split and see themed highlighted diff content with an extend line example
