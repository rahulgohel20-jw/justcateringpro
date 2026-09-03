import { useState, useEffect } from "react";
import { Input, DatePicker, Select, Button, message } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import Swal from "sweetalert2";
import {
  AddReciptpayment,
  GenerateVoucherNoForPaymentReceipt,
  CashAccountGetAll,
  getAllByRoleId,
  GetAllAccountContactMaster,
  GetSuperalladmininvoice,
  GETAllByuserIdincomeExpensetype,
} from "@/services/apiServices";
import dayjs from "dayjs";

const { TextArea } = Input;

const INITIAL_FORM = {
  accountContactId: null,
  accountContactName: "",
  incomeExpenseTypeId: null,
  date: null,
  amount: "",
  invoiceId: "",
  notes: "",
  referenceNo: "",
  cashTypeId: null,
};

const AddCashReceipt = ({
  isOpen,
  onClose,
  refreshData,
  userId,
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

  const [cashList, setCashList] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [isOtherParty, setIsOtherParty] = useState(false);
  const [incomeTypeList, setIncomeTypeList] = useState([]);

  useEffect(() => {
    if (!open) return;
    loadFormData();
  }, [open, userId]);

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
        cashTypeId: initialData.cashType?.id ?? null,
      });
    } else if (isAdd) {
      setForm(INITIAL_FORM);
      setVoucherNo("");
    }
  }, [open, initialData, mode]);

  useEffect(() => {
    if (!form.partyName) return;

    const selectedParty = partyList.find((p) => p.value === form.partyName);
    const customerId = selectedParty?.id || "";

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
            label: `${inv.invoiceCode} - ${inv.customerName}`,
            value: inv.invoiceId,
          })),
        );
      })
      .catch((err) => console.error("❌ Invoice fetch error →", err));
  }, [form.partyName, partyList]);
  const loadFormData = async () => {
    try {
      setDropdownLoading(true);

      if (isAdd) {
        const voucherRes = await GenerateVoucherNoForPaymentReceipt({
          accountType: "CASH",
          entryType: "RECEIPT",
          userId,
        });
        setVoucherNo(voucherRes?.data?.data || "");
      }

      const [partyRes, accountRes, incomeRes] = await Promise.all([
        GetAllAccountContactMaster(userId),
        CashAccountGetAll(userId, true),
        GETAllByuserIdincomeExpensetype(userId, "income"),
      ]);

      const contacts = partyRes?.data?.data || [];

      setPartyList(
        contacts.map((c) => ({
          label: c.name,
          value: c.accountContactId,
          id: c.accountContactId,
        })),
      );

      const accounts = accountRes?.data?.data || [];
      setCashList(
        accounts.map((c) => ({
          label: c.accountName || c.cashTypeName || c.name,
          value: c.id,
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
      !form.accountContactId || !form.date || !form.amount || !form.cashTypeId;

    if (missing) {
      message.warning("Please fill all required fields");
      return;
    }

    const payload = {
      accountContactId: form.accountContactId,
      accountContactName: form.accountContactName,
      amount: Number(form.amount),
      bankAccountId: null,
      cashTypeId: form.cashTypeId,
      date: dayjs(form.date).format("DD/MM/YYYY"),
      entryType: "RECEIPT",
      incomeExpenseTypeId: form.incomeExpenseTypeId,
      invoiceId: form.invoiceId ? Number(form.invoiceId) : null,
      notes: form.notes,
      paymentMode: "CASH",
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
        text: err?.response?.data?.msg || "Failed to save cash receipt",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setVoucherNo("");
    setCashList([]);
    setPartyList([]);
    setInvoiceList([]);
    setIsOtherParty(false);
    onClose();
  };

  const modalTitle = isAdd
    ? "Add Cash Receipt"
    : isEdit
      ? "Edit Cash Receipt"
      : "View Cash Receipt";

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
        <div>
          <label className="text-xs">RECEIPT NO</label>
          <Input
            value={voucherNo || (isAdd ? "Generating..." : "—")}
            disabled
          />
        </div>

        <div>
          <label className="text-xs">DATE *</label>
          <DatePicker
            className="w-full"
            value={form.date}
            onChange={(val) => handleChange("date", val)}
            disabled={isView}
          />
        </div>

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

        <div>
          <label className="text-xs">ACCOUNT (CASH) *</label>
          <Select
            className="w-full"
            placeholder="Select cash account"
            loading={dropdownLoading}
            value={form.cashTypeId}
            onChange={(val) => handleChange("cashTypeId", val)}
            options={cashList}
            disabled={isView}
          />
        </div>
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
        <div>
          <label className="text-xs">AMOUNT *</label>
          <Input
            prefix="₹"
            type="tel"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            disabled={isView}
          />
        </div>
        <div>
          <label className="text-xs">REFERENCE NO</label>
          <Input
            placeholder="Optional"
            value={form.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
            disabled={isView}
          />
        </div>

        {/* Against Invoice */}
        {/* <div>
          <label className="text-xs">AGAINST INVOICE</label>
          <Select
            className="w-full"
            placeholder="Select invoice"
            value={form.invoiceId ? Number(form.invoiceId) : undefined}
            onChange={(val) => handleChange("invoiceId", val)}
            options={invoiceList}
            disabled={isView || !form.partyName}
            allowClear
          />
        </div> */}

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

export default AddCashReceipt;
