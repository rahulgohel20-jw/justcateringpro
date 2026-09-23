import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";

const AddNotes = ({ isOpen, onClose, initialNotes, onSave }) => {
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    if (isOpen) {
      const initialVal =
        typeof initialNotes === "string"
          ? initialNotes
          : initialNotes?.notesEnglish || "";
      setNoteText(initialVal);
    }
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value || "";

    const textBefore = value.slice(0, start);
    const lineStart = textBefore.lastIndexOf("\n") + 1;
    const currentLine = textBefore.slice(lineStart);

    const bulletMatch = currentLine.match(/^(\s*)(•|\*|-)(\s*)/);
    if (!bulletMatch) return;

    e.preventDefault();

    const indent = bulletMatch[1];
    const bulletSymbol = bulletMatch[2];
    const spacing = bulletMatch[3];
    const bulletPrefix = `${indent}${bulletSymbol}${spacing || " "}`;

    if (currentLine.trim() === bulletSymbol) {
      const beforeLine = value.slice(0, lineStart);
      const afterCursor = value.slice(end);
      const newValue = beforeLine + afterCursor;
      setNoteText(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart);
      });
      return;
    }

    const textAfter = value.slice(end);
    const bulletInsert = `\n${bulletPrefix}`;
    const newValue = textBefore + bulletInsert + textAfter;
    const newCursorPos = start + bulletInsert.length;

    setNoteText(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleSave = () => {
    const trimmed = noteText.trim();
    onSave({
      notesEnglish: trimmed,
      notesGujarati: trimmed,
      notesHindi: trimmed,
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <FormattedMessage
              id="COMMON.ADD_NOTES"
              defaultMessage="Add Notes"
            />
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            <FormattedMessage id="COMMON.NOTES" defaultMessage="Notes" />
          </label>
          <textarea
            name="notes"
            rows={5}
            placeholder="Enter notes..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-y min-h-[120px]"
          />
        </div>

        {/* Actions */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-xs cursor-pointer"
            onClick={handleSave}
          >
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNotes;