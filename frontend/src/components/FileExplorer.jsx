export default function FileExplorer({ docs, onUpload, onSelect, activeId }) {
  return (
    <aside className='panel sidebar'>
      <h3>Word / PDF Files</h3>
      <p className='hint'>Import .docx, .pdf, atau .txt lalu edit seperti dokumen office.</p>
      <input type='file' accept='.pdf,.docx,.txt' onChange={(e) => onUpload(e.target.files[0])} />
      <ul>
        {docs.map((d) => (
          <li key={d.id}>
            <button className={activeId === d.id ? 'active' : ''} onClick={() => onSelect(d)}>
              {d.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
