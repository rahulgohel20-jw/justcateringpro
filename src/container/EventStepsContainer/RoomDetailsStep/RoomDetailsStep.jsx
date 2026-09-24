import { useEffect, useState } from "react";
import { DatePicker, TimePicker } from "antd";
import { BedDouble, Plus, Trash2 } from "lucide-react";
import { GetAllRooms } from "@/services/apiServices";
import AddRoomModal from "../../../partials/modals/add-room/AddRoomModal";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const parseTimeValue = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const parsed = dayjs(trimmed, ["HH:mm", "HH:mm:ss"]);
      return parsed.isValid() ? parsed : null;
    }
    const parsed = dayjs(trimmed, [
      "DD/MM/YYYY hh:mm A",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYY hh:mm a",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DDTHH:mm:ss",
    ]);
    return parsed.isValid() ? parsed : null;
  }
  return dayjs.isDayjs(val) && val.isValid() ? val : null;
};

const parseDateValue = (val) => {
  if (!val) return null;
  if (typeof val === "string") {
    const trimmed = val.trim();
    const parsed = dayjs(trimmed, [
      "DD/MM/YYYY",
      "DD/MM/YYYY hh:mm A",
      "DD/MM/YYYY HH:mm",
      "YYYY-MM-DD",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DDTHH:mm:ss",
    ]);
    return parsed.isValid() ? parsed : null;
  }
  return dayjs.isDayjs(val) && val.isValid() ? val : null;
};

