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
  ImageList,
  ImageListItem,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [selectedPedidoForPhotos, setSelectedPedidoForPhotos] = useState(null);
  const [pedidoPhotos, setPedidoPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoMessage, setPhotoMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('/pedidos');
        setPedidos(response.data);
      } catch (err) {
        setError('Erro ao carregar a lista de pedidos');
      }
    };
    fetchPedidos();
  }, []);

  const handleViewPhotos = async (pedido) => {
    setSelectedPedidoForPhotos(pedido);
    setPedidoPhotos([]);
    setPhotoError('');
    setSelectedPhotos([]);
    setPhotoMessage({ type: '', text: '' });
    try {
      const response = await api.get(`/pedidos/${pedido.id}/fotos`);
      setPedidoPhotos(response.data);
      setOpenPhotoDialog(true);
    } catch (err) {
      setPhotoError('Erro ao carregar as fotos do pedido.');
      setOpenPhotoDialog(true);
    }
  };

  const handleSelectPhoto = (photoId) => {
    setSelectedPhotos(prevSelected =>
      prevSelected.includes(photoId)
        ? prevSelected.filter(id => id !== photoId)
        : [...prevSelected, photoId]
    );
  };

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotos.length === 0) return;

    if (window.confirm(`Tem certeza que deseja excluir ${selectedPhotos.length} foto(s) selecionada(s)?`)) {
      try {
        await Promise.all(
          selectedPhotos.map(photoId => api.delete(`/pedidos/fotos/${photoId}`))
        );
        
        setPedidoPhotos(prevPhotos => prevPhotos.filter(photo => !selectedPhotos.includes(photo.id)));
        
        setPhotoMessage({ type: 'success', text: `${selectedPhotos.length} foto(s) excluída(s) com sucesso!` });
        setSelectedPhotos([]);

      } catch (err) {
        console.error(err);
        setPhotoMessage({ type: 'error', text: 'Erro ao excluir foto(s).' });
      }
    }
  };

  const handleClosePhotoDialog = () => {
    setOpenPhotoDialog(false);
    setSelectedPedidoForPhotos(null);
    setPedidoPhotos([]);
    setPhotoError('');
    setSelectedPhotos([]);
    setPhotoMessage({ type: '', text: '' });
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* ... existing Paper and Typography ... */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nº Pedido</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.num_pedido}</TableCell>
                <TableCell>{new Date(pedido.data_hora).toLocaleString()}</TableCell>
                <TableCell>{pedido.cliente ? pedido.cliente.nome : 'N/A'}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleViewPhotos(pedido)}
                    sx={{ mr: 1 }}
                  >
                    Ver Fotos
                  </Button>
                  {/* Botão de Excluir Pedido (existente) */}
                  <Button 
                    color="error" 
                    variant="outlined" 
                    size="small" 
                    // onClick={...}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para Visualizar/Gerenciar Fotos do Pedido */}
      <Dialog open={openPhotoDialog} onClose={handleClosePhotoDialog} maxWidth="md" fullWidth>
        <DialogTitle>Fotos do Pedido {selectedPedidoForPhotos?.num_pedido}</DialogTitle>
        <DialogContent>
          {photoMessage.text && (
            <Alert severity={photoMessage.type} sx={{ mb: 2 }}>
              {photoMessage.text}
            </Alert>
          )}

          {photoError && !photoMessage.text && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {photoError}
            </Alert>
          )}

          {pedidoPhotos.length > 0 ? (
            <ImageList sx={{ width: '100%', height: 400 }} cols={3} rowHeight={164}>
              {pedidoPhotos.map((foto) => (
                <ImageListItem key={foto.id}>
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={`${process.env.REACT_APP_API_URL}/pedidos/fotos/${foto.id}`}
                      alt={foto.nome || 'Foto do Pedido'}
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
                      checked={selectedPhotos.includes(foto.id)}
                      onChange={() => handleSelectPhoto(foto.id)}
                    />
                  </Box>
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            !photoError && !photoMessage.text && <Typography>Nenhuma foto encontrada para este pedido.</Typography>
          )}

        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteSelectedPhotos} 
            color="error" 
            variant="contained" 
            disabled={selectedPhotos.length === 0}
          >
            Excluir Selecionada(s) ({selectedPhotos.length})
          </Button>
          <Button onClick={handleClosePhotoDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ListaPedidos; 