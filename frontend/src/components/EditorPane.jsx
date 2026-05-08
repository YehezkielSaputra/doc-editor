import { useState } from 'react';
import SimpleEditor from './SimpleEditor';
import { importPdfToHtml } from './PdfImporter';
import { exportEditorToPdf } from './exportPdf';

export default function EditorPane() {
  const [title, setTitle] = useState('Imported Document');
  const [content, setContent] = useState('<p>Upload a PDF to start editing.</p>');
  const [loading, setLoading] = useState(false);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const html = await importPdfToHtml(file);
      setContent(html || '<p></p>');
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
      {loading ? <div className='status'>Parsing PDF pages...</div> : <div className='status'>Ready</div>}
      <SimpleEditor content={content} onSave={setContent} />
    </section>
  );
}
