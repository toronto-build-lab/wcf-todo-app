import { AppBar, Box, Container, Paper, Toolbar, Typography } from '@mui/material'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
            Todo SPA
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Phase A Scaffold Ready
          </Typography>
          <Typography color="text.secondary">
            This baseline app shell uses Vite, React, TypeScript, and Material UI.
            Todo features and local state handling will be added in Phase B.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default App
