import { useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, message } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import Swal from "sweetalert2";
import {
  AddReciptpayment,
  GenerateVoucherNoForPaymentReceipt,
  GetbankdetailsbyuserId,
  CashAccountGetAll,
  getAllByRoleId,
  GetAllAccountContactMaster,
  GETAllByuserIdincomeExpensetype,
} from "@/services/apiServices";
import dayjs from "dayjs";

const { TextArea } = Input;

const CASH_MODES = [{ key: "CASH", label: "Cash" }];
const BANK_MODES = [
  { key: "UPI", label: "UPI" },
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "CHEQUE", label: "Cheque" },
];

const INITIAL_FORM = {
  accountContactId: null,
  accountContactName: "",
  incomeExpenseTypeId: null, // ← add
  date: null,
  amount: "",
  invoiceId: "",
  notes: "",
  referenceNo: "",
  cashTypeId: null,
  bankAccountId: null,
  paymentMode: null,
};

const AddPayable = ({
  open,
  onClose,
  onSuccess,
  type = "cash",
  userId,
  mode = "add",
  initialData = null,
}) => {
  const isCash = type === "cash";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const paymentModes = isCash ? CASH_MODES : BANK_MODES;

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [voucherNo, setVoucherNo] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const [cashList, setCashList] = useState([]);
  const [bankList, setBankList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [expenseTypeList, setExpenseTypeList] = useState([]);
  const localUserId = JSON.parse(localStorage.getItem("userId"));
  const finalUserId = userId || localUserId;
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      paymentMode: isCash ? "CASH" : null,
    }));
  }, [type]);

  // ── load dropdowns + voucher when modal opens ──
  useEffect(() => {
    if (!open) return;
    loadFormData();
  }, [open, type, userId]);

  // ── prefill on edit/view, reset on add ──
  useEffect(() => {
    if (!open) return;
    if ((isEdit || isView) && initialData) {
      setVoucherNo(initialData.voucherNo || "");
      setForm({
        accountContactId: initialData.accountContactId ?? null,
        accountContactName: initialData.accountContactName || "",
        incomeExpenseTypeId: initialData.incomeExpenseTypeId ?? null,
        date: initialData.date
          ? dayjs(initialData.date, ["DD/MM/YYYY", "YYYY-MM-DD"]) // ← handle both formats
          : null,
        amount: initialData.amount != null ? String(initialData.amount) : "",
        invoiceId:
          initialData.invoice?.id != null
            ? String(initialData.invoice.id) // ← API returns invoice object, not invoiceId
            : "",
        notes: initialData.notes || "",
        referenceNo: initialData.referenceNo || "",
        cashTypeId: initialData.cashType?.id ?? null, // ← cashType object
        bankAccountId: initialData.bankDetails?.id ?? null, // ← bankDetails object
        paymentMode: initialData.paymentMode || null,
      });
    } else if (isAdd) {
      setForm({ ...INITIAL_FORM, paymentMode: isCash ? "CASH" : null });
      setVoucherNo("");
    }
  }, [open, initialData, mode]);

  const loadFormData = async () => {
    try {
      setDropdownLoading(true);

      const requests = [
        GetAllAccountContactMaster(finalUserId),
        isCash
          ? CashAccountGetAll(finalUserId)
          : GetbankdetailsbyuserId(finalUserId),
        GETAllByuserIdincomeExpensetype(finalUserId, "expense"),
      ];

      if (isAdd) {
        requests.unshift(
          GenerateVoucherNoForPaymentReceipt({
            accountType: isCash ? "CASH" : "BANK",
            entryType: "PAYMENT",
            userId: userId,
          }),
        );
      }

      const results = await Promise.all(requests);

      if (isAdd) {
        const [voucherRes, partyRes, accountRes, expenseRes] = results;
        setVoucherNo(voucherRes?.data?.data || "");
        parsePartyList(partyRes);
        parseAccountList(accountRes);
        parseExpenseTypeList(expenseRes);
      } else {
        const [partyRes, accountRes, expenseRes] = results;
        parsePartyList(partyRes);
        parseAccountList(accountRes);
        parseExpenseTypeList(expenseRes);
      }
    } catch (err) {
      console.error("❌ Load form data error →", err);
      message.error("Failed to load form data");
    } finally {
      setDropdownLoading(false);
    }
  };

  const parsePartyList = (res) => {
    const contacts = res?.data?.data || [];

    setPartyList(
      contacts.map((c) => ({
        label: c.name,
        value: c.accountContactId,
        id: c.accountContactId,
      })),
    );
  };

  const parseExpenseTypeList = (res) => {
    const types = res?.data?.data || [];
    setExpenseTypeList(
      types.map((t) => ({
        label: t.name,
        value: t.typeId,
      })),
    );
  };

  const parseAccountList = (res) => {
    const accounts = res?.data?.data || [];
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
    if (isView) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const missing =
      !form.accountContactId ||
      !form.date ||
      !form.amount ||
      (isCash ? !form.cashTypeId : !form.bankAccountId || !form.paymentMode);

    if (missing) {
      message.warning("Please fill all required fields");
      return;
    }
    const payload = {
      accountContactId: form.accountContactId,
      accountContactName: form.accountContactName,
      incomeExpenseTypeId: form.incomeExpenseTypeId,
      amount: Number(form.amount),
      bankAccountId: isCash ? null : form.bankAccountId,
      cashTypeId: isCash ? form.cashTypeId : null,
      date: dayjs(form.date).format("DD/MM/YYYY"),
      entryType: "PAYMENT",
      invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
      notes: form.notes,
      paymentMode: isCash ? "CASH" : form.paymentMode,
      referenceNo: form.referenceNo || "",
      userId: finalUserId,
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
        text: err?.response?.data?.msg || "Failed to save payment",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setVoucherNo("");
    setCashList([]);
    setBankList([]);
    setPartyList([]);
    onClose();
  };

  const modalTitle = isAdd
    ? isCash
      ? "Add Cash Payment"
      : "Add Bank Payment"
    : isEdit
      ? isCash
        ? "Edit Cash Payment"
        : "Edit Bank Payment"
      : isCash
        ? "View Cash Payment"
        : "View Bank Payment";

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      width={720}
      title={
        <div className="flex items-center gap-2">
          <span className="font-semibold">{modalTitle}</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{isView ? "Close" : "Cancel"}</Button>
          {!isView && (
            <Button type="primary" loading={loading} onClick={handleSave}>
              {isAdd ? "Save Payment" : "Update Payment"}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Payment No */}
        <div>
          <label className="text-xs   ">PAYMENT NO</label>
          <Input
            value={voucherNo || (isAdd ? "Generating..." : "—")}
            disabled
          />
        </div>

        {/* Pay From Account */}
        <div>
          <label className="text-xs   ">
            {isCash ? "PAY FROM (CASH) *" : "PAY FROM (BANK) *"}
          </label>
          <Select
            className="w-full"
            placeholder={isCash ? "Select cash account" : "Select bank account"}
            loading={dropdownLoading}
            value={isCash ? form.cashTypeId : form.bankAccountId}
            onChange={(val) =>
              handleChange(isCash ? "cashTypeId" : "bankAccountId", val)
            }
            options={isCash ? cashList : bankList}
            disabled={isView}
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs   ">DATE *</label>
          <DatePicker
            className="w-full"
            value={form.date}
            format="DD/MM/YYYY"
            onChange={(val) => handleChange("date", val)}
            disabled={isView}
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className="text-xs   ">PAYMENT MODE {!isCash && "*"}</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {paymentModes.map((m) => (
              <Button
                key={m.key}
                type={form.paymentMode === m.key ? "primary" : "default"}
                onClick={() => !isView && handleChange("paymentMode", m.key)}
                disabled={isView}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs">PAY TO (VENDOR / PERSON) *</label>
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
        <div>
          <label className="text-xs">EXPENSE TYPE</label>
          <Select
            className="w-full"
            placeholder="Select expense type"
            loading={dropdownLoading}
            value={form.incomeExpenseTypeId || undefined}
            onChange={(val) => handleChange("incomeExpenseTypeId", val)}
            options={expenseTypeList}
            disabled={isView}
            allowClear
          />
        </div>
        {/* Reference No */}

        {/* Amount */}
        <div className="col-span-2">
          <label className="text-xs   ">AMOUNT *</label>
          <Input
            prefix="₹"
            type="text"
            className="text-right text-lg font-semibold"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Notes */}
        <div className="col-span-2">
          <label className="text-xs   ">NOTES</label>
          <TextArea
            rows={3}
            placeholder="Optional notes..."
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            disabled={isView}
          />
        </div>
        <div>
          <label className="text-xs   ">REFERENCE NO</label>
          <Input
            placeholder="Optional"
            value={form.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
            disabled={isView}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default AddPayable;
