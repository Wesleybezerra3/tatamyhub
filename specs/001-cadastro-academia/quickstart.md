# Quickstart & Guia de Validação: Cadastro e Perfil da Academia

**Feature**: `001-cadastro-academia` | **Data**: 2026-11-16

Este documento orienta como executar a validação funcional de ponta a ponta da feature de Perfil da Academia e Modalidades.

---

## 1. Pré-Requisitos

- Node.js LTS (v20 ou superior)
- MySQL Server ativo (porta padrão 3306)
- Banco de dados `tatamyhub` criado (`CREATE DATABASE tatamyhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)

---

## 2. Configuração e Inicialização

### Passo 1: Executar Migrations do Banco
```bash
cd backend
npm run migrate
```
*Resultado esperado*: Criação das tabelas `academias` e `modalidades` descritas em [data-model.md](data-model.md).

### Passo 2: Iniciar Servidor Backend
```bash
cd backend
npm run dev
```
*Resultado esperado*: Servidor Express ativo em `http://localhost:3001` com rota de status respondendo OK.

### Passo 3: Iniciar Frontend Vite (PWA)
```bash
cd frontend
npm run dev
```
*Resultado esperado*: Aplicação React acessível em `http://localhost:5173`.

---

## 3. Roteiro de Validação Funcional (End-to-End)

### Cenário 1: Cadastro dos Dados da Academia
1. Acesse `http://localhost:5173/configuracoes/academia` (ou tela inicial de onboarding).
2. Deixe o campo **Nome da Academia** em branco e clique em **Salvar**.
   - *Validação*: O formulário deve bloquear a submissão e exibir alerta de validação.
3. Preencha:
   - **Nome**: `Gracie Barra Central`
   - **WhatsApp**: `(11) 99999-8888`
   - **Endereço**: `Rua do Tatame, 123 - Centro, São Paulo - SP, 01001-000`
4. Clique em **Salvar**.
   - *Validação*: Mensagem de sucesso visível na tela e dados persistidos na tabela `academias`.

### Cenário 2: Adição e Gestão de Modalidades
1. Na seção **Modalidades**, digite `Jiu-Jitsu` e clique em **Adicionar**.
   - *Validação*: Modalidade aparece na lista como `Ativa`.
2. Adicione uma segunda modalidade: `Muay Thai`.
3. Tente adicionar novamente `Jiu-Jitsu`.
   - *Validação*: Mensagem de erro informando que a modalidade já existe para a academia.
4. Desative a modalidade `Muay Thai` alternando o seletor de status.
   - *Validação*: Status atualizado para `Inativa`.

### Cenário 3: Upload do Logotipo
1. Selecione um arquivo de imagem válido (`.png` ou `.jpeg`, até 2MB).
2. Envie o arquivo.
   - *Validação*: Imagem de pré-visualização atualizada imediatamente no perfil e salva em `backend/uploads/logos/`.
3. Tente enviar um arquivo com extensão `.txt` ou `.pdf`.
   - *Validação*: Alerta imediato de formato não suportado.

### Cenário 4: Responsividade Mobile e PWA
1. Abra as Ferramentas de Desenvolvedor do navegador (F12) e ative a visualização móvel (largura 375px - iPhone SE / Galaxy).
2. Percorra todas as seções do formulário e certifique-se de que nenhum campo ultrapassa as bordas horizontais da tela.
3. Verifique o registro do Service Worker e o botão de instalação do PWA.
