---
description: "Task list for feature implementation: Gestão de Alunos e Graduações"
---

# Tasks: Gestão de Alunos e Graduações

**Input**: Design documents from `specs/004-gestao-alunos-graduacoes/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/students-api.yaml](contracts/students-api.yaml), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Indicates User Story ownership (`[US1]`, `[US2]`, `[US3]`) for feature phases
- Descriptions include exact target file paths and explicit validation constraints

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema creation and migration execution.

- [x] T001 Create database migration for students, modalities association and graduation history in `backend/src/database/migrations/003_create_alunos_e_graduacoes.sql`
- [x] T002 Execute database migration via `backend/src/database/migrate.js` to create tables `alunos`, `aluno_modalidades`, and `graduacoes_historico`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend module and frontend API client.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Implement student repository with atomic transactions and tenant filtering in `backend/src/modules/students/students.repository.js`
- [x] T004 [P] Implement student service with input validation, phone sanitization and graduation logic in `backend/src/modules/students/students.service.js`
- [x] T005 Implement student HTTP controller handlers in `backend/src/modules/students/students.controller.js`
- [x] T006 Register student routes with `authenticateJWT` in `backend/src/modules/students/students.routes.js` and mount `/api/alunos` in `backend/src/routes.js`
- [x] T007 [P] Implement frontend student API service in `frontend/src/services/studentService.js`

**Checkpoint**: Foundation ready - Students & Graduations API operational.

---

## Phase 3: User Story 1 - Cadastro Rápido e Listagem de Alunos (Priority: P1) 🎯 MVP

**Goal**: Cadastrar rapidamente novos alunos associados à academia e exibi-los em listagem responsiva com busca instantânea, filtros e atalho tátil de 1 toque para WhatsApp.

**Independent Test**: Cadastrar um novo aluno com nome, WhatsApp e modalidade inicial, visualizando-o na listagem com status "Ativo", badge da faixa e botão de WhatsApp que abre `wa.me/55...`.

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement BeltBadge component displaying belt colors and degrees in `frontend/src/components/students/BeltBadge/BeltBadge.jsx` and `frontend/src/components/students/BeltBadge/BeltBadge.module.css`
- [x] T009 [P] [US1] Implement StudentCard component with avatar initials, belt badge and direct WhatsApp button in `frontend/src/components/students/StudentCard/StudentCard.jsx` and `frontend/src/components/students/StudentCard/StudentCard.module.css`
- [x] T010 [P] [US1] Implement StudentModal for creating/editing students in `frontend/src/components/students/StudentModal/StudentModal.jsx` and `frontend/src/components/students/StudentModal/StudentModal.module.css`
- [x] T011 [US1] Implement main StudentsPage with real-time search, modality pills and floating action button in `frontend/src/pages/Students/StudentsPage.jsx` and `frontend/src/pages/Students/StudentsPage.module.css`
- [x] T012 [US1] Update route `/alunos` in `frontend/src/App.jsx` to render `StudentsPage` instead of the placeholder

**Checkpoint**: User Story 1 operational - professor can enroll and list students with WhatsApp links.

---

## Phase 4: User Story 2 - Registro e Evolução de Graduações e Faixas (Priority: P1)

**Goal**: Permitir registrar e promover graduações de alunos, mantendo linha do tempo cronológica imutável das faixas e graus conquistados.

**Independent Test**: Acessar o perfil de um aluno, acionar a promoção de faixa/graus (ex: Branca para Azul com data e observação) e conferir a atualização no card e na linha do tempo.

### Implementation for User Story 2

- [x] T013 [P] [US2] Implement GraduationModal component for belt/degrees promotion in `frontend/src/components/students/GraduationModal/GraduationModal.jsx` and `frontend/src/components/students/GraduationModal/GraduationModal.module.css`
- [x] T014 [US2] Implement StudentDetailPage with profile info, modality belts and chronological graduation timeline in `frontend/src/pages/Students/StudentDetailPage.jsx` and `frontend/src/pages/Students/StudentDetailPage.module.css`
- [x] T015 [US2] Wire route `/alunos/:id` in `frontend/src/App.jsx` and link student card click to navigate to student details

**Checkpoint**: User Stories 1 and 2 operate together - full student lifecycle and graduation history.

---

## Phase 5: User Story 3 - Ficha Completa, Edição e Desativação Segura (Priority: P2)

**Goal**: Permitir visualização de observações médicas de saúde, edição dos dados cadastrais e inativação segura (soft-delete), com reflexo automático na contagem de alunos ativos no Dashboard.

**Independent Test**: Editar telefone de um aluno, adicionar observação médica com alerta visual, inativar a matrícula e validar que o Dashboard decrementa em 1 a contagem de alunos ativos.

### Implementation for User Story 3

- [x] T016 [US3] Add medical restrictions alert badge and emergency details inside `StudentDetailPage.jsx` and integrate edit mode in `StudentModal.jsx`
- [x] T017 [US3] Implement status toggle action (Ativo / Inativo) and "Mostrar Inativos" filter toggle in `StudentsPage.jsx`
- [x] T018 [US3] Verify and ensure `/api/dashboard/metrics` counts strictly active students without caching discrepancies

**Checkpoint**: All three user stories completed and interconnected.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, end-to-end verification and responsive touch validation.

- [x] T019 Execute end-to-end verification following all 4 scenarios in `specs/004-gestao-alunos-graduacoes/quickstart.md` on mobile (375px) and desktop viewports
- [x] T020 Run production build validation via `cd frontend && npm run build` ensuring 0 warnings/errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion (migration must run first). **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Foundational completion. Delivers the core student enrollment MVP.
- **User Story 2 (Phase 4)**: Depends on US1 completion (extends student card and profile with graduation timeline).
- **User Story 3 (Phase 5)**: Depends on US1 & US2 completion (medical alerts, status toggle and dashboard metric sync).
- **Polish (Phase 6)**: Runs after all user story phases are completed.

---

## Parallel Opportunities

- `T004` (StudentService) and `T007` (Frontend studentService) in parallel with `T003` (StudentRepository).
- `T008` (BeltBadge), `T009` (StudentCard) and `T010` (StudentModal) can be built in parallel.
- `T013` (GraduationModal) in parallel with `T014` (StudentDetailPage).

---

## Implementation Strategy

### MVP First (User Story 1)
1. Execute Migration (Phase 1).
2. Build Repository, Service, Controller & Routes (Phase 2).
3. Build StudentCard, StudentModal & StudentsPage (Phase 3).
4. **VALIDATE MVP**: Verify student creation, list rendering, search and WhatsApp link.

### Incremental Enhancements
1. Add GraduationModal & Timeline (Phase 4).
2. Add Medical Alert & Inactivation flow (Phase 5).
3. Homologate against all 4 quickstart scenarios (Phase 6).
