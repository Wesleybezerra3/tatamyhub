# Research: Gestão Financeira e Mensalidades

**Feature Branch**: `005-gestao-financeira-mensalidades`  
**Date**: 2026-11-16  
**Status**: Concluído  

---

## 1. Contexto Operacional no Tatame

Em centros de treinamento e academias de artes marciais, a cobrança financeira é frequentemente fonte de atrito e constrangimento para o professor:
1. **Cobrança manual e desgastante**: O professor perde tempo redigindo mensagens individuais de cobrança para cada aluno em atraso.
2. **Pagamentos parciais informais**: Alunos que pagam parte da mensalidade em dinheiro na entrada da academia e prometem transferir o restante via PIX.
3. **Falta de visibilidade da inadimplência**: Dificuldade em saber na ponta dos dedos quem pagou o mês corrente e qual o valor total pendente de recebimento.
4. **Trabalho repetitivo de emissão**: Necessidade de criar boletos ou registros individuais aluno por aluno a cada início de mês.

---

## 2. Decisões Arquiteturais e Técnicas

### Decisão 1: Separação Estrita entre Fatura (Mensalidade) e Transação (Pagamento)
- **Princípio da Constituição**: Princípio V (Integridade Financeira e Preservação de Histórico).
- **Abordagem**:
  - `mensalidades`: Representa o título de dívida / obrigação de pagamento do aluno, contendo `valor` original, `valor_pago` acumulado, `data_vencimento`, `competencia` (MM/AAAA) e `status`.
  - `pagamentos`: Representa o evento financeiro efetivo, contendo `valor`, `forma_pagamento`, `data_pagamento` e vínculo com o usuário que registrou a baixa.
- **Benefício**: Permite pagamentos múltiplos/parciais, auditoria exata do caixa diário e histórico inalterável de recebimentos.

### Decisão 2: Máquina de Estados e Cálculo Consistente de Status
- **Estados da Mensalidade**:
  - `paga`: `valor_pago >= valor`.
  - `atrasada`: `valor_pago < valor` E `data_vencimento < CURDATE()` E `status != 'cancelada'`.
  - `pendente`: `valor_pago < valor` E `data_vencimento >= CURDATE()` E `status != 'cancelada'`.
  - `cancelada`: Cancelada administrativamente pelo gestor.
- **Regra de Atualização**: O backend atualiza automaticamente o status com base na data atual e saldo restante durante as consultas e ao registrar novos pagamentos.

### Decisão 3: Mecanismo de Cobrança Amigável via WhatsApp (1 Toque)
- **Tom de Comunicação**: Cortês, transparente e condizente com a disciplina e respeito das artes marciais (*"Oss, [Aluno]!"*).
- **Estrutura da Mensagem**:
  ```text
  Oss, Lucas! Passando para lembrar da sua mensalidade de Jiu-Jitsu (competência 11/2026) no valor de R$ 150,00, com vencimento em 10/11/2026.
  
  Chave PIX da academia: 12.345.678/0001-90
  
  Ao realizar a transferência, favor enviar o comprovante por aqui. Muito obrigado e bons treinos! 🥋
  ```
- **Implementação**: Geração de link padrão `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}` acionado diretamente do card da mensalidade em atraso.

### Decisão 4: Geração em Lote Idempotente
- **Contexto**: No início de cada mês, o gestor aciona a geração mensal das mensalidades para todos os alunos ativos da academia.
- **Idempotência**: A consulta faz um `LEFT JOIN` ou verifica a existência prévia de `(academia_id, aluno_id, competencia)`. Alunos que já possuírem fatura na mesma competência são ignorados, evitando cobranças duplicadas.
- **Transação Atômica**: Toda a geração é executada dentro de uma transação SQL única para evitar inconsistências em caso de falha.

### Decisão 5: Precisão Monetária no MySQL
- **Tipo de Dados**: `DECIMAL(10, 2)` obrigatório em todas as colunas financeiras (`valor`, `valor_pago`).
- **Validação no Backend**: Rejeição de valores negativos ou centavos malformados; formatação consistente em reais (`pt-BR`, `R$ 0,00`) no frontend.

---

## 3. Matriz de Formas de Pagamento

| Forma | Código | Descrição Operacional |
|-------|--------|-----------------------|
| PIX | `pix` | Transferência instantânea com chave ou QR Code |
| Dinheiro | `dinheiro` | Espécie recebida na recepção ou no tatame |
| Cartão de Crédito | `cartao_credito` | Maquininha física ou link de pagamento |
| Cartão de Débito | `cartao_debito` | Débito na maquininha |
| Outro | `outro` | Transferência bancária, permuta ou convênio |
