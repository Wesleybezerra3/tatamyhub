# Quickstart & Guia de Validação: Autenticação, Landing e Onboarding

**Feature**: `002-auth-onboarding` | **Data**: 2026-11-16

Guia de teste e homologação do fluxo público e de autenticação do TatamyHub.

---

## 1. Pré-Requisitos

- Servidor backend rodando em `http://localhost:3001`
- Frontend React/Vite rodando em `http://localhost:5173`
- Migrations executadas (`002_create_usuarios.sql`)

---

## 2. Cenários de Teste Ponta a Ponta

### Cenário 1: Landing Page do SaaS
1. Abra uma aba anônima do navegador e acesse `http://localhost:5173/`.
   - *Validação*: A landing page é apresentada com o visual escuro de artes marciais, slogan explicativo do SaaS e botões destacados **"Entrar"** e **"Criar Conta"**.
2. Clique em **"Entrar"**.
   - *Validação*: A rota muda para `http://localhost:5173/login`.
3. Volte e clique em **"Criar Conta"**.
   - *Validação*: A rota muda para `http://localhost:5173/cadastro`.

### Cenário 2: Onboarding e Criação de Conta
1. Na tela de cadastro (`/cadastro`), preencha:
   - **Nome do Gestor**: `Mestre Hélio`
   - **E-mail**: `helio@tatamebjj.com`
   - **Senha**: `tatame123`
   - **Nome da Academia**: `Gracie Humaitá Central`
   - **WhatsApp**: `(11) 98765-4321`
   - **Modalidade**: `Jiu-Jitsu`
2. Clique em **"Criar Minha Conta"**.
   - *Validação*: 
     - Usuário e academia criados com sucesso no MySQL.
     - Redirecionamento automático para `/login`.
     - Exibição de mensagem verde: *"Conta criada com sucesso! Faça login para acessar o painel."*
     - Campo de e-mail preenchido automaticamente com `helio@tatamebjj.com`.

### Cenário 3: Login e Acesso ao Painel
1. Na tela de `/login`, informe a senha `tatame123` e clique em **"Entrar"**.
   - *Validação*: 
     - Autenticação com sucesso (token JWT salvo).
     - Redirecionamento para `/configuracoes/academia`.
     - O cabeçalho exibe o nome `Gracie Humaitá Central`.
     - Um botão de **"Sair"** (Logout) está visível na barra superior.

### Cenário 4: Logout e Proteção de Rotas
1. Clique no botão **"Sair"** no cabeçalho.
   - *Validação*: A sessão é encerrada e a tela redireciona para `/login`.
2. Tente digitar diretamente no navegador a URL `http://localhost:5173/configuracoes/academia`.
   - *Validação*: A rota é interceptada pelo guard de autenticação e redireciona de volta para `/login`.
