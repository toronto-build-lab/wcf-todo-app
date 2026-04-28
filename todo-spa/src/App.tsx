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
  Typography,
} from '@mui/material'
import { loadTodoState, saveTodoState, todoReducer } from './todos'

type EditDraft = {
  id: string
  title: string
  notes: string
}

function App() {
  const [state, dispatch] = useReducer(todoReducer, undefined, loadTodoState)
  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null)

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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Todo SPA (Phase B)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Tasks ({state.items.length})
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
