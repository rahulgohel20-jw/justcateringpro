import { Modal, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const StatusCell = ({ row, onStatusChange, readOnly  }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  const status = (row.original.status || "pending").toLowerCase();
  const isCompleted = status === "completed";

  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      dot: "bg-yellow-500",
    },
    running: {
      label: "Running",
      bg: "bg-blue-100",
      text: "text-blue-800",
      dot: "bg-blue-500",
    },
    completed: {
      label: "Completed",
      bg: "bg-green-100",
      text: "text-green-800",
      dot: "bg-green-500",
    },
  };

  const current = statusConfig[status] || statusConfig.pending;

  const handleOpen = () => {
    if (isCompleted || readOnly) return;
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownHeight = 80;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < dropdownHeight
          ? rect.top + window.scrollY - dropdownHeight - 4
          : rect.bottom + window.scrollY + 4;
      setDropdownPos({ top, left: rect.left + window.scrollX });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
         disabled={isCompleted || readOnly}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
          ${current.bg} ${current.text} border-transparent
          ${isCompleted || readOnly ? "cursor-not-allowed opacity-80" : "hover:border-gray-300 cursor-pointer"}
          transition`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        {current.label}
        {!isCompleted && (
          <svg className="w-3 h-3 ml-0.5" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {open && !isCompleted &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              minWidth: 130,
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-lg py-1"
          >
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => {
                  if (status !== key) onStatusChange(row.original.id, key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition ${
                  status === key ? "font-semibold" : ""
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={cfg.text}>{cfg.label}</span>
                {status === key && (
                  <svg
                    className="w-3 h-3 ml-auto text-green-600"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

const ViewModal = ({ open, onClose, record }) => {
  const [itemSearch, setItemSearch] = useState("");

 
  useEffect(() => {
    if (!open) setItemSearch("");
  }, [open]);

  if (!record) return null;

  const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider";
  const valueClass = "text-sm font-medium text-slate-800";

  const filteredDetails = (record.details || []).filter((item) => {
    const name = (item.rawMaterialName || item.item_name || "").toLowerCase();
    return name.includes(itemSearch.toLowerCase());
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-800">
            Chef Requisition Details
          </span>
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            {record.crcode}
          </span>
        </div>
      }
      width={620}
   
      styles={{
        body: {
          height: "520px",
          overflowY: "auto",
          padding: "16px 24px",
        },
      }}
    >
      {/* ── Info Grid ── */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
        <div>
          <p className={labelClass}>CR Code</p>
          <p className={valueClass}>{record.crcode || "—"}</p>
        </div>
        <div>
          <p className={labelClass}>CR Date</p>
          <p className={valueClass}>{record.crdate || "—"}</p>
        </div>
        <div>
          <p className={labelClass}>Party Name</p>
          <p className={valueClass}>{record.partyName || "—"}</p>
        </div>
        <div>
          <p className={labelClass}>Stock Type</p>
          <p className={valueClass}>{record.stockTypeName || "—"}</p>
        </div>
        <div>
          <p className={labelClass}>Status</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Completed
          </span>
        </div>
        {record.remarks && (
          <div className="col-span-2">
            <p className={labelClass}>Remarks</p>
            <p className={valueClass}>{record.remarks}</p>
          </div>
        )}
      </div>

      {/* ── Items Section ── */}
      <div className="mt-4">
        {/* Header + Search */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Items ({filteredDetails.length}/{record.details?.length || 0})
          </p>
          <div className="relative">
            <i className="ki-filled ki-magnifier absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <input
              type="text"
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              placeholder="Search items..."
              className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all w-44"
            />
            {itemSearch && (
              <button
                onClick={() => setItemSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <i className="ki-filled ki-cross text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["#", "Item Name", "Qty", "Price", "Unit"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDetails.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-400 text-xs"
                  >
                    {itemSearch
                      ? `No items matching "${itemSearch}"`
                      : "No items found"}
                  </td>
                </tr>
              ) : (
                filteredDetails.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-xs text-slate-400">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {item.rawMaterialName || item.item_name || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-semibold">
                      {item.qty ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-semibold">
                      {item.price ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {item.unitName || item.unit || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

// ── Columns ──────────────────────────────────────────────────────────────────
export const columns = (onEdit, onDelete, onPrint, onStatusChange, permission, onWhatsApp) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "crcode",
    header: <FormattedMessage id="CHEF_REQ.CODE" defaultMessage="CR Code" />,
  },
  {
    accessorKey: "crdate",
    header: <FormattedMessage id="CHEF_REQ.DATE" defaultMessage="CR Date" />,
  },
  {
    accessorKey: "stockTypeName",
    header: <FormattedMessage id="PURCHASE.TYPE" defaultMessage="Type" />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "partyName",
    header: (
      <FormattedMessage id="PURCHASE.EVENTS" defaultMessage="Party Name" />
    ),
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey:"remarks",
    header: (<FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />),
  
  meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "details",
    header: "Items",
    cell: ({ row }) => row.original.details?.length || 0,
  },
  {
  accessorKey: "status",
  header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
  cell: ({ row }) => (
    permission?.add
      ? <StatusCell row={row} onStatusChange={onStatusChange} />
      : <StatusCell row={row} onStatusChange={() => {}} readOnly /> // read-only badge
  ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
   {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      const isCompleted =
        (row.original.status || "pending").toLowerCase() === "completed";
      const [viewOpen, setViewOpen] = useState(false);

      return (
        <>
          <div className="flex items-center gap-1">
            {isCompleted ? (
              <Tooltip title="View">
                <button className="btn btn-sm btn-icon btn-clear" onClick={() => setViewOpen(true)}>
                  <i className="ki-filled ki-eye text-blue-600"></i>
                </button>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Edit">
                  {permission?.edit && (
                    <button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}>
                      <i className="ki-filled ki-notepad-edit text-primary"></i>
                    </button>
                  )}
                </Tooltip>
                <Tooltip title="Delete">
                  {permission?.delete && (
                    <button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.issueid)}>
                      <i className="ki-filled ki-trash text-danger"></i>
                    </button>
                  )}
                </Tooltip>
              </>
            )}
            <Tooltip title="Print">
              <button className="btn btn-sm btn-icon btn-clear" onClick={() => onPrint && onPrint(row.original)}>
                <i className="ki-filled ki-printer text-green-700"></i>
              </button>
            </Tooltip>
            <Tooltip title="Share on WhatsApp">
  <button className="btn btn-sm btn-icon btn-clear" onClick={() => onWhatsApp && onWhatsApp(row.original)}>
    <i className="ki-filled ki-whatsapp text-green-600"></i>
  </button>
</Tooltip>
          </div>

          <ViewModal open={viewOpen} onClose={() => setViewOpen(false)} record={row.original} />
        </>
      );
    },
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
];