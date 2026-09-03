import { motion, AnimatePresence } from "framer-motion";

export default function ViewLeadDetailModal({ open, onClose, data }) {
  const safeData = data || {};

  const {
    clientName = "",
    leadCode = "",
    leadType = "",
    leadAssignName = "",
    planName = "",
    leadStatus = "",
    followUpDetails = [],
  } = safeData;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-start justify-center mt-20 p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-[700px] max-w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between">
                <h2 className="text-xl font-semibold">View Details</h2>
                <button onClick={onClose}>✕</button>
              </div>

              {/* Lead Details */}
              <div className="p-6 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="font-semibold">Client Name</p>
                  <p>{clientName}</p>
                </div>

                <div>
                  <p className="font-semibold">Lead Code</p>
                  <p>{leadCode}</p>
                </div>

                <div>
                  <p className="font-semibold">Lead Type</p>
                  <p>{leadType}</p>
                </div>

                <div>
                  <p className="font-semibold">Lead Assign</p>
                  <p>{leadAssignName}</p>
                </div>

                <div>
                  <p className="font-semibold">Product Type</p>
                  <p>{planName}</p>
                </div>

                <div>
                  <p className="font-semibold">Lead Status</p>
                  <p>{leadStatus}</p>
                </div>
              </div>

              {/* Follow-up Table */}
              <div className="px-6 pb-6">
                <h3 className="text-md font-semibold mb-3">Follow-up</h3>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2">Client Name</th>
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Created At</th>
                      <th className="pb-2">Reminder Date</th>
                      <th className="pb-2">Call Type</th>
                    </tr>
                  </thead>

                  <tbody>
                    {followUpDetails.length > 0 ? (
                      followUpDetails.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td>{clientName}</td>

                          {/* ✅ MEMBER NAME ENGLISH */}
                          <td>{item.memberNameEnglish || "N/A"}</td>

                          <td>{item.createdAt || "-"}</td>
                          <td>{item.followUpDate || "-"}</td>

                          <td>{item.followUpType || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No Follow-ups found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
