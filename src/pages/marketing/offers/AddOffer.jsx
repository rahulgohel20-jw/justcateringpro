import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function AddOffer({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    offerName: "",
    offerType: "",
    discount: "",
    expireDate: "",
    description: "",
  });
  const [files, setFiles] = useState([
    { name: "Image potrait.jpg", status: "Upload Successfully", type: "JPG" },
  ]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({ offerName: "", offerType: "", discount: "", expireDate: "", description: "" });
      setFiles([{ name: "Image potrait.jpg", status: "Upload Successfully", type: "JPG" }]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).slice(0, 5 - files.length);
    const newFiles = dropped.map((f) => ({
      name: f.name,
      status: "Upload Successfully",
      type: f.name.split(".").pop().toUpperCase(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileInput = (e) => {
    const picked = Array.from(e.target.files).slice(0, 5 - files.length);
    const newFiles = picked.map((f) => ({
      name: f.name,
      status: "Upload Successfully",
      type: f.name.split(".").pop().toUpperCase(),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!form.offerName) return;
    onSave?.({ ...form, files });
    onClose?.();
  };

  const inputCls =
    "w-full h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <div className="absolute inset-0 pointer-events-none no-scrollbar">
            <motion.div
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[540px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="px-7 pt-7 pb-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Create New Offer</h2>
                <p className="text-sm text-gray-500 mt-0.5">Create a new offer for event</p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5 no-scrollbar">

                {/* Row 1: Offer Name + Offer Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Offer Name</label>
                    <input
                      className={inputCls}
                      placeholder="Christmas Offer"
                      value={form.offerName}
                      onChange={(e) => handleChange("offerName", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Offer Type</label>
                    <input
                      className={inputCls}
                      placeholder="Festival"
                      value={form.offerType}
                      onChange={(e) => handleChange("offerType", e.target.value)}
                    />
                  </div>
                </div>

                {/* Row 2: Discount + Expire Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Discount</label>
                    <input
                    type="tel"
                      className={inputCls}
                      placeholder="20%"
                      value={form.discount}
                      onChange={(e) => handleChange("discount", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Expire Date</label>
                    <input
                      className={inputCls}
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={form.expireDate}
                      onChange={(e) => handleChange("expireDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Luminary smart watch"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Add offer image</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Add your documents here, and you can upload up to 5 files max
                    </p>
                  </div>

                  {/* Drop zone */}
                  <div
                    className={`rounded-xl border-2 border-dashed transition-colors px-6 py-8 flex flex-col items-center gap-2 cursor-pointer ${
                      dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
                      <Upload size={20} className="text-primary" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Drag your file(s) or{" "}
                      <span className="text-primary font-medium underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-400">Max 10 MB files are allowed</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.svg,.zip"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>

                  <p className="text-xs text-gray-400">Only support .jpg, .png and .svg and zip files</p>

                  {/* File list */}
                  <div className="flex flex-col gap-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{file.type}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{file.name}</p>
                            <p className="text-[11px] text-green-500 font-medium">{file.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition">
                            <RefreshCw size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-5 py-2.5 hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary hover:bg-blue-700 rounded-lg px-8 py-2.5 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}