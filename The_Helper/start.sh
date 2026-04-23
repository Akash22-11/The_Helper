#!/bin/bash

echo "🚀 Starting Black Gold Health Platform..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if pgrep -x "mongod" > /dev/null
then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting...${NC}"
    # Try to start MongoDB (works on Mac with Homebrew)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        echo -e "${YELLOW}Please start MongoDB manually${NC}"
    fi
fi

echo ""

# Start backend
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if database is seeded
echo "🌱 Checking database..."
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/black-gold-health')
  .then(() => {
    mongoose.connection.db.collection('hospitals').countDocuments()
      .then(count => {
        if (count === 0) {
          console.log('No data found. Run: node seed.js');
        } else {
          console.log('✅ Database has data');
        }
        process.exit(0);
      });
  })
  .catch(() => {
    console.log('⚠️  Could not connect to MongoDB');
    process.exit(1);
  });
" 2>/dev/null || echo "Run 'node seed.js' to seed database"

# Start backend in background
npm run dev &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend started on http://localhost:5000${NC}"
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Start frontend
echo -e "${BLUE}🌐 Starting Frontend Server...${NC}"
cd ../frontend

# Check if Python is available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:8000${NC}"
elif command -v python &> /dev/null; then
    python -m http.server 8000 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:8000${NC}"
elif command -v npx &> /dev/null; then
    npx http-server -p 8000 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  No HTTP server available. Install Python or run: npx http-server -p 8000${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}🎉 Black Gold Health is Running!${NC}"
echo "======================================"
echo ""
echo "📍 Backend:  http://localhost:5000"
echo "📍 Frontend: http://localhost:8000"
echo "📍 Health:   http://localhost:5000/health"
echo ""
echo "Test Login:"
echo "  Hospital: contact@citygeneralhospital.com / hospital123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to stop
wait
