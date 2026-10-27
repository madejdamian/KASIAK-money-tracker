#!/bin/sh
# A dump of the Kasiak database, one file per day, the last 14 are kept.
# Cron (every night at 3:00):  0 3 * * * /root/kasiak/backup.sh
# Restore:  gunzip -c kasiak-YYYY-MM-DD.sql.gz | docker exec -i kasiak-db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
set -eu

DIR="${BACKUP_DIR:-/root/kasiak-backups}"
mkdir -p "$DIR"

docker exec kasiak-db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$DIR/kasiak-$(date +%F).sql.gz"
find "$DIR" -name 'kasiak-*.sql.gz' -mtime +14 -delete
