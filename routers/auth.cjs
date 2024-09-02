const { PrismaClient } = require('@prisma/client');
const { DateTime } = require('luxon');
const jwt = require('jsonwebtoken');
const express = require('express');

const prisma = new PrismaClient(); // Inicializa o PrismaClient

const router = express.Router();
require('dotenv').config();

// Chaves do Token e Fuso horário
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const getCurrentDateTimeInSaoPaulo = () => DateTime.now().setZone('America/Sao_Paulo').toISO();

//* Endpoint para registrar usuários (admin)
router.post('/register', async (req, res) => {
  try {
    const { nome, usuario, photo, senha, permissao } = req.body;

    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome: nome,
        user: usuario,
        photoPath: photo,
        password: senha,
        permission: permissao,
      },
    });

    res.status(201).json({ message: 'Usuário cadastrado com sucesso', data: novoUsuario });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//* Endpoint para fazer login
router.post('/login', async (req, res) => {
  const { user, password } = req.body;

  try {
    const usuario = await prisma.usuarios.findFirst({
      where: { user },
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    if (password !== usuario.password) {
      console.log('Senha incorreta');
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        permission: usuario.permission,
      },
      jwtSecretKey,
      { expiresIn: '3h' }
    );

    const tokenInfo = await prisma.tokens.create({
      data: {
        userId: usuario.id,
        user: usuario.user,
        permission: usuario.permission,
        token,
        createAt: getCurrentDateTimeInSaoPaulo(),
        expiresAt: DateTime.now().setZone('America/Sao_Paulo').plus({ hours: 3 }).toISO(),
      },
    });

    await prisma.logUsers.create({
      data: {
        userId: usuario.id,
        user: usuario.user,
        token,
        datatime: getCurrentDateTimeInSaoPaulo(),
        info: 'Usuário entrou no sistema',
      },
    });

    res.status(200).json({
      token,
      userId: usuario.id,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//* Endpoint para sair do sistema
router.post('/logout', async (req, res) => {
  const { token } = req.body;

  try {
    const usuario = await prisma.tokens.findFirst({
      where: { token },
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    await prisma.logUsers.create({
      data: {
        userId: usuario.userId,
        user: usuario.user,
        token,
        datatime: getCurrentDateTimeInSaoPaulo(),
        info: 'Usuário saiu do sistema',
      },
    });

    await prisma.tokens.deleteMany({
      where: { token },
    });

    res.status(200).json({ message: 'Usuário desconectado com sucesso', redirectUrl: '/' });
  } catch (error) {
    console.error('Erro ao desconectar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//* Endpoint para listar usuários salvos (admin)
router.get('/gerenciar/usuarios', async (req, res) => {
  try {
    const { permission, ordem } = req.query;

    let whereClause = {};
    if (permission) {
      whereClause.permission = permission;
    }

    let orderByClause = { nome: 'asc' };
    if (ordem === 'A-Z') {
      orderByClause = { nome: 'asc' };
    } else if (ordem === 'Z-A') {
      orderByClause = { nome: 'desc' };
    }

    const usuarios = await prisma.usuarios.findMany({
      where: whereClause,
      orderBy: orderByClause,
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ error: 'Erro ao obter usuários' });
  }
});

//* Endpoint para visualizar dados dos usuários (admin)
router.get('/view/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
});

//* Endpoint para editar dados dos usuários (admin)
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, user, photoPath, permission } = req.body;

  try {
    const updatedUsuario = await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        user,
        photoPath,
        permission,
      },
    });

    res.json(updatedUsuario);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

//* Endpoint para excluir usuário (admin)
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.usuarios.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//* Endpoint para usuários alterarem sua senha
router.post('/change/password/user', async (req, res) => {
  const { newPassword, token } = req.body;

  try {
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      const usuario = await prisma.usuarios.findFirst({
        where: { id: decoded.userId },
      });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await prisma.usuarios.update({
        where: { id: usuario.id },
        data: { password: newPassword },
      });

      res.status(200).json({ message: 'Senha alterada com sucesso' });
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//* Endpoint para alterar senha dos usuários (admin)
router.post('/change/password/admin', async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário não fornecido' });
  }

  try {
    const updatedUser = await prisma.usuarios.update({
      where: {
        id: parseInt(userId, 10),
      },
      data: {
        password: newPassword,
      },
    });
    res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

//! Código deprecado
// Endpoint para verificar a validade do token
router.post('/verify/token', async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar se o token é válido
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        // Se o token for inválido, retornar erro
        return res.status(401).json({ message: 'Token inválido' });
      }

      // Se o token for válido, verificar se está presente no banco de dados
      const tokenInfo = await prisma.tokens.findFirst({
        where: { token },
      });

      if (!tokenInfo) {
        // Se o token não estiver presente no banco de dados, retornar erro
        return res.status(401).json({ message: 'Token não encontrado no banco de dados' });
      }

      // Se o token for válido e estiver presente no banco de dados, retornar sucesso
      res.status(200).json({ message: 'Token válido' });
    });
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para verificar as permissões do usuário
router.post('/verify/permission', async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar se o token é válido
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        // Se o token for inválido, retornar erro
        return res.status(401).json({ message: 'Token inválido' });
      }

      // Se o token for válido, buscar o usuário correspondente no banco de dados
      const usuario = await prisma.usuarios.findFirst({
        where: { id: decoded.userId },
      });

      if (!usuario) {
        // Se o usuário não for encontrado, retornar erro
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Se o usuário for encontrado, retornar suas permissões
      res.status(200).json({ permissions: usuario.permission });
    });
  } catch (error) {
    console.error('Erro ao verificar as permissões do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para obter informações do usuário com base no token
router.post('/verify/profile', async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar se o token é válido
    jwt.verify(token, jwtSecretKey, async (err, decoded) => {
      if (err) {
        // Se o token for inválido, retornar erro
        return res.status(401).json({ message: 'Token inválido' });
      }

      // Se o token for válido, buscar o usuário correspondente no banco de dados
      const usuario = await prisma.usuarios.findFirst({
        where: { id: decoded.userId },
      });

      if (!usuario) {
        // Se o usuário não for encontrado, retornar erro
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Se o usuário for encontrado, retornar suas informações, incluindo a senha
      res.status(200).json({
        nome: usuario.nome,
        usuario: usuario.user,
        userId: usuario.id,
        password: usuario.password,
      });
    });
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
