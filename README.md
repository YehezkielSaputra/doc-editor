# Word / PDF Editor (Microsoft Word-like)

Aplikasi ini dirombak menjadi editor dokumen bergaya Microsoft Word berbasis web (gratis) menggunakan **TipTap** (open-source).

## Fitur utama
- Import file `.docx`, `.pdf`, dan `.txt`.
- Editor WYSIWYG dengan toolbar: bold, italic, underline, highlight, alignment.
- Insert image via URL.
- Insert table.
- Simpan hasil edit ke backend.
- Export dokumen ke PDF.

## Teknologi
- Frontend: React + Vite + TipTap + html2pdf.js
- Backend: Node.js + Express + pdf-parse + mammoth

## Menjalankan
### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend: `http://localhost:4000`
Frontend: `http://localhost:5173`

## API
- `POST /upload-document` - import file
- `GET /document-files` - list dokumen
- `GET /documents/:id` - detail dokumen
- `PUT /documents/:id` - simpan perubahan editor
