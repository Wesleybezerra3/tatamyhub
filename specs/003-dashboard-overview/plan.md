# Implementation Plan: Dashboard Operacional e Navegação Responsiva

**Branch**: `003-dashboard-overview` | **Date**: 2026-11-16 | **Spec**: [specs/003-dashboard-overview/spec.md](spec.md)

**Input**: Feature specification from `specs/003-dashboard-overview/spec.md`

## Summary

Implementação do **Dashboard Operacional** do TatamyHub, oferecendo visão condensada das métricas da academia (alunos, inadimplência, arrecadação mensal e modalidades ativas), atalhos de **Ações Rápidas** de alta ergonomia e **Navegação Responsiva Mobile-First** — combinando uma **Tab Bar fixa inferior** para dispositivos móveis com uma **Sidebar Lateral** para telas desktop.

## Technical Context

**Language/Version**: JavaScript (Node.js LTS v20+ / Browser ES2022)

**Primary Dependencies**:
- **Backend**: Express.js, `mysql2/promise`, `dotenv`, `cors`, middleware `authenticateJWT`
- **Frontend**: React 18/19, `react-router-dom`, `lucide-react`, CSS Modules

**Storage**: Consultas agregadas e determinísticas no MySQL sobre as tabelas `academias` e `modalidades` (e suporte expansível para tabelas financeiras e de alunos).

**Testing**: Roteiro de validação responsiva (Mobile 375px e Desktop) descrito no [quickstart.md](quickstart.md).

**Target Platform**: Navegadores Mobile (Android/iOS) e Desktop.

**Project Type**: Full-stack Web Application (Frontend SPA + Backend REST API).

**Performance Goals**:
- Resposta da API de métricas em menos de 150ms.
- Renderização do layout sem *layout shift* (CLS = 0).

**Constraints**:
- Alvos de clique mínimos de 44px no mobile.
- Total isolamento de métricas por `academia_id`.
- Zero poluição visual com gráficos vazios ou dados fictícios.

## Constitution Check

| Princípio da Constituição | Status | Avaliação Técnica |
|---------------------------|:------:|-------------------|
| **I. Simplicidade acima da Complexidade** | **PASS** | Métricas condensadas em 4 KPIs essenciais e ações de 1 toque; sem gráficos decorativos inúteis no MVP. |
| **II. Código Organizado e Sustentável** | **PASS** | Módulo `dashboard` separado no backend (`routes`, `controller`, `service`, `repository`) e layout responsivo modular no frontend. |
| **III. Segurança e Integridade dos Dados** | **PASS** | Todas as métricas protegidas por token JWT e filtradas pelo `academia_id` autenticado. |
| **IV. Preparação para Escalabilidade** | **PASS** | Queries agregadas estruturadas por tenant. |
| **V. Integridade Financeira** | **PASS** | Separação conceitual mantida (mensalidades em atraso vs valor arrecadado). |
| **Restrições do MVP** | **PASS** | Sem relatórios avançados de BI; apenas os indicadores prioritários da rotina do tatame. |

## Project Structure

### Documentation

```text
specs/003-dashboard-overview/
├── spec.md              # Especificação de requisitos e cenários
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de navegação mobile-first e agregação de KPIs
├── data-model.md        # Estrutura do objeto DashboardMetrics
├── quickstart.md        # Roteiro de validação responsiva ponta a ponta
├── contracts/
│   └── dashboard-api.yaml # Contrato OpenAPI do endpoint de métricas
└── checklists/
    └── requirements.md  # Checklist de qualidade
```

### Source Code

```text
backend/
├── src/
│   ├── modules/
│   │   └── dashboard/
│   │       ├── dashboard.controller.js  # Handler de métricas
│   │       ├── dashboard.service.js     # Regra de agregação e formatação
│   │       ├── dashboard.repository.js  # Queries SQL agregadas por academia_id
│   │       └── dashboard.routes.js      # Rota /api/dashboard/metrics
│   └── routes.js                        # Registro da rota de dashboard

frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.jsx            # Layout unificado com Sidebar (desktop) e Tab Bar (mobile)
│   │       ├── AppLayout.module.css     # Estilos responsivos desktop/mobile
│   │       ├── Sidebar.jsx              # Menu lateral desktop
│   │       ├── Sidebar.module.css
│   │       ├── MobileTabBar.jsx         # Tab Bar inferior mobile
│   │       └── MobileTabBar.module.css
│   ├── pages/
│   │   ├── Dashboard/                   # Página do Dashboard
│   │   │   ├── DashboardPage.jsx        # KPIs, Quick Actions, Boas-vindas
│   │   │   └── DashboardPage.module.css
│   │   ├── Students/                    # Placeholder de Alunos
│   │   └── Payments/                    # Placeholder de Mensalidades
│   ├── services/
│   │   └── dashboardService.js          # Chamadas HTTP para /dashboard/metrics
│   └── App.jsx                          # Configuração de rotas (/dashboard como default)
```

**Structure Decision**: Reestruturar o `AppLayout` para adotar a composição responsiva definitiva: uma `Sidebar` limpa no desktop e a `MobileTabBar` fixa na base no smartphone, garantindo consistência em todas as páginas da aplicação.

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição.*
