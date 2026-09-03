import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { GetDishCostingByEventFunction } from "@/services/apiServices";

const TotalAgencySidebar = ({
  isOpen,
  onClose,
  eventId,
  selectedFunctionId,
}) => {
  const [loading, setLoading] = useState(false);

  const [pax, setPax] = useState(0);
  const [startDate, setStartDate] = useState("-");
  const [endDate, setEndDate] = useState("-");

  const [chefLabor, setChefLabor] = useState(0);
  const [labor, setLabor] = useState(0);
  const [outsideAgency, setOutsideAgency] = useState(0);
  const [totalAgency, setTotalAgency] = useState(0);

  /* Close on ESC */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  /* Fetch API data */
  useEffect(() => {
    if (isOpen && eventId && selectedFunctionId) {
      fetchAgencyCharges();
    }
  }, [isOpen, eventId, selectedFunctionId]);

  const fetchAgencyCharges = async () => {
    setLoading(true);
    try {
      const res = await GetDishCostingByEventFunction(
        eventId,
        selectedFunctionId
      );

      const data = res?.data?.data;

      const chef = Number(data?.cheflaborcharge || 0);
      const lab = Number(data?.laborcharge || 0);
      const outside = Number(data?.outsideagencycharge || 0);

      setChefLabor(chef);
      setLabor(lab);
      setOutsideAgency(outside);

      setTotalAgency(chef + lab + outside);

      setPax(Number(data?.pax || data?.eventFunction?.pax || 0));
      setStartDate(data?.eventFunction?.functionStartDateTime || "-");
      setEndDate(data?.eventFunction?.functionEndDateTime || "-");
    } catch (error) {
      console.error("Agency API error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.div
            className="absolute top-6 bottom-6 right-6 w-[800px] max-w-[95vw] bg-white rounded-2xl shadow-2xl flex flex-col"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                <FormattedMessage
                  id="COMMON.TOTAL_AGENCY_CHARGES"
                  defaultMessage="Total Agency Charges"
                />
              </h2>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Event Info */}
              <div className="grid grid-cols-3 gap-6 pb-6 border-b">
                <div>
                  <span className="text-xs text-gray-500">Event Start</span>
                  <div className="text-sm font-medium">{startDate}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Event End</span>
                  <div className="text-sm font-medium">{endDate}</div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ki-filled ki-users text-primary" />
                  <span className="text-sm">Pax</span>
                  <span className="px-3 py-1 bg-gray-200 rounded-md font-semibold">
                    {pax}
                  </span>
                </div>
              </div>

              {/* Charges Table */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4 pb-3 mb-4 border-b">
                  <span className="text-sm font-semibold text-gray-600">
                    Charge Type
                  </span>
                  <span className="text-sm font-semibold text-gray-600 text-right">
                    Amount
                  </span>
                </div>

                {[
                  { label: "Chef Labor Charge", value: chefLabor },
                  { label: "Labor Charge", value: labor },
                  { label: "Outside Agency Charge", value: outsideAgency },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 py-3 border-b"
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="text-sm text-right font-medium">
                      ₹ {item.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t-2">
                  <span className="text-base font-bold text-primary">
                    Total Agency
                  </span>
                  <span className="text-base font-bold text-primary text-right">
                    ₹ {totalAgency.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TotalAgencySidebar;
