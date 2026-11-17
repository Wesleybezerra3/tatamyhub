# Feature Specification: Cadastro e Perfil da Academia

**Feature Branch**: `001-cadastro-academia`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "cadastro de academias, nome, localização, contatos, logo modalide/modalidades"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Edição dos Dados Institucionais (Priority: P1)

Como professor ou administrador da academia, quero cadastrar e atualizar as informações essenciais da academia (nome, localização completa e contatos), para que a instituição esteja devidamente identificada no sistema e os alunos tenham acesso a informações claras de contato.

**Why this priority**: É a identidade raiz do sistema. Todas as entidades futuras (alunos, turmas, mensalidades) dependem da existência e caracterização da academia.

**Independent Test**: Pode ser testado de ponta a ponta acessando a tela de perfil da academia, preenchendo os dados institucionais (nome, endereço e contatos), salvando e verificando se os dados persistem e são exibidos com precisão na tela de resumo.

**Acceptance Scenarios**:

1. **Given** que o administrador está na tela de configuração da academia, **When** preenche o nome da academia, endereço completo (rua, número, bairro, cidade, UF, CEP) e canais de contato (telefone, WhatsApp, e-mail) e clica em "Salvar", **Then** o sistema grava os dados com sucesso e exibe mensagem de confirmação.
2. **Given** que a academia já possui dados cadastrados, **When** o administrador altera o telefone ou endereço e confirma, **Then** as novas informações são atualizadas imediatamente e mantidas no sistema.
3. **Given** que o administrador deixa o campo "Nome da Academia" em branco, **When** tenta salvar, **Then** o sistema bloqueia o envio e destaca visualmente o campo obrigatório com mensagem amigável.

---

### User Story 2 - Gestão das Modalidades Oferecidas (Priority: P2)

Como administrador da academia, quero cadastrar, listar e gerenciar as modalidades esportivas praticadas (ex.: Jiu-Jitsu, No-Gi, Muay Thai, Judô), para que possamos organizar os alunos e seus respectivos planos esportivos.

**Why this priority**: A academia pode oferecer mais de uma modalidade esportiva ou subdivisões de artes marciais; essa categorização é pré-requisito para as futuras fichas de alunos e mensalidades.

**Independent Test**: Pode ser testado adicionando uma nova modalidade (ex.: "Jiu-Jitsu Adulto"), editando seu nome para "Jiu-Jitsu Gi" e desativando uma modalidade não mais ofertada, conferindo a listagem atualizada.

**Acceptance Scenarios**:

1. **Given** que o administrador está na seção de modalidades da academia, **When** digita o nome de uma nova modalidade (ex.: "Muay Thai") e clica em "Adicionar", **Then** a modalidade aparece imediatamente na listagem de modalidades ativas da academia.
2. **Given** uma modalidade existente na listagem, **When** o administrador altera seu nome ou alterna seu estado para inativa, **Then** o sistema confirma a alteração e atualiza o estado da lista.
3. **Given** que o administrador tenta adicionar uma modalidade com nome em branco ou repetido, **When** submete a inclusão, **Then** o sistema alerta sobre a duplicidade ou obrigatoriedade do nome sem gerar inconsistências.

---

### User Story 3 - Upload e Visualização do Logotipo (Priority: P3)

Como administrador, quero carregar a imagem do logotipo da academia, para que a aplicação tenha a identidade visual da escola no cabeçalho e em futuras comunicações com alunos.

**Why this priority**: Complementa a personalização visual da academia e consolida a marca no uso diário do professor e visualização mobile.

**Independent Test**: Pode ser testado selecionando um arquivo de imagem válido (PNG ou JPEG), enviando para o sistema e conferindo se a pré-visualização e a imagem do perfil são renderizadas corretamente.

**Acceptance Scenarios**:

1. **Given** que o administrador está na tela de perfil, **When** seleciona um arquivo de imagem válido (PNG/JPEG/WebP até 2MB) como logotipo e confirma, **Then** o sistema processa a imagem e exibe o logotipo atualizado no perfil.
2. **Given** que o administrador seleciona um arquivo com formato inválido (ex.: PDF ou executável) ou tamanho excessivo, **When** tenta fazer upload, **Then** o sistema rejeita a operação e orienta o usuário sobre formatos aceitos e limite de tamanho.
3. **Given** que a academia já possui um logotipo, **When** o administrador escolhe remover ou substituir o arquivo, **Then** o sistema executa a troca com confirmação visual.

