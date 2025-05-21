import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Alterado para a porta 8080
});

export default api; 