import { useState } from 'react';
import { importPdfLayout } from './PdfImporter';
import { exportEditorToPdf } from './exportPdf';
import PdfLayoutEditor from './PdfLayoutEditor';

export default function EditorPane() {
  const [title, setTitle] = useState('Imported Document');
  const [content, setContent] = useState('');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const layoutPages = await importPdfLayout(file);
      setPages(layoutPages);
      setTitle(file.name.replace(/\.pdf$/i, '') || 'Imported Document');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <section className='editor-shell'>
      <div className='top-toolbar'>
        <label className='tool'>
          Import PDF
          <input type='file' accept='application/pdf' onChange={handleImport} hidden />
        </label>
        <input
          className='doc-title-input'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='Document title'
        />
        <button className='tool' onClick={() => exportEditorToPdf({ title })}>Export PDF</button>
      </div>
      {loading ? <div className='status'>Extracting PDF layout (text + posisi)...</div> : <div className='status'>Ready</div>}
      <PdfLayoutEditor pages={pages} onSave={setContent} />
      <input type='hidden' value={content} readOnly />
    </section>
  );
}
