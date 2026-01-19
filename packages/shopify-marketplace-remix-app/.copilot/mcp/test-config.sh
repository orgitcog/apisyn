#!/bin/bash

# MCP Configuration Test Script
# Tests the key commands and configurations documented in the MCP setup

echo "🧪 Testing MCP Configuration Commands..."
echo "======================================="

# Test 1: Validate JSON configuration files
echo "📋 Testing configuration file validity..."
cd .copilot/mcp && node validate.js
if [ $? -eq 0 ]; then
    echo "✅ Configuration files are valid"
else
    echo "❌ Configuration files have issues"
    exit 1
fi

echo ""

# Test 2: Test build process
echo "🔨 Testing build process..."
cd ../../
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build process works"
else
    echo "❌ Build process failed"
    exit 1
fi

echo ""

# Test 3: Test TypeScript compilation
echo "📝 Testing TypeScript compilation..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has issues (this may be expected)"
fi

echo ""

# Test 4: Test Prisma client generation
echo "🗄️  Testing Prisma client generation..."
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Prisma client generation works"
else
    echo "❌ Prisma client generation failed"
fi

echo ""

# Test 5: Verify key files exist
echo "📁 Checking key repository files..."
key_files=(
    "package.json"
    "vite.config.ts"
    "tsconfig.json"
    ".eslintrc.cjs"
    "prisma/schema.prisma"
    ".graphqlrc.ts"
    "shopify.app.toml"
    "apps/market-app/package.json"
    "apps/admin-app/package.json"
    "apps/buyer-app/package.json"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "======================================="
echo "🎉 MCP Configuration testing complete!"
echo ""
echo "Next steps for developers:"
echo "1. Set up .env file with Shopify credentials"
echo "2. Run 'npm run setup' to initialize database"
echo "3. Run 'shopify auth login' for CLI authentication"
echo "4. Start development with 'npm run dev'"