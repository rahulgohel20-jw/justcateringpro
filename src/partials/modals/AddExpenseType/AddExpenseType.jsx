import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { AddUpdateIncomeExpenseType } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const AddExpenseType = ({ open, onClose, onSave, editData }) => {
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [title, setTitle] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    if (editData) {
      setTitle(editData.TitleName || editData.name || "");
      setType(editData.type?.toLowerCase() || "expense");
    }
  }, [editData]);
  const handleSave = async () => {
    if (!title.trim()) return;

    const payload = {
      name: title,
      type: type,
      typeId: editData?.typeId || -1,
      userId: userId,
    };
    try {
      const response = await AddUpdateIncomeExpenseType(payload);

      const success = response?.success || response?.data?.success;
      const message = response?.msg || response?.data?.msg;

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: message,
          timer: 1500,
          showConfirmButton: false,
        });

        onSave?.();
        setTitle("");
        setType("expense");
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message || "Something went wrong",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Server error",
      });
    }
  };
  const handleCancel = () => {
    setTitle("");
    setType("expense");
    onClose();
  };

  return (
  <CustomModal
  open={open}
  onClose={handleCancel}
  title={
    <FormattedMessage
      id="COMMON.ADD_INCOME_EXPENSE_TYPE"
      defaultMessage="Add Income / Expense Type"
    />
  }
  footer={
    <div className="flex justify-end gap-2">
      <button
        onClick={handleCancel}
        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
      >
        <FormattedMessage
          id="COMMON.CANCEL"
          defaultMessage="Cancel"
        />
      </button>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <FormattedMessage
          id="COMMON.SAVE"
          defaultMessage="Save"
        />
      </button>
    </div>
  }
>
  <div className="flex flex-col gap-4 pt-2">
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        <FormattedMessage
          id="COMMON.TITLE_NAME"
          defaultMessage="Title Name"
        />
      </label>

      <input
        type="text"
        placeholder={intl.formatMessage({
          id: "COMMON.ENTER_EXPENSE_TYPE",
          defaultMessage: "Enter expense type",
        })}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        <FormattedMessage
          id="COMMON.TYPE"
          defaultMessage="Type"
        />
      </label>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="expense">
          {intl.formatMessage({
            id: "COMMON.EXPENSE",
            defaultMessage: "Expense",
          })}
        </option>

        <option value="income">
          {intl.formatMessage({
            id: "COMMON.INCOME",
            defaultMessage: "Income",
          })}
        </option>
      </select>
    </div>
  </div>
</CustomModal>
  );
};

export default AddExpenseType;
