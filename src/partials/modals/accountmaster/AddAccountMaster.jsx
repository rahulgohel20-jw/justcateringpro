import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  AddAccountcontactmaster,
  GetAllMemberByUserId,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const AddAccountMaster = ({ open, onClose, onSave, editData }) => {
  const [accountName, setAccountName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [openingDate, setOpeningDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [balanceType, setBalanceType] = useState("PAYMENT");
  const [isMemberMode, setIsMemberMode] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);

  const getUserId = () => {
    const directId = localStorage.getItem("userId");
    if (directId) return JSON.parse(directId);

    const authKey = Object.keys(localStorage).find((k) =>
      k.includes("metronic-tailwind-react-auth"),
    );
    if (authKey) {
      const authData = JSON.parse(localStorage.getItem(authKey));
      return authData?.userId;
    }
    return null;
  };

  const userId = getUserId();
  useEffect(() => {
    if (isMemberMode && memberList.length === 0) {
      fetchMembers();
    }
  }, [isMemberMode]);

  const fetchMembers = async () => {
    setMemberLoading(true);
    try {
      const res = await GetAllMemberByUserId(userId);
   

      const data = res?.data?.data?.userDetails?.UserDetails || [];
      setMemberList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch members", err);
      setMemberList([]);
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    if (editData) {
      setAccountName(editData.name || "");
      setOpeningBalance(editData.openingBalance?.toString() || "");
      setOpeningDate(convertFromApiDate(editData.openingDate));
      setBalanceType(editData.entryType || "PAYMENT");
      if (editData.memberId && editData.memberId !== 0) {
        setIsMemberMode(true);
        setSelectedMemberId(editData.memberId.toString());
      }
    } else {
      resetForm();
    }
  }, [editData, open]);
  const resetForm = () => {
    setAccountName("");
    setOpeningBalance("");
    setOpeningDate(new Date().toISOString().slice(0, 10));
    setBalanceType("PAYMENT");
    setIsMemberMode(false);
    setSelectedMemberId("");
  };
  const convertToInputDate = (date) => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };
  const convertFromApiDate = (date) => {
    if (!date) return "";
    const [d, m, y] = date.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m}-${d}`;
  };

  const convertToApiDate = (date) => {
    if (!date) return "";
    const [y, m, d] = date.split("-");
    if (!d || !m || !y) return "";
    return `${d}/${m}/${y}`;
  };

  const handleMemberSelect = (e) => {
    const memberId = e.target.value;
    setSelectedMemberId(memberId);
    const member = memberList.find((m) => m.id?.toString() === memberId);
    if (member) {
      setAccountName(`${member.firstName} ${member.lastName}`.trim());
    }
  };

  const handleToggle = () => {
    setIsMemberMode((prev) => !prev);
    setSelectedMemberId("");
    setAccountName("");
  };

  const handleSave = async () => {
    if (!accountName.trim()) {
      Swal.fire("Validation", "Account name is required.", "warning");
      return;
    }

    if (isMemberMode && !selectedMemberId) {
      Swal.fire("Validation", "Please select a member.", "warning");
      return;
    }

    const payload = {
      accountContactId: editData?.accountContactId || -1,
      currentBalance: parseFloat(openingBalance) || 0,
      entryType: balanceType,
      memberId: isMemberMode ? parseInt(selectedMemberId) || 0 : 0,
      name: accountName,
      openingBalance: parseFloat(openingBalance) || 0,
      openingDate: convertToApiDate(openingDate),
      userId: userId,
    };

    try {
      const res = await AddAccountcontactmaster(payload);

      const msg =
        res?.data?.msg ||
        res?.data?.message ||
        (editData ? "Updated successfully." : "Added successfully.");

      const isSuccess = res?.data?.success ?? true;

      await Swal.fire({
        icon: isSuccess ? "success" : "error",
        title: isSuccess ? "Success" : "Failed",
        text: msg,
      });

      if (isSuccess) {
        resetForm();
        onSave?.();
      }
    } catch (err) {
      console.error(err);

      const errMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errMsg,
      });
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <CustomModal
  open={open}
  onClose={handleCancel}
  title={
    editData ? (
      <FormattedMessage
        id="COMMON.EDIT_ACCOUNT_CONTACT_MASTER"
        defaultMessage="Edit Account Contact Master"
      />
    ) : (
      <FormattedMessage
        id="COMMON.ADD_ACCOUNT_CONTACT_MASTER"
        defaultMessage="Add Account Contact Master"
      />
    )
  }
  footer={
    <div className="flex justify-end gap-2">
      <button
        onClick={handleCancel}
        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
      >
        <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
      </button>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-primary text-white rounded-md "
      >
        {editData ? (
          <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
        ) : (
          <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
        )}
      </button>
    </div>
  }
>
  <div className="flex items-center justify-between pt-2 pb-1">
    <span className="text-sm font-medium text-gray-700">
      {isMemberMode ? (
        <FormattedMessage
          id="COMMON.SELECT_FROM_MEMBER_LIST"
          defaultMessage="Select from Member List"
        />
      ) : (
        <FormattedMessage
          id="COMMON.ENTER_ACCOUNT_NAME_MANUALLY"
          defaultMessage="Enter Account Name Manually"
        />
      )}
    </span>

    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        isMemberMode ? "bg-primary" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          isMemberMode ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>

  <div className="flex flex-col gap-2 pt-2">
    <label className="text-sm font-medium text-gray-700">
      {isMemberMode ? (
        <FormattedMessage
          id="COMMON.SELECT_MEMBER"
          defaultMessage="Select Member"
        />
      ) : (
        <FormattedMessage
          id="COMMON.ACCOUNT_NAME"
          defaultMessage="Account Name"
        />
      )}
    </label>

    {isMemberMode ? (
      memberLoading ? (
        <div className="text-sm text-gray-400 py-2">
          <FormattedMessage
            id="COMMON.LOADING_MEMBERS"
            defaultMessage="Loading members..."
          />
        </div>
      ) : (
        <select
          value={selectedMemberId}
          onChange={handleMemberSelect}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 "
        >
          <option value="">
            <FormattedMessage
              id="COMMON.SELECT_A_MEMBER"
              defaultMessage="Select a member"
            />
          </option>

          {memberList.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName} — {member.contactNo}
            </option>
          ))}
        </select>
      )
    ) : (
      <input
        type="text"
        placeholder="Enter account name"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
        className="border rounded-md px-3 py-2 outline-none focus:ring-2 "
      />
    )}
  </div>

  <div className="flex flex-col gap-2 pt-2">
    <label className="text-sm font-medium text-gray-700">
      <FormattedMessage
        id="COMMON.OPENING_BALANCE"
        defaultMessage="Opening Balance"
      />
    </label>

    <input
      type="text"
      placeholder="Enter amount"
      value={openingBalance}
      onChange={(e) => setOpeningBalance(e.target.value)}
      className="border rounded-md px-3 py-2 w-full outline-none focus:ring-2 "
    />
  </div>

  <div className="flex flex-col gap-2 pt-2">
    <label className="text-sm font-medium text-gray-700">
      <FormattedMessage
        id="COMMON.OPENING_BALANCE_DATE"
        defaultMessage="Opening Balance Date"
      />
    </label>

    <input
      type="date"
      value={openingDate}
      onChange={(e) => setOpeningDate(e.target.value)}
      className="border rounded-md px-3 py-2 outline-none focus:ring-2 "
    />
  </div>

  <div className="flex flex-col gap-2 pt-2">
    <label className="text-sm font-medium text-gray-700">
      <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
    </label>

    <select
      value={balanceType}
      onChange={(e) => setBalanceType(e.target.value)}
      className="border rounded-md px-3 py-2 outline-none focus:ring-2 "
    >
      <option value="PAYMENT">
        <FormattedMessage
          id="COMMON.PAYMENT_DEBIT"
          defaultMessage="Payment (Debit)"
        />
      </option>

      <option value="RECEIPT">
        <FormattedMessage
          id="COMMON.RECEIPT_CREDIT"
          defaultMessage="Receipt (Credit)"
        />
      </option>
    </select>
  </div>
</CustomModal>
  );
};

export default AddAccountMaster;
