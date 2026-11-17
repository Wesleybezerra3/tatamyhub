# Quickstart & Guia de Homologação: Gestão de Alunos e Graduações

**Feature**: `004-gestao-alunos-graduacoes` | **Data**: 2026-11-16  

Guia prático para testar o cadastro de alunos, graduações de faixas e a navegação responsiva mobile e desktop.

---

## 1. Pré-Requisitos

- Servidor backend rodando em `http://localhost:3001`
- Frontend rodando em `http://localhost:5173`
- Banco de dados MySQL com migrations executadas (`npm run migrate`)
- Usuário autenticado na aplicação

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Cadastro Rápido e Listagem de Alunos (Mobile & Desktop)
1. Acesse o sistema e navegue até a aba **Alunos** (`/alunos`).
2. Clique/toque no botão **"Novo Aluno"** (ou no botão flutuante '+' no mobile).
3. Preencha os campos:
   - **Nome**: *Lucas "Fenômeno" Silva*
   - **Telefone**: *(11) 98765-4321*
   - **Data de Nascimento**: *15/04/1996*
   - **Modalidade**: Selecione *Jiu-Jitsu* (ou modalidade existente)
   - **Faixa Inicial**: *Branca* (Graus: 0)
4. Salve o cadastro.
5. **Verificação**:
   - O aluno surge imediatamente na lista com o status **Ativo**.
   - O card do aluno exibe as iniciais em destaque, a faixa branca visual e o botão verde com o ícone do **WhatsApp**.
   - Ao clicar no botão do WhatsApp, uma nova aba abre o link formatado `https://wa.me/5511987654321`.
   - No Dashboard (`/dashboard`), o card **Alunos Ativos** reflete a nova contagem (+1).

---

### Cenário 2: Promoção e Linha do Tempo de Graduação
1. Na lista de alunos, clique no card de *Lucas Silva* para abrir sua ficha detalhada.
2. Na seção de Graduações, clique em **"Graduar Aluno"**.
3. Escolha:
   - **Nova Faixa**: *Azul*
   - **Graus**: *0*
   - **Data**: Data atual
   - **Observação**: *Destaque nos campeonatos estaduais e dedicação aos treinos.*
4. Confirme a graduação.
5. **Verificação**:
   - A faixa atual no topo do perfil muda instantaneamente para **Faixa Azul**.
   - Na linha do tempo de graduações abaixo, um novo registro surge exibindo a transição para a Faixa Azul com data e a observação registrada.
   - O histórico original da Faixa Branca permanece registrado como a graduação de entrada.

---

### Cenário 3: Busca Instantânea e Filtros por Modalidade
1. Cadastre um segundo aluno com a modalidade *Muay Thai* ou *Judo*.
2. No topo da tela de Alunos, digite *"Lucas"* no campo de busca:
   - *Verificação*: Apenas *Lucas Silva* permanece visível na tela em menos de 150ms.
3. Limpe a busca e toque na pílula de filtro da modalidade correspondente:
   - *Verificação*: Apenas os alunos da modalidade selecionada são exibidos.

---

### Cenário 4: Inativação Segura e Impacto no Dashboard
1. Abra a ficha de um aluno e clique em **"Editar Aluno"**.
2. Altere o status de **Ativo** para **Inativo** (ou utilize o botão de alternar status).
3. Salve a alteração.
4. **Verificação**:
   - O aluno deixa de constar na visualização padrão de alunos ativos.
   - Ao marcar o filtro "Mostrar Inativos", o aluno é listado com a badge cinza **Inativo**.
   - Ao acessar o Dashboard (`/dashboard`), o card de **Alunos Ativos** é decrementado em 1.
   - Nenhum histórico de faixas ou dados cadastrais foi perdido.
