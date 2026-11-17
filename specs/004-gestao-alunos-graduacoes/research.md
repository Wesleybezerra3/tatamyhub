# Research: Gestão de Alunos e Graduações

**Feature Branch**: `004-gestao-alunos-graduacoes`  
**Date**: 2026-11-16  
**Status**: Concluído  

---

## 1. Contexto e Problema Operacional

Em academias e centros de treinamento de artes marciais (Jiu-Jitsu, Muay Thai, Judô, Karatê, Boxe), a rotina do professor é dinâmica e ocorre majoritariamente pelo smartphone. Os principais problemas identificados no tatame são:
1. **Falta de controle centralizado de alunos**: Cadastros em cadernos ou planilhas que se desatualizam rapidamente.
2. **Perda de histórico de faixas e graus**: Esquecimento da data da última graduação, tempo de permanência na faixa e quem realizou a promoção.
3. **Comunicação truncada**: Dificuldade em acionar o aluno rapidamente via WhatsApp para lembretes de aula, eventos ou cobranças.
4. **Segurança no tatame**: Desconhecimento de restrições médicas e lesões prévias durante treinos intensos.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Modelagem de Múltiplas Modalidades e Graduações por Aluno
- **Contexto**: É frequente um aluno treinar mais de uma arte marcial na mesma academia (ex: Faixa Azul em Jiu-Jitsu e Prajied Vermelho/Branco em Muay Thai).
- **Opções avaliadas**:
  - *Opção A*: Faixa única na tabela de alunos (impede o aluno de ter modalidades diferentes).
  - *Opção B*: Tabela associativa `aluno_modalidades` mantendo a graduação atual (`faixa_atual`, `graus_atual`) somada à tabela imutável `graduacoes_historico` para a linha do tempo.
- **Decisão**: **Opção B**. Preserva o histórico individual por modalidade, atende ao Princípio II da Constituição (Sustentabilidade) e reflete a realidade do tatame.

### Decisão 2: Formatação e Sanitização de Telefone / WhatsApp
- **Contexto**: No Brasil, números são digitados com ou sem DDD, com ou sem parênteses e traços. O link direto do WhatsApp exige formato internacional limpo (`55DDD9XXXXXXXX`).
- **Decisão**: 
  - O backend e frontend sanitizam a entrada removendo caracteres não numéricos.
  - Para abertura de conversa, a URL gerada é: `https://wa.me/55${cleanedPhone}`.
  - No frontend, o telefone é exibido com máscara amigável: `(99) 99999-9999`.

### Decisão 3: Visualização das Faixas e Graus (Belt Design System)
- **Contexto**: A linguagem visual das artes marciais é rica em cores e graus.
- **Decisão**:
  - Criar o componente `BeltBadge` no frontend que renderiza uma tarja colorida representativa da faixa (Branca, Azul, Roxa, Marrom, Preta, Cinza, Amarela, Laranja, Verde, Coral, Vermelha) e marcadores pontuais (listras brancas/graus) de 0 a 4.
  - Cores semânticas com alto contraste e legibilidade no tema dark do TatamyHub.

### Decisão 4: Preservação de Histórico e Soft Delete (Status Ativo / Inativo)
- **Contexto**: O Princípio V da Constituição exige preservação de histórico. Um aluno com mensalidades ou histórico de graduações nunca deve ser deletado com `DELETE FROM alunos`.
- **Decisão**: 
  - O campo `status ENUM('ativo', 'inativo')` controla o ciclo de vida.
  - Alunos inativos somem da listagem padrão de treino e decrementam o contador do Dashboard, mas permanecem intactos no banco de dados e podem ser reativados com 1 toque.

### Decisão 5: Performance e Responsividade Mobile-First
- **Contexto**: O professor pesquisa alunos pelo nome durante o treino ou na recepção da academia.
- **Decisão**:
  - Busca textual com debounce (300ms) executada com `LIKE ?%` sobre índice `(academia_id, nome)`.
  - Elementos táteis com altura mínima de 44px e botão de ação flutuante (FAB) para cadastro rápido em telas móveis.

---

## 3. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Cadastro de aluno com modalidade inexistente | Erro 400 | Validação de chave estrangeira `modalidade_id` e verificação de tenant no backend |
| Exclusão acidental de histórico de faixas | Perda de dados técnicos | Histórico mantido em tabela append-only (`graduacoes_historico`) |
| Homônimos na mesma academia | Confusão operacional | Exibição de faixa, modalidade e data de nascimento no card do aluno |
