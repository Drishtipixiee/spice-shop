#!/bin/bash
set -e

echo '🌶️  Starting Pure Spice & Dairy Shop...'
echo ''

# Start backend
echo '📦 Setting up backend...'
cd backend
pip install -r requirements.txt -q 2>/dev/null || pip3 install -r requirements.txt -q 2>/dev/null
python seed.py 2>/dev/null || python3 seed.py 2>/dev/null
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo '🎨 Setting up frontend...'
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo ''
echo '✅ Shop is starting up!'
echo '🌐 Frontend: http://localhost:3000'
echo '🔧 Backend API: http://localhost:8000'
echo '🔐 Admin panel: http://localhost:3000/admin/login'
echo '   Email: admin@spiceshop.in'
echo '   Password: Admin@1234'
echo ''
echo 'Press Ctrl+C to stop all services'

# Handle shutdown
trap 'echo "Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM
wait
