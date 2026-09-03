import { useState, useEffect } from "react";
import { Mic, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { GetSloganByMenuId } from "@/services/apiServices";

const MenuNotes = ({ isOpen, onClose, itemId, notes = "", onSave }) => {
  const [itemSlogan, setItemSlogan] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isOpen && notes !== undefined) {
      setItemSlogan(notes || "");
    }
  }, [isOpen, notes]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(itemSlogan);
  };

  const handleSyncSlogan = async () => {
    if (!itemId) return;
    const userId = localStorage.getItem("userId");
    setSyncing(true);
    try {
      const resp = await GetSloganByMenuId(itemId, userId);
      const slogan = resp?.data?.data ?? resp?.data?.slogan ?? "";
      if (resp?.data?.success === false) {
        Swal.fire({
          icon: "error",
          title: resp?.data?.msg || "Failed to sync slogan",
        });
        return;
      }
      setItemSlogan(slogan || "");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to sync slogan",
        text: err?.response?.data?.msg || "Something went wrong.",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Item Slogan</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-4">
          <InputWithIcon
            label="Item Slogan"
            value={itemSlogan}
            onChange={(e) => setItemSlogan(e.target.value)}
            onSync={handleSyncSlogan}
            syncing={syncing}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const InputWithIcon = ({ label, value, onChange, onSync, syncing }) => (
  <div className="relative w-full">
    <div className="flex items-center justify-between mb-1">
      <label className="block text-gray-600">{label}</label>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        title="Sync slogan from master"
        className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary rounded-full px-2.5 py-1 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Syncing..." : "Sync Slogan"}
      </button>
    </div>

    {/* Textarea */}
    <textarea
      rows={5}
      className="border border-gray-300 rounded-lg p-3 pr-12 w-full resize-none"
      placeholder={label}
      value={value}
      onChange={onChange}
    />

    {/* Mic Button */}
    <button
      type="button"
      onClick={() => console.log("Mic clicked")}
      title="Mic"
      className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8 absolute bottom-3 right-2"
    >
      <Mic size={18} />
    </button>
  </div>
);

export default MenuNotes;