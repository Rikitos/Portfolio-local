#!/bin/bash
# db-export.sh — run on your desktop before switching to laptop
# Place this file in the same folder as your docker-compose.yml

set -e

BACKUP_DIR="./db-backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")

# Passwords — fill these in (same as your docker-compose.yml)
RIKI_PASS=""

mkdir -p "$BACKUP_DIR"

echo "📦 Exporting portfolio database..."
docker exec portfolio-portfolio-db-1 mysqldump -uriki -p${MYSQL_ROOT_PASSWORD} portfolio \
  > "$BACKUP_DIR/portfolio_$TIMESTAMP.sql"
echo "✅ Portfolio done → $BACKUP_DIR/portfolio_$TIMESTAMP.sql"

echo "📦 Exporting shop database..."
docker exec portfolio-shop-db-1 mysqldump -uriki -p${MYSQL_ROOT_PASSWORD} shop \
  > "$BACKUP_DIR/shop_$TIMESTAMP.sql"
echo "✅ Shop done → $BACKUP_DIR/shop_$TIMESTAMP.sql"

echo ""
echo "🎒 Copy the '$BACKUP_DIR' folder to your laptop, then run db-import.sh"
