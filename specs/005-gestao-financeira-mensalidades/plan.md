# Implementation Plan: Gestão Financeira e Mensalidades

**Branch**: `005-gestao-financeira-mensalidades` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/005-gestao-financeira-mensalidades/spec.md`

## Summary

Implementação do módulo de **Gestão Financeira e Mensalidades** do TatamyHub. A funcionalidade oferece controle completo do fluxo de caixa e mensalidades da academia, permitindo baixa rápida de pagamentos (PIX, Dinheiro, Cartões), quitação parcial, geração avulsa e em lote para alunos ativos, e cobrança amigável de 1 toque no WhatsApp com a chave PIX da academia pré-formatada.

## Technical Context

**Language/Version**: JavaScript (Node.js LTS v20+ / Browser ES2022)

**Primary Dependencies**:
- **Backend**: Express.js, `mysql2/promise`, `dotenv`, `cors`, middleware `authenticateJWT`
- **Frontend**: React 18/19, `react-router-dom`, `lucide-react`, CSS Modules

**Storage**: MySQL 8.x
- Nova migration `004_create_mensalidades_e_pagamentos.sql`: tabelas `mensalidades` e `pagamentos`.
- Chaves estrangeiras e índices compostos de tenant `academia_id`.
- Tipos de precisão financeira `DECIMAL(10, 2)`.

**Testing**: Roteiro de homologação visual e funcional ponta a ponta descrito em [quickstart.md](quickstart.md).

**Target Platform**: Navegadores Mobile (Android/iOS) e Desktop.

**Project Type**: Full-stack Web Application (Frontend SPA + Backend REST API).

**Performance Goals**:
- Resposta de listagem de mensalidades com filtros < 100ms.
- Registro atômico de pagamento e recálculo de saldo < 80ms.

**Constraints**:
- Alvos de clique mínimos de 44px (ergonomia tátil para smartphones).
- Separação estrita de faturas e transações (Princípio V da Constituição).
- Proibição de exclusão física destrutiva de faturas com recebimentos.

## Constitution Check

| Princípio da Constituição | Status | Avaliação Técnica |
|---------------------------|:------:|-------------------|
| **I. Simplicidade acima da Complexidade** | **PASS** | Baixa em 1 toque, cobrança direta via WhatsApp com template amigável, sem integração pesada de gateways no MVP. |
| **II. Código Organizado e Sustentável** | **PASS** | Módulo `financial` isolado no backend com camadas bem definidas (`repository`, `service`, `controller`, `routes`). |
| **III. Segurança e Integridade dos Dados** | **PASS** | O backend valida estritamente valores numéricos, saldos devedores e permissão de tenant (`academia_id`). |
| **IV. Preparação para Escalabilidade (Multi-Tenant Ready)** | **PASS** | Isolamento por `academia_id` em todas as consultas SQL de mensalidades e pagamentos. |
| **V. Integridade Financeira e Preservação de Histórico** | **PASS** | Separação conceitual entre `mensalidades` (faturas) e `pagamentos` (eventos de quitação); precisão `DECIMAL(10, 2)`. |
| **Restrições do MVP** | **PASS** | Foco na rotina de cobrança do tatame e eliminação de esquecimentos, sem módulos de conciliação bancária pesada. |

## Project Structure

### Documentation

```text
specs/005-gestao-financeira-mensalidades/
├── spec.md              # Especificação de requisitos e cenários
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e modelos financeiros
├── data-model.md        # Esquema relacional das tabelas de mensalidades e pagamentos
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/
│   └── financial-api.yaml # Contrato OpenAPI dos endpoints financeiros
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code

```text
backend/
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 004_create_mensalidades_e_pagamentos.sql # Tabelas financeiras
│   ├── modules/
│   │   └── financial/
│   │       ├── financial.repository.js                 # Queries SQL e transações atômicas
│   │       ├── financial.service.js                    # Regras de negócio, saldos e WhatsApp template
│   │       ├── financial.controller.js                 # Handlers HTTP
│   │       └── financial.routes.js                     # Rotas /api/mensalidades
│   └── routes.js                                       # Montagem de rotas financeiras

frontend/
├── src/
│   ├── services/
│   │   └── financialService.js                         # Cliente HTTP da API financeira
│   ├── components/
│   │   └── financial/
│   │       ├── InvoiceCard/                            # Card tátil da mensalidade com badges e ações
│   │       │   ├── InvoiceCard.jsx
│   │       │   └── InvoiceCard.module.css
│   │       ├── PaymentModal/                           # Modal de baixa rápida e pagamento parcial
│   │       │   ├── PaymentModal.jsx
│   │       │   └── PaymentModal.module.css
│   │       ├── CreateInvoiceModal/                     # Modal de lançamento avulso
│   │       │   ├── CreateInvoiceModal.jsx
│   │       │   └── CreateInvoiceModal.module.css
│   │       └── BatchGenerateModal/                     # Modal de geração em lote mensal
│   │           ├── BatchGenerateModal.jsx
│   │           └── BatchGenerateModal.module.css
│   ├── pages/
│   │   └── Payments/
│   │       ├── PaymentsPage.jsx                        # Tela principal de mensalidades
│   │       └── PaymentsPage.module.css
│   └── App.jsx                                         # Conexão da rota /mensalidades definitiva
```

## Complexity Tracking

> Nenhuma violação das diretrizes arquiteturais. Todas as tabelas e endpoints adotam o padrão estabelecido de isolamento por `academia_id`, autenticação JWT e transações MySQL.
