#!/bin/bash

# Replace all localhost:8000 with production URL in TypeScript and TSX files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|http://localhost:8000|https://zalominiapp.vtlink.vn|g'

echo "✅ Replaced all localhost:8000 URLs with production URLs"
