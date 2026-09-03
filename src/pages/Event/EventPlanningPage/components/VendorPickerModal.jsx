import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search, Plus, Check } from "lucide-react";
import { SearchCustomerApi } from "@/services/apiServices";
import AddVendor from "../../../../partials/modals/add-vendor/AddVendor";

const isVendor = (party) => {
  const contactTypeName = (party?.contact?.contactType?.nameEnglish || "").toUpperCase();
  const contactName = (party?.contact?.nameEnglish || "").toUpperCase();

  if (contactTypeName.includes("VENDOR") || contactTypeName.includes("SUPPLIER")) return true;
  if (contactName.includes("SUPPLIER") || contactName.includes("VENDOR")) return true;
  if (contactName.includes("CUSTOMER") || contactTypeName.includes("CUSTOMER")) return false;

  return false;
};

/**
 * Centered modal for picking a vendor, with a search box and a "+" to
 * create a brand-new vendor on the fly via AddVendor.
 */
const VendorPickerModal = ({ itemName, currentVendorId = 0, currentVendorName = "", onClose, onSave }) => {
  const userId = localStorage.getItem("userId");
  const [term, setTerm] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(
    currentVendorId ? { id: currentVendorId, nameEnglish: currentVendorName } : null,
  );
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const fetchVendors = (search) => {
    setLoading(true);
    SearchCustomerApi(search, userId)
      .then((res) => {
        const all = res?.data?.data?.["Party Details"] || [];
        setVendors(all.filter(isVendor));
      })
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors(""); // initial load: all vendors
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVendors(term), 300);
    return () => clearTimeout(debounceRef.current);
  }, [term]);

  // Close on Escape (but not while AddVendor is open on top)
  useEffect(() => {
    if (isAddVendorOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isAddVendorOpen, onClose]);

  const handlePick = (v) => {
    setSelected(v);
    onSave({ vendorId: v.id, vendorName: v.nameEnglish });
    onClose();
  };

  const handleVendorCreated = () => {
    setIsAddVendorOpen(false);
    fetchVendors(term);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Assign Vendor — <span className="text-primary font-bold">{itemName}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search vendor..."
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddVendorOpen(true)}
            title="Add new vendor"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-400 py-4 text-center">Loading...</div>
          ) : vendors.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">No vendors found</div>
          ) : (
            vendors.map((v) => (
              <div
                key={v.id}
                onClick={() => handlePick(v)}
                className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                  selected?.id === v.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-gray-50"
                }`}
              >
                <span>
                  {v.nameEnglish}
                  {v.mobileno && <span className="text-xs text-gray-400 ml-2">{v.mobileno}</span>}
                </span>
                {selected?.id === v.id && <Check size={14} />}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>

      {isAddVendorOpen && (
        <AddVendor
          isModalOpen={isAddVendorOpen}
          setIsModalOpen={setIsAddVendorOpen}
          selectedCustomer={null}
          filterType="all"
          refreshData={handleVendorCreated}
        />
      )}
    </div>,
    document.body,
  );
};

export default VendorPickerModal;