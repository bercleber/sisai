Tela do sistema.

- use a imagem exemplo.png como guia.

Campos: todos os campos devem ser validados e exibir uma mensagem de validação, tanto do front quanto validações do backend.

- Nome (string, validação para negar strings que não sejam do formato "nome sobrenome")
- Email (email, validação para email)
- Telefone (string padrão de telefone brasileiro com DDD e sem o código do pais)
- Cidade (string, validação para negar strings com menos de 5 caracteres)

Lista de usuarios:

- abaixo do botão cadastrar deve existir uma tabela para exibir os usuarios cadastrados (chamada rest para o backend)

O botão CADASTRAR deve salvar o input do formulario no banco, limpar o formulário e atualizar a lista de usuarios.
O botão deve estar habilitate apenas se todos os campos forem validos.
