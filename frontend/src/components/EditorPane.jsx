import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export default function EditorPane({ doc, onAnalyzeText }) {
  const content = doc?.structured?.content_blocks?.map((b) => b.type === 'heading' ? `<h2>${b.text}</h2>` : `<p>${b.text}</p>`).join('') || '<p>Select a document...</p>';
  const editor = useEditor({ extensions:[StarterKit,Highlight,Placeholder.configure({ placeholder:'Start editing...' })], content });

  useEffect(() => { if (editor) editor.commands.setContent(content); }, [content, editor]);

  if (!editor) return null;
  return <section className='panel center'><div className='toolbar'><button onClick={()=>editor.chain().focus().toggleHighlight().run()}>Highlight</button><button onClick={()=>onAnalyzeText(editor.state.doc.textContent)}>Rewrite/Expand</button></div><EditorContent editor={editor} /></section>;
}
