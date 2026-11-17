# Feature Specification: Área e Hub do Aluno (Portal do Aluno)

**Feature Branch**: `006-area-do-aluno`

**Created**: 2026-11-17

**Status**: Ready for Planning

**Input**: User description: "Criar area do aluno, onde cada aluno poderá acessar terá seu hub com mensalidades, atual graduação, e terá avisos, de mensalidade perto do vencimento e atrasada, aviso no hub e notficação popup"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso e Autenticação no Portal do Aluno (Priority: P1)

Como um aluno matriculado na academia, quero acessar um portal próprio e seguro a partir do meu smartphone ou computador, para consultar minhas informações acadêmicas, marciais e financeiras sem depender de pedir ao professor a cada momento.

**Why this priority**: É a porta de entrada indispensável para qualquer autoatendimento do aluno. Sem um login dedicado para o perfil de aluno, ele não consegue acessar suas informações personalizadas nem seus avisos.

**Independent Test**: Pode ser testado de forma autônoma cadastrando um aluno com credenciais de acesso, realizando login na rota `/aluno/login` e verificando que a sessão do aluno é autenticada e direcionada ao Hub do Aluno com seus dados específicos.

**Acceptance Scenarios**:

1. **Given** que o aluno está cadastrado e ativo na academia, **When** ele informa seu identificador de acesso (telefone ou e-mail cadastrado) e sua senha válida na tela de login do aluno, **Then** o sistema autentica a sessão e o redireciona diretamente para o seu Hub do Aluno.
2. **Given** que um aluno insere credenciais incorretas ou inexistentes, **When** submete o formulário de login, **Then** o sistema exibe uma mensagem clara de erro ("Identificador ou senha incorretos") e não permite acesso ao Hub.
3. **Given** que um aluno está autenticado no portal, **When** ele clica no botão "Sair", **Then** a sessão do aluno é encerrada e ele é redirecionado para a tela de login inicial.

---

### User Story 2 - Hub do Aluno: Visão da Graduação Atual e Jornada Marcial (Priority: P1)

Como um aluno marcial, quero visualizar no meu Hub a minha graduação atual (faixa, cor oficial e graus) e o histórico de minhas promoções, para acompanhar minha evolução no tatame e sentir orgulho da minha trajetória.

**Why this priority**: A graduação marcial é o coração motivacional do praticante de artes marciais. Exibir a faixa visualmente com alta fidelidade valoriza a identidade do aluno e fortalece seu vínculo com a academia.

**Independent Test**: Pode ser testado atribuindo uma faixa com graus a um aluno no painel e verificando que, ao entrar no Hub, o componente visual exibe com exatidão a cor da faixa, os graus conquistados e a data da última promoção.

**Acceptance Scenarios**:

1. **Given** que o aluno possui uma graduação ativa em uma modalidade (ex.: Faixa Azul, 2 graus no Jiu-Jitsu), **When** ele acessa a tela principal do seu Hub, **Then** o sistema exibe o badge visual com as cores e graus oficiais da faixa, o nome da modalidade e a data da promoção.
2. **Given** que o aluno possui histórico de promoções anteriores (ex.: Faixa Branca com 4 graus -> Faixa Azul), **When** ele clica em "Ver Histórico de Graduações", **Then** o sistema exibe a linha do tempo cronológica com todas as graduações anteriores registradas.

---

### User Story 3 - Consulta de Mensalidades e Pagamento Facilitado (Priority: P1)

Como um aluno, quero visualizar minhas mensalidades (abertas, pagas e atrasadas) com seus respectivos valores, datas de vencimento e chave de pagamento PIX da academia, para manter minhas obrigações em dia com total transparência e praticidade.

**Why this priority**: É essencial para o controle financeiro do aluno e reduz drasticamente as dúvidas e cobranças repetitivas que o professor precisa realizar manualmente.

**Independent Test**: Pode ser testado gerando uma fatura para o aluno, acessando a aba financeira do portal e conferindo os dados de vencimento, valor e a cópia da chave PIX em 1 clique.

**Acceptance Scenarios**:

