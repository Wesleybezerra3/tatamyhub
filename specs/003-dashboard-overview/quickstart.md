# Quickstart & Guia de Validação: Dashboard e Navegação Responsiva

**Feature**: `003-dashboard-overview` | **Data**: 2026-11-16

Guia para homologação visual e funcional do Dashboard e da navegação responsiva (Mobile Tab Bar e Desktop Sidebar).

---

## 1. Pré-Requisitos

- Servidor backend rodando em `http://localhost:3001`
- Frontend rodando em `http://localhost:5173`
- Usuário logado no sistema

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Visualização do Dashboard e Métricas
1. Acesse o sistema e faça login.
2. O sistema deve direcionar automaticamente para `/dashboard`.
3. Verifique se os 4 cards de KPIs são exibidos:
   - **Alunos Ativos**
   - **Em Atraso** (valor em reais destacado em vermelho suave)
   - **Arrecadado no Mês** (valor em reais destacado em verde suave)
   - **Modalidades Ativas** (contagem de modalidades cadastradas)
4. Verifique o banner de boas-vindas exibindo o nome do usuário e o nome da academia.

### Cenário 2: Ações Rápidas (Quick Actions)
1. No topo do Dashboard, localize a barra de Ações Rápidas.
2. Clique/toque em **"Configurar Academia"**:
   - *Validação*: Redireciona diretamente para a tela de perfil da academia (`/configuracoes/academia`).
3. Retorne para o Dashboard e clique em **"Nova Modalidade"**:
   - *Validação*: Redireciona diretamente para a tela de modalidades (`/configuracoes/modalidades`).
4. Clique em **"Registrar Pagamento"** ou **"Cadastrar Aluno"**:
   - *Validação*: Exibe feedback tátil orientador informando o atalho operacional.

### Cenário 3: Navegação Mobile (Tab Bar)
1. Ative a emulação de smartphone no navegador (F12 -> dispositivo móvel com viewport de 375px ou 390px).
2. Verifique:
   - O menu lateral desktop (Sidebar) **não** é visível.
   - A **Tab Bar inferior** está fixada na base da tela com os 4 ícones (*Início*, *Alunos*, *Mensalidades*, *Configurações*).
   - O ícone **Início** está com a cor de destaque da rota ativa.
   - O conteúdo do dashboard pode ser rolado confortavelmente até o final sem ficar encoberto pela Tab Bar.
3. Toque em **Configurações** na Tab Bar:
   - *Validação*: A navegação muda para `/configuracoes/academia` e a aba ativa da Tab Bar passa a ser Configurações.

### Cenário 4: Navegação Desktop (Sidebar)
1. Desative o modo de emulação móvel e expanda a tela para desktop (> 768px).
2. Verifique:
   - A **Tab Bar inferior desaparece**.
   - A **Sidebar Lateral** é renderizada à esquerda com largura adequada (240px).
   - O cabeçalho da Sidebar exibe o logo/marca do TatamyHub e o nome da academia logada.
   - O link ativo no menu possui fundo destacado.
   - O botão de **Sair** (Logout) está acessível na base da Sidebar.
