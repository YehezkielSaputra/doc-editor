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

async function writeDb(data) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function saveDocument(doc) {
  const all = await readDb();
  all.unshift(doc);
  await writeDb(all);
}

export async function listDocuments() {
  return readDb();
}

export async function getDocumentById(id) {
  const all = await readDb();
  return all.find((x) => x.id === id);
}

export async function updateDocumentById(id, patch) {
  const all = await readDb();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  await writeDb(all);
  return all[idx];
}
