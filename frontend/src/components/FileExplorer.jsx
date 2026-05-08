export default function FileExplorer({ docs, onUpload, onSelect, activeId }) {
  return (
    <aside className='thumbs'>
      <div className='thumb-header'>Thumbnails</div>
      <label className='upload-tile'>
        Import file
        <input type='file' accept='.pdf,.docx,.txt' onChange={(e) => onUpload(e.target.files[0])} />
      </label>
      <div className='thumb-list'>
        {docs.map((d, idx) => (
          <button
            key={d.id}
            className={`thumb-item ${activeId === d.id ? 'active' : ''}`}
            onClick={() => onSelect(d)}
            title={d.name}
          >
            <div className='thumb-paper'>
              <div className='thumb-paper-line title' />
              <div className='thumb-paper-line' />
              <div className='thumb-paper-line' />
              <div className='thumb-paper-line' />
            </div>
            <span className='thumb-index'>{idx + 1}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
