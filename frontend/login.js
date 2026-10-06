// Rota POST /login implementada em backend/src/server.js.
const LOGIN_API_URL = "http://localhost:3000/login";

const form = document.getElementById("form-login");
const usuario = document.getElementById("usuario");
const senha = document.getElementById("senha");
const erroUsuario = document.getElementById("erro-usuario");
const erroSenha = document.getElementById("erro-senha");
const erroLogin = document.getElementById("erro-login");
const botaoLogin = document.getElementById("btn-login");
const toggleSenha = document.getElementById("toggle-senha");

let enviando = false;

function validarUsuario(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

function validarSenha(valor) {
  return (
    valor.length >= 6 &&
    /\p{Lu}/u.test(valor) &&
    /\p{Ll}/u.test(valor) &&
    /[0-9]/.test(valor) &&
    /[\p{P}\p{S}]/u.test(valor)
  );
}

function atualizarErro(campo, elementoErro, mensagem) {
  campo.classList.toggle("invalido", Boolean(mensagem));
  campo.setAttribute("aria-invalid", String(Boolean(mensagem)));
  elementoErro.textContent = mensagem;
}

function validarCampoUsuario() {
  const valido = validarUsuario(usuario.value);
  atualizarErro(usuario, erroUsuario, valido ? "" : "Informe um e-mail válido.");
  return valido;
}

function validarCampoSenha() {
  const valida = validarSenha(senha.value);
  atualizarErro(
    senha,
    erroSenha,
    valida
      ? ""
      : "A senha deve ter no mínimo 6 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.",
  );
  return valida;
}

function atualizarVisibilidadeSenha(visivel) {
  senha.type = visivel ? "text" : "password";
  toggleSenha.textContent = visivel ? "Ocultar" : "Mostrar";
  toggleSenha.setAttribute("aria-label", visivel ? "Ocultar senha" : "Mostrar senha");
  toggleSenha.setAttribute("aria-pressed", String(visivel));
}

function atualizarFormulario() {
  const usuarioValido = validarUsuario(usuario.value);

  usuario.readOnly = enviando;
  senha.readOnly = enviando;
  senha.disabled = !usuarioValido;
  toggleSenha.disabled = !usuarioValido || enviando;
  botaoLogin.disabled = enviando || !usuarioValido || !validarSenha(senha.value);
  botaoLogin.textContent = enviando ? "ENTRANDO..." : "LOGIN";
  form.setAttribute("aria-busy", String(enviando));

  if (!usuarioValido) {
    atualizarErro(senha, erroSenha, "");
    atualizarVisibilidadeSenha(false);
  }
}

function aoEditarUsuario() {
  erroLogin.textContent = "";
  if (erroUsuario.textContent) validarCampoUsuario();
  atualizarFormulario();
}

function aoEditarSenha() {
  erroLogin.textContent = "";
  if (erroSenha.textContent) validarCampoSenha();
  atualizarFormulario();
}

usuario.addEventListener("input", aoEditarUsuario);
usuario.addEventListener("change", aoEditarUsuario);
senha.addEventListener("input", aoEditarSenha);
senha.addEventListener("change", aoEditarSenha);

usuario.addEventListener("blur", () => {
  validarCampoUsuario();
  atualizarFormulario();
});

senha.addEventListener("blur", () => {
  if (!senha.disabled) validarCampoSenha();
  atualizarFormulario();
});

toggleSenha.addEventListener("click", () => {
  atualizarVisibilidadeSenha(senha.type === "password");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (enviando) return;

  erroLogin.textContent = "";
  const usuarioValido = validarCampoUsuario();
  const senhaValida = usuarioValido && validarCampoSenha();
  atualizarFormulario();

  if (!usuarioValido || !senhaValida) {
    (usuarioValido ? senha : usuario).focus();
    return;
  }

  enviando = true;
  atualizarVisibilidadeSenha(false);
  atualizarFormulario();

  try {
    sessionStorage.removeItem("sisai_logado");
    sessionStorage.removeItem("sisai_usuario_nome");

    const resposta = await fetch(LOGIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: usuario.value.trim(), senha: senha.value }),
    });

    if (!resposta.ok) {
      erroLogin.textContent = "Credenciais inválidas";
      return;
    }

    const dados = await resposta.json();
    const nome = dados.usuario?.nome;

    if (typeof nome !== "string" || !nome.trim()) {
      erroLogin.textContent = "Credenciais inválidas";
      return;
    }

    sessionStorage.setItem("sisai_usuario_nome", nome.trim());
    sessionStorage.setItem("sisai_logado", "true");
    window.location.replace("index.html");
  } catch {
    erroLogin.textContent = "Credenciais inválidas";
  } finally {
    enviando = false;
    atualizarFormulario();
  }
});

window.addEventListener("pageshow", atualizarFormulario);
atualizarFormulario();
