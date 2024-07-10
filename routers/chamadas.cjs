const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { handleErro, convertDateToISO } = require('../utils.cjs');
const { DateTime } = require('luxon');

const router = express.Router();
const prisma = new PrismaClient();

const getCurrentDateTimeInSaoPaulo = () => DateTime.now().setZone('America/Sao_Paulo').toISO();

//* Endpoint para registrar chamada dos juniores
router.post('/register/juniores', async (req, res) => {
  const { professor, tituloAula, alunos, dataAula } = req.body; // Usar 'professor' ao invés de 'userName'

  try {
    // Verificando se professor é uma string válida
    if (typeof professor !== 'string' || professor.trim() === '') {
      return handleErro(res, 'Nome do professor é inválido', 400);
    }

    const config = await prisma.config.findUnique({ where: { key: 'limitar_chamadas_por_dia' } });

    if (config?.value) {
      const chamadaExistente = await prisma.chamadaJuniores.findFirst({
        where: {
          Data: {
            gte: DateTime.fromISO(dataAula).startOf('day').toISO(),
            lt: DateTime.fromISO(dataAula).endOf('day').toISO(),
          },
        },
      });

      if (chamadaExistente) {
        return handleErro(res, 'Já existe uma chamada registrada para esta turma neste dia.', 400);
      }
    }

    await prisma.chamadaJuniores.create({
      data: {
        Data: dataAula,
        Professor: professor, // Usar 'professor' ao invés de 'userName'
        Titulo: tituloAula,
        Alunos: {
          create: alunos.map(aluno => ({
            NomeAluno: aluno.nome,
            Presenca: aluno.presente || 'ausente',
          })),
        },
      },
    });

    res.json({ message: 'Chamada dos juniores salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar chamada dos juniores:', error); // Log do erro detalhado
    handleErro(res, 'Erro ao salvar chamada dos juniores', 500);
  }
});

//* Endpoint para gerenciar chamadas do juniores
router.get('/gerenciar/juniores', async (req, res) => {
  try {
    const { ordem, professor } = req.query;
    let orderBy = { Data: 'desc' };
    let where = {};

    if (ordem === 'antigas') {
      orderBy = { Data: 'asc' };
    }

    if (professor) {
      where = { Professor: professor };
    }

    const chamadas = await prisma.chamadaJuniores.findMany({
      orderBy,
      where,
    });

    res.json(chamadas);
  } catch (error) {
    console.error('Erro ao buscar chamadas do juniores:', error);
    handleErro(res, 'Erro ao buscar chamadas do juniores');
  }
});

//* Endpoint para visualizar dado da chamada do juniores
router.get('/gerenciar/juniores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const chamada = await prisma.chamadaJuniores.findUnique({
      where: { id: parseInt(id) },
      include: {
        Alunos: true
      }
    });

    if (chamada) {
      // console.log('Data enviada ao front-end:', chamada);

      res.json({
        chamada,
        alunos: chamada.Alunos
      });
    } else {
      res.status(404).json({ error: 'Chamada não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar chamada:', error);
    res.status(500).json({ error: 'Erro ao buscar chamada' });
  }
});

//* Endpoint para atualizar dados da chamada do juniores
router.put('/update/juniores/:id', async (req, res) => {
  const { id } = req.params;
  const { chamada, alunos } = req.body;

  // console.log('Data recebida do front-end:', { id, chamada, alunos });

  try {
    const updatedChamada = await prisma.chamadaJuniores.update({
      where: { id: parseInt(id) },
      data: {
        Data: chamada.Data,
        Professor: chamada.Professor,
        Titulo: chamada.Titulo
      }
    });

    const updatePromises = alunos.map(aluno => {
      console.log('Atualizando aluno:', aluno);
      return prisma.alunoChamadaJunior.update({
        where: { id: aluno.id },
        data: {
          Presenca: aluno.Presenca
        }
      });
    });
    await Promise.all(updatePromises);

    // console.log('Data enviada ao front-end:', { updatedChamada });

    res.json({ message: 'Chamada e alunos atualizados com sucesso', updatedChamada });
  } catch (error) {
    console.error('Erro ao atualizar dados da chamada:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados da chamada' });
  }
});


//* Endpoint para excluir chamada do juniores
router.delete('/excluir/juniores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const chamada = await prisma.chamadaJuniores.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        Alunos: true
      }
    });

    if (!chamada) {
      return res.status(404).json({ error: 'Chamada não encontrada.' });
    }

    const deletedAlunos = await prisma.alunoChamadaJunior.deleteMany({
      where: {
        ChamadaId: parseInt(id)
      }
    });

    const deletedChamada = await prisma.chamadaJuniores.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({ message: 'Chamada excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir chamada:', error);
    res.status(500).json({ error: 'Erro ao excluir chamada.' });
  }
});

