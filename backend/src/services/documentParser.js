import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const headingPattern = /^[A-Z][A-Za-z\d\s\-:]{2,80}$/;

export async function parseDocument(filePath, mimeType) {
  if (mimeType.includes('pdf')) {
    const dataBuffer = await fs.readFile(filePath);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text;
  }

  if (mimeType.includes('word') || filePath.endsWith('.docx')) {
    const parsed = await mammoth.extractRawText({ path: filePath });
    return parsed.value;
  }

  return fs.readFile(filePath, 'utf-8');
}

export function toStructuredDocument(rawText, filename) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const content_blocks = lines.map((line) => {
    if (headingPattern.test(line) && line.length < 90) {
      return { type: 'heading', text: line };
    }
    return { type: 'paragraph', text: line };
  });

  return {
    title: filename.replace(/\.[^.]+$/, ''),
    metadata: {
      createdAt: new Date().toISOString(),
      source: filename
    },
    content_blocks
  };
}
