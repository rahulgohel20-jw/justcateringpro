import { useState, useEffect, useRef } from "react";
import { X, Trash2, Plus, FileText, ChevronDown, Save, Pencil, Check } from "lucide-react";
import { AddExtraCharges, GetExtraCharges, DeleteExtraChargeRow,
  DeleteExtraChargeHeading, AddLogs, GetEventMasterById } from "@/services/apiServices";
import Swal from "sweetalert2";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { FormattedMessage, useIntl } from "react-intl";


const ExtraCharge = ({
  isOpen,
  onClose,
  eventData,
  selectedFunction,
  eventId,
  extraChargesData,
  extraChargesLoading,
  onRefresh,
}) => {
useEffect(() => {
  if (isOpen) {
    setSelectedFunctionId(selectedFunction || -1);
    setSelectedFunctionDateTime(getFunctionDateTime(selectedFunction || -1)); // ← new
  }
}, [isOpen, selectedFunction]);
  const intl = useIntl();
  const [apiGrandTotal, setApiGrandTotal] = useState(0);
  const [selectedFunctionDateTime, setSelectedFunctionDateTime] = useState({ date: "", startTime: "" , endTime: "", });
  const userId = localStorage.getItem("userId");

  // ── Fetched event functions (for session auto-fill) ───────────────────────
  const [fetchedEventFunctions, setFetchedEventFunctions] = useState([]);

  const getHeadingTotal = (heading) =>
    heading.rows.reduce((sum, r) => sum + calcTotal(r.rate, r.person), 0);

  const [selectedFunctionId, setSelectedFunctionId] = useState(selectedFunction || -1);
  const [headings, setHeadings] = useState([]);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const SESSION_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"];
const [renamingHeadingId, setRenamingHeadingId] = useState(null);
const [renameDraft, setRenameDraft] = useState("");

// ── Sub-heading state ──────────────────────────────────────────────────────
// showSubHeadingInputFor: headingId whose inline input is open (add mode)
const [showSubHeadingInputFor, setShowSubHeadingInputFor] = useState(null);
const [subHeadingDraft, setSubHeadingDraft] = useState("");
// editingSubHeadingFor: headingId whose sub-heading is being renamed inline
const [editingSubHeadingFor, setEditingSubHeadingFor] = useState(null);
const [editSubHeadingDraft, setEditSubHeadingDraft] = useState("");

  const initialHeadingsRef = useRef([]);

// ── Fetch event functions from API when modal opens ───────────────────────
useEffect(() => {
  if (!isOpen || !eventId) return;
  GetEventMasterById(eventId)
    .then((res) => {
      const funcs = res?.data?.data?.["Event Details"]?.[0]?.eventFunctions || [];
      setFetchedEventFunctions(funcs);
    })
    .catch(() => {/* silently ignore — will fall back to eventData prop */});
}, [isOpen, eventId]);

const userEmail = (() => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
    );
  } catch {
    return "";
  }
})();

const DATE_FORMATS = [
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DD HH:mm:ss",
  "DD-MM-YYYY HH:mm:ss",
  "DD/MM/YYYY HH:mm:ss",
  "DD/MM/YYYY hh:mm A",   
  "DD-MM-YYYY hh:mm A",
  "D/M/YYYY hh:mm A",     
  "YYYY-MM-DD",
  "DD-MM-YYYY",
  "DD/MM/YYYY",
];
const parseFlexibleDate = (val) => {
  if (!val) return null;
  let d = dayjs(val); // handles ISO strings with offsets natively
  if (d.isValid()) return d;
  for (const fmt of DATE_FORMATS) {
    d = dayjs(val, fmt, true);
    if (d.isValid()) return d;
  }
  return null;
};

const startRenameHeading = (heading) => {
  setRenamingHeadingId(heading.id);
  setRenameDraft(heading.name || "");
};

const confirmRenameHeading = () => {
  // Use the helper to check if there's actual content
  const plainText = getPlainTextFromHtml(renameDraft);
  
  if (!plainText) return;
  
  updateHeadingName(renamingHeadingId, renameDraft);
  setRenamingHeadingId(null);
  setRenameDraft("");
};

const cancelRenameHeading = () => {
  setRenamingHeadingId(null);
  setRenameDraft("");
};

