import { Fragment, useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Printer,
  Trash2,
  Wallet,
} from "lucide-react";
import { FormattedMessage } from "react-intl"
const RecivePayment = ({
  data = [],
  totalReceived = 0,
  remainingBalanced = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;
    return data.filter(
      (row) =>
        row.accountname?.toString().toLowerCase().includes(query) ||
        row.voucherno?.toString().toLowerCase().includes(query) ||
        row.voucherdate?.toString().toLowerCase().includes(query),
    );
  }, [searchQuery, data]);
  return (
    <Fragment>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          {/* Total Received */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
            <p className="text-[13px] text-[#6b7280]">
  <FormattedMessage
    id="COMMON.TOTAL_RECEIVED"
    defaultMessage="Total Received"
  />
</p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{totalReceived.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10 bg-[#dcfce7] rounded-lg flex items-center justify-center text-green-600 text-lg">
              ↗
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl px-6 py-5 flex justify-between">
            <div>
            <p className="text-[13px] text-[#6b7280]">
  <FormattedMessage
    id="COMMON.REMAINING_BALANCE"
    defaultMessage="Remaining Balance"
  />
</p>
              <h2 className="text-[26px] font-semibold text-[#111827] mt-2">
                ₹{remainingBalanced.toLocaleString("en-IN")}
              </h2>
            </div>
            <div className="w-10 h-10  rounded-lg flex items-center justify-center text-orange-500 text-lg">
              <Wallet
  size={24  }
  className={remainingBalanced >= 0 ? "text-green-600" : "text-red-500"}
/>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-b border-[#e5e7eb]">
            <div className="relative w-full md:w-[260px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
              />
              <input
                type="text"
                placeholder="Search by Vendor Name, Bill #, Date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm border border-[#e5e7eb] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <tr className="text-[11px] text-[#6b7280] uppercase tracking-wide">
                <th className="px-5 py-3 text-left">
  <FormattedMessage
    id="COMMON.SR_NO"
    defaultMessage="SR NO"
  />
</th>

<th className="px-5 py-3 text-left">
  <FormattedMessage
    id="COMMON.VENDOR_NAME"
    defaultMessage="Vendor Name"
  />
</th>

<th className="px-5 py-3 text-left">
  <FormattedMessage
    id="COMMON.MODE_OF_PAYMENT"
    defaultMessage="Mode of Payment"
  />
</th>

<th className="px-5 py-3 text-left">
  <FormattedMessage
    id="COMMON.DATE"
    defaultMessage="Date"
  />
</th>

<th className="px-5 py-3 text-left">
  <FormattedMessage
    id="COMMON.BILL_NO"
    defaultMessage="Bill #"
  />
</th>

<th className="px-5 py-3 text-right">
  <FormattedMessage
    id="COMMON.RECEIVED_AMOUNT"
    defaultMessage="Received Amount"
  />
</th>

<th className="px-5 py-3 text-center">
  <FormattedMessage
    id="COMMON.ACTIONS"
    defaultMessage="Actions"
  />
</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {data.length > 0 ? (
                  data.map((row, i) => (
                    <tr key={i} className="hover:bg-[#f9fafb]">
                      <td className="px-5 py-[14px] text-[#374151]">
                        {row.id}
                      </td>
                      <td className="px-5 py-[14px] text-[#374151]">
                        {row.accountname}
                      </td>
                      <td className="px-5 py-[14px] text-[#374151]">
                        {row.modeofpayment}
                      </td>
                      <td className="px-5 py-[14px] text-[#374151]">
                        {row.voucherdate}
                      </td>
                      <td className="px-5 py-[14px] text-primary font-medium">
                        {row.voucherno}
                      </td>
                      <td className="px-5 py-[14px] text-right font-medium text-[#111827]">
                        ₹{Number(row.total).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-[14px]">
                        <div className="flex justify-center gap-3 text-[#9ca3af]">
                          <Printer
                            size={16}
                            className="cursor-pointer hover:text-gray-600"
                          />
                          <Trash2
                            size={16}
                            className="cursor-pointer hover:text-red-500"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-[#9ca3af]"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-[#e5e7eb] text-sm text-[#6b7280]">
            <p>
              Showing 1 to {data.length} of {data.length} results
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-[#e5e7eb] rounded text-sm">
                Previous
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-[#e5e7eb] rounded text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RecivePayment;
