# Student Advisor AI – Frontend

Professional React frontend for the **Student Result Analysis & Pass Prediction** system. Connects to a FastAPI backend at `http://127.0.0.1:8000`.

## Run the app

1. **Start the FastAPI backend** on port 8000 (with CORS enabled for `http://localhost:5173` or your dev origin).

2. **Install and run the frontend:**
   ```bash
   npm install
   npm run dev
   ```
   Open the URL shown (usually http://localhost:5173).

## Build for production

```bash
npm run build
```
Output is in `dist/`. Serve with any static host.

## Backend API

- `GET /students` – list all students and total count  
- `GET /students/{student_id}` – single student  
- `POST /ask_advisor` – body `{ "query": "string" }` – returns `response_type`, `message`, `data`

## Tech stack

- Vite + React (JavaScript)
- React Router, Axios, Recharts
- Vanilla CSS with variables (no Tailwind)

## Pages

- **Dashboard (/)** – summary cards, risk donut chart, searchable/sortable student table  
- **Student Detail (/student/:id)** – metrics, topic radar chart, Analyze Risk, Generate Quiz (if HIGH risk)  
- **AI Advisor (/advisor)** – chat UI with quick actions and typed queries  

Theme: dark (slate-900/slate-800), accent blue/purple, risk colors red/amber/green. Fonts: Outfit, Inter.
