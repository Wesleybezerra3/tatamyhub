-- Migration 008: Adicionar campos de Chave PIX da Academia

ALTER TABLE academias
  ADD COLUMN chave_pix VARCHAR(255) NULL AFTER logo_url,
  ADD COLUMN tipo_chave_pix VARCHAR(30) NULL AFTER chave_pix,
  ADD COLUMN beneficiario_pix VARCHAR(150) NULL AFTER tipo_chave_pix;