const getFunctionDateTime = (funcId) => {
  const func = eventFunctions.find(
    (f) => String(f.id) === String(funcId) || String(f.function?.id) === String(funcId)
  );
  if (!func) {
    console.warn("[ExtraCharge] No matching function for id:", funcId, eventFunctions);
    return { date: "", startTime: "", endTime: "" };
  }

  // Try every combined-datetime field shape we know of
  const startRaw =
    func.functionStartDateTime ??
    func.function?.functionStartDateTime ??
    func.startDateTime ??
    func.function?.startDateTime ??
    null;
  const endRaw =
    func.functionEndDateTime ??
    func.function?.functionEndDateTime ??
    func.endDateTime ??
    func.function?.endDateTime ??
    null;

  let start = parseFlexibleDate(startRaw);
  let end = parseFlexibleDate(endRaw);

  // Fallback: separate date + time fields instead of one combined datetime
  const dateOnly = func.functionDate ?? func.function?.functionDate ?? func.date ?? null;
  if (!start && dateOnly) {
    const t = func.functionStartTime ?? func.function?.functionStartTime ?? func.startTime ?? "";
    start = parseFlexibleDate(t ? `${dateOnly} ${t}` : dateOnly);
  }
  if (!end && dateOnly) {
    const t = func.functionEndTime ?? func.function?.functionEndTime ?? func.endTime ?? "";
    end = parseFlexibleDate(t ? `${dateOnly} ${t}` : dateOnly);
  }

  if (!start) {
    console.warn("[ExtraCharge] Still couldn't parse date/time for function:", funcId, func);
  }

  return {
    date: start ? start.format("DD/MM/YYYY") : "",
    startTime: start ? start.format("hh:mm A") : "",
    endTime: end ? end.format("hh:mm A") : "",
  };
};

  const toApiTime = (displayTime) => {
    if (!displayTime) return "";
    const [t, period] = displayTime.split(" ");
    let [hStr, m] = t.split(":");
    let h = parseInt(hStr);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}:00`;
  };

  const parseTimeFromApi = (apiTime) => {
    if (!apiTime) return "";
    const [hh, mm] = apiTime.split(":");
    const h24 = parseInt(hh);
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${mm} ${period}`;
  };

  const parseDateFromApi = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.includes("-") ? dateStr.split("-").reverse().join("/") : dateStr;
  };

  const mapRow = (r) => ({
  id: r.id,
  _isNew: false,           
  date: parseDateFromApi(r.chargeDate),
  startTime: parseTimeFromApi(r.chargeStartTime),
  endTime: parseTimeFromApi(r.chargeEndTime),
  session: r.session || getFunctionShiftName(selectedFunctionId),
  person: r.personItem || "",
  rate: r.rate || 0,
});


// Decode HTML entities from API-stored strings (e.g. &amp; → &, &nbsp; → space)
// BUT preserve formatting tags like <b>, <i>, <u>, <strong>, <em>
const decodeHtmlEntities = (str) => {
  if (!str) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = str;
  // Return the innerHTML to preserve HTML tags but decode entities
  return tmp.innerHTML;
};

// Helper to get plain text from HTML (for validation)
const getPlainTextFromHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").trim();
};

// Clean HTML before sending to backend - decode entities but keep tags
const cleanHtmlForBackend = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  // Get the innerHTML which will have decoded entities
  let cleaned = tmp.innerHTML;
  // Replace common encoded entities that shouldn't be sent
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  return cleaned;
};

const mapHeadings = (headingsArr) =>
  headingsArr.map((h) => ({
    id: h.id,
    _isNew: false,
    name: decodeHtmlEntities(h.headingName),
    subHeadingName: decodeHtmlEntities(h.subHeadingName),
    headingTotal: h.headingTotal || 0,
    rows: (h.rows || []).map(mapRow),
  }));

const handleFunctionChange = async (funcId) => {
  setSelectedFunctionId(funcId);
  setSelectedFunctionDateTime(getFunctionDateTime(funcId));

  try {
    setIsLocalLoading(true);
    const userIdLocal = localStorage.getItem("userId");
    const resp = await GetExtraCharges(funcId, userIdLocal, eventId);
    const data = resp?.data?.data || null;
    if (!data || data.length === 0) {
      setHeadings([]);
      setApiGrandTotal(0);
      initialHeadingsRef.current = []; 
      return;
    }
    setApiGrandTotal(data.grandTotal || 0);
    const mapped = mapHeadings(data.headings);
    setHeadings(mapped);
    initialHeadingsRef.current = JSON.parse(JSON.stringify(mapped)); 
  } catch (err) {
    console.error("Failed to load extra charges for function:", err);
  } finally {
    setIsLocalLoading(false);
  }
};

useEffect(() => {
  if (!isOpen) return;

  if (!extraChargesData || extraChargesData.length === 0) {
    setHeadings([]);
    setApiGrandTotal(0);
    initialHeadingsRef.current = []; 
    return;
  }
  setApiGrandTotal(extraChargesData.grandTotal || 0);
  const mapped = mapHeadings(extraChargesData.headings);
  setHeadings(mapped);
  initialHeadingsRef.current = JSON.parse(JSON.stringify(mapped)); 
}, [extraChargesData, isOpen]);

  const [newHeadingDraft, setNewHeadingDraft] = useState("");
  const [showNewHeadingRow, setShowNewHeadingRow] = useState(false);

  const eventFunctions = eventData?.eventFunctions || []; 

  const getFunctionShiftName = (funcId) => {
    // prefer freshly-fetched data, fall back to prop
    const allFuncs = fetchedEventFunctions.length > 0
      ? fetchedEventFunctions
      : eventFunctions;

    const func = allFuncs.find(
      (f) => String(f.id) === String(funcId) || String(f.function?.id) === String(funcId),
    );
    if (!func) return "";

    // banquetHallShifts[0].shiftName  (main API shape)
    const fromShifts = func.banquetHallShifts?.[0]?.shiftName;
    if (fromShifts) return fromShifts;

    // legacy / other shapes
    return (
      func.shiftName ||
      func.shift?.name ||
      func.function?.shiftName ||
      ""
    );
  };

  const calcTotal = (rate, persons) => (Number(rate) || 0) * (Number(persons) || 0);

  const grandTotal = headings.reduce(
    (sum, h) => sum + h.rows.reduce((s, r) => s + calcTotal(r.rate, r.person), 0),
    0
  );

  const formatCurrency = (val) =>
    "₹ " + Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const confirmAddHeading = () => {
  const plainText = getPlainTextFromHtml(newHeadingDraft);
  if (!plainText) return;
  setHeadings((prev) => [
    ...prev,
    {
      id: Date.now(),
      _isNew: true,
      name: newHeadingDraft,  // Keep the HTML with formatting
      subHeadingName: "",
      rows: [
        {
          id: Date.now() + 1,
          _isNew: true,
          date: selectedFunctionDateTime.date,
          startTime: selectedFunctionDateTime.startTime,
          endTime: selectedFunctionDateTime.endTime,
          session: getFunctionShiftName(selectedFunctionId),
          person: "",
          rate: 0,
        },
      ],
    },
  ]);
  setNewHeadingDraft("");
  setShowNewHeadingRow(false);
};

