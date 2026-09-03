import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toAbsoluteUrl } from "@/utils";
import { AddCheckList } from "@/services/apiServices";
import Swal from "sweetalert2";
import { Save, Upload } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const initialEntries = [
  {
    id: 1,
    category: "Electrical Components",
    vendor: "Global Circuits Inc.",
    receivedDate: "Oct 24, 2023 & 10:00 AM",
    totalQty: 1200,
    qty: 450,
    status: true,
    inTime: "09:00 AM",
    outTime: "05:00 PM",
    photos: [],
  },
  {
    id: 2,
    category: "Electrical Components",
    vendor: "Global Circuits Inc.",
    receivedDate: "Oct 24, 2023 & 10:00 AM",
    totalQty: 1200,
    qty: 450,
    status: true,
    inTime: "09:00 AM",
    outTime: "05:00 PM",
    photos: [],
  },
  {
    id: 3,
    category: "Electrical Components",
    vendor: "Global Circuits Inc.",
    receivedDate: "Oct 24, 2023 & 10:00 AM",
    totalQty: 1200,
    qty: 450,
    status: false,
    inTime: "09:00 AM",
    outTime: "05:00 PM",
    photos: [],
  },
  {
    id: 4,
    category: "Electrical Components",
    vendor: "Global Circuits Inc.",
    receivedDate: "Oct 24, 2023 & 10:00 AM",
    totalQty: 1200,
    qty: 450,
    status: false,
    inTime: "09:00 AM",
    outTime: "05:00 PM",
    photos: [],
  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
      style={{ minWidth: 44 }}
    >
      <span
        className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5.5L4 7.5L8 3"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

function PhotoThumb({ src }) {
  return (
    <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
      <img
        src={src}
        alt="thumb"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function ChecklistEntry({ entry, onUpdate }) {
  const fileRef = useRef();

 const handleFileChange = (e) => {
  const files = Array.from(e.target.files);

  const newPhotos = files.map((f) => ({
    file: f, 
    preview: URL.createObjectURL(f),
    id: 0,
  }));

  onUpdate({
    ...entry,
    photos: [...entry.photos, ...newPhotos],
  });
};

const parseTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;

  try {
    const [time, modifier] = timeStr.split(" ");
    if (!time || !modifier) return null;

    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    const date = new Date(`1970-01-01T${hours}:${minutes}:00`);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

  return (
    <div
      className="bg-white rounded-2xl mb-4"
      style={{
        border: "1px solid #E8ECF0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        padding: "20px 24px 16px",
      }}
    >
      {/* Top info row */}
      <div className="flex flex-wrap gap-y-3 gap-x-6 mb-1">
        <div className="flex gap-3 items-center">
          <p className="text-[13px] ">Category</p>
          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            {entry.category}
          </p>
        </div>
        <div className="flex  gap-3 items-center">
          <p className="text-[13px] ">Vendor</p>
          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            {entry.vendor}
          </p>
        </div>
        <div className="flex  gap-3 items-center">
          <p className="text-[13px] ">Received Date &amp; Time</p>
          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            {entry.receivedDate}
          </p>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        {/* Total QTY */}
        <div>
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase mb-1.5">
            Total QTY
          </label>
          <input
            type="tel"
            disabled={!entry.isEditable}
            value={entry.totalQty}
            onChange={(e) => onUpdate({ ...entry, totalQty: e.target.value })}
            className="w-[76px] text-[13px] font-semibold text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border-none"
            style={{ background: "#F1F5F9" }}
          />
        </div>

        {/* QTY */}
        <div>
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase mb-1.5">
            QTY
          </label>
          <input
            type="tel"
            disabled={!entry.isEditable}
            value={entry.qty}
            onChange={(e) => onUpdate({ ...entry, qty: e.target.value })}
            className="w-[76px] text-[13px] font-semibold text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 border-none"
            style={{ background: "#F1F5F9" }}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase ">
            Status
          </label>
          <div className="flex items-center" style={{ height: 47 }}>
            <Toggle
              checked={entry.status}
              onChange={(val) =>
                entry.isEditable && onUpdate({ ...entry, status: val })
              }
            />
          </div>
        </div>

        {/* In Time */}
        <div>
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase mb-1.5">
            In Time
          </label>
         <DatePicker
         disabled={!entry.isEditable}
  selected={parseTime(entry.inTime)}
  onChange={(date) =>
    onUpdate({
      ...entry,
      inTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    })
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={5}
  dateFormat="hh:mm aa"
  placeholderText="Select time"
  className="w-[110px] text-[13px] font-semibold text-gray-800 rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
  isClearable

/>
        </div>

        {/* Out Time */}
        <div>
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase mb-1.5">
            Out Time
          </label>
          <DatePicker
          disabled={!entry.isEditable}
  selected={parseTime(entry.outTime)}
  onChange={(date) =>
    onUpdate({
      ...entry,
      outTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    })
  }
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={5}
  dateFormat="hh:mm aa"
  placeholderText="Select time"
  className="w-[110px] text-[13px] font-semibold text-gray-800 rounded-lg px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
  isClearable

/>
        </div>

        <div>
  <label className="block text-[9px] font-bold tracking-widest text-gray uppercase">
    Lock
  </label>

  <div className="flex items-center" style={{ height: 47 }}>
    <Toggle
      checked={!entry.isEditable} 
      onChange={(val) =>
        onUpdate({
          ...entry,
          isEditable: !val,
        })
      }
    />
  </div>
</div>

        {/* Photos – pushed to end */}
        <div className="ml-auto">
          <label className="block text-[9px] font-bold tracking-widest text-gray uppercase mb-1.5 opacity-0 select-none">
            P
          </label>
          <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={!entry.isEditable}
                onClick={() => entry.isEditable && fileRef.current.click()}
                className={`flex items-center gap-1.5 text-[12px] font-semibold rounded-lg px-2.5 py-2 
                  ${entry.isEditable ? "text-primary hover:text-blue-600" : "text-gray-400 cursor-not-allowed"}
                `}
              >
              <Upload size={16} />
              Add Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {entry.photos.slice(0, 2).map((p, i) => (
  <PhotoThumb key={i} src={p.preview || p.file} />
))}
            {entry.photos.length === 0 && (
              <>
                <PhotoThumb />
                <PhotoThumb />
              </>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default function Checklist({ open, onClose, eventId, checklistData = [] }) {
 const [localChecklist, setLocalChecklist] = useState([]);
 

useEffect(() => {
  setLocalChecklist(checklistData ?? []);
}, [checklistData]);




  const formattedChecklist = localChecklist.map((shift) => {
  const total = shift.eventLabourCheckLists.reduce(
    (sum, item) => sum + (item.totalQty || 0),
    0
  );

  const arrived = shift.eventLabourCheckLists.reduce(
    (sum, item) => sum + (item.inQty || 0),
    0
  );

  const isCompleted = shift.eventLabourCheckLists.every(
    (item) => item.isStatus === true
  );

  return {
    shiftName: shift.shiftName,
    total,
    arrived,
    isCompleted,
    items: shift.eventLabourCheckLists,
  };

});


const handleUpdateItem = (shiftIndex, itemIndex, updatedItem) => {
  setLocalChecklist((prev) => {
    const updated = [...prev];

    updated[shiftIndex] = {
      ...updated[shiftIndex],
      eventLabourCheckLists: [...updated[shiftIndex].eventLabourCheckLists],
    };

    updated[shiftIndex].eventLabourCheckLists[itemIndex] = {
      ...updated[shiftIndex].eventLabourCheckLists[itemIndex],
      ...updatedItem,
    };

    return updated;
  });
};

const userId = localStorage.getItem("userId") ;




const handleSaveChecklist = async () => {
  try {
    const formData = new FormData();

    formData.append("userId", userId ); 

    let index = 0;

    localChecklist.forEach((shift) => {
      shift.eventLabourCheckLists.forEach((item) => {
        
        // 🔹 Basic fields
        formData.append(`labourCheckList[${index}].id`, item.id || -1);
        formData.append(`labourCheckList[${index}].eventId`, item.eventId);
        formData.append(`labourCheckList[${index}].eventFunctionId`, item.eventFunctionId);
        formData.append(`labourCheckList[${index}].contactCatId`, item.contactCatId);
        formData.append(`labourCheckList[${index}].vendorId`, item.vendorId);
        formData.append(`labourCheckList[${index}].shiftId`, item.shiftId);

        formData.append(`labourCheckList[${index}].totalQty`, item.totalQty);
        formData.append(`labourCheckList[${index}].inQty`, item.inQty);
        formData.append(`labourCheckList[${index}].isStatus`, item.isStatus);

        formData.append(`labourCheckList[${index}].inTime`, item.inTime);
        formData.append(`labourCheckList[${index}].outTime`, item.outTime);
        formData.append(`labourCheckList[${index}].labordatetime`, item.labordatetime);

        formData.append(
          `labourCheckList[${index}].isEditable`,
          item.isEditable ?? true
        );

       
        (item.files || []).forEach((fileObj, fileIndex) => {
          if (fileObj?.file instanceof File) {
            formData.append(
              `labourCheckList[${index}].files[${fileIndex}].file`,
              fileObj.file
            );
          }

          formData.append(
            `labourCheckList[${index}].files[${fileIndex}].id`,
            fileObj.id || -1
          );
        });

        index++;
      });
    });

   
    Swal.fire({
      title: "Saving...",
      text: "Please wait while we save checklist",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await AddCheckList(formData);

    
    Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Checklist saved successfully",
      timer: 2000,
      showConfirmButton: false,
    });

    onClose();

  } catch (error) {
    console.error(error);

  
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save checklist",
    });
  }
};

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Sliding panel */}
          <motion.div
            className="absolute top-0 right-0 bottom-0 flex flex-col"
            style={{
              width: "900px",
              background: "#F4F6F8",
              boxShadow: "-6px 0 40px rgba(0,0,0,0.14)",
            }}
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-[18px] bg-white flex-shrink-0"
              style={{ borderBottom: "1px solid #E8ECF0" }}
            >
              <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                Checklist
              </h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path
                    d="M11.5 3.5l-8 8M3.5 3.5l8 8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
  {formattedChecklist.length === 0 ? (
    <div className="text-center text-gray-500 py-6">
      No checklist data found
    </div>
  ) : (
    formattedChecklist.map((shift, index) => (
      <div key={index} className="mb-5">
        
        {/* SHIFT HEADER */}
        <div className="flex justify-between items-center mb-2 px-2">
          <h3 className="text-md font-semibold text-gray-800">
            {shift.shiftName}
          </h3>

          <div className="flex gap-2 items-center">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {shift.arrived} / {shift.total}
            </span>

            {shift.isCompleted && (
              <span className="text-green-600 text-xs font-semibold">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* ENTRIES */}
        {shift.items.map((item, i) => (
          <ChecklistEntry
            key={`${index}-${i}`}
            entry={{
              id: item.id || `${index}-${i}`,
              category: item.contactCatName,
              vendor: item.vendorName,
              receivedDate: item.labordatetime,
              totalQty: item.totalQty,
              qty: item.inQty,
              status: item.isStatus,
              inTime: item.inTime,
              outTime: item.outTime,
              photos: item.files || [],
              isEditable: item.isEditable ?? true,
            }}
            onUpdate={(updated) => {
            handleUpdateItem(index, i, {
              inQty: updated.qty,
              totalQty: updated.totalQty,
              isStatus: updated.status,
              inTime: updated.inTime,
              outTime: updated.outTime,
              isEditable: updated.isEditable,
              files: updated.photos.map((p) => ({
              file: p.file || p, 
              id: p.id || 0,
            }))
            });
          }}
          />
        ))}
      </div>
    ))
  )}
</div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 bg-white flex-shrink-0"
              style={{ borderTop: "1px solid #E8ECF0" }}
            >
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-[13px] font-semibold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex bg-primary hover:bg-blue-700 items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-95"
           onClick={handleSaveChecklist}
                
              >
                <Save size={16} />
                Save All Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
