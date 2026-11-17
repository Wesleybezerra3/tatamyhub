# Feature Specification: Gestão Financeira e Mensalidades

**Feature Branch**: `005-gestao-financeira-mensalidades`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "implemente a gestão financeira e mensalidades"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visão de Mensalidades, Filtros de Inadimplência e Cobrança WhatsApp (Priority: P1) 🎯 MVP

Como professor ou gestor da academia, quero visualizar a lista de mensalidades organizadas por status (Atrasadas, Pendentes do Mês e Pagas), com busca rápida por aluno e um botão de ação rápida para enviar mensagem amigável de cobrança no WhatsApp com 1 toque, para que eu possa recuperar mensalidades em atraso sem constrangimento e sem perder tempo digitando mensagens repetitivas.

**Why this priority**: A inadimplência é o maior gargalo financeiro de academias de artes marciais. Identificar rapidamente quem está em atraso e acionar no WhatsApp reduz drasticamente o esquecimento dos alunos e garante o fluxo de caixa.

**Independent Test**: Pode ser testado acessando `/mensalidades`, filtrando pelas mensalidades com status "Atrasada", tocando no botão "Cobrar via WhatsApp" e verificando a abertura do chat do WhatsApp com a mensagem pré-formatada contendo o nome do aluno, valor devido, data de vencimento e chave PIX da academia.

**Acceptance Scenarios**:

1. **Given** mensalidades cadastradas no sistema, **When** o gestor acessa a tela `/mensalidades`, **Then** as mensalidades são exibidas em cards táteis com status colorido (Vermelho para Atrasadas, Amarelo para Pendentes, Verde para Pagas), valor total, valor restante e vencimento.
2. **Given** a listagem de mensalidades, **When** o gestor clica no filtro "Atrasadas", **Then** apenas as faturas com vencimento expirado e saldo em aberto são listadas, exibindo o montante total em atraso no topo.
3. **Given** uma mensalidade com status "Atrasada" de um aluno com telefone cadastrado, **When** o gestor clica no botão "Cobrar no WhatsApp", **Then** o sistema gera a URL oficial do WhatsApp (`https://wa.me/55...`) contendo o texto amigável de cobrança com os dados da fatura e chave PIX da academia cadastrada.

---

### User Story 2 - Baixa Rápida de Pagamento e Pagamento Parcial (Priority: P1) 🎯 MVP

Como professor ou recepcionista, quero registrar o pagamento de uma mensalidade de forma rápida e tátil pelo smartphone, escolhendo o método (PIX, Dinheiro, Cartão de Crédito ou Débito) e o valor recebido (integral ou parcial), para que o saldo seja liquidado imediatamente e o faturamento do mês seja atualizado no Dashboard.

**Why this priority**: A baixa de pagamento precisa ocorrer no momento em que o aluno entrega o dinheiro ou envia o comprovante de PIX na entrada do tatame. Se o fluxo for lento ou burocrático, o registro é postergado e surgem divergências no caixa.

**Independent Test**: Pode ser testado abrindo uma mensalidade pendente de R$ 150,00, acionando a ação "Registrar Pagamento", selecionando a forma de pagamento "PIX" e confirmando o valor integral; o status muda imediatamente para "Paga", o card fica verde e o Dashboard passa a contabilizar os R$ 150,00 no "Total Arrecadado no Mês".

**Acceptance Scenarios**:

1. **Given** uma mensalidade pendente ou atrasada, **When** o gestor clica em "Baixar / Registrar Pagamento", escolhe a forma de pagamento (PIX, Dinheiro, Cartão) e confirma o valor integral, **Then** o sistema registra o evento em `pagamentos`, atualiza `valor_pago = valor`, altera o status para "Paga" e exibe confirmação de sucesso.
2. **Given** uma mensalidade de R$ 200,00, **When** o gestor registra um pagamento parcial de R$ 100,00, **Then** a mensalidade passa a exibir `valor_pago = 100,00`, saldo devedor restante de R$ 100,00 e permanece como "Pendente" (ou "Atrasada" se vencida).
3. **Given** um pagamento registrado com sucesso, **When** o gestor acessa o Dashboard (`/dashboard`), **Then** o KPI "Arrecadado no Mês" reflete o novo valor instantaneamente.

---

### User Story 3 - Lançamento Avulso e Geração de Mensalidades do Mês (Priority: P2)

Como gestor da academia, quero emitir uma mensalidade avulsa para um aluno (ex: taxa de matrícula, exame de faixa ou mensalidade retroativa) e também poder gerar em lote as mensalidades de todos os alunos ativos daquele mês, para que a rotina administrativa mensal seja realizada em poucos segundos.

**Why this priority**: Permite que o professor não precise criar fatura por fatura manualmente no início de cada mês, automatizando o ciclo de cobrança recorrente para os alunos ativos.

**Independent Test**: Pode ser testado criando uma nova mensalidade avulsa para um aluno selecionado com vencimento para o dia 10 do mês seguinte, e testando o botão "Gerar Mensalidades do Mês" para emitir faturas de todos os alunos ativos que ainda não possuam fatura para a competência selecionada.

**Acceptance Scenarios**:

1. **Given** o gestor na tela de mensalidades, **When** ele clica em "Nova Mensalidade", seleciona um aluno, preenche o valor, data de vencimento e competência (mês/ano) e confirma, **Then** a fatura é criada com status "Pendente" e vinculada ao aluno.
2. **Given** o início de um novo mês com alunos ativos cadastrados, **When** o gestor clica em "Gerar Mensalidades do Mês", **Then** o sistema gera uma fatura para cada aluno ativo que ainda não tenha mensalidade naquela competência, evitando cobranças duplicadas.
3. **Given** uma mensalidade emitida incorretamente e sem pagamentos vinculados, **When** o gestor seleciona "Cancelar Mensalidade", **Then** a fatura recebe o status "Cancelada" e deixa de constar nas métricas de inadimplência.

