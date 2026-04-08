# WonderPets Copilot Instructions

This workspace is an Nx monorepo for an Angular application called `pets-shop` with supporting libraries under `libs/`.

## What this workspace is

- Nx workspace using Angular 21.2 and Nx 22.6.
- Main application: `apps/pets-shop`
- Libraries: `libs/auth`, `libs/home`, `libs/page-not-found`
- Unit testing via `vitest`/`vitest-angular`.
- Linting with ESLint.
- No generated e2e test runner configured by default.

## Primary commands

Use the workspace's package scripts and Nx commands.

- `npm run start` or `npx nx serve pets-shop` — run the app locally.
- `npm run build` or `npx nx build pets-shop` — build the production bundle.
- `npx nx test <project>` — run unit tests for a project.
- `npx nx lint <project>` — run lint for a project.
- `npx nx show project pets-shop` — inspect project targets.
- `npx nx graph` — visualize project dependencies.

## Key files and folders

- `apps/pets-shop/` — Angular app source, routes, and styles.
- `libs/auth/` — authentication library.
- `libs/home/` — home/dashboard library.
- `libs/page-not-found/` — 404 fallback library.
- `nx.json` — workspace configuration, default project, generator defaults.
- `package.json` — dependency management and convenience scripts.
- `tsconfig.base.json` — shared TypeScript configuration.
- `eslint.config.mjs` — workspace ESLint configuration.

## How to help effectively

- Prefer edits that are narrow and clearly scoped to a file or project.
- When changing routes, configuration, or library boundaries, use explicit file paths.
- Respect Nx conventions for generated Angular apps and libs.
- Do not invent new architecture; follow `apps/pets-shop` and existing `libs/` patterns.
- Avoid changing global tooling versions unless needed to fix a specific issue.

## What to avoid

- Do not add unrelated files or large architecture proposals.
- Do not change `package.json` dependencies without a concrete task.
- Do not refactor the entire workspace unless the user requests it explicitly.

## Example prompts

- "Add a new route to `apps/pets-shop/src/app/app.routes.ts` for a settings page."
- "Create a reusable `Button` component under `libs/home` and use it in `apps/pets-shop`."
- "Fix the unit test failure in `libs/auth/src/lib/auth.service.spec.ts`."
- "Update `nx.json` to cache the `build` target for all projects."

## Notes for Copilot

- If the user asks about tests, confirm whether they want `nx test <project>` or a specific file.
- If the user asks about generation, prefer Nx generators like `npx nx g @nx/angular:component` or `npx nx g @nx/angular:lib`.
- If the user asks for docs, link to Nx docs rather than restating them.
