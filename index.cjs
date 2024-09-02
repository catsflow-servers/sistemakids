const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authRoutes = require("./routers/auth.cjs")
const materialRoutes = require("./routers/material.cjs")
const verifyRoutes = require("./routers/verify.cjs")
const alunosRoutes = require("./routers/alunos.cjs")
const chamadasRoutes = require("./routers/chamadas.cjs")
const configRoutes = require("./routers/config.cjs")
const statisticsRoutes = require("./routers/statistics.cjs")

const app = express();

const connectWithRetry = async () => {
  try {
    await prisma.$connect();
    console.log('Conectado ao banco de dados');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    console.log('Tentando se reconectar em 5 segundos...');
    setTimeout(connectWithRetry, 8000); // Tenta se reconectar após 5 segundos
  }
};

connectWithRetry(); // Inicia a primeira tentativa de conexão

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Servidor funcional!');
});

app.use('/auth', authRoutes);
app.use('/material', materialRoutes);
app.use('/verify', verifyRoutes);
app.use('/alunos', alunosRoutes);
app.use('/chamadas', chamadasRoutes);
app.use('/config', configRoutes);
app.use('/statistics', statisticsRoutes);

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Servidor funcional em http://0.0.0.0:${PORT}`);
});
