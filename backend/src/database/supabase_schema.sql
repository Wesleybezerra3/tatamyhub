-- ==============================================================================
-- SCHEMA SUPABASE (POSTGRESQL) - TATAMYHUB
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. TABELA ACADEMIAS
CREATE TABLE IF NOT EXISTS academias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  documento VARCHAR(20) NULL,
  email VARCHAR(100) NULL,
  telefone VARCHAR(20) NULL,
  whatsapp VARCHAR(20) NULL,
  logradouro VARCHAR(150) NULL,
  numero VARCHAR(20) NULL,
  complemento VARCHAR(50) NULL,
  bairro VARCHAR(100) NULL,
  cidade VARCHAR(100) NULL,
  estado CHAR(2) NULL,
  cep VARCHAR(10) NULL,
  logo_url VARCHAR(255) NULL,
  chave_pix VARCHAR(255) NULL,
  tipo_chave_pix VARCHAR(30) NULL,
  beneficiario_pix VARCHAR(150) NULL,
  msg_cobranca_pendente TEXT NULL,
  msg_cobranca_atrasada TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA MODALIDADES
CREATE TABLE IF NOT EXISTS modalidades (
  id SERIAL PRIMARY KEY,
  academia_id INT NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NULL,
  status VARCHAR(20) DEFAULT 'ativa' NOT NULL CHECK (status IN ('ativa', 'inativa')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_academia_modalidade UNIQUE (academia_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_modalidades_status ON modalidades(academia_id, status);

-- 3. TABELA USUARIOS (ADMINISTRADORES / GESTORES)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  academia_id INT NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_academia ON usuarios(academia_id);

-- 4. TABELA ALUNOS
CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  academia_id INT NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  senha_hash VARCHAR(255) NULL,
  primeiro_acesso BOOLEAN DEFAULT TRUE NOT NULL,
  ultimo_login TIMESTAMPTZ NULL,
  data_nascimento DATE NULL,
  data_matricula DATE NOT NULL,
  observacoes_medicas TEXT NULL,
  status VARCHAR(20) DEFAULT 'ativo' NOT NULL CHECK (status IN ('ativo', 'inativo')),
  cobranca_continua BOOLEAN DEFAULT TRUE NOT NULL,
  valor_mensalidade NUMERIC(10, 2) NULL,
  dia_vencimento INT DEFAULT 10 NOT NULL,
  validade_plano DATE NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_alunos_academia_email UNIQUE (academia_id, email)
);

CREATE INDEX IF NOT EXISTS idx_alunos_academia_status ON alunos(academia_id, status);
CREATE INDEX IF NOT EXISTS idx_alunos_nome ON alunos(academia_id, nome);
CREATE INDEX IF NOT EXISTS idx_alunos_login_telefone ON alunos(academia_id, telefone);

-- 5. TABELA ALUNO_MODALIDADES
CREATE TABLE IF NOT EXISTS aluno_modalidades (
  id SERIAL PRIMARY KEY,
  aluno_id INT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  modalidade_id INT NOT NULL REFERENCES modalidades(id) ON DELETE CASCADE,
  faixa_atual VARCHAR(50) DEFAULT 'Branca' NOT NULL,
  graus_atual INT DEFAULT 0 NOT NULL,
  data_inicio DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_aluno_modalidade UNIQUE (aluno_id, modalidade_id)
);

CREATE INDEX IF NOT EXISTS idx_am_modalidade_faixa ON aluno_modalidades(modalidade_id, faixa_atual);

-- 6. TABELA GRADUACOES_HISTORICO
CREATE TABLE IF NOT EXISTS graduacoes_historico (
  id SERIAL PRIMARY KEY,
  aluno_id INT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  modalidade_id INT NOT NULL REFERENCES modalidades(id) ON DELETE CASCADE,
  faixa VARCHAR(50) NOT NULL,
  graus INT DEFAULT 0 NOT NULL,
  data_graduacao DATE NOT NULL,
  observacao VARCHAR(255) NULL,
  promovido_por_usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gh_aluno_modalidade ON graduacoes_historico(aluno_id, modalidade_id, data_graduacao);

-- 7. TABELA MENSALIDADES
CREATE TABLE IF NOT EXISTS mensalidades (
  id SERIAL PRIMARY KEY,
  academia_id INT NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  aluno_id INT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  valor_pago NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  data_vencimento DATE NOT NULL,
  competencia VARCHAR(7) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' NOT NULL CHECK (status IN ('pendente', 'paga', 'atrasada', 'cancelada')),
  observacoes VARCHAR(255) NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_aluno_competencia UNIQUE (academia_id, aluno_id, competencia)
);

CREATE INDEX IF NOT EXISTS idx_mensalidades_status_venc ON mensalidades(academia_id, status, data_vencimento);
CREATE INDEX IF NOT EXISTS idx_mensalidades_competencia ON mensalidades(academia_id, competencia);

-- 8. TABELA PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  mensalidade_id INT NOT NULL REFERENCES mensalidades(id) ON DELETE CASCADE,
  academia_id INT NOT NULL REFERENCES academias(id) ON DELETE CASCADE,
  aluno_id INT NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  forma_pagamento VARCHAR(30) DEFAULT 'pix' NOT NULL CHECK (forma_pagamento IN ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'outro')),
  data_pagamento DATE NOT NULL,
  observacao VARCHAR(255) NULL,
  usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(academia_id, data_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mensalidade ON pagamentos(mensalidade_id);
