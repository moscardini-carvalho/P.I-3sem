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
  Container,
  Button,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImagesToKeep, setExistingImagesToKeep] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
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
  const [existingImagePreviews, setExistingImagePreviews] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produtosRes, categoriasRes, fornecedoresRes] = await Promise.all([
          api.get('/produtos'),
          api.get('/categorias'),
          api.get('/fornecedores')
        ]);
        setProdutos(produtosRes.data);
        setCategorias(categoriasRes.data);
        setFornecedores(fornecedoresRes.data);
      } catch (err) {
        setError('Erro ao carregar os dados');
      }
    };
    fetchData();
  }, []);

  const handleEdit = (produto) => {
    setSelectedProduto(produto);
    setFormData({
      nome: produto.nome,
      marca: produto.marca,
      detalhes: produto.detalhes || '',
      quantidade: produto.quantidade,
      unidade_medida: produto.unidade_medida,
      preco_unitario: produto.preco_unitario,
      qtd_estoque: produto.qtd_estoque,
      categoria_id: produto.categoria_id,
      fornecedor_ids: produto.fornecedores?.map(f => f.id) || [],
    });
    setSelectedImages([]);
    fetchExistingImages(produto.id);
    setMessage({ type: '', text: '' });
    setOpenDialog(true);
  };

  const fetchExistingImages = async (produtoId) => {
    try {
      const response = await api.get(`/produtos/${produtoId}/imagens`);
      const imagesData = response.data.map(img => ({ 
        id: img._id,
        url: `${process.env.REACT_APP_API_URL || ''}/imagens-produto/${img._id}`
      }));
      setExistingImagesToKeep(imagesData.map(img => img.id));
      const previews = {};
      imagesData.forEach(img => {
        previews[img.id] = img.url;
      });
      setExistingImagePreviews(previews);
    } catch (err) {
      console.error('Erro ao buscar imagens existentes:', err);
      setMessage({ type: 'error', text: 'Erro ao carregar imagens existentes.' });
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedProduto(null);
    setSelectedImages([]);
    setExistingImagesToKeep([]);
    setMessage({ type: '', text: '' });
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
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fornecedor_ids') {
      setFormData(prev => ({
        ...prev,
        fornecedor_ids: typeof value === 'string' ? value.split(',') : value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNewImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleKeepExistingImage = (imageId) => {
    setExistingImagesToKeep(prevKept =>
      prevKept.includes(imageId)
        ? prevKept.filter(id => id !== imageId)
        : [...prevKept, imageId]
    );
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'fornecedor_ids') {
          formData[key].forEach(id => {
            formDataToSend.append('fornecedor_ids[]', id);
          });
        } else if (['quantidade', 'preco_unitario', 'qtd_estoque'].includes(key)) {
          formDataToSend.append(key, parseFloat(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      selectedImages.forEach(image => {
        formDataToSend.append('imagens', image);
      });

      existingImagesToKeep.forEach(imageId => {
        formDataToSend.append('existingImagesToKeep[]', imageId);
      });

      await api.put(`/produtos/${selectedProduto.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Produto atualizado com sucesso!' });
      const response = await api.get('/produtos');
      setProdutos(response.data);
      handleClose();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao atualizar produto.' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Lista de Produtos
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
                <TableCell>Nº</TableCell>
                <TableCell>Imagens</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Marca</TableCell>
                <TableCell>Preço Unitário</TableCell>
                <TableCell>Qtd. Estoque</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtos.map((produto, index) => (
                <TableRow key={produto.id}>
                  <TableCell>{String(index + 1).padStart(2, '0')}</TableCell>
                  <TableCell>
                    {produto.fotos && produto.fotos.length > 0 ? (
                      <Box sx={{ display: 'flex', overflowX: 'auto', maxWidth: 200 }}>
                        {produto.fotos.map((foto, idx) => (
                          <Box key={foto.id} sx={{ minWidth: 100, mr: 1 }}>
                            <img
                              src={`${process.env.REACT_APP_API_URL || ''}/imagens-produto/${foto.id}`}
                              alt={`${produto.nome} - Imagem ${idx + 1}`}
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sem imagens
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.marca}</TableCell>
                  <TableCell>{produto.preco_unitario}</TableCell>
                  <TableCell>{produto.qtd_estoque}</TableCell>
                  <TableCell>
                    <Button 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleEdit(produto)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button 
                      color="error" 
                      variant="outlined" 
                      size="small" 
                      onClick={async () => {
                        if(window.confirm('Tem certeza que deseja excluir este produto?')) {
                          try {
                            await api.delete(`/produtos/${produto.id}`);
                            setProdutos(produtos.filter(p => p.id !== produto.id));
                          } catch (err) {
                            setError('Erro ao excluir produto');
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
        <DialogTitle>Editar Produto</DialogTitle>
        <DialogContent>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
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
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantidade"
                name="quantidade"
                type="number"
                inputProps={{ step: "0.01" }}
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
                inputProps={{ step: "0.01" }}
                value={formData.preco_unitario}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantidade em Estoque"
                name="qtd_estoque"
                type="number"
                inputProps={{ step: "0.01" }}
                value={formData.qtd_estoque}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Categoria"
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                required
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.descricao}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Fornecedores"
                name="fornecedor_ids"
                value={formData.fornecedor_ids}
                onChange={handleChange}
                SelectProps={{
                  multiple: true,
                }}
                required
              >
                {fornecedores.map((fornecedor) => (
                  <MenuItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.razao_social}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Imagens do Produto
              </Typography>
              
              {selectedProduto?.fotos && selectedProduto.fotos.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Imagens Atuais (desmarque para remover)
                  </Typography>
                  <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={164}>
                    {selectedProduto.fotos.map((foto, idx) => (
                      <ImageListItem key={idx}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={`${process.env.REACT_APP_API_URL || ''}/imagens-produto/${foto.id}`}
                            alt={`${selectedProduto.nome} - Imagem ${idx + 1}`}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Checkbox
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              color: 'white',
                              '&.Mui-checked': { color: 'white' },
                              textShadow: '1px 1px 2px black',
                            }}
                            checked={existingImagesToKeep.includes(foto.id)}
                            onChange={() => handleToggleKeepExistingImage(foto.id)}
                          />
                        </Box>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleNewImageChange}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span">
                    Adicionar Novas Imagens
                  </Button>
                </label>
              </Box>

              {selectedImages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Novas Imagens (prévia)
                  </Typography>
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
                            onClick={() => removeNewImage(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ListaProdutos; 