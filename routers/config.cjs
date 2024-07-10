const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { DateTime } = require('luxon');

const prisma = new PrismaClient();
const router = express.Router();

const getCurrentDateTimeInSaoPaulo = () => DateTime.now().setZone('America/Sao_Paulo').toISO();

//* Endpointer para obter as configurações
router.get('/view', async (req, res) => {
  try {
    const configs = await prisma.config.findMany();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao obter as configurações' });
  }
});

//* Rota para atualizar uma configuração
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  try {
    const updatedConfig = await prisma.config.update({
      where: { id: parseInt(id) },
      data: {
        value: value,
        updatedAt: getCurrentDateTimeInSaoPaulo(),
      },
    });
    res.json(updatedConfig);
  } catch (error) {
    res.status(500).json({ error: 'Falha na atualização da configuração' });
  }
});

module.exports = router;
