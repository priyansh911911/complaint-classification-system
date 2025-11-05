#!/bin/bash
# Build script for Vercel deployment

echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build complete! Ready for Vercel deployment."
echo "Run 'vercel' to deploy to production."