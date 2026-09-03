import { useState, useEffect } from "react";
import { Input, DatePicker, Select, Button, message } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import Swal from "sweetalert2";
import {
  AddReciptpayment,
  GenerateVoucherNoForPaymentReceipt,
  GetbankdetailsbyuserId,
  CashAccountGetAll,
  getAllByRoleId,
  GetSuperalladmininvoice,
} from "@/services/apiServices";
import dayjs from "dayjs";

const { TextArea } = Input;

const PAYMENT_MODES = [
  { label: "UPI", value: "UPI" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "IMPS/NEFT", value: "IMPS_NEFT" },
  { label: "Cheque", value: "CHEQUE" },
];

const INITIAL_FORM = {
  partyName: "",
  date: null,
  amount: "",
  invoiceId: "",
  notes: "",
  referenceNo: "",
  cashTypeId: null,
  bankAccountId: null,
  paymentMode: null,
};

const ReceiptModal = ({
  open,
  onClose,
  onSuccess,
  type = "cash",
  userId,
  mode = "add", // "add" | "edit" | "view"
  initialData = null, // prefilled from Getbyidreciptpayment
}) => {
  const isCash = type === "cash";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [loading, setLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  // ── Dropdown data ──
  const [bankList, setBankList] = useState([]);
  const [cashList, setCashList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [isOtherParty, setIsOtherParty] = useState(false);
  // ── Load dropdowns + voucher on open ──
  useEffect(() => {
    if (!open) return;
    loadFormData();
  }, [open, type, userId]);

  // ── Prefill or reset form once dropdowns are ready ──

  useEffect(() => {
    if (!form.partyName) return; // find customerId from partyList by matching name
    const selectedParty = partyList.find((p) => p.value === form.partyName);
    const customerId = selectedParty?.id || ""; // ← see note below
   
    GetSuperalladmininvoice(
      "01/01/2000",
      dayjs().format("DD/MM/YYYY"),
      -1,
      customerId,
    )
      .then((res) => {
        const invoices = res?.data?.data?.invoices || [];

        setInvoiceList(
          invoices.map((inv) => ({
            label: `${inv.invoiceCode} - ${inv.customerName}`, // invoice + party
            value: inv.invoiceId,
          })),
        );
      })
      .catch((err) => console.error("❌ Invoice fetch error →", err));
  }, [form.partyName, partyList]);

  useEffect(() => {
    if (!open) return;

    if ((isEdit || isView) && initialData) {
      setVoucherNo(initialData.voucherNo || "");
      setForm({
        partyName: initialData.partyName || "",
        date: initialData.date ? dayjs(initialData.date, "DD/MM/YYYY") : null,
        amount: initialData.amount != null ? String(initialData.amount) : "",
        invoiceId:
          initialData.invoiceId != null ? String(initialData.invoiceId) : "",
        notes: initialData.notes || "",
        referenceNo: initialData.referenceNo || "",
        cashTypeId: initialData.cashType?.id ?? null,
        bankAccountId: initialData.bankDetails?.id ?? null,
        paymentMode: initialData.paymentMode || null,
      });
    } else if (isAdd) {
      setForm(INITIAL_FORM);
      setVoucherNo("");
    }
  }, [open, initialData, mode]);

  const loadFormData = async () => {
    try {
      setDropdownLoading(true);

      // voucher (only add)
      if (isAdd) {
        const voucherRes = await GenerateVoucherNoForPaymentReceipt({
          accountType: isCash ? "CASH" : "BANK",
          entryType: "RECEIPT",
          userId,
        });

        setVoucherNo(voucherRes?.data?.data || "");
      }

      // party list
      const partyRes = await getAllByRoleId(2, "member");
      parsePartyList(partyRes);

      // account list (separate call)
      const accountRes = isCash
        ? await CashAccountGetAll(userId, true)
        : await GetbankdetailsbyuserId(userId);

      parseAccountList(accountRes);
    } catch (err) {
      console.error("❌ API Error →", err);
      message.error("Failed to load form data");
    } finally {
      setDropdownLoading(false);
    }
  };

  const parsePartyList = (partyRes) => {
    const userDetails = partyRes?.data?.data?.["User Details"];
    const parties = userDetails?.users || [];
    setPartyList(
      parties.map((u) => {
        const name =
          [u.firstName, u.lastName].filter(Boolean).join(" ") ||
          u.name ||
          u.fullName ||
          u.username ||
          u.email;
        return { label: name, value: name, id: u.id };
      }),
    );
  };

  const parseAccountList = (accountRes) => {
    const accounts = accountRes?.data?.data || [];
    if (isCash) {
      setCashList(
        accounts.map((c) => ({
          label: c.accountName || c.cashTypeName || c.name,
          value: c.id,
        })),
      );
    } else {
      setBankList(
        accounts.map((b) => ({
          label: b.bankName || b.name,
          value: b.id,
        })),
      );
    }
  };

  const handleChange = (key, value) => {
    if (isView) return; // no changes in view mode
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const missing =
      !form.partyName ||
      !form.date ||
      !form.amount ||
      (isCash ? !form.cashTypeId : !form.bankAccountId || !form.paymentMode);

    if (missing) {
      message.warning("Please fill all required fields");
      return;
    }

    const payload = {
      amount: Number(form.amount),
      bankAccountId: isCash ? null : form.bankAccountId,
      cashTypeId: isCash ? form.cashTypeId : null,
      date: dayjs(form.date).format("DD/MM/YYYY"),
      entryType: "RECEIPT",
      invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
      notes: form.notes,
      partyName: form.partyName,
      paymentMode: isCash ? "CASH" : form.paymentMode,
      referenceNo: form.referenceNo || "",
      userId,
      voucherNo,
    };

    // -1 = new record, existing id = update
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
        text: err?.response?.data?.msg || "Failed to save receipt",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setVoucherNo("");
    setBankList([]);
    setCashList([]);
    setPartyList([]);
    setIsOtherParty(false);
    onClose();
  };

  const modalTitle = isAdd
    ? isCash
      ? "Add Cash Receipt"
      : "Add Bank Receipt"
    : isEdit
      ? isCash
        ? "Edit Cash Receipt"
        : "Edit Bank Receipt"
      : isCash
        ? "View Cash Receipt"
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
          <label className="text-xs ">RECEIPT NO</label>
          <Input
            value={voucherNo || (isAdd ? "Generating..." : "—")}
            disabled
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs ">DATE *</label>
          <DatePicker
            className="w-full"
            value={form.date}
            onChange={(val) => handleChange("date", val)}
            disabled={isView}
          />
        </div>

        {/* Party Name */}
        <div>
          <label className="text-xs">RECEIVED FROM *</label>

          {isOtherParty ? (
            /* ── Free-text mode ── */
            <div className="flex gap-2">
              <Input
                placeholder="Enter party name"
                value={form.partyName}
                onChange={(e) => handleChange("partyName", e.target.value)}
                disabled={isView}
                className="flex-1"
              />
              {!isView && (
                <Button
                  size="small"
                  onClick={() => {
                    setIsOtherParty(false);
                    handleChange("partyName", "");
                  }}
                >
                  ✕ Change
                </Button>
              )}
            </div>
          ) : (
            /* ── Dropdown mode ── */
            <Select
              className="w-full"
              showSearch
              allowClear
              placeholder="Select or type party name"
              loading={dropdownLoading}
              value={form.partyName || undefined}
              onChange={(val) => {
                if (val === "__OTHER__") {
                  setIsOtherParty(true);
                  handleChange("partyName", "");
                } else {
                  handleChange("partyName", val);
                }
              }}
              options={[
                ...partyList,
                { label: "➕ Other (enter manually)", value: "__OTHER__" },
              ]}
              disabled={isView}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          )}
        </div>
        {/* Cash Type or Bank Account */}
        <div>
          <label className="text-xs ">
            {isCash ? "ACCOUNT (CASH) *" : "DEPOSIT TO BANK *"}
          </label>
          <Select
            className="w-full"
            placeholder={isCash ? "Select cash account" : "Select bank"}
            loading={dropdownLoading}
            value={isCash ? form.cashTypeId : form.bankAccountId}
            onChange={(val) =>
              handleChange(isCash ? "cashTypeId" : "bankAccountId", val)
            }
            options={isCash ? cashList : bankList}
            disabled={isView}
          />
        </div>

        {/* Bank Only: Payment Mode */}
        {!isCash && (
          <div className="col-span-2">
            <label className="text-xs ">PAYMENT MODE *</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {PAYMENT_MODES.map((m) => (
                <Button
                  key={m.value}
                  type={form.paymentMode === m.value ? "primary" : "default"}
                  onClick={() =>
                    !isView && handleChange("paymentMode", m.value)
                  }
                  disabled={isView}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Reference No */}
        <div>
          <label className="text-xs ">REFERENCE NO</label>
          <Input
            placeholder="Optional"
            value={form.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs ">AMOUNT *</label>
          <Input
            prefix="₹"
            type="tel"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Against Invoice */}
        {/* Against Invoice */}
        <div>
          <label className="text-xs ">AGAINST INVOICE</label>
          <Select
            className="w-full"
            placeholder="Select invoice"
            value={form.invoiceId ? Number(form.invoiceId) : undefined}
            onChange={(val) => handleChange("invoiceId", val)}
            options={invoiceList}
            disabled={isView || !form.partyName}
            allowClear
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs ">NOTES</label>
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

export default ReceiptModal;
