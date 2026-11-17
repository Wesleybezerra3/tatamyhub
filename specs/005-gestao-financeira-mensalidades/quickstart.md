# Quickstart & Guia de Homologação: Gestão Financeira e Mensalidades

**Feature**: `005-gestao-financeira-mensalidades` | **Data**: 2026-11-16  

Guia prático para validação da listagem de mensalidades, cobrança rápida via WhatsApp e quitação (baixa) de pagamentos.

---

## 1. Pré-Requisitos

- Servidor backend rodando em `http://localhost:3001` (ou via Docker Compose em `tatamyhub-backend`)
- Frontend rodando em `http://localhost:5173`
- Banco de dados MySQL com migrations executadas
- Pelo menos um aluno cadastrado no sistema

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Listagem de Mensalidades e Cobrança WhatsApp (1 Toque)
1. Acesse o sistema e navegue até a aba **Mensalidades** (`/mensalidades`).
2. Clique em **"Nova Mensalidade"**:
   - Selecione um aluno cadastrado (ex: *Carlos Gracie Silva*).
   - **Valor**: *R$ 150,00*
   - **Vencimento**: Data de 5 dias atrás (para simular mensalidade vencida).
   - **Competência**: Mês atual (ex: *11/2026*).
   - Salve a mensalidade.
3. **Verificação**:
   - A mensalidade surge na lista com a badge vermelha destacada: **Atrasada**.
   - O card exibe o saldo devedor de *R$ 150,00* e o botão verde com o ícone do **WhatsApp: "Cobrar no WhatsApp"**.
   - Ao tocar no botão de WhatsApp, uma nova aba abre o link pré-preenchido:
     `https://wa.me/55...` com mensagem personalizada contendo o nome do aluno, competência, valor e chave PIX da academia.
   - No Dashboard (`/dashboard`), o card **Em Atraso** reflete os *R$ 150,00* em vermelho suave.

---

### Cenário 2: Baixa Total de Pagamento e Atualização do Dashboard
1. No card da mensalidade em atraso, clique no botão **"Receber / Baixar"**.
2. No modal de pagamento:
   - **Forma de Pagamento**: Selecione *PIX*.
   - **Valor**: Confirme o valor total (*R$ 150,00*).
   - **Data do Pagamento**: Data atual.
3. Confirme o pagamento.
4. **Verificação**:
   - O status da fatura muda instantaneamente para **Paga** com badge verde.
   - O botão de cobrança de WhatsApp desaparece do card (pois não há mais débitos pendentes).
   - Ao navegar para o **Dashboard** (`/dashboard`):
     - O card **Em Atraso** diminui em R$ 150,00.
     - O card **Arrecadado no Mês** incrementa em R$ 150,00.

---

### Cenário 3: Pagamento Parcial
1. Crie uma nova fatura avulsa de **R$ 200,00** para um aluno com vencimento no final do mês.
2. Abra a opção **"Receber / Baixar"** e informe:
   - **Valor**: *R$ 100,00*
   - **Forma de Pagamento**: *Dinheiro*.
3. Confirme o pagamento.
4. **Verificação**:
   - A mensalidade exibe:
     - Valor Original: *R$ 200,00*
     - Total Pago: *R$ 100,00*
     - Saldo Restante: *R$ 100,00*
   - O status permanece como **Pendente** (amarelo).
   - O Dashboard computa os *R$ 100,00* no faturamento do mês.

---

### Cenário 4: Geração de Mensalidades do Mês em Lote
1. Na tela de Mensalidades, clique no botão **"Gerar Mensalidades do Mês"**.
2. Escolha:
   - **Competência**: Mês seguinte (ex: *12/2026*).
   - **Vencimento Padrão**: Dia 10 do mês.
   - **Valor Padrão**: R$ 120,00.
3. Confirme a geração.
4. **Verificação**:
   - O sistema gera faturas para todos os alunos ativos da academia de forma instantânea.
   - Ao clicar novamente em gerar para a mesma competência, o sistema informa que as mensalidades já existem e não cria faturas duplicadas.
