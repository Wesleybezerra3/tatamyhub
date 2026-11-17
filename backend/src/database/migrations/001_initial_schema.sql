-- Migration 001: Esquema inicial de Academias e Modalidades

CREATE TABLE IF NOT EXISTS academias (
  id INT AUTO_INCREMENT PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS modalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  academia_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NULL,
  status ENUM('ativa', 'inativa') DEFAULT 'ativa' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_modalidades_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE,
  UNIQUE KEY uk_academia_modalidade (academia_id, nome),
  INDEX idx_modalidades_status (academia_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
