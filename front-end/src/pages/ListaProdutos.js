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
} from '@mui/material';
import api from '../services/api';

function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
      } catch (err) {
        setError('Erro ao carregar a lista de produtos');
      }
    };
    fetchProdutos();
  }, []);

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
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.marca}</TableCell>
                  <TableCell>{produto.preco_unitario}</TableCell>
                  <TableCell>{produto.qtd_estoque}</TableCell>
                  <TableCell>
                    <Button color="error" variant="outlined" size="small" onClick={async () => {
                      if(window.confirm('Tem certeza que deseja excluir este produto?')) {
                        try {
                          await api.delete(`/produtos/${produto.id}`);
                          setProdutos(produtos.filter(p => p.id !== produto.id));
                        } catch (err) {
                          setError('Erro ao excluir produto');
                        }
                      }
                    }}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default ListaProdutos; 