-- Migration 005: Cobrança Contínua e Recorrência de Mensalidades por Aluno

ALTER TABLE alunos
  ADD COLUMN cobranca_continua TINYINT(1) DEFAULT 1 NOT NULL,
  ADD COLUMN valor_mensalidade DECIMAL(10, 2) NULL,
  ADD COLUMN dia_vencimento INT DEFAULT 10 NOT NULL,
  ADD COLUMN validade_plano DATE NULL;
