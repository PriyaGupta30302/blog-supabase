'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { TableKit } from '@tiptap/extension-table';
import { common, createLowlight } from 'lowlight';
import { useCallback, useRef, useState, useEffect } from 'react';
import './editor-styles.css';

const lowlight = createLowlight(common);

// ✅ Calculate read time from Tiptap JSON
function calculateReadTimeFromJSON(json: any) {
  if (!json || !json.content || !Array.isArray(json.content)) {
    return 1;
  }

  let totalText = '';

  const extractText = (node: any) => {
    if (!node) return;

    // Paragraph
    if (node.type === 'paragraph' && node.content && Array.isArray(node.content)) {
      node.content.forEach((item: any) => {
        if (item.text) totalText += item.text + ' ';
      });
    }
    // Heading
    else if (node.type === 'heading' && node.content && Array.isArray(node.content)) {
      node.content.forEach((item: any) => {
        if (item.text) totalText += item.text + ' ';
      });
    }
    // Blockquote
    else if (node.type === 'blockquote' && node.content && Array.isArray(node.content)) {
      node.content.forEach((item: any) => {
        if (item.content && Array.isArray(item.content)) {
          item.content.forEach((subItem: any) => {
            if (subItem.text) totalText += subItem.text + ' ';
          });
        }
      });
    }
    // Code block
    else if (node.type === 'codeBlock' && node.content && Array.isArray(node.content)) {
      node.content.forEach((item: any) => {
        if (item.text) totalText += item.text + ' ';
      });
    }
    // Bullet list
    else if (node.type === 'bulletList' && node.content && Array.isArray(node.content)) {
      node.content.forEach((listItem: any) => {
        if (listItem.content && Array.isArray(listItem.content)) {
          listItem.content.forEach((paragraphNode: any) => {
            if (paragraphNode.content && Array.isArray(paragraphNode.content)) {
              paragraphNode.content.forEach((item: any) => {
                if (item.text) totalText += item.text + ' ';
              });
            }
          });
        }
      });
    }
    // Ordered list
    else if (node.type === 'orderedList' && node.content && Array.isArray(node.content)) {
      node.content.forEach((listItem: any) => {
        if (listItem.content && Array.isArray(listItem.content)) {
          listItem.content.forEach((paragraphNode: any) => {
            if (paragraphNode.content && Array.isArray(paragraphNode.content)) {
              paragraphNode.content.forEach((item: any) => {
                if (item.text) totalText += item.text + ' ';
              });
            }
          });
        }
      });
    }
    // Table
    else if (node.type === 'table' && node.content && Array.isArray(node.content)) {
      node.content.forEach((row: any) => {
        if (row.content && Array.isArray(row.content)) {
          row.content.forEach((cell: any) => {
            if (cell.content && Array.isArray(cell.content)) {
              cell.content.forEach((item: any) => {
                if (item.content && Array.isArray(item.content)) {
                  item.content.forEach((subItem: any) => {
                    if (subItem.text) totalText += subItem.text + ' ';
                  });
                }
              });
            }
          });
        }
      });
    }
  };

  // Extract text from all nodes
  json.content.forEach(extractText);

  // Calculate read time: 200 words per minute
  const wordCount = totalText.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return readTime;
}

const MenuBar = ({ editor, onImageUpload, readTime }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const addImage = useCallback(async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await onImageUpload(file);
      if (imageUrl) {
        editor
          .chain()
          .focus()
          .setImage({
            src: imageUrl,
            alt: file.name,
            title: file.name,
          })
          .run();
      }
    } catch (error: any) {
      console.error('Image upload failed:', error);
      alert('Image upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url =
      linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
        ? linkUrl
        : `https://${linkUrl}`;

    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="menu-bar">
      {/* Text Formatting */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title="Inline Code"
        >
          {'</>'}
        </button>
      </div>

      <div className="divider"></div>

      {/* Colors */}
      <div className="menu-section">
        <input
          type="color"
          onInput={(event: any) =>
            editor.chain().focus().setColor(event.target.value).run()
          }
          value={editor.getAttributes('textStyle').color || '#000000'}
          title="Text Color"
          className="color-picker"
        />
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: '#ffc078' })
              .run()
          }
          className={editor.isActive('highlight') ? 'is-active' : ''}
          title="Highlight"
        >
          ✨
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          title="Clear Color"
        >
          ⨯
        </button>
      </div>

      <div className="divider"></div>

      {/* Headings */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
          title="Paragraph"
        >
          P
        </button>
      </div>

      <div className="divider"></div>

      {/* Lists & Quotes */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Code Block"
        >
          {'{ }'}
        </button>
      </div>

      <div className="divider"></div>

      {/* Alignment */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Align Right"
        >
          ➡
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          title="Justify"
        >
          ≡
        </button>
      </div>

      <div className="divider"></div>

      {/* Media & Table */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Add Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e: any) => addImage(e.target.files?.[0])}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Add Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={addTable}
          title="Insert Table"
        >
          📊
        </button>
      </div>

      <div className="divider"></div>

      {/* Utility */}
      <div className="menu-section">
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          ―
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().clearNodes().unsetAllMarks().run();
          }}
          title="Clear Formatting"
        >
          🗑️
        </button>
      </div>

      {/* ✅ Read Time Display */}
      <div className="divider"></div>
      <div className="menu-section read-time-section" style={{ marginLeft: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#f0f4ff',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#0055cc',
            whiteSpace: 'nowrap',
          }}
        >
          <span>📖</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="link-input-container">
          <input
            type="url"
            placeholder="Enter URL (e.g., example.com)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setLink();
              }
              if (e.key === 'Escape') {
                setShowLinkInput(false);
                setLinkUrl('');
              }
            }}
            className="link-input"
            autoFocus
          />
          <button type="button" onClick={setLink} className="link-submit">
            ✓
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl('');
              editor.chain().focus().unsetLink().run();
            }}
            className="link-cancel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ onContentChange, initialContent = null }: any) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [readTime, setReadTime] = useState(1);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setUploadProgress(0);

      const { supabase } = await import('@/lib/supabase');

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}_${cleanFileName}`;

      setUploadProgress(50);

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setUploadProgress(75);

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1000);

      return urlData.publicUrl;
    } catch (error) {
      setUploadProgress(null);
      throw error;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TableKit,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'editor-code-block',
        },
      }),
      Placeholder.configure({
        placeholder:
          'Start writing your amazing content... Use "/" for commands',
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();

      // ✅ Calculate read time from JSON
      const calculatedReadTime = calculateReadTimeFromJSON(json);
      setReadTime(calculatedReadTime);

      // Pass both json and html, plus the calculated read time
      onContentChange({ json, html, readTime: calculatedReadTime });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none',
        spellcheck: 'true',
      },
    },
    immediatelyRender: false,
  });

  // Update read time on load if content exists
  useEffect(() => {
    if (editor && initialContent) {
      const json = editor.getJSON();
      setReadTime(calculateReadTimeFromJSON(json));
    }
  }, [editor, initialContent]);

  return (
    <div className="text-editor-container">
      {uploadProgress !== null && (
        <div className="upload-progress-bar">
          <div
            className="upload-progress-fill"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      <MenuBar editor={editor} onImageUpload={handleImageUpload} readTime={readTime} />
      <EditorContent editor={editor} />
      {editor && (
        <div className="editor-footer">
          <span className="character-count">
            {editor.storage.characterCount.characters()} / 50,000 characters
          </span>
          <span className="word-count">
            {editor.storage.characterCount.words()} words
          </span>
          <span className="read-time-footer">
            📖 {readTime} min read
          </span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
