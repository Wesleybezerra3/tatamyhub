# Implementation Plan: Cadastro e Perfil da Academia

**Branch**: `001-cadastro-academia` | **Date**: 2026-11-16 | **Spec**: [specs/001-cadastro-academia/spec.md](spec.md)

**Input**: Feature specification from `specs/001-cadastro-academia/spec.md`

## Summary

Implementação da base institucional e cadastral do sistema **TatamyHub**, permitindo que o administrador/professor configure o perfil da academia (nome, localização, contatos, logotipo) e gerencie as modalidades esportivas praticadas (ex.: Jiu-Jitsu, Muay Thai). A solução adota arquitetura desacoplada com backend Express.js conectado ao MySQL (com migrations e isolamento lógico via `academia_id`) e frontend React com Vite, CSS Modules e suporte PWA orientado a mobile-first.

## Technical Context

**Language/Version**: JavaScript (Node.js LTS v20+ no backend, ES2022+ nos navegadores clientes)

**Primary Dependencies**:
- **Backend**: Express.js, `mysql2/promise`, `dotenv`, `cors`, `multer` (para processamento de upload de imagens)
- **Frontend**: React 18/19, `react-router-dom`, `vite-plugin-pwa`, ícones leves via `lucide-react`

**Storage**: MySQL 8.x com migrations versionadas em SQL, chaves estrangeiras com integridade referencial e índices compostos. Arquivos estáticos de imagens de logotipo salvos localmente em diretório de uploads do servidor.

**Testing**:
- Backend: Supertest + test runner nativo do Node / Vitest para testes de integração de API
- Frontend: Vitest + React Testing Library para componentes e formulários críticos

**Target Platform**: Servidor Node.js (Linux/Windows), Navegadores Mobile (Android Chrome, iOS Safari) e Desktop com modo PWA (Progressive Web App).

**Project Type**: Aplicação Web Full-Stack (Frontend SPA/PWA + Backend REST API)

**Performance Goals**:
- Respostas da API em menos de 100ms para consultas de perfil e modalidades
- Carregamento inicial do frontend em menos de 1.5s em redes 4G móveis
- Upload e processamento de imagem de logotipo em menos de 500ms

**Constraints**:
- Interface 100% responsiva (Mobile-First, viewport mínimo de 360px de largura)
- Todas as tabelas vinculadas logicamente com `academia_id` preparando a futura expansão para multi-tenancy
- Nenhuma dependência externa paga ou serviços de nuvem complexos no MVP

**Scale/Scope**: 1 academia ativa no banco por instalação, 1 a 10 modalidades esportivas cadastradas, 1 arquivo de logotipo com até 2MB.

## Constitution Check

*GATE: Avaliação pré-design e pós-design com base na Constituição v1.0.0:*

| Princípio da Constituição | Status | Avaliação Técnica |
|---------------------------|:------:|-------------------|
| **I. Simplicidade acima da Complexidade** | **PASS** | Stack enxuta (Express + mysql2 + Vite + React) sem ORMs pesados ou serviços de nuvem desnecessários no MVP. |
| **II. Código Organizado e Sustentável** | **PASS** | Separação rigorosa de camadas no backend (`routes`, `controllers`, `services`, `repositories`) e no frontend (`components`, `pages`, `services`, `hooks`). |
| **III. Segurança e Integridade dos Dados** | **PASS** | Validação de payloads no backend, queries parametrizadas prevenindo SQL Injection, sanitização e limitação rigorosa de upload de arquivos (tipo MIME e tamanho máx. 2MB). |
| **IV. Preparação para Escalabilidade (Multi-tenant Ready)** | **PASS** | Chave estrangeira `academia_id` e restrições relacionais compostas `(academia_id, nome)` em todas as tabelas de domínio. |
| **V. Integridade Financeira e Preservação de Histórico** | **PASS** | O módulo institucional estabelece a base cadastral sem impacto financeiro adverso; histórico e dados institucionais mantêm auditoria com `created_at` e `updated_at`. |
| **Restrições do MVP** | **PASS** | Nenhuma integração bancária, aplicativo nativo ou robô de WhatsApp adicionado. |

## Project Structure

### Documentation (this feature)

```text
specs/001-cadastro-academia/
├── spec.md              # Especificação de requisitos funcionais e critérios
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e justificativas técnicas
├── data-model.md        # Modelagem do banco MySQL, ERD e regras de integridade
├── quickstart.md        # Guia passo a passo de validação funcional ponta a ponta
├── contracts/
│   └── academy-api.yaml # Especificação OpenAPI 3.0 dos endpoints da API
└── checklists/
    └── requirements.md  # Checklist de qualidade de requisitos
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js             # Pool de conexões mysql2
│   ├── database/
│   │   ├── migrate.js              # Script executor de migrations
│   │   └── migrations/
│   │       ├── 001_create_academias.sql
│   │       └── 002_create_modalidades.sql
│   ├── middlewares/
│   │   ├── upload.js               # Middleware multer para validação e salvamento de logo
│   │   └── errorHandler.js         # Tratamento centralizado de erros
│   ├── modules/
│   │   ├── academia/
│   │   │   ├── academia.controller.js
│   │   │   ├── academia.service.js
│   │   │   ├── academia.repository.js
│   │   │   └── academia.routes.js
│   │   └── modalidades/
│   │       ├── modalidades.controller.js
│   │       ├── modalidades.service.js
│   │       ├── modalidades.repository.js
│   │       └── modalidades.routes.js
│   ├── routes.js                   # Agregador central de rotas da API (/api)
│   └── server.js                   # Configuração e inicialização do Express
├── uploads/
│   └── logos/                      # Diretório de arquivos estáticos de logotipo
├── package.json
└── tests/
    └── api.test.js

frontend/
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── assets/
│   │   └── styles/                 # Variáveis CSS e reset global
│   ├── components/
│   │   ├── common/                 # Botões, Inputs, Card, Feedback Alerts
│   │   └── layout/                 # Header institucional, Navegação Mobile
│   ├── pages/
│   │   ├── AcademyProfile/         # Formulário de perfil institucional e upload de logo
│   │   └── Modalities/             # Listagem e gestão de modalidades esportivas
│   ├── services/
│   │   ├── api.js                  # Cliente HTTP centralizado (fetch wrapper)
│   │   ├── academyService.js       # Chamadas de perfil e logotipo
│   │   └── modalityService.js      # Chamadas de modalidades
│   ├── hooks/
│   │   └── useAcademy.js           # Gerenciamento de estado de dados e carregamento
│   ├── App.jsx                     # Rotas da aplicação (React Router)
│   └── main.jsx                    # Ponto de entrada React e registro PWA
├── vite.config.js                  # Configuração Vite com VitePWA
└── package.json
```

**Structure Decision**: Adoção do modelo desacoplado em `backend/` e `frontend/`. Essa separação reflete diretamente os princípios da Constituição, permitindo desenvolvimento modular, testes isolados e facilidade de implantação em servidores Node.js e CDNs estáticas.

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição detectada. Todas as escolhas técnicas aderem à regra de máxima simplicidade e ausência de camadas desnecessárias.*
