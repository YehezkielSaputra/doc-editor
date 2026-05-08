export default function FileExplorer({ docs, onUpload, onSelect, activeId }) {
  return (
    <aside className='panel'>
      <h3>Documents</h3>
      <input type='file' onChange={(e) => onUpload(e.target.files[0])} />
      <ul>{docs.map((d) => <li key={d.id}><button className={activeId===d.id?'active':''} onClick={() => onSelect(d)}>{d.name}</button></li>)}</ul>
    </aside>
  );
}
