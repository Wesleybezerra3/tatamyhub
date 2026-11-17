# Feature Specification: Dashboard Operacional e Navegação Responsiva

**Feature Branch**: `003-dashboard-overview`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "crie um dashboard, inicialmente com uma pagina, de metricas gerais e ações, menu lateral e para o mobile, tab bar, lembrando que a ui é mobile first"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visão Geral do Tatame e Métricas Operacionais (Priority: P1)

Como professor ou gestor da academia autenticado, quero acessar a tela principal (Dashboard) e visualizar em uma única tela os indicadores essenciais do dia (alunos matriculados, mensalidades pendentes/em atraso, total arrecadado no mês e modalidades ativas), para ter clareza financeira imediata sem complexidade ou excesso de gráficos.

**Why this priority**: É a primeira tela que o professor vê ao logar. Condensa a saúde operacional da academia em segundos no celular.

**Independent Test**: Fazer login e visualizar os cards de indicadores com dados calculados dinamicamente para a academia atual, com formatação monetária correta e atualização em tempo real.

**Acceptance Scenarios**:

1. **Given** professor autenticado acessa o sistema, **When** a página do Dashboard carrega, **Then** visualiza os cards de métricas principais: Alunos Ativos, Mensalidades em Atraso (quantidade e valor), Arrecadado no Mês e Modalidades Ativas.
2. **Given** academia recém-criada sem movimentações financeiras, **When** o gestor acessa o dashboard, **Then** o sistema exibe valores zerados acompanhados de uma orientação inicial clara para dar o primeiro passo (ex.: "Cadastre seus primeiros alunos para ver métricas aqui").
3. **Given** alteração cadastral ou financeira, **When** o usuário atualiza o dashboard, **Then** os números refletem com exatidão o estado atual das tabelas vinculadas à sua `academia_id`.

---

### User Story 2 - Ações Rápidas do Dia a Dia (Priority: P1)

Como professor no smartphone entre uma aula e outra, quero ter botões de ações rápidas no topo do dashboard (Registrar Pagamento, Cadastrar Aluno, Lembrete WhatsApp e Perfil da Academia), para executar tarefas recorrentes com apenas 1 toque na tela sem precisar navegar por menus profundos.

**Why this priority**: O uso prioritário do sistema ocorre no celular durante o dia a dia do tatame. As ações mais frequentes devem estar acessíveis de forma imediata.

**Independent Test**: Clicar em cada botão de ação rápida e verificar se o modal ou direcionamento correto é acionado imediatamente sem bloqueios ou recarregamento lento.

**Acceptance Scenarios**:

1. **Given** professor visualizando o Dashboard no celular, **When** toca em "Registrar Pagamento" ou "Cadastrar Aluno", **Then** é direcionado para a respectiva tela ou fluxo de registro.
2. **Given** professor toca em "Configurar Academia", **When** a ação é disparada, **Then** a tela de perfil da academia é aberta.
3. **Given** toque em botão de ação rápida em resolução móvel (360px a 414px), **When** o usuário interage, **Then** o alvo de toque possui área ergonômica mínima de 44px com feedback tátil/visual imediato.

---

### User Story 3 - Navegação Unificada e Responsiva (Mobile Tab Bar & Desktop Sidebar) (Priority: P2)

Como usuário do TatamyHub, quero ter uma navegação fluida adaptada ao meu dispositivo — uma barra inferior fixa (Tab Bar) no smartphone e um menu lateral estruturado (Sidebar) no computador —, para alternar confortavelmente entre Dashboard, Alunos, Mensalidades e Configurações.

**Why this priority**: A navegação é a espinha dorsal de toda a experiência do usuário. O padrão mobile tab bar é natural para a pegada do polegar, enquanto a sidebar aproveita a largura do desktop.

**Independent Test**: Redimensionar a janela entre viewport móvel (< 768px) e desktop (>= 768px), conferindo a transição perfeita entre Tab Bar inferior fixa e Sidebar lateral sem quebra de layout ou sobreposição de conteúdo.

**Acceptance Scenarios**:

