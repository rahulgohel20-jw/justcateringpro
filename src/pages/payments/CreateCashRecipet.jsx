import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Save, Wallet, Plus, Trash2, UserPlus } from "lucide-react";
import {
  Ftechpartydata,
  Ftecheventdata,
  GetbankdetailsbyuserId,
  AddVendorPayment,
  Getpaymentvendordata,
  PayvendorEdit,
  AddLogs,
  CashAccountGetAll,
} from "@/services/apiServices";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { Select } from "antd";
import AddAccountMaster from "../../partials/modals/accountmaster/AddAccountMaster";
import AddVendor from "../../partials/modals/add-vendor/AddVendor";

const emptyEventRow = () => ({
  id: Date.now() + Math.random(),
  eventname: "",
  payAmount: "",
  settlementAmount: "",
});

const CreateCashRecipet = ({ isOpen, onClose, onSaveSuccess, editData }) => {
  const [accountData, setAccountData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [isBank, setIsBank] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isVendor, setIsVendor] = useState([]);
  const [accountTotalAmnt, setAccountTotalAmnt] = useState("");
  const [errors, setErrors] = useState({});
  const [eventRows, setEventRows] = useState([emptyEventRow()]);
  const [totalPayAmount, setTotalPayAmount] = useState("");
  const [isOpb, setIsOpb] = useState(false);
  const [opbAmnt, setOpbAmnt] = useState("");
  const [isPurchase, setIsPurchase] = useState(false);
  const [isCashAccounts, setIsCashAccounts] = useState([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
const [isAccountMasterModalOpen, setIsAccountMasterModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountname: "",
    cashId: "",
    partyId: "",
    paymentDate: "",
    paymentMode: "",
    depositTo: "",
    referenceId: "",
    remarks: "",
    voucherNo: "",
    vendorCat: "",
  });

  const getUserEmail = () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return "";
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user?.email || "";
    } catch {
      return "";
    }
  };

  const fetchpartyname = async () => {
    try {
      const isallstatus = false;
      const isbooking = true;
      const userId = localStorage.getItem("userId");
      const res = await Ftechpartydata(isallstatus, isbooking, userId);
      const unique = Array.from(
        new Map(res.data.data.map((item) => [item.partyId, item])).values(),
      );
      setAccountData(unique);
    } catch (err) {
      console.log(err);
    }
  };

  const fetcheventname = async (partyId) => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await Ftecheventdata(partyId, userId);
      setEventData(res?.data?.data.partyWiseEvents || []);
      setAccountTotalAmnt(res?.data?.data.totalAmnt ?? "");
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

  const fetchvendorpayment = async (partyId) => {
    try {
      const userId = localStorage.getItem("userId");
      const isPayable = false;
      const res = await Getpaymentvendordata(-1, isPayable, userId, partyId);
      const vendordata = res.data.data.payments || [];
      const formateddata = vendordata.map((item) => ({
        id: item.id,
        invoiceCode: item.invoiceCode,
        date: item.date,
        payAmount: item.receivedAmount,
        settlementAmount: item.settlementAmount,
        payMode: item.payMode || "",
        cashName: item.cashName || "",
        bankName: item.bankName || "",
      }));
      setIsVendor(formateddata);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchCashAccounts = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await CashAccountGetAll(userId);
      setIsCashAccounts(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };
  // ─── Event Rows handlers ────────────────────────────────────────────────
  const handleEventRowChange = (rowId, field, value) => {
    setEventRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "eventname") {
          const selectedEvent = eventData.find((e) => e.eventId === value);
          return {
            ...row,
            eventname: value,
            payAmount:
              selectedEvent?.remaingAmnt != null
                ? String(selectedEvent.remaingAmnt)
                : row.payAmount,
          };
        }
        return { ...row, [field]: value };
      }),
    );
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`eventRow_${rowId}_${field}`];
      return updated;
    });
  };

  const addEventRow = () => {
    setEventRows((prev) => [...prev, emptyEventRow()]);
  };

  const removeEventRow = (rowId) => {
    setEventRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  // ─── Account change ─────────────────────────────────────────────────────
  const handleAccountSelect = (value, option) => {
    const selectedAccount = accountData.find((acc) => acc.partyId === value);
    const accountIsPurchase = selectedAccount?.type === "Purchase";

    setFormData((prev) => ({
      ...prev,
      accountname: option.label,
      partyId: String(value),
      vendorCat: selectedAccount?.type ?? "",
      payAmount: "",
      settlementAmount: "",
      cashId: "", // ← add this line
      depositTo: "",
    }));
    setOpbAmnt(selectedAccount?.opb ?? 0);

    setIsPurchase(accountIsPurchase);
    if (accountIsPurchase) setIsOpb(false);

    setErrors((prev) => ({
      ...prev,
      partyId: undefined,
      accountname: undefined,
    }));

    setAccountTotalAmnt("");
    setEventData([]);
    setEventRows([emptyEventRow()]);
    if (value) fetcheventname(value);
    if (value) fetchvendorpayment(value);
  };

  useEffect(() => {
    if (accountTotalAmnt !== "" && !editData) {
      setEventRows((prev) =>
        prev.map((row, idx) => (idx === 0 ? { ...row, payAmount: "" } : row)),
      );
    }
  }, [accountTotalAmnt]);

  useEffect(() => {
    const sum = eventRows.reduce(
      (acc, row) => acc + (parseFloat(row.payAmount) || 0),
      0,
    );
    setTotalPayAmount(sum > 0 ? String(sum) : "");
  }, [eventRows]);

  useEffect(() => {
    if (isOpb) {
      setTotalPayAmount(opbAmnt ? Number(opbAmnt) : 0);
    } else {
      const sum = eventRows.reduce(
        (acc, row) => acc + (parseFloat(row.payAmount) || 0),
        0,
      );
      setTotalPayAmount(sum > 0 ? String(sum) : "");
    }
  }, [isOpb, opbAmnt, eventRows]);

  useEffect(() => {
    if (isOpen) {
      setAccountData([]);
      fetchCashAccounts();
      fetchbank();
      fetchpartyname();

      if (editData) {
        fetcheventname(editData.vendorId);
        fetchvendorpayment(editData.vendorId);

        let parsedDate = null;
        if (editData.voucherdate) {
          const [day, month, year] = editData.voucherdate.split("/");
          parsedDate = new Date(`${year}-${month}-${day}`);
        }

        setFormData({
          accountname: editData.accountname ?? "",
          partyId: String(editData.vendorId ?? ""),
          paymentDate: parsedDate,
          paymentMode: editData.modeofpayment ?? "Bank Transfer",
          depositTo:
            editData.modeofpayment !== "Cash"
              ? String(editData.bankId ?? "")
              : "", // ← update
          cashId:
            editData.modeofpayment === "Cash"
              ? String(editData.cashId ?? "")
              : "", // ← add
          referenceId: editData.referenceId ?? "",
          remarks: editData.remarks ?? "",
          voucherNo: editData.voucherno ?? "",
          vendorCat: editData.vendorCat ?? "",
        });
        // Auto-detect isPurchase from editData vendorCat
        setIsPurchase(editData.vendorCat === "Purchase");

        setEventRows([
          {
            id: Date.now(),
            eventname: editData.eventId ?? "",
            payAmount: editData.total ?? "",
            settlementAmount: editData.settlementAmount ?? "",
          },
        ]);
      } else {
        // fetchvendorpayment();
        setIsVendor([]);
        setFormData({
          accountname: "",
          partyId: "",
          paymentDate: "",
          paymentMode: "",
          depositTo: "",
          referenceId: "",
          remarks: "",
          voucherNo: "",
          vendorCat: "",
        });
        setEventRows([emptyEventRow()]);
        setIsPurchase(false);
        setIsOpb(false);
      }
      setErrors({});
    }
  }, [isOpen]);

  // ─── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.partyId) newErrors.partyId = "Account Name is required.";
    if (!formData.paymentDate) newErrors.paymentDate = "Date is required.";
    if (!formData.paymentMode)
      newErrors.paymentMode = "Payment Mode is required.";
    if (formData.paymentMode === "Cash") {
      if (!formData.cashId) newErrors.cashId = "Cash Account is required.";
    } else if (formData.paymentMode) {
      if (!formData.depositTo) newErrors.depositTo = "Bank Name is required.";
    }
    if (!totalPayAmount || Number(totalPayAmount) <= 0)
      newErrors.totalPayAmount = "Total Pay Amount is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      const userId = localStorage.getItem("userId");

      const formatDate = (date) =>
        date
          ? `${String(date.getDate()).padStart(2, "0")}/${String(
              date.getMonth() + 1,
            ).padStart(2, "0")}/${date.getFullYear()}`
          : "";

      if (editData) {
        const firstRow = eventRows[0];

        const editPayload = {
          bankId:
            formData.paymentMode !== "Cash" && formData.depositTo
              ? Number(formData.depositTo)
              : null,
          cashId:
            formData.paymentMode === "Cash" && formData.cashId
              ? Number(formData.cashId)
              : null,
          eventId: isPurchase ? null : Number(firstRow?.eventname) || null,
          id: editData.paymentId,
          isPurchase: isPurchase,
          isOpb: isPurchase ? false : isOpb,
          isPayable: false,
          payAmount: 0,
          paymentDate: formatDate(formData.paymentDate),
          paymentMode: formData.paymentMode,
          receivedAmount: isPurchase ? 0 : Number(firstRow?.payAmount) || 0,
          referenceId: formData.referenceId,
          remarks: formData.remarks,
          settlementAmount: isPurchase
            ? 0
            : Number(firstRow?.settlementAmount) || 0,
          userId: Number(userId),
          vendorCat: formData.vendorCat,
          vendorId: Number(formData.partyId) || 0,
        };

        const result = await PayvendorEdit(editPayload);

        if (result.data.success === true) {
          Swal.fire({
            icon: "success",
            title: "Payment Updated!",
            text: "Vendor payment has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          AddLogs({
            description:
              `Receipt Updated — ` +
              `Account: ${formData.accountname} | ` +
              `Amount: ${totalPayAmount} | ` +
              `Mode: ${formData.paymentMode} | ` +
              `Date: ${formatDate(formData.paymentDate)}`,
            eventType: "Update",
            id:  0,
            eventId:0,
            user: getUserEmail(),
          }).catch((err) => console.error("Failed to save log:", err));
          onClose();
          onSaveSuccess?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: result.data?.msg || "Something went wrong. Please try again.",
          });
        }
      } else {
        const payload = {
          bankId:
            formData.paymentMode !== "Cash" && formData.depositTo
              ? Number(formData.depositTo)
              : null,
          cashId:
            formData.paymentMode === "Cash" && formData.cashId
              ? Number(formData.cashId)
              : null,
          isPurchase: isPurchase,
          isOpb: isPurchase ? false : isOpb,
          isPayable: false,
          paymentDate: formatDate(formData.paymentDate),
          paymentMode: formData.paymentMode,
          referenceId: formData.referenceId,
          remarks: formData.remarks,
          totalPayAmount: 0,
          totalReceivedAmount: Number(totalPayAmount) || 0,
          totalSettlementAmount: isPurchase
            ? 0
            : eventRows.reduce(
                (sum, row) => sum + (Number(row.settlementAmount) || 0),
                0,
              ),
          userId: Number(userId),
          vendorCat: formData.vendorCat,
          vendorEventsPayment: isPurchase
            ? []
            : eventRows
                .filter((row) => Number(row.eventname) > 0)
                .map((row) => ({
                  eventId: Number(row.eventname) || null,
                  payAmount: 0,
                  receivedAmount: Number(row.payAmount) || 0,
                  settlementAmount: Number(row.settlementAmount) || 0,
                })),
          vendorId: Number(formData.partyId) || 0,
        };

        const result = await AddVendorPayment(payload);

        if (result.data.success === true) {
          Swal.fire({
            icon: "success",
            title: "Payment Saved!",
            text: "Vendor payment has been recorded successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          AddLogs({
            description:
              `Receipt Added — ` +
              `Account: ${formData.accountname} | ` +
              `Amount: ${totalPayAmount} | ` +
              `Mode: ${formData.paymentMode} | ` +
              `Date: ${formatDate(formData.paymentDate)}`,
            eventType: "Create",
            id:  0,
            eventId:0,
            user: getUserEmail(),
          }).catch((err) => console.error("Failed to save log:", err));
          onClose();
          onSaveSuccess?.();
        } else {
          Swal.fire({
            icon: "error",
            title: "Payment Failed",
            text: result.data?.msg || "Something went wrong. Please try again.",
          });
        }
      }
    } catch (err) {
      console.error("Failed to save payment:", err);
      Swal.fire({
        icon: "error",
        title: isSaving ? "Update Failed" : "Payment Failed",
        text:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const ErrorMsg = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
    ) : null;

  const RequiredStar = () => <span className="text-red-500 ml-0.5">*</span>;

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

          {/* Modal */}
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
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
      <Wallet className="w-6 h-6 text-white" />
    </div>
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
      {editData ? "Edit Payment" : "Payment"}
    </h2>
  </div>
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => setIsAccountMasterModalOpen(true)}
      className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      Add Account Contact
    </button>
    <input
      type="text"
      placeholder="Voucher No"
      value={formData.voucherNo}
      disabled
      className="w-36 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
                <div className="mb-6">
                  {/* Row 1 — Account Name, Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Account Name <RequiredStar />
  </label>
  <div className="flex items-center gap-2">
    <Select
      showSearch
      placeholder="Select Account"
      value={
        formData.partyId
          ? Number(formData.partyId)
          : undefined
      }
      onChange={handleAccountSelect}
      filterOption={(input, option) =>
        option?.label
          ?.toLowerCase()
          .includes(input.toLowerCase())
      }
      options={[
        ...new Map(
          accountData.map((acc) => [acc.partyId, acc]),
        ).values(),
      ].map((account) => ({
        value: account.partyId,
        label: account.partyName,
      }))}
      style={{ width: "100%" }}
      status={errors.partyId ? "error" : ""}
    />
    <button
      type="button"
      onClick={() => setIsVendorModalOpen(true)}
      className="flex-shrink-0 w-[38px] h-[38px] flex items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
      title="Add Vendor"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
  <ErrorMsg field="partyId" />
</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <RequiredStar />
                      </label>
                      <DatePicker
                        selected={formData.paymentDate}
                        onChange={(date) => {
                          setFormData({ ...formData, paymentDate: date });
                          if (errors.paymentDate)
                            setErrors((prev) => ({
                              ...prev,
                              paymentDate: undefined,
                            }));
                        }}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.paymentDate
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                        wrapperClassName="w-full"
                      />
                      <ErrorMsg field="paymentDate" />
                    </div>
                  </div>

                  {/* Row 2 — Payment Mode, Bank Name, Reference ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode <RequiredStar />
                      </label>
                      <div className="relative">
                        <select
                          value={formData.paymentMode}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              paymentMode: e.target.value,
                              depositTo: "",
                              cashId: "",
                            });
                            if (errors.paymentMode)
                              setErrors((prev) => ({
                                ...prev,
                                paymentMode: undefined,
                                depositTo: undefined,
                                cashId: undefined,
                              }));
                          }}
                          className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                            errors.paymentMode
                              ? "border-red-400"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Mode</option>
                          <option>Bank Transfer</option>
                          <option>Cash</option>
                          <option>UPI</option>
                          <option>Cheque</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <ErrorMsg field="paymentMode" />
                    </div>
                    {formData.paymentMode !== "Cash" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name <RequiredStar />
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
                        <ErrorMsg field="depositTo" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cash Account <RequiredStar />
                        </label>
                        <div className="relative">
                          <select
                            value={formData.cashId}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                cashId: e.target.value,
                              });
                              if (errors.cashId)
                                setErrors((prev) => ({
                                  ...prev,
                                  cashId: undefined,
                                }));
                            }}
                            className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                              errors.cashId
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Cash Account</option>
                            {isCashAccounts.map((cash) => (
                              <option key={cash.id} value={cash.id}>
                                {cash.accountName ??
                                  cash.name ??
                                  `Cash #${cash.id}`}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <ErrorMsg field="cashId" />
                      </div>
                    )}

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
                  </div>

                  {/* Row 3 — Remarks, Total Pay Amount, Settlement Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={formData.remarks}
                        onChange={(e) =>
                          setFormData({ ...formData, remarks: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Pay Amount <RequiredStar />
                      </label>
                      <input
                        type="text"
                        value={totalPayAmount}
                        onChange={(e) => {
                          setTotalPayAmount(e.target.value);
                          if (errors.totalPayAmount)
                            setErrors((prev) => ({
                              ...prev,
                              totalPayAmount: undefined,
                            }));
                        }}
                        placeholder="Sum of event pay amounts"
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.totalPayAmount
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMsg field="totalPayAmount" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Settlement Amount
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Settlement Amount"
                        value={formData.settlementAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            settlementAmount: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Is OPB — hidden when account type is Purchase */}
                  {!isPurchase && (
                    <div className="flex items-center gap-3 mb-4 justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Is OPB
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsOpb((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                          isOpb ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            isOpb ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Event Rows — hidden when account type is Purchase or isOpb */}
                  {!isOpb && !isPurchase && (
                    <div className="mb-4">
                      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 mb-2 px-1">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Event Name
                        </span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Pay Amount
                        </span>
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Settlement Amount
                        </span>
                        <span />
                      </div>

                      <div className="space-y-2">
                        {eventRows.map((row) => (
                          <div
                            key={row.id}
                            className="grid grid-cols-[2fr_1fr_1fr] gap-3 items-start"
                          >
                            <div>
                              <Select
                                showSearch
                                placeholder={
                                  formData.partyId
                                    ? "Select Event"
                                    : "Select Account First"
                                }
                                value={row.eventname || undefined}
                                disabled={!formData.partyId}
                                onChange={(value) =>
                                  handleEventRowChange(
                                    row.id,
                                    "eventname",
                                    value,
                                  )
                                }
                                filterOption={(input, option) =>
                                  option?.label
                                    ?.toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={(eventData || []).map((event) => ({
                                  value: event.eventId,
                                  label: `${event.eventName} (${event.eventDate})`,
                                }))}
                                style={{ width: "100%" }}
                                status={
                                  errors[`eventRow_${row.id}_eventname`]
                                    ? "error"
                                    : ""
                                }
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="Pay Amount"
                                value={row.payAmount}
                                onChange={(e) =>
                                  handleEventRowChange(
                                    row.id,
                                    "payAmount",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Settlement Amount"
                                value={row.settlementAmount}
                                onChange={(e) =>
                                  handleEventRowChange(
                                    row.id,
                                    "settlementAmount",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {eventRows.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeEventRow(row.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <div className="w-8 h-8" />
                              )}
                            </div>

                            <div className="flex items-center justify-center pt-0.5"></div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addEventRow}
                        disabled={!formData.partyId}
                        className="p-2 rounded-md mt-3 flex items-center gap-1.5 text-sm text-white bg-primary font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Event
                      </button>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-opacity bg-primary text-white disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                {/* Payment Information Table */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Payment Information
                    </h3>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Voucher No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            Total Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                            Settlement Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
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
                                {item.payMode === "Cash" && item.cashName
                                  ? ` (${item.cashName})`
                                  : item.bankName && item.bankName !== "-"
                                    ? ` (${item.bankName})`
                                    : ""}
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


       <AddVendor
        isModalOpen={isVendorModalOpen}
        setIsModalOpen={setIsVendorModalOpen}
        selectedCustomer={null}
        refreshData={() => {
          fetchpartyname();
        }}
      />

      {/* Add Account Contact modal — accessed via header button */}
      <AddAccountMaster
        open={isAccountMasterModalOpen}
        onClose={() => setIsAccountMasterModalOpen(false)}
        editData={null}
        onSave={() => {
          setIsAccountMasterModalOpen(false);
          fetchpartyname();
        }}
      />
    </AnimatePresence>
  );
};

export default CreateCashRecipet;
