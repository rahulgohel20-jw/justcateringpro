import {
  X, StickyNote, FileText, Heading, Calendar, User,
} from "lucide-react";

export default function ViewNoteModal({ isOpen, onClose, note }) {
  if (!isOpen || !note) return null;

  const headings = note.headings || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{note.title || "Untitled Note"}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Note Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
              <StickyNote className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Note Title</p>
                <p className="text-sm font-bold text-gray-900">{note.title || "—"}</p>
              </div>
            </div>
            {note.createdByName && (
              <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                <User className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Created By</p>
                  <p className="text-sm font-bold text-gray-900">{note.createdByName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Headings & Descriptions */}
          {headings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heading className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-bold text-gray-700">Headings & Descriptions</p>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[30%]">Heading</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headings.map((h, i) => (
                      <tr key={h.id || i} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 text-gray-500 font-medium">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{h.heading || "—"}</td>
                        <td
                          className="px-4 py-3 text-gray-600 [&_b]:font-bold [&_strong]:font-bold whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: h.description || "—" }}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {headings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <FileText className="w-10 h-10 mb-2" />
              <p className="text-sm">No headings added to this note</p>
            </div>
          )}

          {/* Created At */}
          {note.createdAt && (
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Created At:{" "}
                <strong className="text-gray-600">{note.createdAt}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}