import { useState, useEffect } from "react";
import { X, User, ChevronUp, ChevronDown } from "lucide-react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";
import {
  AddRecordPaymentforInvoice,
  GetBankDetails,
  GETgetPaymentHistoryByInvoiceId,
  DeleteRecordpaymentbyid,
  CashAccountGetAll,
} from "@/services/apiServices";
import { paymentColumns } from "../../components/InvoiceTable/paymentColumns"; // adjust path as needed

const PaymentCombinedModal = ({ isOpen, onClose, invoiceData }) => {
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));

  const [payments, setPayments] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isListExpanded, setIsListExpanded] = useState(true);
  const [editPayment, setEditPayment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [remainingDue, setRemainingDue] = useState(0);
  const [baseDue, setBaseDue] = useState(0); // ✅ ADD THIS
  const [cashAccounts, setCashAccounts] = useState([]);
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Bank Transfer",
    bankId: "",
    cashAccountId: "",
    reference: "",
    totalAmount: "",
  });

  useEffect(() => {
    if (!isOpen || !userId) return;
    if (form.paymentMode !== "Cash") return;

    CashAccountGetAll(userId, true)
      .then((res) => {
        const accounts = res?.data?.data || [];
        setCashAccounts(accounts);
        if (accounts.length === 1) {
          setForm((prev) => ({
            ...prev,
            cashAccountId: accounts[0].id.toString(),
          }));
        }
      })
      .catch((err) => console.error("Error fetching cash accounts:", err));
  }, [isOpen, userId, form.paymentMode]);

  useEffect(() => {
    if (!isOpen || !invoiceData?.invoiceId) return;

    fetchPayments();
  }, [isOpen, invoiceData?.invoiceId, refreshKey]);

  const fetchPayments = async () => {
    if (!invoiceData?.invoiceId) return;

    try {
      const res = await GETgetPaymentHistoryByInvoiceId(invoiceData.invoiceId);

      const responseData = res?.data?.data || {};

      const list = Array.isArray(responseData.payments)
        ? responseData.payments
        : [];

      const due = Number(responseData.totalUnPaidAmount ?? 0);

      setRemainingDue(due);
      setBaseDue(due);

      const mapped = list.map((payment, index) => ({
        sr_no: index + 1,
        id: payment.invoicePaymentHistoryId,
        invoiceNo: payment.invoiceCode || "-",
        paymentDate: payment.payment_date || "-",
        totalAmount: payment.amount || 0,
        due_amount: due,
        dueAmount: payment.dueAmount || 0,
        invoiceAmount: payment.invoiceAmount || 0,
        paymentMode: payment.paymentMode || "-",
        reference: payment.transactionId || "-",
        status: payment.status || "Pending",
        bankId: payment.bankDetails?.id || null,
        _originalData: payment,
      }));

      setPayments(mapped);
    } catch (err) {
      console.error("Error fetching payment history:", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !userId) return;
    GetBankDetails(userId)
      .then((res) => setBankAccounts(res?.data?.data || []))
      .catch((err) => console.error("Error fetching banks:", err));
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;

    if (!bankAccounts.length) return;

    if (editPayment) {
      setForm({
        paymentDate: editPayment.payment_date
          ? editPayment.payment_date.split("/").reverse().join("-")
          : editPayment.paymentDate
            ? new Date(editPayment.paymentDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],

        paymentMode:
          editPayment.paymentMode === "BANK_TRANSFER"
            ? "Bank Transfer"
            : editPayment.paymentMode || "Bank Transfer",

        bankId: editPayment.bankDetails?.id
          ? editPayment.bankDetails.id.toString()
          : editPayment.bankId
            ? editPayment.bankId.toString()
            : "",

        reference: editPayment.transactionId || editPayment.reference || "",

        totalAmount: editPayment.amount
          ? editPayment.amount.toString()
          : editPayment.totalAmount
            ? editPayment.totalAmount.toString()
            : "",
      });
    } else {
      const primaryBank = bankAccounts.find((b) => b.isPrimary);

      setForm({
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "Bank Transfer",
        bankId: primaryBank ? primaryBank.id.toString() : "",
        reference: "",
        cashAccountId: "",
        totalAmount: "",
      });
    }
  }, [editPayment, isOpen, bankAccounts]);

  const handleClose = () => {
    setEditPayment(null);
    setForm({
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Bank Transfer",
      bankId: "",
      cashAccountId: "",
      reference: "",
      totalAmount: "",
    });
    onClose();
  };

  const handleEditPayment = (payment) => {
    setEditPayment({
      ...(payment._originalData || payment),
      due_amount: payment.due_amount,
      totalAmount: payment.totalAmount,
      id: payment.id,
      invoiceNo: payment.invoiceNo,
    });
    setIsListExpanded(false);
  };

  const handleDeletePayment = async (paymentId) => {
    Swal.fire({
      title: "Are you sure you want to delete this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await DeleteRecordpaymentbyid(paymentId);
        Swal.fire("Deleted!", "Payment has been deleted.", "success");
        await fetchPayments(); // ✅ immediate refresh
        setRefreshKey((k) => k + 1); // optional
      }
    });
  };

  const handlePaymentModeChange = (mode) => {
    setForm((prev) => ({
      ...prev,
      paymentMode: mode,
      bankId: mode === "Bank Transfer" ? prev.bankId : "",
      cashAccountId: mode === "Cash" ? prev.cashAccountId : "",
    }));
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleAmountChange = (value) => {
    setForm((prev) => ({ ...prev, totalAmount: value }));

    const payAmount = parseFloat(value || 0);
    let remaining = 0;

    if (editPayment) {
      const oldPay = parseFloat(
        editPayment.totalAmount || editPayment.amount || 0,
      );
      remaining = baseDue + oldPay - payAmount;
    } else {
      remaining = baseDue - payAmount;
    }

    setRemainingDue(remaining >= 0 ? remaining : 0);
  };

  const toApiPaymentMode = (mode) => {
    const map = {
      "Bank Transfer": "BANK_TRANSFER",
      UPI: "UPI",
      Cash: "CASH",
      Cheque: "CHEQUE",
    };
    return map[mode] || mode;
  };

  const handleSubmit = async () => {
    if (!form.paymentDate) {
      return Swal.fire({
        title: "Error!",
        text: "Please select payment date",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      return Swal.fire({
        title: "Error!",
        text: "Please enter valid payment amount",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }
    if (
      ["Bank Transfer", "UPI", "Cheque"].includes(form.paymentMode) &&
      !form.bankId
    ) {
      return Swal.fire({
        title: "Error!",
        text: "Please select bank account",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }

    const payAmount = parseFloat(form.totalAmount || 0);
    const currentDue = baseDue;

    let dueAmount = editPayment
      ? currentDue +
        parseFloat(editPayment.totalAmount || editPayment.amount || 0) -
        payAmount
      : currentDue - payAmount;

    if (dueAmount < 0) {
      const result = await Swal.fire({
        title: "Amount Exceeds Due",
        text: "Payment amount exceeds the receivable amount. Do you still want to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#005BA8",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;
    }
    const accountType = form.paymentMode === "Cash" ? "CASH" : "BANK";
    const apiMode = toApiPaymentMode(form.paymentMode);
    try {
      const invoicePaymentId = editPayment?.id || -1;

      const response = await AddRecordPaymentforInvoice(invoicePaymentId, {
        accountType, // ✅ "CASH" or "BANK"
        amount: payAmount,
        bankAccountId:
          ["Bank Transfer", "UPI", "Cheque"].includes(form.paymentMode) &&
          form.bankId
            ? parseInt(form.bankId)
            : null,
        cashTypeId:
          form.paymentMode === "Cash" && form.cashAccountId
            ? parseInt(form.cashAccountId)
            : null,
        chequeNo: form.paymentMode === "Cheque" ? form.reference || "" : "",
        invoiceId: invoiceData?.invoiceId || 0,
        paymentMode: apiMode, // ✅ "BANK_TRANSFER", "UPI", etc.
        payment_date: formatDateToDDMMYYYY(form.paymentDate),
        dueAmount: dueAmount < 0 ? 0 : dueAmount,
        transactionId:
          form.paymentMode !== "Cheque" ? form.reference || "" : "",
      });

      if (response?.data?.success || response?.success) {
        Swal.fire({
          title: "Success!",
          text: editPayment
            ? "Payment updated successfully"
            : "Payment recorded successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setEditPayment(null);
        setForm({
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode: "Bank Transfer",
          bankId: "",
          cashAccountId: "",
          reference: "",
          totalAmount: "",
        });
        setRefreshKey((k) => k + 1);
      } else {
        throw new Error(response?.message || "Operation failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Failed to record payment",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <CustomModal open={isOpen} onClose={handleClose} width="950px">
      <div className="rounded-xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {editPayment ? "Edit Payment" : "Record Payment"}
          </h2>
          <button onClick={handleClose}>
            <X size={25} className="text-gray-500" />
          </button>
        </div>
        <hr className="bg-gray-200" />

        {/* Customer Card */}
        <div className="border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {invoiceData?.billingname ||
                  invoiceData?.CustomerName ||
                  invoiceData?.event?.party?.nameEnglish ||
                  "-"}
              </p>
              <p className="text-sm text-gray-500">
                Ref:{" "}
                {editPayment?.invoiceNo ||
                  invoiceData?.invoiceCode ||
                  invoiceData?.Invoice ||
                  "-"}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Receivable Amount:{" "}
            <span className="font-semibold">₹ {remainingDue.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Payment Info</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Payment Date</label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm({ ...form, paymentDate: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Payment Mode</label>
              <select
                value={form.paymentMode}
                onChange={(e) => handlePaymentModeChange(e.target.value)}
                className="input"
              >
                <option>Bank Transfer</option>
                <option>UPI</option>
                <option>Cash</option>
                <option>Cheque</option>
              </select>
            </div>

            {["Bank Transfer", "UPI", "Cheque"].includes(form.paymentMode) && (
              <div>
                <label className="label">Select Bank</label>
                <select
                  value={form.bankId}
                  onChange={(e) => setForm({ ...form, bankId: e.target.value })}
                  className="input"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bankName} -{" "}
                      {bank.accountNo
                        .slice(-4)
                        .padStart(bank.accountNo.length, "*")}
                      {bank.isPrimary && " (Primary)"}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.paymentMode === "Cash" && (
              <div>
                <label className="label">Select Cash Account</label>
                <select
                  value={form.cashAccountId}
                  onChange={(e) =>
                    setForm({ ...form, cashAccountId: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select Cash Account</option>
                  {cashAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName || account.name}
                      {account.isPrimary && " (Primary)"}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="label">Reference #</label>
              <input
                placeholder="Enter transaction reference ID"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Pay Amount</label>
              <input
                type="input"
                placeholder="₹ 0.00"
                value={form.totalAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="input"
              />
            </div>

            <div className="flex items-end gap-2">
              {editPayment && (
                <button
                  onClick={() => {
                    setEditPayment(null);
                    setIsListExpanded(true);
                  }}
                  className="w-full md:w-auto border border-gray-300 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto ml-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
              >
                {editPayment ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => setIsListExpanded(!isListExpanded)}
          >
            <span className="text-sm font-medium text-gray-800">
              Payment Received ({payments.length})
            </span>
            {isListExpanded ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </div>

          {isListExpanded && (
            <div className="p-4">
              {payments.length > 0 ? (
                <TableComponent
                  columns={paymentColumns(
                    handleEditPayment,
                    handleDeletePayment,
                  )}
                  data={payments}
                  paginationSize={5}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No payments found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default PaymentCombinedModal;
