import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';

function Navbar() {
  // Estilo para links ativos
  const activeStyle = {
    color: '#fff', // Branco para links ativos
    fontWeight: 'bold', // Manter negrito
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sketchhood
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={NavLink}
            to="/"
            end
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/cadastro-cliente"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            Cadastro
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/lista-clientes"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            Usuários
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/cadastro-produto"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            Cadastrar Produto
          </Button>
          <Button
            color="inherit"
            component={NavLink}
            to="/produtos"
            style={({ isActive }) => (isActive ? activeStyle : undefined)}
          >
            Listar Produtos
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 