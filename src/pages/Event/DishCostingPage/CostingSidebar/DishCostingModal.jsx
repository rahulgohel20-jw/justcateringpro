import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { FormattedMessage } from "react-intl";
import { GetDishCostingbyRawmaterial } from "@/services/apiServices";

const DishCostingModal = ({
  isOpen,
  onClose,
  viewType: parentViewType,
  eventId,
  selectedFunctionId,
}) => {
  const [viewType, setViewType] = useState(parentViewType || "Function Wise");
  const [categoryData, setCategoryData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !eventId) return;

    const fetchRawMaterialCosting = async () => {
      try {
        setLoading(true);

        const res = await GetDishCostingbyRawmaterial(
          eventId,
          viewType === "Function Wise" ? selectedFunctionId : 0
        );

        if (res?.data?.success) {
          const data = res.data.data?.RawMaterialData || [];

          setCategoryData(data);

          const total = data.reduce(
            (sum, item) => sum + Number(item.totalRate || 0),
            0
          );

          setTotalAmount(total.toFixed(2));
        } else {
          setCategoryData([]);
          setTotalAmount(0);
        }
      } catch (err) {
        console.error("Raw material costing error:", err);
        setCategoryData([]);
        setTotalAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterialCosting();
  }, [isOpen, eventId, selectedFunctionId, viewType]);

  return (
    <AnimatePresence>
      {isOpen && (
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
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[800px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="text-[18px] font-semibold text-gray-800">
                  <FormattedMessage
                    id="COMMON.TOTAL_RAW_MATERIAL_CHARGES"
                    defaultMessage="Total Raw Material Charges"
                  />
                </div>
                <button
                  className="h-9 px-3 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {/* Breadcrumb */}

                {/* Customer + View Type */}
                {/* <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <FormattedMessage
                        id="COMMON.VIEW_TYPE"
                        defaultMessage="View Type"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewType("Function Wise")}
                        className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
                          viewType === "Function Wise"
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <FormattedMessage
                          id="COMMON.FUNCTION_WISE"
                          defaultMessage="Function Wise"
                        />
                      </button>
                      <button
                        onClick={() => setViewType("Total Wise")}
                        className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
                          viewType === "Total Wise"
                            ? "bg-primary text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <FormattedMessage
                          id="COMMON.TOTAL_WISE"
                          defaultMessage="Total Wise"
                        />
                      </button>
                    </div>
                  </div>
                </div> */}

                {/* Date & Person Info */}
                <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-xs">
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                        defaultMessage="Event Start & Time:"
                      />
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      29.09.2025 11:00 PM
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                        defaultMessage="Event End & Time:"
                      />
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      29.09.2025 11:00 PM
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      <i className="ki-filled ki-users text-primary"></i>
                    </span>
                    <span className="text-2sm font-medium text-gray-700">
                      <FormattedMessage
                        id="COMMON.PERSON"
                        defaultMessage="Person"
                      />
                    </span>
                    <span className="text-sm font-semibold bg-gray-300 rounded-md px-3 py-1">
                      {" "}
                      100
                    </span>
                  </div>
                </div>

                {/* Category Table */}
                <motion.div
                  key={viewType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-lg p-6"
                >
                  {/* Header */}
                  <div className="grid grid-cols-2 gap-4 pb-3 mb-4 border-b-2 border-gray-300">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      <FormattedMessage
                        id="COMMON.CATEGORY"
                        defaultMessage="Category"
                      />
                    </div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-right">
                      <FormattedMessage
                        id="COMMON.AMOUNT"
                        defaultMessage="Amount"
                      />
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-3">
                    {categoryData.map((item, index) => (
                      <motion.div
                        key={item.categoryId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200"
                      >
                        <div className="text-sm text-gray-800">
                          {item.categoryNameEng}
                        </div>

                        <div className="text-sm text-gray-800 text-right font-medium tabular-nums">
                          ₹ {Number(item.totalRate).toFixed(2)}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Final Total */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t-2 border-gray-300"
                  >
                    <div className="text-base font-bold text-primary">
                      <FormattedMessage
                        id="COMMON.FINAL_AMOUNT"
                        defaultMessage="Final Amount"
                      />
                    </div>
                    <div className="text-base font-bold text-primary text-right tabular-nums">
                      ₹ {totalAmount}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DishCostingModal;
