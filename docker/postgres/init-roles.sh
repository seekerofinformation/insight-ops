#!/bin/sh
set -eu

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=ON_ERROR_STOP=1 \
  --set=migrator_password="$POSTGRES_MIGRATOR_PASSWORD" \
  --set=app_password="$POSTGRES_APP_PASSWORD" \
  --set=database_name="$POSTGRES_DB" <<'SQL'
CREATE ROLE insightops_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD :'migrator_password';
CREATE ROLE insightops_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD :'app_password';

GRANT CONNECT ON DATABASE :"database_name" TO insightops_migrator, insightops_app;
GRANT CREATE ON DATABASE :"database_name" TO insightops_migrator;
GRANT USAGE, CREATE ON SCHEMA public TO insightops_migrator;
GRANT USAGE ON SCHEMA public TO insightops_app;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
