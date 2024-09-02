const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Rota para registrar um novo grupo de matérias
router.post('/group/register', async (req, res) => {
  const { name, turma } = req.body;

  try {
    const newGroup = await prisma.materialGroup.create({
      data: {
        name,
        turma,
      },
    });
    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar o grupo de matérias' });
  }
});

// Rota para buscar todos os grupos de matérias com filtros
router.get('/group/search', async (req, res) => {
  const { turma, status } = req.query;

  const filters = {};
  
  if (turma) filters.turma = turma;
  if (status) filters.disabled = status === 'desativado';

  try {
    const groups = await prisma.materialGroup.findMany({
      where: filters,
    });
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar os grupos de matérias' });
  }
});

// Rota para ativar/desativar um grupo de matérias
router.put('/group/toggle/:id', async (req, res) => {
  const { id } = req.params;
  const { disabled } = req.body;

  try {
    const updatedGroup = await prisma.materialGroup.update({
      where: { id: parseInt(id) },
      data: { disabled },
    });
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o status do grupo de matérias' });
  }
});

router.delete('/group/delete/:id', async (req, res) => {
  const groupId = parseInt(req.params.id, 10);

  try {
    const deletedGroup = await prisma.materialGroup.delete({
      where: { id: groupId },
    });
    
    res.status(200).json({ message: 'Grupo de matérias excluído com sucesso!', deletedGroup });
  } catch (error) {
    console.error('Erro ao excluir o grupo de matérias:', error);
    res.status(500).json({ message: 'Erro ao excluir o grupo de matérias' });
  }
});

// Rota para registrar uma nova matéria
router.post('/register', async (req, res) => {
  const { name, description, turma, group } = req.body;

  try {
    const newMaterial = await prisma.material.create({
      data: {
        name,
        description,
        turma,
        group,
      },
    });
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar a matéria' });
  }
});


// Rota para buscar todas as matérias
router.get('/search', async (req, res) => {
  const { turma, status, grupo } = req.query;
  
  const filters = {};
  
  if (turma) filters.turma = turma;
  if (status) filters.disabled = status === 'desativado';
  if (grupo) filters.group = grupo;

  try {
    const materials = await prisma.material.findMany({
      where: filters,
    });
    res.status(200).json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar as matérias' });
  }
});

router.put('/toggle/:id', (req, res) => {
  const materialId = req.params.id;
  const { disabled } = req.body;

  if (typeof disabled !== 'boolean') {
    return res.status(400).json({ error: 'Campo "disabled" deve ser um booleano' });
  }

  const newStatus = disabled ? 0 : 1;

  const query = 'UPDATE materials SET disabled = ? WHERE id = ?';
  db.query(query, [newStatus, materialId], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar o status da matéria:', err);
      return res.status(500).json({ error: 'Erro ao atualizar o status da matéria' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Matéria não encontrada' });
    }
    res.status(200).json({ message: 'Status da matéria atualizado com sucesso' });
  });
});

// Rota para excluir uma matéria
router.delete('/delete/:id', async (req, res) => {
  const materialId = parseInt(req.params.id, 10);

  try {
    const deletedMaterial = await prisma.material.delete({
      where: { id: materialId },
    });
    res.status(200).json({ message: 'Matéria excluída com sucesso!', deletedMaterial });
  } catch (error) {
    console.error('Erro ao excluir a matéria:', error);
    res.status(500).json({ message: 'Erro ao excluir a matéria' });
  }
});

module.exports = router;
