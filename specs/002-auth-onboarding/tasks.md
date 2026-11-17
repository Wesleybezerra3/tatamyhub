---
description: "Task list for feature implementation: Autenticação, Landing Inicial e Onboarding"
---

# Tasks: Autenticação, Landing Inicial e Onboarding

**Input**: Design documents from `specs/002-auth-onboarding/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/auth-api.yaml](contracts/auth-api.yaml), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Indicates User Story ownership (`[US1]`, `[US2]`, `[US3]`) for feature phases
- Descriptions include exact target file paths and explicit validation constraints

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project dependencies and authentication secret configuration.

- [x] T001 Install `bcryptjs` and `jsonwebtoken` dependencies in `backend/package.json`
- [x] T002 [P] Configure `JWT_SECRET` key in `backend/.env.example` and `backend/.env`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create database schema migration for `usuarios` table with foreign key `academia_id` and unique `email` in `backend/src/database/migrations/002_create_usuarios.sql`
- [x] T004 Execute database migration via runner in `backend/src/database/migrate.js`
- [x] T005 [P] Implement JWT verification middleware (`authenticateJWT`) in `backend/src/middlewares/auth.js`
- [x] T006 [P] Implement frontend `AuthContext` provider managing token, authenticated user and logout in `frontend/src/context/AuthContext.jsx`
- [x] T007 [P] Implement `useAuth` hook and `ProtectedRoute` navigation guard in `frontend/src/hooks/useAuth.js` and `frontend/src/components/auth/ProtectedRoute.jsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Landing Page Institucional do SaaS (Priority: P1) 🎯 MVP

**Goal**: Apresentar a proposta de valor do TatamyHub (SaaS para academias de Jiu-Jitsu) com botões para "Entrar" e "Criar Conta".

**Independent Test**: Acessar a rota raiz `/` em modo anônimo, verificar a apresentação dos benefícios do SaaS e os redirecionamentos para `/login` e `/cadastro`.

### Implementation for User Story 1

- [x] T008 [P] [US1] Create Landing Page view and responsive styling in `frontend/src/pages/Landing/LandingPage.jsx` and `frontend/src/pages/Landing/LandingPage.module.css`
- [x] T009 [US1] Configure public routing for Landing Page at `/` in `frontend/src/App.jsx`

**Checkpoint**: User Story 1 is independently functional and provides a public entry point.

---

## Phase 4: User Story 2 - Cadastro de Conta e Onboarding da Academia (Priority: P1)

**Goal**: Cadastrar gestor, academia e modalidade esportiva inicial em uma única transação SQL atômica com senha protegida por bcryptjs e redirecionamento para o login.

**Independent Test**: Submeter `/cadastro` com dados válidos, verificar criação do usuário com hash bcrypt e academia no MySQL e confirmar o redirecionamento para `/login` com notificação de sucesso e e-mail pré-preenchido.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement Auth repository with transactional onboarding (`registerOnboarding`, `findByEmail`) in `backend/src/modules/auth/auth.repository.js`
- [x] T011 [US2] Implement Auth service register method with bcryptjs hashing and validation (unique email, min 6 char password) in `backend/src/modules/auth/auth.service.js`
- [x] T012 [US2] Implement Auth controller register endpoint in `backend/src/modules/auth/auth.controller.js`
- [x] T013 [US2] Register `/register` route in `backend/src/modules/auth/auth.routes.js` and mount `/api/auth` on `backend/src/routes.js`
- [x] T014 [P] [US2] Implement frontend auth API client service (`register`) in `frontend/src/services/authService.js`
- [x] T015 [US2] Implement Onboarding & Register Page view and styling in `frontend/src/pages/Register/RegisterPage.jsx` and `frontend/src/pages/Register/RegisterPage.module.css`
- [x] T016 [US2] Wire Register Page route at `/cadastro` in `frontend/src/App.jsx`

**Checkpoint**: User Stories 1 and 2 operate seamlessly together.

---

## Phase 5: User Story 3 - Autenticação, Login e Logout (Priority: P1)

**Goal**: Autenticar gestores cadastrados via e-mail e senha, gerar token JWT, armazenar sessão no cliente, proteger rotas privadas e permitir logout voluntário.

**Independent Test**: Informar credenciais válidas na tela de login, confirmar recebimento do JWT e redirecionamento para o painel; testar o encerramento de sessão via botão "Sair" e bloqueio de rotas sem token.

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement login authentication method (compare bcrypt hash, sign JWT with 7d expiration) and `getMe` in `backend/src/modules/auth/auth.service.js`
- [x] T018 [US3] Implement login and me endpoints in `backend/src/modules/auth/auth.controller.js` and register routes in `backend/src/modules/auth/auth.routes.js`
- [x] T019 [P] [US3] Add `login` and `getMe` methods to `frontend/src/services/authService.js`
- [x] T020 [US3] Update frontend `api.js` client to include `Authorization: Bearer <token>` in requests in `frontend/src/services/api.js`
- [x] T021 [US3] Implement Login Page view and styling in `frontend/src/pages/Login/LoginPage.jsx` and `frontend/src/pages/Login/LoginPage.module.css`
- [x] T022 [US3] Integrate Logout button into header navigation in `frontend/src/components/layout/AppLayout.jsx`
- [x] T023 [US3] Wrap private routes with `ProtectedRoute` in `frontend/src/App.jsx`

**Checkpoint**: All user stories functional, secure authentication lifecycle complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Seed user creation and end-to-end flow validation.

- [x] T024 [P] Create default seed admin user (`admin@tatamyhub.com` / `admin123`) in `backend/src/database/seed.js`
- [x] T025 Execute end-to-end verification following all 4 scenarios in `specs/002-auth-onboarding/quickstart.md` on mobile and desktop viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. **BLOCKS all user stories**.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - Can proceed sequentially (`US1` → `US2` → `US3`).
- **Polish (Phase 6)**: Depends on completion of all stories.

---

## Parallel Opportunities

- `T002` (Env config) in parallel with `T001`.
- `T005` (Auth middleware), `T006` (AuthContext), and `T007` (ProtectedRoute) in parallel.
- `T008` (Landing Page) in parallel with backend tasks.
- `T010` (Auth repository) and `T014` (Auth frontend service) in parallel.
- `T017` (Login service) and `T019` (Frontend login service) in parallel.
