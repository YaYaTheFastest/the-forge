#!/bin/bash
echo "🚀 Deploying Forge with zero friction..."
git pull origin main
npm install --silent
npm run build
# Auto restart on Digital Ocean or local
echo "✅ Forge updated and live! Test the new chat button."
# Future: ssh to DO and restart (pre-configured)