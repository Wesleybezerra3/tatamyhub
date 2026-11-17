-- Migration 004: Tabelas de Mensalidades e Pagamentos

CREATE TABLE IF NOT EXISTS mensalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academia_id INT NOT NULL,
  aluno_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  data_vencimento DATE NOT NULL,
  competencia VARCHAR(7) NOT NULL,
  status ENUM('pendente', 'paga', 'atrasada', 'cancelada') DEFAULT 'pendente' NOT NULL,
  observacoes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mensalidades_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE,
  CONSTRAINT fk_mensalidades_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE RESTRICT,
  INDEX idx_mensalidades_status_venc (academia_id, status, data_vencimento),
  INDEX idx_mensalidades_competencia (academia_id, competencia),
  UNIQUE KEY uk_aluno_competencia (academia_id, aluno_id, competencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mensalidade_id INT NOT NULL,
  academia_id INT NOT NULL,
  aluno_id INT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento ENUM('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'outro') DEFAULT 'pix' NOT NULL,
  data_pagamento DATE NOT NULL,
  observacao VARCHAR(255) NULL,
  usuario_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pagamentos_mensalidade FOREIGN KEY (mensalidade_id) REFERENCES mensalidades(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pagamentos_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE,
  CONSTRAINT fk_pagamentos_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_pagamentos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_pagamentos_data (academia_id, data_pagamento),
  INDEX idx_pagamentos_mensalidade (mensalidade_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
