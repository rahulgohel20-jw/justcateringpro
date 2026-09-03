import { useState } from "react";

const OrderDetail = () => {
  const details = {
    customerName: "AKSHAY BHAI PBN",
    mobileNumber: "8000217871",
    eventType: "get to gather",
    eventDate: "30/07/2025",
    venue: "LA GANESHA FARM, CANAL ROAD",
  };

  const [form, setForm] = useState({
    functionName: "DINNER",
    date: "2025-07-30T18:00",
    person: 400,
    extra: 0,
    rate: 0,
    amount: 0,
    tax: "",
    discount: 0,
    roundOff: 0,
    advance: 0,
    note: "",
  });

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700">
        Order Details
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-y-9 gap-x-20 text-sm">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-600">Customer Name:</span>{" "}
            <span className="text-gray-900">{details.customerName}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Event Type:</span>{" "}
            <span className="text-gray-900">{details.eventType}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Venue:</span>{" "}
            <span className="text-gray-900">{details.venue}</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-600">Mobile Number:</span>{" "}
            <span className="text-gray-900">{details.mobileNumber}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Event Date:</span>{" "}
            <span className="text-gray-900">{details.eventDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-28">
              Estimate Date
            </label>
            <input
              type="date"
              value={form.date ? form.date.split("T")[0] : ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* Column 3 → Buttons */}
        <div className="flex flex-col items-end justify-start gap-3">
          <button className="btn btn-primary px-4 py-2   rounded-md shadow w-28">
            <i className="ki-filled ki-"></i> Clone to Invoice
          </button>
          <button className="btn btn-primary px-4 py-2   rounded-md shadow w-28">
            <i className="ki-filled ki-printer"></i> Print
          </button>
          <button className="btn btn-primary px-4 py-2   rounded-md shadow w-28">
            <i className="ki-filled ki-printer"></i> Print
          </button>
          <button className="btn btn-primary px-4 py-2  rounded-md shadow w-28">
            <i className="ki-filled ki-share"></i> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
