import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage, useIntl } from "react-intl";
import { ContactNameItem } from "../../services/apiServices";
import AddContactName from "@/pages/master/MenuItemMaster/components/AddContactName";
import { Plus } from "lucide-react";

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-5 h-5 fill-current"
  >
    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.04 0C5.44.03.16 5.32.16 11.93c0 2.1.55 4.14 1.6 5.95L0 24l6.29-1.73a11.9 11.9 0 0 0 5.75 1.48h.01c6.59 0 11.86-5.28 11.89-11.88a11.87 11.87 0 0 0-3.42-8.39ZM12.05 21.2h-.01a9.27 9.27 0 0 1-4.73-1.29l-.34-.2-3.73 1.03 1-3.64-.22-.37A9.25 9.25 0 0 1 2.78 11.9c0-5.11 4.16-9.28 9.29-9.3 2.48 0 4.81.97 6.56 2.72a9.26 9.26 0 0 1 2.72 6.56c-.02 5.12-4.18 9.3-9.3 9.31Zm5.32-6.93c-.29-.15-1.7-.84-1.96-.94-.26-.09-.45-.15-.65.15-.2.29-.74.94-.91 1.13-.17.19-.34.21-.63.08-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.09-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.24-.58-.48-.5-.65-.5l-.56-.01c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36s1.02 2.74 1.16 2.93c.14.19 2 3.06 4.85 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />
  </svg>
);

const BaseInput = (props) => (
  <input
    {...props}
    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
  />
);

const BaseSelect = (props) => (
  <select
    {...props}
    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
  >
    {props.children}
  </select>
);

