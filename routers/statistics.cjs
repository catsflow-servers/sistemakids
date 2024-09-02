const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/alunos', async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados dos alunos' });
  }
});

router.get('/chamada/juniores', async (req, res) => {
  try {
    const alunosChamadaJunior = await prisma.alunoChamadaJunior.findMany();
    res.json(alunosChamadaJunior);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados dos alunos da chamada junior' });
  }
});

router.get('/chamada/maternal', async (req, res) => {
  try {
    const alunoChamadaMaternal = await prisma.alunoChamadaMaternal.findMany();
    res.json(alunoChamadaMaternal);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados dos alunos da chamada junior' });
  }
});

router.get('/presenca/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(id) }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    let presencas;

    if (aluno.turma === 'Maternal') {
      presencas = await prisma.alunoChamadaMaternal.findMany({
        where: { NomeAluno: aluno.nome },
        select: { Presenca: true }
      });
    } else if (aluno.turma === 'Juniores') {
      presencas = await prisma.alunoChamadaJunior.findMany({
        where: { NomeAluno: aluno.nome },
        select: { Presenca: true }
      });
    } else {
      return res.status(400).json({ error: 'Turma desconhecida' });
    }

    res.json(presencas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar presenças' });
  }
});

router.post('/user', async (req, res) => {
  const { userId } = req.body;

  try {
    // Buscar o nome do usuário pelo userId
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const professorNome = user.nome;

    // Buscar aulas onde o professor é o usuário atual
    const minhasAulasJuniores = await prisma.chamadaJuniores.findMany({
      where: { Professor: professorNome },
    });
    const minhasAulasMaternal = await prisma.chamadaMaternal.findMany({
      where: { Professor: professorNome },
    });

    // Buscar todas as outras aulas
    const outrasAulasJuniores = await prisma.chamadaJuniores.findMany({
      where: { Professor: { not: professorNome } },
    });
    const outrasAulasMaternal = await prisma.chamadaMaternal.findMany({
      where: { Professor: { not: professorNome } },
    });

    const minhasAulas = [...minhasAulasJuniores, ...minhasAulasMaternal];
    const outrasAulas = [...outrasAulasJuniores, ...outrasAulasMaternal];

    res.json({ minhasAulas, outrasAulas });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar informações das aulas' });
  }
});

module.exports = router;