# Research: Cadastro e Perfil da Academia

**Feature**: `001-cadastro-academia` | **Date**: 2026-11-16

## 1. Armazenamento e Upload do Logotipo da Academia

### Decisão
Utilizar armazenamento em sistema de arquivos local (`backend/uploads/logos/`) servido como arquivos estáticos pelo Express, com processamento via `multer`.

### Racional
- O MVP é focado em simplicidade operacional e baixo custo (Princípio I da Constituição).
- Armazenamento em S3, Cloudinary ou buckets em nuvem adicionaria credenciais externas, custos adicionais e complexidade desnecessária para o primeiro ciclo.
- O volume de logotipos para o perfil da academia é unitário e com tamanho limitado (máximo 2MB, formatos PNG, JPEG e WebP).

### Alternativas Consideradas
- **Armazenamento em Base64 no banco de dados**: Rejeitado pois infla o tamanho das tabelas e prejudica o desempenho do MySQL e das respostas da API.
- **AWS S3 / Google Cloud Storage**: Rejeitado para o MVP para manter dependências e custos zerados, preservando a facilidade de implantação local e em VPS simples.

---

## 2. Modelagem Relacional e Isolamento das Modalidades

### Decisão
Criar duas tabelas principais no MySQL: `academias` e `modalidades`, ambas com chave primária e índice `academia_id`.
- Tabela `academias`: Armazena dados institucionais, localização (endereço), contatos e caminho do logotipo.
- Tabela `modalidades`: Armazena modalidades vinculadas a cada academia via chave estrangeira `academia_id`, com restrição de unicidade composta `(academia_id, nome)`.

### Racional
- Atende ao Princípio IV da Constituição (*Preparação para Escalabilidade / Multi-tenant Ready*).
- Permite que a academia ofereça tanto Jiu-Jitsu (Gi e No-Gi) quanto outras artes marciais (Muay Thai, Judô, Boxe).
- A restrição `(academia_id, nome)` impede nomes duplicados na mesma academia, mantendo integridade no nível de banco.

### Alternativas Consideradas
- **Campo de array JSON ou string separada por vírgula na tabela `academias`**: Rejeitado porque impediria integridade referencial, consultas diretas, filtros eficientes e associação de planos futuros com modalidades específicas.

---

## 3. Gerenciamento de Migrations do Banco de Dados

### Decisão
Implementar um mecanismo nativo e enxuto de migrations em Node.js com scripts SQL versionados em `backend/src/database/migrations/` controlados por uma tabela `_migrations`.

### Racional
- Respeita o requisito da Constituição (*MySQL com Migrations para controle de alterações*).
- Evita acoplamento prematuro com ORMs pesados como TypeORM ou Sequelize, mantendo o controle fino de queries parametrizadas com `mysql2/promise`.
- Execução direta com script `npm run migrate`.

### Alternativas Consideradas
- **Knex / Prisma**: Considerados, mas descartados para o início do MVP para evitar sobrecarga de dependências de runtime e manter a stack 100% JavaScript puro sem overhead de compilação ou DSLs proprietárias.

---

## 4. Configuração PWA e Mobile-First

### Decisão
Adotar `vite-plugin-pwa` no frontend com manifest customizado (nome da aplicação "TatamyHub", tema escuro/tatame, ícones mobile e display `standalone`).

### Racional
- Respeita os padrões da Constituição e prioriza a usabilidade pelo professor em smartphones.
- Permite instalar a aplicação na tela inicial do celular como um aplicativo móvel rápido e sem fricção.

### Alternativas Consideradas
- **Aplicação React Web tradicional sem PWA**: Rejeitada porque a Constituição exige PWA para oferecer experiência fluida em dispositivos móveis.
