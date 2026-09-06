#!/bin/sh
set -e

# Ensure data directory and uploads folder exist for persistent image storage
mkdir -p /app/data/uploads

# Link uploads directory so Next.js serves and writes from the persistent volume
mkdir -p /app/public
if [ ! -L /app/public/uploads ]; then
  rm -rf /app/public/uploads
  ln -s /app/data/uploads /app/public/uploads
fi

# Push schema changes to PostgreSQL database
if [ -n "$DATABASE_URL" ]; then
  echo "Connecting to PostgreSQL and synchronizing schema..."
  MAX_RETRIES=5
  COUNT=0
  until prisma db push --skip-generate || [ $COUNT -ge $MAX_RETRIES ]; do
    COUNT=$((COUNT + 1))
    echo "Waiting for database connection (retry $COUNT/$MAX_RETRIES in 2s)..."
    sleep 2
  done
  echo "Database schema synchronized successfully."
else
  echo "WARNING: DATABASE_URL is not set. Please provide a valid PostgreSQL connection string."
fi

# Execute main process (node server.js)
exec "$@"
