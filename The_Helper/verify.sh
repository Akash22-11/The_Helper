#!/bin/bash

echo "🔍 Black Gold Health - Project Verification"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 - MISSING"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ - MISSING"
        return 1
    fi
}

total=0
passed=0

echo "📁 DIRECTORY STRUCTURE"
echo "----------------------"
((total++)); check_dir "frontend" && ((passed++))
((total++)); check_dir "backend" && ((passed++))
((total++)); check_dir "backend/models" && ((passed++))
((total++)); check_dir "backend/routes" && ((passed++))
((total++)); check_dir "backend/middleware" && ((passed++))
((total++)); check_dir "backend/utils" && ((passed++))
((total++)); check_dir "backend/config" && ((passed++))

echo ""
echo "🌐 FRONTEND FILES"
echo "-----------------"
((total++)); check_file "frontend/index.html" && ((passed++))
((total++)); check_file "frontend/sos-active.html" && ((passed++))
((total++)); check_file "frontend/hospital-dashboard.html" && ((passed++))
((total++)); check_file "frontend/hospital-finder.html" && ((passed++))
((total++)); check_file "frontend/pharmacy-finder.html" && ((passed++))
((total++)); check_file "frontend/prescription-organiser.html" && ((passed++))
((total++)); check_file "frontend/wellness-tips.html" && ((passed++))

echo ""
echo "⚙️  BACKEND MODELS"
echo "-----------------"
((total++)); check_file "backend/models/User.js" && ((passed++))
((total++)); check_file "backend/models/Hospital.js" && ((passed++))
((total++)); check_file "backend/models/SOSAlert.js" && ((passed++))
((total++)); check_file "backend/models/Pharmacy.js" && ((passed++))

echo ""
echo "🛣️  BACKEND ROUTES"
echo "-----------------"
((total++)); check_file "backend/routes/auth.js" && ((passed++))
((total++)); check_file "backend/routes/sos.js" && ((passed++))
((total++)); check_file "backend/routes/user.js" && ((passed++))
((total++)); check_file "backend/routes/hospitals.js" && ((passed++))
((total++)); check_file "backend/routes/pharmacies.js" && ((passed++))

echo ""
echo "🔧 BACKEND CORE"
echo "---------------"
((total++)); check_file "backend/server.js" && ((passed++))
((total++)); check_file "backend/package.json" && ((passed++))
((total++)); check_file "backend/.env" && ((passed++))
((total++)); check_file "backend/seed.js" && ((passed++))
((total++)); check_file "backend/config/database.js" && ((passed++))
((total++)); check_file "backend/middleware/auth.js" && ((passed++))
((total++)); check_file "backend/utils/logger.js" && ((passed++))
((total++)); check_file "backend/utils/notifications.js" && ((passed++))

echo ""
echo "📚 DOCUMENTATION"
echo "----------------"
((total++)); check_file "README.md" && ((passed++))
((total++)); check_file "SETUP_GUIDE.md" && ((passed++))
((total++)); check_file "backend/README.md" && ((passed++))

echo ""
echo "🚀 STARTUP SCRIPTS"
echo "------------------"
((total++)); check_file "start.sh" && ((passed++))
((total++)); check_file "start.bat" && ((passed++))

echo ""
echo "==========================================="
echo -e "Result: ${GREEN}${passed}${NC}/${total} checks passed"
echo ""

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ All files present! Project is complete.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. cd backend && npm install"
    echo "2. node seed.js"
    echo "3. npm run dev"
    echo "4. Open http://localhost:8000"
else
    echo -e "${RED}❌ Some files are missing. Please check above.${NC}"
fi

echo ""
