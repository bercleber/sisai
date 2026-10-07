const AUTH_API_URL = "http://localhost:3000";
let cadastroCarregado = false;

function encerrarSessaoLocal() {
  document.body.hidden = true;

  try {
    sessionStorage.removeItem("sisai_token");
    sessionStorage.removeItem("sisai_usuario_nome");
    sessionStorage.removeItem("sisai_logado");
  } catch {
    // Mesmo sem acesso ao armazenamento, o conteúdo continua oculto.
  }

  window.location.replace("login.html");
}

// Todas as requisições protegidas usam o token e tratam a sessão inválida.
async function fetchAutenticado(url, opcoes = {}) {
  let token;

  try {
    token = sessionStorage.getItem("sisai_token");
  } catch {
    encerrarSessaoLocal();
    return null;
  }

  if (!token) {
    encerrarSessaoLocal();
    return null;
  }

  const headers = new Headers(opcoes.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(url, { ...opcoes, headers });

  if (resposta.status === 401) {
    encerrarSessaoLocal();
    return null;
  }

  return resposta;
}

async function verificarLogin() {
  document.body.hidden = true;

  try {
    const resposta = await fetchAutenticado(`${AUTH_API_URL}/validar-token`, {
      cache: "no-store",
    });
    if (!resposta) return;
    if (!resposta.ok) throw new Error("Erro ao verificar autenticação.");

    const dados = await resposta.json();
    document.getElementById("nome-usuario").textContent = dados.usuario.nome;
    document.body.hidden = false;

    if (!cadastroCarregado) {
      cadastroCarregado = true;
      const script = document.createElement("script");
      script.src = "app.js";
      document.body.appendChild(script);
    }
  } catch {
    alert("Não foi possível verificar sua sessão. Tente entrar novamente.");
    window.location.replace("login.html");
  }
}

document.getElementById("btn-sair").addEventListener("click", async (event) => {
  const botao = event.currentTarget;
  botao.disabled = true;

  try {
    const resposta = await fetchAutenticado(`${AUTH_API_URL}/logout`, {
      method: "POST",
    });
    if (!resposta) return;
    if (!resposta.ok) throw new Error("Erro ao encerrar sessão.");
    encerrarSessaoLocal();
  } catch {
    alert("Não foi possível sair. Tente novamente.");
  } finally {
    botao.disabled = false;
  }
});

// Oculta a página no histórico e revalida o token quando ela for restaurada.
window.addEventListener("pagehide", () => {
  document.body.hidden = true;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) verificarLogin();
});

verificarLogin();
