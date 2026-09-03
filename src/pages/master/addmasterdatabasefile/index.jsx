import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Upload, X, Trash2 } from "lucide-react";
import { DatabaseReadExcle } from "@/services/apiServices";
import Swal from "sweetalert2";
import Loader from "@/components/loader/Loader";

export default function AddMasterDatabaseFile({
  open,
  onClose,
  selectedRow,
  setLoading,
  loading,
  s,
}) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    databaseName: selectedRow?.database_name || "",
    state: "",
    instructions: "",
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert("Only .xls or .xlsx Excel files are allowed");
      return;
    }

    if (file.size > maxSize) {
      alert("Max 10 MB files are allowed");
      return;
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type,
      rawFile: file,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      Swal.fire({
        icon: "warning",
        title: "No file uploaded",
        text: "Please upload an Excel file before saving.",
      });
      return;
    }

    setLoading(true);

    const jsonPayload = {
      dbName: formData.databaseName,
      state: formData.state,
      instructions: formData.instructions,
      userId: "1",
    };

    const formDataToSend = new FormData();
    formDataToSend.append("file", uploadedFile.rawFile);
    formDataToSend.append(
      "json",
      new Blob([JSON.stringify(jsonPayload)], { type: "application/json" }),
      "data.json"
    );

    try {
      const res = await DatabaseReadExcle(formDataToSend);
      

      if (res?.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Database uploaded successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        // 🔥 Refresh table from parent
        if (typeof fetchData === "function") {
          await fetchData();
        }

        // Clear UI
        setUploadedFile(null);
        setFormData({
          databaseName: "",
          state: "",
          instructions: "",
        });

        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: res?.data?.message || "Something went wrong while uploading.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while uploading.",
      });
    } finally {
      // 👇 Keep loader ON until fetch completes
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCancel = () => {
    setFormData({
      databaseName: "",
      version: "",
      state: "",
      remarks: "",
      instructions: "",
    });
    setUploadedFile(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto absolute top-0 md:top-6 bottom-0 md:bottom-6 right-0 md:right-6 w-full md:w-[600px] lg:w-[700px] max-w-full bg-white md:rounded-2xl shadow-2xl border-0 md:border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Add Database File
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4 md:space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Database Name
                      </label>
                      <input
                        type="text"
                        name="databaseName"
                        value={formData.databaseName}
                        onChange={handleInputChange}
                        placeholder="Enter database name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ""}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Upload Excel Option
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Add your documents here, and you can upload up to 5
                        files max
                      </p>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Drag your file(s) or{" "}
                          <label className="text-blue-600 cursor-pointer hover:underline">
                            browse
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileInput}
                              accept=".xls,.xlsx"
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-400">
                          Max 10 MB files are allowed
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Only support .jpg, .png and .svg and zip files
                    </p>

                    {/* Uploaded File */}
                    {uploadedFile && (
                      <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              JPG
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600">
                              Upload Successfully
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRemoveFile}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                          <button className="p-1.5 hover:bg-blue-100 rounded transition-colors">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Buttons */}
              <div className="border-t border-gray-200 p-4 md:p-6 flex gap-3 justify-center bg-white">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors text-sm flex items-center gap-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M4 12a8 8 0 018-8" />
                    </svg>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      Save
                    </>
                  )}
                </button>
              </div>
              {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[200]">
                  <Loader size={60} please wait />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
