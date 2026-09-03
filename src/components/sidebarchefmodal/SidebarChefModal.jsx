import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OutsideContactName, GetUnitData } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import AddVendor from "@/partials/modals/add-vendor/AddVendor";
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

export default function SidebarChefModal({
  open,
  onClose,
  eventId,
  eventFunctionId,
  row,
  chefModalData,
  functionName,
  functionDateTime,
  onSave,
}) {
  const [menuAllocations, setMenuAllocations] = useState([]);
  const [contactNames, setContactNames] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extraRows, setExtraRows] = useState([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [contactTypeId, setContactTypeId] = useState([5]);
  const [concatId, setConcatId] = useState([5]);

  let userId = localStorage.getItem("userId");
  const intl = useIntl();

  // ✅ ADD THIS NEW useEffect
  useEffect(() => {
    if (!open || !chefModalData) return;

    setLoading(true);

    try {
      // Process the data passed from parent
      const processedAllocations = [
        {
          menuItemId: chefModalData.menuItemId,
          menuCategoryId: chefModalData.menuCategoryId,
          chefLabour: chefModalData.chefLabour,
          personCount: chefModalData.personCount,
          eventFunctionMenuAllocations:
            chefModalData.eventFunctionMenuAllocations?.map((alloc) => {
              // Normalize serviceType
              let normalizedServiceType = alloc.serviceType;
              if (alloc.serviceType === "plate_wise") {
                normalizedServiceType = "Plate Wise";
              } else if (alloc.serviceType === "counter_wise") {
                normalizedServiceType = "Counter Wise";
              }

              // Calculate based on service type
              if (normalizedServiceType === "Plate Wise") {
                const qty = parseFloat(alloc.quantity) || 0;
                const price = parseFloat(alloc.price) || 0;
                const calculatedTotal = qty * price;

                return {
                  ...alloc,
                  serviceType: normalizedServiceType,
                  totalPrice:
                    alloc.totalPrice && alloc.totalPrice > 0
                      ? alloc.totalPrice
                      : calculatedTotal,
                  counterQuantity: alloc.quantity || 0,
                  counterPrice: alloc.price || 0,
                  helperQuantity: 0,
                  helperPrice: 0,
                };
              }

              // Counter Wise
              const counterQty = parseFloat(alloc.counterQuantity) || 0;
              const helperQty = parseFloat(alloc.helperQuantity) || 0;
              const counterPrice = parseFloat(alloc.counterPrice) || 0;
              const helperPrice = parseFloat(alloc.helperPrice) || 0;
              const calculatedTotal =
                counterQty * counterPrice + helperQty * helperPrice;

              return {
                ...alloc,
                serviceType: normalizedServiceType,
                totalPrice:
                  alloc.totalPrice && alloc.totalPrice > 0
                    ? alloc.totalPrice
                    : calculatedTotal,
              };
            }) || [],
        },
      ];

      setMenuAllocations(processedAllocations);
    } catch (error) {
      console.error("❌ Error processing chef modal data:", error);
    } finally {
      setLoading(false);
    }
  }, [open, chefModalData]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [defaultRow, setDefaultRow] = useState({
    partyId: "",
    serviceType: "",
    counterQuantity: "",
    helperQuantity: "",
    counterPrice: "",
    helperPrice: "",
    unit: "",
    unitId: "",
    totalPrice: 0,
    shiftTransPrice: 0, 
  });

  useEffect(() => {
    FetchUnit();
    FetchSupplier();
  }, []);

  const FetchUnit = async () => {
    try {
      const data = await GetUnitData(userId);
      const unitdata = data?.data?.data["Unit Details"] || [];
      const normalizedUnits = unitdata.map((unit) => ({
        ...unit,
        unitId: unit.id || unit.unitId,
      }));
      setUnits(normalizedUnits);
    } catch (error) {
      console.log(error);
    }
  };

  const FetchSupplier = async () => {
    try {
      const data = await OutsideContactName(5, userId);

      const supplierdata = data?.data?.data["Party Details"] || [];
      setContactNames(supplierdata);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddRow = () => {
    setExtraRows([
      ...extraRows,
      {
        id: Date.now(),
        partyId: "",
        serviceType: "",
        counterQuantity: "",
        helperQuantity: "",
        counterPrice: "",
        helperPrice: "",
        unit: "",
        unitId: "",
        totalPrice: 0,
        shiftTransPrice: 0,
      },
    ]);
  };

  useEffect(() => {
    extraRows.forEach((row, idx) => {});
  }, [extraRows]);

  const handleDefaultRowChange = (field, value) => {
    setDefaultRow((prev) => {
      const updated = { ...prev, [field]: value };

      const counterQty = parseFloat(updated.counterQuantity) || 0;
      const helperQty = parseFloat(updated.helperQuantity) || 0;
      const counterPrice = parseFloat(updated.counterPrice) || 0;
      const helperPrice = parseFloat(updated.helperPrice) || 0;

      const transport = parseFloat(updated.shiftTransPrice) || 0;

if (updated.serviceType === "Plate Wise") {
  updated.totalPrice = counterQty * counterPrice + transport;
} else {
  updated.totalPrice =
    counterQty * counterPrice +
    helperQty * helperPrice +
    transport;
}
   

      return updated;
    });
  };

  const handleRemoveRow = (index) => {
    setExtraRows((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ NEW FUNCTION: Handle deletion of existing rows from menuAllocations
  const handleRemoveExistingRow = (allocIndex) => {
    setMenuAllocations((prev) => {
      const updated = [...prev];
      const currentItem = updated.find(
        (m) =>
          m.menuItemId === row?.menuItemId &&
          m.menuCategoryId === row?.menuCategoryId &&
          m.chefLabour === true,
      );

      if (currentItem && currentItem.eventFunctionMenuAllocations) {
        currentItem.eventFunctionMenuAllocations =
          currentItem.eventFunctionMenuAllocations.filter(
            (_, idx) => idx !== allocIndex,
          );
      }

      return updated;
    });
  };

  const handleExtraRowChange = (index, field, value) => {
    setExtraRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      const counterQty = parseFloat(updated[index].counterQuantity) || 0;
      const helperQty = parseFloat(updated[index].helperQuantity) || 0;
      const counterPrice = parseFloat(updated[index].counterPrice) || 0;
      const helperPrice = parseFloat(updated[index].helperPrice) || 0;

      const transport = parseFloat(updated[index].shiftTransPrice) || 0;

if (updated[index].serviceType === "Plate Wise") {
  updated[index].totalPrice =
    counterQty * counterPrice + transport;
} else {
  updated[index].totalPrice =
    counterQty * counterPrice +
    helperQty * helperPrice +
    transport;
}

      return updated;
    });
  };

  const handleExistingRowChange = (allocIndex, field, value) => {
    setMenuAllocations((prev) => {
      const updated = [...prev];
      const currentItem = updated.find(
        (m) =>
          m.menuItemId === row?.menuItemId &&
          m.menuCategoryId === row?.menuCategoryId &&
          m.chefLabour === true,
      );

      if (currentItem && currentItem.eventFunctionMenuAllocations) {
        currentItem.eventFunctionMenuAllocations[allocIndex][field] = value;

        const alloc = currentItem.eventFunctionMenuAllocations[allocIndex];

        const counterQty = parseFloat(alloc.counterQuantity) || 0;
        const helperQty = parseFloat(alloc.helperQuantity) || 0;
        const counterPrice = parseFloat(alloc.counterPrice) || 0;
        const helperPrice = parseFloat(alloc.helperPrice) || 0;

        const transport = parseFloat(alloc.shiftTransPrice) || 0;

if (alloc.serviceType === "Plate Wise") {
  alloc.totalPrice = counterQty * counterPrice + transport;
} else {
  alloc.totalPrice =
    counterQty * counterPrice +
    helperQty * helperPrice +
    transport;
}
      }

      return updated;
    });
  };

  const handleSave = async () => {
    const hasIncompleteDefaultRow =
      (defaultRow.partyId || defaultRow.serviceType) &&
      !(defaultRow.counterQuantity || defaultRow.helperQuantity);

    if (hasIncompleteDefaultRow) {
      alert("Please complete all fields or clear the selection before saving");
      return;
    }
    const currentItem = menuAllocations.find(
      (m) =>
        m.menuItemId === row?.menuItemId &&
        m.menuCategoryId === row?.menuCategoryId &&
        m.chefLabour === true,
    );

    const existingAllocations = currentItem?.eventFunctionMenuAllocations || [];

    const defaultRowData = [];
    if (defaultRow.partyId && defaultRow.partyId && defaultRow.serviceType) {
      const defaultRowToSave = {
        partyId: defaultRow.partyId,
        serviceType: defaultRow.serviceType,
        isChefLabour: true,
        shiftTransPrice: parseFloat(defaultRow.shiftTransPrice) || 0,
      };

      // For Plate Wise, only include relevant fields
      if (defaultRow.serviceType === "Plate Wise") {
        defaultRowToSave.quantity = defaultRow.counterQuantity || 0;
        defaultRowToSave.price = defaultRow.counterPrice || 0;
        defaultRowToSave.unit = defaultRow.unit || "";
        defaultRowToSave.unitId = defaultRow.unitId || "";
        defaultRowToSave.totalPrice =
          (parseFloat(defaultRow.counterQuantity) || 0) *
          (parseFloat(defaultRow.counterPrice) || 0);

        defaultRowToSave.counterQuantity = 0;
        defaultRowToSave.counterPrice = 0;
        defaultRowToSave.helperQuantity = 0;
        defaultRowToSave.helperPrice = 0;
      } else {
        defaultRowToSave.counterQuantity = defaultRow.counterQuantity || 0;
        defaultRowToSave.counterPrice = defaultRow.counterPrice || 0;
        defaultRowToSave.helperQuantity = defaultRow.helperQuantity || 0;
        defaultRowToSave.helperPrice = defaultRow.helperPrice || 0;
        defaultRowToSave.totalPrice =
          (parseFloat(defaultRow.counterQuantity) || 0) *
            (parseFloat(defaultRow.counterPrice) || 0) +
          (parseFloat(defaultRow.helperQuantity) || 0) *
            (parseFloat(defaultRow.helperPrice) || 0);

        defaultRowToSave.quantity = 0;
        defaultRowToSave.price = 0;
        defaultRowToSave.unit = "";
        defaultRowToSave.unitId = "";
      }

      defaultRowData.push(defaultRowToSave);
    }

    const allAllocations = [
      ...existingAllocations,
      ...defaultRowData,
      ...extraRows,
    ]
      .filter((alloc) => {
        const hasParty = alloc.partyId && alloc.partyId !== "";
        const hasQuantity =
          (alloc.counterQuantity && parseFloat(alloc.counterQuantity) > 0) ||
          (alloc.helperQuantity && parseFloat(alloc.helperQuantity) > 0) ||
          (alloc.quantity && parseFloat(alloc.quantity) > 0);

        return hasParty;
      })
      .map((alloc) => {
        const allocToSave = {
          partyId: alloc.partyId,
          serviceType: alloc.serviceType,
          isChefLabour: true,
          shiftTransPrice: parseFloat(alloc.shiftTransPrice) || 0,
        };

        if (alloc.serviceType === "Plate Wise") {
  allocToSave.quantity = alloc.counterQuantity || alloc.quantity;
  allocToSave.price = alloc.counterPrice || alloc.price;
  allocToSave.unit = alloc.unit || "";
  allocToSave.unitId = alloc.unitId || "";
  allocToSave.totalPrice = alloc.totalPrice || 0;  
  allocToSave.counterQuantity = 0;
  allocToSave.counterPrice = 0;
  allocToSave.helperQuantity = 0;
  allocToSave.helperPrice = 0;
}  else {
  allocToSave.counterQuantity = alloc.counterQuantity || 0;
  allocToSave.counterPrice = alloc.counterPrice || 0;
  allocToSave.helperQuantity = alloc.helperQuantity || 0;
  allocToSave.helperPrice = alloc.helperPrice || 0;
  allocToSave.totalPrice = alloc.totalPrice || 0;  // ← use already-calculated value, don't recalculate
  allocToSave.quantity = 0;
  allocToSave.price = 0;
  allocToSave.unit = "";
  allocToSave.unitId = "";
}
        return allocToSave;
      });

    const saveData = {
      eventId,
      eventFunctionId,
      menuItemId: row?.menuItemId,
      menuCategoryId: row?.menuCategoryId,
      allocationType: "chefLabour",
      allocations: allAllocations,
    };

    if (onSave) {
      await onSave(saveData);
    }

    setMenuAllocations((prev) => {
      const updated = [...prev];
      const itemIndex = updated.findIndex(
        (m) =>
          m.menuItemId === row?.menuItemId &&
          m.menuCategoryId === row?.menuCategoryId &&
          m.chefLabour === true,
      );

      if (itemIndex !== -1) {
        updated[itemIndex] = {
          ...updated[itemIndex],
          eventFunctionMenuAllocations: allAllocations,
        };
      } else {
        updated.push({
          menuItemId: row?.menuItemId,
          menuCategoryId: row?.menuCategoryId,
          chefLabour: true,
          eventFunctionMenuAllocations: allAllocations,
        });
      }

      return updated;
    });

    setExtraRows([]);
    setDefaultRow({
      partyId: "",
      serviceType: "",
      counterQuantity: "",
      helperQuantity: "",
      counterPrice: "",
      helperPrice: "",
      unit: "",
      unitId: "",
      totalPrice: 0,
    });

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
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[1200px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="text-[18px] font-semibold text-gray-800">
                  <FormattedMessage
                    id="SIDEBAR_MODAL.AGENCY_ORDER"
                    defaultMessage="Agency Order - "
                  />{" "}
                  {row?.itemName}
                </div>
                <button
                  className="h-9 px-3 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  autoFocus
                >
                  <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
                </button>
              </div>
              <div className="p-4">
                {/* Top Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mt-6">
                      <button className="btn btn-sm btn-primary w-[100px] flex justify-center">
                        {functionName}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="text-[12px] text-gray-600">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.DATE_TIME"
                            defaultMessage="Date and Time No."
                          />
                        </div>
                        <div className="flex gap-3">
                          <input
                            className="input"
                            type="text"
                            value={functionDateTime}
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
                            value={
                              menuAllocations.find(
                                (m) =>
                                  m.menuItemId === row?.menuItemId &&
                                  m.menuCategoryId === row?.menuCategoryId,
                              )?.personCount || ""
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-content-end gap-2 mt-6">
                      <button className="btn btn-sm btn-primary w-[100px] flex justify-center">
                        <FormattedMessage
                          id="SIDEBAR_MODAL.CHEF_LABOUR"
                          defaultMessage="Chef Labour"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <button
                      className="btn btn-sm btn-primary w-[100px] flex justify-center"
                      onClick={handleAddRow}
                    >
                      <FormattedMessage
                        id="SIDEBAR_MODAL.ADD"
                        defaultMessage="Add"
                      />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* ── Grouped Header ── */}
                  {/* ── Grouped Header ── */}
<div className="bg-[#F9FAFC] border-b border-gray-200">
  {/* Row 1 */}
  <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_88px] px-4 pt-2 pb-1 text-[13px] font-semibold text-black">
    <div />
    <div />
    <div />
    <div className="text-center border-b border-gray-400 pb-1">
      <FormattedMessage id="SIDEBAR_MODAL.QUANTITY" defaultMessage="Quantity" />
    </div>
    <div className="text-center border-b border-gray-400 pb-1">
      <FormattedMessage id="SIDEBAR_MODAL.PRICE" defaultMessage="Price" />
    </div>
    <div />
    <div />
    <div />
  </div>
  {/* Row 2: sub-headers */}
  <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_88px] items-center px-4 pb-2 text-[13px] font-medium text-black">
    <div>
      <FormattedMessage id="SIDEBAR_MODAL.NO" defaultMessage="No." />
    </div>
    <div className="ml-2 flex items-center gap-2">
      <FormattedMessage id="SIDEBAR_MODAL.CONTACT_NAME" defaultMessage="Contact Name" />
      <button onClick={() => setIsMemberModalOpen(true)}>
        <Plus className="w-6 h-6 text-white bg-blue-700 rounded-full p-1" />
      </button>
    </div>
    <div>
      <FormattedMessage id="SIDEBAR_MODAL.TYPE" defaultMessage="Type" />
    </div>
    <div className="grid grid-cols-2 gap-1 text-center text-[12px]">
      <div><FormattedMessage id="SIDEBAR_MODAL.LABOUR_QTY" defaultMessage="Labour/Qty" /></div>
      <div><FormattedMessage id="SIDEBAR_MODAL.HELPER_UNIT" defaultMessage="Helper/Unit" /></div>
    </div>
    <div className="grid grid-cols-2 gap-1 text-center text-[12px]">
      <div><FormattedMessage id="SIDEBAR_MODAL.LABOUR_PRICE" defaultMessage="Labour/Price" /></div>
      <div><FormattedMessage id="SIDEBAR_MODAL.HELPER" defaultMessage="Helper" /></div>
    </div>
    <div className="text-[12px]">
      <FormattedMessage id="SIDEBAR_MODAL.SHIFT_TRANS_PRICE" defaultMessage="Transport Price" />
    </div>
    <div>
      <FormattedMessage id="SIDEBAR_MODAL.TOTAL_PRICE" defaultMessage="Total Price" />
    </div>
    <div className="text-center">
      <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />
    </div>
  </div>
</div>

                  {loading ? (
                    <div className="flex justify-center items-center h-32 text-gray-500 text-sm">
                      <FormattedMessage
                        id="SIDEBAR_MODAL.LOADING"
                        defaultMessage="Loading..."
                      />
                    </div>
                  ) : (
                    (() => {
                      const currentItem = menuAllocations.find(
                        (m) =>
                          m.menuItemId === row?.menuItemId &&
                          m.menuCategoryId === row?.menuCategoryId &&
                          m.chefLabour === true,
                      );

                      if (
                        !currentItem ||
                        !currentItem.eventFunctionMenuAllocations ||
                        currentItem.eventFunctionMenuAllocations.length === 0
                      ) {
                        return (
                          <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_88px] items-start gap-3 px-4 py-3 border-t border-gray-100">
                            <div className="text-[13px] text-gray-700">1.</div>

                            <div>
                              <BaseSelect
                                value={defaultRow.partyId}
                                onChange={(e) =>
                                  handleDefaultRowChange(
                                    "partyId",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.SELECT_NAME"
                                    defaultMessage="Select Name"
                                  />
                                </option>
                                {contactNames.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.nameEnglish}
                                  </option>
                                ))}
                              </BaseSelect>
                            </div>

                            <div>
                              <BaseSelect
                                value={defaultRow.serviceType}
                                onChange={(e) =>
                                  handleDefaultRowChange(
                                    "serviceType",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.SELECT_OPTIONS"
                                    defaultMessage="Select Options"
                                  />
                                </option>
                                <option value="Counter Wise">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.COUNTER_WISE"
                                    defaultMessage="Counter Wise"
                                  />
                                </option>

                                <option value="Plate Wise">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.PLATE_WISE"
                                    defaultMessage="Plate Wise"
                                  />
                                </option>
                              </BaseSelect>
                            </div>

                            {defaultRow.serviceType === "Plate Wise" ? (
                              <>
                                <div className="flex flex-col gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.QUANTITY",
                                      defaultMessage: "Quantity",
                                    })}
                                    value={defaultRow.counterQuantity}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "counterQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseSelect
                                    value={defaultRow.unitId || ""}
                                    onChange={(e) => {
                                      const selectedUnitId = e.target.value;
                                      const selectedUnit = units.find(
                                        (u) =>
                                          String(u.unitId) ===
                                          String(selectedUnitId),
                                      );
                                      handleDefaultRowChange(
                                        "unitId",
                                        selectedUnitId,
                                      );
                                      if (selectedUnit) {
                                        handleDefaultRowChange(
                                          "unit",
                                          selectedUnit.nameEnglish,
                                        );
                                      }
                                    }}
                                  >
                                    <option value="">
                                      <FormattedMessage
                                        id="SIDEBAR_MODAL.SELECT_UNIT"
                                        defaultMessage="Select Unit"
                                      />
                                    </option>
                                    {units.map((unit) => (
                                      <option
                                        key={unit.unitId}
                                        value={unit.unitId}
                                      >
                                        {unit.nameEnglish}
                                      </option>
                                    ))}
                                  </BaseSelect>
                                </div>
                                <div>
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.PRICE",
                                      defaultMessage: "Price",
                                    })}
                                    value={defaultRow.counterPrice}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "counterPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.COUNTER",
                                      defaultMessage: "Labour",
                                    })}
                                    value={defaultRow.counterQuantity}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "counterQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.HELPER",
                                      defaultMessage: "Helper",
                                    })}
                                    value={defaultRow.helperQuantity}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "helperQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.COUNTER_PRICE",
                                      defaultMessage: "Counter Price",
                                    })}
                                    value={defaultRow.counterPrice}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "counterPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.HELPER_PRICE",
                                      defaultMessage: "Helper Price",
                                    })}
                                    value={defaultRow.helperPrice}
                                    onChange={(e) =>
                                      handleDefaultRowChange(
                                        "helperPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </>
                            )}


                            <div>
  <BaseInput
    type="tel"
    placeholder="Shift Trans"
    value={defaultRow.shiftTransPrice ?? ""}
    onChange={(e) => handleDefaultRowChange("shiftTransPrice", e.target.value)}
    
    style={{
      backgroundColor: "#f9fafb",
      fontWeight: "600",
      color: (defaultRow.shiftTransPrice ?? 0) > 0 ? "#1d4ed8" : "#6b7280",
    }}
  />