const buildExtraChargeChangeSummary = (prevHeadings, currentHeadings) => {
  const parts = [];
  const addedHeadings = [];
  const removedHeadings = [];
  const renamedHeadings = [];
  const addedRows = [];
  const removedRows = [];
  const fieldChanges = [];

  const prevMap = new Map((prevHeadings || []).map((h) => [h.id, h]));
  const currMap = new Map((currentHeadings || []).map((h) => [h.id, h]));

  (currentHeadings || []).forEach((h) => {
    const prev = prevMap.get(h.id);

    if (!prev) {
      addedHeadings.push(`${h.name || "Heading"} (Total: ₹${getHeadingTotal(h).toFixed(2)})`);
      return;
    }

    if ((prev.name || "") !== (h.name || "")) {
      renamedHeadings.push(`"${prev.name}" → "${h.name}"`);
    }

    const prevRowMap = new Map((prev.rows || []).map((r) => [r.id, r]));
    const currRowMap = new Map((h.rows || []).map((r) => [r.id, r]));

    (h.rows || []).forEach((row) => {
      const prevRow = prevRowMap.get(row.id);
      const rowLabel = `${h.name || "Heading"} row`;

      if (!prevRow) {
        addedRows.push(`${rowLabel} (Qty: ${row.person || 0}, Rate: ₹${row.rate || 0})`);
        return;
      }

      const fields = [
        ["date", "Date"],
        ["startTime", "Start Time"],
        ["endTime", "End Time"],
        ["session", "Session"],
        ["person", "Qty"],
        ["rate", "Rate"],
      ];

      fields.forEach(([field, label]) => {
        const prevVal = prevRow[field] ?? "-";
        const currVal = row[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          fieldChanges.push(`${rowLabel} ${label}: ${prevVal} → ${currVal}`);
        }
      });
    });

    (prev.rows || []).forEach((row) => {
      if (!currRowMap.has(row.id)) {
        removedRows.push(`${h.name || "Heading"} row (Qty: ${row.person || 0}, Rate: ₹${row.rate || 0})`);
      }
    });
  });

  (prevHeadings || []).forEach((h) => {
    if (!currMap.has(h.id)) {
      removedHeadings.push(h.name || "Heading");
    }
  });

  if (addedHeadings.length) parts.push(`Headings Added: ${addedHeadings.join(", ")}`);
  if (removedHeadings.length) parts.push(`Headings Removed: ${removedHeadings.join(", ")}`);
  if (renamedHeadings.length) parts.push(`Headings Renamed: ${renamedHeadings.join(", ")}`);
  if (addedRows.length) parts.push(`Rows Added: ${addedRows.join(", ")}`);
  if (removedRows.length) parts.push(`Rows Removed: ${removedRows.join(", ")}`);
  if (fieldChanges.length) parts.push(`Changed: ${fieldChanges.join(", ")}`);

  return parts.length ? parts.join(" | ") : "No item-level changes detected.";
};


