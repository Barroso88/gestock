#!/bin/sh
set -e

# Default DATABASE_URL to persistent volume if not provided
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/gestock.db"
fi

# Ensure data directory and uploads folder exist
mkdir -p /app/data/uploads

# Link uploads directory so Next.js serves and writes from the persistent volume
mkdir -p /app/public
if [ ! -L /app/public/uploads ]; then
  rm -rf /app/public/uploads
  ln -s /app/data/uploads /app/public/uploads
fi

# Push schema changes to the SQLite database
echo "Synchronizing database schema to ${DATABASE_URL}..."
node ./node_modules/prisma/build/index.js db push --skip-generate || echo "Database push notice: schema verified."

# Execute main process (node server.js)
exec "$@"
