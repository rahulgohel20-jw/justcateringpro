import { useState } from "react";

const data = [
  {
    id: 1,
    category: "Logistics",
    vendorName: "AeroSwift Agencies",
    dateTime: "Oct 24, 2023 • 08:30 AM",
    shift: "Morning Alpha",
    quantity: "1,240",
    rate: "$15.00/hr",
    totalPrice: "$18,600",
  },
  {
    id: 2,
    category: "Security",
    vendorName: "Sentinel Guard Group",
    dateTime: "Oct 24, 2023 • 09:15 AM",
    shift: "General 1",
    quantity: "850",
    rate: "$18.50/hr",
    totalPrice: "$15,725",
  },
  {
    id: 3,
    category: "Hospitality",
    vendorName: "Elite Staffing Pro",
    dateTime: "Oct 24, 2023 • 11:00 AM",
    shift: "Mid-Day Peak",
    quantity: "2,100",
    rate: "$22.00/hr",
    totalPrice: "$46,200",
  },
  {
    id: 4,
    category: "Technical",
    vendorName: "BlueStream Media",
    dateTime: "Oct 24, 2023 • 01:45 PM",
    shift: "Technical Overlap",
    quantity: "420",
    rate: "$45.00/hr",
    totalPrice: "$18,900",
  },
  {
    id: 5,
    category: "Maintenance",
    vendorName: "Prime Clean Services",
    dateTime: "Oct 24, 2023 • 04:00 PM",
    shift: "Evening Refresh",
    quantity: "1,150",
    rate: "$12.50/hr",
    totalPrice: "$14,375",
  },
  {
    id: 6,
    category: "Logistics",
    vendorName: "Global Freight Partners",
    dateTime: "Oct 25, 2023 • 06:00 AM",
    shift: "Early Load",
    quantity: "3,400",
    rate: "$14.00/hr",
    totalPrice: "$47,600",
  },
];

const categoryStyles = {
  Logistics: "bg-blue-100 text-blue-700",
  Security: "bg-slate-200 text-slate-600",
  Hospitality: "bg-yellow-100 text-yellow-700",
  Technical: "bg-violet-100 text-violet-700",
  Maintenance: "bg-emerald-100 text-emerald-700",
};

export default function AgencyAllocation() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="">
      <div className="w-full  bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            {/* Header */}
            <thead>
             <tr className="bg-slate-50 border-b border-slate-200">
  {[
    {
      label: <FormattedMessage id="COMMON.CATEGORY" defaultMessage="Category" />,
      align: "left",
    },
    {
      label: <FormattedMessage id="COMMON.VENDOR_NAME" defaultMessage="Vendor Name" />,
      align: "left",
    },
    {
      label: <FormattedMessage id="AGENCY.DATE_AND_TIME" defaultMessage="Date & Time" />,
      align: "left",
    },
    {
      label: <FormattedMessage id="COMMON.SHIFT" defaultMessage="Shift" />,
      align: "left",
    },
    {
      label: <FormattedMessage id="COMMON.QUANTITY" defaultMessage="Quantity" />,
      align: "right",
    },
    {
      label: <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />,
      align: "right",
    },
    {
      label: (
        <>
          <FormattedMessage id="COMMON.TOTAL" defaultMessage="Total" />
          <br />
          <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
        </>
      ),
      align: "right",
    },
  ].map((col, i) => (
    <th
      key={i}
      className={`px-5 py-3.5 text-[11px] font-semibold tracking-widest uppercase text-slate-400 whitespace-nowrap ${
        col.align === "right" ? "text-right" : "text-left"
      }`}
    >
      {col.label}
    </th>
  ))}
</tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors duration-100 ${
                    idx === data.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Category */}
                  <td className="px-5 py-[18px] align-middle">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        categoryStyles[row.category] ??
                        "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>

                  {/* Vendor Name */}
                  <td className="px-5 py-[18px] align-middle">
                    <span className="font-semibold text-slate-800 text-sm">
                      {row.vendorName}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="px-5 py-[18px] align-middle">
                    <span className="text-slate-500 text-[13px]">
                      {row.dateTime}
                    </span>
                  </td>

                  {/* Shift */}
                  <td className="px-5 py-[18px] align-middle">
                    <span className="text-slate-500 text-[13px]">
                      {row.shift}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td className="px-5 py-[18px] align-middle text-right">
                    <span className="font-bold text-primary text-[15px]">
                      {row.quantity}
                    </span>
                  </td>

                  {/* Rate */}
                  <td className="px-5 py-[18px] align-middle text-right">
                    <span className="text-slate-500 text-[13px]">
                      {row.rate}
                    </span>
                  </td>

                  {/* Total Price */}
                  <td className="px-5 py-[18px] align-middle text-right">
                    <span className="font-bold text-primary text-[15px]">
                      {row.totalPrice}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-[13px] text-slate-400">
            Showing 6 of 142 Agency Allocations
          </span>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-lg leading-none"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                  currentPage === p
                    ? "bg-blue-800 text-white font-bold"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors text-lg leading-none"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
