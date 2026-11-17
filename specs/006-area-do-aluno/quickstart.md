# Quickstart & Validation Guide: Área e Hub do Aluno

**Feature**: `006-area-do-aluno`  
**Date**: 2026-11-17

---

## 1. Pré-Requisitos

1. Banco de Dados MySQL ativo com a migration `007_add_aluno_auth.sql` executada.
2. Backend em execução na porta `3001` (`npm run dev` em `backend/`).
3. Frontend em execução na porta `5173` (`npm run dev` em `frontend/`).

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Gestor define credenciais de acesso do aluno
1. No painel de administração (`/alunos/:id`), o gestor abre o prontuário do aluno.
2. Clica no botão **"Definir Acesso ao Portal"**.
3. Informa a senha inicial (ex.: `Tatamy123`) e salva.
4. O sistema gera o hash `bcryptjs` e armazena na coluna `senha_hash` do aluno.

### Cenário 2: Aluno faz login no Portal (`/aluno/login`)
1. No navegador, acesse `http://localhost:5173/aluno/login`.
2. Insira o telefone do aluno (ex.: `11988887777`) e a senha `Tatamy123`.
3. Clique em **"Entrar no Hub"**.
4. Valide que o sistema redireciona para `/aluno` e carrega o Hub do Aluno.

### Cenário 3: Visualização da Graduação Marcial
1. No Hub do Aluno, verifique o card de graduação:
   - Faixa visual renderizada com as cores corretas (ex.: Azul, Branca, Roxa).
   - Graus preenchidos de acordo com o cadastro.
   - Nome da modalidade (ex.: Jiu-Jitsu) e data da promoção.
2. Clique em **"Ver Histórico"** e valide a exibição da timeline de promoções.

### Cenário 4: Alerta no Hub e Popup de Vencimento Próximo
1. Para um aluno com mensalidade vencendo em 3 dias:
   - Ao acessar o Hub, valide que um **Popup Modal de Aviso** abre automaticamente:
     - Título: "Lembrete de Vencimento"
     - Mensagem informando o valor e data de vencimento.
     - Botão "Copiar Chave PIX" e botão "Fechar".
   - Ao fechar o popup, valide que o topo do Hub exibe o banner de status amarelo/laranja.

### Cenário 5: Alerta de Mensalidade Atrasada
1. Para um aluno com mensalidade vencida:
   - Ao acessar o Hub, o popup abre com destaque vermelho e contagem de dias em atraso.
   - O banner fixo no Hub exibe status "Em Atraso" e o botão de ação rápida para pagamento.

### Cenário 6: Pagamento com Cópia de Chave PIX em 1 Clique
1. Clique no botão **"Copiar Chave PIX"**.
2. Valide que a chave PIX da academia é copiada para a área de transferência do dispositivo com confirmação visual ("Chave PIX copiada!").
