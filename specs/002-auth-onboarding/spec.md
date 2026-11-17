# Feature Specification: Autenticação, Landing Inicial e Onboarding

**Feature Branch**: `002-auth-onboarding`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "implemente o login, tela inicial do com o objetivo do sass com login, se não houver conta -> criar conta, preencher dados, modalidade cirar conta e redirecionar para o login"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Landing Page Institucional do SaaS (Priority: P1)

Como professor de Jiu-Jitsu ou visitante sem sessão ativa, quero acessar a tela inicial da aplicação e entender claramente a proposta de valor do TatamyHub (controle financeiro simples, combate à inadimplência e gestão de alunos), tendo caminhos imediatos para "Entrar" ou "Criar Conta".

**Why this priority**: É a porta de entrada pública do produto e o cartão de visitas para apresentação do SaaS e recepção dos usuários.

**Independent Test**: Acessar a rota raiz (`/`) em modo anônimo, verificar a apresentação dos benefícios do sistema, os botões de ação e testar o redirecionamento correto para Login e Cadastro.

**Acceptance Scenarios**:

1. **Given** visitante não autenticado acessa a aplicação, **When** carrega a página inicial, **Then** visualiza a apresentação clara da proposta de valor do TatamyHub e botões destacados para "Entrar" e "Criar Conta".
2. **Given** visitante na página inicial, **When** clica em "Entrar", **Then** é direcionado para a tela de Login (`/login`).
3. **Given** visitante na página inicial, **When** clica em "Criar Conta", **Then** é direcionado para o formulário de cadastro e onboarding (`/cadastro`).

---

### User Story 2 - Cadastro de Conta e Onboarding da Academia (Priority: P1)

Como novo professor ou gestor de academia, quero realizar meu cadastro preenchendo meus dados pessoais de acesso (nome, e-mail, senha) e os dados fundamentais da minha academia (nome da academia, WhatsApp de contato e modalidade esportiva inicial), para que minha academia seja criada e eu seja redirecionado para a tela de login pronto para acessar.

**Why this priority**: É o motor de conversão e entrada de novas academias no ecossistema da aplicação, configurando a base multi-tenant necessária.

**Independent Test**: Preencher o formulário de cadastro com dados válidos, submeter a criação, verificar se o usuário e a academia são gerados com senha criptografada e constatar o redirecionamento para o Login com alerta de sucesso.

**Acceptance Scenarios**:

1. **Given** novo professor no formulário de cadastro, **When** informa nome, e-mail válido, senha segura (mínimo 6 caracteres), nome da academia, WhatsApp e modalidade (ex.: "Jiu-Jitsu") e clica em "Criar Minha Conta", **Then** o sistema registra o gestor, cria a academia com a modalidade vinculada, exibe notificação de sucesso e redireciona para `/login` com o e-mail pré-preenchido.
2. **Given** novo usuário tentando cadastrar um e-mail já existente no banco de dados, **When** submete o formulário, **Then** o sistema bloqueia a criação e informa claramente que o e-mail já está em uso.
3. **Given** formulário com senha inferior a 6 caracteres ou campos obrigatórios ausentes, **When** submetido, **Then** o sistema exibe mensagens de orientação e impede o envio de dados inconsistentes.

---

### User Story 3 - Autenticação, Login e Logout (Priority: P1)

Como gestor já cadastrado, quero informar meu e-mail e senha para me autenticar no sistema, receber acesso seguro e ser direcionado para o painel da minha academia, além de poder encerrar a sessão quando desejar.

**Why this priority**: Garante o controle de acesso e a segurança das informações institucionais e financeiras da academia.

**Independent Test**: Digitar credenciais válidas na tela de login, confirmar o acesso, constatar o direcionamento para o painel logado da academia e testar o encerramento da sessão via botão "Sair".

**Acceptance Scenarios**:

1. **Given** usuário cadastrado na tela de Login, **When** digita e-mail e senha corretos e clica em "Entrar", **Then** o sistema autentica as credenciais, armazena o token/sessão segura e direciona para o painel da academia.
2. **Given** usuário informa e-mail inexistente ou senha incorreta, **When** clica em "Entrar", **Then** o sistema exibe feedback de credenciais inválidas mantendo os campos protegidos.
3. **Given** usuário logado no painel, **When** clica na opção "Sair", **Then** o sistema limpa a autenticação e redireciona para a tela de Login.

