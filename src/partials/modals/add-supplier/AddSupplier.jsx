import { CustomModal } from "@/components/custom-modal/CustomModal";
import { useEffect, useState } from "react";
import { GetSuplier } from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import AddVendor from "../../../partials/modals/add-vendor/AddVendor";
import Select from "react-select";

const AddSupplier = ({
  isOpen,
  onClose,
  onAddSupplier,
  supplierData,
  onReopenSupplier,
}) => {
  const [formData, setFormData] = useState({
    suplierlistid: "",
  });
  const [suplierList, setSuplierList] = useState([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const userId = localStorage.getItem("userId");

  const FetchSuplier = () => {
    GetSuplier(userId).then((response) => {
      const data = response?.data?.data["Party Details"] || [];
      const suplier = data.map((item) => ({
        label: item.nameEnglish,
        value: String(item.id),
      }));
      setSuplierList(suplier);
    });
  };

  useEffect(() => {
    if (isOpen) FetchSuplier();
  }, [isOpen]);

  useEffect(() => {
    if (supplierData) {
      setFormData({ suplierlistid: supplierData.supplierId || "" });
    } else {
      setFormData({ suplierlistid: "" });
    }
  }, [supplierData]);

  const handleSave = () => {
    if (!formData.suplierlistid) {
      alert("Please select a supplier");
      return;
    }

    const selectedSupplier = suplierList.find(
      (s) => s.value === formData.suplierlistid
    );

    if (selectedSupplier) {
      onAddSupplier({
        id: selectedSupplier.value,
        name: selectedSupplier.label,
      });
      onClose(false);
    } else {
      alert("Please select a supplier");
    }
  };

  return (
    <>
      {isOpen && (
        <CustomModal
          open={isOpen}
          onClose={() => onClose(false)}
          title={
            supplierData ? (
              <FormattedMessage
                id="USER.SUPPLIER.EDIT_TITLE"
                defaultMessage="Edit Supplier"
              />
            ) : (
              <FormattedMessage
                id="USER.SUPPLIER.NEW_TITLE"
                defaultMessage="New Supplier"
              />
            )
          }
          footer={[
            <div className="flex justify-between" key="footer-buttons">
              <button className="btn btn-light" onClick={() => onClose(false)}>
                <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                {supplierData ? (
                  <FormattedMessage
                    id="COMMON.UPDATE"
                    defaultMessage="Update"
                  />
                ) : (
                  <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                )}
              </button>
            </div>,
          ]}
        >
          <div className="flex flex-col gap-y-4 max-h-[450px] overflow-auto scrollable-y">
            <div className="flex flex-col gap-2">
              <label className="form-label">
                <FormattedMessage
                  id="COMMON.SUPPLIER"
                  defaultMessage="Supplier"
                />
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
  options={suplierList}
  value={
    suplierList.find(
      (s) => s.value === formData.suplierlistid
    ) || null
  }
  onChange={(selected) =>
    setFormData((prev) => ({
      ...prev,
      suplierlistid: selected?.value || "",
    }))
  }
  isClearable
  isSearchable
  placeholder={
    <FormattedMessage
      id="COMMON.SELECT_SUPPLIER"
      defaultMessage="Select Supplier"
    />
  }
  menuPortalTarget={document.body}
  menuPosition="fixed"
  styles={{
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
      minHeight: "38px",
      borderColor: "#d1d5db",
    }),
  }}
/>
                </div>

                {/* Open Vendor Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setIsVendorModalOpen(true);
                    onClose(false); // hide supplier modal
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full shadow hover:scale-105 transition"
                  title="Add Vendor"
                >
                  <i className="ki-filled ki-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </CustomModal>
      )}

      {/* AddVendor Modal with Portal */}
      {/* AddVendor Modal */}
      <AddVendor
        isModalOpen={isVendorModalOpen}
        setIsModalOpen={(val) => {
          setIsVendorModalOpen(val);

          if (!val) {
            // Vendor modal is closed → reopen supplier
            onClose(true);
            FetchSuplier();
          }
        }}
        refreshData={FetchSuplier}
      />
    </>
  );
};

export default AddSupplier;
