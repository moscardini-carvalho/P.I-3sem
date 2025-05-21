import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

function Home() {
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo a Sketchhood - Streetwear
        </Typography>
        <Typography variant="body1" paragraph>
        A gente mistura o traço dos desenhos raiz com a alma da rua. Cada peça é um drop exclusivo, com estilo oldschool, cor vibrante e identidade urbana no drip.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home; 