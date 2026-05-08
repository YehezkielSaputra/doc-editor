let pdfjsPromise;

async function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
  }
  const pdfjsLib = await pdfjsPromise;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  return pdfjsLib;
}

const sanitizeText = (value) => value?.replace(/\s+/g, ' ').trim() || '';

function textItemsToLineBlocks(items, viewportHeight) {
  const lines = new Map();

  items.forEach((item) => {
    const raw = sanitizeText(item.str);
    if (!raw) return;

    const x = item.transform[4];
    const yPdf = item.transform[5];
    const fontSize = Math.max(10, Math.abs(item.height || item.transform[0] || 12));
    const yDom = viewportHeight - yPdf;
    const rowKey = Math.round(yDom / 3) * 3;

    const line = lines.get(rowKey) || {
      top: yDom,
      height: fontSize * 1.25,
      chunks: []
    };

    line.top = Math.min(line.top, yDom);
    line.height = Math.max(line.height, fontSize * 1.25);
    line.chunks.push({ x, text: raw, size: fontSize });
    lines.set(rowKey, line);
  });

  return [...lines.values()]
    .map((line) => {
      const sorted = line.chunks.sort((a, b) => a.x - b.x);
      const text = sorted.map((chunk) => chunk.text).join(' ').replace(/\s+/g, ' ').trim();
      const left = sorted[0]?.x ?? 0;
      const fontSize = sorted.reduce((max, chunk) => Math.max(max, chunk.size), 12);

      return {
        left,
        top: line.top,
        width: Math.max(120, 595 - left),
        height: Math.max(line.height, fontSize * 1.25),
        fontSize,
        text
      };
    })
    .filter((line) => line.text)
    .sort((a, b) => a.top - b.top);
}

export async function importPdfLayout(file) {
  const pdfjsLib = await getPdfJs();
  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const lines = textItemsToLineBlocks(textContent.items, viewport.height);

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      lines
    });
  }

  return pages;
}
