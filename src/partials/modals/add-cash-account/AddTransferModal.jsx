import { useEffect, useState } from "react";
import { Select, Input, DatePicker, Button } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  AddAccountTranfer,
  CashAccountGetAll,
  GetbankdetailsbyuserId,
} from "@/services/apiServices";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Swal from "sweetalert2";

dayjs.extend(customParseFormat);

const { TextArea } = Input;

const AddTransferModal = ({ open, onClose, editData }) => {
  const [fromAccount, setFromAccount] = useState(null);
  const [toAccount, setToAccount] = useState(null);
  const [cashAccount, setCashaccount] = useState([]);
  const [bankAccount, setBankAccount] = useState([]);
  const [fromAccountType, setFromAccountType] = useState(null);
  const [toAccountType, setToAccountType] = useState(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [notes, setNotes] = useState("");
  const userid = localStorage.getItem("userId");
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (editData) {
      setFromAccountType(editData.fromType?.toLowerCase());
      setToAccountType(editData.toType?.toLowerCase());
      setFromAccount(editData.fromAccountId);
      setToAccount(editData.toAccountId);
      setAmount(String(editData.amount));
      setDate(editData.date ? dayjs(editData.date, "DD/MM/YYYY") : null);
      setNotes(editData.notes || "");
    }
  }, [editData]);

  const fetchAccounts = async () => {
    try {
      const userId = Number(localStorage.getItem("userId"));
      const cashRes = await CashAccountGetAll(userId);
      const bankRes = await GetbankdetailsbyuserId(userId);
      setCashaccount(
        Array.isArray(cashRes?.data?.data) ? cashRes.data.data : [],
      );
      setBankAccount(
        Array.isArray(bankRes?.data?.data) ? bankRes.data.data : [],
      );
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  const cashOptions = cashAccount.map((item) => ({
    label: item.accountName,
    value: item.id,
    type: "cash",
  }));

  const bankOptions = bankAccount.map((item) => ({
    label: `${item.bankName} - ${item.accountHolderName}`,
    value: item.id,
    type: "bank",
  }));

  const accounts = [...cashOptions, ...bankOptions];

  const fromAccounts = accounts
    .filter((acc) => acc.type === fromAccountType)
    .filter((acc) => acc.value !== toAccount);

  const toAccounts = accounts
    .filter((acc) => acc.type === toAccountType)
    .filter((acc) => acc.value !== fromAccount);

  const getType = () => {
    if (!fromAccountType || !toAccountType) return "";
    return `${fromAccountType.toUpperCase()} → ${toAccountType.toUpperCase()}`;
  };

const handleSave = async () => {
  if (!fromAccount || !toAccount || !amount || !date) {
    console.warn("Please fill all required fields.");
    return;
  }

  const payload = {
    userId: Number(userid),
    id: editData?.id ?? -1,
    fromAccountId: fromAccount,
    toAccountId: toAccount,
    fromType: fromAccountType.toUpperCase(),
    toType: toAccountType.toUpperCase(),
    amount: Number(amount),
    date: date.format("DD/MM/YYYY"),
    notes,
  };

  try {
    const res = await AddAccountTranfer(payload);

    if (res?.data?.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.msg || "Transfer saved successfully.",
      });
      handleClose();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: res?.data?.msg || "Something went wrong. Please try again.",
      });
    }
  } catch (error) {
    console.error("Transfer failed:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.msg ||
        error?.message ||
        "Transfer failed. Please try again.",
    });
  }
};

  const handleClose = () => {
    setFromAccount(null);
    setToAccount(null);
    setFromAccountType(null);
    setToAccountType(null);
    setAmount("");
    setDate(null);
    setNotes("");
    onClose();
  };

  const accountsType = [
    { label: "Cash", value: "cash" },
    { label: "Bank", value: "bank" },
  ];

  const isEdit = !!editData;

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      width={700}
      title={isEdit ? "Edit Transfer" : "Add Transfer"}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {isEdit ? "Update Transfer" : "Save Transfer"}{" "}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-black">FROM Type</label>
            <Select
              className="w-full"
              placeholder="Select type"
              value={fromAccountType}
              onChange={(val) => {
                setFromAccountType(val);
                setFromAccount(null);
              }}
              options={accountsType}
            />
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">→</div>
          </div>
          <div>
            <label className="text-xs text-black">TO Type</label>
            <Select
              className="w-full"
              placeholder="Select type"
              value={toAccountType}
              onChange={(val) => {
                setToAccountType(val);
                setToAccount(null);
              }}
              options={accountsType}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-black">FROM ACCOUNT</label>
            <Select
              className="w-full"
              placeholder={
                fromAccountType ? "Select account" : "Select type first"
              }
              value={fromAccount}
              onChange={setFromAccount}
              options={fromAccounts}
              disabled={!fromAccountType}
            />
          </div>
          <div className="flex justify-center">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">→</div>
          </div>
          <div>
            <label className="text-xs text-black">TO ACCOUNT</label>
            <Select
              className="w-full"
              placeholder={
                toAccountType ? "Select account" : "Select type first"
              }
              value={toAccount}
              onChange={setToAccount}
              options={toAccounts}
              disabled={!toAccountType}
            />
          </div>
        </div>

        {fromAccountType && toAccountType && (
          <div className="bg-gray-50 border rounded-xl px-3 py-2">
            <span className="text-xs text-black">TRANSFER TYPE</span>
            <div className="font-semibold text-black">{getType()}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-black">AMOUNT</label>
            <Input
              type="text"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-black">DATE</label>
            <DatePicker
              className="w-full"
              value={date}
              onChange={(d) => setDate(d)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-black">NOTES</label>
          <TextArea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add transfer notes..."
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default AddTransferModal;