export default function SidebarInsideModal({
  open,
  onClose,
  eventId,
  eventFunctionId,
  row,
  functionName,
  functionDateTime,
  onSave,
  personCount,
}) {
  const [menuAllocations, setMenuAllocations] = useState([]);
  const [contactNames, setContactNames] = useState([]);
  const [showRawMaterials, setShowRawMaterials] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [contactTypeId, setContactTypeId] = useState(7);
  const [concatId, setConcatId] = useState(7);
  const intl = useIntl();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (!open || !row) return;

    const allocations = row?.eventFunctionMenuAllocations || [];

    const isInsideRow = row?.inside === true;

    const insideAllocations = allocations
      .filter((alloc) => {
        if (isInsideRow) return true;

        return alloc.isOutside === false;
      })
      .map((alloc) => ({
        partyId: alloc.partyId || null,
        partyName: alloc.partyName || "",
        number: alloc.number || "",
        person: alloc.pax || 0,
        remarks: alloc.remarks || "",
        isInside: true,
        shiftTransPrice: alloc.shiftTransPrice ?? 0,
      }));

    if (insideAllocations.length === 0) {
      setMenuAllocations([
        {
          partyId: null,
          partyName: "",
          contactNumber: "",
          person: "",
          remarks: "",
          isInside: true,
          shiftTransPrice: 0,
        },
      ]);
    } else {
      setMenuAllocations(insideAllocations);
    }
  }, [open, row]);

  useEffect(() => {
    const fetchContactNames = async () => {
      if (!userId) {
        console.error("User ID not found");
        setContactsError("User ID not found");
        return;
      }

      setIsLoadingContacts(true);
      setContactsError(null);

      try {
        const res = await ContactNameItem(userId, "Inside Cook");

        if (res?.data?.data) {
          const formattedContacts = res.data.data["Party Details"].map(
            (contact) => ({
              id: contact.id,
              partyName: contact.nameEnglish,
              contactNumber: contact.mobile || contact.phone || "",
            })
          );

          setContactNames(formattedContacts);
        } else {
          console.warn("No contact data received");
          setContactNames([]);
        }
      } catch (error) {
        console.error("Error fetching contact names:", error);
        setContactsError("Failed to load contacts");
        setContactNames([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (open) {
      fetchContactNames();
    }
  }, [open, userId]);

  const handleAddRow = () => {
    setMenuAllocations((prev) => [
      ...prev,
      {
        partyId: null,
        partyName: "",
        contactNumber: "",
        person: "",
        remarks: "",
        isInside: true,
        shiftTransPrice: 0,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...menuAllocations];
    updated[index][field] = value;
    setMenuAllocations(updated);
  };

  const handlePartyChange = (index, partyName) => {
    const updated = [...menuAllocations];
    const selectedParty = contactNames.find((c) => c.partyName === partyName);
    updated[index].partyId = selectedParty?.id || null;
    updated[index].partyName = partyName;
    updated[index].contactNumber = selectedParty?.contactNumber || "";
    setMenuAllocations(updated);
  };

  const handleSave = () => {
  const saveData = {
    eventId,
    eventFunctionId,
    menuItemId: row?.menuItemId,
    menuCategoryId: row?.menuCategoryId,
    allocationType: "inside",
    allocations: menuAllocations.filter(
      (alloc) => alloc.partyId || (Number(alloc.shiftTransPrice) || 0) > 0
    ),
  };
  
 
  

  if (onSave) {
    onSave(saveData);
  }
  onClose();
};

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleRemoveRow = (index) => {
    setMenuAllocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWhatsAppShare = (allocation) => {
    const message = `Hello ${allocation.partyName},%0A%0AYou have been assigned for:%0AItem: ${row?.itemName}%0ACategory: ${row?.categoryName}%0APerson Count: ${allocation.person}%0ARemarks: ${allocation.remarks || "N/A"}%0A%0AThank you!`;
    const whatsappUrl = `https://wa.me/${allocation.contactNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const rawMaterials = row?.menuItemRawMaterials || [];
  const totalRawMaterialCost = rawMaterials.reduce(
    (sum, item) => sum + (item.rate || 0),
    0
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[950px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="text-[18px] font-semibold text-gray-800">
                    <FormattedMessage
                      id="SIDEBAR_MODAL.INSIDE_DETAILS"
                      defaultMessage="Inside Details"
                    />
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    {row?.categoryName} - {row?.itemName}
                  </div>
                  {row?.totalRate > 0 && (
                    <div className="text-[12px] text-blue-600 mt-0.5">
                      Total Rate: ₹{row.totalRate} | Cost: ₹
                      {row.dishCosting || 0}
                    </div>
                  )}
                </div>
                <button
                  className="h-9 px-3 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  autoFocus
                >
                  <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm btn-primary w-[100px] flex justify-center">
                      {functionName || "Function"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-[12px] text-gray-600">
                        <FormattedMessage
                          id="SIDEBAR_MODAL.DATE_TIME"
                          defaultMessage="Date & Time"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          className="h-9 px-3 rounded-md border border-gray-300 text-sm"
                          type="text"
                          value={functionDateTime || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col w-[80px] gap-1">
                      <div className="text-[12px] text-gray-600">
                        <FormattedMessage
                          id="SIDEBAR_MODAL.PERSON"
                          defaultMessage="Person"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          className="h-9 px-3 rounded-md border border-gray-300 text-sm w-full"
                          type="text"
                          value={personCount || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm btn-primary w-[100px] flex justify-center">
                      <FormattedMessage
                        id="SIDEBAR_MODAL.INSIDE"
                        defaultMessage="Inside"
                      />
                    </button>
                  </div>
                  {/* {rawMaterials.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        className="btn btn-sm btn-light border border-gray-300"
                        onClick={() => setShowRawMaterials(!showRawMaterials)}
                      >
                        {showRawMaterials ? "Hide" : "Show"} Raw Materials (
                        {rawMaterials.length})
                      </button>
                    </div>
                  )} */}
                </div>

                {/* {showRawMaterials && rawMaterials.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-xl border border-blue-200 bg-blue-50/30 overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-blue-100/50 border-b border-blue-200">
                      <h3 className="text-[14px] font-semibold text-blue-900">
                        Raw Materials Required
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 text-[12px] font-medium text-gray-700 mb-2 pb-2 border-b border-blue-200">
                        <div>Material Name</div>
                        <div className="text-right">Weight</div>
                        <div className="text-right">Unit</div>
                        <div className="text-right">Rate</div>
                      </div>
                      {rawMaterials.map((material, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 text-[13px] py-2 border-b border-blue-100 last:border-0"
                        >
                          <div className="text-gray-800">
                            {material.rawMaterial?.nameEnglish || "N/A"}
                            <span className="text-[11px] text-gray-500 ml-2">
                              (
                              {material.rawMaterial?.rawMaterialCat
                                ?.nameEnglish || ""}
                              )
                            </span>
                          </div>
                          <div className="text-right text-gray-700">
                            {material.weight || 0}
                          </div>
                          <div className="text-right text-gray-700">
                            {material.unit?.symbolEnglish || "N/A"}
                          </div>
                          <div className="text-right text-gray-700">
                            ₹{material.rate || 0}
                          </div>
                        </div>
                      ))}
                      {totalRawMaterialCost > 0 && (
                        <div className="mt-2 pt-2 border-t-2 border-blue-300 flex justify-end">
                          <div className="text-[14px] font-semibold text-blue-900">
                            Total Cost: ₹{totalRawMaterialCost.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )} */}

                {contactsError && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-[13px] text-red-800">
                      {contactsError}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <button
                    className="btn btn-sm btn-primary w-[100px] flex justify-center"
                    onClick={handleAddRow}
                  >
                    <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[64px_2fr_1.5fr_1fr_1fr_2fr_88px] items-center px-4 py-3 bg-[#F9FAFC] text-[14px] font-medium text-black">
                    <div>
                      <FormattedMessage id="COMMON.NO" defaultMessage="No." />
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      <FormattedMessage
                        id="SIDEBAR_MODAL.CONTACT_NAME"
                        defaultMessage="Contact Name"
                      />
                      <button onClick={() => setIsMemberModalOpen(true)}>
                        <Plus className="w-6 h-6   text-white bg-blue-700 rounded-full p-1" />
                      </button>
                    </div>
                    <div>
                      <FormattedMessage
                        id="COMMON.NUMBER"
                        defaultMessage="Number"
                      />
                    </div>
                    <div>
                      <FormattedMessage
                        id="COMMON.PERSON"
                        defaultMessage="Person"
                      />
                    </div>
                    <div>
                      <FormattedMessage
                        id="SIDEBAR_MODAL.SHIFT_TRANS_PRICE"
                        defaultMessage="Transport Price"
                      />
                    </div>
                    <div>
                      <FormattedMessage
                        id="COMMON.REMARKS"
                        defaultMessage="Remarks"
                      />
                    </div>
                    <div className="text-center">
                      <FormattedMessage
                        id="COMMON.ACTIONS"
                        defaultMessage="Actions"
                      />
                    </div>
                  </div>

                  {menuAllocations.map((allocation, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[64px_2fr_1.5fr_1fr_1fr_2fr_88px] items-start gap-3 px-4 py-3 border-t border-gray-100"
                    >
                      <div className="text-[13px] text-gray-700 pt-2">
                        {idx + 1}.
                      </div>

                      <div>
                        <BaseSelect
                          value={allocation.partyName}
                          onChange={(e) =>
                            handlePartyChange(idx, e.target.value)
                          }
                          disabled={isLoadingContacts}
                        >
                          <option value="">
                            {isLoadingContacts ? (
                              "Loading..."
                            ) : contactsError ? (
                              "Error loading contacts"
                            ) : (
                              <FormattedMessage
                                id="COMMON.SELECT_NAME"
                                defaultMessage="Select Name"
                              />
                            )}
                          </option>
                          {contactNames.map((c) => (
                            <option key={c.id} value={c.partyName}>
                              {c.partyName}
                            </option>
                          ))}
                        </BaseSelect>
                      </div>

                      <div>
                        <BaseInput
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "COMMON.NUMBER",
                            defaultMessage: "Number",
                          })}
                          value={allocation.number}
                          onChange={(e) =>
                            handleInputChange(idx, "number", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <BaseInput
                          type="tel"
                          placeholder={intl.formatMessage({
                            id: "COMMON.PERSON",
                            defaultMessage: "Person",
                          })}
                          value={allocation.person}
                          onChange={(e) =>
                            handleInputChange(idx, "person", e.target.value)
                          }
                        />
                      </div>


                            <div>
  <BaseInput
    type="tel"
    placeholder="Transport Price"
    value={allocation.shiftTransPrice ?? ""}
    onChange={(e) =>
      handleInputChange(idx, "shiftTransPrice", e.target.value)
    }
    style={{
      fontWeight: "600",
      color: (allocation.shiftTransPrice ?? 0) > 0 ? "#1d4ed8" : "#6b7280",
    }}
  />
</div>
                      <div>
                        <BaseInput
                          type="text"
                          placeholder={intl.formatMessage({
                            id: "COMMON.REMARKS",
                            defaultMessage: "Remarks",
                          })}
                          value={allocation.remarks}
                          onChange={(e) =>
                            handleInputChange(idx, "remarks", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-center gap-1 pt-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-clear hover:bg-red-50"
                          title="Remove Row"
                          onClick={() => handleRemoveRow(idx)}
                        >
                          <i className="ki-filled ki-trash text-danger"></i>
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#20c964] text-white shadow hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Share on WhatsApp"
                          onClick={() => handleWhatsAppShare(allocation)}
                          disabled={
                            !allocation.contactNumber || !allocation.partyName
                          }
                        >
                          <WhatsAppIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {row?.remarks && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-[12px] font-medium text-yellow-800 mb-1">
                      Item Remarks:
                    </div>
                    <div className="text-[13px] text-yellow-900">
                      {row.remarks}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2">
                <button
                  className="h-9 px-4 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <FormattedMessage
                    id="COMMON.CANCEL"
                    defaultMessage="Cancel"
                  />
                </button>
                <button
                  className="btn btn-sm btn-primary w-[100px] flex justify-center"
                  onClick={handleSave}
                >
                  <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        concatId={concatId}
        contactTypeId={contactTypeId}
      />
    </AnimatePresence>
  );
}