const validateHeadingsBeforeSave = () => {
  const emptyHeadings = [];
  const rowsMissingSession = [];

  headings.forEach((h) => {
    // Get plain text version of heading name for display in messages
    const displayName = getPlainTextFromHtml(h.name) || "Untitled Heading";
    
    if (!h.rows || h.rows.length === 0) {
      emptyHeadings.push(displayName);
      return;
    }
    h.rows.forEach((r) => {
      if (!r.session || !r.session.trim()) {
        rowsMissingSession.push(displayName);
      }
    });
  });

  if (emptyHeadings.length > 0) {
    return intl.formatMessage(
      {
        id: "USER.EXTRA_CHARGES.VALIDATION_NO_ROWS",
        defaultMessage: 'Heading "{headings}" has no rows. Please add at least one row or remove the heading.',
      },
      { headings: emptyHeadings.join(", ") },
    );
  }

  if (rowsMissingSession.length > 0) {
    // de-dupe heading names in case multiple rows in the same heading are missing session
    const uniqueHeadings = [...new Set(rowsMissingSession)];
    return intl.formatMessage(
      {
        id: "USER.EXTRA_CHARGES.VALIDATION_NO_SESSION",
        defaultMessage: 'Please select a Shift/Session for all rows under: {headings}',
      },
      { headings: uniqueHeadings.join(", ") },
    );
  }

  return null;
};

  const handleSave = async () => {
  try {

     const validationError = validateHeadingsBeforeSave();
    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.EXTRA_CHARGES.VALIDATION_TITLE",
          defaultMessage: "Incomplete Entry",
        }),
        text: validationError,
      });
      return;
    }

    const payload = {
      eventFunctionId: selectedFunctionId ? parseInt(selectedFunctionId) : -1,
      eventId: parseInt(eventId) || 0,
      userId: parseInt(userId) || 0,
      grandTotal: grandTotal,
      headings: headings.map((h) => ({
        id: h._isNew ? 0 : (h.id || 0),
        headingName: cleanHtmlForBackend(h.name),
        subHeadingName: cleanHtmlForBackend(h.subHeadingName) || "",
        headingTotal: getHeadingTotal(h),
        rows: h.rows.map((r) => ({
          id: r._isNew ? 0 : (r.id || 0),
          chargeDate: r.date || "",
          chargeStartTime: toApiTime(r.startTime),
          chargeEndTime: toApiTime(r.endTime),
          session: r.session || "",
          personItem: parseFloat(r.person) || 0,
          rate: parseFloat(r.rate) || 0,
          total: calcTotal(r.rate, r.person),
        })),
      })),
    };

    await AddExtraCharges(payload);

    // ── Non-blocking activity log ──
    try {
      const changeSummary = buildExtraChargeChangeSummary(
        initialHeadingsRef.current,
        headings,
      );

      const functionName =
        selectedFunctionId == -1
          ? "All Function"
          : eventFunctions.find(
              (f) => String(f.id) === String(selectedFunctionId),
            )?.name ||
            eventFunctions.find(
              (f) => String(f.id) === String(selectedFunctionId),
            )?.function?.nameEnglish ||
            "-";

      await AddLogs({
        id: 0,
        eventId: parseInt(eventId) || 0,
        description: `Extra Charges saved | Function: ${functionName} | Saved By: ${
          userEmail || "Unknown User"
        } | Grand Total: ₹${grandTotal.toFixed(2)} | Changes: ${changeSummary}`,
        eventType: "Extra Charges Save",
        user: userEmail,
      });
    } catch (logErr) {
      console.error("Log failed (non-blocking):", logErr);
    }

    Swal.fire({
      icon: "success",
      title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.SAVED_TITLE", defaultMessage: "Saved" }),
      text: intl.formatMessage({
        id: "USER.EXTRA_CHARGES.SAVED_TEXT",
        defaultMessage: "Extra charges saved successfully!",
      }),
      timer: 1500,
      showConfirmButton: false,
    });
    onClose();
  } catch (error) {
    console.error("Error saving extra charges:", error);
    Swal.fire({
      icon: "error",
      title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.FAILED_TITLE", defaultMessage: "Failed" }),
      text:
        error?.response?.data?.msg ||
        intl.formatMessage({
          id: "USER.EXTRA_CHARGES.SAVE_FAILED_TEXT",
          defaultMessage: "Could not save. Please try again.",
        }),
    });
  }
};



  const cancelAddHeading = () => {
    setNewHeadingDraft("");
    setShowNewHeadingRow(false);
  };

  const getHeadingText = (value) => {
    if (!value) return "";
    // Use a temporary div to let the browser decode all HTML entities
    const tmp = document.createElement("div");
    tmp.innerHTML = value;
    return (tmp.textContent || tmp.innerText || "").trim();
  };

