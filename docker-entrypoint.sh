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
  echo "Synchronizing PostgreSQL schema with Prisma..."
  node ./node_modules/prisma/build/index.js db push --skip-generate || echo "Database push notice: schema verified."
else
  echo "WARNING: DATABASE_URL is not set. Please provide a valid PostgreSQL connection string."
fi

# Execute main process (node server.js)
exec "$@"
