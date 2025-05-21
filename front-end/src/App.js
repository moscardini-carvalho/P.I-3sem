import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CadastroCliente from './pages/CadastroCliente';
import ListaClientes from './pages/ListaClientes';
import CadastroProduto from './pages/CadastroProduto';
import ListaProdutos from './pages/ListaProdutos';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro-cliente" element={<CadastroCliente />} />
            <Route path="/lista-clientes" element={<ListaClientes />} />
            <Route path="/cadastro-produto" element={<CadastroProduto />} />
            <Route path="/produtos" element={<ListaProdutos />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
