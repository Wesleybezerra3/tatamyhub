---
description: "Task list for feature implementation: Dashboard Operacional e Navegação Responsiva"
---

# Tasks: Dashboard Operacional e Navegação Responsiva

**Input**: Design documents from `specs/003-dashboard-overview/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/dashboard-api.yaml](contracts/dashboard-api.yaml), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Indicates User Story ownership (`[US1]`, `[US2]`, `[US3]`) for feature phases
- Descriptions include exact target file paths and explicit validation constraints

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Route aggregation for the dashboard module.

- [x] T001 Register dashboard router module and mount `/api/dashboard` in `backend/src/routes.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend metric aggregation and frontend API service.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Implement Dashboard repository with aggregated SQL queries per `academia_id` in `backend/src/modules/dashboard/dashboard.repository.js`
- [x] T003 [P] Implement Dashboard service with calculation, defensive fallbacks, and currency formatting in `backend/src/modules/dashboard/dashboard.service.js`
- [x] T004 Implement Dashboard controller for `GET /api/dashboard/metrics` in `backend/src/modules/dashboard/dashboard.controller.js`
- [x] T005 Register `GET /metrics` with `authenticateJWT` in `backend/src/modules/dashboard/dashboard.routes.js`
- [x] T006 [P] Implement frontend `dashboardService` for `GET /dashboard/metrics` in `frontend/src/services/dashboardService.js`

**Checkpoint**: Foundation ready - metrics API is operational.

---

## Phase 3: User Story 1 - Visão Geral do Tatame e Métricas Operacionais (Priority: P1) 🎯 MVP

**Goal**: Exibir os 4 cards de KPIs principais (Alunos Ativos, Mensalidades em Atraso, Total Arrecadado no Mês e Modalidades Ativas) com formatação em reais e estados de carregamento.

**Independent Test**: Fazer login e carregar `/dashboard`, validando a renderização dos 4 cards de indicadores com dados calculados da academia atual.

### Implementation for User Story 1

- [x] T007 [P] [US1] Implement MetricCard visual component in `frontend/src/components/dashboard/MetricCard/MetricCard.jsx` and `frontend/src/components/dashboard/MetricCard/MetricCard.module.css`
- [x] T008 [US1] Implement Dashboard page view with KPI metrics cards in `frontend/src/pages/Dashboard/DashboardPage.jsx` and `frontend/src/pages/Dashboard/DashboardPage.module.css`
- [x] T009 [US1] Set `/dashboard` as default landing route for authenticated sessions in `frontend/src/App.jsx`

**Checkpoint**: User Story 1 provides the primary dashboard view.

---

## Phase 4: User Story 2 - Ações Rápidas do Dia a Dia (Priority: P1)

**Goal**: Disponibilizar botões de ação rápida com alvos ergonômicos táteis (mínimo 44px) no topo do Dashboard para tarefas frequentes do professor.

**Independent Test**: Tocar nos botões de ação rápida no smartphone e verificar o direcionamento imediato para configuração da academia, nova modalidade ou atalhos operacionais.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement QuickActions component with tactile button styling in `frontend/src/components/dashboard/QuickActions/QuickActions.jsx` and `frontend/src/components/dashboard/QuickActions/QuickActions.module.css`
- [x] T011 [US2] Integrate QuickActions and personalized welcome banner into `frontend/src/pages/Dashboard/DashboardPage.jsx`

**Checkpoint**: User Stories 1 and 2 operate together as a complete dashboard.

---

## Phase 5: User Story 3 - Navegação Responsiva (Mobile Tab Bar & Desktop Sidebar) (Priority: P2)

**Goal**: Implementar navegação híbrida com Tab Bar inferior fixa no mobile (< 768px) e Sidebar lateral no desktop (>= 768px).

**Independent Test**: Redimensionar o viewport entre 375px e 1024px, conferindo que a Tab Bar aparece apenas no mobile e a Sidebar apenas no desktop, com links de navegação e logout funcionando.

### Implementation for User Story 3

- [x] T012 [P] [US3] Implement Desktop Sidebar navigation component in `frontend/src/components/layout/Sidebar.jsx` and `frontend/src/components/layout/Sidebar.module.css`
- [x] T013 [P] [US3] Implement Mobile Tab Bar fixed bottom navigation component in `frontend/src/components/layout/MobileTabBar.jsx` and `frontend/src/components/layout/MobileTabBar.module.css`
- [x] T014 [US3] Refactor `AppLayout.jsx` and `AppLayout.module.css` to combine Desktop Sidebar and Mobile Tab Bar seamlessly in `frontend/src/components/layout/AppLayout.jsx`
- [x] T015 [P] [US3] Implement lightweight placeholder views for Students (`/alunos`) and Payments (`/mensalidades`) in `frontend/src/pages/Students/StudentsPlaceholderPage.jsx` and `frontend/src/pages/Payments/PaymentsPlaceholderPage.jsx`
- [x] T016 [US3] Wire `/alunos` and `/mensalidades` routes into `frontend/src/App.jsx`

**Checkpoint**: All three user stories functional across mobile and desktop.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsiveness and end-to-end verification.

- [x] T017 Execute end-to-end verification following all 4 scenarios in `specs/003-dashboard-overview/quickstart.md` on mobile (375px) and desktop viewports

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

- `T003` (Service) and `T006` (Frontend service) in parallel with `T002`.
- `T007` (MetricCard) in parallel with backend tasks.
- `T010` (QuickActions) in parallel with `T008`.
- `T012` (Sidebar) and `T013` (MobileTabBar) in parallel.
- `T015` (Placeholders) in parallel with `T014`.
