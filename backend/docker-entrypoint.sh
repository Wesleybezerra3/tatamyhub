#!/bin/sh
set -e

echo "[Docker Entrypoint] Aguardando o banco de dados MySQL (${DB_HOST:-db}:${DB_PORT:-3306})..."

while ! nc -z "${DB_HOST:-db}" "${DB_PORT:-3306}"; do
  sleep 1
done

echo "[Docker Entrypoint] Banco de dados pronto! Executando migrações..."
npm run migrate

echo "[Docker Entrypoint] Executando semeadura de dados padrão (seed)..."
node src/database/seed.js || true

echo "[Docker Entrypoint] Iniciando servidor backend..."
exec "$@"