</div>
                            <div>
                              <BaseInput
                                type="tel"
                                placeholder={intl.formatMessage({
                                  id: "SIDEBAR_MODAL.TOTAL",
                                  defaultMessage: "Total",
                                })}
                                value={defaultRow.totalPrice || ""}
                                readOnly
                                style={{
                                  backgroundColor: "#f9fafb",
                                  fontWeight: "600",
                                  color:
                                    defaultRow.totalPrice > 0
                                      ? "#047857"
                                      : "#6b7280",
                                }}
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#20c964] text-white shadow hover:brightness-95"
                                title="Share on WhatsApp"
                              >
                                <WhatsAppIcon />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return currentItem.eventFunctionMenuAllocations.map(
                        (alloc, idx) => (
                          <div
                            key={`${currentItem.id}-${idx}`}
                            className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_88px] items-start gap-3 px-4 py-3 border-t border-gray-100"
                          >
                            <div className="text-[13px] text-gray-700">
                              {idx + 1}.
                            </div>
                            <div>
                              <BaseSelect
                                value={alloc.partyId || ""}
                                onChange={(e) =>
                                  handleExistingRowChange(
                                    idx,
                                    "partyId",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.SELECT_NAME"
                                    defaultMessage="Select Name"
                                  />
                                </option>
                                {contactNames.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.nameEnglish}
                                  </option>
                                ))}
                              </BaseSelect>
                            </div>
                            <div>
                              <BaseSelect
                                value={alloc.serviceType || ""}
                                onChange={(e) =>
                                  handleExistingRowChange(
                                    idx,
                                    "serviceType",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.SELECT_OPTIONS"
                                    defaultMessage="Select Options"
                                  />
                                </option>
                                <option value="Counter Wise">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.COUNTER_WISE"
                                    defaultMessage="Counter Wise"
                                  />
                                </option>

                                <option value="Plate Wise">
                                  <FormattedMessage
                                    id="SIDEBAR_MODAL.PLATE_WISE"
                                    defaultMessage="Plate Wise"
                                  />
                                </option>
                              </BaseSelect>
                            </div>

                            {alloc.serviceType === "Plate Wise" ? (
                              <>
                                <div className="flex flex-col gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.QUANTITY",
                                      defaultMessage: "Quantity",
                                    })}
                                    value={alloc.counterQuantity || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "counterQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseSelect
                                    value={alloc.unitId || ""}
                                    onChange={(e) => {
                                      const selectedUnitId = e.target.value;
                                      const selectedUnit = units.find(
                                        (u) =>
                                          String(u.unitId) ===
                                          String(selectedUnitId),
                                      );

                                      handleExistingRowChange(
                                        idx,
                                        "unitId",
                                        selectedUnitId,
                                      );
                                      handleExistingRowChange(
                                        idx,
                                        "unit",
                                        selectedUnit?.nameEnglish || "",
                                      );
                                    }}
                                  >
                                    <option value="">
                                      <FormattedMessage
                                        id="SIDEBAR_MODAL.SELECT_UNIT"
                                        defaultMessage="Select Unit"
                                      />
                                    </option>
                                    {units.map((unit) => (
                                      <option
                                        key={unit.unitId}
                                        value={unit.unitId}
                                      >
                                        {unit.nameEnglish}
                                      </option>
                                    ))}
                                  </BaseSelect>
                                </div>
                                <div>
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.PRICE",
                                      defaultMessage: "Price",
                                    })}
                                    value={alloc.counterPrice || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "counterPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.COUNTER",
                                      defaultMessage: "Labour",
                                    })}
                                    value={alloc.counterQuantity || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "counterQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.HELPER",
                                      defaultMessage: "Helper",
                                    })}
                                    value={alloc.helperQuantity || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "helperQuantity",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.COUNTER",
                                      defaultMessage: "Labour",
                                    })}
                                    value={alloc.counterPrice || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "counterPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <BaseInput
                                    type="tel"
                                    placeholder={intl.formatMessage({
                                      id: "SIDEBAR_MODAL.HELPER",
                                      defaultMessage: "Helper",
                                    })}
                                    value={alloc.helperPrice || ""}
                                    onChange={(e) =>
                                      handleExistingRowChange(
                                        idx,
                                        "helperPrice",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </>
                            )}
                              {/* Shift Trans Price */}
<div>
  <BaseInput
  type="tel"
  placeholder="Shift Trans"
  value={alloc.shiftTransPrice ?? ""}
  onChange={(e) =>
    handleExistingRowChange(idx, "shiftTransPrice", e.target.value)
  }
  style={{
    backgroundColor: "#f9fafb",
    fontWeight: "600",
    color: (alloc.shiftTransPrice ?? 0) > 0 ? "#1d4ed8" : "#6b7280",
  }}
/>
</div>
                            <div>
                              <BaseInput
                                type="tel"
                                placeholder={intl.formatMessage({
                                  id: "SIDEBAR_MODAL.TOTAL",
                                  defaultMessage: "Total",
                                })}
                                value={alloc.totalPrice || ""}
                                readOnly
                                style={{
                                  backgroundColor: "#f9fafb",
                                  fontWeight: "600",
                                  color:
                                    alloc.totalPrice > 0
                                      ? "#047857"
                                      : "#6b7280",
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                className="btn btn-sm btn-icon btn-clear"
                                title="Remove Row"
                                onClick={() => handleRemoveExistingRow(idx)}
                              >
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
                        ),
                      );
                    })()
                  )}

                  {extraRows.map((extraRow, idx) => (
                    <div
                      key={extraRow.id}
                      className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_88px] items-start gap-3 px-4 py-3 border-t border-gray-100"
                    >
                      <div className="text-[13px] text-gray-700">
                        {(menuAllocations.find(
                          (m) =>
                            m.menuItemId === row?.menuItemId &&
                            m.menuCategoryId === row?.menuCategoryId,
                        )?.eventFunctionMenuAllocations?.length || 0) +
                          idx +
                          1}
                        .
                      </div>

                      <div>
                        <BaseSelect
                          value={extraRow.partyId}
                          onChange={(e) =>
                            handleExtraRowChange(idx, "partyId", e.target.value)
                          }
                        >
                          <option value="">
                            <FormattedMessage
                              id="SIDEBAR_MODAL.SELECT_NAME"
                              defaultMessage="Select Name"
                            />
                          </option>
                          {contactNames.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nameEnglish}
                            </option>
                          ))}
                        </BaseSelect>
                      </div>

                      <div>
                        <BaseSelect
                          value={extraRow.serviceType}
                          onChange={(e) =>
                            handleExtraRowChange(
                              idx,
                              "serviceType",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">
                            <FormattedMessage
                              id="SIDEBAR_MODAL.SELECT_OPTIONS"
                              defaultMessage="Select Options"
                            />
                          </option>
                          <option value="Counter Wise">
                            <FormattedMessage
                              id="SIDEBAR_MODAL.COUNTER_WISE"
                              defaultMessage="Counter Wise"
                            />
                          </option>

                          <option value="Plate Wise">
                            <FormattedMessage
                              id="SIDEBAR_MODAL.PLATE_WISE"
                              defaultMessage="Plate Wise"
                            />
                          </option>
                        </BaseSelect>
                      </div>

                      {extraRow.serviceType === "Plate Wise" ? (
                        <>
                          <div className="flex flex-col gap-2">
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.QUANTITY",
                                defaultMessage: "Quantity",
                              })}
                              value={extraRow.counterQuantity}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "counterQuantity",
                                  e.target.value,
                                )
                              }
                            />
                            <BaseSelect
                              value={extraRow.unitId || ""}
                              onChange={(e) => {
                                const selectedUnitId = e.target.value;
                                const selectedUnit = units.find(
                                  (u) =>
                                    String(u.unitId) === String(selectedUnitId),
                                );
                                handleExtraRowChange(
                                  idx,
                                  "unitId",
                                  selectedUnitId,
                                );
                                if (selectedUnit) {
                                  handleExtraRowChange(
                                    idx,
                                    "unit",
                                    selectedUnit.nameEnglish,
                                  );
                                }
                              }}
                            >
                              <option value="">
                                <FormattedMessage
                                  id="SIDEBAR_MODAL.SELECT_UNIT"
                                  defaultMessage="Select Unit"
                                />
                              </option>
                              {units.map((unit) => (
                                <option key={unit.unitId} value={unit.unitId}>
                                  {unit.nameEnglish}
                                </option>
                              ))}
                            </BaseSelect>
                          </div>
                          <div>
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.PRICE",
                                defaultMessage: "Price",
                              })}
                              value={extraRow.counterPrice}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "counterPrice",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.COUNTER",
                                defaultMessage: "Counter",
                              })}
                              value={extraRow.counterQuantity}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "counterQuantity",
                                  e.target.value,
                                )
                              }
                            />
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.HELPER",
                                defaultMessage: "Helper",
                              })}
                              value={extraRow.helperQuantity}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "helperQuantity",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="flex gap-2">
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.COUNTER_PRICE",
                                defaultMessage: "Counter Price",
                              })}
                              value={extraRow.counterPrice}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "counterPrice",
                                  e.target.value,
                                )
                              }
                            />
                            <BaseInput
                              type="tel"
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.HELPER_PRICE",
                                defaultMessage: "Helper Price",
                              })}
                              value={extraRow.helperPrice}
                              onChange={(e) =>
                                handleExtraRowChange(
                                  idx,
                                  "helperPrice",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>
                      )}  

                      <div>
  <BaseInput
    type="tel"
    placeholder="Shift Trans"
    value={extraRow.shiftTransPrice ?? ""}
    onChange={(e) => handleExtraRowChange(idx, "shiftTransPrice", e.target.value)}
    style={{
      backgroundColor: "#f9fafb",
      fontWeight: "600",
      color: (extraRow.shiftTransPrice ?? 0) > 0 ? "#1d4ed8" : "#6b7280",
    }}
  />
</div>

                      <div>
                        <BaseInput
                          type="tel"
                          placeholder={intl.formatMessage({
                            id: "SIDEBAR_MODAL.TOTAL",
                            defaultMessage: "Total",
                          })}
                          value={extraRow.totalPrice || ""}
                          readOnly
                          style={{
                            backgroundColor: "#f9fafb",
                            fontWeight: "600",
                            color:
                              extraRow.totalPrice > 0 ? "#047857" : "#6b7280",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-icon btn-clear"
                          title="Remove Row"
                          onClick={() => handleRemoveRow(idx)}
                        >
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

                <div className="flex items-center justify-between gap-2 mt-3">
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
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <AddVendor
        isModalOpen={isModalOpen}
        isModalClose={() => setIsModalOpen(false)}
      />
      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        concatId={concatId}
        contactTypeId={contactTypeId}
      />
    </AnimatePresence>
  );
}
