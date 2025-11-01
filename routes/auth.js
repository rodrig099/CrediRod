const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Login para clientes (usando cédula como contraseña por defecto)
router.post('/login', async (req, res) => {
  try {
    const { cedula, password } = req.body;

    // Buscar cliente por cédula
    const [users] = await pool.execute(
      'SELECT * FROM clients WHERE cedula = ?',
      [cedula]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Cédula no encontrada' });
    }

    const user = users[0];

    // Verificar contraseña (por defecto es la cédula)
    const isValidPassword = password === user.cedula || 
                           (user.password && await bcrypt.compare(password, user.password));

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: user.id, 
        cedula: user.cedula,
        tipo: user.cedula === 'admin' ? 'admin' : 'cliente'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        cedula: user.cedula,
        nombres: user.nombres,
        apellidos: user.apellidos,
        tipo: user.cedula === 'admin' ? 'admin' : 'cliente'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;