import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { GetBanquetRightsByUserId, AddBanquetRights } from "@/services/apiServices";
import Swal from "sweetalert2";

const BanquetRightsModal = ({ isOpen, onClose, member }) => {
  const [banquets, setBanquets] = useState([]);
  const [allowedIds, setAllowedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isOpen || !member?.memberid) return;
    fetchData();
  }, [isOpen, member]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rightsRes = await GetBanquetRightsByUserId(member.memberid, userId);

      const rights = rightsRes?.data?.data || [];
      setBanquets(rights);

      const allowed = new Set(
        rights.filter((r) => r.isAllow).map((r) => r.banquetHallId)
      );
      setAllowedIds(allowed);
    } catch (err) {
      console.error("Error fetching banquet rights:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBanquet = (id) => {
    setAllowedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = banquets.map((b) => ({
        banquetHallId: b.banquetHallId,
        isAllow: allowedIds.has(b.banquetHallId),
      }));

      await AddBanquetRights(payload, Number(member.memberid));

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Banquet rights updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title={`Banquet Rights — ${member?.full_name || ""}`}
      width="min(600px, 95vw)"
      footer={
        <div className="flex justify-end gap-2">
          <button className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Rights"}
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      ) : banquets.length === 0 ? (
        <div className="text-center text-gray-400 py-8 text-sm">
          No banquet halls found.
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto px-1 no-scrollbar">
          <p className="text-xs text-gray-500 mb-3">
            Toggle access for each banquet hall for this member.
          </p>
          {banquets.map((b) => {
            const allowed = allowedIds.has(b.banquetHallId);
            return (
              <div
                key={b.banquetHallId}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  allowed
                    ? "bg-primary/5 border-primary/30"
                    : "bg-white border-gray-200"
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {b.banquetHallName || b.name || `Banquet #${b.banquetHallId}`}
                </span>
                <button
                  type="button"
                  onClick={() => toggleBanquet(b.banquetHallId)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    allowed ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      allowed ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </CustomModal>
  );
};

export default BanquetRightsModal;