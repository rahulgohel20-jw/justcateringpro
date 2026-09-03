import { useState, useEffect } from "react";
import { Input, DatePicker, Select, Button, message } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import Swal from "sweetalert2";
import {
  AddReciptpayment,
  GenerateVoucherNoForPaymentReceipt,
  GetbankdetailsbyuserId,
  GetAllAccountContactMaster,
  GETAllByuserIdincomeExpensetype,
  GetSuperalladmininvoice,
} from "@/services/apiServices";
import dayjs from "dayjs";

const { TextArea } = Input;

const PAYMENT_MODES = [
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHEQUE" },
];

const INITIAL_FORM = {
  accountContactId: null,
  accountContactName: "",
  incomeExpenseTypeId: null,
  date: null,
  amount: "",
  invoiceId: "",
  notes: "",
  referenceNo: "",
  bankAccountId: null,
  paymentMode: null,
};

const AddBankReceiptModal = ({
  isOpen,
  onClose,
  refreshData,
  userId: propUserId,
  mode = "add",
  receiptDetails = null,
}) => {
  const open = isOpen;
  const onSuccess = refreshData;
  const initialData = receiptDetails;
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [loading, setLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const [bankList, setBankList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [incomeTypeList, setIncomeTypeList] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const localUserId = JSON.parse(localStorage.getItem("userId"));
  const userId = propUserId || localUserId;

  // ── Load dropdowns + voucher when modal opens ──
  useEffect(() => {
    if (!open) return;
    loadFormData();
  }, [open, userId]);

  // ── Prefill or reset form ──
  useEffect(() => {
    if (!open) return;

    if ((isEdit || isView) && initialData) {
      setVoucherNo(initialData.voucherNo || "");
      setForm({
        accountContactId: initialData.accountContactId ?? null,
        accountContactName: initialData.accountContactName || "",
        incomeExpenseTypeId: initialData.incomeExpenseTypeId ?? null,
        date: initialData.date ? dayjs(initialData.date, "DD/MM/YYYY") : null,
        amount: initialData.amount != null ? String(initialData.amount) : "",
        invoiceId:
          initialData.invoiceId != null ? String(initialData.invoiceId) : "",
        notes: initialData.notes || "",
        referenceNo: initialData.referenceNo || "",
        bankAccountId: initialData.bankDetails?.id ?? null,
        paymentMode: initialData.paymentMode || null,
      });
    } else if (isAdd) {
      setForm(INITIAL_FORM);
      setVoucherNo("");
    }
  }, [open, initialData, mode]);

  // ── Load invoices when party changes ──
  useEffect(() => {
    if (!form.accountContactId) {
      setInvoiceList([]);
      handleChange("invoiceId", "");
      return;
    }

    const selectedParty = partyList.find(
      (p) => p.value === form.accountContactId,
    );
    const customerId = selectedParty?.id || "";

    const loadInvoices = async () => {
      try {
        setInvoiceLoading(true);
        const res = await GetSuperalladmininvoice(
          "01/01/2000",
          dayjs().format("DD/MM/YYYY"),
          -1,
          customerId,
        );
        const invoices = res?.data?.data?.invoices || [];
        setInvoiceList(
          invoices
            .filter((inv) => Number(inv.totalUnpaidAmount) > 0)
            .map((inv) => ({
              label: `${inv.invoiceCode} | ${inv.invoiceDate} | ₹${inv.totalUnpaidAmount} due`,
              value: inv.invoiceId,
              amount: inv.totalUnpaidAmount,
            })),
        );
      } catch (err) {
        console.error("Invoice fetch error", err);
      } finally {
        setInvoiceLoading(false);
      }
    };

    loadInvoices();
  }, [form.accountContactId, partyList]); // ✅ correct dependency

  const loadFormData = async () => {
    try {
      setDropdownLoading(true);

      if (isAdd) {
        const voucherRes = await GenerateVoucherNoForPaymentReceipt({
          accountType: "BANK",
          entryType: "RECEIPT",
          userId,
        });
        setVoucherNo(voucherRes?.data?.data || "");
      }

      const [partyRes, accountRes, incomeRes] = await Promise.all([
        GetAllAccountContactMaster(userId),
        GetbankdetailsbyuserId(userId),
        GETAllByuserIdincomeExpensetype(userId, "income"),
      ]);

      const contacts = partyRes?.data?.data || [];
      setPartyList(
        contacts.map((c) => ({
          label: c.name,
          value: c.memberId,
          id: c.memberId,
        })),
      );

      const accounts = accountRes?.data?.data || [];
      setBankList(
        accounts.map((b) => ({
          label: b.bankName || b.name,
          value: b.id,
        })),
      );

      const incomeTypes = incomeRes?.data?.data || [];
      setIncomeTypeList(
        incomeTypes.map((t) => ({
          label: t.name,
          value: t.typeId,
        })),
      );
    } catch (err) {
      console.error("❌ API Error →", err);
      message.error("Failed to load form data");
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleChange = (key, value) => {
    if (isView) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const missing =
      !form.partyName ||
      !form.date ||
      !form.amount ||
      !form.bankAccountId ||
      !form.paymentMode;

    if (missing) {
      message.warning("Please fill all required fields");
      return;
    }

    const payload = {
      accountContactId: form.accountContactId,
      accountContactName: form.accountContactName,
      incomeExpenseTypeId: form.incomeExpenseTypeId,
      amount: Number(form.amount),
      bankAccountId: form.bankAccountId,
      cashTypeId: null,
      date: dayjs(form.date).format("DD/MM/YYYY"),
      entryType: "RECEIPT",
      invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
      notes: form.notes,
      paymentMode: form.paymentMode,
      referenceNo: form.referenceNo || "",
      userId,
      voucherNo,
    };

    const recordId = isEdit ? (initialData?.id ?? -1) : -1;

    try {
      setLoading(true);
      const saveRes = await AddReciptpayment(recordId, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: saveRes?.data?.msg || "Saved successfully",
        confirmButtonColor: "#3085d6",
      });
      handleClose();
      onSuccess?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || "Failed to save bank receipt",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setVoucherNo("");
    setBankList([]);
    setPartyList([]);
    setInvoiceList([]);
    onClose();
  };

  const modalTitle = isAdd
    ? "Add Bank Receipt"
    : isEdit
      ? "Edit Bank Receipt"
      : "View Bank Receipt";

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      width={720}
      title={modalTitle}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{isView ? "Close" : "Cancel"}</Button>
          {!isView && (
            <Button type="primary" loading={loading} onClick={handleSave}>
              {isAdd ? "Save Receipt" : "Update Receipt"}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Receipt No */}
        <div>
          <label className="text-xs">RECEIPT NO</label>
          <Input
            value={voucherNo || (isAdd ? "Generating..." : "—")}
            disabled
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs">DATE *</label>
          <DatePicker
            className="w-full"
            value={form.date}
            onChange={(val) => handleChange("date", val)}
            disabled={isView}
          />
        </div>

        {/* Received From */}
        <div>
          <label className="text-xs">RECEIVED FROM *</label>
          <Select
            className="w-full"
            showSearch
            allowClear
            placeholder="Select contact"
            loading={dropdownLoading}
            value={form.accountContactId || undefined}
            onChange={(val, option) => {
              handleChange("accountContactId", val);
              handleChange("accountContactName", option?.label || "");
            }}
            options={partyList}
            disabled={isView}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>

        {/* Bank Account */}
        <div>
          <label className="text-xs">DEPOSIT TO BANK *</label>
          <Select
            className="w-full"
            placeholder="Select bank"
            loading={dropdownLoading}
            value={form.bankAccountId}
            onChange={(val) => handleChange("bankAccountId", val)}
            options={bankList}
            disabled={isView}
          />
        </div>

        {/* Payment Mode */}
        <div className="col-span-2">
          <label className="text-xs">PAYMENT MODE *</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {PAYMENT_MODES.map((m) => (
              <Button
                key={m.value}
                type={form.paymentMode === m.value ? "primary" : "default"}
                onClick={() => !isView && handleChange("paymentMode", m.value)}
                disabled={isView}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Income Type */}
        <div>
          <label className="text-xs">INCOME TYPE</label>
          <Select
            className="w-full"
            placeholder="Select income type"
            loading={dropdownLoading}
            value={form.incomeExpenseTypeId || undefined}
            onChange={(val) => handleChange("incomeExpenseTypeId", val)}
            options={incomeTypeList}
            disabled={isView}
            allowClear
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs">AMOUNT *</label>
          <Input
            prefix="₹"
            type="text"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Reference No */}
        <div>
          <label className="text-xs">REFERENCE NO</label>
          <Input
            placeholder="Optional"
            value={form.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs">NOTES</label>
          <TextArea
            rows={2}
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            disabled={isView}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default AddBankReceiptModal;
