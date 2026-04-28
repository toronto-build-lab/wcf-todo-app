export type ThemePreference = 'light' | 'dark'

export type TodoItem = {
  id: string
  title: string
  notes: string
  done: boolean
  createdAt: number
  updatedAt: number
}

export type TodoState = {
  version: number
  items: TodoItem[]
}

export type TodoAction =
  | { type: 'add'; payload: { title: string; notes: string } }
  | { type: 'update'; payload: { id: string; title: string; notes: string } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'toggle'; payload: { id: string } }

export const TODO_STORAGE_KEY = 'todo-spa/state'
export const TODO_SCHEMA_VERSION = 1
export const THEME_STORAGE_KEY = 'todo-spa/theme'

export const initialTodoState: TodoState = {
  version: TODO_SCHEMA_VERSION,
  items: [],
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function parseStoredTodoState(raw: string | null): TodoState {
  if (!raw) {
    return initialTodoState
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TodoState>

    if (parsed.version !== TODO_SCHEMA_VERSION || !Array.isArray(parsed.items)) {
      return initialTodoState
    }

    const items = parsed.items.filter(
      (item): item is TodoItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.notes === 'string' &&
        typeof item.done === 'boolean' &&
        typeof item.createdAt === 'number' &&
        typeof item.updatedAt === 'number',
    )

    return {
      version: TODO_SCHEMA_VERSION,
      items,
    }
  } catch {
    return initialTodoState
  }
}

export function loadTodoState(): TodoState {
  if (typeof window === 'undefined') {
    return initialTodoState
  }

  return parseStoredTodoState(window.localStorage.getItem(TODO_STORAGE_KEY))
}

export function saveTodoState(state: TodoState): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(state))
}

export function loadThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  if (typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function saveThemePreference(mode: ThemePreference): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
}

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'add': {
      const timestamp = Date.now()
      const nextItem: TodoItem = {
        id: createId(),
        title: action.payload.title.trim(),
        notes: action.payload.notes.trim(),
        done: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      return {
        ...state,
        items: [nextItem, ...state.items],
      }
    }

    case 'update': {
      const updatedItems = state.items.map((item) => {
        if (item.id !== action.payload.id) {
          return item
        }

        return {
          ...item,
          title: action.payload.title.trim(),
          notes: action.payload.notes.trim(),
          updatedAt: Date.now(),
        }
      })

      return {
        ...state,
        items: updatedItems,
      }
    }

    case 'remove': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      }
    }

    case 'toggle': {
      const toggledItems = state.items.map((item) => {
        if (item.id !== action.payload.id) {
          return item
        }

        return {
          ...item,
          done: !item.done,
          updatedAt: Date.now(),
        }
      })

      return {
        ...state,
        items: toggledItems,
      }
    }

    default:
      return state
  }
}