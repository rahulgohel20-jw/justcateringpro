import { Fragment, useState, useMemo } from "react";
import {
  Search,
  Printer,
  Landmark,
  Banknote,
  CalendarX2,
  MessageSquareText,
} from "lucide-react";
import { FormattedMessage } from "react-intl";

const initials = (name) => (name || "?").trim().charAt(0).toUpperCase();

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

const PayablePayment = ({
  data = [],
  totalPayable = 0,
  remainingPayable = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;
    return data.filter(
      (row) =>
        row.accountname?.toString().toLowerCase().includes(query) ||
        row.voucherno?.toString().toLowerCase().includes(query) ||
        row.voucherdate?.toString().toLowerCase().includes(query) ||
        row.remarks?.toString().toLowerCase().includes(query),
    );
  }, [searchQuery, data]);

  return (
    <Fragment>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
              <p className="text-[13px] text-[#6b7280]">
                <FormattedMessage id="COMMON.TOTAL_PAYABLE" defaultMessage="Total Payable" />
              </p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{totalPayable.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10 bg-[#fee2e2] rounded-lg flex items-center justify-center text-red-500 text-lg">
              ↘
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
              <p className="text-[13px] text-[#6b7280]">
                <FormattedMessage id="COMMON.REMAINING_PAYABLE" defaultMessage="Remaining Payable" />
              </p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{remainingPayable.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10 bg-[#ffedd5] rounded-lg flex items-center justify-center text-orange-500 text-lg">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-b border-[#e5e7eb]">
            <div className="relative w-full md:w-[300px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search by vendor, bill # or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <span className="text-xs text-[#6b7280]">
              {filteredData.length} of {data.length} payment{data.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-[#e5e7eb]">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#f9fafb] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#92400e] flex items-center justify-center text-sm font-semibold shrink-0">
                      {initials(row.accountname)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#111827] truncate">
                        {row.accountname || "Unknown vendor"}
                      </p>
                      <p className="text-xs text-[#6b7280] mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-primary font-medium">{row.voucherno}</span>
                        <span>·</span>
                        {row.voucherdate ? (
                          <span>{row.voucherdate}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#9ca3af]">
                            <CalendarX2 size={12} /> No date
                          </span>
                        )}
                        {row.eventName && row.eventName !== "-" && (
                          <span className="bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded-full text-[11px] font-medium">
                            {row.eventName.trim()}
                          </span>
                        )}
                        {row.remarks && (
                          <span className="inline-flex items-center gap-1 text-[#9ca3af]" title={row.remarks}>
                            <MessageSquareText size={12} />
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <PaymentModeBadge mode={row.modeofpayment} />
                    <p className="font-semibold text-red-500 w-24 text-right">
                      -₹{Number(row.totals).toLocaleString("en-IN")}
                    </p>
                    {/* <div className="flex gap-3 text-[#9ca3af]">
                      <Printer size={16} className="cursor-pointer hover:text-gray-600" />
                    </div> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-14 text-center text-[#9ca3af]">
                {searchQuery ? `No results found for "${searchQuery}".` : "No records found."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default PayablePayment;