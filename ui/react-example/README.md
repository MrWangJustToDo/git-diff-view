# react-example

Vite playground for `@git-diff-view/react`.

It can run on top of either the official [`react`](https://react.dev) or [`@my-react/react`](https://github.com/MrWangJustToDo/my-react). The implementation is selected at dev/build time through the `MY_REACT` environment variable, so you never have to edit the source to switch.

## Getting started

From the repository root:

```bash
pnpm install
pnpm run dev:react
```

The dev server runs at http://localhost:5173/git-diff-view/.

## Switching the React implementation

`@my-react/react` is the **default**. Use the official `react` only when you explicitly opt out:

| Command                                         | Runtime                    |
| ----------------------------------------------- | -------------------------- |
| `pnpm run dev:react`                            | `@my-react/react` (default) |
| `MY_REACT=0 pnpm run dev:react`                 | official `react`           |
| `pnpm run dev:react:official`                   | official `react`           |

You can also drop the flag into an `.env` / `.env.local` file inside `ui/react-example`:

```bash
# ui/react-example/.env.local
MY_REACT=0
```

`MY_REACT` only opts out for the values `0`, `false`, `no`, `off` (case-insensitive). Any other value — or leaving it unset — keeps `@my-react/react`.

The selected implementation is printed on startup:

```
[react-example] React implementation: @my-react/react
```

## How it works

- `vite.config.ts` reads `MY_REACT` and picks the Vite React plugin accordingly:
  - `@my-react/react-vite` when `@my-react` is enabled
  - `@vitejs/plugin-react` otherwise
- `@my-react/react-vite` injects `resolve.alias` entries (`react` → `@my-react/react`, `react-dom` → `@my-react/react-dom`), so the application keeps importing from `"react"` as usual.
- The resolved flag is also exposed as the compile-time constant `__MY_REACT__` (`true` / `false`, declared in `src/vite-env.d.ts`), which gates `@my-react`-only UI.
- The `dev` script uses `vite --force`, so switching the plugin re-optimizes dependencies automatically — no manual cache cleanup required.

## Notes

- `CliPlayGround` is built on `@my-react/react-terminal` and only renders on the `@my-react` runtime:

  ```tsx
  <Stack gap="xl">
    <ReactPlayGround />
    <VuePlayGround />
    {__MY_REACT__ && <CliPlayGround />}
  </Stack>
  ```

- Production build: `pnpm run build` (`tsc && vite build`). In the bundle `__MY_REACT__` is statically replaced.
