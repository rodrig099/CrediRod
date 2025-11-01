require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const creditRoutes = require('./routes/credits');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/credits', creditRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ message: 'API CrediRod funcionando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});