# Research: Dashboard Operacional e Navegação Responsiva

**Feature**: `003-dashboard-overview` | **Date**: 2026-11-16

## 1. Estratégia de Navegação Responsiva (Mobile Tab Bar vs Desktop Sidebar)

### Decisão
Implementar um componente unificado de navegação no layout com transição pura via CSS Media Queries:
- Abaixo de 768px: **Bottom Tab Bar** fixa com 4 seções principais (*Início*, *Alunos*, *Mensalidades*, *Configurações*), altura ergonômica de 64px e suporte a `safe-area-inset-bottom`.
- A partir de 768px: **Sidebar Lateral** fixa à esquerda com 240px de largura, cabeçalho institucional, links verticais e rodapé com perfil e Logout.

### Racional
- Respeita o princípio Mobile-First da Constituição: a Tab Bar inferior permite navegação confortável com uma única mão (alcance do polegar) no smartphone.
- O uso de CSS Media Queries evita *layout shift* ou dependência de eventos de *resize* em JavaScript.

### Alternativas Consideradas
- **Menu Hambúrguer clássico no mobile**: Rejeitado pois oculta a navegação principal atrás de múltiplos toques, contrariando a agilidade exigida pelo professor.
- **Top Bar com tabs no mobile**: Rejeitado porque o topo de telas modernas (6.1"+) é ergonomicamente desconfortável para alcançar com o polegar.

---

## 2. Agregação de Métricas Operacionais no Backend

### Decisão
Criar o endpoint dedicado `GET /api/dashboard/metrics` no módulo `dashboard`, que extrai do MySQL as métricas essenciais vinculadas à `academia_id` do usuário autenticado:
1. Total de alunos ativos.
2. Mensalidades com vencimento atrasado (quantidade e valor somado).
3. Total arrecadado no mês corrente.
4. Total de modalidades ativas.
5. Lista rápida de alertas e próximos vencimentos.

### Racional
- Centraliza a regra de negócio e cálculos de saldo no backend (Princípio II e V da Constituição).
- Se as tabelas financeiras e de alunos ainda estiverem em fase inicial no banco, o repositório trata com queries defensivas e fallbacks estruturados (zero quebras de tela com `NaN` ou `null`).

### Alternativas Consideradas
- **Múltiplas requisições do frontend para cada indicador**: Rejeitado para evitar sobrecarga de requisições HTTP e garantir renderização instantânea do dashboard.

---

## 3. Ergonomia e Ações Rápidas (Quick Actions)

### Decisão
Organizar os botões de ação rápida logo abaixo das boas-vindas no mobile:
- Alvos de toque com altura mínima de 48px.
- Ícones nítidos com feedback tátil `:active { transform: scale(0.97); }`.
- Ações: "Registrar Pagamento", "Cadastrar Aluno", "Cobrar WhatsApp" e "Minha Academia".
