# Nearfold — Mobile

The Expo + React Native app for Nearfold, a hyperlocal marketplace for home-based sellers and local commerce in Tier 2 Indian cities.

This is `apps/mobile` inside the Nearfold pnpm workspace. The backend lives in `apps/api`.

## Stack

- **Expo SDK 52** (New Architecture default)
- **React Native 0.76** · **Reanimated 3** · **Moti**
- **expo-router** for file-based routing
- **TanStack Query** for server state · **Zustand** for client state
- **expo-image** · **expo-haptics** · **@gorhom/bottom-sheet**

## Run it

```bash
# from repo root
pnpm install

# pick a platform
pnpm --filter mobile ios       # iOS simulator
pnpm --filter mobile android   # Android emulator / device
pnpm --filter mobile start     # dev server, pick platform via Expo CLI menu
```

> **Fonts required.** Drop the Fraunces + Inter + JetBrains Mono `.ttf` files into `assets/fonts/` before the first run. See [`assets/fonts/README.md`](./assets/fonts/README.md) for one-command install.

## Design system pattern

The design system is the source of truth — see the **"Nearfold — Design System v1.2"** front-door in the project Library for all 12 phase artifacts.

In code, this surfaces as:

- **`src/theme/`** — token modules (colors light/dark, spacing, radii, typography, shadows). The `Theme` type is the contract every component reads against.
- **`src/motion/`** — durations, easings, springs. Moti and Reanimated both consume these directly.
- **`src/theme/ThemeProvider.tsx`** — resolves Light vs Dark from (a) the user's Zustand-stored mode preference and (b) `Appearance` (system color scheme). Default mode is `'system'`, fallback `'light'`.
- **`useTheme()`** — the primary hook. Returns the resolved `Theme` object. Use `useThemeContext()` if you also need `setMode` / `cycleMode`.

### Component contract

> **No hardcoded colors, spacing, or radii in components.** Read every visual value from `useTheme()`. This is what lets us ship light + dark from a single component, and what lets the design team adjust the palette without code changes.

When you add a new component:

1. Start with `const theme = useTheme();`
2. Pull colors from `theme.colors.*`, spacing from `theme.spacing.*`, type from `theme.type.*`, radii from `theme.radii.*`, motion from `src/motion`.
3. Use the `variant + size` prop pattern — match the existing 5 primitives.
4. Add an entry to `src/components/index.ts`.

## Dev gallery (`/dev`)

A Storybook-style design-system browser lives at `/dev`. In dev builds the home screen shows a banner that opens it; in production builds the route is unreachable AND the gallery code is stripped from the bundle (see below).

To add a new story:

1. Create `src/dev/stories/MyThingStory.tsx` exporting `MyThingStory`.
2. Register it in `src/dev/stories/index.tsx` under one of the `storyGroups`.

The sidebar updates automatically.

## Production stripping

The dev gallery is more than runtime-gated — its **source files are excluded from production bundles** by a babel plugin:

- **`babel-plugins/replace-dev-imports.js`** — when `BABEL_ENV=production`, rewrites any import that resolves into `src/dev/` so it points at `src/dev-stub.tsx` instead.
- **`src/dev-stub.tsx`** — a Proxy-based module that returns a no-op `<Redirect href="/" />` component for any named or default access.

The only path into the dev tree from "real" app code is `app/dev/index.tsx → src/dev/DevGallery`. The plugin rewrites that single edge to point at the stub, and Metro therefore never traverses into `src/dev/`. None of the story modules, the gallery shell, or the sidebar end up in the production JS bundle.

### Verify

```bash
pnpm --filter mobile verify:prod-strip
```

This runs `expo export --platform ios` in production mode, then greps the resulting bundle for unique strings from each dev module (`storyGroups`, `ColorsStory`, `DevGallery`, etc.). The script fails loudly if any of them appear in the bundle.

It also confirms `dev-stub.tsx`'s `DevDisabled` component IS present — that proves the plugin actually fired during the build rather than silently no-op'ing.

### Why a plugin + stub instead of `if (__DEV__)` blocks?

Metro builds the dependency graph from `import`/`require` calls **before** dead-code elimination runs, so even guarded imports still end up in the bundle:

```ts
if (__DEV__) {
  const { DevGallery } = require('../../src/dev/DevGallery'); // still bundled
}
```

Rewriting the import path at the babel layer is the only clean way to keep the dev tree out of production.

## Project structure

```
apps/mobile/
├─ app/                     # expo-router routes
│  ├─ _layout.tsx           # root layout, providers, splash gate
│  ├─ index.tsx             # home (minimal placeholder, __DEV__-gated /dev link)
│  └─ dev/                  # design-system gallery (stripped in prod)
│     ├─ _layout.tsx        # __DEV__ redirect gate
│     └─ index.tsx          # mounts DevGallery
├─ src/
│  ├─ components/           # 5 primitives + barrel
│  ├─ theme/                # tokens + provider + useTheme
│  ├─ motion/               # duration / easing / spring tokens
│  ├─ store/                # Zustand stores (themeStore so far)
│  ├─ hooks/                # useFonts and future shared hooks
│  ├─ dev/                  # gallery shell, sidebar, stories (PROD-STRIPPED)
│  └─ dev-stub.tsx          # production stub for src/dev/*
├─ assets/
│  └─ fonts/                # ship Fraunces + Inter + JetBrains Mono here
├─ babel-plugins/
│  └─ replace-dev-imports.js  # rewrites src/dev/* imports → stub in prod
├─ scripts/
│  └─ verify-prod-strip.sh    # bundle-level verification
├─ app.json                 # Expo config
├─ babel.config.js          # reanimated + conditional dev-strip plugin
├─ metro.config.js          # pnpm-workspace aware
└─ tsconfig.json            # extends expo/tsconfig.base
```
