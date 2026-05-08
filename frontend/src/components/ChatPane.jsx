import { useState } from 'react';
export default function ChatPane({ onAsk, messages }) {
  const [q, setQ] = useState('');
  return <aside className='panel'><h3>AI Assistant</h3><div className='chat'>{messages.map((m, i)=><div key={i} className={m.role}>{m.role}: {m.text}</div>)}</div><textarea value={q} onChange={(e)=>setQ(e.target.value)} placeholder='Ask about document...' /><button onClick={()=>{onAsk(q);setQ('');}}>Send</button></aside>;
}
