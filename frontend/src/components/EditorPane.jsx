import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const blank = '<p></p>';

export default function EditorPane({ doc, onSave, status }) {
  const pdfUrl = doc?.pdfUrl || doc?.fileUrl || doc?.url || doc?.downloadUrl || null;
  const isPdf = Boolean(doc?.name?.toLowerCase().endsWith('.pdf')) && Boolean(pdfUrl);
  const content = doc?.contentHtml || doc?.structured?.content_blocks?.map((b) => (b.type === 'heading' ? `<h2>${b.text}</h2>` : `<p>${b.text}</p>`)).join('') || blank;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Tulis isi dokumen...' })
    ],
    content
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(content);
  }, [content, editor]);

  if (!doc) {
    return (
      <section className='editor-shell'>
        <div className='top-toolbar empty-tools'>
          <button className='tool' title='Daftar dokumen'>📄</button>
          <button className='tool' disabled>↩️</button>
          <button className='tool' disabled>↪️</button>
          <button className='tool' disabled>➕</button>
          <button className='tool' disabled>✏️</button>
          <button className='tool' disabled>✍️</button>
          <button className='tool' disabled>🖍️</button>
          <button className='tool' disabled>🧽</button>
          <button className='tool' disabled>🖼️</button>
          <button className='tool' disabled>🔗</button>
          <button className='tool' disabled>📝</button>
          <button className='tool' disabled>🔎</button>
        </div>
        <div className='status'>{status}</div>
        <div className='page-canvas empty-canvas'>
          <div className='empty-state'>Belum ada dokumen. Silakan upload lalu pilih file untuk mulai edit.</div>
        </div>
      </section>
    );
  }

  if (isPdf) {
    return (
      <section className='editor-shell'>
        <div className='status'>{status}</div>
        <div className='page-canvas pdf-canvas'>
          <iframe
            className='pdf-viewer'
            src={pdfUrl}
            title={doc.name || 'PDF Viewer'}
          />
        </div>
      </section>
    );
  }

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Masukkan URL gambar:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const exportPdf = () => {
    const el = document.querySelector('.ProseMirror');
    html2pdf().set({ margin: 10, filename: `${doc?.name || 'document'}.pdf` }).from(el).save();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Masukkan URL tautan:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const searchText = () => {
    const query = window.prompt('Cari teks:');
    if (!query) return;
    const full = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n');
    const index = full.toLowerCase().indexOf(query.toLowerCase());
    if (index < 0) {
      window.alert('Teks tidak ditemukan.');
      return;
    }
    editor.chain().focus().setTextSelection({ from: index + 1, to: index + query.length + 1 }).run();
  };

  const addSignature = () => {
    editor.chain().focus().insertContent('<p>✍️ Ditandatangani oleh pengguna</p>').run();
  };

  const addNote = () => {
    editor.chain().focus().insertContent('<blockquote>📝 Catatan: </blockquote>').run();
  };

  return (
    <section className='editor-shell'>
      <div className='top-toolbar'>
        <button className='tool' title='Daftar dokumen'>📄</button>
        <button className='tool' title='Undo' onClick={() => editor.chain().focus().undo().run()}>↩️</button>
        <button className='tool' title='Redo' onClick={() => editor.chain().focus().redo().run()}>↪️</button>
        <button className='tool' title='Tambah teks' onClick={() => editor.chain().focus().insertContent('<p>Teks baru...</p>').run()}>➕</button>
        <button className='tool' title='Edit teks' onClick={() => editor.chain().focus().run()}>✏️</button>
        <button className='tool' title='Tanda tangan' onClick={addSignature}>✍️</button>
        <button className='tool' title='Sorot (draw)' onClick={() => editor.chain().focus().toggleHighlight().run()}>🖍️</button>
        <button className='tool' title='Hapus format highlight' onClick={() => editor.chain().focus().unsetHighlight().run()}>🧽</button>
        <button className='tool' title='Tambah gambar' onClick={addImage}>🖼️</button>
        <button className='tool' title='Tambah/Hapus tautan' onClick={addLink}>🔗</button>
        <button className='tool' title='Tambah catatan' onClick={addNote}>📝</button>
        <button className='tool' title='Cari teks' onClick={searchText}>🔎</button>
      </div>
      <div className='sub-toolbar'>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</button>
        <button onClick={addImage}>Image</button>
        <button onClick={exportPdf}>Export</button>
        <button onClick={() => onSave({ contentHtml: editor.getHTML(), rawText: editor.getText() })}>Save</button>
      </div>
      <div className='status'>{status}</div>
      <div className='page-canvas'>
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
