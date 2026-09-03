import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Save } from "lucide-react";

const CreatePayment = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    eventName: "",
    paymentDate: "",
    paymentMode: "",
    depositTo: "",
    referenceId: "",
    payAmount: "00.0",
    totalAmount: "0.00",
    settlementAmount: "0.00",
    remarks: "",
  });

  const [invoices] = useState([
    {
      id: "INV-2023-1102",
      date: "Oct 12, 2023",
      settlementAmount: "₹ 25,000.00",
      invoiceAmount: "₹ 30,000.00",
      due: "₹ 0",
      payment: "₹ 25,000.00",
    },
    {
      id: "INV-2023-1105",
      date: "Oct 15, 2023",
      settlementAmount: "₹ 0",
      invoiceAmount: "₹ 25,000.00",
      due: "₹ 25,000.00",
      payment: "₹ 15,000.00",
    },
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="absolute inset-0 pointer-events-none flex items-start justify-end p-3 sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[900px] h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Payment
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className=" space-y-6">
                  {/* Account Info Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Account Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Account Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter account name"
                            value={formData.accountName}
                            onChange={(e) =>
                              handleInputChange("accountName", e.target.value)
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Event Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter event name"
                            value={formData.eventName}
                            onChange={(e) =>
                              handleInputChange("eventName", e.target.value)
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          />
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Payment Details
                    </h3>
                    <div className="space-y-4">
                      {/* Row 1: Payment Date, Payment Mode, Deposit To */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Date
                          </label>
                          <input
                            type="text"
                            value={formData.paymentDate}
                            onChange={(e) =>
                              handleInputChange("paymentDate", e.target.value)
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Mode
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.paymentMode}
                              onChange={(e) =>
                                handleInputChange("paymentMode", e.target.value)
                              }
                              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deposit To
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.depositTo}
                              onChange={(e) =>
                                handleInputChange("depositTo", e.target.value)
                              }
                              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Reference # and Pay Amount */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reference #
                          </label>
                          <input
                            type="text"
                            placeholder="Enter transaction reference ID"
                            value={formData.referenceId}
                            onChange={(e) =>
                              handleInputChange("referenceId", e.target.value)
                            }
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pay Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={formData.payAmount}
                              onChange={(e) =>
                                handleInputChange("payAmount", e.target.value)
                              }
                              className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settlement Option Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Settlement
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={formData.totalAmount}
                              onChange={(e) =>
                                handleInputChange("totalAmount", e.target.value)
                              }
                              className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Settlement Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              ₹
                            </span>
                            <input
                              type="text"
                              value={formData.settlementAmount}
                              onChange={(e) =>
                                handleInputChange(
                                  "settlementAmount",
                                  e.target.value,
                                )
                              }
                              className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>
                        <input
                          type="text"
                          placeholder="Enter remarks"
                          value={formData.remarks}
                          onChange={(e) =>
                            handleInputChange("remarks", e.target.value)
                          }
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Apply Payment to Invoices Section */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Invoices
                    </h3>

                    {/* Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Table Header */}
                      <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-6 gap-4 px-4 py-3">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Invoice
                          </div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Payment Date
                          </div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Amount
                          </div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Settlement Amount
                          </div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Due
                          </div>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Paid
                          </div>
                        </div>
                      </div>

                      {/* Table Body */}
                      <div>
                        {invoices.map((invoice, index) => (
                          <div
                            key={invoice.id}
                            className={`grid grid-cols-6 gap-4 px-4 py-3 ${
                              index !== invoices.length - 1
                                ? "border-b border-gray-200"
                                : ""
                            }`}
                          >
                            <div className="text-sm font-medium text-blue-600">
                              {invoice.id}
                            </div>
                            <div className="text-sm text-gray-900">
                              {invoice.date}
                            </div>
                            <div className="text-sm text-gray-900">
                              {invoice.invoiceAmount}
                            </div>
                            <div className="text-sm text-gray-900">
                              {invoice.settlementAmount}
                            </div>
                            <div className="text-sm text-red-600 font-medium">
                              {invoice.due}
                            </div>
                            <div className="text-sm text-gray-900">
                              {invoice.payment}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount to Credit */}
                    <div className="mt-4 flex justify-end">
                      <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Amount to Credit:
                          </span>
                          <span className="text-lg font-semibold text-blue-600">
                            ₹ 40,000.00
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePayment;
