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

const blank = '<h1>Dokumen Baru</h1><p>Mulai menulis di sini...</p>';

export default function EditorPane({ doc, onSave, status }) {
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

  useEffect(() => { if (editor) editor.commands.setContent(content); }, [content, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Masukkan URL gambar:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const exportPdf = () => {
    const el = document.querySelector('.ProseMirror');
    html2pdf().set({ margin: 10, filename: `${doc?.name || 'document'}.pdf` }).from(el).save();
  };

  return <section className='panel center'>
    <div className='toolbar'>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</button>
      <button onClick={addImage}>Insert Image</button>
      <button onClick={exportPdf}>Export PDF</button>
      <button onClick={() => onSave({ contentHtml: editor.getHTML(), rawText: editor.getText() })}>Save</button>
    </div>
    <div className='status'>{status}</div>
    <EditorContent editor={editor} />
  </section>;
}
