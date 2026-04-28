# Phase 1 Manual QA Checklist

## CRUD Flow

- [ ] Create a task with title and notes.
- [ ] Create a task with title only.
- [ ] Edit an existing task title and notes.
- [ ] Delete an existing task.
- [ ] Toggle task complete/incomplete state.

## Persistence

- [ ] Refresh browser and confirm tasks remain.
- [ ] Refresh browser and confirm completion states remain.
- [ ] Corrupt localStorage value manually and confirm app falls back safely.

## Theme

- [ ] Toggle from light to dark mode.
- [ ] Toggle from dark to light mode.
- [ ] Refresh browser and confirm theme preference persists.

## UX and Accessibility Sanity

- [ ] Can use keyboard to tab to Add/Edit/Delete controls.
- [ ] Dialog opens and closes correctly for edit flow.
- [ ] Text remains readable in both theme modes.
