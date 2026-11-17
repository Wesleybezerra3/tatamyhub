-- Migration 007: Adicionar colunas de autenticação para alunos (Área do Aluno)

ALTER TABLE alunos
  ADD COLUMN email VARCHAR(150) NULL AFTER telefone,
  ADD COLUMN senha_hash VARCHAR(255) NULL AFTER email,
  ADD COLUMN primeiro_acesso BOOLEAN DEFAULT TRUE NOT NULL AFTER senha_hash,
  ADD COLUMN ultimo_login TIMESTAMP NULL AFTER primeiro_acesso;

ALTER TABLE alunos
  ADD UNIQUE KEY uk_alunos_academia_email (academia_id, email),
  ADD INDEX idx_alunos_login_telefone (academia_id, telefone);
