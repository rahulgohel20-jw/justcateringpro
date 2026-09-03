import { Popconfirm, Tooltip, Modal, Input, Empty } from "antd";
import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import {
  DeleteUserById,
  IsInquiryVisible,
  GetStockTypeByUserId,
  GetStockTypeRights,
  StockTypeRights,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import BanquetRightsModal from "../../../partials/modals/banquet-rights/BanquetRightsModal";

const DeleteCell = ({ row, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await DeleteUserById(row.original.id, "", false);
      const data = res?.data;
      if (data?.success === true) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: data?.msg || "Member deleted successfully.",
        });
        onRefresh && onRefresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.msg || "Something went wrong.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete this member?"
      onConfirm={handleDelete}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true, loading: deleting }}
    >
      <Tooltip title="Delete Member">
        <button className="btn btn-sm btn-icon btn-clear" disabled={deleting}>
          <i className="ki-filled ki-trash text-danger"></i>
        </button>
      </Tooltip>
    </Popconfirm>
  );
};

const BanquetRightsCell = ({ row, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip title="Banquet Rights">
        <button
          className="btn btn-sm btn-icon btn-clear"
          onClick={() => setIsOpen(true)}
        >
          <i className="ki-filled ki-home-2 text-warning"></i>
        </button>
      </Tooltip>
      <BanquetRightsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        member={row.original}
      />
    </>
  );
};

// ── Small reusable toggle switch ────────────────────────────────────────
const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
      checked ? "bg-primary" : "bg-gray-300"
    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        checked ? "translate-x-4" : "translate-x-0.5"
      }`}
    />
  </button>
);

// ── Stock Type Rights ───────────────────────────────────────────────────
const StockTypeRightsModal = ({ isOpen, onClose, member, mainType = "" }) => {
  const [stockTypes, setStockTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && member?.memberid) {
      fetchStockTypeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, member]);

  const fetchStockTypeData = async () => {
    const userId = localStorage.getItem("userId");
    setLoading(true);
    try {
      const [listRes, rightsRes] = await Promise.all([
        GetStockTypeByUserId(userId, mainType),
        GetStockTypeRights(member.memberid),
      ]);

      const list = listRes?.data?.data || [];
      const rights = rightsRes?.data?.data || [];

      // rights may come back as an array of ids, or an array of objects
      // containing a stock type id — handle both shapes
      const rightIds = rights.map((r) =>
        typeof r === "object" ? r.stockTypeId ?? r.id : r,
      );

      setStockTypes(list);
      setSelectedIds(
        list.filter((st) => rightIds.includes(st.id)).map((st) => st.id),
      );
    } catch (error) {
      console.error("Failed to fetch stock type data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load stock type rights.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === stockTypes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stockTypes.map((st) => st.id));
    }
  };

 const handleSave = async () => {
  setSaving(true);
  try {
    const formData = new FormData();
    formData.append("stockTypeIds", selectedIds.join(","));
    formData.append("userId", member.memberid);

    const res = await StockTypeRights(formData);
    const data = res?.data;
    if (data?.success !== false) {
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: data?.msg || "Stock type rights updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      onClose();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data?.msg || "Failed to update stock type rights.",
      });
    }
  } catch (error) {
    console.error("Stock type rights save failed:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Something went wrong.",
    });
  } finally {
    setSaving(false);
  }
};

  const allSelected =
    stockTypes.length > 0 && selectedIds.length === stockTypes.length;

  return (
    <Modal
      title={`Stock Type Rights${member?.full_name ? ` — ${member.full_name}` : ""}`}
      open={isOpen}
      onCancel={() => !saving && onClose()}
      onOk={handleSave}
      okText={saving ? "Saving..." : "Save"}
      cancelText="Cancel"
      okButtonProps={{ loading: saving, disabled: loading }}
      cancelButtonProps={{ disabled: saving }}
      maskClosable={!saving}
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : stockTypes.length === 0 ? (
        <Empty description="No stock types found" />
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-1">
            <div className="flex items-center gap-2">
              <ToggleSwitch checked={allSelected} onChange={toggleAll} />
              <span className="text-sm font-semibold text-gray-700">
                Select All
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {selectedIds.length}/{stockTypes.length} selected
            </span>
          </div>

          <div className="max-h-[320px] overflow-y-auto flex flex-col divide-y divide-gray-50">
            {stockTypes.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700">
                  {st.nameEnglish }
                </span>
                <ToggleSwitch
                  checked={selectedIds.includes(st.id)}
                  onChange={() => toggleId(st.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

const StockTypeRightsCell = ({ row }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip title="Stock Type Rights">
        <button
          className="btn btn-sm btn-icon btn-clear"
          onClick={() => setIsOpen(true)}
        >
          <i className="ki-filled ki-shield-tick text-info"></i>
        </button>
      </Tooltip>
      <StockTypeRightsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        member={row.original}
      />
    </>
  );
};

const InquiryVisibleCell = ({ row }) => {
  const [checked, setChecked] = useState(!!row.original.isInquiryVisible);
  const [updating, setUpdating] = useState(false);

  const performToggle = async () => {
    const newValue = !checked;
    setUpdating(true);
    try {
      const res = await IsInquiryVisible(newValue, row.original.memberid);
      const data = res?.data;
      if (data?.success === true) {
        setChecked(newValue);
        Swal.fire({
          icon: "success",
          title: newValue ? "Inquiry Event Enabled" : "Inquiry Event Disabled",
          text:
            data?.msg ||
            `Inquiry event visibility has been turned ${newValue ? "on" : "off"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.msg || "Failed to update inquiry visibility.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Popconfirm
      title={
        checked
          ? "Hide inquiry event for this member?"
          : "Show inquiry event for this member?"
      }
      onConfirm={performToggle}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ loading: updating }}
    >
      <Tooltip title="Show Inquiry Event">
        <button
          type="button"
          disabled={updating}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
            checked ? "bg-primary" : "bg-gray-300"
          } ${updating ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </Tooltip>
    </Popconfirm>
  );
};

export const columns = (
  onEdit,
  onRefresh,
  permissions = {},
  canAccessBanquet = false,
  canAccessStockType = false,
) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "full_name",
    header: (
      <FormattedMessage id="COMMON.FULL_NAME" defaultMessage="Full Name" />
    ),
    meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
  },
  {
    accessorKey: "city",
    header: <FormattedMessage id="COMMON.CITY" defaultMessage="City" />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "state",
    header: <FormattedMessage id="COMMON.STATE" defaultMessage="State" />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "country",
    header: <FormattedMessage id="COMMON.COUNTRY" defaultMessage="Country" />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "contact",
    header: <FormattedMessage id="COMMON.CONTACT" defaultMessage="Mobile No" />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "role",
    header: <FormattedMessage id="COMMON.ROLE" defaultMessage="Role" />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "email",
    header: <FormattedMessage id="COMMON.EMAIL" defaultMessage="Email" />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "isInquiryVisible",
    header: (
      <FormattedMessage
        id="COMMON.INQUIRY_EVENT_SHOW"
        defaultMessage="Inquiry Event Show"
      />
    ),
    cell: ({ row }) => <InquiryVisibleCell row={row} />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[10%] text-center" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        {permissions.edit && (
          <Tooltip title="Edit Member">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}

        {canAccessBanquet && (
          <BanquetRightsCell row={row} onRefresh={onRefresh} />
        )}

        <StockTypeRightsCell row={row} />

        {permissions.delete && <DeleteCell row={row} onRefresh={onRefresh} />}
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];

export const defaultData = [];