import html2pdf from 'html2pdf.js';

export function exportEditorToPdf({ title }) {
  const content = document.querySelector('.ProseMirror');
  if (!content) return;

  html2pdf()
    .set({
      margin: [14, 12, 14, 12],
      filename: `${(title || 'document').trim() || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(content)
    .save();
}
