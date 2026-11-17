---
description: "Task list for feature implementation: Gestão Financeira e Mensalidades"
---

# Tasks: Gestão Financeira e Mensalidades

**Input**: Design documents from `specs/005-gestao-financeira-mensalidades/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/financial-api.yaml](contracts/financial-api.yaml), [quickstart.md](quickstart.md)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Indicates User Story ownership (`[US1]`, `[US2]`, `[US3]`) for feature phases
- Descriptions include exact target file paths and explicit validation constraints

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema creation and migration execution.

- [x] T001 Create database migration for memberships and payments in `backend/src/database/migrations/004_create_mensalidades_e_pagamentos.sql`
- [x] T002 Execute database migration via `backend/src/database/migrate.js` to create tables `mensalidades` and `pagamentos`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend module and frontend API client.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Implement financial repository with atomic payment transactions, status calculation and tenant isolation in `backend/src/modules/financial/financial.repository.js`
- [x] T004 [P] Implement financial service with validation, partial payment logic and friendly WhatsApp billing template generator in `backend/src/modules/financial/financial.service.js`
- [x] T005 Implement financial HTTP controller handlers in `backend/src/modules/financial/financial.controller.js`
- [x] T006 Register financial routes with `authenticateJWT` in `backend/src/modules/financial/financial.routes.js` and mount `/api/mensalidades` in `backend/src/routes.js`
- [x] T007 [P] Implement frontend financial API client in `frontend/src/services/financialService.js`

**Checkpoint**: Foundation ready - Financial & Memberships API operational.

---

## Phase 3: User Story 1 - Visão de Mensalidades, Filtros e Cobrança WhatsApp (Priority: P1) 🎯 MVP

**Goal**: Exibir a listagem de faturas com busca por aluno, filtros rápidos por status (Atrasadas, Pendentes, Pagas, Todas) e atalho de 1 toque para cobrança via WhatsApp.

**Independent Test**: Cadastrar uma mensalidade vencida, visualizá-la no filtro "Atrasadas" com card destacado e clicar em "Cobrar no WhatsApp" para verificar a geração da URL com mensagem amigável e chave PIX da academia.

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement InvoiceCard component with status badges, balance due and direct WhatsApp billing button in `frontend/src/components/financial/InvoiceCard/InvoiceCard.jsx` and `frontend/src/components/financial/InvoiceCard/InvoiceCard.module.css`
- [x] T009 [US1] Implement PaymentsPage with status filter pills (Atrasadas, Pendentes, Pagas, Todas), search bar and summary metrics in `frontend/src/pages/Payments/PaymentsPage.jsx` and `frontend/src/pages/Payments/PaymentsPage.module.css`
- [x] T010 [US1] Update route `/mensalidades` in `frontend/src/App.jsx` to render `PaymentsPage` instead of the placeholder

**Checkpoint**: User Story 1 operational - professor can see pending/overdue invoices and send WhatsApp reminders.

---

## Phase 4: User Story 2 - Baixa Rápida de Pagamento e Quitação Parcial (Priority: P1) 🎯 MVP

**Goal**: Permitir a baixa de mensalidades pelo smartphone com 1 toque, escolhendo a forma de pagamento (PIX, Dinheiro, Cartão) e registrando pagamentos integrais ou parciais.

**Independent Test**: Registrar a baixa de uma mensalidade de R$ 150,00 via PIX, confirmando a mudança para "Paga" e a atualização imediata dos KPIs de inadimplência e faturamento no Dashboard.

### Implementation for User Story 2

- [x] T011 [P] [US2] Implement PaymentModal component for registering full or partial payments in `frontend/src/components/financial/PaymentModal/PaymentModal.jsx` and `frontend/src/components/financial/PaymentModal/PaymentModal.module.css`
- [x] T012 [US2] Integrate PaymentModal into `PaymentsPage.jsx` with instant status updates and feedback alerts
- [x] T013 [US2] Verify that payments update `/api/dashboard/metrics` (incrementing "Total Arrecadado" and decrementing "Em Atraso") without discrepancy

**Checkpoint**: User Stories 1 and 2 operate together - full payment settlement and WhatsApp reminders.

---

## Phase 5: User Story 3 - Lançamento Avulso e Geração em Lote (Priority: P2)

**Goal**: Permitir emitir mensalidades individuais e acionar a geração mensal em lote para todos os alunos ativos da academia sem duplicidade.

**Independent Test**: Criar uma fatura avulsa para um aluno e, em seguida, testar a geração em lote para o mês corrente, validando a inserção idempotente de faturas para todos os alunos ativos.

### Implementation for User Story 3

- [x] T014 [P] [US3] Implement CreateInvoiceModal component for single invoice creation in `frontend/src/components/financial/CreateInvoiceModal/CreateInvoiceModal.jsx` and `frontend/src/components/financial/CreateInvoiceModal/CreateInvoiceModal.module.css`
- [x] T015 [P] [US3] Implement BatchGenerateModal component for monthly batch generation in `frontend/src/components/financial/BatchGenerateModal/BatchGenerateModal.jsx` and `frontend/src/components/financial/BatchGenerateModal/BatchGenerateModal.module.css`
- [x] T016 [US3] Wire modals and cancel invoice action into `PaymentsPage.jsx`
- [x] T017 [US3] Connect Dashboard QuickAction "Registrar Pagamento" and "Cobrança WhatsApp" directly to the `/mensalidades` filtered views

**Checkpoint**: All three user stories completed and interconnected.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, end-to-end verification and build validation.

- [x] T018 Execute end-to-end verification following all 4 scenarios in `specs/005-gestao-financeira-mensalidades/quickstart.md` on mobile (375px) and desktop viewports
- [x] T019 Run production build validation via `cd frontend && npm run build` ensuring 0 warnings/errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion (migration must run first). **BLOCKS all user stories**.
- **User Story 1 (Phase 3)**: Depends on Foundational completion. Delivers the core invoice listing and WhatsApp billing MVP.
- **User Story 2 (Phase 4)**: Depends on US1 completion (payment settlement modal directly in the invoice card).
- **User Story 3 (Phase 5)**: Depends on US1 & US2 completion (modals for single and batch creation).
- **Polish (Phase 6)**: Runs after all user story phases are completed.

---

## Parallel Opportunities

- `T004` (FinancialService) and `T007` (Frontend financialService) in parallel with `T003` (FinancialRepository).
- `T008` (InvoiceCard) in parallel with `T011` (PaymentModal).
- `T014` (CreateInvoiceModal) and `T015` (BatchGenerateModal) in parallel.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Execute Migration (Phase 1).
2. Build Repository, Service, Controller & Routes (Phase 2).
3. Build InvoiceCard & PaymentsPage with WhatsApp direct billing (Phase 3).
4. Build PaymentModal with full/partial payments (Phase 4).
5. **VALIDATE MVP**: Verify invoice listing, payment settlement and WhatsApp billing.

### Incremental Enhancements
1. Add CreateInvoiceModal & BatchGenerateModal (Phase 5).
2. Homologate against all 4 quickstart scenarios (Phase 6).
