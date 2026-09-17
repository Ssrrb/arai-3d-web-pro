# AGENTS.md — arai-3d-web-pro

Single-page Vite + React 18 + TypeScript + Tailwind v4 product showcase (Arai Nimbus/Stratus convertible Chromebook) with an interactive Three.js hero viewer. No backend, no env vars.

## Commands

- Install: `bun install` (`bun.lock` is the lockfile; `npm` also works)
- Dev: `bun run dev` — Vite on port 3000, `--host 0.0.0.0`
- Typecheck: `bun run lint` — **this is only `tsc -b`, not a linter**
- Build: `bun run build` — `tsc -b && vite build`
- Preview: `bun run preview`

No test runner, no ESLint/Prettier config, no CI workflows. Verify with `bun run lint` then `bun run build`.

## Entrypoints & ownership

- `index.html` → `src/main.tsx` → `src/App.tsx`. No router.
- `App.tsx` owns all UI state: variant carousel index, cart items, and open/close flags for 8 modals. New modals follow the existing `isXOpen` + `onClose` prop pattern.
- `src/types.ts` is the shared contract (`ProductVariant`, `CartItem`, `FoldMode`, `Hotspot`, `SpecCategory`). Update it when changing product/cart shape.
- Product copy lives in `src/data/productVariants.ts` (`ARAI_VARIANTS`) and `src/data/specsData.ts` (`HOTSPOTS`, spec categories). Prices/specs are hardcoded there.

## 3D viewer (read before touching)

- `src/components/Scene3D.tsx` is the persistent hero canvas rendered by `App`. `src/components/Viewer3D.tsx` is only used inside `TourModal`. Both load the same model independently — keep their loader/material logic in sync.
- Model URL is `/models/Arai_Nimbus_S1_Concept.glb` (served from `public/models/`). The root-level `Arai_Nimbus_S1_Concept.glb/.stl/.blend1` copies are **not** served; don't edit the GLB by hand — source scripts live in `blender-models/` (`build_nimbus.py`, `refine_nimbus.py`, `validate_nimbus.py`).
- `GLTFLoader` sanitizes node names (whitespace → `_`). Both viewers normalize node names before hinge/material lookups — preserve that or ghosting/double-geometry regresses (see git log `e0015da`).
- Hinge poses are `FOLD_CONFIGS` in `Scene3D.tsx` keyed by `FoldMode` (`closed | laptop | stand | tent | tablet`); each variant's `defaultFold` is in `productVariants.ts`.
- Laptop screen texture is `/images/image7.webp`, applied via `TextureLoader` in both viewers. WebP/images live in `public/images/`, blueprint SVG in `public/blueprints/`.

## Styling

- Tailwind v4 via `@tailwindcss/vite` plugin; global styles are just `@import "tailwindcss"` in `src/index.css`. There is no `tailwind.config.*` — don't add one.
- Fonts load via Google Fonts `<link>` in `index.html` (Anton, Inter, JetBrains Mono).

## Gotchas

- `src/components/CustomizerModal.tsx` and `src/components/Navbar.tsx` are unreferenced dead code; `HeaderNav` (not `Navbar`) is the real nav.
- `soundEngine` (`src/utils/soundEngine.ts`) requires a user gesture: `App` calls `init()` on first window click. Sounds silently no-op before that — this is by design.
- `dist/` is gitignored build output; `blender-models/` is currently untracked and root binaries are large (10 MB STL, ~2 MB GLBs) — don't `git add -A` blindly.
