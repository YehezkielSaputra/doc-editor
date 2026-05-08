import { useEffect, useState } from 'react';

const scaleToCanvas = 1.33; // 72dpi PDF point to ~96dpi CSS px

export default function PdfLayoutEditor({ pages, onSave }) {
  const [draftPages, setDraftPages] = useState(pages || []);

  useEffect(() => {
    setDraftPages(pages || []);
  }, [pages]);

  const handleLineChange = (pageIndex, lineIndex, value) => {
    setDraftPages((current) => current.map((page, pIdx) => {
      if (pIdx !== pageIndex) return page;
      return {
        ...page,
        lines: page.lines.map((line, lIdx) => (lIdx === lineIndex ? { ...line, text: value } : line))
      };
    }));
  };

  const saveAsHtml = () => {
    const html = draftPages.map((page) => {
      const pageStyle = `position:relative;width:${Math.round(page.width * scaleToCanvas)}px;height:${Math.round(page.height * scaleToCanvas)}px;`;
      const linesHtml = page.lines.map((line) => {
        const lineStyle = [
          `position:absolute`,
          `left:${Math.round(line.left * scaleToCanvas)}px`,
          `top:${Math.round(line.top * scaleToCanvas)}px`,
          `width:${Math.round(line.width * scaleToCanvas)}px`,
          `min-height:${Math.round(line.height * scaleToCanvas)}px`,
          `font-size:${Math.max(10, Math.round(line.fontSize * scaleToCanvas))}px`,
          'line-height:1.2'
        ].join(';');
        return `<div style="${lineStyle}">${line.text}</div>`;
      }).join('');
      return `<section data-page="${page.pageNumber}" style="${pageStyle}">${linesHtml}</section>`;
    }).join('');

    onSave(html);
  };

  return (
    <>
      <div className='sub-toolbar'>
        <button onClick={saveAsHtml}>Save</button>
      </div>
      <div className='page-canvas'>
        {draftPages.map((page, pageIndex) => (
          <section
            className='pdf-page'
            key={page.pageNumber}
            style={{ width: `${Math.round(page.width * scaleToCanvas)}px`, height: `${Math.round(page.height * scaleToCanvas)}px` }}
          >
            {page.lines.map((line, lineIndex) => (
              <div
                key={`${page.pageNumber}-${lineIndex}`}
                className='pdf-line-block'
                contentEditable
                suppressContentEditableWarning
                style={{
                  left: `${Math.round(line.left * scaleToCanvas)}px`,
                  top: `${Math.round(line.top * scaleToCanvas)}px`,
                  width: `${Math.round(line.width * scaleToCanvas)}px`,
                  minHeight: `${Math.round(line.height * scaleToCanvas)}px`,
                  fontSize: `${Math.max(10, Math.round(line.fontSize * scaleToCanvas))}px`
                }}
                onInput={(event) => handleLineChange(pageIndex, lineIndex, event.currentTarget.textContent || '')}
              >
                {line.text}
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
