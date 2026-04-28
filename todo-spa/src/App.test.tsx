import { beforeEach, describe, expect, it } from 'vitest'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

function renderApp() {
  const theme = createTheme({ palette: { mode: 'light' } })

  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App themeMode="light" onToggleTheme={() => undefined} />
    </ThemeProvider>,
  )
}

describe('App interactions', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('supports add, edit, and delete flow', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Ship phase D')
    await user.type(screen.getByRole('textbox', { name: /notes/i }), 'Add docs and tests')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Ship phase D')).toBeTruthy()
    expect(screen.getByText('Add docs and tests')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    const dialog = screen.getByRole('dialog')
    const dialogTitleInput = within(dialog).getByRole('textbox', { name: /title/i })
    const dialogNotesInput = within(dialog).getByRole('textbox', { name: /notes/i })

    await user.clear(dialogTitleInput)
    await user.type(dialogTitleInput, 'Ship phase D (updated)')
    await user.clear(dialogNotesInput)
    await user.type(dialogNotesInput, 'Updated notes')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))

    expect(screen.getByText('Ship phase D (updated)')).toBeTruthy()
    expect(screen.getByText('Updated notes')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Ship phase D (updated)')).toBeNull()
    expect(screen.getByText('No tasks yet. Add your first task above.')).toBeTruthy()
  })
})