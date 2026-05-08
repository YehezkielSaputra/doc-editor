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
    setActive(data);
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

  return (
    <main className='app-shell'>
      <FileExplorer docs={docs} onUpload={upload} onSelect={setActive} activeId={active?.id} />
      <EditorPane doc={activeDoc} onSave={saveDocument} status={status} />
    </main>
  );
}
