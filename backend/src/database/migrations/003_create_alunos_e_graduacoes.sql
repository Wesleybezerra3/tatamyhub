-- Migration 003: Tabelas de Alunos, Modalidades e Histórico de Graduações

CREATE TABLE IF NOT EXISTS alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academia_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) NULL,
  data_nascimento DATE NULL,
  data_matricula DATE NOT NULL,
  observacoes_medicas TEXT NULL,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alunos_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE,
  INDEX idx_alunos_academia_status (academia_id, status),
  INDEX idx_alunos_nome (academia_id, nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aluno_modalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  modalidade_id INT NOT NULL,
  faixa_atual VARCHAR(50) NOT NULL DEFAULT 'Branca',
  graus_atual INT NOT NULL DEFAULT 0,
  data_inicio DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_am_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  CONSTRAINT fk_am_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,
  UNIQUE KEY uk_aluno_modalidade (aluno_id, modalidade_id),
  INDEX idx_am_modalidade_faixa (modalidade_id, faixa_atual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS graduacoes_historico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  modalidade_id INT NOT NULL,
  faixa VARCHAR(50) NOT NULL,
  graus INT NOT NULL DEFAULT 0,
  data_graduacao DATE NOT NULL,
  observacao VARCHAR(255) NULL,
  promovido_por_usuario_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gh_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  CONSTRAINT fk_gh_modalidade FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,
  CONSTRAINT fk_gh_usuario FOREIGN KEY (promovido_por_usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_gh_aluno_modalidade (aluno_id, modalidade_id, data_graduacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
