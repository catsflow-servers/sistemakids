const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { handleErro, convertDateToISO } = require('../utils.cjs');

const router = express.Router();
const prisma = new PrismaClient();

//* Endpoint para registrar alunos
router.post('/register', async (req, res) => {
  const { nome, responsavel, sexo, dataNascimento, observacao, turma, idade } = req.body;

  try {
    const dataNascimentoFormatada = convertDateToISO(dataNascimento);
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        idade,
        responsavel,
        sexo,
        dataNascimento: dataNascimentoFormatada,
        observacao,
        turma,
      },
    });
    res.json(aluno);
  } catch (error) {
    console.log('Erro ao registrar aluno:', error);  // Adicionando console.log para registrar o erro
    handleErro(res, 'Erro para registrar alunos.');
  }
});

//* Endpoint para procurar alunos dos juniores
router.get('/search/juniores', async (req, res) => {
  try {
    // console.log("Iniciando busca por alunos juniores...");
    const { sexo, ordem } = req.query;
    let whereClause = { turma: "Juniores" };

    if (sexo) {
      whereClause.sexo = sexo;
    }
    let orderByClause = { nome: 'asc' };
    if (ordem === 'A-Z') {
      orderByClause = { nome: 'asc' };
    } else if (ordem === 'Z-A') {
      orderByClause = { nome: 'desc' };
    }

    const alunosJuniores = await prisma.aluno.findMany({
      where: whereClause,
      orderBy: orderByClause
    });

    // console.log("Alunos juniores encontrados:", alunosJuniores);
    res.json(alunosJuniores);
  } catch (error) {
    console.error("Erro ao buscar alunos juniores:", error);
    handleErro(res, 'Erro ao buscar alunos do juniores.');
  }
});

//* Endpoint para procurar alunos do maternal
router.get('/search/maternal', async (req, res) => {
  try {
    // console.log("Iniciando busca por alunos maternal...");
    const { sexo, ordem } = req.query;
    let whereClause = { turma: "Maternal" };

    if (sexo) {
      whereClause.sexo = sexo;
    }
    let orderByClause = { nome: 'asc' };
    if (ordem === 'A-Z') {
      orderByClause = { nome: 'asc' };
    } else if (ordem === 'Z-A') {
      orderByClause = { nome: 'desc' };
    }

    const alunosMaternal = await prisma.aluno.findMany({
      where: whereClause,
      orderBy: orderByClause
    });

    // console.log("Alunos maternal encontrados:", alunosMaternal);
    res.json(alunosMaternal);
  } catch (error) {
    console.error("Erro ao buscar alunos maternal:", error);
    handleErro(res, 'Erro ao buscar alunos do maternal.');
  }
});

//* Endpoint para visualizar dados do aluno
router.get('/gerenciar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: parseInt(id) }
    });

    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar informações do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar informações do aluno' });
  }
});

//* Endpoint para atualizar dados do aluno
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, sexo, idade, responsavel, dataNascimento, observacao, turma } = req.body;

  try {
    // Logando os dados recebidos
    console.log('Dados recebidos:', {
      id,
      nome,
      sexo,
      idade,
      responsavel,
      dataNascimento,
      observacao,
      turma
    });

    if (!nome || !sexo || !idade || !responsavel || !dataNascimento || !turma) {
      console.log('Campos obrigatórios faltando');
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    // Logando a data antes da conversão
    console.log('Data antes da conversão:', dataNascimento);

    const formattedDataNascimento = convertDateToISO(dataNascimento);

    // Logando a data depois da conversão
    console.log('Data depois da conversão:', formattedDataNascimento);

    const updatedAluno = await prisma.aluno.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        sexo,
        idade: idade.toString(), // Convertendo idade para string
        responsavel,
        dataNascimento: formattedDataNascimento,
        observacao,
        turma
      }
    });

    // Logando os dados atualizados
    console.log('Dados atualizados:', updatedAluno);

    res.json(updatedAluno);
  } catch (error) {
    // Logando o erro completo
    console.error('Erro ao atualizar dados do aluno:', error);
    handleErro(res, `Erro ao atualizar dados do aluno: ${error.message}`);
  }
});

//* Endpoint para excluir alunos
router.delete('/excluir/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    await prisma.aluno.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({ message: 'Aluno excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    res.status(500).json({ error: 'Erro ao excluir aluno.' });
  }
});

module.exports = router;