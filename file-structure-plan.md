# `src/app` Directory – Refactor Plan

_A pragmatic roadmap to tighten navigation structure and long-term maintainability._

---

## 1. Goals

1. Keep route files discoverable and ≤300 LOC each.
2. Group multi-file features (e.g. onboarding) into their own folders.
3. Enforce naming / casing consistency across all routes.
4. Colocate tests and helper files with the code they cover.
5. Retire duplicate / legacy flows to avoid confusion.

---

## 2. Current Pain-Points

| Pain-point                                                           | Impact                                    |
| -------------------------------------------------------------------- | ----------------------------------------- |
| Huge single-file screens (`onboarding-*`, `mood.tsx`, `profile.tsx`) | Hard to scan / review                     |
| Mixed casing (`sign-in.tsx`, `onboarding-chat.tsx`)                  | Breaks quick-open muscle memory           |
| Two onboarding implementations                                       | New contributors wonder which one to edit |
| Tests live in two different conventions                              | Harder to find failing specs              |

---

## 3. Target Structure (illustrative)

```text
src/app/
├─ _layout.tsx
├─ +not-found.tsx
├─ (auth)/
│  ├─ _layout.tsx
│  ├─ welcome.tsx
│  ├─ sign-in.tsx
│  ├─ sign-up.tsx
│  └─ onboarding/           <-- new folder
│     ├─ Chat.tsx
│     ├─ Steps.tsx
│     ├─ utils.ts
│     ├─ styles.ts
│     └─ __tests__/
│        └─ onboarding.test.tsx
└─ (tabs)/
   ├─ _layout.tsx
   ├─ chat/                 <-- folder per tab keeps things flat
   │  └─ index.tsx
   ├─ mood/
   │  └─ index.tsx
   ├─ exercises/
   │  └─ index.tsx
   └─ profile/
      └─ index.tsx
```

---

## 4. Work-Packages

| Phase                  | Tasks                                                                                                                                                | Owner       | Done-when                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| **P0 Cleanup**         | • Delete old `onboarding.tsx` & references<br>• Rename `onboarding-chat.tsx` → `Chat.tsx`, `onboarding-steps.tsx` → `Steps.tsx`                      | `@frontend` | CI green, no unused imports                  |
| **P1 Folderisation**   | • Create `(auth)/onboarding/` folder<br>• Move chat, steps, shared helpers/styles into it                                                            | `@frontend` | App navigates to same routes without changes |
| **P2 File-size split** | • Extract constants, large style objects, and helper fns from `mood.tsx`, `profile.tsx`, `exercises.tsx` into sibling `*.helpers.ts` & `*.styles.ts` | `@frontend` | Each screen ≤300 LOC                         |
| **P3 Naming pass**     | • Standardise file names: kebab-case OR camelCase (pick one)<br>• Update imports & route references                                                  | `@frontend` | `bun lint`, E2E tests pass                   |
| **P4 Test colocation** | • Move `/__tests__/*.tsx` next to implementation with matching names                                                                                 | `@qa`       | Jest runs from root, no orphan tests         |
| **P5 Docs update**     | • Add section to `docs/expo-react-rules.md` describing new organisation                                                                              | `@docs`     | PR merged                                    |

---

## 5. Acceptance Criteria

- Running `bun start` boots the app with zero route warnings.
- All unit & E2E tests pass after moves.
- `src/app` tree depth is max **3** levels.
- No screen file exceeds **300 logical lines** (comments excluded).
- One canonical onboarding flow remains.

---

## 6. Timeline (suggested)

| Week | Milestone                                       |
| ---- | ----------------------------------------------- |
| 1    | P0 & P1 complete, PR merged                     |
| 2    | P2 for `onboarding`, `mood`                     |
| 3    | P2 for `profile`, `exercises` + P3 naming sweep |
| 4    | P4 test move + P5 docs                          |

---

## 7. Risks & Mitigations

| Risk                                         | Mitigation                                              |
| -------------------------------------------- | ------------------------------------------------------- |
| Broken deep-links after file moves           | Keep route names unchanged; moves are purely structural |
| Merge conflicts with active feature branches | Land P0/P1 quickly, then rebase feature branches early  |
| Overshooting LOC budget                      | Enforce ESLint max-lines rule on screens                |

---

## 8. Tracking

Add each task as an issue under the **“App Structure Refactor”** GitHub project board.  
Use labels: `refactor`, `navigation`, `good first issue` (where appropriate).

---
