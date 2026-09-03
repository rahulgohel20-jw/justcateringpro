import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FormattedMessage } from "react-intl";
import { MoreVertical, Info, Printer, Trash2, FilePlus2, MessageCircle } from "lucide-react";

const ActionCell = ({ row, onInfo, onPrint, onDelete, onGenerateInvoice, onWhatsApp, permissions = {} }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const status = row.original.status;

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 224; // w-56
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 200; // not enough room below

    setCoords({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
      openUpward,
    });
  }, []);

  const toggleOpen = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleScrollOrResize = () => computePosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open, computePosition]);

  const runAction = (fn, ...args) => {
    setOpen(false);
    fn && fn(...args);
  };

  const items = [
    {
      key: "info",
      label: "Info",
      icon: <Info size={15} className="text-green-700" />,
      onClick: () => runAction(onInfo, row.original),
    },
    {
      key: "print",
      label: "Print",
      icon: <Printer size={15} className="text-orange-700" />,
      onClick: () => runAction(onPrint, row.original),
    },
    {
      key: "whatsapp",
      label: "Send via WhatsApp",
      icon: <MessageCircle size={15} className="text-green-500" />,
      onClick: () => runAction(onWhatsApp, row.original),
    },
    ...(status !== "INVOICE_GENERATED" && permissions.delete
      ? [{
          key: "delete",
          label: "Delete",
          icon: <Trash2 size={15} className="text-red-700" />,
          danger: true,
          onClick: () => runAction(onDelete, row.original.id),
        }]
      : []),
    ...(status !== "INVOICE_GENERATED" && permissions.add
      ? [{
          key: "generate",
          label: "Generate Purchase Invoice",
          icon: <FilePlus2 size={15} className="text-[#005BA8]" />,
          onClick: () => runAction(onGenerateInvoice, row.original),
        }]
      : []),
  ];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.openUpward ? undefined : coords.top,
              bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
              left: coords.left,
            }}
            className="z-[9999] w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          >
            {items.map((item) => (
              <button
                key={item.key}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${
                  item.danger ? "text-red-700" : "text-gray-700"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    INVOICE_GENERATED: "bg-green-50 text-green-700 border-green-200",
    PO_GENERATED:      "bg-blue-50 text-blue-700 border-blue-200",
    PENDING:           "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  const cls = styles[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

// ── Columns ────────────────────────────────────────────────────────────────────
export const columns = (onInfo, onPrint, onDelete, onGenerateInvoice, onWhatsApp, permissions = {}) => [
    {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%] text-gray-500 font-medium" },
  },
  {
    accessorKey: "voucherNo",
    header: <FormattedMessage id="PURCHASE.VOUCHER_NO" defaultMessage="Voucher No." />,
    cell: ({ row }) => (
      <span className="font-semibold text-blue-600 text-sm">{row.original.voucherNo || "—"}</span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "voucherDate",
    header: <FormattedMessage id="PURCHASE.VOUCHER_DATE" defaultMessage="PO Generated Date" />,
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 text-sm">{row.original.voucherDate || "—"}</span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "sotNo",
    header: <FormattedMessage id="PURCHASE.SOT_NO" defaultMessage="SOT No" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gray-700">{row.original.sotNo || "—"}</span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "partyName",
    header: <FormattedMessage id="PURCHASE.PARTY" defaultMessage="Party" />,
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 text-sm">{row.original.partyName || "—"}</span>
    ),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "invoicetype",
    header: <FormattedMessage id="PURCHASE.INVOICE_TYPE" defaultMessage="Invoice Type" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "finalamount",
    header: <FormattedMessage id="PURCHASE.TOTAL" defaultMessage="Total Price" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "status",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
 {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <ActionCell
        row={row}
        onInfo={onInfo}
        onPrint={onPrint}
        onDelete={onDelete}
        onGenerateInvoice={onGenerateInvoice}
        onWhatsApp={onWhatsApp}
        permissions={permissions}
      />
    ),
    meta: { headerClassName: "w-[38%]", cellClassName: "w-[38%]" },
  },
];