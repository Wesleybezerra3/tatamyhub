# 🐳 TatamyHub - Guia de Execução com Docker

Este projeto está totalmente conteinerizado com **Docker** e **Docker Compose**, orquestrando o **Frontend (React + Nginx)**, o **Backend (Node.js Express)** e o **Banco de Dados (MySQL 8.0)**.

---

## 📌 Serviços e Portas

| Serviço | Contêiner | Porta Externa | Descrição |
|---------|-----------|:-------------:|-----------|
| **Frontend** | `tatamyhub-frontend` | `5173` | Aplicação Web React PWA servida via Nginx de alta performance com reverse proxy |
| **Backend** | `tatamyhub-backend` | `3001` | API REST Node.js Express com auto-migração e semeadura |
| **Banco de Dados** | `tatamyhub-db` | `3307` | MySQL 8.0 com volume persistente (porta 3307 evita conflito com MySQL local) |

---

## 🚀 Como Iniciar

### 1. Subir todos os serviços em segundo plano:
```bash
docker-compose up -d
```

> **Nota**: No primeiro início, o contêiner do backend aguarda o MySQL ficar saudável, executa automaticamente todas as migrations (`001`, `002`, `003`) e insere os dados iniciais (`seed.js`).

### 2. Acessar a aplicação:
- Abra no seu navegador: **[http://localhost:5173](http://localhost:5173)**
- **Usuário Padrão**: `admin@tatamyhub.com`
- **Senha Padrão**: `admin123`

---

## 🛠️ Comandos Úteis do Docker Compose

### Ver o status dos contêineres:
```bash
docker-compose ps
```

### Acompanhar os logs em tempo real:
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### Reconstruir as imagens após alterações no código:
```bash
docker-compose up -d --build
```

### Parar os serviços:
```bash
docker-compose down
```

### Parar e remover volumes (limpeza completa do banco):
```bash
docker-compose down -v
```

---

## 🔒 Dados e Volumes Persistentes

- `tatamyhub_mysql_data`: Garante que os dados dos alunos, academias e graduações persistam mesmo que os contêineres sejam destruídos ou reiniciados.
- `tatamyhub_uploads_data`: Armazena os logos das academias enviados por upload.
