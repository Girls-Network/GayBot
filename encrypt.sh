#!/bin/bash

echo "🔐 DotenvX Quick Setup Script"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file first with your secrets."
    echo ""
fi

echo "✅ Found .env file"
echo ""

# Check if dotenvx is installed
if ! command -v dotenvx &> /dev/null; then
    echo "📦 Installing dotenvx globally..."
    npm install -g @dotenvx/dotenvx
    echo ""
fi

echo "🔒 Encrypting .env file..."
dotenvx encrypt

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "Run: docker compose up -d"
echo ""
echo "🔐 IMPORTANT: Keep .env.keys LOCAL - DO NOT commit it!"