import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Megaphone, Save, PlusCircle } from "lucide-react";

const NewPushNoti = ({
  open,
  onClose,
  onSaveDraft,
  onAddToModule,
  initialData,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
  };
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      width={540}
      centered
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Megaphone size={18} className="text-blue-700" />
          </div>
          <span className="text-base font-semibold text-gray-900">
            Create New Push Notification
          </span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAddToModule?.({ title, description });
                handleClose();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors"
            >
              Add to Module
              <PlusCircle size={14} />
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2">
        <div>
          <label className="block text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-1.5">
            Notification Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title"
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about this notification..."
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default NewPushNoti;
