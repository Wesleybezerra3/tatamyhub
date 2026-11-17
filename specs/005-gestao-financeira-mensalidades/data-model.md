# Data Model: Gestão Financeira e Mensalidades

**Feature Branch**: `005-gestao-financeira-mensalidades`  
**Date**: 2026-11-16  
**Status**: Concluído  

---

## 1. Esquema Relacional

```text
+------------------+         +---------------------+
|    academias     |         |       alunos        |
+------------------+         +---------------------+
         |                              |
         | 1:N                          | 1:N
         v                              v
+--------------------------------------------------+
|                   mensalidades                   |
|  (academia_id, aluno_id, valor, valor_pago,      |
|   data_vencimento, competencia, status)          |
+--------------------------------------------------+
         |
         | 1:N
         v
+--------------------------------------------------+
|                    pagamentos                    |
|  (mensalidade_id, academia_id, aluno_id,         |
|   valor, forma_pagamento, data_pagamento)        |
+--------------------------------------------------+
```

---

## 2. Estrutura Detalhada das Tabelas

### 2.1 Tabela `mensalidades`
Representa a obrigação financeira/fatura gerada para o aluno.

| Campo | Tipo | Nulo | Padrão | Descrição |
|-------|------|:----:|--------|-----------|
| `id` | INT AUTO_INCREMENT | NÃO | - | Chave Primária |
| `academia_id` | INT | NÃO | - | FK para `academias(id)` (Multi-tenant) |
| `aluno_id` | INT | NÃO | - | FK para `alunos(id)` |
| `valor` | DECIMAL(10, 2) | NÃO | - | Valor nominal da fatura em reais |
| `valor_pago` | DECIMAL(10, 2) | NÃO | 0.00 | Total acumulado pago |
| `data_vencimento` | DATE | NÃO | - | Data limite para pagamento |
| `competencia` | VARCHAR(7) | NÃO | - | Mês de referência no formato MM/AAAA (ex: '11/2026') |
| `status` | ENUM('pendente', 'paga', 'atrasada', 'cancelada') | NÃO | 'pendente' | Estado da fatura |
| `observacoes` | VARCHAR(255) | SIM | NULL | Informações adicionais (ex: Taxa de exame) |
| `created_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP | Data de emissão |
| `updated_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP ON UPDATE | Data da última alteração |

**Chaves e Índices**:
- `PRIMARY KEY (id)`
- `CONSTRAINT fk_mensalidades_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE`
- `CONSTRAINT fk_mensalidades_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE RESTRICT`
- `INDEX idx_mensalidades_status_venc (academia_id, status, data_vencimento)`
- `INDEX idx_mensalidades_competencia (academia_id, competencia)`
- `UNIQUE KEY uk_aluno_competencia (academia_id, aluno_id, competencia)`

---

### 2.2 Tabela `pagamentos`
Registro histórico e imutável de cada evento de recebimento financeiro.

| Campo | Tipo | Nulo | Padrão | Descrição |
|-------|------|:----:|--------|-----------|
| `id` | INT AUTO_INCREMENT | NÃO | - | Chave Primária |
| `mensalidade_id` | INT | NÃO | - | FK para `mensalidades(id)` |
| `academia_id` | INT | NÃO | - | FK para `academias(id)` (Multi-tenant) |
| `aluno_id` | INT | NÃO | - | FK para `alunos(id)` |
| `valor` | DECIMAL(10, 2) | NÃO | - | Valor pago nesta transação |
| `forma_pagamento` | ENUM('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'outro') | NÃO | 'pix' | Meio de pagamento utilizado |
| `data_pagamento` | DATE | NÃO | - | Data em que o dinheiro foi recebido |
| `observacao` | VARCHAR(255) | SIM | NULL | Detalhes do pagamento (ex: Comprovante #12345) |
| `usuario_id` | INT | SIM | NULL | FK para `usuarios(id)` (Quem registrou a baixa) |
| `created_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP | Data de inserção do registro |

**Chaves e Índices**:
- `PRIMARY KEY (id)`
- `CONSTRAINT fk_pagamentos_mensalidade FOREIGN KEY (mensalidade_id) REFERENCES mensalidades(id) ON DELETE RESTRICT`
- `CONSTRAINT fk_pagamentos_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE`
- `CONSTRAINT fk_pagamentos_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE RESTRICT`
- `CONSTRAINT fk_pagamentos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL`
- `INDEX idx_pagamentos_data (academia_id, data_pagamento)`
- `INDEX idx_pagamentos_mensalidade (mensalidade_id)`

---

## 3. Regras de Transição e Validação

1. **Baixa de Pagamento (Quitação Total ou Parcial)**:
   - Valida que `valor_recebido > 0` e `valor_recebido <= (mensalidade.valor - mensalidade.valor_pago)`.
   - Insere o registro em `pagamentos`.
   - Incrementa `mensalidades.valor_pago = mensalidades.valor_pago + valor_recebido`.
   - Se `novo_valor_pago >= mensalidades.valor`: status passa para `'paga'`.
   - Se `novo_valor_pago < mensalidades.valor`: status permanece `'pendente'` ou `'atrasada'` conforme `data_vencimento`.
   - Executado em **transação atômica** (`START TRANSACTION ... COMMIT`).
2. **Atualização Automática de Status de Inadimplência**:
   - Em consultas ou rotina de leitura, faturas com `status = 'pendente'`, `valor_pago < valor` e `data_vencimento < CURDATE()` são marcadas como `'atrasada'`.
3. **Cancelamento de Fatura**:
   - Faturas sem pagamentos vinculados podem ter seu status alterado para `'cancelada'`.
   - Faturas já pagas ou parcialmente quitadas não podem ser canceladas diretamente sem estorno prévio.
