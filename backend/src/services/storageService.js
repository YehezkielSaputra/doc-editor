import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve('backend/src/data/documents.json');

async function readDb() {
  try {
    const content = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveDocument(doc) {
  const all = await readDb();
  all.unshift(doc);
  await fs.writeFile(dbPath, JSON.stringify(all, null, 2));
}

export async function listDocuments() {
  return readDb();
}

export async function getDocumentById(id) {
  const all = await readDb();
  return all.find((x) => x.id === id);
}
