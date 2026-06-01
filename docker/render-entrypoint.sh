#!/bin/bash
set -euo pipefail

if [ -z "${CORS_ORIGIN:-}" ]; then
  echo "ERROR: Set CORS_ORIGIN to your Vercel frontend URL (e.g. https://your-app.vercel.app)"
  exit 1
fi

export PORT="${PORT:-4000}"
export PGDATA="${PGDATA:-/var/lib/postgresql/data}"

# JWT — يُولَّد تلقائياً إن لم يُعرَّف (لا حاجة لإدخاله يدوياً)
if [ -z "${JWT_ACCESS_SECRET:-}" ]; then
  export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
fi
if [ -z "${JWT_REFRESH_SECRET:-}" ]; then
  export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
fi

export JWT_ACCESS_EXPIRES_IN="${JWT_ACCESS_EXPIRES_IN:-15m}"
export JWT_REFRESH_EXPIRES_IN="${JWT_REFRESH_EXPIRES_IN:-7d}"

echo "Starting Redis..."
redis-server --daemonize yes --bind 127.0.0.1 --port 6379 --maxmemory-policy noeviction

echo "Starting PostgreSQL..."
mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su - postgres -c "initdb -D '$PGDATA' -E UTF8 --locale=C"
  {
    echo "listen_addresses = '127.0.0.1'"
    echo "port = 5432"
  } >> "$PGDATA/postgresql.conf"
  {
    echo "local all all trust"
    echo "host all all 127.0.0.1/32 trust"
  } >> "$PGDATA/pg_hba.conf"
fi

su - postgres -c "pg_ctl -D '$PGDATA' -w start"

until su - postgres -c "pg_isready -q"; do
  sleep 1
done

until redis-cli -h 127.0.0.1 ping 2>/dev/null | grep -q PONG; do
  sleep 1
done

if ! su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='todo'\"" | grep -q 1; then
  su - postgres -c "psql -c \"CREATE USER todo WITH PASSWORD 'todo_secret';\""
fi
if ! su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='todo_db'\"" | grep -q 1; then
  su - postgres -c "psql -c \"CREATE DATABASE todo_db OWNER todo;\""
fi
su - postgres -c "psql -d todo_db -c \"GRANT ALL ON SCHEMA public TO todo; ALTER SCHEMA public OWNER TO todo;\""

export DATABASE_URL="postgresql://todo:todo_secret@127.0.0.1:5432/todo_db"
export REDIS_URL="redis://127.0.0.1:6379"

echo "Running migrations and seed..."
cd /app/backend
npx prisma migrate deploy
npx prisma db seed

echo "Starting API + Worker (CORS: $CORS_ORIGIN)..."
exec npm run start:all
