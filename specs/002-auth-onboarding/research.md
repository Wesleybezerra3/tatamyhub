# Research: Autenticação, Landing Inicial e Onboarding

**Feature**: `002-auth-onboarding` | **Date**: 2026-11-16

## 1. Criptografia de Senha no Backend

### Decisão
Utilizar a biblioteca `bcryptjs` para geração de salt e hash seguro de senhas com fator de custo (rounds) 10.

### Racional
- Respeita o Princípio III da Constituição (*"Nunca armazenar senhas em texto puro"*).
- `bcryptjs` é implementada em JavaScript puro, eliminando riscos de falhas de compilação de binários C++ (node-gyp/Python) comuns no Windows durante instalações de pacotes.
- Fornece proteção contra ataques de força bruta e dicionário com algoritmos padrão da indústria.

### Alternativas Consideradas
- **bcrypt nativo**: Exige compilação nativa no Windows, trazendo fragilidade para o ambiente de desenvolvimento.
- **SHA-256 simples / MD5**: Rejeitado por ser computacionalmente rápido demais e vulnerável a ataques com tabelas Rainbow.

---

## 2. Padrão de Autenticação e Sessão (JWT)

### Decisão
Adotar JSON Web Tokens (`jsonwebtoken`) com expiração de 7 dias e envio via cabeçalho HTTP `Authorization: Bearer <token>`.

### Racional
- A Constituição prevê *"Autenticação baseada em sessão ou JWT, conforme arquitetura definida"*.
- Tokens JWT são ideais para a arquitetura desacoplada do TatamyHub (SPA React independente consumindo API REST Express).
- O payload do JWT conterá `{ id, academia_id, email, role }`, permitindo que o backend valide instantaneamente a posse e o isolamento dos dados da academia em qualquer requisição.

### Alternativas Consideradas
- **Sessões baseadas em Cookies com express-session**: Rejeitado no MVP para evitar complexidade com políticas de SameSite/CORS entre domínios ou IPs locais diferentes (ex.: acesso móvel via `172.x`).

---

## 3. Atomicidade no Onboarding (Usuário + Academia + Modalidade)

### Decisão
Executar a criação da academia, da modalidade inicial e do usuário gestor dentro de uma única transação SQL (`START TRANSACTION` ... `COMMIT`).

### Racional
- Garante integridade referencial estrita: se a validação do usuário falhar, nenhuma academia órfã será gravada no banco.
- Atende ao Princípio V e à stack obrigatória da Constituição (*"Utilizar transações em operações financeiras e de integridade que envolvam múltiplos registros"*).

### Alternativas Consideradas
- **Inserções separadas sem transação**: Rejeitado pelo risco de inconsistência caso ocorra falha de rede ou validação no meio do fluxo.
