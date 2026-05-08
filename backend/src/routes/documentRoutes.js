import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { parseDocument, toStructuredDocument } from '../services/documentParser.js';
import { analyzeTextWithGemini, chatWithGemini } from '../services/aiService.js';
import { saveDocument, listDocuments, getDocumentById } from '../services/storageService.js';

const router = express.Router();
const upload = multer({ dest: path.resolve('backend/uploads') });

router.post('/upload-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const rawText = await parseDocument(req.file.path, req.file.mimetype);
    const structured = toStructuredDocument(rawText, req.file.originalname);

    const record = {
      id: crypto.randomUUID(),
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      path: req.file.path,
      rawText,
      structured,
      createdAt: new Date().toISOString(),
      ai: null
    };
    await saveDocument(record);
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/analyze-document', async (req, res) => {
  try {
    const { id } = req.body;
    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const ai = await analyzeTextWithGemini(doc.rawText.slice(0, 50000));
    res.json(ai);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/analyze-text', async (req, res) => {
  try {
    const { text } = req.body;
    const ai = await analyzeTextWithGemini(text || '');
    res.json(ai);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { id, question } = req.body;
    const doc = await getDocumentById(id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const answer = await chatWithGemini(question, doc.rawText.slice(0, 50000));
    res.json(answer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/document-files', async (_, res) => {
  const docs = await listDocuments();
  res.json(docs.map(({ rawText, ...rest }) => rest));
});

export default router;
