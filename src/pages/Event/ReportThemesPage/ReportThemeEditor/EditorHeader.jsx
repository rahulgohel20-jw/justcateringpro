import { Undo2, Redo2, MoreVertical } from "lucide-react";

export default function EditorHeader({ onSave }) {
  return (
    <div className="flex items-center justify-between bg-white px-6 py-3 shadow-sm ">
      {/* Left: Title + Subtitle */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Report Design Template Editor
        </h2>
        <p className="text-sm text-gray-500">
          Customize your event report design effortlessly.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Undo2 className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
        <Redo2 className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
        <button
          onClick={onSave}
          className="bg-[#005AA7]  text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-800 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
