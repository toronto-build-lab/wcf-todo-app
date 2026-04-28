import { useEffect, useReducer, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AppBar,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import {
  loadTodoState,
  saveTodoState,
  todoReducer,
  type ThemePreference,
} from './todos'

type EditDraft = {
  id: string
  title: string
  notes: string
}

type AppProps = {
  themeMode: ThemePreference
  onToggleTheme: () => void
}

function App({ themeMode, onToggleTheme }: AppProps) {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadTodoState)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)

  const completedCount = state.items.filter((item) => item.done).length

  useEffect(() => {
    saveTodoState(state)
  }, [state])

  function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newTitle.trim()) {
      return
    }

    dispatch({
      type: 'add',
      payload: {
        title: newTitle,
        notes: newNotes,
      },
    })

    setNewTitle('')
    setNewNotes('')
  }

  function handleSaveEdit() {
    if (!editDraft || !editDraft.title.trim()) {
      return
    }

    dispatch({
      type: 'update',
      payload: {
        id: editDraft.id,
        title: editDraft.title,
        notes: editDraft.notes,
      },
    })

    setEditDraft(null)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          themeMode === 'light'
            ? 'radial-gradient(circle at 0% 0%, #E3F5F2 0%, #F8FAF7 45%)'
            : 'radial-gradient(circle at 0% 0%, #1F2E2C 0%, #0F1717 50%)',
      }}
    >
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
            Todo SPA (Phase C)
          </Typography>
          <Tooltip
            title={
              themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
            }
          >
            <IconButton aria-label="Toggle theme mode" onClick={onToggleTheme}>
              {themeMode === 'light' ? (
                <DarkModeRoundedIcon />
              ) : (
                <LightModeRoundedIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 3,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Add a task
          </Typography>
          <Box component="form" onSubmit={handleAddTodo}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                required
              />
              <TextField
                label="Notes"
                value={newNotes}
                onChange={(event) => setNewNotes(event.target.value)}
                multiline
                minRows={2}
              />
              <Box>
                <Button type="submit" variant="contained" disabled={!newTitle.trim()}>
                  Add task
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Tasks ({state.items.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Completed: {completedCount} of {state.items.length}
          </Typography>

          {state.items.length === 0 ? (
            <Typography color="text.secondary">
              No tasks yet. Add your first task above.
            </Typography>
          ) : (
            <List disablePadding>
              {state.items.map((item, index) => (
                <Box key={item.id}>
                  <ListItem
                    disableGutters
                    sx={{ py: 1.5 }}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          onClick={() =>
                            setEditDraft({
                              id: item.id,
                              title: item.title,
                              notes: item.notes,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            dispatch({ type: 'remove', payload: { id: item.id } })
                          }
                        >
                          Delete
                        </Button>
                      </Stack>
                    }
                  >
                    <Checkbox
                      edge="start"
                      checked={item.done}
                      onChange={() =>
                        dispatch({ type: 'toggle', payload: { id: item.id } })
                      }
                    />
                    <ListItemText
                      primary={item.title}
                      secondary={item.notes || 'No notes'}
                      slotProps={{
                        primary: {
                          sx: {
                            textDecoration: item.done ? 'line-through' : 'none',
                            fontWeight: 600,
                          },
                        },
                      }}
                    />
                  </ListItem>
                  {index < state.items.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      <Dialog open={Boolean(editDraft)} onClose={() => setEditDraft(null)} fullWidth>
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={editDraft?.title ?? ''}
              onChange={(event) =>
                setEditDraft((current) =>
                  current ? { ...current, title: event.target.value } : current,
                )
              }
              required
            />
            <TextField
              label="Notes"
              value={editDraft?.notes ?? ''}
              onChange={(event) =>
                setEditDraft((current) =>
                  current ? { ...current, notes: event.target.value } : current,
                )
              }
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDraft(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App
