import { useEffect, useState, useCallback, useRef } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Button, Input, Tooltip } from "antd";
import ReactSelect from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { Plus, Trash2, MapPin, X } from "lucide-react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import FunctionTypeDropdown from "@/components/dropdowns/FunctionTypeDropdown";
import AddNotes from "@/partials/modals/add-notes/AddNotes";
import {
  GetEventMasterById,
  GetAllFunctionsByUserId,
  GetAllBanquet,
  GetCustomPackageapi,
  AvailabilityCheck,
  getpriceininfunctionadd,
  UpdateEventPax,
  Translateapi,
} from "@/services/apiServices";

// ─────────────────────────────────────────────────────────────────────────
// BanquetSelect — compact multi-select for banquet halls
// ─────────────────────────────────────────────────────────────────────────
const BanquetSelect = ({ value, options, onChange }) => {
  const selectedValues = (Array.isArray(value) ? value : value ? [value] : [])
    .map((id) => {
      const found = options.find((b) => String(b.value) === String(id));
      return found ? { value: String(found.value), label: found.label } : null;
    })
    .filter(Boolean);

  return (
    <ReactSelect
      isMulti
      options={options.map((opt) => ({ value: String(opt.value), label: opt.label }))}
      value={selectedValues}
      onChange={(selected) => onChange((selected || []).map((s) => s.value))}
      placeholder="Select Hall(s)"
      menuPortalTarget={document.body}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      controlShouldRenderValue={false}
      styles={{
        control: (base) => ({
          ...base,
          minHeight: "34px",
          fontSize: "12px",
          borderColor: "#d1d5db",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "none",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, fontSize: "12px" }),
        placeholder: (base) => ({ ...base, fontSize: "12px", color: "#9ca3af" }),
        indicatorSeparator: () => ({ display: "none" }),
      }}
      components={{
        ValueContainer: ({ children, getValue }) => {
          const selected = getValue();
          return (
            <div style={{ display: "flex", alignItems: "center", padding: "2px 8px", flex: 1 }}>
              {selected.length === 0 ? (
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>Select Hall(s)</span>
              ) : (
                <span style={{ color: "#005BA8", fontSize: "12px", fontWeight: 600 }}>
                  {selected.length === 1 ? selected[0].label : `${selected.length} halls selected`}
                </span>
              )}
              {children[children.length - 1]}
            </div>
          );
        },
      }}
    />
  );
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parsed = dayjs(dateStr, "DD/MM/YYYY hh:mm A", true);
  return parsed.isValid() ? parsed.toDate() : null;
};

const createEmptyRow = () => ({
  eventFuncId: 0,
  functionId: null,
  functionStartDateTime: null,
  functionEndDateTime: null,
  pax: "",
  rate: "",
  banquetHallId: [],
  shiftId: "",
  originalShiftId: "",
  shiftOptions: [],
  function_venue: "",
  function_venueHindi: "",
  function_venueGujarati: "",
  notesEnglish: "",
  notesGujarati: "",
  notesHindi: "",
  banquetNotes: "",
  customPackageId: "",
  _rowId: Date.now() + Math.random(),
});



