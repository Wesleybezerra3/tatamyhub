# Implementation Plan: Gestão de Alunos e Graduações

**Branch**: `004-gestao-alunos-graduacoes` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-gestao-alunos-graduacoes/spec.md`

## Summary

Implementação do módulo completo de **Gestão de Alunos e Graduações** do TatamyHub. A funcionalidade viabiliza o cadastro ágil de alunos, vinculação de modalidades esportivas com suas respectivas faixas/graus, linha do tempo histórica imutável das promoções de faixa, busca em tempo real com filtros e atalho ergonômico de 1 toque para WhatsApp diretamente do smartphone do professor.

## Technical Context

**Language/Version**: JavaScript (Node.js LTS v20+ / Browser ES2022)

**Primary Dependencies**:
- **Backend**: Express.js, `mysql2/promise`, `dotenv`, `cors`, middleware `authenticateJWT`
- **Frontend**: React 18/19, `react-router-dom`, `lucide-react`, CSS Modules

**Storage**: MySQL 8.x
- Nova migration `003_create_alunos_e_graduacoes.sql`: tabelas `alunos`, `aluno_modalidades` e `graduacoes_historico`.
- Todas as tabelas estruturadas com chave estrangeira e índice de tenant `academia_id`.

**Testing**: Roteiro de homologação visual e funcional ponta a ponta descrito em [quickstart.md](quickstart.md).

**Target Platform**: Navegadores Mobile (Android/iOS) e Desktop.

**Project Type**: Full-stack Web Application (Frontend SPA + Backend REST API).

**Performance Goals**:
- Resposta de listagem e busca de alunos em menos de 100ms.
- Tempo de renderização dos cards na listagem < 50ms sem layout shift.

**Constraints**:
- Alvos de toque táteis mínimos de 44px (padrão Apple HIG / Android Material).
- Isolamento absoluto por `academia_id` em 100% das consultas SQL.
- Proibição de exclusão física destrutiva de alunos com histórico (`status = 'inativo'`).

## Constitution Check

| Princípio da Constituição | Status | Avaliação Técnica |
|---------------------------|:------:|-------------------|
| **I. Simplicidade acima da Complexidade** | **PASS** | Cadastro rápido com campos essenciais, avatar com iniciais automáticas, histórico direto de faixas sem complexidades de biometria ou contratos pesados no MVP. |
| **II. Código Organizado e Sustentável** | **PASS** | Módulo `students` no backend estruturado em camadas (`repository`, `service`, `controller`, `routes`); componentes reutilizáveis (`BeltBadge`, `StudentCard`) no frontend. |
| **III. Segurança e Integridade dos Dados** | **PASS** | Autenticação via JWT, sanitização de números de WhatsApp, validações centralizadas no backend e consultas parametrizadas contra SQL Injection. |
| **IV. Preparação para Escalabilidade (Multi-Tenant Ready)** | **PASS** | `academia_id` presente na tabela `alunos` e herdado nas tabelas relacionais de modalidades e histórico; queries restritas ao tenant logado. |
| **V. Integridade e Preservação de Histórico** | **PASS** | Histórico de graduações em tabela append-only (`graduacoes_historico`); alunos inativados apenas por flag lógica (`status = 'inativo'`). |
| **Restrições do MVP** | **PASS** | Não inclui uploads de imagem de grande porte no aluno nem relatórios de presença complexos, mantendo o foco na rotina do professor. |

## Project Structure

### Documentation

```text
specs/004-gestao-alunos-graduacoes/
├── spec.md              # Especificação de requisitos e cenários
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e de ergonomia
├── data-model.md        # Esquema relacional das tabelas de alunos e graduações
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/
│   └── students-api.yaml # Contrato OpenAPI dos endpoints de alunos
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação
```

### Source Code

```text
backend/
├── src/
│   ├── database/
│   │   └── migrations/
│   │       └── 003_create_alunos_e_graduacoes.sql  # Schema relacional de alunos e graduações
│   ├── modules/
│   │   └── students/
│   │       ├── students.repository.js              # Consultas SQL e transações atômicas
│   │       ├── students.service.js                 # Validações e regras de negócio
│   │       ├── students.controller.js              # Handlers HTTP REST
│   │       └── students.routes.js                  # Rotas protegidas por JWT
│   └── routes.js                                   # Montagem de /api/alunos

frontend/
├── src/
│   ├── services/
│   │   └── studentService.js                       # Cliente HTTP para a API de alunos
│   ├── components/
│   │   └── students/
│   │       ├── BeltBadge/                          # Badge visual da faixa marcial
│   │       │   ├── BeltBadge.jsx
│   │       │   └── BeltBadge.module.css
│   │       ├── StudentCard/                        # Card tátil de listagem do aluno
│   │       │   ├── StudentCard.jsx
│   │       │   └── StudentCard.module.css
│   │       ├── StudentModal/                       # Modal/Drawer para Novo/Editar Aluno
│   │       │   ├── StudentModal.jsx
│   │       │   └── StudentModal.module.css
│   │       └── GraduationModal/                    # Modal de promoção de faixa e graus
│   │           ├── GraduationModal.jsx
│   │           └── GraduationModal.module.css
│   ├── pages/
│   │   └── Students/
│   │       ├── StudentsPage.jsx                    # Tela principal de listagem e busca
│   │       ├── StudentsPage.module.css
│   │       ├── StudentDetailPage.jsx               # Ficha detalhada e histórico de faixas
│   │       └── StudentDetailPage.module.css
│   └── App.jsx                                     # Substituição da rota de alunos placeholder
```

## Complexity Tracking

> Nenhuma violação das diretrizes arquiteturais ou exceções necessárias. Toda a modelagem adota os padrões existentes de transações MySQL, autenticação JWT e CSS Modules.
