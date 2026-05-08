let pdfjsPromise;

async function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
  }
  const pdfjsLib = await pdfjsPromise;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  return pdfjsLib;
}

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const rowsToHtml = (items) => {
  const rows = new Map();
  items.forEach((item) => {
    const y = Math.round(item.transform[5]);
    const x = item.transform[4];
    const fontHeight = Math.abs(item.height || item.transform[0] || 12);
    const bucket = rows.get(y) || { y, height: fontHeight, items: [] };
    bucket.height = Math.max(bucket.height, fontHeight);
    bucket.items.push({ x, text: item.str.trim() });
    rows.set(y, bucket);
  });

  return [...rows.values()]
    .sort((a, b) => b.y - a.y)
    .map((row) => ({
      text: row.items.sort((a, b) => a.x - b.x).map((chunk) => chunk.text).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
      height: row.height
    }))
    .filter((row) => row.text.length > 0);
};

export async function importPdfToHtml(file) {
  const pdfjsLib = await getPdfJs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pageMarkup = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const rows = rowsToHtml(textContent.items);
    const html = rows.map(({ text, height }, index) => (index === 0 || height >= 16 ? `<h2>${escapeHtml(text)}</h2>` : `<p>${escapeHtml(text)}</p>`)).join('');
    pageMarkup.push(`<section data-page="${pageNumber}">${html || '<p></p>'}</section>`);
  }

  return pageMarkup.join('');
}
