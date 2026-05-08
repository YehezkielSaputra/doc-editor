import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';

export default function SimpleEditor({ content, onSave }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight],
    content
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content || '<p></p>');
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <>
      <div className='sub-toolbar'>
        <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()}>Redo</button>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
        <button onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().setParagraph().run()}>Paragraph</button>
        <button onClick={() => onSave(editor.getHTML())}>Save</button>
      </div>
      <div className='page-canvas'>
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
