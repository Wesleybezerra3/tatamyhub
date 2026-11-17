# Implementation Plan: Autenticação, Landing Inicial e Onboarding

**Branch**: `002-auth-onboarding` | **Date**: 2026-11-16 | **Spec**: [specs/002-auth-onboarding/spec.md](spec.md)

**Input**: Feature specification from `specs/002-auth-onboarding/spec.md`

## Summary

Implementação da camada pública de acesso e controle de autenticação do **TatamyHub**, incluindo a **Landing Page institucional** para apresentação do objetivo do SaaS, o fluxo de **Onboarding e Cadastro** (criação atômica de usuário gestor, academia e modalidade inicial com senha criptografada via bcrypt), a tela de **Login** com autenticação JWT e o **Route Guard** de proteção para a área administrativa.

## Technical Context

**Language/Version**: JavaScript (Node.js LTS v20+ / Browser ES2022)

**Primary Dependencies**:
- **Backend**: `express`, `mysql2/promise`, `bcryptjs` (hashing criptográfico de senhas), `jsonwebtoken` (geração e verificação de JWT), `dotenv`, `cors`
- **Frontend**: `react` 18/19, `react-router-dom`, `lucide-react`, CSS Modules

**Storage**: MySQL com migration `002_create_usuarios.sql` criando a tabela `usuarios` com chave estrangeira `academia_id` e índice único em `email`.

**Testing**: Validação end-to-end de onboarding, hash de senha e proteção de rota autenticada descrita no [quickstart.md](quickstart.md).

**Target Platform**: Navegadores Mobile e Desktop com PWA.

**Project Type**: Full-stack Web Application (Frontend SPA/PWA + Backend REST API).

**Performance Goals**:
- Login e emissão de JWT em menos de 300ms.
- Cadastro com transação em menos de 500ms.
- Renderização inicial da landing page em menos de 1 segundo.

**Constraints**:
- Proibição absoluta de senhas em texto puro no banco de dados.
- Senha obrigatória com no mínimo 6 caracteres.
- Chave estrangeira `academia_id` em todos os usuários para garantir isolamento por tenant.
- Rotas da API e frontend protegidas por autenticação.

## Constitution Check

| Princípio da Constituição | Status | Avaliação Técnica |
|---------------------------|:------:|-------------------|
| **I. Simplicidade acima da Complexidade** | **PASS** | Onboarding direto em formulário limpo e intuitivo; autenticação JWT sem intermediários pesados. |
| **II. Código Organizado e Sustentável** | **PASS** | Módulo `auth` isolado no backend (`routes`, `controller`, `service`, `repository`) e contexto `AuthContext` com hook `useAuth` no frontend. |
| **III. Segurança e Integridade dos Dados** | **PASS** | Senhas com hash `bcryptjs` (salt 10); rotas da API protegidas por middleware `authenticateJWT`; sanitização rigorosa de e-mails. |
| **IV. Preparação para Escalabilidade** | **PASS** | Usuários criados com `academia_id` obrigatório, viabilizando multi-tenancy nativo. |
| **V. Integridade Financeira e Preservação** | **PASS** | Criação inicial em transação atômica evita registros corrompidos ou sem vínculo. |
| **Restrições do MVP** | **PASS** | Apenas autenticação por e-mail e senha, sem dependência de serviços externos complexos (OAuth/Google/Apple) no 1º ciclo. |

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-onboarding/
├── spec.md              # Especificação de requisitos e cenários
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de bcryptjs, JWT e transação de onboarding
├── data-model.md        # Tabela usuarios e ERD relacional
├── quickstart.md        # Guia de validação funcional ponta a ponta
├── contracts/
│   └── auth-api.yaml    # Contrato OpenAPI dos endpoints /api/auth/*
└── checklists/
    └── requirements.md  # Checklist de qualidade
```

### Source Code

```text
backend/
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 002_create_usuarios.sql
│   ├── middlewares/
│   │   └── auth.js                    # Middleware de verificação de token JWT
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.js     # Endpoints de register, login, me
│   │       ├── auth.service.js        # Lógica de bcrypt, validação, criação transacional
│   │       ├── auth.repository.js     # Queries SQL de usuários e transação de onboarding
│   │       └── auth.routes.js         # Rotas /api/auth
│   └── routes.js                      # Agregação com proteção nas rotas de academia

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx            # Provedor global de autenticação (token, user, logout)
│   ├── hooks/
│   │   └── useAuth.js                 # Hook para consumo do AuthContext
│   ├── components/
│   │   └── auth/
│   │       └── ProtectedRoute.jsx     # Guard de rotas privadas (redireciona para /login)
│   ├── pages/
│   │   ├── Landing/                   # Landing page institucional com apresentação do SaaS
│   │   ├── Login/                     # Tela de autenticação por e-mail e senha
│   │   └── Register/                  # Tela de cadastro/onboarding com academia e modalidade
│   └── App.jsx                        # Rotas públicas e rotas protegidas
```

**Structure Decision**: Adoção de um módulo dedicado `auth` no backend e camada de contexto de sessão `AuthContext` no frontend, integrando perfeitamente à base já existente sem quebrar os endpoints anteriores.

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição.*
