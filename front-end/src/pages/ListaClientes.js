import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import api from '../services/api';

function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    email: '',
    logradouro: '',
    num_casa: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
    celular: '',
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get('/clientes');
        setClientes(response.data);
      } catch (err) {
        setError('Erro ao carregar a lista de clientes');
      }
    };

    fetchClientes();
  }, []);

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    const dataNascimento = cliente.data_nascimento 
      ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')
      : '';
    
    setFormData({
      nome: cliente.nome,
      cpf: cliente.cpf,
      data_nascimento: dataNascimento,
      email: cliente.email,
      logradouro: cliente.logradouro,
      num_casa: cliente.num_casa,
      complemento: cliente.complemento || '',
      bairro: cliente.bairro,
      municipio: cliente.municipio,
      uf: cliente.uf,
      cep: cliente.cep,
      celular: cliente.celular,
    });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedCliente(null);
    setFormData({
      nome: '',
      cpf: '',
      data_nascimento: '',
      email: '',
      logradouro: '',
      num_casa: '',
      complemento: '',
      bairro: '',
      municipio: '',
      uf: '',
      cep: '',
      celular: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.put(`/clientes/${selectedCliente.id}`, formData);
      const response = await api.get('/clientes');
      setClientes(response.data);
      handleClose();
    } catch (err) {
      setError('Erro ao atualizar cliente');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lista de Clientes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Celular</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente, index) => (
                <TableRow key={cliente.id}>
                  <TableCell>{String(index + 1).padStart(2, '0')}</TableCell>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.celular}</TableCell>
                  <TableCell>
                    <Button 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleEdit(cliente)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button 
                      color="error" 
                      variant="outlined" 
                      size="small" 
                      onClick={async () => {
                        if(window.confirm('Tem certeza que deseja excluir este cliente?')) {
                          try {
                            await api.delete(`/clientes/${cliente.id}`);
                            setClientes(clientes.filter(c => c.id !== cliente.id));
                          } catch (err) {
                            setError('Erro ao excluir cliente');
                          }
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data de Nascimento"
                name="data_nascimento"
                placeholder="dd/mm/aaaa"
                value={formData.data_nascimento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                name="num_casa"
                value={formData.num_casa}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Município"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="UF"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ListaClientes; 