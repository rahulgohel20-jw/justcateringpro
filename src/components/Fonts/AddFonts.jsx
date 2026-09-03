import { useState, useRef, useEffect } from "react";
import { AddFont, EditFont } from "@/services/apiServices";
import Swal from "sweetalert2";

const AddFonts = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [fontName, setFontName] = useState("");
  const [fontFile, setFontFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const isEditMode = !!editData;

  // Prefill data when editing
  useEffect(() => {
    if (editData) {
      setFontName(editData.fontname || "");
      setFontFile(null); // File can't be prefilled, user uploads new one if needed
    } else {
      setFontName("");
      setFontFile(null);
    }
    setError("");
  }, [editData, isOpen]);

  const handleFile = (file) => {
    if (file) setFontFile(file);
  };

  const clearFile = () => {
    setFontFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFontFile(file);
  };

  const handleClose = () => {
    setFontName("");
    setFontFile(null);
    setError("");
    onClose(false);
  };

  const handleSubmit = async () => {
    if (!fontName.trim()) return setError("Font name is required.");
    if (!isEditMode && !fontFile) return setError("Please upload a font file.");

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fontName", fontName.trim());
      if (fontFile) formData.append("font", fontFile);

      let res;
      const fontId = editData?.fontId;

      if (isEditMode) {
        res = await EditFont(fontId, formData);
      } else {
        res = await AddFont(formData);
      }

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            res?.data?.msg ||
            `Font ${isEditMode ? "updated" : "added"} successfully`,
          confirmButtonColor: "#2563eb",
        });
        onSuccess?.(); // Refresh table
        handleClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            res?.data?.msg ||
            `Failed to ${isEditMode ? "update" : "add"} font.`,
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.message ||
          `Failed to ${isEditMode ? "update" : "add"} font. Please try again.`,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">
            {isEditMode ? "Edit font" : "Add font"}
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Font Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Font name
          </label>
          <input
            type="text"
            value={fontName}
            onChange={(e) => setFontName(e.target.value)}
            placeholder="e.g. Inter, Roboto, MyCustomFont"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Font File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Font file
            {isEditMode && (
              <span className="text-gray-400 font-normal ml-1">
                (leave empty to keep existing)
              </span>
            )}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <p className="text-sm text-gray-500 mb-1">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400">.ttf, .otf, .woff, .woff2</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Show existing font path in edit mode */}
          {isEditMode && !fontFile && editData?.fontPath && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <i className="ki-filled ki-document text-blue-400 text-sm"></i>
              <span className="text-sm text-gray-500 flex-1 truncate">
                Current: {editData.fontPath.split("/").pop()}
              </span>
            </div>
          )}

          {fontFile && (
            <div className="mt-2.5 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700 flex-1 truncate">
                {fontFile.name}
              </span>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-gray-600 text-base leading-none"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2.5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-60"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update font"
                : "Add font"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFonts;
