LegacyTodo
==============

Demo application created for cloud migration

Todo SPA (Phase 1)
==============

This repository now includes a modern frontend scaffold at `todo-spa`.

Phase 1 scope:
- Vite + React + TypeScript SPA
- Local-only todo state with browser localStorage persistence
- Light and dark theme toggle in the UI
- No backend connectivity and no remote API calls

Quick start for SPA:
1. Ensure Node 20.19+ or 22.12+ is installed.
2. Bootstrap pnpm (preferred):
	- `corepack enable`
	- `corepack prepare pnpm@latest --activate`
3. Run the app:
	- `cd todo-spa`
	- `pnpm install`
	- `pnpm run dev`

Useful SPA commands:
- `pnpm run build`
- `pnpm run lint`
- `pnpm run test`

Note: The SPA is intentionally independent from `LegacyTodo.sln` during Phase 1.

TodoWeb
==============

Todo ASP.net web app consumes TodoWCFService

TodoWCFService
==============

Hostable WCF service that can be consumed by the TodoWeb.

The WCF service, available at ~/TodoService.svc provides the following operations:

- GetTodoItems - gets a list of todo items
- CreateTodoItem - creates a new todo item
- EditTodoItem - updates a todo item
- DeleteTodoItem - deletes a todo item
