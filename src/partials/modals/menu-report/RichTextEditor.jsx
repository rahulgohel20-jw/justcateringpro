import { useState, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

// ─── RichTextEditor ───────────────────────────────────────────────────────────
// Props:
//   value    – initial HTML string (only used on first mount, NOT a controlled value)
//   onChange – called with latest HTML on every keystroke
// ─────────────────────────────────────────────────────────────────────────────
function RichTextEditor({ value = "", onChange, readOnly = false }) {
  const [fontSize, setFontSize] = useState("16px");

  // Keep onChange in a ref so the editor event handler never goes stale
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ── Editor setup ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "border-collapse border border-gray-400" },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    // value is only used as the INITIAL content — we never reset it from outside
    content: value || "",
    editable: !readOnly,
    onUpdate({ editor }) {
      // Always calls the latest onChange without re-registering the handler
      onChangeRef.current?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;

    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      editor.commands.setContent(value || "");

      onChangeRef.current?.(value || "");
    }
  }, [value]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const applyFontSize = (size) => {
    setFontSize(size);
    if (editor) editor.view.dom.style.fontSize = size;
  };

  // ── Guard – AFTER all hooks ──────────────────────────────────────────────
  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* ── Toolbar (hidden when readOnly) ── */}
      {!readOnly && (
        <div className="bg-gray-100 border-b p-2 flex gap-1 flex-wrap items-center">
          {/* Heading / Paragraph */}
          <select
            onChange={(e) => {
              const level = Number(e.target.value);
              if (level === 0) editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level }).run();
            }}
            className="px-2 py-1 border border-gray-300 rounded bg-white text-sm min-w-[110px]"
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-blue-100" : ""}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-blue-100" : ""}`}
            title="Italic"
          >
            <em>I</em>
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("underline") ? "bg-blue-100" : ""}`}
            title="Underline"
          >
            <u>U</u>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Color */}
          <label
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-1"
            title="Text Color"
          >
            <span className="font-bold">A</span>
            <input
              type="color"
              onInput={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
              className="w-0 h-0 opacity-0 absolute"
            />
            <span className="text-xs">▼</span>
          </label>

          {/* Highlight */}
          <label
            className="p-2 rounded hover:bg-gray-200 cursor-pointer flex items-center gap-1"
            title="Highlight"
          >
            <span className="font-bold bg-yellow-300 px-1">A</span>
            <input
              type="color"
              onInput={(e) =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run()
              }
              className="w-0 h-0 opacity-0 absolute"
            />
            <span className="text-xs">▼</span>
          </label>

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded bg-white text-sm"
          >
            {[
              "8px",
              "10px",
              "12px",
              "14px",
              "16px",
              "18px",
              "20px",
              "24px",
              "28px",
              "32px",
              "36px",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replace("px", "")}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-blue-100" : ""}`}
            title="Bullet List"
          >
            •≡
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-blue-100" : ""}`}
            title="Numbered List"
          >
            1.≡
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Align Left */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
            title="Align Left"
          >
            ⬅
          </button>

          {/* Align Center */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
            title="Align Center"
          >
            ≣
          </button>

          {/* Align Right */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
            title="Align Right"
          >
            ➡
          </button>

          {/* Justify */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`px-2 py-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
            title="Justify"
          >
            ☰
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-blue-100" : ""}`}
            title="Insert Link"
          >
            🔗
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
            title="Undo"
          >
            ↶
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
            title="Redo"
          >
            ↷
          </button>
        </div>
      )}

      {/* ── Editor Area ── */}
      <div
        className={`bg-white min-h-[80px] max-h-[200px] overflow-y-auto px-3 py-2 ${readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
      >
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
          style={{ fontSize }}
        />
      </div>

      {/* ── Footer Stats (only when editable) ── */}
      {!readOnly && (
        <div className="bg-gray-50 border-t px-3 py-1 flex justify-between text-xs text-gray-400">
          <span>
            Words: {editor.getText().split(/\s+/).filter(Boolean).length}
          </span>
          <span>Characters: {editor.getText().length}</span>
        </div>
      )}

      <style jsx>{`
        :global(.ProseMirror) {
          outline: none;
          padding: 4px;
        }
        :global(.ProseMirror p) {
          margin: 0.25rem 0;
        }
        :global(.ProseMirror strong) {
          font-weight: bold;
        }
        :global(.ProseMirror em) {
          font-style: italic;
        }
        :global(.ProseMirror u) {
          text-decoration: underline;
        }
        :global(.ProseMirror ul) {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        :global(.ProseMirror ol) {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        :global(.ProseMirror h1) {
          font-size: 2em;
          font-weight: bold;
          margin: 0.75rem 0;
        }
        :global(.ProseMirror h2) {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.6rem 0;
        }
        :global(.ProseMirror h3) {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5rem 0;
        }
        :global(.ProseMirror table) {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
        }
        :global(.ProseMirror td),
        :global(.ProseMirror th) {
          border: 2px solid #d1d5db;
          padding: 0.4rem;
          min-width: 80px;
        }
        :global(.ProseMirror th) {
          background-color: #f3f4f6;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;