1. **Given** que o aluno possui faturas pendentes, **When** ele acessa a seção de mensalidades no Hub, **Then** o sistema exibe a lista de faturas com identificação clara do status (Pendente, Paga ou Atrasada), competência (ex.: 11/2026), valor monetário e data de vencimento.
2. **Given** que há uma fatura pendente ou atrasada, **When** o aluno clica na fatura, **Then** o sistema exibe os detalhes de pagamento com a chave PIX da academia e disponibiliza um botão "Copiar Chave PIX" com confirmação visual.
3. **Given** que uma mensalidade já foi liquidada pelo gestor, **When** o aluno a visualiza no histórico, **Then** ela é marcada como "Paga" com a data do pagamento e saldo devedor zerado.

---

### User Story 4 - Avisos Dinâmicos no Hub e Notificação Popup de Vencimento/Atraso (Priority: P2)

Como um aluno com obrigações financeiras, quero receber alertas visuais claros no topo do Hub e um aviso em popup caso tenha mensalidades vencidas ou próximas do vencimento, para que eu não esqueça de pagar e evite juros ou constrangimentos no tatame.

**Why this priority**: Garante que o aluno seja notificado imediatamente no momento em que entra no sistema, maximizando a taxa de pagamento pontual e eliminando o esquecimento.

**Independent Test**: Pode ser testado simulando um aluno com fatura que vence em 3 dias e outro com fatura atrasada há 2 dias, verificando a abertura automática do modal popup de alerta ao acessar o Hub e a presença do banner correspondente no topo da página.

**Acceptance Scenarios**:

1. **Given** que o aluno possui uma mensalidade atrasada (data de vencimento anterior à data atual e saldo pendente), **When** ele acessa o Hub, **Then** o sistema exibe um **popup de notificação urgente** alertando sobre a pendência com valor e dias de atraso, e exibe no topo do Hub um banner vermelho de status "Mensalidade Atrasada".
2. **Given** que o aluno possui uma mensalidade que vence nos próximos 5 dias (ou vence hoje), **When** ele acessa o Hub, **Then** o sistema exibe um **popup de lembrete amigável** alertando sobre o vencimento iminente, além de um banner amarelo/laranja no topo do Hub com botão de ação rápida para pagar.
3. **Given** que o aluno visualiza o popup de notificação, **When** ele clica em "Ver Fatura" ou "Fechar", **Then** o popup se fecha sem bloquear a navegação, permitindo que ele continue navegando no Hub.
4. **Given** que todas as mensalidades do aluno estão rigorosamente em dia e não há fatura vencendo nos próximos 5 dias, **When** o aluno entra no Hub, **Then** nenhum popup de cobrança é exibido e o banner do topo mostra um badge verde de "Tudo em dia com a academia".

---

### Edge Cases

- **Aluno sem nenhuma fatura gerada**: O Hub deve exibir uma mensagem acolhedora informando que o aluno está com a matrícula regular e nenhuma mensalidade pendente no momento.
- **Aluno com mais de uma mensalidade pendente/atrasada**: O popup e o banner do Hub devem priorizar a fatura mais antiga/urgente (maior tempo de atraso) e exibir o valor total consolidado pendente.
- **Aluno sem graduação cadastrada**: O Hub deve exibir a modalidade com a faixa inicial branca padrão ou um indicativo amigável de "Graduação em andamento".
- **Aluno com status inativo na academia**: Se o aluno for inativado pelo administrador, ao tentar realizar login no portal deve receber o aviso "Acesso desativado. Entre em contato com a secretaria da academia".
- **Dispensar notificação na sessão**: O popup não deve ser exibido repetidamente a cada clique ou troca de aba interna dentro da mesma sessão de uso, aparecendo novamente apenas em um novo login ou quando a data virar.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma tela de autenticação exclusiva para alunos (`/aluno/login`), separada da tela de acesso administrativo do gestor.
- **FR-002**: O sistema DEVE permitir que o aluno se autentique com seu identificador (telefone ou e-mail cadastrado na matrícula) e sua senha pessoal criptografada.
- **FR-003**: O sistema DEVE fornecer o Hub do Aluno (`/aluno/hub` ou `/aluno`) contendo:
  - Cabeçalho com nome do aluno, foto/avatar e dados da academia (nome e logo).
  - Card de Graduação Atual com visualização das faixas marciais oficiais e graus.
  - Seção de Mensalidades com faturas pendentes, atrasadas e histórico de pagamentos.
