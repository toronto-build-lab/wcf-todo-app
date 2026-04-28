import { describe, expect, it } from 'vitest'
import {
  TODO_SCHEMA_VERSION,
  initialTodoState,
  parseStoredTodoState,
  todoReducer,
} from './todos'

describe('todoReducer', () => {
  it('adds a new todo item', () => {
    const nextState = todoReducer(initialTodoState, {
      type: 'add',
      payload: { title: 'Write tests', notes: 'Keep it simple' },
    })

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0].title).toBe('Write tests')
    expect(nextState.items[0].notes).toBe('Keep it simple')
    expect(nextState.items[0].done).toBe(false)
  })

  it('updates an existing item', () => {
    const addedState = todoReducer(initialTodoState, {
      type: 'add',
      payload: { title: 'Old title', notes: 'Old notes' },
    })
    const target = addedState.items[0]

    const nextState = todoReducer(addedState, {
      type: 'update',
      payload: { id: target.id, title: 'New title', notes: 'New notes' },
    })

    expect(nextState.items[0].title).toBe('New title')
    expect(nextState.items[0].notes).toBe('New notes')
  })

  it('toggles completion status', () => {
    const addedState = todoReducer(initialTodoState, {
      type: 'add',
      payload: { title: 'Do thing', notes: '' },
    })
    const target = addedState.items[0]

    const nextState = todoReducer(addedState, {
      type: 'toggle',
      payload: { id: target.id },
    })

    expect(nextState.items[0].done).toBe(true)
  })

  it('removes an item', () => {
    const addedState = todoReducer(initialTodoState, {
      type: 'add',
      payload: { title: 'Remove me', notes: '' },
    })
    const target = addedState.items[0]

    const nextState = todoReducer(addedState, {
      type: 'remove',
      payload: { id: target.id },
    })

    expect(nextState.items).toHaveLength(0)
  })
})

describe('parseStoredTodoState', () => {
  it('returns initial state when input is invalid', () => {
    expect(parseStoredTodoState('not-json')).toEqual(initialTodoState)
  })

  it('returns initial state for schema version mismatch', () => {
    const raw = JSON.stringify({
      version: 999,
      items: [],
    })

    expect(parseStoredTodoState(raw)).toEqual(initialTodoState)
  })

  it('accepts valid persisted state', () => {
    const raw = JSON.stringify({
      version: TODO_SCHEMA_VERSION,
      items: [
        {
          id: '1',
          title: 'Persisted task',
          notes: 'From storage',
          done: false,
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    })

    const parsed = parseStoredTodoState(raw)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0].title).toBe('Persisted task')
  })
})