const createEmptyRoom = (startDate) => {
  const base = startDate
    ? dayjs(startDate, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"])
    : dayjs();
  const checkInDate = base.isValid()
    ? base.format("DD/MM/YYYY")
    : dayjs().format("DD/MM/YYYY");
  const checkOutDate = base.isValid()
    ? base.add(1, "day").format("DD/MM/YYYY")
    : dayjs().add(1, "day").format("DD/MM/YYYY");
  const checkInTime = base.isValid() ? base.format("HH:mm") : dayjs().format("HH:mm");
  const checkOutTime = base.isValid() ? base.format("HH:mm") : dayjs().format("HH:mm");

  return {
    id: Date.now() + Math.random(),
    roomId: "",
    qty: 1,
    price: "",
    bookingdate: checkInDate,
    bookingcheckoutdate: checkOutDate,
    bookingDateCheckInTime: checkInTime,
    bookingCheckOutTime: checkOutTime,
    total: 0,
    eventId: 0,
  };
};

const RoomDetailsStep = ({ formData, setFormData, eventStartDateTime }) => {
  const [roomList, setRoomList] = useState([]);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const Id = localStorage.getItem("userId");

  const fetchRooms = async () => {
    try {
      const res = await GetAllRooms(Id);
      const items = res?.data?.data["Room Details"] || res?.data || [];
      setRoomList(
        Array.isArray(items)
          ? items.map((r) => ({
              value: r.id,
              label: r.nameEnglish || `Room ${r.id}`,
              price: r.price || 0,
            }))
          : [],
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const getRoomRows = () => formData.eventRooms || [];
  const updateRoomRows = (rows) =>
    setFormData((prev) => ({ ...prev, eventRooms: rows }));

  const handleAddRoom = () =>
    updateRoomRows([...getRoomRows(), createEmptyRoom(eventStartDateTime)]);

  const handleRemoveRoom = (idx) => {
    const updated = getRoomRows().filter((_, i) => i !== idx);
    updateRoomRows(updated.length ? updated : []);
  };

  const handleRoomFieldChange = (idx, field, value) => {
    const updated = getRoomRows().map((row, i) => {
      if (i !== idx) return row;
      const newRow = { ...row, [field]: value };

      if (field === "roomId") {
        const found = roomList.find((r) => String(r.value) === String(value));
        if (found) newRow.price = found.price;
      }
      const qty = field === "qty" ? Number(value) : Number(newRow.qty) || 0;
      const price = field === "price" ? Number(value) : Number(newRow.price) || 0;
      newRow.total = qty * price;
      return newRow;
    });
    updateRoomRows(updated);
  };

  const roomRows = getRoomRows();

  return (
    <div className="card min-w-full">
      <div className="flex flex-col flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2 p-4">
          <div className="flex items-center gap-2">
            <BedDouble className="text-primary" />
            <p className="text-base font-medium text-gray-900">Room Details</p>
          </div>
          <button
            type="button"
            onClick={handleAddRoom}
            className="btn btn-primary btn-sm flex items-center gap-1"
          >
            <Plus size={14} /> Add Room
          </button>
        </div>

        <div className="border-t border-gray-200">
          {roomRows.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No rooms added. Click "Add Room" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        Room
                        <button
                          type="button"
                          onClick={() => setIsAddRoomModalOpen(true)}
                          className="btn btn-primary flex items-center justify-center rounded-full p-0 w-5 h-5"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 min-w-[140px]">Check-in Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700 min-w-[120px]">Check-in Time</th>
                    <th className="text-left p-3 font-semibold text-gray-700 min-w-[140px]">Check-out Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700 min-w-[120px]">Check-out Time</th>
                    <th className="text-left p-3 font-semibold text-gray-700 w-[90px]">Qty</th>
                    <th className="text-left p-3 font-semibold text-gray-700 w-[110px]">Price</th>
                    <th className="text-left p-3 font-semibold text-gray-700 w-[110px]">Total</th>
                    <th className="p-3 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {roomRows.map((row, idx) => (
                    <tr key={row.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2">
                        <select
                          className="select w-full"
                          value={row.roomId || ""}
                          onChange={(e) => handleRoomFieldChange(idx, "roomId", e.target.value)}
                        >
                          <option value="">— Select Room —</option>
                          {roomList.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </td>
                      {/* Check-In Date */}
                      <td className="p-2">
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={parseDateValue(row.bookingdate)}
                          onChange={(date) =>
                            handleRoomFieldChange(
                              idx,
                              "bookingdate",
                              date ? date.format("DD/MM/YYYY") : "",
                            )
                          }
                          className="w-full"
                          placeholder="DD/MM/YYYY"
                        />
                      </td>
                      {/* Check-In Time (24h) */}
                      <td className="p-2">
                        <TimePicker
                          format="HH:mm"
                          value={parseTimeValue(row.bookingDateCheckInTime)}
                          onChange={(time) =>
                            handleRoomFieldChange(
                              idx,
                              "bookingDateCheckInTime",
                              time ? time.format("HH:mm") : "",
                            )
                          }
                          className="w-full"
                          placeholder="HH:mm"
                        />
                      </td>
                      {/* Check-Out Date */}
                      <td className="p-2">
                        <DatePicker
                          format="DD/MM/YYYY"
                          value={parseDateValue(row.bookingcheckoutdate)}
                          onChange={(date) =>
                            handleRoomFieldChange(
                              idx,
                              "bookingcheckoutdate",
                              date ? date.format("DD/MM/YYYY") : "",
                            )
                          }
                          className="w-full"
                          placeholder="DD/MM/YYYY"
                          disabledDate={(current) => {
                            const checkInVal = parseDateValue(row.bookingdate);
                            if (!checkInVal) return false;
                            return current && current.isBefore(checkInVal, "day");
                          }}
                        />
                      </td>
                      {/* Check-Out Time (24h) */}
                      <td className="p-2">
                        <TimePicker
                          format="HH:mm"
                          value={parseTimeValue(row.bookingCheckOutTime)}
                          onChange={(time) =>
                            handleRoomFieldChange(
                              idx,
                              "bookingCheckOutTime",
                              time ? time.format("HH:mm") : "",
                            )
                          }
                          className="w-full"
                          placeholder="HH:mm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="tel" min={1} className="input w-full text-center"
                          value={row.qty}
                          onChange={(e) => handleRoomFieldChange(idx, "qty", e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="tel" min={0} className="input w-full text-right"
                          value={row.price}
                          onChange={(e) => handleRoomFieldChange(idx, "price", e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="tel" readOnly
                          className="input w-full text-right bg-gray-50 cursor-not-allowed"
                          value={row.total || 0}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRoom(idx)}
                          className="btn btn-sm btn-icon btn-clear btn-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {roomRows.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={5} className="p-3 text-right text-sm font-semibold text-gray-700">
                        Grand Total
                      </td>
                      <td className="p-3 text-right text-sm font-bold text-gray-900">
                        {roomRows.reduce((sum, r) => sum + (Number(r.total) || 0), 0)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        roomData={null}
        refreshData={() => { fetchRooms(); setIsAddRoomModalOpen(false); }}
      />
    </div>
  );
};

export default RoomDetailsStep;