//* Endpoint para registrar chamada do maternal
router.post('/register/maternal', async (req, res) => {
  const { userName, tituloAula, alunos, dataAula } = req.body; // Certificando-se de que todos os campos necessários estão presentes

  try {
    // Verificando se userName é uma string válida
    if (typeof userName !== 'string' || userName.trim() === '') {
      return handleErro(res, 'Nome do professor é inválido', 400);
    }

    const config = await prisma.config.findUnique({ where: { key: 'limitar_chamadas_por_dia' } });

    if (config?.value) {
      const chamadaExistente = await prisma.chamadaMaternal.findFirst({
        where: {
          Data: {
            gte: DateTime.fromISO(dataAula).startOf('day').toISO(),
            lt: DateTime.fromISO(dataAula).endOf('day').toISO(),
          },
        },
      });

      if (chamadaExistente) {
        return handleErro(res, 'Já existe uma chamada registrada para esta turma neste dia.', 400);
      }
    }

    await prisma.chamadaMaternal.create({
      data: {
        Data: dataAula,
        Professor: userName, // Certificando-se de que userName é uma string e está sendo passado corretamente
        Titulo: tituloAula,
        Alunos: {
          create: alunos.map(aluno => ({
            NomeAluno: aluno.nome,
            Presenca: aluno.presente || 'ausente',
          })),
        },
      },
    });

    res.json({ message: 'Chamada do maternal salva com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar chamada do maternal:', error); // Log do erro detalhado
    handleErro(res, 'Erro ao salvar chamada do maternal', 500);
  }
});

//* Endpoint para gerenciar chamadas do maternal
router.get('/gerenciar/maternal', async (req, res) => {
  try {
    const { ordem, professor } = req.query;
    let orderBy = { Data: 'desc' };
    let where = {};

    if (ordem === 'antigas') {
      orderBy = { Data: 'asc' };
    }

    if (professor) {
      where = { Professor: professor };
    }

    const chamadas = await prisma.chamadaMaternal.findMany({
      orderBy,
      where,
    });

    res.json(chamadas);
  } catch (error) {
    console.error('Erro ao buscar chamadas do maternal:', error);
    handleErro(res, 'Erro ao buscar chamadas do maternal');
  }
});

//* Endpoint para visualizar dado da chamada do maternal
router.get('/gerenciar/maternal/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const chamada = await prisma.chamadaMaternal.findUnique({
      where: { id: parseInt(id) },
      include: {
        Alunos: true
      }
    });

    if (chamada) {
      // console.log('Data enviada ao front-end:', chamada);

      res.json({
        chamada,
        alunos: chamada.Alunos
      });
    } else {
      res.status(404).json({ error: 'Chamada não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao buscar chamada:', error);
    res.status(500).json({ error: 'Erro ao buscar chamada' });
  }
});

//* Endpoint para atualizar dados da chamada do maternal
router.put('/update/maternal/:id', async (req, res) => {
  const { id } = req.params;
  const { chamada, alunos } = req.body;

  // console.log('Data recebida do front-end:', { id, chamada, alunos });

  try {
    const updatedChamada = await prisma.chamadaMaternal.update({
      where: { id: parseInt(id) },
      data: {
        Data: chamada.Data,
        Professor: chamada.Professor,
        Titulo: chamada.Titulo
      }
    });

    const updatePromises = alunos.map(aluno =>
      prisma.AlunoChamadaMaternal.update({
        where: { id: aluno.id },
        data: {
          Presenca: aluno.Presenca
        }
      })
    );
    await Promise.all(updatePromises);

    // console.log('Data enviada ao front-end:', { updatedChamada });

    res.json({ message: 'Chamada e alunos atualizados com sucesso', updatedChamada });
  } catch (error) {
    console.error('Erro ao atualizar dados da chamada:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados da chamada' });
  }
});

//* Endpoint para excluir chamada do maternal
router.delete('/excluir/maternal/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const chamada = await prisma.chamadaMaternal.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        Alunos: true
      }
    });

    if (!chamada) {
      return res.status(404).json({ error: 'Chamada não encontrada.' });
    }

    await prisma.alunoChamadaMaternal.deleteMany({
      where: {
        ChamadaId: parseInt(id)
      }
    });

    await prisma.chamadaMaternal.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({ message: 'Chamada excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir chamada:', error);
    res.status(500).json({ error: 'Erro ao excluir chamada.' });
  }
});

module.exports = router;