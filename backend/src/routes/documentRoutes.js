import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs/promises';
import { parseDocument, toStructuredDocument } from '../services/documentParser.js';
import { saveDocument, listDocuments, getDocumentById, updateDocumentById } from '../services/storageService.js';

const router = express.Router();
const uploadDir = path.resolve('backend/uploads');
const upload = multer({ dest: uploadDir });

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
      storagePath: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText,
      contentHtml: structured.content_blocks.map((b) => (b.type === 'heading' ? `<h2>${b.text}</h2>` : `<p>${b.text}</p>`)).join(''),
      structured,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument(record);
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/documents/:id', async (req, res) => {
  try {
    const updated = await updateDocumentById(req.params.id, {
      contentHtml: req.body.contentHtml,
      rawText: req.body.rawText,
      updatedAt: new Date().toISOString()
    });

    if (!updated) return res.status(404).json({ error: 'Document not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/document-files', async (_, res) => {
  const docs = await listDocuments();
  res.json(docs);
});

router.get('/documents/:id', async (req, res) => {
  const doc = await getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

router.get('/documents/:id/file', async (req, res) => {
  const doc = await getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const fileName = doc.storagePath || path.basename(doc.path || '');
  if (!fileName) return res.status(404).json({ error: 'File path unavailable' });

  const filePath = path.resolve(uploadDir, fileName);
  try {
    await fs.access(filePath);
  } catch {
    return res.status(404).json({ error: 'File not found on server' });
  }

  if (doc.mimeType) res.type(doc.mimeType);
  res.sendFile(filePath);
});

export default router;
