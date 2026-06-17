# Backend Integration - Step by Step Guide

## 🎯 What We're Doing

Converting your current structure:
```
mini/
├── src/
├── public/
├── package.json
└── ...
```

Into a full-stack monorepo:
```
mini/
├── frontend/          # All your current files move here
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Backend cloned from GitHub
│   ├── app/
│   ├── models/
│   └── requirements.txt
└── README.md
```

## ⚠️ IMPORTANT: Backup First!

Before running any commands, commit your current work:

```bash
git add .
git commit -m "Backup before monorepo restructure"
git push origin main
```

## 🚀 Option 1: Automatic (Recommended)

Run the PowerShell script I created:

```powershell
# Run this in PowerShell from C:\Users\HP\Desktop\mini\
.\restructure.ps1
```

This will:
1. ✅ Create `frontend/` folder
2. ✅ Move all frontend files into it (except .git)
3. ✅ Clone backend from https://github.com/rayyan-10/student_gen.git
4. ✅ Create root README.md
5. ✅ Create root .gitignore

## 🔧 Option 2: Manual Steps

If you prefer to do it manually:

### Step 1: Create frontend folder
```bash
mkdir frontend
```

### Step 2: Move frontend files
Move these files/folders INTO `frontend/`:
- src/
- public/
- node_modules/
- package.json
- package-lock.json
- vite.config.js
- eslint.config.js
- index.html
- All other files EXCEPT `.git`

**Keep `.git` at the root level!**

### Step 3: Clone backend
```bash
git clone https://github.com/rayyan-10/student_gen.git backend
```

### Step 4: Update frontend API (Optional)
If you want to run backend locally, update `frontend/src/services/api.js`:

```javascript
// Change from:
const API_BASE = 'http://52.65.58.208';

// To:
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Then create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

## 📦 After Restructure

### Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

or with virtual environment:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## 🚀 Running the Full Stack

### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```
Access at: http://localhost:5173

### Terminal 2 - Backend
```bash
cd backend
python main.py
```
or
```bash
cd backend
uvicorn main:app --reload
```
Access at: http://localhost:8000

API Docs: http://localhost:8000/docs

## 🔗 Connecting Frontend to Local Backend

### Option A: Keep Using Remote Backend
Leave `api.js` as is - it will continue using http://52.65.58.208

### Option B: Use Local Backend
1. Update `frontend/src/services/api.js`:
   ```javascript
   const API_BASE = 'http://localhost:8000';
   ```

2. Make sure backend is running on port 8000

3. Backend needs CORS configured:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

## 🎯 Verification Checklist

After restructure, verify:
- [ ] `frontend/` folder exists with all React files
- [ ] `backend/` folder exists with Python backend
- [ ] `.git` is still at root level
- [ ] `frontend/node_modules/` exists (after npm install)
- [ ] `backend/requirements.txt` exists
- [ ] Root `README.md` created
- [ ] Frontend runs: `cd frontend && npm run dev`
- [ ] Backend runs: `cd backend && python main.py`

## 🔥 If Something Goes Wrong

### Revert Everything:
```bash
git reset --hard HEAD
```

This will undo all changes and restore to your last commit.

### Start Over:
1. Delete `frontend/` and `backend/` folders
2. Run `git reset --hard HEAD`
3. Try again

## 📞 Need Help?

If the script fails or you encounter issues:
1. Check that you've committed your changes
2. Make sure no files are open in editors
3. Close VS Code if it's open
4. Run PowerShell as Administrator

## ✅ Success!

Once complete, your project structure will be:
```
mini/
├── frontend/              ← Your React app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/               ← Python FastAPI backend
│   ├── app/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── README.md             ← Root documentation
└── .git/                 ← Git repository (root level)
```

You now have a complete full-stack application! 🎉
