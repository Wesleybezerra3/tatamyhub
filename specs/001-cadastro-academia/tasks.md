---
description: "Task list for feature implementation: Cadastro e Perfil da Academia"
---

# Tasks: Cadastro e Perfil da Academia

**Input**: Design documents from `specs/001-cadastro-academia/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/academy-api.yaml](contracts/academy-api.yaml), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Indicates User Story ownership (`[US1]`, `[US2]`, `[US3]`) for feature phases
- Descriptions include exact target file paths and explicit validation constraints

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and runtime dependencies.

- [x] T001 Initialize backend Node.js project with dependencies (`express`, `mysql2`, `dotenv`, `cors`, `multer`) in `backend/package.json`
- [x] T002 [P] Initialize frontend React project with Vite, `react-router-dom`, `vite-plugin-pwa`, and `lucide-react` in `frontend/package.json`
- [x] T003 [P] Configure environment files and templates for database connection and API URLs in `backend/.env.example` and `frontend/.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Setup MySQL connection pool with `mysql2/promise` in `backend/src/config/database.js`
- [x] T005 [P] Implement SQL migrations runner mechanism in `backend/src/database/migrate.js`
- [x] T006 [P] Create initial database schema migration for `academias` and `modalidades` tables with constraints and indexes in `backend/src/database/migrations/001_initial_schema.sql`
- [x] T007 [P] Configure Express server, CORS, JSON body parser, static file serving (`/uploads`), and centralized error handler in `backend/src/server.js` and `backend/src/middlewares/errorHandler.js`
- [x] T008 [P] Setup frontend centralized HTTP client (`api.js`) with base URL and error parsing in `frontend/src/services/api.js`
- [x] T009 [P] Setup frontend global styles, CSS variables, typography, and mobile-first container layout in `frontend/src/assets/styles/global.css` and `frontend/src/components/layout/AppLayout.jsx`
- [x] T010 [P] Configure Vite PWA plugin manifest (theme color, standalone display, application icons) in `frontend/vite.config.js` and `frontend/public/manifest.webmanifest`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Cadastro e Edição dos Dados Institucionais (Priority: P1) 🎯 MVP

**Goal**: Permitir que o professor/administrador configure e edite as informações institucionais essenciais da academia (Nome da academia, CNPJ/CPF opcional, endereço completo, telefone, WhatsApp de contato e e-mail).

**Independent Test**: Acessar a tela de perfil da academia, preencher dados válidos (nome obrigatório min 2 max 150 chars, pelo menos um telefone/WhatsApp de contato, endereço completo), salvar e verificar persistência no banco e atualização imediata na interface.

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement Academia repository for SQL queries (`getProfile`, `upsertProfile`) using parameterized queries in `backend/src/modules/academia/academia.repository.js`
- [x] T012 [US1] Implement Academia service with input validation (require `nome` min 2 max 150 chars, at least `telefone` or `whatsapp`, sanitize fields) in `backend/src/modules/academia/academia.service.js`
- [x] T013 [US1] Implement Academia controller for `GET /api/academia` and `PUT /api/academia` in `backend/src/modules/academia/academia.controller.js`
- [x] T014 [US1] Register Academia routes in `backend/src/modules/academia/academia.routes.js` and mount on `backend/src/routes.js`
- [x] T015 [P] [US1] Implement frontend API client service for academia profile (`getProfile`, `updateProfile`) in `frontend/src/services/academyService.js`
- [x] T016 [P] [US1] Implement custom React hook `useAcademy` managing state, loading, and error notifications in `frontend/src/hooks/useAcademy.js`
- [x] T017 [US1] Implement mobile-first Academy Profile Form page and styles in `frontend/src/pages/AcademyProfile/AcademyProfilePage.jsx` and `frontend/src/pages/AcademyProfile/AcademyProfilePage.module.css`
- [x] T018 [US1] Wire Academy Profile page into application router in `frontend/src/App.jsx`

**Checkpoint**: At this point, User Story 1 is fully functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - Gestão das Modalidades Oferecidas (Priority: P2)

**Goal**: Permitir cadastrar, listar, renomear e alternar o status operacional (ativa/inativa) das modalidades esportivas da academia (ex.: Jiu-Jitsu, Muay Thai) com validação de unicidade por academia.

**Independent Test**: Cadastrar uma nova modalidade ("Jiu-Jitsu"), editar seu nome para "Jiu-Jitsu Adulto", desativar a modalidade e verificar a integridade da listagem e rejeição em caso de tentativa de duplicidade.

### Implementation for User Story 2

