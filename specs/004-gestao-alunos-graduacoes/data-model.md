# Data Model: Gestão de Alunos e Graduações

**Feature Branch**: `004-gestao-alunos-graduacoes`  
**Date**: 2026-11-16  
**Status**: Concluído  

---

## 1. Esquema Relacional e Entidades

```text
+------------------+         +-----------------------+         +------------------------+
|    academias     |         |      modalidades      |         |        usuarios        |
+------------------+         +-----------------------+         +------------------------+
         |                               |                                  |
         | 1:N                           | 1:N                              | 1:N
         v                               v                                  v
+------------------+         +-----------------------+         +------------------------+
|      alunos      | 1:N     |   aluno_modalidades   | 1:N     |  graduacoes_historico  |
| (academia_id)    |-------->| (faixa_atual, graus)  |-------->| (faixa, graus, data,   |
+------------------+         +-----------------------+         |  promovido_por_id)     |
                                                               +------------------------+
```

---

## 2. Definição Detalhada das Tabelas

### 2.1 Tabela `alunos`
Armazena os dados cadastrais básicos de cada aluno matriculado.

| Campo | Tipo | Nulo | Padrão | Descrição |
|-------|------|:----:|--------|-----------|
| `id` | INT AUTO_INCREMENT | NÃO | - | Chave Primária |
| `academia_id` | INT | NÃO | - | FK para `academias(id)` (Multi-tenant) |
| `nome` | VARCHAR(150) | NÃO | - | Nome completo do aluno |
| `telefone` | VARCHAR(20) | SIM | NULL | Telefone / WhatsApp sanitizado |
| `data_nascimento` | DATE | SIM | NULL | Data de nascimento para cálculo de categoria (Kids/Adulto/Master) |
| `data_matricula` | DATE | NÃO | CURRENT_DATE | Data de início na academia |
| `observacoes_medicas` | TEXT | SIM | NULL | Restrições físicas, cirurgias, alergias |
| `status` | ENUM('ativo', 'inativo') | NÃO | 'ativo' | Status do aluno no tatame |
| `created_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP | Data de cadastro |
| `updated_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP ON UPDATE | Data de atualização |

**Chaves e Índices**:
- `PRIMARY KEY (id)`
- `CONSTRAINT fk_alunos_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE`
- `INDEX idx_alunos_academia_status (academia_id, status)`
- `INDEX idx_alunos_nome (academia_id, nome)`

---

### 2.2 Tabela `aluno_modalidades`
Tabela associativa que vincula o aluno às modalidades que ele treina, registrando sua graduação atual em cada uma delas.

| Campo | Tipo | Nulo | Padrão | Descrição |
|-------|------|:----:|--------|-----------|
| `id` | INT AUTO_INCREMENT | NÃO | - | Chave Primária |
| `aluno_id` | INT | NÃO | - | FK para `alunos(id)` |
| `modalidade_id` | INT | NÃO | - | FK para `modalidades(id)` |
| `faixa_atual` | VARCHAR(50) | NÃO | 'Branca' | Nome da faixa atual (ex: Branca, Azul, Preta, Prajied Vermelho) |
| `graus_atual` | INT | NÃO | 0 | Quantidade de graus (0 a 4) |
| `data_inicio` | DATE | NÃO | CURRENT_DATE | Data de início nesta modalidade |
| `created_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP ON UPDATE | Data de atualização |

**Chaves e Índices**:
- `PRIMARY KEY (id)`
- `CONSTRAINT fk_am_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE`
- `CONSTRAINT fk_am_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE`
- `UNIQUE KEY uk_aluno_modalidade (aluno_id, modalidade_id)`
- `INDEX idx_am_modalidade_faixa (modalidade_id, faixa_atual)`

---

### 2.3 Tabela `graduacoes_historico`
Registro cronológico e imutável de todas as graduações concedidas ao aluno.

| Campo | Tipo | Nulo | Padrão | Descrição |
|-------|------|:----:|--------|-----------|
| `id` | INT AUTO_INCREMENT | NÃO | - | Chave Primária |
| `aluno_id` | INT | NÃO | - | FK para `alunos(id)` |
| `modalidade_id` | INT | NÃO | - | FK para `modalidades(id)` |
| `faixa` | VARCHAR(50) | NÃO | - | Nome da faixa concedida |
| `graus` | INT | NÃO | 0 | Graus concedidos (0 a 4) |
| `data_graduacao` | DATE | NÃO | CURRENT_DATE | Data do evento ou cerimônia |
| `observacao` | VARCHAR(255) | SIM | NULL | Anotações da promoção (ex: Exame de fim de ano) |
| `promovido_por_usuario_id` | INT | SIM | NULL | FK para `usuarios(id)` (Professor responsável) |
| `created_at` | TIMESTAMP | NÃO | CURRENT_TIMESTAMP | Data de inserção do registro |

**Chaves e Índices**:
- `PRIMARY KEY (id)`
- `CONSTRAINT fk_gh_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE`
- `CONSTRAINT fk_gh_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE`
- `CONSTRAINT fk_gh_usuario FOREIGN KEY (promovido_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL`
- `INDEX idx_gh_aluno_modalidade (aluno_id, modalidade_id, data_graduacao)`

---

## 3. Regras de Transição e Validação

1. **Criação de Aluno**:
   - Cria o registro na tabela `alunos`.
   - Insere a modalidade inicial na tabela `aluno_modalidades` com a faixa e graus fornecidos.
   - Insere o primeiro registro correspondente na tabela `graduacoes_historico` para marcar o início da jornada marcial.
   - Tudo executado em **transação atômica** (`START TRANSACTION ... COMMIT`).
2. **Promoção de Graduação**:
   - Insere um novo registro em `graduacoes_historico` com a nova faixa, novos graus, data e observações.
   - Atualiza `aluno_modalidades` definindo `faixa_atual = nova_faixa` e `graus_atual = novos_graus`.
   - Executado em **transação atômica**.
3. **Inativação / Reativação**:
   - Atualiza `alunos.status = 'inativo'` ou `'ativo'`.
   - Nenhuma deleção física de registros em cascata.
