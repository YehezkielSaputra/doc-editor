import { useEffect, useState } from 'react';
import api from './services/api';
import FileExplorer from './components/FileExplorer';
import EditorPane from './components/EditorPane';
import ChatPane from './components/ChatPane';
import './styles.css';

export default function App() {
  const [docs, setDocs] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);

  const loadDocs = async () => { const { data } = await api.get('/document-files'); setDocs(data); };
  useEffect(() => { loadDocs(); }, []);

  const upload = async (file) => {
    const fd = new FormData(); fd.append('document', file);
    const { data } = await api.post('/upload-document', fd);
    setActive(data); await loadDocs();
  };

  const analyzeText = async (text) => {
    const { data } = await api.post('/analyze-text', { text });
    setMessages((m) => [...m, { role: 'assistant', text: data.output }]);
  };

  const ask = async (question) => {
    if (!active) return;
    setMessages((m) => [...m, { role: 'user', text: question }, { role: 'assistant', text: '...' }]);
    const { data } = await api.post('/chat', { id: active.id, question });
    setMessages((m) => [...m.slice(0, -1), { role: 'assistant', text: data.output }]);
  };

  return <main className='layout'><FileExplorer docs={docs} onUpload={upload} onSelect={setActive} activeId={active?.id} /><EditorPane doc={active} onAnalyzeText={analyzeText} /><ChatPane onAsk={ask} messages={messages} /></main>;
}
