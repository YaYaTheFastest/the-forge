#!/bin/bash
echo "🚀 Updating The Forge magically..."
git pull
npm install
npm run build
npm run start
echo "✅ Forge is now amazing and updated! Open your browser."