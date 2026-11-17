<!--
Sync Impact Report:
- Version change: Initial Template (unversioned) → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Simplicidade acima da Complexidade
  - [PRINCIPLE_2_NAME] → II. Código Organizado e Sustentável
  - [PRINCIPLE_3_NAME] → III. Segurança e Integridade dos Dados
  - [PRINCIPLE_4_NAME] → IV. Preparação para Escalabilidade (Multi-Tenant Ready)
  - [PRINCIPLE_5_NAME] → V. Integridade Financeira e Preservação de Histórico
- Added sections:
  - Propósito do Projeto
  - Stack Tecnológica Obrigatória
  - Padrões de Desenvolvimento & Arquitetura
  - Regras de Negócio Obrigatórias
  - Experiência do Usuário (Mobile-First)
  - Restrições do MVP
  - Critérios de Qualidade e Conclusão
  - Diretriz de Evolução
- Removed sections: None
- Follow-up TODOs: None
-->

# TatamyHub Constitution

## Propósito do Projeto

Desenvolver uma aplicação web voltada ao gerenciamento de alunos, mensalidades e cobranças de uma academia de Artes Marciais.
O sistema tem como meta simplificar o controle financeiro, eliminar esquecimentos na rotina de cobrança e aproximar a comunicação entre professor e alunos.
O MVP nasce focado no atendimento a uma academia individual, mantendo desde a concepção a disciplina arquitetural (`academia_id` em entidades de domínio) para posterior evolução para SaaS multi-tenant.

## Core Principles

### I. Simplicidade acima da Complexidade
- O sistema DEVE implementar exclusivamente funcionalidades que solucionem dores reais e imediatas da academia.
- NÃO DEVE haver introdução antecipada de abstrações genéricas, microsserviços, bibliotecas redundantes ou arquitetura especulativa (YAGNI estrito).
- A prioridade absoluta é garantir uma rotina operacional ágil e sem atrito para o professor no smartphone.

### II. Código Organizado e Sustentável
- DEVE haver separação estrita de responsabilidades entre Frontend, Backend e Camada de Dados.
- O código DEVE adotar nomenclatura semântica, consistente e em padrão unificado em todo o repositório.
- A duplicação de regras de negócio é terminantemente proibida: toda regra deve residir e ser validada centralmente no backend.
- Componentes e utilitários reutilizáveis devem ser criados apenas quando houver benefício prático e comprovado de reaproveitamento.

### III. Segurança e Integridade dos Dados
- Senhas NUNCA devem ser armazenadas ou trafegadas em texto plano (hashing criptográfico obrigatório).
- Todo dado de entrada recebido nas APIs DEVE ser rigorosamente validado e sanitizado no backend.
- Rotas administrativas e dados operacionais DEVEM ser protegidos por autenticação e controle de permissões.
- O backend NUNCA DEVE confiar em valores financeiros, cálculos de saldo ou status de cobrança enviados pelo cliente.
- Acesso ao banco de dados DEVE utilizar consultas parametrizadas ou abstração tipada segura, prevenindo SQL Injection.
- Isolamento lógico: usuários e professores NÃO DEVEM, sob hipótese alguma, ter acesso a registros pertencentes a outra academia.

### IV. Preparação para Escalabilidade (Multi-Tenant Ready)
- Toda entidade pertencente ao domínio da academia DEVE conter explicitamente a coluna/chave estrangeira `academia_id`.
- Regras de negócio, cálculos e fluxos NÃO DEVEM ser acoplados a identificadores fixos (hardcoded) de uma academia específica.
- Configurações institucionais da academia (nome, dados de PIX, contatos, parâmetros de cobrança) DEVEM ser mantidas separadas dos dados operacionais e de transação.
- A infraestrutura completa de multi-tenancy não deve ser antecipada no MVP, mas a modelagem relacional DEVE preservar o isolamento por tenant.

### V. Integridade Financeira e Preservação de Histórico
- Uma **Mensalidade** (fatura/obrigação de valor) é uma entidade distinta de um **Pagamento** (evento de quitação financeira).
- Uma mensalidade PODE receber um ou múltiplos pagamentos (pagamentos parciais).
- Nenhum registro financeiro (mensalidade, histórico de cobrança, lançamento de pagamento) DEVE ser excluído de forma destrutiva (`soft delete` ou preservação imutável com auditoria).
- O status de inadimplência/atraso DEVE ser apurado de forma determinística a partir da data de vencimento e do saldo devedor remanescente.

## Stack Tecnológica Obrigatória

### Frontend
- **Framework**: React com JavaScript.
- **Build Tool**: Vite.
- **Roteamento**: React Router.
- **Estilização**: CSS Modules ou abordagem consistente de escopo local de estilos.
- **PWA**: Suporte a Progressive Web App configurado via `vite-plugin-pwa` (instalação no celular e operação mobile suave).

### Backend
- **Ambiente**: Node.js com Express.js.
- **Linguagem**: JavaScript.
- **Estilo de API**: RESTful, com payloads em JSON e respostas padronizadas.
- **Autenticação**: Sessão ou JWT estruturado com middlewares de verificação de permissão.

### Banco de Dados
- **SGBD**: MySQL.
- **Controle de Schema**: Migrations obrigatórias para qualquer alteração estrutural no banco de dados.
- **Integridade**: Foreign Keys obrigatórias entre tabelas relacionadas.
- **Transações (ACID)**: Obrigatórias em qualquer operação financeira envolvendo múltiplos registros (ex.: registro de pagamento e liquidação de mensalidade).

## Padrões de Desenvolvimento & Arquitetura

