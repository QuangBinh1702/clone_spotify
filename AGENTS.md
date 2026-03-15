# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js App Router project. Key locations:
- `app/`: Application routes, layouts, and UI (e.g., `app/layout.tsx`, `app/page.tsx`, `app/api/`).
- `app/components/` and `app/lib/`: Shared UI and utilities.
- `public/`: Static assets served at the site root.
- `types/`: Shared TypeScript types.
- Root files: `auth.ts` and `middleware.ts` define authentication and request handling.

## Build, Test, and Development Commands
- `npm run dev`: Start the development server at `http://localhost:3000`.
- `npm run build`: Build the production bundle.
- `npm run start`: Run the production server after a build.
- `npm run lint`: Run ESLint with Next.js rules.

## Coding Style & Naming Conventions
- Language: TypeScript (strict mode).
- Components: `React.FC` in `.tsx` files.
- Imports: Use alias `@/*` for root imports (prefer absolute over relative).
- Naming: PascalCase for components, camelCase for functions/variables, `SCREAMING_SNAKE_CASE` for constants.
- Styling: Tailwind CSS classes only; global styles live in `app/globals.css`.
- Error handling: Use `try/catch` and allow errors to surface to Next.js boundaries.

## Testing Guidelines
No test runner is configured in this repo. If tests are added, include:
- Location: `__tests__/` or colocated `*.test.ts(x)` near source.
- Command: Add a `npm run test` script in `package.json`.

## Commit & Pull Request Guidelines
Git history currently has only the initial commit, so no commit message convention is established. If adding one, keep messages short and imperative (e.g., “Add Spotify auth callback”).

For pull requests:
- Include a concise description of changes and rationale.
- Link related issues or tickets if available.
- Provide screenshots or GIFs for UI changes.
- Note any follow-up work or migration steps.

## Configuration & Security Notes
- Environment variables live in `.env` (do not commit secrets).
- Validate auth flows carefully when touching `auth.ts` or `middleware.ts`.
