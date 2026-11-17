-- Migration 006: Garantir deleção em cascata (ON DELETE CASCADE) para mensalidades e pagamentos
-- Permite que a exclusão de uma conta/academia ou de um aluno remova todos os dados vinculados sem restrições.

ALTER TABLE mensalidades DROP FOREIGN KEY fk_mensalidades_aluno;
ALTER TABLE mensalidades 
  ADD CONSTRAINT fk_mensalidades_aluno 
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE;

ALTER TABLE pagamentos DROP FOREIGN KEY fk_pagamentos_aluno;
ALTER TABLE pagamentos 
  ADD CONSTRAINT fk_pagamentos_aluno 
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE;

ALTER TABLE pagamentos DROP FOREIGN KEY fk_pagamentos_mensalidade;
ALTER TABLE pagamentos 
  ADD CONSTRAINT fk_pagamentos_mensalidade 
  FOREIGN KEY (mensalidade_id) REFERENCES mensalidades(id) ON DELETE CASCADE;
