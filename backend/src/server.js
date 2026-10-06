import express from "express";
import cors from "cors";
import "dotenv/config";

import pool from "./database.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function validarNome(nome) {
  if (typeof nome !== "string") {
    return false;
  }

  const palavra = "\\p{L}+(?:[-'’]\\p{L}+)*";
  const regex = new RegExp(`^${palavra}(?:\\s+${palavra})+$`, "u");

  return regex.test(nome.trim());
}

function validarEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return regex.test(email.trim());
}

function normalizarTelefone(telefone) {
  if (typeof telefone !== "string") {
    return "";
  }

  return telefone.replace(/\D/g, "");
}

function validarTelefone(telefone) {
  const numero = normalizarTelefone(telefone);

  // Telefone fixo:
  // DDD + 8 dígitos
  //
  // Celular:
  // DDD + 9 dígitos, iniciando com 9
  const regex = /^[1-9]{2}(?:9\d{8}|[2-8]\d{7})$/;

  return regex.test(numero);
}

function validarCidade(cidade) {
  return typeof cidade === "string" && cidade.trim().length >= 5;
}

/*
 * POST /login
 * Confere o e-mail e compara a senha diretamente para este exemplo didático.
 */
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body ?? {};

  if (
    !validarEmail(usuario) ||
    typeof senha !== "string" ||
    senha.length === 0
  ) {
    return res.status(401).json({ mensagem: "Credenciais inválidas" });
  }

  try {
    const usuarios = await pool.query(
      "SELECT nome, senha FROM usuarios WHERE email = ? LIMIT 1",
      [usuario.trim().toLowerCase()],
    );

    const usuarioEncontrado = usuarios[0];

    if (!usuarioEncontrado || senha !== usuarioEncontrado.senha) {
      return res.status(401).json({ mensagem: "Credenciais inválidas" });
    }

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      usuario: { nome: usuarioEncontrado.nome },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({ mensagem: "Credenciais inválidas" });
  }
});

/*
 * GET /clientes
 * Retorna todos os clientes cadastrados.
 */
app.get("/clientes", async (req, res) => {
  try {
    const clientes = await pool.query(`
      SELECT
        id,
        nome,
        email,
        telefone,
        cidade,
        criado_em
      FROM clientes
      ORDER BY id DESC
    `);

    const clientesFormatados = clientes.map((cliente) => ({
      ...cliente,
      id: Number(cliente.id),
    }));

    return res.status(200).json(clientesFormatados);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao buscar clientes.",
    });
  }
});

/*
 * POST /clientes
 * Valida os dados e cadastra um novo cliente.
 */
app.post("/clientes", async (req, res) => {
  const { nome, email, telefone, cidade } = req.body;

  const erros = {};

  if (!validarNome(nome)) {
    erros.nome = "Informe nome e sobrenome.";
  }

  if (!validarEmail(email)) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!validarTelefone(telefone)) {
    erros.telefone = "Informe um telefone brasileiro válido com DDD.";
  }

  if (!validarCidade(cidade)) {
    erros.cidade = "A cidade deve possuir pelo menos 5 caracteres.";
  }

  if (Object.keys(erros).length > 0) {
    return res.status(422).json({
      mensagem: "Dados inválidos.",
      erros,
    });
  }

  const cliente = {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: normalizarTelefone(telefone),
    cidade: cidade.trim(),
  };

  try {
    const resultado = await pool.query(
      `
        INSERT INTO clientes (
          nome,
          email,
          telefone,
          cidade
        )
        VALUES (?, ?, ?, ?)
      `,
      [cliente.nome, cliente.email, cliente.telefone, cliente.cidade],
    );

    return res.status(201).json({
      mensagem: "Cliente cadastrado com sucesso.",
      cliente: {
        id: Number(resultado.insertId),
        ...cliente,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar cliente.",
    });
  }
});

async function iniciarServidor() {
  try {
    const connection = await pool.getConnection();

    console.log("Conexão com o MariaDB estabelecida.");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Servidor executando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível conectar ao MariaDB:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
