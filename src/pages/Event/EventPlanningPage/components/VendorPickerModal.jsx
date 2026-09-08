import { useState, useEffect, useRef } from "react";
import { Search, Plus, Check } from "lucide-react";
import { SearchCustomerApi } from "@/services/apiServices";
import AddVendor from "../../../../partials/modals/add-vendor/AddVendor";
import { CustomModal } from "../../../../components/custom-modal/CustomModal";

const isVendor = (party) => {
  const contactTypeName = (party?.contact?.contactType?.nameEnglish || "").toUpperCase();
  const contactName = (party?.contact?.nameEnglish || "").toUpperCase();

  if (contactTypeName.includes("VENDOR") || contactTypeName.includes("SUPPLIER")) return true;
  if (contactName.includes("SUPPLIER") || contactName.includes("VENDOR")) return true;
  if (contactName.includes("CUSTOMER") || contactTypeName.includes("CUSTOMER")) return false;

  return false;
};

/**
 * Vendor picker built on top of the shared CustomModal (antd),
 * with a search box and a "+" to create a brand-new vendor via AddVendor.
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
  const isFirstRun = useRef(true);

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
    fetchVendors("");
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVendors(term), 300);
    return () => clearTimeout(debounceRef.current);
  }, [term]);

  const handleSelect = (v) => {
    setSelected(v);
  };

  const handleConfirmSave = () => {
    if (!selected) return;
    onSave({ vendorId: selected.id, vendorName: selected.nameEnglish });
    onClose();
  };

  const handleVendorCreated = () => {
    setIsAddVendorOpen(false);
    fetchVendors(term);
  };

  return (
    <>
      <CustomModal
        open={true}
        onClose={onClose}
        width={448}
        title={
          <>
            Assign Vendor — <span className="text-primary font-bold">{itemName}</span>
          </>
        }
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              disabled={!selected}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                selected ? "bg-primary hover:bg-primary/90" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        }
      >
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
                onClick={() => handleSelect(v)}
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
      </CustomModal>

      {isAddVendorOpen && (
        <AddVendor
          isModalOpen={isAddVendorOpen}
          setIsModalOpen={setIsAddVendorOpen}
          selectedCustomer={null}
          filterType="all"
          refreshData={handleVendorCreated}
        />
      )}
    </>
  );
};

export default VendorPickerModal;