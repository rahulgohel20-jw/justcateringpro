import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toAbsoluteUrl } from "@/utils";
import { GetAllVendorPayment } from "@/services/apiServices";
import VendorPayment from "./VendorPayment";
const AllVendor = ({ isOpen, onClose, eventId }) => {
  const [isLabourOpen, setIsLabourOpen] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [vendorcost, setVendorCost] = useState(0);
  const [paidamount, setPaidAmount] = useState(0);
  const [pendingAmt, setPendingAmt] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [event, setEvent] = useState(null);
  const recordsPerPage = 10;

  const fetchVendordata = async () => {
    try {
      const islabour = false;
      const res = await GetAllVendorPayment(eventId, islabour);
      const data = res.data.data["Vendor Payments Details"] || [];
     

      let vendorcost = data.totalAmt || 0;
      setVendorCost(vendorcost);
      let Paid_amount = data.paidAmt || 0;
      setPaidAmount(Paid_amount);
      let pending = data.pendingAmt || 0;
      setPendingAmt(pending);
      let eventName = data.eventName || "";
      setEvent(eventName);

      const labourData = data.vendorsPayment.map((item) => ({
        id: item + 1,
        vendorId: item.vendorId,
        category: item.vendorCategory,
        vendor: item.vendorName,
        total: item.totalAmt,
        paid: item.paidAmt,
        pending: item.pendingAmt,
      }));
      setVendorData(labourData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      fetchVendordata();
    }
  }, [isOpen, eventId]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(vendorData.length / recordsPerPage);

  const paginatedData = vendorData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="absolute inset-0 pointer-events-none flex items-start justify-end p-3 sm:p-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[1280px] h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="p-5 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Vendor Payments
                  </h2>
                  <p className="text-sm text-gray-500">
                    Manage and track all outstanding Vendor payments.
                  </p>
                </div>
                <div className="cursor-pointer" onClick={onClose}>
                  <i class="ki-filled ki-cross text-xl"></i>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total */}
                  <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg text-xl">
                      <img
                        src={toAbsoluteUrl("/media/icons/labour.png")}
                        className=" max-h-[130px]"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Vendor Cost</p>
                      <p className="font-semibold text-lg">₹ {vendorcost}</p>
                    </div>
                  </div>

                  {/* Paid */}
                  <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 bg-green-100 text-green-600 flex items-center justify-center rounded-lg text-xl">
                      <img
                        src={toAbsoluteUrl("/media/icons/money.png")}
                        className=" max-h-[120px]"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid Amount</p>
                      <p className="font-semibold text-lg">₹ {paidamount}</p>
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="bg-white border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 bg-red-100 text-red-600 flex items-center justify-center rounded-lg text-xl">
                      <img
                        src={toAbsoluteUrl("/media/icons/pending.png")}
                        className=" max-h-[130px]"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Amount</p>
                      <p className="font-semibold text-lg">₹ {pendingAmt}</p>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      {/* Head */}
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-center">
                            Vendor Category
                          </th>
                          <th className="px-4 py-3 text-center">Vendor Name</th>

                          <th className="px-4 py-3 text-center">
                            Total Amount
                          </th>
                          <th className="px-4 py-3 text-center">Paid Amount</th>
                          <th className="px-4 py-3 text-center">Pending</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.vendor}
                            </td>

                            <td className="px-4 py-3 text-center">
                              ₹ {item.total}/-
                            </td>
                            <td className="px-4 py-3 text-center">
                              ₹ {item.paid}/-
                            </td>

                            <td className="px-4 py-3 text-center text-red-600 font-semibold">
                              ₹ {item.pending}/-
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedVendor(item);
                                  setIsLabourOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg
                                        bg-green-600 text-white hover:bg-green-700"
                              >
                                Pay Now
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t text-sm text-gray-500">
                    <span>
                      Showing {(currentPage - 1) * recordsPerPage + 1}–
                      {Math.min(
                        currentPage * recordsPerPage,
                        vendorData.length,
                      )}{" "}
                      of {vendorData.length} vendors
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="w-8 h-8 border rounded-md flex items-center justify-center
                disabled:opacity-40 hover:bg-gray-100"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-md text-sm font-medium
            ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "border hover:bg-gray-100"
            }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="w-8 h-8 border rounded-md flex items-center justify-center
                disabled:opacity-40 hover:bg-gray-100"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <VendorPayment
                isOpen={isLabourOpen}
                onClose={() => setIsLabourOpen(false)}
                vendor={selectedVendor}
                event={event}
                eventId={eventId}
                onSaveSuccess={fetchVendordata}
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AllVendor;
