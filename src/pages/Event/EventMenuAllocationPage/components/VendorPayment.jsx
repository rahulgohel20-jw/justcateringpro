import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronDown, Save, Wallet } from "lucide-react";
import {
  GetbankdetailsbyuserId,
  AddVendorPayment,
  Getpaymentvendordata,
} from "@/services/apiServices";
import Swal from "sweetalert2";

const VendorPayment = ({
  isOpen,
  onClose,
  vendor,
  event,
  eventId,
  onSaveSuccess,
}) => {
  const dateInputRef = useRef(null);
  const [isBank, setIsBank] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVendor, setIsVendor] = useState([]);
  const [errors, setErrors] = useState({});

  const formatDateForAPI = (val) => {
    if (!val) return "";
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
  };

  const fetchvendorpayment = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const isPayable = true;
      const res = await Getpaymentvendordata(
        eventId,
        isPayable,
        userId,
        vendor.vendorId,
      );


      const vendordata = res.data.data.payments || "";
      const formateddata = vendordata.map((item) => ({
        id: item.id,
        invoiceCode: item.invoiceCode,
        date: item.date,
        payAmount: item.payAmount,
        settlementAmount: item.settlementAmount,
        payMode: item.payMode,
      }));
      setIsVendor(formateddata);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchbank = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await GetbankdetailsbyuserId(userId);
      const bankdata = res.data.data || "";
      const formateddata = bankdata.map((item) => ({
        id: item.id,
        bankName: item.bankName,
        accountNo: item.accountNo,
      }));
      setIsBank(formateddata);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchbank();
    fetchvendorpayment();

    if (isOpen) {
      setFormData({
        paymentDate: "",
        paymentMode: "Bank Transfer",
        depositTo: "",
        referenceId: "",
        payAmount: vendor?.pending ?? "",
        remarks: "",
        settlementamt: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    paymentDate: "",
    paymentMode: "Bank Transfer",
    depositTo: "",
    referenceId: "",
    payAmount: vendor?.pending ?? "",
    remarks: "",
    settlementamt: "",
  });

  const showDepositTo =
    formData.paymentMode === "Bank Transfer" ||
    formData.paymentMode === "Cheque";

  // Disable save if pending amount is 0 or less
  const isPendingZeroOrNegative =
    !vendor?.pending || Number(vendor.pending) <= 0;

  const validate = () => {
    const newErrors = {};

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required.";
    }
    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required.";
    }
    if (showDepositTo && !formData.depositTo) {
      newErrors.depositTo = "Please select a bank.";
    }
    if (!formData.payAmount || Number(formData.payAmount) <= 0) {
      newErrors.payAmount = "Pay amount is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isPendingZeroOrNegative) return;
    if (!validate()) return;

    try {
      setIsSaving(true);
      const userId = localStorage.getItem("userId");

      const payload = {
        bankId: formData.depositTo ? Number(formData.depositTo) : null,
        eventId: Number(eventId) ?? 0,
        id: -1,
        isPayable: true,
        payAmount: Number(formData.payAmount) || 0,
        paymentDate: formatDateForAPI(formData.paymentDate),
        paymentMode: formData.paymentMode,
        receivedAmount: 0,
        referenceId: formData.referenceId,
        remarks: formData.remarks,
        settlementAmount: Number(formData.settlementamt) || 0,
        userId: Number(userId),
        vendorCat: vendor?.category ?? "",
        vendorId: vendor?.vendorId ?? 0,
      };

      const res = await AddVendorPayment(payload);
   

      if (res.data.success === true) {
        Swal.fire({
          icon: "success",
          title: "Payment Saved!",
          text: "Vendor payment has been recorded successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        onClose();
        onSaveSuccess?.();
      } else {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text: res.data.msg || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error("Failed to save payment:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          err?.res?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDisplayDate = (val) => {
    if (!val) return "";
    const [y, m, d] = val.split("-");
    return `${d}/${m}/${y}`;
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
              className="pointer-events-auto w-full max-w-[800px] h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 justify-between">
                <div className="flex items-center gap-3  ">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Pay Vendor Payment
                  </h2>{" "}
                </div>

                <div className="cursor-pointer" onClick={onClose}>
                  <i class="ki-filled ki-cross text-xl"></i>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Vendor Category
                    </label>
                    <div className="text-base font-medium text-gray-900">
                      {vendor?.category}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Vendors
                    </label>
                    <div className="text-base font-medium text-gray-900">
                      {vendor?.vendor}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Event
                    </label>
                    <div className="text-base font-medium text-gray-900">
                      {event}
                    </div>
                  </div>
                </div>

                {/* Pending Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Pending Amount
                    </label>
                    <div className="text-base font-semibold text-gray-900">
                      ₹ {vendor?.pending}
                    </div>
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Payment Information
                    </h3>
                  </div>

                  <div
                    className={`grid grid-cols-1 gap-4 mb-4 ${
                      showDepositTo ? "sm:grid-cols-3" : "sm:grid-cols-2"
                    }`}
                  >
                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="relative cursor-pointer"
                        onClick={() => dateInputRef.current?.showPicker?.()}
                      >
                        <div
                          className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 bg-white select-none ${
                            errors.paymentDate
                              ? "border-red-400 focus:ring-red-400"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.paymentDate
                            ? formatDisplayDate(formData.paymentDate)
                            : "Select date"}
                        </div>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          ref={dateInputRef}
                          type="date"
                          value={formData.paymentDate}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              paymentDate: e.target.value,
                            });
                            if (errors.paymentDate)
                              setErrors((prev) => ({
                                ...prev,
                                paymentDate: undefined,
                              }));
                          }}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          style={{ colorScheme: "light" }}
                        />
                      </div>
                      {errors.paymentDate && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.paymentDate}
                        </p>
                      )}
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.paymentMode}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              paymentMode: e.target.value,
                              depositTo: "",
                            });
                            if (errors.paymentMode)
                              setErrors((prev) => ({
                                ...prev,
                                paymentMode: undefined,
                              }));
                          }}
                          className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                            errors.paymentMode
                              ? "border-red-400"
                              : "border-gray-300"
                          }`}
                        >
                          <option>Bank Transfer</option>
                          <option>Cash</option>
                          <option>UPI</option>
                          <option>Cheque</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.paymentMode && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.paymentMode}
                        </p>
                      )}
                    </div>

                    {/* Deposit To — only for Bank Transfer or Cheque */}
                    {showDepositTo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deposit To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.depositTo}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                depositTo: e.target.value,
                              });
                              if (errors.depositTo)
                                setErrors((prev) => ({
                                  ...prev,
                                  depositTo: undefined,
                                }));
                            }}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                              errors.depositTo
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Bank</option>
                            {isBank.map((bank) => (
                              <option key={bank.id} value={bank.id}>
                                {bank.bankName} ({bank.accountNo.slice(-4)})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.depositTo && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.depositTo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    {/* Reference ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference ID
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Reference ID"
                        value={formData.referenceId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            referenceId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Remarks"
                        value={formData.remarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            remarks: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Pay Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                            ₹
                          </span>
                          <input
                            type="tel"
                            min="0"
                            value={formData.payAmount}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                payAmount: e.target.value,
                              });
                              if (errors.payAmount)
                                setErrors((prev) => ({
                                  ...prev,
                                  payAmount: undefined,
                                }));
                            }}
                            className={`w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.payAmount
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                      {errors.payAmount && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.payAmount}
                        </p>
                      )}
                    </div>

                    {/* Settlement Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Settlement Amount
                      </label>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={formData.settlementamt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              settlementamt: e.target.value,
                            })
                          }
                          className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || isPendingZeroOrNegative}
                        title={
                          isPendingZeroOrNegative
                            ? "No pending amount to pay"
                            : undefined
                        }
                        className={`px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 justify-end transition-opacity ${
                          isSaving || isPendingZeroOrNegative
                            ? "bg-primary/40 text-white cursor-not-allowed opacity-50"
                            : "bg-primary hover:bg-primary text-white cursor-pointer"
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Apply Payment to Invoices Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Apply Payment to invoices
                    </h3>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Invoice
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Invoice Amount
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Settlement Amount
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            Payment Mode
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {isVendor.length > 0 ? (
                          isVendor.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-200 last:border-0"
                            >
                              <td className="px-4 py-3.5 text-sm text-gray-900">
                                {item.invoiceCode}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900">
                                {item.date}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900 text-center">
                                {item.payAmount}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-red-600 text-center font-medium">
                                {item.settlementAmount}
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-900 text-center font-medium">
                                {item.payMode}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-gray-400"
                            >
                              No payment records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default VendorPayment;