- [x] T019 [P] [US2] Implement Modalidade repository for SQL queries (`listByAcademiaId`, `findById`, `create`, `update`, `checkDuplicateName`) in `backend/src/modules/modalidades/modalidades.repository.js`
- [x] T020 [US2] Implement Modalidade service with business rules (enforce `nome` min 2 max 100 chars, status enum 'ativa'|'inativa', uniqueness check `(academia_id, nome)`) in `backend/src/modules/modalidades/modalidades.service.js`
- [x] T021 [US2] Implement Modalidade controller for `GET /api/modalidades`, `POST /api/modalidades`, and `PUT /api/modalidades/:id` in `backend/src/modules/modalidades/modalidades.controller.js`
- [x] T022 [US2] Register Modalidade routes in `backend/src/modules/modalidades/modalidades.routes.js` and mount on `backend/src/routes.js`
- [x] T023 [P] [US2] Implement frontend API client service for modalities (`listModalities`, `createModality`, `updateModality`) in `frontend/src/services/modalityService.js`
- [x] T024 [US2] Implement Modalities management view (list, quick-add form, status toggle switch) in `frontend/src/pages/Modalities/ModalitiesPage.jsx` and `frontend/src/pages/Modalities/ModalitiesPage.module.css`
- [x] T025 [US2] Wire Modalities page into application router and navigation menu in `frontend/src/App.jsx` and `frontend/src/components/layout/AppLayout.jsx`

**Checkpoint**: User Stories 1 and 2 both operate independently and integrated.

---

## Phase 5: User Story 3 - Upload e Visualização do Logotipo (Priority: P3)

**Goal**: Permitir o envio, substituição e remoção de arquivo de logotipo da academia com validação de tipo de arquivo (PNG, JPEG, WebP) e tamanho máximo de 2MB, exibindo o resultado imediatamente no perfil e layout.

**Independent Test**: Fazer upload de uma imagem válida (PNG de 500KB) e verificar sua renderização imediata; testar rejeição de arquivos inválidos (ex.: `.pdf` ou arquivos acima de 2MB) e testar a remoção do logotipo retornando ao avatar padrão.

### Implementation for User Story 3

- [x] T026 [P] [US3] Implement Multer file upload middleware with disk storage (`backend/uploads/logos`), MIME type filter (`image/png`, `image/jpeg`, `image/webp`), and 2MB file size limit in `backend/src/middlewares/upload.js`
- [x] T027 [US3] Implement logo upload handler and deletion logic in `backend/src/modules/academia/academia.service.js` and controller methods in `backend/src/modules/academia/academia.controller.js`
- [x] T028 [US3] Register logo endpoints (`POST /api/academia/logo`, `DELETE /api/academia/logo`) in `backend/src/modules/academia/academia.routes.js`
- [x] T029 [P] [US3] Add `uploadLogo` and `deleteLogo` functions to `frontend/src/services/academyService.js`
- [x] T030 [US3] Implement Logo Uploader UI component with preview, upload button, deletion action, and fallback initials avatar in `frontend/src/components/common/LogoUploader/LogoUploader.jsx` and `frontend/src/components/common/LogoUploader/LogoUploader.module.css`
- [x] T031 [US3] Integrate Logo Uploader into Academy Profile page and header avatar in `frontend/src/pages/AcademyProfile/AcademyProfilePage.jsx` and `frontend/src/components/layout/AppLayout.jsx`

**Checkpoint**: All three user stories are functional and deliver the complete feature.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, database seeding, and end-to-end verification.

- [x] T032 [P] Create database seeding script providing default initial modality ("Jiu-Jitsu") in `backend/src/database/seed.js`
- [x] T033 [P] Implement responsive mobile feedback alerts (toast notification component) for success/error events in `frontend/src/components/common/Alert/Alert.jsx` and `frontend/src/components/common/Alert/Alert.module.css`
- [x] T034 Execute end-to-end verification following all 4 scenarios in `specs/001-cadastro-academia/quickstart.md` on mobile (375px) and desktop viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately without dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. **BLOCKS all user stories**.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - Can proceed sequentially (`US1` → `US2` → `US3`) or in parallel by separate developers.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Independent of US2 and US3. Can be tested and deployed as standalone MVP.
- **User Story 2 (P2)**: Uses the `academia_id` from US1, but handles its own domain independently.
- **User Story 3 (P3)**: Enhances the academia entity created in US1 with image asset management.

---

## Parallel Opportunities

- **Setup**: `T002` (Frontend init) and `T003` (Env templates) can run in parallel with `T001`.
- **Foundational**: `T005` (Migrations runner), `T006` (SQL schema), `T007` (Server & ErrorHandler), `T008` (API client), `T009` (Layout & CSS), and `T010` (Vite PWA) can all be authored in parallel once packages are installed.
- **User Story 1**: `T011` (Repository), `T015` (Frontend service), and `T016` (Hook) can run in parallel.
- **User Story 2**: `T019` (Repository) and `T023` (Frontend service) can run in parallel.
- **User Story 3**: `T026` (Multer middleware) and `T029` (Frontend logo service) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1: Setup** (`T001` - `T003`).
2. Complete **Phase 2: Foundational** (`T004` - `T010`).
3. Complete **Phase 3: User Story 1** (`T011` - `T018`).
4. **STOP and VALIDATE**: Verify that the academy can be registered and updated in the browser.
5. You now have a working, viable increment ready to demonstrate!

### Incremental Delivery

1. Foundation ready (Phases 1 & 2).
2. Deliver US1 (Dados da Academia) → MVP!
3. Deliver US2 (Modalidades) → Permite estruturar turmas e planos futuros.
4. Deliver US3 (Logotipo) → Personalização e identidade visual da academia.
5. Deliver Polish (Seeding, Toasts, Quickstart validation).