---

### Edge Cases

- **Usuário já autenticado acessando Landing ou Login**: Se o usuário já tiver uma sessão válida ativa no navegador e abrir `/`, `/login` ou `/cadastro`, o sistema deve redirecioná-lo automaticamente para o painel logado.
- **Visitante tentando acessar rotas protegidas**: Qualquer tentativa de acessar `/configuracoes/*` sem autenticação válida deve ser interceptada e direcionada para a tela de login.
- **Normalização de e-mails**: E-mails informados com letras maiúsculas ou espaços acidentais devem ser convertidos para minúsculas e sanitizados (`trim`).
- **Modalidade inicial não informada**: Caso o campo de modalidade fique em branco durante o onboarding, o sistema deve adotar "Jiu-Jitsu" como padrão de forma transparente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma tela inicial pública (Landing Page) que explique os objetivos da plataforma SaaS (gestão simplificada de mensalidades e alunos para academias de artes marciais) e contenha botões para "Entrar" e "Criar Conta".
- **FR-002**: O sistema DEVE fornecer um formulário de cadastro (Onboarding) coletando:
  - Dados do Gestor: Nome Completo, E-mail, Senha (mínimo 6 caracteres) e Confirmação de Senha.
  - Dados da Academia: Nome da Academia, WhatsApp de Contato e Modalidade Esportiva Inicial.
- **FR-003**: O sistema DEVE validar no backend a obrigatoriedade dos campos essenciais e a unicidade do e-mail de acesso.
- **FR-004**: O sistema DEVE criptografar a senha do usuário utilizando algoritmo hash robusto (bcrypt com salt) antes de gravá-la no banco de dados.
- **FR-005**: O sistema DEVE persistir o usuário associado diretamente à sua `academia_id`, garantindo o isolamento lógico exigido pela Constituição.
- **FR-006**: Ao concluir o cadastro com sucesso, o sistema DEVE redirecionar o usuário para a tela de Login (`/login`) exibindo mensagem amigável de confirmação.
- **FR-007**: O sistema DEVE fornecer tela de Login para autenticação por e-mail e senha, gerando token JWT de autenticação para as requisições subsequentes.
- **FR-008**: O sistema DEVE proteger as rotas da API e da interface administrativa através de middleware de autenticação, rejeitando acessos não autorizados com status HTTP 401.
- **FR-009**: O sistema DEVE disponibilizar botão de Logout na navegação do aplicativo para encerramento voluntário da sessão.
- **FR-010**: O sistema DEVE tratar falhas de autenticação de forma orientadora, sem revelar se o erro foi no e-mail ou na senha (prevenção de enumeração de contas).

### Key Entities *(include if feature involves data)*

- **Usuario**: Representa o operador ou gestor da conta. Contém identificador único (`id`), vínculo com a academia (`academia_id`), nome completo, e-mail de acesso (único), senha criptografada (`senha_hash`), perfil de permissão (`role` = 'admin'), datas de criação e atualização.
- **Academia**: Entidade raiz da instituição (já existente), criada em conjunto no momento do onboarding.
- **Modalidade**: Modalidade esportiva inicial vinculada à academia (já existente), criada no mesmo fluxo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um novo professor conclui todo o fluxo de apresentação, preenchimento do cadastro e retorno ao login em menos de 2 minutos.
- **SC-002**: 100% das senhas são armazenadas de forma segura e criptografada (bcrypt), com zero armazenamento de senhas em texto puro.
- **SC-003**: O login com credenciais válidas autentica e redireciona o usuário para o painel em menos de 1 segundo.
- **SC-004**: As páginas de Landing, Login e Cadastro são 100% utilizáveis em smartphones com largura a partir de 360px.
- **SC-005**: 100% das rotas protegidas rejeitam requisições sem autenticação com código HTTP 401.

## Assumptions

- O primeiro usuário cadastrado durante o onboarding assume automaticamente o papel de administrador da sua respectiva academia.
- A autenticação adota tokens JWT armazenados com segurança no cliente (LocalStorage/State) para o MVP.
- O e-mail informado no cadastro é único em todo o sistema.