### Frontend
- Componentes com responsabilidade única: separação entre páginas (`pages`), componentes visuais (`components`), serviços de API (`services`) e lógica reativa (`hooks`).
- Toda comunicação HTTP com a API DEVE ser centralizada em uma camada de serviço (sem chamadas `fetch`/`axios` espalhadas nos componentes).
- A interface gráfica NÃO DEVE calcular ou definir regras financeiras canônicas; apenas exibe estados calculados pelo backend.
- Todas as telas DEVEM tratar explicitamente os estados de carregamento (*loading*), sucesso (*empty/content*) e falha (*error feedback*).
- Abordagem de design obrigatoriamente **Mobile-First**.

### Backend
- Estruturação modular por domínio funcional (ex.: alunos, mensalidades, pagamentos).
- Separação em camadas de responsabilidade:
  - **Controllers**: Validação do payload HTTP, extração de parâmetros e despacho de resposta HTTP.
  - **Services**: Implementação das regras de negócio, orquestração de transações e validações canônicas.
  - **Repositories / Data Access**: Execução de queries, migrations e persistência no MySQL.
- Middlewares dedicados para: autenticação, tratamento centralizado de erros e logging de requisições.
- Padronização no formato de erros e respostas da API REST.

### Banco de Dados
- Nomenclatura consistente (padrão snake_case para tabelas e colunas, chaves primárias e estrangeiras claras).
- Índices explícitos para campos consultados com frequência em listagens e filtros (ex.: `academia_id`, `aluno_id`, `status`, `data_vencimento`).
- Tipo `DECIMAL(10, 2)` obrigatório para qualquer valor monetário (nunca utilizar float ou double para dinheiro).
- Armazenamento padronizado de datas e horários, respeitando o fuso horário configurado da academia.
- Auditoria de alterações com campos `created_at` e `updated_at`.

## Regras de Negócio Obrigatórias

- **Distinção Conceitual**: Mensalidade = obrigação a pagar; Pagamento = recurso recebido.
- **Pagamentos Parciais**: O sistema DEVE permitir amortizações parciais de uma mensalidade, atualizando o saldo pendente até a quitação total.
- **Confirmação Confiável**: Um pagamento só é tido como liquidado após confirmação explícita de um administrador/professor no painel ou por webhook confiável validado.
- **Canal WhatsApp**: O envio manual ou geração de link de cobrança para WhatsApp NÃO constitui confirmação de pagamento.
- **Status Financeiros**: Calculados em tempo de consulta ou atualizados de forma consistente com base em `data_vencimento`, `valor_total`, `valor_pago` e data de referência.
- **Preservação de Histórico**: É terminantemente proibido apagar pagamentos ou faturas para corrigir erros operacionais; estornos ou correções devem ser registrados como novas movimentações ou ajustes rastreáveis.

## Experiência do Usuário (UX)

- Design limpo, focado e de alta legibilidade, otimizado para telas sensíveis ao toque (smartphones).
- Fluxo de trabalho otimizado para o professor: ações principais (cobrar, registrar pagamento, ver inadimplentes) acessíveis com poucos toques.
- Diálogos de confirmação e feedback visual claro para operações financeiras críticas.
- Ausência de poluição visual: evitar dashboards inflados com gráficos complexos ou métricas não acionáveis no dia a dia.

## Restrições do MVP

Estão expressamente fora do escopo do MVP:
- Aplicativos nativos iOS / Android (apenas PWA web responsivo).
- Gateways de pagamento externos com liquidação automatizada (ex.: Asaas, Stripe, Mercado Pago) no primeiro ciclo.
- Integração bancária direta via Open Finance / CNAB.
- Disparo automático de mensagens ou integração com API oficial do WhatsApp.
- Controle de presença e catraca.
- Gestão de graduações, faixas e graus.
- Gestão completa de turmas, múltiplos horários e folha de professores.
- Módulos avançados de relatórios gerenciais e BI.

## Critérios de Qualidade e Conclusão

Uma funcionalidade só é considerada pronta para entrega quando:
1. Atende a 100% dos requisitos descritos na sua especificação.
2. Possui validação completa de dados de entrada na camada de backend.
3. Trata adequadamente cenários de erro e falhas de comunicação.
4. Respeita integralmente as regras financeiras e de isolamento de dados.
5. Não gera regressão em funcionalidades já existentes.
6. Foi homologada em resolução móvel e desktop.

## Diretriz de Evolução

- O MVP deve priorizar estabilidade, baixa fricção operacional e custo mínimo de infraestrutura.
- Qualquer evolução tecnológica futura deve justificar-se por uma necessidade prática real, preservando a simplicidade e a separação arquitetural aqui estabelecidas.

## Governance

A presente Constituição é o documento de governança soberano do projeto **TatamyHub**. Todas as especificações funcionais, planos de arquitetura, tarefas e implementações de código devem estar em conformidade estrita com suas diretrizes.

- **Processo de Emenda**: Qualquer alteração em princípios fundamentais, stack obrigatória ou restrições de escopo deve ser documentada, versionada e acompanhada de justificativa técnica ou de produto.
- **Versionamento**:
  - `MAJOR`: Quebra de compatibilidade em princípios, remoção de restrições fundamentais ou alteração de stack central.
  - `MINOR`: Adição de novos princípios, padrões arquiteturais ou expansão formal de escopo.
  - `PATCH`: Correções de texto, clarificações semânticas e refinamentos pontuais.
- **Revisão de Conformidade**: Os comandos do Spec Kit (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks` e `/speckit-implement`) devem validar seus artefatos contra os princípios e restrições desta Constituição.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
