import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import api from '../services/api';

function CadastroCliente() {
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

  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let data_nascimento = formData.data_nascimento;
    if (!data_nascimento) {
      data_nascimento = null;
    } else if (data_nascimento.includes('/')) {
      const [dia, mes, ano] = data_nascimento.split('/');
      data_nascimento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    if (data_nascimento && /^\d{4}-\d{2}-\d{2}$/.test(data_nascimento)) {
      data_nascimento = data_nascimento + 'T00:00:00.000Z';
    }

    try {
      await api.post('/clientes', { ...formData, data_nascimento });
      setMessage({ type: 'success', text: 'Cliente cadastrado com sucesso!' });
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
    } catch (error) {
      let errorMsg = 'Erro ao cadastrar cliente. Verifique os dados e tente novamente.';
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMsg = error.response.data;
          } else if (error.response.data.error) {
            errorMsg = error.response.data.error;
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message;
          } else {
            errorMsg = JSON.stringify(error.response.data);
          }
        }
        errorMsg += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setMessage({
        type: 'error',
        text: errorMsg,
      });
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cadastro de Cliente
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
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
                type="date"
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Logradouro"
                name="logradouro"
                value={formData.logradouro}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Município"
                name="municipio"
                value={formData.municipio}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="UF"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Cadastrar Cliente
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CadastroCliente; 