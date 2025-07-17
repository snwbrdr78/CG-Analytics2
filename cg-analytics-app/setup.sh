#!/bin/bash

echo "🚀 Setting up CG Analytics..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL is required but not installed. Aborting." >&2; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials"
fi

# Install dependencies
echo "Installing dependencies..."
npm install:all

# Create database
echo "Creating database..."
createdb cg_analytics 2>/dev/null || echo "Database might already exist"

# Create uploads directory
mkdir -p backend/uploads

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Run 'npm run dev' to start the development servers"
echo "3. Visit http://localhost:5173 to access the app"