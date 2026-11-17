# Feature Specification: Gestão de Alunos e Graduações

**Feature Branch**: `004-gestao-alunos-graduacoes`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "implemente a gestõa de alunos e graduações"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro Rápido e Listagem de Alunos (Priority: P1) 🎯 MVP

Como professor ou gestor da academia de artes marciais, quero cadastrar rapidamente novos alunos pelo meu smartphone e visualizar a lista completa de matriculados com filtros rápidos por modalidade e status, para que eu tenha o controle ágil de quem treina no tatame e possa entrar em contato direto via WhatsApp.

**Why this priority**: O cadastro de alunos é a espinha dorsal de todo o sistema da academia. Sem alunos cadastrados, não há controle de frequência, evolução de faixas nem cobrança de mensalidades.

**Independent Test**: Pode ser testado de ponta a ponta criando um novo aluno com nome, WhatsApp, data de nascimento e modalidade, conferindo sua exibição imediata na lista de alunos com status "Ativo" e atalho funcional para WhatsApp.

**Acceptance Scenarios**:

1. **Given** que o professor está autenticado na academia, **When** ele acessa a tela de alunos (`/alunos`) e toca em "Novo Aluno", preenche os campos obrigatórios (nome, WhatsApp, modalidade e data de matrícula) e confirma, **Then** o aluno é cadastrado com sucesso com status "Ativo" e passa a constar na listagem.
2. **Given** uma lista de alunos cadastrados, **When** o professor digita parte do nome no campo de busca ou seleciona o filtro de uma modalidade específica, **Then** a lista filtra instantaneamente exibindo apenas os alunos correspondentes.
3. **Given** um aluno com telefone cadastrado exibido na listagem ou na ficha, **When** o professor toca no ícone de WhatsApp, **Then** o aplicativo abre diretamente o chat do WhatsApp com o número formatado.

---

### User Story 2 - Registro e Evolução de Graduações e Faixas (Priority: P1)

Como professor, quero registrar a faixa e os graus atuais do aluno em sua modalidade, além de registrar cerimônias de troca de faixa ou entrega de graus no histórico, para que a jornada marcial do aluno seja documentada com precisão e transparência.

**Why this priority**: A graduação (faixas e graus) é o elemento central de valor e retenção em academias de artes marciais. O professor precisa saber o nível técnico de cada aluno para planejar treinos e exames de graduação.

**Independent Test**: Pode ser testado abrindo o perfil de um aluno matriculado em Jiu-Jitsu (ex: Faixa Branca com 2 graus), acionando a ação "Graduar Aluno" para promover a Faixa Azul com data e observação, e verificando a atualização do card do aluno e a entrada cronológica no histórico de graduações.

**Acceptance Scenarios**:

1. **Given** o cadastro inicial de um aluno com modalidade vinculada, **When** o professor informa a faixa e grau iniciais, **Then** a graduação atual é exibida com um badge visual colorido e identificação do grau.
2. **Given** um aluno existente, **When** o professor acessa a ficha do aluno e aciona "Registrar Nova Graduação", escolhendo a nova faixa/grau, data da promoção e observação opcional, **Then** a graduação atual do aluno é atualizada e um novo registro imutável é inserido na linha do tempo de graduações.
3. **Given** um aluno praticante de mais de uma modalidade (ex: Jiu-Jitsu e Muay Thai), **When** o professor visualiza a área de graduações, **Then** cada modalidade exibe sua própria graduação e histórico independente.

---

### User Story 3 - Ficha Completa, Edição e Desativação do Aluno (Priority: P2)

Como gestor da academia, quero acessar a ficha detalhada do aluno com observações médicas e contatos, editar dados cadastrais quando necessário e inativar alunos que trancaram a matrícula, para que os dados permaneçam organizados sem perda de histórico.

**Why this priority**: Permite a manutenção contínua do cadastro, anotações de restrições de saúde importantes para a segurança no tatame e gestão correta de alunos afastados.

**Independent Test**: Pode ser testado editando o telefone de um aluno, adicionando uma observação médica (ex: "Cirurgia no joelho esquerdo"), alterando o status para "Inativo" e confirmando que o Dashboard atualiza a contagem de alunos ativos sem excluir o histórico do aluno.

**Acceptance Scenarios**:

1. **Given** um aluno com restrições de saúde, **When** o professor visualiza sua ficha, **Then** as observações médicas são destacadas com alerta visual para fácil consulta pelo instrutor antes da aula.
2. **Given** um aluno que solicitou cancelamento ou trancamento, **When** o professor altera seu status para "Inativo", **Then** o aluno deixa de aparecer na lista padrão de alunos ativos e a contagem de "Alunos Ativos" no Dashboard diminui em 1.
3. **Given** um aluno inativo, **When** o professor ativa o filtro "Mostrar Inativos" e reativa a matrícula, **Then** o aluno volta ao status "Ativo" com todo o seu histórico de graduações preservado.

---

### Edge Cases

