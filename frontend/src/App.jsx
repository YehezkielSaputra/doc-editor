import { useEffect, useMemo, useState } from 'react';
import api from './services/api';
import FileExplorer from './components/FileExplorer';
import EditorPane from './components/EditorPane';
import './styles.css';

export default function App() {
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState('Ready');

  const loadDocs = async () => {
    const { data } = await api.get('/document-files');
    setDocs(data);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const upload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('document', file);
    setStatus('Importing document...');
    const { data } = await api.post('/upload-document', fd);
    const uploaded = { ...data };
    if (file.type === 'application/pdf') {
      uploaded.pdfUrl = URL.createObjectURL(file);
    }
    setActive(uploaded);
    await loadDocs();
    setStatus(`Loaded ${data.name}`);
  };

  const saveDocument = async (payload) => {
    if (!active) return;
    setStatus('Saving...');
    const { data } = await api.put(`/documents/${active.id}`, payload);
    setActive(data);
    await loadDocs();
    setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
  };

  const activeDoc = useMemo(() => docs.find((x) => x.id === active?.id) || active, [docs, active]);
  const resolvedActiveDoc = useMemo(() => {
    if (!activeDoc) return null;
    const hasPdfUrl = activeDoc.pdfUrl || activeDoc.fileUrl || activeDoc.url || activeDoc.downloadUrl;
    if (hasPdfUrl) return activeDoc;

    const backendPdfPath = activeDoc.filePath || activeDoc.path || activeDoc.storagePath;
    if (backendPdfPath) {
      return { ...activeDoc, pdfUrl: `${api.defaults.baseURL}${backendPdfPath.startsWith('/') ? '' : '/'}${backendPdfPath}` };
    }

    if (activeDoc.id && activeDoc.name?.toLowerCase().endsWith('.pdf')) {
      return { ...activeDoc, pdfUrl: `${api.defaults.baseURL}/documents/${activeDoc.id}/file` };
    }

    return activeDoc;
  }, [activeDoc]);

  return (
    <main className='app-shell'>
      <FileExplorer docs={docs} onUpload={upload} onSelect={setActive} activeId={active?.id} />
      <EditorPane doc={resolvedActiveDoc} onSave={saveDocument} status={status} />
    </main>
  );
}
