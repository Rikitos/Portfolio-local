#!/bin/bash
# db-import.sh — run on your laptop after copying db-backups/ folder here
# Place this file in the same folder as your docker-compose.yml

set -e

BACKUP_DIR="./db-backups"

# Passwords — fill these in (same as your docker-compose.yml)
RIKI_PASS=""

PORTFOLIO_FILE=$(ls -t "$BACKUP_DIR"/portfolio_*.sql 2>/dev/null | head -1)
SHOP_FILE=$(ls -t "$BACKUP_DIR"/shop_*.sql 2>/dev/null | head -1)

if [ -z "$PORTFOLIO_FILE" ] || [ -z "$SHOP_FILE" ]; then
  echo "❌ No backup files found in $BACKUP_DIR"
  echo "   Make sure you copied the db-backups/ folder from your desktop."
  exit 1
fi

echo "🔍 Found backups:"
echo "   Portfolio:  $PORTFOLIO_FILE"
echo "   Shop:       $SHOP_FILE"
echo ""
read -p "⚠️  This will OVERWRITE your local databases. Continue? (y/N) " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "📥 Importing portfolio database..."
docker exec -i portfolio-portfolio-db-1 mysql -uriki -p${MYSQL_ROOT_PASSWORD} portfolio < "$PORTFOLIO_FILE"
echo "✅ Portfolio done"

echo "📥 Importing shop database..."
docker exec -i portfolio-shop-db-1 mysql -uriki -p${MYSQL_ROOT_PASSWORD} shop < "$SHOP_FILE"
echo "✅ Shop done"

echo ""
echo "🚀 All done! Your local databases are up to date."