- **Aluno sem telefone informado**: O sistema permite cadastro sem telefone como campo opcional, mas oculta o botão de atalho do WhatsApp e exibe aviso informativo no card.
- **Aluno com nome duplicado**: A academia pode ter alunos homônimos (ex: dois "Lucas Silva"); o sistema diferencia pelo identificador e exibe dados adicionais na listagem (ex: modalidade ou faixa) para evitar confusão.
- **Exclusão de modalidade vinculada a alunos**: Se uma modalidade já possui alunos vinculados, ela não pode ser excluída fisicamente sem antes reatribuir ou alertar o usuário.
- **Formatação de telefone com DDD**: O campo de telefone aceita formatos variados digitados pelo usuário (ex: `(11) 99999-8888` ou `11999998888`) e o sistema sanitiza para o formato padrão do WhatsApp internacional (`55 + DDD + número`).
- **Validação de datas futuras**: A data de matrícula e de graduação não devem aceitar datas no futuro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir o cadastro de alunos vinculados estritamente à `academia_id` do usuário logado, contendo os campos: Nome completo (obrigatório), Telefone/WhatsApp (opcional), Data de Nascimento (opcional), Data de Matrícula (obrigatória, padrão data atual), Observações Médicas / Restrições (opcional) e Status (Ativo/Inativo, padrão Ativo).
- **FR-002**: O sistema DEVE permitir vincular o aluno a uma ou mais modalidades ativas cadastradas na academia.
- **FR-003**: O sistema DEVE permitir definir a graduação inicial do aluno para cada modalidade vinculada (faixa, número de graus e data de início).
- **FR-004**: O sistema DEVE registrar cada promoção ou ajuste de faixa/grau em um histórico de graduações com data do evento, faixa, grau, observações e identificação de quem realizou a promoção.
- **FR-005**: O sistema DEVE apresentar a listagem de alunos com busca textual em tempo real por nome e filtros rápidos por modalidade e por status (Todos / Ativos / Inativos).
- **FR-006**: Cada item na lista de alunos DEVE apresentar layout tátil mobile-first (alvos mínimos de 44px) exibindo: avatar com iniciais do nome, nome do aluno, modalidade principal, badge com a cor da faixa atual e botão de atalho para contato via WhatsApp (quando telefone estiver preenchido).
- **FR-007**: O sistema DEVE fornecer uma tela/modal de visualização detalhada da ficha do aluno, exibindo: dados de contato, dados cadastrais, observações de saúde, graduação atual por modalidade e a linha do tempo cronológica de graduações.
- **FR-008**: O sistema DEVE permitir editar os dados cadastrais do aluno e alternar seu status entre "Ativo" e "Inativo" (soft delete), proibindo a exclusão destrutiva para proteger a integridade do histórico financeiro e técnico.
- **FR-009**: A métrica de "Alunos Ativos" no Dashboard (`/api/dashboard/metrics`) DEVE ser atualizada automaticamente para refletir a contagem exata de alunos com status ativo da academia autenticada.

### Key Entities

- **Aluno**: Entidade principal que representa o praticante na academia. Atributos: `id`, `academia_id`, `nome`, `telefone`, `data_nascimento`, `data_matricula`, `observacoes_medicas`, `status` (`ativo`, `inativo`), `created_at`, `updated_at`.
- **AlunoModalidade**: Relação entre o aluno e as modalidades que ele pratica. Atributos: `id`, `aluno_id`, `modalidade_id`, `data_inicio`, `created_at`.
- **GraduacaoHistorico**: Linha do tempo da evolução marcial do aluno. Atributos: `id`, `aluno_id`, `modalidade_id`, `faixa`, `graus`, `data_graduacao`, `observacao`, `promovido_por_usuario_id`, `created_at`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue concluir o cadastro de um novo aluno com modalidade e faixa inicial em menos de 40 segundos utilizando apenas o smartphone.
- **SC-002**: A busca em tempo real e os filtros de modalidade e status na lista de alunos respondem em menos de 150ms na interface.
- **SC-003**: 100% das promoções de faixa ou grau geram registro histórico imutável consultável a qualquer momento.
- **SC-004**: O atalho de WhatsApp inicia a conversa no WhatsApp Web ou App nativo com 1 único toque sem erros de formato.
- **SC-005**: A inativação de um aluno reflete instantaneamente nas métricas do Dashboard (decremento do contador de alunos ativos) sem remover histórico ou lançamentos.

## Assumptions

- O formato dos nomes das faixas é textual e flexível para acomodar qualquer arte marcial (Jiu-Jitsu, Judô, Muay Thai, Karate, Boxe, etc.), com sugestões inteligentes para as faixas mais comuns.
- O campo de graus suporta números inteiros de 0 a 4 (padrão de faixas de BJJ e artes correlatas) ou 0 para modalidades sem sistema de graus.
- A exclusão de alunos é sempre lógica (status = 'inativo'), garantindo que histórico de cobranças e graduações nunca fiquem órfãos ou inconsistentes.
- O upload de foto do aluno não é obrigatório no MVP; a interface gera avatares elegantes com iniciais e gradiente visual baseado no nome.
