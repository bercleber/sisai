// Controle de navegação do exemplo; não substitui autenticação no backend.
function verificarLogin() {
  let logado = false;
  let nome = "";

  try {
    nome = sessionStorage.getItem("sisai_usuario_nome") || "";
    logado = sessionStorage.getItem("sisai_logado") === "true" && Boolean(nome.trim());
  } catch {
    // Sem acesso ao armazenamento da sessão, volta para a tela de login.
  }

  document.getElementById("nome-usuario").textContent = logado ? nome : "";
  document.body.hidden = !logado;

  if (!logado) {
    window.location.replace("login.html");
  }

  return logado;
}

if (verificarLogin()) {
  document.getElementById("btn-sair").addEventListener("click", () => {
    sessionStorage.removeItem("sisai_logado");
    sessionStorage.removeItem("sisai_usuario_nome");
    document.body.hidden = true;
    window.location.replace("login.html");
  });

  // Carrega o cadastro e consulta os clientes somente após verificar o login.
  const script = document.createElement("script");
  script.src = "app.js";
  document.body.appendChild(script);
}

// Verifica novamente ao retornar à página pelo histórico do navegador.
window.addEventListener("pageshow", verificarLogin);
