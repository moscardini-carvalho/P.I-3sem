import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  Container,
  Box,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function CadastroProduto() {
  const [formData, setFormData] = useState({
    nome: '',
    marca: '',
    detalhes: '',
    quantidade: '',
    unidade_medida: '',
    preco_unitario: '',
    qtd_estoque: '',
    categoria_id: '',
    fornecedor_ids: [],
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await api.get('/categorias');
        setCategorias(catRes.data);
        const fornRes = await api.get('/fornecedores');
        setFornecedores(fornRes.data);
      } catch (err) {
        // Ignorar erro de carregamento
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fornecedor_ids') {
      setFormData((prev) => ({
        ...prev,
        fornecedor_ids: typeof value === 'string' ? value.split(',') : value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Adiciona os campos do formulário
      Object.keys(formData).forEach(key => {
        if (key === 'fornecedor_ids') {
          formData[key].forEach(id => {
            formDataToSend.append('fornecedor_ids[]', id);
          });
        } else if (['quantidade', 'preco_unitario', 'qtd_estoque'].includes(key)) {
          // Converte campos numéricos para Float
          formDataToSend.append(key, parseFloat(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Adiciona as imagens
      selectedImages.forEach(image => {
        formDataToSend.append('imagens', image);
      });

      await api.post('/produtos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Produto cadastrado com sucesso!' });
      setFormData({
        nome: '',
        marca: '',
        detalhes: '',
        quantidade: '',
        unidade_medida: '',
        preco_unitario: '',
        qtd_estoque: '',
        categoria_id: '',
        fornecedor_ids: [],
      });
      setSelectedImages([]);
    } catch (error) {
      let errorMsg = 'Erro ao cadastrar produto.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          errorMsg = JSON.stringify(error.response.data);
        }
        errorMsg += ` (Status: ${error.response.status})`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cadastro de Produto
        </Typography>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
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
                label="Marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Detalhes"
                name="detalhes"
                value={formData.detalhes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantidade"
                name="quantidade"
                type="number"
                value={formData.quantidade}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unidade de Medida"
                name="unidade_medida"
                value={formData.unidade_medida}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Preço Unitário"
                name="preco_unitario"
                type="number"
                value={formData.preco_unitario}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantidade em Estoque"
                name="qtd_estoque"
                type="number"
                value={formData.qtd_estoque}
                onChange={handleChange}
                required
              />
            </Grid>
            {categorias.length > 0 && (
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Categoria"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="">Selecione uma categoria</MenuItem>
                  {categorias.map((cat, idx) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {`${String(idx + 2).padStart(2, '0')} - ${cat.descricao}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            {fornecedores.length > 0 && (
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Fornecedores"
                  name="fornecedor_ids"
                  value={formData.fornecedor_ids}
                  onChange={handleChange}
                  SelectProps={{
                    multiple: true,
                    renderValue: (selected) => {
                      if (!selected.length) return '';
                      return fornecedores
                        .filter(f => selected.includes(f.id))
                        .map((f, idx) => `${String(fornecedores.findIndex(x => x.id === f.id) + 1).padStart(2, '0')} - ${f.razao_social}`)
                        .join(', ');
                    }
                  }}
                  sx={{ mb: 3 }}
                >
                  {fornecedores.map((forn, idx) => (
                    <MenuItem key={forn.id} value={forn.id}>
                      {`${String(idx + 1).padStart(2, '0')} - ${forn.razao_social}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Imagens do Produto
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span">
                    Adicionar Imagens
                  </Button>
                </label>
              </Box>
              <Grid container spacing={2}>
                {selectedImages.map((image, index) => (
                  <Grid item key={index}>
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'white',
                          '&:hover': { bgcolor: 'grey.100' },
                        }}
                        onClick={() => removeImage(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
              >
                Cadastrar Produto
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default CadastroProduto;