- **FR-004**: O sistema DEVE calcular e exibir no topo do Hub um banner de alerta baseado no estado financeiro do aluno:
  - **Crítico (Vermelho)**: Quando houver pelo menos uma fatura com status `atrasada` ou com data de vencimento vencida.
  - **Atenção (Amarelo/Laranja)**: Quando houver fatura pendente com vencimento em até 5 dias (incluindo o dia de hoje).
  - **Regular (Verde)**: Quando não houver nenhuma fatura vencida nem próxima do vencimento.
- **FR-005**: O sistema DEVE exibir um popup/modal de notificação ao carregar o Hub sempre que o aluno tiver fatura atrasada ou próxima do vencimento (<= 5 dias).
- **FR-006**: O popup de notificação DEVE conter o resumo da obrigação (competência, valor, data de vencimento, dias de atraso se aplicável), botão de ação direta para copiar chave PIX e botão para dispensar/fechar o aviso.
- **FR-007**: A fatura no portal do aluno DEVE exibir os dados para pagamento via PIX (chave PIX ou dados bancários configurados pela academia) com botão de cópia com 1 toque.
- **FR-008**: O aluno DEVE poder visualizar seu histórico completo de graduações e promoções em ordem cronológica.
- **FR-009**: O sistema NÃO DEVE permitir que um aluno visualize dados, faturas ou graduações de outros alunos ou de outras academias (isolamento rigoroso de perfil e tenant).
- **FR-010**: O gestor da academia DEVE poder definir ou redefinir a senha de acesso inicial do aluno na tela de cadastro/edição do aluno.

---

### Key Entities *(include if feature involves data)*

- **Aluno (Entity)**: Representa o praticante matriculado. Agora enriquecido com credenciais de acesso ao portal (`email` ou `telefone` para login, `senha_hash`, `primeiro_acesso`).
- **Graduação Histórico (Entity)**: Registros cronológicos de cada promoção de faixa e graus obtida pelo aluno na academia.
- **Mensalidade (Entity)**: Obrigações financeiras do aluno, contendo competência, data de vencimento, valor original, saldo pago e status (`pendente`, `paga`, `atrasada`, `cancelada`).
- **Aviso/Notificação do Aluno (Entity/Computed)**: Estado calculado em tempo de consulta que determina o nível de alerta do aluno (Atrasado, A vencer, Em dia) para alimentar o banner do Hub e o popup de entrada.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O aluno consegue acessar seu Hub e visualizar o status de sua graduação e mensalidade em menos de 3 segundos após o login.
- **SC-002**: 100% dos alunos com faturas atrasadas ou vencendo em até 5 dias visualizam o alerta popup imediatamente ao acessar a página inicial do Hub.
- **SC-003**: O aluno consegue copiar a chave PIX da academia para efetuar o pagamento com no máximo 2 toques na tela do celular.
- **SC-004**: Zero vazamento de dados entre alunos: nenhum aluno consegue acessar a URL ou os dados financeiros/graduações de outro praticante.
- **SC-005**: Redução estimada de até 70% nas mensagens de dúvidas de alunos para o professor perguntando "Professor, qual é a minha faixa?", "Quando vence minha mensalidade?" ou "Qual é a chave PIX?".

---

## Assumptions

- O portal do aluno é responsivo e otimizado para navegação mobile no smartphone (PWA), sem necessidade de download em loja de aplicativos.
- A chave PIX utilizada para exibição aos alunos é obtida dos dados cadastrados no perfil da academia (telefone/WhatsApp, e-mail ou documento).
- O primeiro acesso do aluno é facilitado com senha inicial gerada ou cadastrada pela academia (ex.: telefone ou data de nascimento) com opção de troca pelo próprio aluno.
- Notificações são exibidas nativamente dentro da interface web (banners no Hub e popups modais de entrada), sem necessidade de envio de SMS ou WhatsApp automatizado no escopo deste módulo.
