# Implementation Plan: Área e Hub do Aluno

**Branch**: `006-area-do-aluno` | **Date**: 2026-11-17 | **Spec**: [specs/006-area-do-aluno/spec.md](spec.md)

**Input**: Feature specification from `specs/006-area-do-aluno/spec.md`

---

## Summary

Implementar a **Área e Hub do Aluno** (Portal do Aluno), permitindo que praticantes da academia acessem seu próprio portal web responsivo (Mobile-First / PWA). O portal disponibiliza a visualização em tempo real da **graduação marcial** atual (faixa com cores oficiais e graus), **histórico de promoções**, consulta e cópia facilitada da **chave PIX de mensalidades**, além de um sistema inteligente de **avisos visuais no Hub e notificações em popup** alertando sobre faturas atrasadas ou próximas do vencimento (<= 5 dias).

---

## Technical Context

**Language/Version**: Node.js v20+ / ES Modules (Backend) e React 18+ / Vite (Frontend)  
**Primary Dependencies**: 
- Backend: Express.js, `mysql2/promise`, `bcryptjs`, `jsonwebtoken`, `dotenv`.
- Frontend: React, React Router v6, Lucide React (ícones), CSS Modules.  
**Storage**: MySQL 8+ com migration `007_add_aluno_auth.sql` (novas colunas de credenciais em `alunos`).  
**Testing**: Scripts automatizados de integração end-to-end (Node.js in-process e HTTP) e `npm run build` no Vite.  
**Target Platform**: Web responsivo com suporte a Progressive Web App (PWA) otimizado para smartphones (iOS/Android) e navegadores desktop.  
**Project Type**: Web Application (Monorepo com `backend/` e `frontend/`).  
**Performance Goals**: Tempo de resposta de `GET /api/aluno/hub` < 150ms; renderização inicial no smartphone < 1s.  
**Constraints**: 
- Isolamento estrito de perfil de aluno: um aluno NUNCA acessa dados de outro aluno ou de outra academia.
- Senhas sempre com hash `bcryptjs` (salt 10).
- Notificação popup amigável com controle de sessão (`sessionStorage`) para evitar intrusão contínua.  
**Scale/Scope**: Módulo de portal do aluno com rotas exclusivas (`/aluno/*`), 5 novos endpoints de API REST e integração com componentes visuais existentes (`BeltBadge`, `InvoiceCard`).

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Princípio I (Simplicidade acima da Complexidade)**: Implementa apenas o portal essencial do aluno (faixa, mensalidades, alertas e PIX), sem recursos desnecessários no MVP.
- [x] **Princípio II (Código Organizado e Sustentável)**: Separação estrita em camadas (Routes -> Controller -> Service -> Repository) no backend e serviços dedicados (`studentPortalService.js`, `StudentAuthContext.jsx`) no frontend.
- [x] **Princípio III (Segurança e Integridade dos Dados)**: Tokens JWT dedicados com `role: 'aluno'`, validação de tenant (`academia_id`) e `aluno_id`, senhas com `bcryptjs`.
- [x] **Princípio IV (Preparação para Escalabilidade)**: Todas as consultas continuam filtradas por `academia_id`.
- [x] **Princípio V (Integridade Financeira)**: Regras financeiras e status de vencimento são canônicos no backend; o frontend apenas exibe os estados calculados.
- [x] **Mobile-First & PWA**: Interface limpa, botões táteis (mínimo 44px), navegação com poucos toques e suporte a PWA.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-area-do-aluno/
├── plan.md              # Este plano de implementação
├── research.md          # Pesquisa técnica e decisões de arquitetura
├── data-model.md        # Modelagem de dados, migration e máquina de estados
├── quickstart.md        # Roteiro de validação e testes
├── contracts/
│   └── student-portal-api.yaml # Especificação OpenAPI dos endpoints do aluno
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code

```text
backend/
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 007_add_aluno_auth.sql          # Novas colunas na tabela alunos
│   ├── middlewares/
│   │   └── studentAuth.js                       # Middleware de validação JWT para alunos
│   ├── modules/
│   │   ├── studentPortal/                       # Novo módulo exclusivo do portal do aluno
│   │   │   ├── studentPortal.routes.js
│   │   │   ├── studentPortal.controller.js
│   │   │   ├── studentPortal.service.js
│   │   │   └── studentPortal.repository.js
│   │   └── students/
│   │       └── students.controller.js           # Endpoint administrativo para gestor resetar senha
│   └── routes.js                                # Registro de /api/aluno

frontend/
├── src/
│   ├── context/
│   │   └── StudentAuthContext.jsx               # Contexto de autenticação do aluno
│   ├── hooks/
│   │   └── useStudentAuth.js                    # Hook customizado para sessão do aluno
│   ├── services/
│   │   └── studentPortalService.js              # Chamadas API do portal do aluno
│   ├── components/
│   │   └── studentPortal/
│   │       ├── StudentProtectedRoute.jsx       # Guarda de rota do portal
│   │       ├── StudentAlertBanner/              # Banner de alerta dinâmico no Hub
│   │       └── StudentNotificationPopup/        # Modal popup de notificação de fatura
│   ├── pages/
│   │   ├── StudentLogin/
│   │   │   ├── StudentLoginPage.jsx             # Tela de login do aluno
│   │   │   └── StudentLoginPage.module.css
│   │   └── StudentHub/
│   │       ├── StudentHubPage.jsx               # Hub principal (graduação, faturas, alertas)
│   │       └── StudentHubPage.module.css
│   └── App.jsx                                  # Rotas /aluno/login e /aluno
```

---

## Complexity Tracking

> **Sem violações da Constituição**: A arquitetura mantém-se perfeitamente alinhada à stack oficial, aos padrões REST e ao modelo relacional existente.
