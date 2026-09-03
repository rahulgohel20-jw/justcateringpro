import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, RefreshCw, ChevronLeft, ImageIcon, Film, X } from "lucide-react";

export default function AddPortfolio({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    portfolioName: "",
    description: "",
    category: "",
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState("image"); // "image" | "video"
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm({ portfolioName: "", description: "", category: "" });
      setMediaFiles([]);
      setActiveUploadTab("image");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const processFiles = (rawFiles, kind) => {
    const remaining = 10 - mediaFiles.length;
    const picked = Array.from(rawFiles).slice(0, remaining);
    return picked.map((f) => ({
      name: f.name,
      ext: f.name.split(".").pop().toUpperCase(),
      kind, // "image" | "video"
      status: "Uploaded Successfully",
      preview: kind === "image" ? URL.createObjectURL(f) : null,
      raw: f,
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const all = Array.from(e.dataTransfer.files);
    const images = all.filter((f) => f.type.startsWith("image/"));
    const videos = all.filter((f) => f.type.startsWith("video/"));
    const newFiles = [
      ...processFiles(images, "image"),
      ...processFiles(videos, "video"),
    ];
    setMediaFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileInput = (e, kind) => {
    const newFiles = processFiles(e.target.files, kind);
    setMediaFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (idx) => setMediaFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!form.portfolioName) return;
    onSave?.({ ...form, mediaFiles });
    onClose?.();
  };

  const inputCls =
    "w-full h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition";

  const imageFiles = mediaFiles.filter((f) => f.kind === "image");
  const videoFiles = mediaFiles.filter((f) => f.kind === "video");

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar panel */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="pointer-events-auto absolute top-0 bottom-0 right-0 w-[900px] m-5 rounded-2xl max-w-[95vw] bg-white shadow-2xl border-l border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="px-7 pt-6 pb-5 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create Portfolio</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Add your work and showcase your gallery
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className=" rounded-full hover:text-gray-800 flex items-center justify-center text-gray-500  transition text-lg leading-none mt-0.5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

                {/* Two-col: left = fields, right = upload zone */}
                <div className="grid grid-cols-2 gap-6">

                  {/* LEFT — form fields */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Portfolio Name
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Summer Gala 2024"
                        value={form.portfolioName}
                        onChange={(e) => handleChange("portfolioName", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <select
                        className={inputCls}
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option>Fine Dining</option>
                        <option>Rustic Weddings</option>
                        <option>Corporate Events</option>
                        <option>Private Parties</option>
                        <option>Outdoor Events</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={5}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition resize-none"
                        placeholder="Describe the editorial style and key highlights of this collection..."
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* RIGHT — upload zone */}
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-700">Image Upload Section</p>

                    {/* Tab toggle */}
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
                      <button
                        onClick={() => setActiveUploadTab("image")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${
                          activeUploadTab === "image"
                            ? "bg-primary text-white"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <ImageIcon size={12} /> Images
                      </button>
                      <button
                        onClick={() => setActiveUploadTab("video")}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition ${
                          activeUploadTab === "video"
                            ? "bg-primary text-white"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Film size={12} /> Videos
                      </button>
                    </div>

                    {/* Drop zone */}
                    <div
                      className={`rounded-xl border-2 border-dashed transition-colors px-4 py-6 flex flex-col items-center gap-2 cursor-pointer ${
                        dragging
                          ? "border-primary bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleFileDrop}
                      onClick={() =>
                        activeUploadTab === "image"
                          ? imageInputRef.current?.click()
                          : videoInputRef.current?.click()
                      }
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activeUploadTab === "image" ? (
                          <ImageIcon size={18} className="text-primary" />
                        ) : (
                          <Film size={18} className="text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Drag & drop {activeUploadTab === "image" ? "images" : "videos"} or{" "}
                        <span className="text-primary font-semibold">click to upload</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {activeUploadTab === "image"
                          ? "Supports JPG, PNG, WEBP (Max 10MB each)"
                          : "Supports MP4, MOV, WEBM (Max 100MB each)"}
                      </p>

                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileInput(e, "image")}
                      />
                      <input
                        ref={videoInputRef}
                        type="file"
                        multiple
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileInput(e, "video")}
                      />
                    </div>

                    {/* Thumbnail preview grid */}
                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imageFiles.map((file, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeFile(mediaFiles.indexOf(file))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* File list (all uploads) */}
                {mediaFiles.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Uploaded Files ({mediaFiles.length})
                    </p>
                    {mediaFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                              file.kind === "video"
                                ? "bg-purple-50 border-purple-100"
                                : "bg-primary/10 border-primary/20"
                            }`}
                          >
                            {file.kind === "video" ? (
                              <Film size={14} className="text-purple-500" />
                            ) : (
                              <span className="text-[10px] font-bold text-primary">
                                {file.ext}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-[11px] text-green-500 font-medium">
                              {file.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 transition">
                            <RefreshCw size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-6 py-2.5 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-[#154d30] rounded-lg px-8 py-2.5 transition shadow-sm"
                >
                  Save Portfolio
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}