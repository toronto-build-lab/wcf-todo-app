import { useEffect, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App'
import {
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from './todos'

function AppRoot() {
  const [themeMode, setThemeMode] = useState<ThemePreference>(loadThemePreference)

  useEffect(() => {
    saveThemePreference(themeMode)
  }, [themeMode])

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: themeMode === 'light' ? '#006C67' : '#7BD3CB',
          },
          background: {
            default: themeMode === 'light' ? '#F8FAF7' : '#0F1717',
            paper: themeMode === 'light' ? '#FFFFFF' : '#172020',
          },
        },
        shape: {
          borderRadius: 14,
        },
        typography: {
          fontFamily: 'Avenir Next, Segoe UI, Helvetica, Arial, sans-serif',
        },
      }),
    [themeMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App
        themeMode={themeMode}
        onToggleTheme={() =>
          setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))
        }
      />
    </ThemeProvider>
  )
}

export default AppRoot