const deleteHeading = async (hId) => {
  const heading = headings.find((h) => h.id === hId);

  // If it's new → just remove locally
  if (heading?._isNew) {
    setHeadings((prev) => prev.filter((h) => h.id !== hId));
    return;
  }

  try {
    await DeleteExtraChargeHeading(hId);

    setHeadings((prev) => prev.filter((h) => h.id !== hId));

   Swal.fire({
  icon: "success",
  title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.DELETED_TITLE", defaultMessage: "Deleted" }),
  text: intl.formatMessage({
    id: "USER.EXTRA_CHARGES.HEADING_DELETED_TEXT",
    defaultMessage: "Heading deleted successfully",
  }),
  timer: 1200,
  showConfirmButton: false,
});
  } catch (err) {
    Swal.fire({
  icon: "error",
  title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.FAILED_TITLE", defaultMessage: "Failed" }),
  text: intl.formatMessage({
    id: "USER.EXTRA_CHARGES.HEADING_DELETE_FAILED_TEXT",
    defaultMessage: "Could not delete heading",
  }),
});
  }
};

  const addRow = (hId) =>
  setHeadings((prev) =>
    prev.map((h) =>
      h.id === hId
        ? {
            ...h,
            rows: [
              ...h.rows,
              {
                id: Date.now(),
                _isNew: true,    // ← mark as new
                 date: selectedFunctionDateTime.date,        
                startTime: selectedFunctionDateTime.startTime, 
               endTime: selectedFunctionDateTime.endTime,
                session: getFunctionShiftName(selectedFunctionId),
                person: "",
                rate: 0,
              },
            ],
          }
        : h
    )
  );
 const removeRow = async (hId, rId) => {
  const heading = headings.find((h) => h.id === hId);
  const row = heading?.rows.find((r) => r.id === rId);

  // If new row → just remove locally
  if (row?._isNew) {
    setHeadings((prev) =>
      prev.map((h) =>
        h.id === hId
          ? { ...h, rows: h.rows.filter((r) => r.id !== rId) }
          : h
      )
    );
    return;
  }

  try {
    await DeleteExtraChargeRow(rId);

    setHeadings((prev) =>
      prev.map((h) =>
        h.id === hId
          ? { ...h, rows: h.rows.filter((r) => r.id !== rId) }
          : h
      )
    );

    Swal.fire({
  icon: "success",
  title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.DELETED_TITLE", defaultMessage: "Deleted" }),
  text: intl.formatMessage({
    id: "USER.EXTRA_CHARGES.ROW_DELETED_TEXT",
    defaultMessage: "Row deleted successfully",
  }),
  timer: 1200,
  showConfirmButton: false,
});
  } catch (err) {
    Swal.fire({
  icon: "error",
  title: intl.formatMessage({ id: "USER.EXTRA_CHARGES.FAILED_TITLE", defaultMessage: "Failed" }),
  text: intl.formatMessage({
    id: "USER.EXTRA_CHARGES.ROW_DELETE_FAILED_TEXT",
    defaultMessage: "Could not delete row",
  }),
});
  }
};
  const updateRow = (hId, rId, field, value) =>
    setHeadings((prev) =>
      prev.map((h) =>
        h.id === hId
          ? {
              ...h,
              rows: h.rows.map((r) => (r.id === rId ? { ...r, [field]: value } : r)),
            }
          : h
      )
    );

  const updateHeadingName = (hId, name) =>
    setHeadings((prev) => prev.map((h) => (h.id === hId ? { ...h, name } : h)));

  // ── Sub-heading helpers ────────────────────────────────────────────────────
  const openSubHeadingInput = (hId) => {
    // close any edit mode first
    setEditingSubHeadingFor(null);
    setEditSubHeadingDraft("");
    setSubHeadingDraft("");
    setShowSubHeadingInputFor(hId);
  };

  const confirmAddSubHeading = (hId) => {
    const text = subHeadingDraft.trim();
    if (!text) return;
    setHeadings((prev) =>
      prev.map((h) => (h.id === hId ? { ...h, subHeadingName: text } : h))
    );
    setShowSubHeadingInputFor(null);
    setSubHeadingDraft("");
  };

  const cancelAddSubHeading = () => {
    setShowSubHeadingInputFor(null);
    setSubHeadingDraft("");
  };

  const startEditSubHeading = (hId, currentName) => {
    setShowSubHeadingInputFor(null);
    setEditingSubHeadingFor(hId);
    setEditSubHeadingDraft(currentName);
  };

  const confirmEditSubHeading = (hId) => {
    const text = editSubHeadingDraft.trim();
    if (!text) return;
    setHeadings((prev) =>
      prev.map((h) => (h.id === hId ? { ...h, subHeadingName: text } : h))
    );
    setEditingSubHeadingFor(null);
    setEditSubHeadingDraft("");
  };

  const cancelEditSubHeading = () => {
    setEditingSubHeadingFor(null);
    setEditSubHeadingDraft("");
  };

  const deleteSubHeading = (hId) => {
    setHeadings((prev) =>
      prev.map((h) => (h.id === hId ? { ...h, subHeadingName: "" } : h))
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .heading-editor b,
        .heading-editor strong {
          font-weight: 700 !important;
        }
        .heading-editor i,
        .heading-editor em {
          font-style: italic !important;
        }
        .heading-editor u {
          text-decoration: underline !important;
        }
        .heading-display b,
        .heading-display strong {
          font-weight: 700 !important;
        }
        .heading-display i,
        .heading-display em {
          font-style: italic !important;
        }
        .heading-display u {
          text-decoration: underline !important;
        }
      `}</style>
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight"><FormattedMessage id="USER.EXTRA_CHARGES.MODAL_TITLE" defaultMessage="Extra Charges" /></h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 pb-4">

          {/* Function selector — sticky */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100 py-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 block">
               <FormattedMessage id="USER.EXTRA_CHARGES.SELECT_FUNCTION_LABEL" defaultMessage="Select Function" />
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <select
  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
  value={selectedFunctionId}
  onChange={(e) => handleFunctionChange(e.target.value)}
  disabled={eventFunctions.length === 0}
>
  <option value={-1}>
    {intl.formatMessage({ id: "USER.EXTRA_CHARGES.ALL_FUNCTION", defaultMessage: "All Function" })}
  </option>
  {eventFunctions.map((f) => (
    <option key={f.id} value={f.id}>
      {f.name || f.function?.nameEnglish}
    </option>
  ))}
</select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <button
                onClick={() => setShowNewHeadingRow(true)}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 border border-primary text-primary text-sm rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <Plus size={15} />
                <FormattedMessage id="USER.EXTRA_CHARGES.ADD_HEADING_BTN" defaultMessage="Add Heading" />
              </button>
            </div>
          </div>

          {/* Loading spinner */}
          {(extraChargesLoading || isLocalLoading) && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-sm text-gray-500"><FormattedMessage id="USER.EXTRA_CHARGES.LOADING_CHARGES" defaultMessage="Loading charges..." /></span>
            </div>
          )}

          {/* Headings */}
          {!extraChargesLoading && !isLocalLoading && (
            <div className="space-y-5 mt-4">
              {headings.map((heading) => (
                <div
                  key={heading.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Heading title bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500 flex-shrink-0" />
                      {renamingHeadingId === heading.id ? (
                      <>
                        <div
                          ref={(el) => {
                            if (el && renamingHeadingId === heading.id) {
                              // Only set content if it's different (avoid resetting on every render)
                              if (el.innerHTML !== renameDraft) {
                                const selection = window.getSelection();
                                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                                const cursorOffset = range ? range.startOffset : 0;
                                const focusNode = range ? range.startContainer : null;
                                
                                el.innerHTML = renameDraft;
                                
                                // Restore cursor position if we were already editing
                                if (focusNode && el.contains(focusNode)) {
                                  try {
                                    const newRange = document.createRange();
                                    newRange.setStart(focusNode, Math.min(cursorOffset, focusNode.length || 0));
                                    newRange.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(newRange);
                                  } catch (e) {
                                    // If cursor restoration fails, just focus at the end
                                    el.focus();
                                  }
                                } else {
                                  // First time - select all text
                                  el.focus();
                                  const range = document.createRange();
                                  const sel = window.getSelection();
                                  range.selectNodeContents(el);
                                  sel.removeAllRanges();
                                  sel.addRange(range);
                                }
                              }
                            }
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          aria-label="Rename heading"
                          className="heading-editor font-normal text-gray-800 bg-white border border-blue-300 rounded text-sm w-52 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          style={{ minHeight: '28px' }}
                          onInput={(e) => {
                            // Save cursor position before updating state
                            const selection = window.getSelection();
                            if (selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              const cursorOffset = range.startOffset;
                              const focusNode = range.startContainer;
                              
                              setRenameDraft(e.currentTarget.innerHTML);
                              
                              // Restore cursor after state update
                              requestAnimationFrame(() => {
                                try {
                                  if (focusNode && e.currentTarget.contains(focusNode)) {
                                    const newRange = document.createRange();
                                    newRange.setStart(focusNode, Math.min(cursorOffset, focusNode.length || 0));
                                    newRange.collapse(true);
                                    selection.removeAllRanges();
                                    selection.addRange(newRange);
                                  }
                                } catch (err) {
                                  // Silently fail if cursor restoration doesn't work
                                }
                              });
                            } else {
                              setRenameDraft(e.currentTarget.innerHTML);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              confirmRenameHeading();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelRenameHeading();
                            }
                            // Allow Ctrl+B for bold
                            if ((e.key === "b" || e.key === "B") && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              try {
                                document.execCommand("bold", false, null);
                              } catch (err) {
                                console.error("Bold command failed:", err);
                              }
                            }
                            // Allow Ctrl+I for italic
                            if ((e.key === "i" || e.key === "I") && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              try {
                                document.execCommand("italic", false, null);
                              } catch (err) {
                                console.error("Italic command failed:", err);
                              }
                            }
                            // Allow Ctrl+U for underline
                            if ((e.key === "u" || e.key === "U") && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              try {
                                document.execCommand("underline", false, null);
                              } catch (err) {
                                console.error("Underline command failed:", err);
                              }
                            }
                          }}
                        />
                        <button
                          onClick={confirmRenameHeading}
                          disabled={!renameDraft.trim()}
                          className="w-6 h-6 flex items-center justify-center text-primary hover:bg-blue-50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Confirm rename"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelRenameHeading}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Cancel rename"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span
                          className="heading-display font-normal text-gray-800 text-sm"
                          dangerouslySetInnerHTML={{ __html: heading.name }}
                        />
                        <button
                          onClick={() => startRenameHeading(heading)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-blue-50 rounded transition-colors"
                          title="Rename heading"
                        >
                          <Pencil size={13} />
                        </button>
                      </>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openSubHeadingInput(heading.id)}
                        className="flex items-center gap-1 text-xs text-primary border border-primary px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        title="Add Sub Heading"
                      >
                        <Plus size={13} />
                        <FormattedMessage id="USER.EXTRA_CHARGES.ADD_SUB_HEADING_BTN" defaultMessage="Add Sub Heading" />
                      </button>
                    <button
                      onClick={() => {
  Swal.fire({
    title: intl.formatMessage({
      id: "USER.EXTRA_CHARGES.DELETE_HEADING_TITLE",
      defaultMessage: "Delete heading?",
    }),
    text: intl.formatMessage({
      id: "USER.EXTRA_CHARGES.DELETE_HEADING_TEXT",
      defaultMessage: "This will remove all rows inside it.",
    }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: intl.formatMessage({
      id: "USER.EXTRA_CHARGES.DELETE_HEADING_CONFIRM_BTN",
      defaultMessage: "Yes, delete",
    }),
  }).then((result) => {
    if (result.isConfirmed) {
      deleteHeading(heading.id);
    }
  });
}}
                      className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete heading"
                    >
                      <Trash2 size={14} />
                    </button>
                    </div>
                  </div>

                  {/* Sub-heading: inline add input */}
                  {showSubHeadingInputFor === heading.id && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                      <span className="text-xs text-indigo-400 font-semibold shrink-0">Sub Heading:</span>
                      <input
                        type="text"
                        autoFocus
                        className="flex-1 text-xs border border-indigo-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                        placeholder="Enter sub heading name..."
                        value={subHeadingDraft}
                        onChange={(e) => setSubHeadingDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); confirmAddSubHeading(heading.id); }
                          if (e.key === "Escape") cancelAddSubHeading();
                        }}
                      />
                      <button
                        onClick={() => confirmAddSubHeading(heading.id)}
                        disabled={!subHeadingDraft.trim()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={13} />
                        Add
                      </button>
                      <button
                        onClick={cancelAddSubHeading}
                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Sub-heading: display / edit / delete */}
                  {heading.subHeadingName && showSubHeadingInputFor !== heading.id && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                      <span className="text-xs text-indigo-400 font-semibold shrink-0">Sub Heading:</span>
                      {editingSubHeadingFor === heading.id ? (
                        <>
                          <input
                            type="text"
                            autoFocus
                            className="flex-1 text-xs border border-indigo-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            value={editSubHeadingDraft}
                            onChange={(e) => setEditSubHeadingDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { e.preventDefault(); confirmEditSubHeading(heading.id); }
                              if (e.key === "Escape") cancelEditSubHeading();
                            }}
                          />
                          <button
                            onClick={() => confirmEditSubHeading(heading.id)}
                            disabled={!editSubHeadingDraft.trim()}
                            className="w-6 h-6 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title="Confirm"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={cancelEditSubHeading}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-indigo-700 font-medium flex-1">
                            {heading.subHeadingName}
                          </span>
                          <button
                            onClick={() => startEditSubHeading(heading.id, heading.subHeadingName)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                            title="Edit sub heading"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteSubHeading(heading.id)}
                            className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Remove sub heading"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-36">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.DATE" defaultMessage="Date" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-36">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.START_TIME" defaultMessage="Start Time" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-36">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.END_TIME" defaultMessage="End Time" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-36">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.SESSION" defaultMessage="Session" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-24">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.QTY" defaultMessage="Qty" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-28">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.RATE" defaultMessage="Rate (₹)" />
</th>
<th className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center px-3 py-2.5 w-28">
  <FormattedMessage id="USER.EXTRA_CHARGES.TABLE.TOTAL" defaultMessage="Total" />
</th>
                          <th className="w-10" />
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {heading.rows.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-xs text-gray-400 text-center py-5">
  <FormattedMessage
    id="USER.EXTRA_CHARGES.NO_ROWS"
    defaultMessage='No rows yet. Click "+ Add Row" to begin.'
  />
</td>
                          </tr>
                        )}

                        {heading.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            {/* Date */}
                            <td className="px-3 py-2">
                              <input
                                type="date"
                                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                                value={
                                  row.date ? row.date.split("/").reverse().join("-") : ""
                                }
                                onChange={(e) => {
                                  const d = e.target.value;
                                  updateRow(
                                    heading.id,
                                    row.id,
                                    "date",
                                    d ? d.split("-").reverse().join("/") : ""
                                  );
                                }}
                              />
                            </td>

                            {/* Start Time */}
                            <td className="px-3 py-2">
                              <TimePicker
                                use12Hours
                                format="hh:mm A"
                                className="w-full text-xs"
                                value={row.startTime ? dayjs(row.startTime, "hh:mm A") : null}
                                onChange={(_, timeString) =>
                                  updateRow(heading.id, row.id, "startTime", timeString)
                                }
                                allowClear
                              />
                            </td>

                            {/* End Time */}
                            <td className="px-3 py-2">
                              <TimePicker
                                use12Hours
                                format="hh:mm A"
                                className="w-full text-xs"
                                value={row.endTime ? dayjs(row.endTime, "hh:mm A") : null}
                                onChange={(_, timeString) =>
                                  updateRow(heading.id, row.id, "endTime", timeString)
                                }
                                allowClear
                              />
                            </td>

                            {/* Session */}
                            <td className="px-3 py-2">
                              <div className="relative">
                                <select
                                  className="w-full appearance-none text-xs border border-gray-200 rounded-md px-2 py-1.5 pr-6 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                                  value={row.session}
                                  onChange={(e) =>
                                    updateRow(heading.id, row.id, "session", e.target.value)
                                  }
                                >
                                  <option value="">
  {intl.formatMessage({ id: "USER.EXTRA_CHARGES.SESSION_PLACEHOLDER", defaultMessage: "Session" })}
</option>
                                  {SESSION_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={11}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="px-3 py-2">
                              <input
                                type="tel"
                                min={0}
                                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-center"
                                placeholder="0"
                                value={row.person}
                                onChange={(e) =>
                                  updateRow(heading.id, row.id, "person", e.target.value)
                                }
                              />
                            </td>

                            {/* Rate */}
                            <td className="px-3 py-2">
                              <input
                                type="tel"
                                min={0}
                                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-center"
                                placeholder="0"
                                value={row.rate}
                                onChange={(e) =>
                                  updateRow(heading.id, row.id, "rate", e.target.value)
                                }
                              />
                            </td>

                            {/* Total */}
                            <td className="px-3 py-2 text-center">
                              <span className="text-xs font-bold text-blue-700">
                                {formatCurrency(calcTotal(row.rate, row.person))}
                              </span>
                            </td>

                            {/* Remove */}
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => {
  Swal.fire({
    title: intl.formatMessage({
      id: "USER.EXTRA_CHARGES.DELETE_ROW_TITLE",
      defaultMessage: "Delete row?",
    }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: intl.formatMessage({
      id: "USER.EXTRA_CHARGES.DELETE_ROW_CONFIRM_BTN",
      defaultMessage: "Yes",
    }),
  }).then((result) => {
    if (result.isConfirmed) {
      removeRow(heading.id, row.id);
    }
  });
}}
                                className="w-6 h-6 flex items-center justify-center mx-auto text-gray-400 hover:text-red-400 hover:bg-red-50 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer: Add Row + Heading Total */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-100">
                    <button
  onClick={() => addRow(heading.id)}
  className="flex items-center gap-1 text-xs text-primary hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
>
  <Plus size={13} />
  <FormattedMessage id="USER.EXTRA_CHARGES.ADD_ROW_BTN" defaultMessage="ADD ROW" />
</button>
                    <div className="text-sm">
  <span className="text-gray-500 font-medium">
    <FormattedMessage id="USER.EXTRA_CHARGES.TOTAL_LABEL" defaultMessage="Total: " />
  </span>
  <span className="font-bold text-blue-700">
    {formatCurrency(getHeadingTotal(heading))}
  </span>
</div>
                  </div>
                </div>
              ))}

              {/* New heading inline input */}
              {showNewHeadingRow && (
                <div className="border-2 border-blue-300 border-dashed rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50">
                    <FileText size={15} className="text-blue-400 flex-shrink-0" />
                    <div
                      ref={(el) => {
                        if (el && showNewHeadingRow && !newHeadingDraft) {
                          el.focus();
                        }
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      aria-label={intl.formatMessage({
                        id: "USER.EXTRA_CHARGES.HEADING_NAME_PLACEHOLDER",
                        defaultMessage: "Enter heading name...",
                      })}
                      data-placeholder={intl.formatMessage({
                        id: "USER.EXTRA_CHARGES.HEADING_NAME_PLACEHOLDER",
                        defaultMessage: "Enter heading name...",
                      })}
                      className="heading-editor flex-1 text-sm font-normal text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                      style={{ minHeight: '32px' }}
                      onInput={(e) => {
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                          const range = selection.getRangeAt(0);
                          const cursorOffset = range.startOffset;
                          const focusNode = range.startContainer;
                          
                          setNewHeadingDraft(e.currentTarget.innerHTML);
                          
                          requestAnimationFrame(() => {
                            try {
                              if (focusNode && e.currentTarget.contains(focusNode)) {
                                const newRange = document.createRange();
                                newRange.setStart(focusNode, Math.min(cursorOffset, focusNode.length || 0));
                                newRange.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(newRange);
                              }
                            } catch (err) {
                              // Silently fail
                            }
                          });
                        } else {
                          setNewHeadingDraft(e.currentTarget.innerHTML);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          confirmAddHeading();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          cancelAddHeading();
                        }
                        // Allow Ctrl+B for bold
                        if ((e.key === "b" || e.key === "B") && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          try {
                            document.execCommand("bold", false, null);
                          } catch (err) {
                            console.error("Bold command failed:", err);
                          }
                        }
                        // Allow Ctrl+I for italic
                        if ((e.key === "i" || e.key === "I") && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          try {
                            document.execCommand("italic", false, null);
                          } catch (err) {
                            console.error("Italic command failed:", err);
                          }
                        }
                        // Allow Ctrl+U for underline
                        if ((e.key === "u" || e.key === "U") && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          try {
                            document.execCommand("underline", false, null);
                          } catch (err) {
                            console.error("Underline command failed:", err);
                          }
                        }
                      }}
                    />
<button
  onClick={confirmAddHeading}
  disabled={!getPlainTextFromHtml(newHeadingDraft).trim()}
  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
>
  <Check size={13} />
  <FormattedMessage id="USER.EXTRA_CHARGES.ADD_BTN" defaultMessage="Save" />
</button>
                    <button
                      onClick={cancelAddHeading}
                      className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="px-4 py-2 bg-white">
                    <p className="text-xs text-gray-400">
  <FormattedMessage
    id="USER.EXTRA_CHARGES.ENTER_ESC_HINT"
    defaultMessage="Press Enter to confirm or Esc to cancel."
  />
</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {headings.length === 0 && !showNewHeadingRow && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <FileText size={30} className="text-gray-300 mx-auto mb-2" />
                 <p className="text-sm text-gray-400">
  <FormattedMessage
    id="USER.EXTRA_CHARGES.NO_HEADINGS"
    defaultMessage='No headings added. Use "Add Heading" to group charges.'
  />
</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500 font-medium">
  <FormattedMessage id="USER.EXTRA_CHARGES.GRAND_TOTAL_LABEL" defaultMessage="Grand Total: " />
</span>
<span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="flex gap-2">
            <button
  onClick={onClose}
  className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
>
  <FormattedMessage id="USER.EXTRA_CHARGES.CANCEL_BTN" defaultMessage="Cancel" />
</button>
<button
  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg  transition-colors shadow-sm"
  onClick={handleSave}
>
  <Save size={15} />
  <FormattedMessage id="USER.EXTRA_CHARGES.SAVE_BTN" defaultMessage="Save Extra Charges" />
</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ExtraCharge;