const API_URL = "http://localhost:3000/clientes";

const form = document.getElementById("form-cliente");

const campos = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  cidade: document.getElementById("cidade"),
};

const erros = {
  nome: document.getElementById("erro-nome"),
  email: document.getElementById("erro-email"),
  telefone: document.getElementById("erro-telefone"),
  cidade: document.getElementById("erro-cidade"),
};

const botaoCadastrar = document.getElementById("btn-cadastrar");
const listaClientes = document.getElementById("lista-clientes");

/* =========================
   Validações
========================= */

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
  return telefone.replace(/\D/g, "");
}

function validarTelefone(telefone) {
  const numero = normalizarTelefone(telefone);

  const regex = /^[1-9]{2}(?:9\d{8}|[2-8]\d{7})$/;

  return regex.test(numero);
}

function validarCidade(cidade) {
  return cidade.trim().length >= 5;
}

/* =========================
   Máscara de telefone
========================= */

function formatarTelefone(valor) {
  let numero = valor.replace(/\D/g, "");

  numero = numero.slice(0, 11);

  if (numero.length <= 2) {
    return numero;
  }

  if (numero.length <= 6) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2)}`;
  }

  /*
   * Celular:
   * (49) 99999-9999
   */
  if (numero.length === 11) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  }

  /*
   * Telefone fixo:
   * (49) 3333-3333
   */
  return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
}

/* =========================
   Mensagens de validação
========================= */

function exibirErro(campo, mensagem) {
  campos[campo].classList.add("invalido");
  erros[campo].textContent = mensagem;
}

function limparErro(campo) {
  campos[campo].classList.remove("invalido");
  erros[campo].textContent = "";
}

function validarCampo(campo) {
  const valor = campos[campo].value;

  switch (campo) {
    case "nome":
      if (!validarNome(valor)) {
        exibirErro("nome", "Informe nome e sobrenome.");
        return false;
      }

      break;

    case "email":
      if (!validarEmail(valor)) {
        exibirErro("email", "Informe um e-mail válido.");
        return false;
      }

      break;

    case "telefone":
      if (!validarTelefone(valor)) {
        exibirErro(
          "telefone",
          "Informe um telefone brasileiro válido com DDD.",
        );

        return false;
      }

      break;

    case "cidade":
      if (!validarCidade(valor)) {
        exibirErro("cidade", "A cidade deve possuir pelo menos 5 caracteres.");

        return false;
      }

      break;
  }

  limparErro(campo);

  return true;
}

/* =========================
   Controle do botão
========================= */

function formularioValido() {
  return (
    validarNome(campos.nome.value) &&
    validarEmail(campos.email.value) &&
    validarTelefone(campos.telefone.value) &&
    validarCidade(campos.cidade.value)
  );
}

function atualizarFluxoFormulario() {
  const nomeValido = validarNome(campos.nome.value);

  campos.email.disabled = !nomeValido;

  const emailValido = nomeValido && validarEmail(campos.email.value);

  campos.telefone.disabled = !emailValido;

  const telefoneValido = emailValido && validarTelefone(campos.telefone.value);

  campos.cidade.disabled = !telefoneValido;

  const cidadeValida = telefoneValido && validarCidade(campos.cidade.value);

  botaoCadastrar.disabled = !cidadeValida;

  limparErrosCamposBloqueados();
}

function limparErrosCamposBloqueados() {
  Object.keys(campos).forEach((campo) => {
    if (campos[campo].disabled) {
      limparErro(campo);
    }
  });
}
/* =========================
   Eventos dos campos
========================= */

Object.keys(campos).forEach((campo) => {
  campos[campo].addEventListener("input", () => {
    if (erros[campo].textContent) {
      validarCampo(campo);
    }

    atualizarFluxoFormulario();
  });

  campos[campo].addEventListener("blur", () => {
    if (!campos[campo].disabled) {
      validarCampo(campo);
    }

    atualizarFluxoFormulario();
  });
});

campos.telefone.addEventListener("input", (event) => {
  event.target.value = formatarTelefone(event.target.value);

  atualizarFluxoFormulario();
});

/* =========================
   Listagem de clientes
========================= */

async function carregarClientes() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar clientes.");
    }

    const clientes = await resposta.json();

    renderizarClientes(clientes);
  } catch (error) {
    console.error(error);

    listaClientes.replaceChildren();

    const linha = document.createElement("tr");
    const coluna = document.createElement("td");

    coluna.colSpan = 4;
    coluna.textContent = "Não foi possível carregar os clientes.";

    linha.appendChild(coluna);
    listaClientes.appendChild(linha);
  }
}

function renderizarClientes(clientes) {
  listaClientes.replaceChildren();

  if (clientes.length === 0) {
    const linha = document.createElement("tr");
    const coluna = document.createElement("td");

    coluna.colSpan = 4;
    coluna.textContent = "Nenhum cliente cadastrado.";

    linha.appendChild(coluna);
    listaClientes.appendChild(linha);

    return;
  }

  clientes.forEach((cliente) => {
    const linha = document.createElement("tr");

    adicionarColuna(linha, cliente.nome);
    adicionarColuna(linha, cliente.email);
    adicionarColuna(linha, formatarTelefone(String(cliente.telefone)));
    adicionarColuna(linha, cliente.cidade);

    listaClientes.appendChild(linha);
  });
}

function adicionarColuna(linha, valor) {
  const coluna = document.createElement("td");

  coluna.textContent = valor ?? "";

  linha.appendChild(coluna);
}

/* =========================
   Cadastro
========================= */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nomeValido = validarCampo("nome");
  const emailValido = validarCampo("email");
  const telefoneValido = validarCampo("telefone");
  const cidadeValida = validarCampo("cidade");

  if (!nomeValido || !emailValido || !telefoneValido || !cidadeValida) {
    atualizarFluxoFormulario();
    return;
  }

  const cliente = {
    nome: campos.nome.value.trim(),
    email: campos.email.value.trim(),
    telefone: campos.telefone.value,
    cidade: campos.cidade.value.trim(),
  };

  try {
    botaoCadastrar.disabled = true;
    botaoCadastrar.textContent = "CADASTRANDO...";

    const resposta = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(cliente),
    });

    const dados = await resposta.json();

    /*
     * Erros de validação retornados
     * pelo backend.
     */
    if (resposta.status === 422) {
      exibirErrosBackend(dados.erros);
      return;
    }

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao cadastrar cliente.");
    }

    limparFormulario();

    await carregarClientes();
  } catch (error) {
    console.error(error);

    alert("Não foi possível cadastrar o cliente. Tente novamente.");
  } finally {
    botaoCadastrar.textContent = "CADASTRAR";
    atualizarFluxoFormulario();
  }
});

function exibirErrosBackend(errosBackend) {
  if (!errosBackend) {
    return;
  }

  Object.entries(errosBackend).forEach(([campo, mensagem]) => {
    if (campos[campo]) {
      exibirErro(campo, mensagem);
    }
  });
}

/* =========================
   Limpeza do formulário
========================= */

function limparFormulario() {
  form.reset();

  Object.keys(campos).forEach((campo) => {
    limparErro(campo);
  });

  campos.nome.disabled = false;
  campos.email.disabled = true;
  campos.telefone.disabled = true;
  campos.cidade.disabled = true;

  botaoCadastrar.disabled = true;

  campos.nome.focus();
}

/* =========================
   Inicialização
========================= */

atualizarFluxoFormulario();
carregarClientes();