---

### Edge Cases

- **Aluno sem telefone cadastrado**: O botão de WhatsApp é desabilitado ou exibe opção de copiar o texto de cobrança para envio por outros meios (e-mail/SMS).
- **Tentativa de pagar valor superior ao saldo**: O backend e frontend rejeitam valores de pagamento que superem o saldo devedor restante da fatura (`valor - valor_pago`).
- **Geração em lote para competência já existente**: A rotina de geração em lote ignora alunos que já possuem mensalidade ativa na mesma competência (`academia_id`, `aluno_id`, `competencia`), garantindo idempotência.
- **Fatura vencida hoje**: Faturas com data de vencimento igual ao dia atual são tratadas como "Pendentes" até o final do dia; apenas a partir do dia seguinte tornam-se "Atrasadas".
- **Academia sem chave PIX cadastrada**: O texto do template de cobrança via WhatsApp omite a linha de chave PIX caso o perfil da academia não possua a chave configurada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a criação de faturas de mensalidades associadas a um aluno e à `academia_id` autenticada, contendo: Aluno (obrigatório), Valor em reais (obrigatório, positivo), Data de Vencimento (obrigatória), Competência no formato MM/AAAA (obrigatória), Observações (opcional) e Status (`pendente`, `paga`, `atrasada`, `cancelada`).
- **FR-002**: O sistema DEVE disponibilizar uma listagem de mensalidades com busca por nome de aluno e filtros rápidos por status: Todas, Atrasadas, Pendentes do Mês e Pagas.
- **FR-003**: O card de mensalidade DEVE exibir layout tátil mobile-first (alvos mínimos de 44px) com: nome do aluno, modalidade/faixa, valor total, valor restante em aberto, data de vencimento, badge visual de status e botões de ação: "Registrar Pagamento" e "Cobrar no WhatsApp" (se houver débito em aberto).
- **FR-004**: O sistema DEVE registrar cada quitação financeira em uma entidade separada `pagamentos`, contendo: `mensalidade_id`, `academia_id`, `valor`, `forma_pagamento` (`pix`, `dinheiro`, `cartao_credito`, `cartao_debito`, `outro`), `data_pagamento` e `observacoes`.
- **FR-005**: Ao registrar um pagamento, o sistema DEVE atualizar atomicamente o `valor_pago` da mensalidade; se `valor_pago >= valor`, o status DEVE ser alterado para `paga`. Se `valor_pago < valor`, permanece como `pendente` (ou `atrasada` se vencida).
- **FR-006**: O sistema DEVE gerar um link de cobrança rápida para WhatsApp (`https://wa.me/55...`) contendo texto padronizado e amigável: nome do aluno, valor pendente, vencimento e chave PIX da academia (quando cadastrada no perfil da academia).
- **FR-007**: O sistema DEVE disponibilizar ação de "Geração em Lote" para a competência informada (ex: mês corrente), criando faturas com o valor padrão para todos os alunos ativos da academia que ainda não possuam mensalidade naquele mês.
- **FR-008**: O sistema DEVE permitir o cancelamento de uma mensalidade não paga (`status = 'cancelada'`), desconsiderando-a dos cálculos de inadimplência e preservando o registro de auditoria.
- **FR-009**: As métricas do Dashboard (`/api/dashboard/metrics`) DEVEM ser sincronizadas estritamente com os dados reais:
  - "Mensalidades em Atraso" = contagem e soma de `(valor - valor_pago)` de faturas com `status = 'atrasada'` e `data_vencimento < CURDATE()`.
  - "Total Arrecadado no Mês" = soma de `pagamentos.valor` com data no mês corrente.

### Key Entities

- **Mensalidade**: Fatura ou obrigação de pagamento do aluno. Atributos: `id`, `academia_id`, `aluno_id`, `valor`, `valor_pago`, `data_vencimento`, `competencia`, `status` (`pendente`, `paga`, `atrasada`, `cancelada`), `observacoes`, `created_at`, `updated_at`.
- **Pagamento**: Evento de transação e quitação financeira. Atributos: `id`, `mensalidade_id`, `academia_id`, `aluno_id`, `valor`, `forma_pagamento` (`pix`, `dinheiro`, `cartao_credito`, `cartao_debito`, `outro`), `data_pagamento`, `observacao`, `usuario_id`, `created_at`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O professor consegue dar baixa em uma mensalidade pelo smartphone com no máximo 3 toques na tela em menos de 10 segundos.
- **SC-002**: O atalho de cobrança via WhatsApp abre o aplicativo do WhatsApp com a mensagem preenchida com 1 único toque.
- **SC-003**: A geração em lote cria as mensalidades de até 300 alunos ativos em menos de 1 segundo sem duplicidades.
- **SC-004**: 100% dos pagamentos parciais mantêm o saldo remanescente exato e atualizam o Dashboard imediatamente.
- **SC-005**: Zero inconsistência de arredondamento financeiro utilizando tipos decimais de 2 casas (`DECIMAL(10, 2)`).

## Assumptions

- O valor padrão de mensalidade é de R$ 120,00 quando o aluno não possui valor customizado definido, podendo ser editado livremente na emissão.
- A chave PIX da academia é obtida do perfil da academia (`academias.documento` ou campo de contato/pix).
- Formas de pagamento suportadas no MVP: PIX, Dinheiro, Cartão de Crédito e Cartão de Débito.
- A exclusão física de faturas com pagamentos registrados é estritamente proibida pelo Princípio V da Constituição.
