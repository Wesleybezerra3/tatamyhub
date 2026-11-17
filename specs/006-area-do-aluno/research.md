# Research & Technical Decisions: Área e Hub do Aluno

**Feature**: `006-area-do-aluno`  
**Date**: 2026-11-17  
**Status**: Resolved

---

## 1. Autenticação e Perfil de Acesso do Aluno

### Decisão
Criar uma autenticação dedicada para alunos via JWT com claims específicos (`role: 'aluno'`, `aluno_id`, `academia_id`). No banco de dados, enriquecer a tabela `alunos` com colunas de credenciais (`email`, `senha_hash`, `primeiro_acesso`) através da migration `007_add_aluno_auth.sql`. O login do aluno aceita seu **telefone** ou **e-mail** cadastrado + senha.

### Racional
- **Isolamento de privilégios (Least Privilege)**: Alunos não devem ter acesso aos endpoints de gestão administrativa (`/api/alunos`, `/api/mensalidades/gerar-lote`, etc.). O middleware `authenticateStudentJWT` garante que tokens de alunos só acessem rotas do escopo `/api/aluno/*` e restringe a consulta estritamente ao `aluno_id` do token.
- **Praticidade para o aluno**: No meio marcial brasileiro, muitos alunos não usam e-mail com frequência; permitir login via telefone (WhatsApp) ou e-mail com senha garante máxima acessibilidade.
- **Senhas seguras**: Hashing criptográfico obrigatório com `bcryptjs` (salt 10), respeitando o Princípio III da Constituição.

### Alternativas Consideradas
- *Criar registros na tabela `usuarios` com role='aluno'*: Descartada porque misturaria usuários do staff/gestores da academia com centenas de alunos, complicando permissões, cobrança de licença por usuário da plataforma e consultas de usuários administrativos.
- *Login sem senha via link mágico por WhatsApp*: Descartada para o MVP porque exigiria integração e custos de API de mensageria externa (Twilio/Meta), o que é restrito pela Constituição do MVP.

---

## 2. Estratégia de Apuração de Avisos e Notificação Popup

### Decisão
A apuração do status de cobrança e geração dos alertas (banner do Hub e dados do Popup) será calculada **dinamicamente no backend** em tempo de requisição na rota `GET /api/aluno/hub`.
- **Crítico (Vermelho / Popup de Urgência)**: Fatura com status `atrasada` ou `data_vencimento < hoje` com saldo devedor pendente.
- **Atenção (Laranja / Popup de Lembrete)**: Fatura pendente com vencimento entre hoje e os próximos 5 dias (`data_vencimento BETWEEN hoje AND hoje + 5 dias`).
- **Regular (Verde)**: Nenhuma fatura vencida nem a vencer no intervalo de 5 dias.

No frontend, a notificação popup é exibida automaticamente ao carregar o Hub, armazenando um marcador na `sessionStorage` (`tatamyhub_aluno_popup_dismissed = true`) para evitar repetição invasiva a cada clique durante a mesma sessão de uso.

### Racional
- Respeita o Princípio V da Constituição: regras e status financeiros são canônicos no backend e calculados de forma determinística, sem depender de cron jobs complexos para avisos instantâneos.
- A experiência do aluno é fluida (Mobile-First): o popup alerta imediatamente no primeiro acesso e o banner fixo no topo do Hub mantém o status acessível a qualquer momento.

---

## 3. Chave PIX e Pagamento sem Intermediários

### Decisão
A fatura exibida no portal do aluno conterá os dados de pagamento da academia:
1. Chave PIX da academia (configurada em `academias.whatsapp`, `academias.email` ou `academias.documento`).
2. Botão de 1 toque **"Copiar Chave PIX"** com feedback visual (`navigator.clipboard.writeText`).
3. Instrução para o aluno enviar o comprovante via WhatsApp da academia com link direto (`https://wa.me/55...`).

### Racional
- Mantém o MVP ágil e sem custos de taxas bancárias por boleto/gateway de terceiros para o professor.
- Elimina o atrito do aluno ter que pedir a chave PIX no WhatsApp da academia.

---

## 4. Estrutura de Rotas e Navegação Frontend

### Decisão
Rotas isoladas para o portal do aluno:
- `/aluno/login`: Tela de autenticação exclusiva com visual minimalista e acolhedor.
- `/aluno`: Hub do Aluno (Dashboard do Aluno com faixa marcial, banner de alerta, faturas e popup inteligente).
- `/aluno/faturas`: Lista completa e detalhada de faturas e recibos.
- `/aluno/graduacoes`: Linha do tempo completa da trajetória de faixas e graus.

Protegidas pelo componente `<StudentProtectedRoute />` alimentado por um `StudentAuthContext`.
