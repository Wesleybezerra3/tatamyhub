-- Migration 009: Adicionar modelos customizados de mensagens de cobrança para a academia

ALTER TABLE academias
  ADD COLUMN msg_cobranca_pendente TEXT NULL AFTER beneficiario_pix,
  ADD COLUMN msg_cobranca_atrasada TEXT NULL AFTER msg_cobranca_pendente;