---

### Edge Cases

- **Queda de conexão durante o salvamento**: O sistema deve manter os dados digitados no formulário intactos e permitir reenvio sem perda de digitação pelo usuário.
- **Caracteres especiais ou nomes longos**: Campos de texto (nome da academia, endereço) devem tratar adequadamente caracteres com acentos, pontuações e limitar tamanhos extremos para não quebrar o layout mobile.
- **Tentativa de desativar modalidade em uso**: O sistema deve alertar o usuário de forma clara caso uma modalidade esteja sendo desativada, impedindo perdas cadastrais involuntárias.
- **Ausência de logotipo**: Quando a academia não cadastrar logotipo, o sistema deve apresentar um placeholder visual elegante (ex.: iniciais do nome da academia ou ícone padrão neutro).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a criação e manutenção dos dados cadastrais da academia, incluindo Nome da Academia, documento identificador (opcional), endereço completo e canais de contato.
- **FR-002**: O sistema DEVE validar a obrigatoriedade do Nome da Academia e de pelo menos um meio de comunicação direto (telefone ou WhatsApp).
- **FR-003**: O sistema DEVE permitir o envio, atualização e remoção de arquivo de logotipo da academia nos formatos PNG, JPEG e WebP com tamanho máximo configurado (ex.: até 2MB).
- **FR-004**: O sistema DEVE apresentar um elemento visual substituto (placeholder/avatar) caso a academia não possua imagem de logotipo configurada.
- **FR-005**: O sistema DEVE permitir cadastrar múltiplas modalidades esportivas para a academia, contendo nome e status (ativa/inativa).
- **FR-006**: O sistema DEVE permitir a listagem, edição de nomenclatura e alteração de status de ativação das modalidades cadastradas.
- **FR-007**: O sistema DEVE validar unicidade de nomes de modalidades dentro do escopo da mesma academia para evitar duplicidades acidentais.
- **FR-008**: O sistema DEVE vincular todos os dados institucionais e modalidades ao identificador único da academia (`academia_id`), garantindo o isolamento lógico exigido pela governança.
- **FR-009**: O sistema DEVE validar todas as entradas no backend e fornecer mensagens de feedback e erro claras e contextualizadas ao usuário.

### Key Entities *(include if feature involves data)*

- **Academia**: Entidade institucional raiz. Armazena identificador único (`academia_id`), nome da academia, documento fiscal/identificador (opcional), endereço completo (logradouro, número, complemento, bairro, cidade, UF, CEP), dados de contato (telefone principal, WhatsApp para cobrança, e-mail de contato), caminho/referência do logotipo e carimbos de data/hora (`created_at`, `updated_at`).
- **Modalidade**: Entidade que representa as modalidades esportivas praticadas na academia. Armazena identificador único da modalidade, vínculo com a academia (`academia_id`), nome descritivo da modalidade (ex.: "Jiu-Jitsu", "Submission / No-Gi", "Muay Thai"), status de ativação (`ativa`/`inativa`) e datas de criação/atualização.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O administrador consegue completar o preenchimento inicial dos dados da academia, logotipo e modalidades em menos de 3 minutos.
- **SC-002**: 100% das tentativas de salvamento com dados inválidos (campos obrigatórios vazios ou formato de arquivo indevido) são interceptadas com mensagens de orientação claras.
- **SC-003**: A interface reflete imediatamente as atualizações realizadas no perfil e modalidades após a confirmação, sem necessidade de recarregar a página.
- **SC-004**: O fluxo completo de visualização e edição é 100% operacional em navegadores de smartphones com largura de tela a partir de 360px.
- **SC-005**: A troca ou remoção do logotipo é refletida visualmente no aplicativo em menos de 2 segundos sob conexão estável.

## Assumptions

- O MVP gerencia uma academia por instância, mas respeita a modelagem relacional com `academia_id` para suporte nativo a futura escalabilidade multi-tenant.
- A modalidade "Jiu-Jitsu" é fornecida como sugestão padrão no primeiro acesso, agilizando o cadastro para academias de artes marciais.
- O upload de logotipo armazena o arquivo de forma segura e padronizada em armazenamento de arquivos do servidor no escopo do MVP.
- O acesso ao gerenciamento do perfil e das modalidades é restrito a perfis com privilégio administrativo ou professor responsável.
