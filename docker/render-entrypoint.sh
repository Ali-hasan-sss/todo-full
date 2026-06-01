#!/bin/bash
set -euo pipefail

if [ -z "${CORS_ORIGIN:-}" ]; then
  echo "ERROR: Set CORS_ORIGIN to your Vercel frontend URL (e.g. https://your-app.vercel.app)"
  exit 1
fi

export PORT="${PORT:-4000}"

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
PG_VERSION="$(ls -1 /usr/lib/postgresql 2>/dev/null | sort -rn | head -1)"
PG_CLUSTER="${PG_CLUSTER:-main}"

if [ -z "$PG_VERSION" ]; then
  echo "ERROR: PostgreSQL not installed in image"
  exit 1
fi

if ! pg_lsclusters -h 2>/dev/null | awk '{print $1" "$2}' | grep -qx "${PG_VERSION} ${PG_CLUSTER}"; then
  echo "Creating PostgreSQL cluster ${PG_VERSION}/${PG_CLUSTER}..."
  pg_createcluster "$PG_VERSION" "$PG_CLUSTER" --port 5432
fi

pg_ctlcluster "$PG_VERSION" "$PG_CLUSTER" start

until pg_isready -h 127.0.0.1 -p 5432 -q; do
  sleep 1
done

until redis-cli -h 127.0.0.1 ping 2>/dev/null | grep -q PONG; do
  sleep 1
done

PG_HBA="/etc/postgresql/${PG_VERSION}/${PG_CLUSTER}/pg_hba.conf"
if [ -f "$PG_HBA" ] && ! grep -q "127.0.0.1/32.*todo_db" "$PG_HBA"; then
  echo "host todo_db todo 127.0.0.1/32 scram-sha-256" >> "$PG_HBA"
  pg_ctlcluster "$PG_VERSION" "$PG_CLUSTER" reload
fi

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
cd /app
npx prisma migrate deploy
node dist/scripts/seed.js

echo "Starting API + Worker (CORS: $CORS_ORIGIN)..."
exec npm run start:all
