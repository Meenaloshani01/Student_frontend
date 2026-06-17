# Student Advisor AI - Monorepo Restructure Script

Write-Host "🚀 Starting monorepo restructure..." -ForegroundColor Green

# Step 1: Create frontend folder
Write-Host "📁 Creating frontend folder..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "frontend" -Force | Out-Null

# Step 2: Get list of items to move (exclude .git and frontend folder itself)
$itemsToMove = Get-ChildItem -Path "." -Exclude "frontend", ".git", "restructure.ps1" | Where-Object { $_.Name -ne ".git" }

# Step 3: Move items to frontend folder
Write-Host "📦 Moving frontend files..." -ForegroundColor Yellow
foreach ($item in $itemsToMove) {
    Write-Host "  Moving: $($item.Name)"
    Move-Item -Path $item.FullName -Destination "frontend\" -Force
}

# Step 4: Clone backend
Write-Host "🔗 Cloning backend repository..." -ForegroundColor Yellow
git clone https://github.com/rayyan-10/student_gen.git backend

# Step 5: Create root README
Write-Host "📝 Creating root README..." -ForegroundColor Yellow
$readmeContent = @"
# Student Advisor AI - Full Stack Application

A comprehensive AI-powered student performance prediction and intervention system.

## 🏗️ Project Structure

\`\`\`
student-advisor-ai/
├── frontend/          # React application (Vite)
├── backend/           # Python FastAPI backend with ML models
└── README.md         # This file
\`\`\`

## 🚀 Quick Start

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Frontend runs at: http://localhost:5173

### Backend Setup
\`\`\`bash
cd backend
pip install -r requirements.txt
python main.py
\`\`\`
Backend runs at: http://localhost:8000

## 📚 Documentation

- **Frontend**: See \`frontend/README.md\`
- **Backend**: See \`backend/README.md\`
- **User Guide**: See \`frontend/USER_GUIDE.md\`
- **API Docs**: http://localhost:8000/docs (when backend is running)

## 🎯 Features

- ML-based student performance prediction
- Risk assessment and categorization
- Personalized study plans (AI + DP algorithm)
- Interactive dashboards and analytics
- AI advisor chatbot
- Quiz generation
- Comprehensive reporting

## 👥 Team

- Frontend: React, Vite, Recharts
- Backend: Python, FastAPI, Scikit-learn
- Database: SQLite/PostgreSQL

## 📄 License

MIT
"@

Set-Content -Path "README.md" -Value $readmeContent

# Step 6: Create root .gitignore
Write-Host "🔒 Creating root .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env

# Backend
backend/__pycache__/
backend/*.pyc
backend/.env
backend/venv/
backend/.venv/
backend/uploads/
backend/*.db
backend/*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
"@

Set-Content -Path ".gitignore" -Value $gitignoreContent

Write-Host "✅ Restructure complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 New structure:" -ForegroundColor Cyan
Write-Host "  - frontend/  (your React app)" -ForegroundColor White
Write-Host "  - backend/   (Python FastAPI)" -ForegroundColor White
Write-Host "  - README.md  (root documentation)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd frontend && npm install" -ForegroundColor White
Write-Host "  2. cd backend && pip install -r requirements.txt" -ForegroundColor White
Write-Host "  3. Update backend/.env with your settings" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To run the full stack:" -ForegroundColor Green
Write-Host "  Terminal 1: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd backend && python main.py" -ForegroundColor White
