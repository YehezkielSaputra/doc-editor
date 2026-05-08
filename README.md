# Local Document Management + AI Editing App

## Stack
- Backend: Node.js + Express + multer + pdf-parse + mammoth
- Frontend: React + Vite + TipTap
- AI: Gemini 2.5 Flash Lite via REST API

## Run locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`, frontend on `http://localhost:5173`.

## API routes
- `POST /upload-document`
- `POST /analyze-document`
- `POST /analyze-text`
- `POST /chat`
- `GET /document-files`