1. **Given** dispositivo com tela móvel (largura < 768px), **When** o usuário navega pelo painel, **Then** a barra inferior (Tab Bar) fixa permanece visível com itens essenciais: Início/Dashboard, Alunos, Mensalidades e Configurações, destacando a rota ativa.
2. **Given** dispositivo com tela desktop (largura >= 768px), **When** o painel é exibido, **Then** o menu lateral (Sidebar) aparece à esquerda com identidade da academia, links organizados e botão de Logout.
3. **Given** navegação no smartphone, **When** o usuário rola o conteúdo até o final, **Then** o rodapé do conteúdo possui espaçamento de resguardo para não ser encoberto pela Tab Bar fixa.

---

### Edge Cases

- **Academia sem dados cadastrados**: Não quebrar a página com erros `NaN` ou `null`; exibir `R$ 0,00` e estados amigáveis de orientação.
- **Falha temporária de rede ao consultar métricas**: Apresentar botão de "Tentar Novamente" sem deslogar o usuário.
- **Nomes longos de academia na Sidebar/Header**: Tratar quebra de texto com reticências (`text-overflow: ellipsis`) para manter alinhamento estético.
- **Dispositivos com entalhe ou barra de navegação virtual (iOS Safe Area)**: A Tab Bar deve respeitar `env(safe-area-inset-bottom)` para não colidir com o botão home do iPhone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma tela de Dashboard como página inicial padrão após o login (`/dashboard` ou rota principal logada).
- **FR-002**: O sistema DEVE exibir cards de métricas gerais:
  - Total de Alunos Ativos na academia.
  - Mensalidades Pendentes / Atrasadas (contagem e somatório de valores).
  - Total Arrecadado no Mês corrente (soma de pagamentos confirmados).
  - Quantidade de Modalidades Ativas ofertadas.
- **FR-003**: O sistema DEVE disponibilizar uma seção de Ações Rápidas (Quick Actions) no Dashboard com botões diretos para fluxos operacionais (Registrar Pagamento, Cadastrar Aluno, Enviar Cobrança e Configurações).
- **FR-004**: O sistema DEVE exibir uma lista de atividades recentes ou alertas operacionais prioritários (ex.: mensalidades com vencimento iminente ou alunos aguardando confirmação).
- **FR-005**: O sistema DEVE calcular todas as métricas no backend isolando estritamente os registros pelo identificador `academia_id` do gestor autenticado.
- **FR-006**: O sistema DEVE implementar navegação **Mobile Tab Bar** fixa no rodapé em telas móveis (< 768px), com ícones e rótulos legíveis para: Início, Alunos, Mensalidades e Configurações.
- **FR-007**: O sistema DEVE implementar navegação **Sidebar Lateral** em telas desktop (>= 768px), contendo cabeçalho com logotipo/avatar da academia, links de navegação com estado ativo destacado e botão de Logout.
- **FR-008**: O sistema DEVE adotar design estritamente **Mobile-First**, garantindo alvos de toque mínimos de 44px e tipografia legível em telas a partir de 360px de largura.

### Key Entities *(include if feature involves data)*

- **DashboardMetrics**: Objeto de agregação de dados contendo:
  - `total_alunos_ativos`: número inteiro de alunos ativos.
  - `mensalidades_atrasadas_qtd`: contagem de mensalidades com vencimento ultrapassado e saldo pendente.
  - `mensalidades_atrasadas_valor`: valor monetário acumulado em atraso.
  - `arrecadado_mes_valor`: valor total recebido no mês de referência.
  - `modalidades_ativas_qtd`: quantidade de modalidades em status 'ativa'.
  - `proximos_vencimentos`: listagem resumida dos próximos vencimentos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O carregamento e renderização completa do Dashboard ocorre em menos de 400ms em conexões estáveis.
- **SC-002**: 100% das métricas apresentadas refletem exclusivamente os dados da academia vinculada ao usuário autenticado (`academia_id`).
- **SC-003**: 100% dos botões de ação rápida e itens da Tab Bar possuem altura e área de clique de no mínimo 44px, atendendo às normas de ergonomia para telas sensíveis ao toque.
- **SC-004**: A transição responsiva entre Tab Bar (mobile) e Sidebar (desktop) funciona fluidamente sem quebras visuais em redimensionamentos de tela.

## Assumptions

- Enquanto os módulos completos de Alunos e Mensalidades não estiverem finalizados nos próximos ciclos, os botões correspondentes exibirão feedback visual claro de direcionamento ou modais orientadores, sem quebrar o sistema.
- O endpoint de métricas agrega dados existentes nas tabelas do banco e retorna valores coerentes mesmo em bases recém-inauguradas.
