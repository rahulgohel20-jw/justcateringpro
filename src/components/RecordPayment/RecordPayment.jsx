import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { X, User } from "lucide-react";
import {
  AddRecordPayment,
  GetBankDetails,
  AddRecordPaymentforInvoice,
  GETgetPaymentHistoryByInvoiceId,
  CashAccountGetAll,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";

const RecordPayment = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  invoiceData,
  refreshData,
  editPayment = null,
  isSuperAdmin = false,
}) => {
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));

  const [bankAccounts, setBankAccounts] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Bank Transfer",
    bankId: "",
    cashAccountId: "",
    reference: "",
    totalAmount: "",
  });

  const [remainingDue, setRemainingDue] = useState(0);
  const [baseDue, setBaseDue] = useState(0);

  const toApiPaymentMode = (mode) => {
    const map = {
      "Bank Transfer": "BANK_TRANSFER",
      UPI: "UPI",
      Cash: "CASH",
      Cheque: "CHEQUE",
    };
    return map[mode] || mode;
  };

  useEffect(() => {
    if (isModalOpen) {
      if (editPayment) {
        setRemainingDue(parseFloat(editPayment.dueAmount || 0));
      } else {
        setRemainingDue(parseFloat(invoiceData?.due_amount || 0));
      }
    }
  }, [isModalOpen, editPayment, invoiceData]);

  useEffect(() => {
    if (isModalOpen && userId) {
      GetBankDetails(userId)
        .then((res) => {
          const banks = res?.data?.data || [];
          setBankAccounts(banks);
        })
        .catch((error) => console.error("Error fetching banks:", error));
    }
  }, [isModalOpen, userId]);

  useEffect(() => {
    if (isModalOpen && userId && form.paymentMode === "Cash") {
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
        .catch((error) =>
          console.error("Error fetching cash accounts:", error),
        );
    }
  }, [isModalOpen, userId, form.paymentMode]);

  useEffect(() => {
    if (isModalOpen) {
      if (editPayment) {
        const normalizeMode = (mode) => {
          if (!mode) return "Bank Transfer";
          if (mode === "BANK_TRANSFER") return "Bank Transfer";
          if (mode === "UPI") return "UPI";
          if (mode === "CASH") return "Cash";
          if (mode === "CHEQUE") return "Cheque";
          return mode;
        };

        setForm({
          paymentDate: editPayment.payment_date
            ? editPayment.payment_date.split("/").reverse().join("-")
            : editPayment.paymentDate
              ? new Date(editPayment.paymentDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          paymentMode: normalizeMode(editPayment.paymentMode),
          bankId: editPayment.bankDetails?.id
            ? editPayment.bankDetails.id.toString()
            : editPayment.bankId
              ? editPayment.bankId.toString()
              : "",
          cashAccountId: editPayment.cashTypeId
            ? editPayment.cashTypeId.toString()
            : "",
          reference: editPayment.transactionId || editPayment.reference || "",
          totalAmount: editPayment.amount
            ? editPayment.amount.toString()
            : editPayment.totalAmount
              ? editPayment.totalAmount.toString()
              : "",
        });
      } else if (invoiceData) {
        const primaryBank = bankAccounts.find((bank) => bank.isPrimary);
        setForm({
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMode: "Bank Transfer",
          bankId: primaryBank ? primaryBank.id.toString() : "",
          cashAccountId: "",
          reference: "",
          totalAmount: "",
        });
      }
    }
  }, [editPayment, invoiceData, isModalOpen, bankAccounts]);

  const handleClose = () => {
    setIsModalOpen(false);
    setForm({
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Bank Transfer",
      bankId: "",
      cashAccountId: "",
      reference: "",
      totalAmount: "",
    });
  };

  const handlePaymentModeChange = (mode) => {
    setForm((prev) => ({
      ...prev,
      paymentMode: mode,
      bankId:
        mode === "Bank Transfer" || mode === "UPI" || mode === "Cheque"
          ? prev.bankId
          : "",
      cashAccountId: mode === "Cash" ? prev.cashAccountId : "",
    }));
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!form.paymentDate) {
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text: intl.formatMessage({
          id: "PAYMENT.DATE_REQUIRED",
          defaultMessage: "Please select payment date",
        }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0) {
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text: intl.formatMessage({
          id: "PAYMENT.AMOUNT_REQUIRED",
          defaultMessage: "Please enter valid payment amount",
        }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    if (form.paymentMode === "Bank Transfer" && !form.bankId) {
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text: intl.formatMessage({
          id: "PAYMENT.BANK_REQUIRED",
          defaultMessage: "Please select bank account",
        }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    // ✅ Validate cash account selection
    if (form.paymentMode === "Cash" && !form.cashAccountId) {
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text: intl.formatMessage({
          id: "PAYMENT.CASH_ACCOUNT_REQUIRED",
          defaultMessage: "Please select a cash account",
        }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    const payAmount = parseFloat(form.totalAmount || 0);
    const currentDue = baseDue;
    let newDueAmount = 0;

    if (editPayment) {
      const oldPayAmount = parseFloat(
        editPayment.amount || editPayment.totalAmount || 0,
      );
      newDueAmount = currentDue + oldPayAmount - payAmount;
    } else {
      newDueAmount = currentDue - payAmount;
    }

    if (newDueAmount < 0) {
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

    try {
      const apiMode = toApiPaymentMode(form.paymentMode);
      const accountType = form.paymentMode === "Cash" ? "CASH" : "BANK";

      const payload = {
        id: editPayment?.id || -1,
        bankId:
          form.paymentMode === "Bank Transfer" ? parseInt(form.bankId) : 0,
        dueAmount: newDueAmount,
        eventId: editPayment?.eventId || parseInt(eventId),
        invoiceNo: editPayment?.invoiceNo || invoiceData?.invoiceCode || "",
        invoiceAmount: parseFloat(invoiceData?.grandTotal || 0),
        paymentDate: formatDateToDDMMYYYY(form.paymentDate),
        paymentMode: form.paymentMode,
        reference: form.reference || "",
        totalAmount: payAmount,
        userId: userId,
        accountType: accountType,
        cashId:
          form.paymentMode === "Cash" && form.cashAccountId
            ? parseInt(form.cashAccountId)
            : "",
      };

      let response;
      if (isSuperAdmin) {
        const invoicePaymentId = editPayment?.id || -1;
        response = await AddRecordPaymentforInvoice(invoicePaymentId, {
          accountType: accountType, // ✅ Added
          amount: payAmount,
          bankAccountId:
            ["UPI", "Bank Transfer", "Cheque"].includes(form.paymentMode) &&
            form.bankId
              ? parseInt(form.bankId)
              : null,
          cashTypeId:
            form.paymentMode === "Cash" && form.cashAccountId // ✅ Added
              ? parseInt(form.cashAccountId)
              : null,

          chequeNo: form.paymentMode === "Cheque" ? form.reference || "" : "",
          transactionId:
            form.paymentMode !== "Cheque" ? form.reference || "" : "",
          invoiceId: invoiceData?.invoiceId || parseInt(eventId) || 0,
          paymentMode: apiMode, // ✅ Uses mapped value
          payment_date: formatDateToDDMMYYYY(form.paymentDate),
          dueAmount: newDueAmount || 0,
        });
      } else {
        response = await AddRecordPayment(payload);
      }

      if (response?.data?.success || response?.success) {
        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.SUCCESS",
            defaultMessage: "Success!",
          }),
          text: intl.formatMessage({
            id: editPayment
              ? "PAYMENT.UPDATED_SUCCESS"
              : "PAYMENT.ADDED_SUCCESS",
            defaultMessage: editPayment
              ? "Payment updated successfully"
              : "Payment recorded successfully",
          }),
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        handleClose();
        if (refreshData) refreshData();
      } else {
        throw new Error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ERROR",
          defaultMessage: "Error!",
        }),
        text:
          error?.response?.data?.message ||
          error.message ||
          intl.formatMessage({
            id: "PAYMENT.SAVE_ERROR",
            defaultMessage: "Failed to record payment",
          }),
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;

    if (isSuperAdmin && invoiceData?.invoiceId) {
      if (editPayment) {
        const due = parseFloat(editPayment.dueAmount || 0);
        setBaseDue(due);
        setRemainingDue(due);
      } else {
        GETgetPaymentHistoryByInvoiceId(invoiceData.invoiceId)
          .then((res) => {
            const data = res?.data?.data || {};
            const due = parseFloat(data?.totalUnPaidAmount || 0);
            setBaseDue(due);
            setRemainingDue(due);
          })
          .catch((err) => console.error("Error fetching due:", err));
      }
    } else {
      const due = parseFloat(invoiceData?.due_amount || 0);
      setBaseDue(due);
      setRemainingDue(due);
    }
  }, [isModalOpen, invoiceData, isSuperAdmin, editPayment]);

  return (
    isModalOpen && (
      <CustomModal open={isModalOpen} onClose={handleClose} width="900px">
        <div className="rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-white rounded-t-xl">
            <div className="flex items-center gap-2 text-xl font-bold">
              <FormattedMessage
                id={
                  editPayment
                    ? "PAYMENT.EDIT_PAYMENT"
                    : "PAYMENT.RECORD_PAYMENT"
                }
                defaultMessage={editPayment ? "Edit Payment" : "Record Payment"}
              />
            </div>
            <button onClick={handleClose}>
              <X size={25} className="text-gray-500" />
            </button>
          </div>
          <hr className="mt-2 font-bold bg-grey-300" />

          {/* Content */}
          <div className="flex flex-col gap-3">
            {/* Customer Card */}
            <div className="border rounded-xl mt-2 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {invoiceData?.billingname ||
                      invoiceData?.event?.party?.nameEnglish ||
                      "-"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="PAYMENT.REF" defaultMessage="Ref" />:{" "}
                    {editPayment?.invoiceNo || invoiceData?.invoiceCode || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Receivable Amount:{" "}
                <span className="font-semibold">
                  ₹ {remainingDue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border rounded-xl p-5">
              <h3 className="font-semibold mb-4">
                <FormattedMessage
                  id="PAYMENT.PAYMENT_INFO"
                  defaultMessage="Payment Info"
                />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="label">
                    <FormattedMessage
                      id="PAYMENT.PAYMENT_DATE"
                      defaultMessage="Payment Date"
                    />
                  </label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) =>
                      setForm({ ...form, paymentDate: e.target.value })
                    }
                    className="input"
                  />
                </div>

                {/* Mode */}
                <div>
                  <label className="label">
                    <FormattedMessage
                      id="PAYMENT.PAYMENT_MODE"
                      defaultMessage="Payment Mode"
                    />
                  </label>
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

                {/* Bank Dropdown */}
                {(form.paymentMode === "Bank Transfer" ||
                  form.paymentMode === "UPI" ||
                  form.paymentMode === "Cheque") && (
                  <div>
                    <label className="label">
                      <FormattedMessage
                        id="PAYMENT.SELECT_BANK"
                        defaultMessage="Select Bank"
                      />
                    </label>
                    <select
                      value={form.bankId}
                      onChange={(e) =>
                        setForm({ ...form, bankId: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">
                        {intl.formatMessage({
                          id: "PAYMENT.SELECT_BANK_ACCOUNT",
                          defaultMessage: "Select Bank Account",
                        })}
                      </option>
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

                {/* ✅ Cash Account Dropdown — shown only when Cash is selected */}
                {form.paymentMode === "Cash" && (
                  <div>
                    <label className="label">
                      <FormattedMessage
                        id="PAYMENT.SELECT_CASH_ACCOUNT"
                        defaultMessage="Select Cash Account"
                      />
                    </label>
                    <select
                      value={form.cashAccountId}
                      onChange={(e) =>
                        setForm({ ...form, cashAccountId: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">
                        {intl.formatMessage({
                          id: "PAYMENT.SELECT_CASH_ACCOUNT_PLACEHOLDER",
                          defaultMessage: "Select Cash Account",
                        })}
                      </option>
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
                {/* Reference */}
                {/* Reference */}
                <div>
                  <label className="label">
                    {form.paymentMode === "Cheque" ? (
                      "Cheque No"
                    ) : (
                      <FormattedMessage
                        id="PAYMENT.REFERENCE"
                        defaultMessage="Reference #"
                      />
                    )}
                  </label>
                  <input
                    placeholder={
                      form.paymentMode === "Cheque"
                        ? "Enter cheque number"
                        : intl.formatMessage({
                            id: "PAYMENT.REFERENCE_PLACEHOLDER",
                            defaultMessage: "Enter transaction reference ID",
                          })
                    }
                    value={form.reference}
                    onChange={(e) =>
                      setForm({ ...form, reference: e.target.value })
                    }
                    className="input"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="label">
                    <FormattedMessage
                      id="PAYMENT.PAY_AMOUNT"
                      defaultMessage="Pay Amount"
                    />
                  </label>
                  <input
                    type="input"
                    placeholder="₹ 0.00"
                    value={form.totalAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm({ ...form, totalAmount: value });

                      const payAmount = parseFloat(value || 0);
                      let remaining = 0;

                      if (editPayment) {
                        const oldPayAmount = parseFloat(
                          editPayment.amount || editPayment.totalAmount || 0,
                        );
                        remaining = baseDue + oldPayAmount - payAmount;
                      } else {
                        remaining = baseDue - payAmount;
                      }

                      setRemainingDue(remaining >= 0 ? remaining : 0);
                    }}
                    className="input"
                  />
                </div>

                {/* Save */}
                <div className="flex items-end">
                  <button
                    onClick={handleSubmit}
                    className="w-full md:w-auto ml-auto bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                  >
                    <FormattedMessage
                      id={editPayment ? "COMMON.UPDATE" : "COMMON.SAVE"}
                      defaultMessage={editPayment ? "Update" : "Save"}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    )
  );
};

export default RecordPayment;