const VenueNamesModal = ({ isOpen, onClose, venueEnglish, venueHindi, venueGujarati, onSave }) => {
  const [english, setEnglish] = useState("");
  const [hindi, setHindi] = useState("");
  const [gujarati, setGujarati] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const isManualEdit = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setEnglish(venueEnglish || "");
      setHindi(venueHindi || "");
      setGujarati(venueGujarati || "");
      setIsTranslating(false);
      isManualEdit.current = false;
    }
  }, [isOpen, venueEnglish, venueHindi, venueGujarati]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-[350px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Edit Venue Names</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              English
            </label>
            <Input
              value={english}
              onChange={async (e) => {
                const value = e.target.value;
                setEnglish(value);
                if (!value.trim()) {
                  setHindi("");
                  setGujarati("");
                  setIsTranslating(false);
                  return;
                }
                setIsTranslating(true);
                try {
                  const res = await Translateapi(value);
                  const translations = res?.data || {};
                  setHindi(translations.hindi || "");
                  setGujarati(translations.gujarati || "");
                } catch (err) {
                  console.error("Translation error:", err);
                } finally {
                  setIsTranslating(false);
                }
              }}
              placeholder="English Name"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              Hindi
            </label>
            <Input
              value={hindi}
              onChange={(e) => {
                setHindi(e.target.value);
                isManualEdit.current = true;
              }}
              placeholder="Hindi Name"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              Gujarati
            </label>
            <Input
              value={gujarati}
              onChange={(e) => {
                setGujarati(e.target.value);
                isManualEdit.current = true;
              }}
              placeholder="Gujarati Name"
            />
          </div>

          {isTranslating && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full"></span>
              Translating...
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm">
            Cancel
          </button>
          <button
            disabled={isTranslating}
            onClick={() => {
              const trimmedEnglish = english.trim();
              onSave({
                english: trimmedEnglish,
                hindi: trimmedEnglish ? hindi : "",
                gujarati: trimmedEnglish ? gujarati : "",
              });
              onClose();
            }}
            className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition ${
              isTranslating ? "bg-gray-300 cursor-not-allowed" : "bg-[#005BA8] hover:bg-[#004a8c]"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};



const BanquetNotesModal = ({ isOpen, onClose, value, onSave }) => {
  const [notes, setNotes] = useState(value || "");

  useEffect(() => {
    if (isOpen) setNotes(value || "");
  }, [isOpen, value]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Banquet Notes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <textarea
          rows={5}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter banquet notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm">
            Cancel
          </button>
          <button
            onClick={() => { onSave(notes); onClose(); }}
            className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};


// ─────────────────────────────────────────────────────────────────────────
// EditFunctionDetailsModal
// ─────────────────────────────────────────────────────────────────────────
const EditFunctionDetailsModal = ({ isOpen, onClose, eventId, onRefreshEvent }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [functionOptions, setFunctionOptions] = useState([]);
  const [banquetList, setBanquetList] = useState([]);
  const [packageList, setPackageList] = useState([]);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
const [venueModalIndex, setVenueModalIndex] = useState(null);
const [notesModalOpen, setNotesModalOpen] = useState(false);
const [notesModalIndex, setNotesModalIndex] = useState(null);
const [banquetNotesModal, setBanquetNotesModal] = useState({ open: false, index: null });

  // ── Load dropdown reference data whenever the modal opens ──
  useEffect(() => {
    if (!isOpen) return;
    const userId = localStorage.getItem("userId");

    GetAllFunctionsByUserId(userId)
      .then((res) => {
        const data = res?.data?.data?.["Function Details"] || [];
        setFunctionOptions(
          data.map((item) => ({
            label: item.nameEnglish,
            value: item.id,
            functionstartTime: item.startTime,
            functionendTime: item.endTime,
          })),
        );
      })
      .catch((err) => console.error("Error fetching functions:", err));

    GetAllBanquet(userId)
      .then((res) => {
        const items =
          res?.data?.data?.["Banquet Details"] ||
          res?.data?.data?.banquetHalls ||
          res?.data?.data ||
          [];
        setBanquetList(
          Array.isArray(items)
            ? items
                .filter((item) => item && item.id != null)
                .map((item) => ({ value: item.id, label: item.hallName || item.name || `Banquet ${item.id}` }))
            : [],
        );
      })
      .catch((err) => console.error("Error fetching banquets:", err));

    GetCustomPackageapi(userId)
      .then((res) => {
        const items =
          res?.data?.data?.["Package Details"] ||
          res?.data?.data?.packages ||
          res?.data?.data ||
          [];
        setPackageList(
          Array.isArray(items)
            ? items
                .filter((item) => item && item.id != null)
                .map((item) => ({
                  value: item.id,
                  label: item.nameEnglish || item.name || `Package ${item.id}`,
                  price: item.price ?? "",
                }))
            : [],
        );
      })
      .catch((err) => console.error("Error fetching packages:", err));
  }, [isOpen]);

  // ── Shift availability fetch, per row ──
  const fetchShiftOptionsForRow = useCallback(
    async (index, banquetId, explicitDate, overrideOriginalShiftId) => {
      const ids = Array.isArray(banquetId) ? banquetId : banquetId ? [banquetId] : [];
      if (ids.length === 0) {
        setRows((prev) => {
          const updated = [...prev];
          if (!updated[index]) return prev;
          updated[index] = { ...updated[index], shiftOptions: [] };
          return updated;
        });
        return;
      }
      try {
        const userId = localStorage.getItem("userId");
        const rawDate = explicitDate || "";
        const bookingDate = rawDate
          ? dayjs(rawDate, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]).format("DD/MM/YYYY")
          : "";
        const currentEventId = eventId ? Number(eventId) : 0;
        const res = await AvailabilityCheck(userId, bookingDate, ids, currentEventId);
        const hallsData = res?.data?.data?.halls || [];

        const shiftMap = {};
        hallsData.forEach((hall) => {
          (hall.shifts || []).forEach((shift) => {
            if (!shiftMap[shift.shiftId]) {
              shiftMap[shift.shiftId] = {
                value: shift.shiftId,
                shiftName: shift.shiftName,
                startTime: shift.startTime,
                endTime: shift.endTime,
                isAvailable: shift.isAvailable,
                bookedInHalls: [],
              };
            }
            if (!shift.isAvailable) {
              shiftMap[shift.shiftId].isAvailable = false;
              shiftMap[shift.shiftId].bookedInHalls.push({
                hallName: hall.hallName,
                eventNo: shift.bookedByEventNo,
                partyName: shift.bookedByPartyName,
              });
            }
          });
        });

        const formatted = Object.values(shiftMap);

        setRows((prev) => {
          const updated = [...prev];
          if (!updated[index]) return prev;
          const effectiveOriginal =
            overrideOriginalShiftId !== undefined
              ? overrideOriginalShiftId
              : updated[index].originalShiftId;
          updated[index] = { ...updated[index], shiftOptions: formatted, originalShiftId: effectiveOriginal };
          return updated;
        });
      } catch (err) {
        console.error("Error fetching shift availability:", err);
      }
    },
    [eventId],
  );

  // ── Fetch the event and hydrate the rows whenever the modal opens ──
  useEffect(() => {
    if (!isOpen || !eventId) return;
    setLoading(true);
    GetEventMasterById(eventId)
      .then((res) => {
        const event = res?.data?.data?.["Event Details"]?.[0];
        const formatted = (event?.eventFunctions || []).map((f) => {
          const shifts = f.banquetHallShifts || [];
          const banquetIds =
            shifts.length > 0
              ? [...new Set(shifts.map((s) => String(s.banquetHallId)).filter(Boolean))]
              : f.banquetHallId
                ? [String(f.banquetHallId)]
                : [];
          const shiftId =
            shifts[0]?.shiftId != null
              ? String(shifts[0].shiftId)
              : f.shiftId != null
                ? String(f.shiftId)
                : "";

          return {
            eventFuncId: f.id,
            functionId: f.function?.id ?? f.functionId ?? null,
            functionName: f.function?.nameEnglish ?? "",
            functionStartDateTime: f.functionStartDateTime
              ? f.functionStartDateTime.replace(/am|pm/i, (m) => m.toUpperCase())
              : "",
            functionEndDateTime: f.functionEndDateTime
              ? f.functionEndDateTime.replace(/am|pm/i, (m) => m.toUpperCase())
              : "",
            pax: f.pax || "",
            rate: f.rate || "",
            banquetHallId: banquetIds,
            shiftId,
            originalShiftId: shiftId,
            shiftOptions: [],
            function_venue: f.function_venue || "",
            function_venueHindi: f.function_venue_hindi || "",
            function_venueGujarati: f.function_venue_gujarati || "",
            notesEnglish: f.notesEnglish || "",
            notesGujarati: f.notesGujarati || "",
            notesHindi: f.notesHindi || "",
            banquetNotes: f.banquentNotes || "",
            customPackageId: f.customPackageId != null ? String(f.customPackageId) : "",
            _rowId: f.id || Date.now() + Math.random(),
          };
        });

        setRows(formatted);

        // Kick off availability lookups for rows that already have a hall
        formatted.forEach((row, idx) => {
          if (row.banquetHallId.length > 0) {
            fetchShiftOptionsForRow(idx, row.banquetHallId, row.functionStartDateTime, row.originalShiftId);
          }
        });
      })
      .catch((err) => console.error("Error fetching event:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, eventId]);

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (field === "functionStartDateTime") {
      const hallId = rows[index]?.banquetHallId;
      if (hallId && hallId.length > 0) {
        fetchShiftOptionsForRow(index, hallId, value);
      }
    }
  };

  const handleBanquetChange = (index, ids) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        banquetHallId: ids,
        shiftId: "",
        originalShiftId: "",
        shiftOptions: [],
        function_venue: ids.length ? "" : updated[index].function_venue,
      };
      return updated;
    });
    fetchShiftOptionsForRow(index, ids, rows[index]?.functionStartDateTime, "");
  };


  const handleVenueModalSave = (updatedVenue) => {
  if (venueModalIndex === null) return;
  setRows((prev) => {
    const updated = [...prev];
    updated[venueModalIndex] = {
      ...updated[venueModalIndex],
      function_venue: updatedVenue.english,
      function_venueHindi: updatedVenue.hindi,
      function_venueGujarati: updatedVenue.gujarati,
    };
    return updated;
  });
};

const handleNotesSave = (notes) => {
  if (notesModalIndex === null) return;
  setRows((prev) => {
    const updated = [...prev];
    updated[notesModalIndex] = {
      ...updated[notesModalIndex],
      notesEnglish: notes.notesEnglish,
      notesGujarati: notes.notesGujarati,
      notesHindi: notes.notesHindi,
    };
    return updated;
  });
  setNotesModalOpen(false);
  setNotesModalIndex(null);
};

const handleBanquetNotesSave = (val) => {
  if (banquetNotesModal.index === null) return;
  setRows((prev) => {
    const updated = [...prev];
    updated[banquetNotesModal.index] = {
      ...updated[banquetNotesModal.index],
      banquetNotes: val,
    };
    return updated;
  });
};

  const handlePackageChange = async (index, packageId) => {
    const row = rows[index];
    const hallId = Array.isArray(row.banquetHallId) ? row.banquetHallId[0] : row.banquetHallId;
    const fallbackPrice = packageList.find((p) => String(p.value) === String(packageId))?.price;

    handleChange(index, "customPackageId", packageId);

    if (!packageId) {
      handleChange(index, "rate", "");
      return;
    }

    if (hallId && row.pax) {
      try {
        const res = await getpriceininfunctionadd(row.pax, hallId, packageId);
        const price = res?.data?.success ? (res?.data?.data?.price ?? null) : null;
        handleChange(index, "rate", price != null ? String(price) : fallbackPrice != null ? String(fallbackPrice) : "");
      } catch (err) {
        console.error("Error fetching package price:", err);
        handleChange(index, "rate", fallbackPrice != null ? String(fallbackPrice) : "");
      }
    } else {
      handleChange(index, "rate", fallbackPrice != null ? String(fallbackPrice) : "");
    }
  };

  const handleFunctionSelect = (index, functionId) => {
    const selected = functionOptions.find((opt) => opt.value === functionId);
    if (!selected) return;
    const row = rows[index];
    const startTime = dayjs(selected.functionstartTime, "HH:mm");
    const endTime = dayjs(selected.functionendTime, "HH:mm");
    const baseStartDate = row.functionStartDateTime
      ? dayjs(row.functionStartDateTime, "DD/MM/YYYY hh:mm A")
      : dayjs();

    setRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        functionId,
        functionStartDateTime: baseStartDate.hour(startTime.hour()).minute(startTime.minute()).format("DD/MM/YYYY hh:mm A"),
        functionEndDateTime: baseStartDate.hour(endTime.hour()).minute(endTime.minute()).format("DD/MM/YYYY hh:mm A"),
      };
      return updated;
    });
  };

  const handleAddRow = () => setRows((prev) => [...prev, createEmptyRow()]);

  const handleRemoveRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = rows.map((f, index) => {
        const banquetIds = Array.isArray(f.banquetHallId) ? f.banquetHallId.filter(Boolean) : [];
        const hasBanquet = banquetIds.length > 0;

        const banquetHallShifts = hasBanquet
          ? banquetIds.map((hallId) => ({
              banquetHallId: Number(hallId),
              shiftId: f.shiftId ? Number(f.shiftId) : 0,
              bookingDate: f.functionStartDateTime ? f.functionStartDateTime.split(" ")[0] : "",
            }))
          : [];

        return {
          eventFuncId: f.eventFuncId || 0,
          functionId: f.functionId != null ? Number(f.functionId) : null,
          functionStartDateTime: f.functionStartDateTime || "",
          functionEndDateTime: f.functionEndDateTime || "",
          pax: f.pax ? Number(f.pax) : 0,
          rate: f.rate ? Number(f.rate) : 0,
          sortorder: index + 1,
          banquetHallShifts,
          customPackageId: f.customPackageId ? Number(f.customPackageId) : 0,
          function_venue: hasBanquet ? "" : f.function_venue || "",
          function_venue_gujarati: hasBanquet ? "" : f.function_venueGujarati || "",
          function_venue_hindi: hasBanquet ? "" : f.function_venueHindi || "",
          notesEnglish: f.notesEnglish || "",
          notesGujarati: f.notesGujarati || "",
          notesHindi: f.notesHindi || "",
          banquentNotes: f.banquetNotes || "",
        };
      });

      await UpdateEventPax(eventId, payload);
      onRefreshEvent?.();
      onClose();
      Swal.fire({
        title: "Saved!",
        text: "Function details updated successfully.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#f5faff",
        color: "#003f73",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Save Failed!",
        text: err?.response?.data?.msg || err?.message || "Please try again.",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title="Function Details"
      width={1300}
      footer={[
        <div key="footer" className="flex gap-2 justify-end">
          <Button onClick={onClose} className="bg-danger text-white" disabled={saving}>
            Close
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white" loading={saving} disabled={loading}>
            Save
          </Button>
        </div>,
      ]}
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">Loading function details…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-900 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-2">Sr No.</th>
                <th className="p-2 min-w-[150px]">Function *</th>
                <th className="p-2 min-w-[160px]">Start Date</th>
                <th className="p-2 min-w-[160px]">End Date</th>
                <th className="p-2 w-[90px]">Person *</th>
                <th className="p-2 w-[90px]">Rate</th>
                <th className="p-2 min-w-[150px]">Banquet Hall</th>
                <th className="p-2 min-w-[150px]">Package</th>
                <th className="p-2 min-w-[160px]">Venue / Shift</th>
                <th className="p-2 text-center w-[70px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isODCRow = !row.banquetHallId || row.banquetHallId.length === 0;
                return (
                  <tr key={row._rowId} className="border-b border-gray-200">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <FunctionTypeDropdown
                        value={row.functionId || undefined}
                        onChange={(value) => handleFunctionSelect(index, value)}
                        options={functionOptions}
                        placeholder="Select Function"
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td className="p-2">
                      <DatePicker
                        className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={30}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        selected={parseDate(row.functionStartDateTime)}
                        onChange={(date) =>
                          handleChange(index, "functionStartDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)
                        }
                        placeholderText="Start date"
                      />
                    </td>
                    <td className="p-2">
                      <DatePicker
                        className="w-full border border-gray-300 rounded px-1.5 py-1 text-xs"
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={30}
                        dateFormat="dd/MM/yyyy hh:mm aa"
                        selected={parseDate(row.functionEndDateTime)}
                        onChange={(date) =>
                          handleChange(index, "functionEndDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)
                        }
                        placeholderText="End date"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        className="w-full text-center text-xs"
                        value={row.pax}
                        onChange={(e) => handleChange(index, "pax", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        className="w-full text-center text-xs"
                        value={row.rate}
                        readOnly={!!row.customPackageId}
                        style={row.customPackageId ? { background: "#f3f4f6", cursor: "not-allowed" } : {}}
                        onChange={(e) => handleChange(index, "rate", e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <BanquetSelect value={row.banquetHallId} options={banquetList} onChange={(ids) => handleBanquetChange(index, ids)} />
                    </td>
                    <td className="p-2">
                      <select
                        className="select w-full text-xs py-1 px-1.5"
                        value={row.customPackageId || ""}
                        onChange={(e) => handlePackageChange(index, e.target.value)}
                      >
                        <option value="">— Select Package —</option>
                        {packageList.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                     {isODCRow ? (
  <div className="flex items-center gap-1.5">
    <Input
      className="w-full text-xs"
      value={row.function_venue}
      placeholder="Function Venue"
      onChange={(e) => handleChange(index, "function_venue", e.target.value)}
    />
    <Tooltip title="View in all languages">
      <button
        type="button"
        onClick={() => { setVenueModalIndex(index); setVenueModalOpen(true); }}
        className="flex-shrink-0 w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition"
      >
        <MapPin size={16} className="text-gray-500 hover:text-blue-600" />
      </button>
    </Tooltip>
  </div>
) : (
                        <select
                          className="select w-full text-xs py-1 px-1.5"
                          value={row.shiftId || ""}
                          onChange={(e) => handleChange(index, "shiftId", e.target.value)}
                        >
                          <option value="">— Select Shift —</option>
                          {(row.shiftOptions || []).map((opt) => {
                            const isOriginal = String(opt.value) === String(row.originalShiftId);
                            const available = opt.isAvailable || isOriginal;
                            return (
                              <option key={opt.value} value={opt.value} disabled={!available}>
                                {available
                                  ? `${opt.shiftName} (${opt.startTime} - ${opt.endTime})`
                                  : `${opt.shiftName} (${opt.startTime} - ${opt.endTime}) [Booked]`}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </td>
                    <td className="p-2 text-center">
  <div className="flex justify-center items-center gap-1">
    <Tooltip title="Add Notes">
      <button
        className="btn btn-sm btn-icon btn-clear btn-success"
        onClick={() => { setNotesModalIndex(index); setNotesModalOpen(true); }}
      >
        <i className="ki-filled ki-add-files"></i>
      </button>
    </Tooltip>
    {!isODCRow && (
      <Tooltip title="Banquet Notes">
        <button
          className="btn btn-sm btn-icon btn-clear btn-primary"
          onClick={() => setBanquetNotesModal({ open: true, index })}
        >
          <i className="ki-filled ki-note-2"></i>
        </button>
      </Tooltip>
    )}
    <Tooltip title="Remove">
      <button
        onClick={() => handleRemoveRow(index)}
        disabled={rows.length === 1}
        className={`btn btn-sm btn-icon btn-clear btn-danger ${rows.length === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Trash2 size={14} />
      </button>
    </Tooltip>
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-center mt-3">
            <Button onClick={handleAddRow} className="bg-primary text-white flex items-center gap-1">
              <Plus size={14} /> Create New
            </Button>
          </div>
        </div>
      )}

       <VenueNamesModal
        isOpen={venueModalOpen}
        onClose={() => { setVenueModalOpen(false); setVenueModalIndex(null); }}
        venueEnglish={venueModalIndex !== null ? rows[venueModalIndex]?.function_venue : ""}
        venueHindi={venueModalIndex !== null ? rows[venueModalIndex]?.function_venueHindi : ""}
        venueGujarati={venueModalIndex !== null ? rows[venueModalIndex]?.function_venueGujarati : ""}
        onSave={handleVenueModalSave}
      />
      <AddNotes
        isOpen={notesModalOpen}
        onClose={() => { setNotesModalOpen(false); setNotesModalIndex(null); }}
        initialNotes={
          notesModalIndex !== null
            ? {
                notesEnglish: rows[notesModalIndex]?.notesEnglish || "",
                notesGujarati: rows[notesModalIndex]?.notesGujarati || "",
                notesHindi: rows[notesModalIndex]?.notesHindi || "",
              }
            : { notesEnglish: "", notesGujarati: "", notesHindi: "" }
        }
        onSave={handleNotesSave}
      />
      <BanquetNotesModal
        isOpen={banquetNotesModal.open}
        onClose={() => setBanquetNotesModal({ open: false, index: null })}
        value={banquetNotesModal.index !== null ? rows[banquetNotesModal.index]?.banquetNotes || "" : ""}
        onSave={handleBanquetNotesSave}
      />
    </CustomModal>
  );
};

export default EditFunctionDetailsModal;