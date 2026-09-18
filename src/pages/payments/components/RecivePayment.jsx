import { useState, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { TableComponent } from "@/components/table/TableComponent";
import {
  Search,
  Wallet,
  Landmark,
  Banknote,
  CalendarX2,
  X,
  Eye,
} from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Tooltip } from "antd";

const PaymentModeBadge = ({ mode }) => {
  const isCash = mode?.toLowerCase().includes("cash");
  const Icon = isCash ? Banknote : Landmark;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#374151] bg-[#f3f4f6] px-2.5 py-1 rounded-full">
      <Icon size={13} className="text-[#6b7280]" />
      {mode || "—"}
    </span>
  );
};

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">{label}</p>
    <p className="text-sm text-[#374151] mt-0.5">{value || "—"}</p>
  </div>
);

const VendorDetailDrawer = ({ isOpen, onClose, vendor }) => {
  if (!isOpen || !vendor) return null;

  const isSettled = vendor.totalRemaining === 0;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100]">
        <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="absolute top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">{vendor.vendorName}</h2>
              <p className="text-xs text-[#6b7280] mt-1">Vendor ID {vendor.vendorId}</p>
            </div>
            <button onClick={onClose} className="text-[#9ca3af] hover:text-[#374151]">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-[#e5e7eb] bg-[#f9fafb]">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Total invoiced</p>
              <p className="font-semibold text-[#111827] mt-0.5">
                ₹{Number(vendor.totalAmount).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Received</p>
              <p className="font-semibold text-green-600 mt-0.5">
                ₹{Number(vendor.totalReceived).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#9ca3af]">Outstanding</p>
              <p className={`font-semibold mt-0.5 ${isSettled ? "text-green-600" : "text-red-500"}`}>
                ₹{Number(vendor.totalRemaining).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">
              {vendor.payments.length} payment{vendor.payments.length !== 1 ? "s" : ""}
            </p>

            {vendor.payments.length === 0 ? (
              <div className="text-center py-10 text-[#9ca3af] text-sm">No payments recorded.</div>
            ) : (
              <div className="space-y-3">
                {vendor.payments.map((p) => {
                  const isBank = p.modeofpayment?.toLowerCase().includes("bank");
                  return (
                    <div key={p.id} className="border border-[#e5e7eb] rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                          <span className="text-primary font-medium">{p.voucherno}</span>
                          {p.voucherdate ? (
                            <span className="text-[#6b7280]">{p.voucherdate}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#9ca3af]">
                              <CalendarX2 size={12} /> No date
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-green-600">
                          +₹{Number(p.amount).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <PaymentModeBadge mode={p.modeofpayment} />
                        {p.eventId && (
                          <span className="bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded-full text-[11px] font-medium">
                            Event #{p.eventId}
                          </span>
                        )}
                        {p.isOpb && (
                          <span className="bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded-full text-[11px] font-medium">
                            Opening balance
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#f3f4f6]">
                        <DetailField label="Payment ID" value={p.id} />
                        <DetailField label="Reference ID" value={p.referenceId} />
                        {isBank ? (
                          <DetailField label="Bank ID" value={p.bankId} />
                        ) : (
                          <DetailField label="Cash ID" value={p.cashId} />
                        )}
                        <DetailField
                          label="Settlement amount"
                          value={
                            p.settlementAmount != null
                              ? `₹${Number(p.settlementAmount).toLocaleString("en-IN")}`
                              : null
                          }
                        />
                        {p.remarks && (
                          <div className="col-span-2">
                            <DetailField label="Remarks" value={p.remarks} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

const RecivePayment = ({
  vendors = [],
  loading = false,
  totalReceived = 0,
  remainingBalanced = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter((v) => v.vendorName?.toString().toLowerCase().includes(query));
  }, [searchQuery, vendors]);

  // Match EventListPage's convention: pre-render cell content as plain data values,
  // rather than passing render functions through the column definitions.
  const tableData = useMemo(
    () =>
      filteredVendors.map((vendor, index) => {
        const isSettled = vendor.totalRemaining === 0;
        return {
          sr_no: index + 1,
          vendor_name: vendor.vendorName || "Unknown vendor",
          total_amount: `₹${Number(vendor.totalAmount).toLocaleString("en-IN")}`,
          total_received: (
            <span className="font-medium text-green-600">
              ₹{Number(vendor.totalReceived).toLocaleString("en-IN")}
            </span>
          ),
          outstanding: (
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSettled ? "bg-[#dcfce7] text-green-700" : "bg-[#fee2e2] text-red-600"
              }`}
            >
              ₹{Number(vendor.totalRemaining).toLocaleString("en-IN")}
            </span>
          ),
          payments_count: vendor.payments.length,
          actions: (
            <Tooltip title="View payments">
              <button
                onClick={() => setSelectedVendor(vendor)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-blue-50 transition"
              >
                <Eye size={14} />
                View
              </button>
            </Tooltip>
          ),
        };
      }),
    [filteredVendors],
  );

 const columns = useMemo(
    () => [
      {
        accessorKey: "sr_no",
        header: "Sr No",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "vendorName",
        header: "Vendor Name",
        cell: ({ row }) => row.original.vendorName || "Unknown vendor",
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        cell: ({ row }) => `₹${Number(row.original.totalAmount).toLocaleString("en-IN")}`,
      },
      {
        accessorKey: "totalReceived",
        header: "Received",
        cell: ({ row }) => (
          <span className="font-medium text-green-600">
            ₹{Number(row.original.totalReceived).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "totalRemaining",
        header: "Outstanding",
        cell: ({ row }) => {
          const isSettled = row.original.totalRemaining === 0;
          return (
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSettled ? "bg-[#dcfce7] text-green-700" : "bg-[#fee2e2] text-red-600"
              }`}
            >
              ₹{Number(row.original.totalRemaining).toLocaleString("en-IN")}
            </span>
          );
        },
      },
      {
        accessorKey: "payments",
        header: "Payments",
        cell: ({ row }) => row.original.payments.length,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Tooltip title="View payments">
            <button
              onClick={() => setSelectedVendor(row.original)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-blue-50 transition"
            >
              <Eye size={14} />
              View
            </button>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  return (
    <Fragment>
      <div className="min-h-screen">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
              <p className="text-[13px] text-[#6b7280]">
                <FormattedMessage id="COMMON.TOTAL_RECEIVED" defaultMessage="Total Received" />
              </p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{totalReceived.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center text-green-600 text-lg">
              ↗
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
              <p className="text-[13px] text-[#6b7280]">
                <FormattedMessage id="COMMON.REMAINING_BALANCE" defaultMessage="Remaining Balance" />
              </p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{remainingBalanced.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <Wallet size={24} className={remainingBalanced === 0 ? "text-green-600" : "text-red-500"} />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
          <div className="relative w-full md:w-[300px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search by vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>
          <span className="text-xs text-[#6b7280]">
            {filteredVendors.length} of {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body text-center py-10 text-[#9ca3af]">Loading payments…</div>
          </div>
        ) : (
  <TableComponent columns={columns} data={filteredVendors} paginationSize={10} />        )}
      </div>

      <VendorDetailDrawer
        isOpen={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        vendor={selectedVendor}
      />
    </Fragment>
  );
};

export default RecivePayment;