import { Modal, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const StatusCell = ({ row, onStatusChange, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const status = (row.original.status || "pending").toLowerCase();
  const isCompleted = status === "completed";
  const statusConfig = {
    pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    running: { label: "Running", bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    completed: { label: "Completed", bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  };
  const current = statusConfig[status] || statusConfig.pending;

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (!menuRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);
    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (isCompleted || readOnly) return;
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const height = 80;
      const top = window.innerHeight - rect.bottom < height ? rect.top + window.scrollY - height - 4 : rect.bottom + window.scrollY + 4;
      setPosition({ top, left: rect.left + window.scrollX });
    }
    setOpen((value) => !value);
  };

  return <>
    <button ref={buttonRef} onClick={toggle} disabled={isCompleted || readOnly} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} border-transparent ${isCompleted || readOnly ? "cursor-not-allowed opacity-80" : "hover:border-gray-300 cursor-pointer"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />{current.label}{!isCompleted && <svg className="w-3 h-3 ml-0.5" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
    {open && !isCompleted && createPortal(<div ref={menuRef} style={{ position: "absolute", top: position.top, left: position.left, zIndex: 9999, minWidth: 130 }} className="bg-white border border-gray-200 rounded-lg shadow-lg py-1">
      {Object.entries(statusConfig).map(([key, config]) => <button key={key} onClick={() => { if (status !== key) onStatusChange(row.original.id, key); setOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 ${status === key ? "font-semibold" : ""}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} /><span className={config.text}>{config.label}</span>{status === key && <span className="ml-auto text-green-600">✓</span>}
      </button>)}
    </div>, document.body)}
  </>;
};

const ViewModal = ({ open, onClose, record }) => {
  const [search, setSearch] = useState("");
  useEffect(() => { if (!open) setSearch(""); }, [open]);
  if (!record) return null;
  const details = (record.details || []).filter((item) => (item.rawMaterialName || item.rawMaterialNameEng || item.item_name || "").toLowerCase().includes(search.toLowerCase()));
  return <Modal open={open} onCancel={onClose} footer={null} title={<div className="flex items-center gap-2"><span className="text-base font-bold text-slate-800">Store Requisition Details</span><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{record.crcode}</span></div>} width={620} styles={{ body: { height: "520px", overflowY: "auto", padding: "16px 24px" } }}>
    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-sm"><div><b>SR Code</b><p>{record.crcode || "—"}</p></div><div><b>SR Date</b><p>{record.crdate || "—"}</p></div><div><b>Party Name</b><p>{record.partyName || "—"}</p></div><div><b>Stock Type</b><p>{record.stockTypeName || "—"}</p></div><div><b>Status</b><p>Completed</p></div>{record.remarks && <div className="col-span-2"><b>Remarks</b><p>{record.remarks}</p></div>}</div>
    <div className="mt-4"><div className="flex items-center justify-between mb-3"><b className="text-xs text-slate-500 uppercase">Items ({details.length}/{record.details?.length || 0})</b><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search items..." className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 w-44" /></div><div className="rounded-xl border border-slate-100 overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-slate-50">{["#", "Item Name", "Qty", "Price", "Unit"].map((header) => <th key={header} className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">{header}</th>)}</tr></thead><tbody>{details.map((item, index) => <tr key={index} className="border-b border-slate-50"><td className="px-4 py-2.5 text-xs text-slate-400">{index + 1}</td><td className="px-4 py-2.5 font-medium">{item.rawMaterialName || item.rawMaterialNameEng || item.item_name || "—"}</td><td className="px-4 py-2.5 font-semibold">{item.qty ?? "—"}</td><td className="px-4 py-2.5 font-semibold">{item.price ?? "—"}</td><td className="px-4 py-2.5 text-slate-500">{item.unitName || item.unit || "—"}</td></tr>)}</tbody></table></div></div>
  </Modal>;
};

export const storeRequisitionColumns = (onEdit, onDelete, onPrint, onStatusChange, permission, onWhatsApp) => [
  { accessorKey: "sr_no", header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />, meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" } },
  { accessorKey: "crcode", header: <FormattedMessage id="STORE_REQ.CODE" defaultMessage="SR Code" /> },
  { accessorKey: "crdate", header: <FormattedMessage id="STORE_REQ.DATE" defaultMessage="SR Date" /> },
  { accessorKey: "stockTypeName", header: <FormattedMessage id="PURCHASE.TYPE" defaultMessage="Type" />, meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" } },
  { accessorKey: "partyName", header: <FormattedMessage id="PURCHASE.EVENTS" defaultMessage="Party Name" />, meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" } },
  { accessorKey: "remarks", header: <FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />, meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" } },
  { accessorKey: "details", header: "Items", cell: ({ row }) => row.original.details?.length || 0 },
  { accessorKey: "status", header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />, cell: ({ row }) => permission?.add ? <StatusCell row={row} onStatusChange={onStatusChange} /> : <StatusCell row={row} onStatusChange={() => {}} readOnly />, meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" } },
  { accessorKey: "action", header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />, cell: ({ row }) => {
    const isCompleted = (row.original.status || "pending").toLowerCase() === "completed";
    const [viewOpen, setViewOpen] = useState(false);
    return <><div className="flex items-center gap-1">{isCompleted ? <Tooltip title="View"><button className="btn btn-sm btn-icon btn-clear" onClick={() => setViewOpen(true)}><i className="ki-filled ki-eye text-blue-600" /></button></Tooltip> : <>{permission?.edit && <Tooltip title="Edit"><button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}><i className="ki-filled ki-notepad-edit text-primary" /></button></Tooltip>}{permission?.delete && <Tooltip title="Delete"><button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.issueid)}><i className="ki-filled ki-trash text-danger" /></button></Tooltip>}</>}<Tooltip title="Print"><button className="btn btn-sm btn-icon btn-clear" onClick={() => onPrint?.(row.original)}><i className="ki-filled ki-printer text-green-700" /></button></Tooltip><Tooltip title="Share on WhatsApp"><button className="btn btn-sm btn-icon btn-clear" onClick={() => onWhatsApp?.(row.original)}><i className="ki-filled ki-whatsapp text-green-600" /></button></Tooltip></div><ViewModal open={viewOpen} onClose={() => setViewOpen(false)} record={row.original} /></>;
  }, meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" } },
];
