import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContactNameItem, Getunit } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
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

export default function SidebarModal({
  open,
  onClose,
  eventId,
  eventFunctionId,
  row,
  functionName,
  functionDateTime,
  onSave,
  personCount,
  HasUnsavedChanges,
}) {
  const [menuAllocations, setMenuAllocations] = useState([]);
  const [contactNames, setContactNames] = useState([]);
  const [unit, setUnit] = useState([]);
  const intl = useIntl();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [contactTypeId, setContactTypeId] = useState(6);
  const [concatId, setConcatId] = useState(6);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!open || !row) return;
    const allocations = row.eventFunctionMenuAllocations || [];

    const outsideAllocations = allocations
      .filter((alloc) => alloc.isOutside === true)
      .map((alloc) => {
        const price = parseFloat(alloc.price) || 0;
        const quantity = parseFloat(alloc.quantity) || 0;
        const totalPrice =
          alloc.totalPrice || (price && quantity ? price * quantity : "");

        return {
          partyId: alloc.partyId || 0,
          partyName: alloc.partyName || "",
          price: alloc.price || "",
          quantity: alloc.quantity || "",
          unitId: alloc.unitId || null,
          unitName: alloc.unitName || "Nos",

          totalPrice:
    (parseFloat(alloc.price) || 0) * (parseFloat(alloc.quantity) || 0) +
    (parseFloat(alloc.shiftTransPrice) || 0),
          isOutside: alloc.isOutside,
          shiftTransPrice: alloc.shiftTransPrice ?? 0,
        };
      });

    if (outsideAllocations.length === 0) {
      setMenuAllocations([
        {
          partyId: null,
          partyName: "",
          price: "",
          quantity: "",
          unitId: null,
          unitName: "Nos",
          totalPrice: "",
          isOutside: true,
          shiftTransPrice: 0,
        },
      ]);
    } else {
      setMenuAllocations(outsideAllocations);
    }
  }, [open, row]);

  useEffect(() => {
    const FetchContactName = async () => {
      try {
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const res = await ContactNameItem(userId, "Outside Supplier (Food)");

        if (res?.data?.data) {
          const formattedContacts = res.data.data["Party Details"].map(
            (contact) => ({
              id: contact.id,
              partyName: contact.nameEnglish,
            }),
          );

          setContactNames(formattedContacts);
        }
      } catch (error) {
        console.error("Error fetching contact name:", error);
      }
    };
    const FetchUnits = async () => {
      try {
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const res = await Getunit(userId);

        if (res?.data?.data) {
          const unitData = res.data.data["Unit Details"].map((unit) => ({
            id: unit.id,
            unitName: unit.nameEnglish,
          }));

          setUnit(unitData);
        }
      } catch (error) {
        console.error("Error fetching contact name:", error);
      }
    };

    if (open) {
      FetchContactName();
      FetchUnits();
    }
  }, [open]);

  const handleAddRow = () => {
    setMenuAllocations((prev) => [
      ...prev,
      {
        partyId: null,
        partyName: "",
        price: "",
        quantity: "",
        unitId: null,
        unitName: "Nos",

        totalPrice: "",
        isOutside: true,
         shiftTransPrice: 0,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
  const updated = [...menuAllocations];
  updated[index][field] = value;

  if (field === "unitName") {
    const selectedUnit = unit.find((u) => u.unitName === value);
    updated[index].unitId = selectedUnit?.id || null;
  }

  if (field === "price" || field === "quantity" || field === "shiftTransPrice") {
    const price = parseFloat(updated[index].price) || 0;
    const qty = parseFloat(updated[index].quantity) || 0;
    const transport = parseFloat(updated[index].shiftTransPrice) || 0;
    updated[index].totalPrice = price * qty + transport;
  }

  setMenuAllocations(updated);
};

  const handlePartyChange = (index, partyName) => {
    const updated = [...menuAllocations];
    const selectedParty = contactNames.find((c) => c.partyName === partyName);
    updated[index].partyId = selectedParty?.id || null;
    updated[index].partyName = partyName;
    setMenuAllocations(updated);
  };

  const handleUnitChange = (index, unitId) => {
    const updated = [...menuAllocations];

    const selectedUnit = unit.find((u) => u.id === unitId);

    updated[index].unitId = unitId;
    updated[index].unitName = selectedUnit?.unitName || "";

    setMenuAllocations(updated);
  };

  const handleSave = () => {
    const saveData = {
      eventId,
      eventFunctionId,
      menuItemId: row?.menuItemId,
      menuCategoryId: row?.menuCategoryId,
      allocationType: "outside",
      allocations: menuAllocations
        .filter((alloc) => alloc.partyId && (alloc.price || alloc.quantity))
        .map((alloc) => ({
          partyId: alloc.partyId,
          partyName: alloc.partyName,
          price: alloc.price,
          quantity: alloc.quantity,
          unitId: alloc.unitId, // ADD THIS
          unitName: alloc.unitName,
          totalPrice: alloc.totalPrice,
          isOutside: alloc.isOutside,
          shiftTransPrice: alloc.shiftTransPrice ?? 0,
        })),
    };

    if (onSave) {
      onSave(saveData);
    }
    HasUnsavedChanges = true;

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
                      id="SIDEBAR_MODAL.AGENCY_ORDER"
                      defaultMessage="Agency Order"
                    />
                  </div>
                  <div className="text-[13px] text-gray-600 mt-1">
                    {row?.categoryName} - {row?.itemName}
                  </div>
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
                <div className="flex items-end gap-4">
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
                    <div className="flex flex-col w-[50px] gap-1">
                      <div className="text-[12px] text-gray-600">
                        <FormattedMessage
                          id="SIDEBAR_MODAL.PERSON"
                          defaultMessage="Person"
                        />
                      </div>
                      <div className="flex gap-3">
                        <input
                          className="input"
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
                        id="SIDEBAR_MODAL.OUTSIDE"
                        defaultMessage="Outside"
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    className="btn btn-sm btn-primary w-[100px] flex justify-center"
                    onClick={handleAddRow}
                  >
                    <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[64px_2fr_1fr_1fr_120px_1fr_1fr_88px] items-center px-4 py-3 bg-[#F9FAFC] text-[14px] font-medium text-black">
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
                        id="COMMON.PRICE"
                        defaultMessage="Price"
                      />
                    </div>
                    <div>
                      <FormattedMessage
                        id="COMMON.QUANTITY"
                        defaultMessage="Quantity"
                      />
                    </div>
                    <div>
                      <FormattedMessage
                        id="COMMON.UNIT"
                        defaultMessage="Unit"
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
                        id="COMMON.TOTAL_PRICE"
                        defaultMessage="Total Price"
                      />
                    </div>
                    
                    <div className="text-center">
                      <FormattedMessage
                        id="COMMON.ACTIONS"
                        defaultMessage="Actions"
                      />
                    </div>
                  </div>

                  {menuAllocations.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[64px_2fr_1fr_1fr_120px_1fr_1fr_88px] items-start gap-3 px-4 py-3 border-t border-gray-100"
                    >
                      <div className="text-[13px] text-gray-700 pt-2">
                        {idx + 1}.
                      </div>

                      <div>
                        <BaseSelect
                          value={row.partyName}
                          onChange={(e) =>
                            handlePartyChange(idx, e.target.value)
                          }
                        >
                          <option value="">
                            <FormattedMessage
                              id="COMMON.SELECT_NAME"
                              defaultMessage="Select Name"
                            />
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
                          type="tel"
                          placeholder={intl.formatMessage({
                            id: "COMMON.PRICE",
                            defaultMessage: "Price",
                          })}
                          value={row.price}
                          onChange={(e) =>
                            handleInputChange(idx, "price", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <BaseInput
                          type="tel"
                          placeholder={intl.formatMessage({
                            id: "COMMON.QUANTITY",
                            defaultMessage: "Qty",
                          })}
                          value={row.quantity}
                          onChange={(e) =>
                            handleInputChange(idx, "quantity", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <BaseSelect
                          value={row.unitId || ""}
                          onChange={(e) =>
                            handleUnitChange(idx, Number(e.target.value))
                          }
                        >
                          <option value="">
                            <FormattedMessage
                              id="COMMON.SELECT_NAME"
                              defaultMessage="Select Unit"
                            />
                          </option>

                          {unit.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.unitName}
                            </option>
                          ))}
                        </BaseSelect>
                      </div>
                            <div>
  <BaseInput
    type="tel"
    placeholder="Transport Price"
    value={row.shiftTransPrice ?? ""}
    onChange={(e) =>
      handleInputChange(idx, "shiftTransPrice", e.target.value)
    }
    style={{
      fontWeight: "600",
      color: (row.shiftTransPrice ?? 0) > 0 ? "#1d4ed8" : "#6b7280",
    }}
  />
</div>
                      <div>
                        <BaseInput
                          type="tel"
                          placeholder={intl.formatMessage({
                            id: "COMMON.TOTAL",
                            defaultMessage: "Total",
                          })}
                          readOnly
                          value={row.totalPrice}
                        />
                      </div>

                      

                      <div className="flex items-center justify-center pt-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-clear"
                          title="Remove Row"
                          onClick={() => handleRemoveRow(idx)}
                        >
                          {" "}
                          <i className="ki-filled ki-trash text-danger"></i>
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#20c964] text-white shadow hover:brightness-95"
                          title="Share on WhatsApp"
                        >
                          <WhatsAppIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
