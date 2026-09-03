import { CustomModal } from "@/components/custom-modal/CustomModal";

const RoomDetailsModal = ({ isOpen, onClose, eventRooms = [] }) => {
  const total = eventRooms.reduce((sum, r) => sum + (r.total || 0), 0);

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title="Room Details"
      width={750}
    >
      {eventRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <i className="ki-filled ki-home text-4xl mb-3"></i>
          <p className="text-sm font-medium">No room details available for this event</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="p-3 border-b border-gray-200">#</th>
                <th className="p-3 border-b border-gray-200">Room Name</th>
                <th className="p-3 border-b border-gray-200">Check In</th>
                <th className="p-3 border-b border-gray-200">Check Out</th>
                <th className="p-3 border-b border-gray-200 text-center">Qty</th>
                <th className="p-3 border-b border-gray-200 text-right">Price (₹)</th>
                <th className="p-3 border-b border-gray-200 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {eventRooms.map((room, idx) => (
                <tr key={room.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border-b border-gray-100 text-gray-500">{idx + 1}</td>
                  <td className="p-3 border-b border-gray-100 font-medium">
                    {room.roomNameEnglish || "—"}
                  </td>
                  <td className="p-3 border-b border-gray-100">{room.bookingdate || "—"}</td>
                  <td className="p-3 border-b border-gray-100">{room.bookingcheckoutdate || "—"}</td>
                  <td className="p-3 border-b border-gray-100 text-center">{room.qty ?? "—"}</td>
                  <td className="p-3 border-b border-gray-100 text-right">{room.price ?? "—"}</td>
                  <td className="p-3 border-b border-gray-100 text-right font-semibold">
                    {room.total ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={6} className="p-3 text-right text-gray-700">
                  Grand Total
                </td>
                <td className="p-3 text-right text-primary">₹{total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </CustomModal>
  );
};

export default RoomDetailsModal;