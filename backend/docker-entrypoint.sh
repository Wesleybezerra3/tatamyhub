#!/bin/sh
set -e

echo "[Docker Entrypoint] Iniciando backend TatamyHub..."

# Se configurado para PostgreSQL / Supabase, o schema já é gerenciado no Supabase
if [ "$DB_PORT" = "6543" ] || [ "$DB_PORT" = "5432" ] || [ -n "$DATABASE_URL" ]; then
  echo "[Docker Entrypoint] Ambiente configurado para Supabase PostgreSQL."
else
  echo "[Docker Entrypoint] Aguardando o banco de dados (${DB_HOST:-db}:${DB_PORT:-3306})..."
  while ! nc -z "${DB_HOST:-db}" "${DB_PORT:-3306}"; do
    sleep 1
  done
  echo "[Docker Entrypoint] Banco de dados pronto! Executando migrações..."
  npm run migrate || true
  node src/database/seed.js || true
fi

echo "[Docker Entrypoint] Iniciando servidor backend..."
exec "$@"
