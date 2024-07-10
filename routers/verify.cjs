const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const express = require('express');

const prisma = new PrismaClient();
const router = express.Router();
require('dotenv').config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

//* Endpoint para verificação dos tokens
router.post('/token', async (req, res) => {
  const { token } = req.body;

  try {
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      const tokenInfo = await prisma.tokens.findFirst({
        where: { token },
      });

      if (!tokenInfo) {
        return res.status(401).json({ message: 'Token não encontrado no banco de dados' });
      }

      res.status(200).json({ message: 'Token válido' });
    });
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//* Endpoint para verificação das permissões
router.post('/permission', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(userId) },
      select: { permission: true },
    });

    if (user) {
      res.status(200).json({ permission: user.permission });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter permissão do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

//* Endpoint para verificação das nome
router.post('/name', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(userId) },
      select: { nome: true },
    });

    if (user) {
      res.status(200).json({ nome: user.nome });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter o nome do usuário:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

router.post('/profile', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(userId) }
    });

    if (user) {
      res.json({
        id: user.id,
        nome: user.nome,
        user: user.user,
        permission: user.permission,
        photoPath: user.photoPath
      });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar informações do usuário' });
  }
});

router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany();
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

module.exports = router;