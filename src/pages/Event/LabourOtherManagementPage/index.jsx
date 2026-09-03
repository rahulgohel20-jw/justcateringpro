import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { Container } from "@/components/container";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Select } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Swal from "sweetalert2";
import LabourDetailSidebar from "./LabourSidebar/LabourDetailSidebar";
import MenuReport from "@/partials/modals/menu-report/MenuReport";
import AddNotes from "@/partials/modals/add-notes/AddNotes.jsx";
import AddExtraExpense from "@/partials/modals/add-extra-expense/AddExtraExpense";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
import AddContactCategory from "../../../partials/modals/add-contact-category/AddContactCategory";
import { useExtraExpense } from "./hooks/useExtraExpense";
import AddContactName from "@/pages/master/MenuItemMaster/components/AddContactName";
import AddLabourshift from "@/partials/modals/add-labour-shift/AddLabourshift";
import { FormattedMessage  , useIntl } from "react-intl";

import AllLabour from "./component/AllLabour";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import AddVenueType from "../../../partials/modals/add-venue-type/AddVenueType";
import {
  GetEventMasterById,
  GetAllContactCategory,
  GetPartyMasterByCatId,
  AddUpdateLabor,
  GetEventLaborDetails,
  GetAllLabourShift,
  GetEventLabourBySupplier,
  GetCheckList,
  GETallGodown,
  saveEventLaborHelpers,
} from "@/services/apiServices";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";
import Checklist from "./Checklist";

import { createPortal } from "react-dom";
import { AddExclusiveReport } from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import { AddLogs, WhatsAppPdf } from "../../../services/apiServices";
import ViewLabourKyc from "./component/ViewLabourKyc";

dayjs.extend(customParseFormat);

const LABOUR_TYPE = "labour";
const CATEGORIES = ["Labour"];
const SHIFTS = [];

const parseDate = (date, fallbackDate) => {
  const parsed = dayjs(
    date,
    ["DD/MM/YYYY hh:mm A", "YYYY-MM-DD HH:mm:ss"],
    true,
  );
  return parsed.isValid()
    ? parsed.format("DD/MM/YYYY hh:mm A")
    : fallbackDate
      ? dayjs(fallbackDate).format("DD/MM/YYYY hh:mm A")
      : "";
};

const getChecklistBarData = (shift) => {
  const arrivedCount = shift.eventLabourCheckLists.reduce(
    (sum, item) => sum + (item.inQty || 0),
    0,
  );

  const isCompleted = shift.eventLabourCheckLists.every(
    (item) => item.isStatus === true,
  );

  const inTimes = shift.eventLabourCheckLists
    .map((i) => i.inTime)
    .filter(Boolean);

  const outTimes = shift.eventLabourCheckLists
    .map((i) => i.outTime)
    .filter(Boolean);

  const timeRange =
    inTimes.length && outTimes.length
      ? `${inTimes[0]} - ${outTimes[outTimes.length - 1]}`
      : "";

  const avatars = shift.eventLabourCheckLists
    .flatMap((item) => item.files || [])
    .map((f) => f.preview || f.file)
    .filter(Boolean);

  return {
    arrivedCount,
    isCompleted,
    timeRange,
    avatars,
  };
};

const buildLabourLogSummary = (prevSnapshot, currentLabourData, currentShiftRows) => {
  const parts = [];
  const added = [];
  const removed = [];
  const rowLines = [];

  const prevData = prevSnapshot?.labourData || [];
  const prevShifts = prevSnapshot?.shiftRows || {};

  const keyOf = (row) =>
    row.contactId ? `contact-${row.contactId}-${row.labourType}` : row.id;

  const prevMap = new Map(prevData.map((r) => [keyOf(r), r]));
  const currMap = new Map(currentLabourData.map((r) => [keyOf(r), r]));

  currentLabourData.forEach((row) => {
    const prevRow = prevMap.get(keyOf(row));
    const rowLabel = `${row.labourType || "Category"} - ${row.contact || "No Vendor"}`;
    const changes = [];

    if (!prevRow) {
      added.push(rowLabel);
    } else {
      if (prevRow.labourType !== row.labourType) {
        changes.push(`Category: ${prevRow.labourType || "-"} → ${row.labourType || "-"}`);
      }
      if (prevRow.contact !== row.contact) {
        changes.push(`Vendor: ${prevRow.contact || "-"} → ${row.contact || "-"}`);
      }
    }

    const prevRowShifts = prevShifts[row.id] || prevShifts[prevRow?.id] || [];
    const currRowShifts = currentShiftRows[row.id] || [];

    const prevShiftMap = new Map(
      prevRowShifts.map((s, i) => [s.id?.startsWith("shift-") ? s.id : `idx-${i}`, s]),
    );

    currRowShifts.forEach((shift, i) => {
      const shiftKey = shift.id?.startsWith("shift-") && prevShiftMap.has(shift.id)
        ? shift.id
        : `idx-${i}`;
      const prevShift = prevShiftMap.get(shiftKey);
      const shiftLabel = `Shift ${i + 1}`;

      if (!prevShift) {
        changes.push(
          `${shiftLabel} Added (Qty: ${shift.quantity || 0}, Price: ${shift.price || 0}, Total: ${shift.total || 0})`,
        );
        return;
      }

      const fields = [
        ["shift", "Shift Type"],
        ["dateTime", "Date & Time"],
        ["price", "Price"],
        ["quantity", "Qty"],
        ["place", "Venue"],
        ["transportPrice", "Trans. Price"],
        ["total", "Total"],
      ];

      fields.forEach(([field, label]) => {
        const prevVal = prevShift[field] ?? "-";
        const currVal = shift[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          changes.push(`${shiftLabel} ${label}: ${prevVal} → ${currVal}`);
        }
      });
    });

    if (prevRowShifts.length > currRowShifts.length) {
      changes.push(`${prevRowShifts.length - currRowShifts.length} shift(s) removed`);
    }

    if (changes.length) {
      rowLines.push(`${rowLabel} [${changes.join(", ")}]`);
    }
  });

  prevData.forEach((row) => {
    if (!currMap.has(keyOf(row))) {
      removed.push(`${row.labourType || "Category"} - ${row.contact || "No Vendor"}`);
    }
  });

  if (rowLines.length) parts.push(`Changes: ${rowLines.join(" | ")}`);
  if (added.length) parts.push(`Added: ${added.join(", ")}`);
  if (removed.length) parts.push(`Removed: ${removed.join(", ")}`);

  return parts.length ? parts.join(" | ") : "No item-level changes detected.";
};

const createEmptyLabourRow = (labourType = "") => ({
  id: `local-${Date.now()}`,
  isSaved: false,
  labourType,
  contactId: null,
  contact: "",
  shift: "",
  dateTime: "",
  price: "",
  quantity: "",
  total: "",
  place: "",
  notesEnglish: "",
  notesGujarati: "",
  notesHindi: "",
});



const getCompanyAuthInfo = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return { companyMobileNo: "", companyName: "" };
    const parsed = JSON.parse(authStorage);
    const user = parsed?.state?.user || {};
    return {
      companyMobileNo:
        user.userBasicDetails?.officeNo ||
        user.company?.mobileNo ||
        user.mobileNo ||
        user.mobile ||
        "",
      companyName:
        user.userBasicDetails?.companyName ||
        user.company?.nameEnglish ||
        user.company?.name ||
        "",
    };
  } catch {
    return { companyMobileNo: "", companyName: "" };
  }
};



const LabourOtherManagementPage = ({ mode }) => {
  const intl = useIntl();

  let { eventId } = useParams();
  const navigate = useNavigate();

  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("userData") || "{}"),
    [],
  );
  const [activeFunctionName, setActiveFunctionName] = useState("");
  const [isAddLabourModalOpen, setIsAddLabourModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState(null);
  const activeRowIdRef = useRef(null);
  const initialLabourSnapshotRef = useRef({ labourData: [], shiftRows: {} });
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [contactTypeId, setContactTypeId] = useState(2);
  const [concatId, setConcatId] = useState(2);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Labour");
  const [selectedFunctionPax, setSelectedFunctionPax] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [shiftOptions, setShiftOptions] = useState([]);
  const [selectedcontactType, setSelectedcontactType] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [labourData, setLabourData] = useState([]);
  const [labourCategories, setLabourCategories] = useState([]);
  const [allContacts, setAllContacts] = useState({});
  const [filteredContacts, setFilteredContacts] = useState({});

  const [isLabourSidebarOpen, setIsLabourSidebarOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const [allLabour, setAllLabour] = useState(false);
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const [currentNoteRowId, setCurrentNoteRowId] = useState(null);
  const [currentShiftNote, setCurrentShiftNote] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rowCategoryMap, setRowCategoryMap] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [shiftRows, setShiftRows] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAllCustomerToogleOpen, setIsAllCustomerToogleOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const userId = localStorage.getItem("userId");
  const progressAnimRef = useRef(null);
  const [saveProgress, setSaveProgress] = useState(0);
  const isSavingRef = useRef(false); 
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
const [kycRow, setKycRow] = useState(null);



  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );
  const userEmail = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email ||
        ""
      );
    } catch {
      return "";
    }
  })();
  const [checklistData, setChecklistData] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const permMenuPlanning = usePermission("Menu Planning");
  const { hasModuleAccess } = useModuleAccess();
  const canAccessAccounting = hasModuleAccess("Account");
    const canAccesskyc = hasModuleAccess("kyc");

  const permMenuExecution = usePermission("Menu Execution");
  const permRawMaterial = usePermission("Raw Material Distribution");
  const permPerDishCosting = usePermission("Per Dish Costing");
  const [showLangModal, setShowLangModal] = useState(false);
  const [pendingWhatsAppData, setPendingWhatsAppData] = useState(null);
  const [venueOptions, setVenueOptions] = useState([
    { id: "at_venue", name: "At Venue" },
  ]);
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const fetchVenues = useCallback(async () => {
    try {
      const res = await GETallGodown(userId);
      const list = res?.data?.data || []; 
      setVenueOptions([
        { id: "at_venue", name: "At Venue" },
        ...list.map((v) => ({
          id: v.id,
          name: v.nameEnglish ?? v.name ?? "",
          address: v.addressEnglish ?? "",
        })),
      ]);
    } catch (err) {
      console.error("Failed to fetch godowns:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchVenues();
  }, [userId, fetchVenues]);
  const fetchChecklist = async () => {
    if (!activeFunction?.id || !eventData?.id) return;

    try {
      setChecklistLoading(true);
      setChecklistData([]);

      const res = await GetCheckList(activeFunction.id, eventData.id, userId);
      const data = res?.data?.data?.checkLists || [];
      setChecklistData(data);
    } catch (err) {
      console.error("Checklist fetch error:", err);
    } finally {
      setChecklistLoading(false);
    }
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const addShiftToRow = (parentRowId) => {
    const newShiftId = `shift-${Date.now()}`;

    const defaultDateTime = eventData?.eventStartDateTime
      ? dayjs(eventData.eventStartDateTime, "DD/MM/YYYY hh:mm A").format(
          "DD/MM/YYYY hh:mm A",
        )
      : dayjs().format("DD/MM/YYYY hh:mm A");

    const parentRow = labourData.find((r) => r.id === parentRowId);
    const contactList = filteredContacts[parentRowId] || [];
    const selectedContact = contactList.find(
      (c) => c.nameEnglish === parentRow?.contact,
    );


    const vendorPrice = selectedContact?.price ?? "";

    setShiftRows((prev) => ({
      ...prev,
      [parentRowId]: [
        ...(prev[parentRowId] || []),
        {
          id: newShiftId,
          shift: "",
          dateTime: defaultDateTime,
          price: vendorPrice,
          quantity: "",
          total: "",
          place: "At Venue",
          transportPrice: "",
          notesEnglish: "",
  notesGujarati: "",
  notesHindi: "",
        },
      ],
    }));

    setExpandedRows({ [parentRowId]: true });
  };

  const deleteShiftRow = (parentRowId, shiftId) => {
    setHasUnsavedChanges(true);
    setShiftRows((prev) => ({
      ...prev,
      [parentRowId]: (prev[parentRowId] || []).filter((s) => s.id !== shiftId),
    }));
  };

  const handleShiftRowChange = (parentRowId, shiftId, field, value) => {
    setHasUnsavedChanges(true);

    setShiftRows((prev) => ({
      ...prev,
      [parentRowId]: (prev[parentRowId] || []).map((shift) => {
        if (shift.id !== shiftId) return shift;

        const updated = { ...shift, [field]: value };

        if (
          field === "price" ||
          field === "quantity" ||
          field === "transportPrice"
        ) {
          const price = parseFloat(updated.price || 0);
          const qty = parseFloat(updated.quantity || 0);
          const transport = parseFloat(updated.transportPrice || 0);
          updated.total = price * qty + transport;
        }

        return updated;
      }),
    }));
  };

  const FetchLabourShift = useCallback(async () => {
    try {
      const res = await GetAllLabourShift(userId || 0);

      const apiShifts = res?.data?.data?.["Function Details"] || [];

      const mapped =
        Array.isArray(apiShifts) && apiShifts.length
          ? apiShifts.map((s) => ({
              id: s.id,
              name: s.nameEnglish,
              time: s.shiftTime,
              price: s.price ?? "",
            }))
          : SHIFTS.map((s) => ({ name: s, time: null }));

      setShiftOptions(mapped);
    } catch (err) {
      console.error("Error fetching shifts:", err);
      setShiftOptions(SHIFTS);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      FetchLabourShift();
    }
  }, [userId, FetchLabourShift]);

  const handleOpenAddLabourShift = () => {
    setSelectedcontactType(null);
    setIsContactModalOpen(true);
  };

  const handleVendorAdded = async () => {
    const lockedRowId = activeRowId;
    if (!lockedRowId) return;

    const categoryId = rowCategoryMap[lockedRowId];
    if (!categoryId) return;

    try {
      const res = await GetPartyMasterByCatId(categoryId, userId);
      const updatedContacts = res?.data?.data?.["Party Details"] || [];

      allContactsRef.current = {
        ...allContactsRef.current,
        [categoryId]: updatedContacts,
      };

      setFilteredContacts((prev) => {
        const updated = { ...prev };
        Object.entries(rowCategoryMap).forEach(([rowId, catId]) => {
          if (catId === categoryId) {
            updated[rowId] = updatedContacts;
          }
        });
        return updated;
      });
    } catch (e) {
      console.error("Error refreshing vendor list:", e);
    }
  };

  const activeFunction = useMemo(
    () => eventData?.eventFunctions?.find((fn) => fn.id === activeTab),
    [eventData, activeTab],
  );

  const handleWhatsAppClick = useCallback((row, shift) => {
    setPendingWhatsAppData({ row, shift });
    setShowLangModal(true);
  }, []);

 const handleLangSelectedForWhatsApp = useCallback(
  async (lang) => {
    setShowLangModal(false);
    if (!pendingWhatsAppData) return;

    const { row, shift } = pendingWhatsAppData;

    try {
      const res = await GetEventLabourBySupplier(
        activeFunction?.id,
        eventData?.id,
        row.contactId,
      );

      const data = res?.data?.data?.eventLabor?.[0];
      if (!data) return;

      const mobile = data.mobileNo || "";
      if (!mobile) {
        Swal.fire({ icon: "warning", title: "No mobile number found!" });
        return;
      }

      const venue = eventData?.venue?.nameEnglish || "";
      const notes = row.notesEnglish || "";

      let shiftsToSend = shift ? [shift] : data.labourShift || [];

      const shiftLines = shiftsToSend.map((s) => {
        const shiftName = (s.laborshift || s.shift || "").replace(
          /^\w/,
          (c) => c.toUpperCase(),
        );
        const time = s.labordatetime ? s.labordatetime.split(" ")[1] : "";
        const qty = s.qty ?? s.quantity ?? "";
        const dateStr = s.labordatetime
          ? dayjs(s.labordatetime, "DD/MM/YYYY hh:mm A").format("DD.MM.YYYY")
          : "";
        return { line: `${shiftName}: ${time}`, qty, dateStr };
      });

      const firstShift = shiftLines[0] || {};

      let pdfUrl = "";
      try {
        const formData = new FormData();
        formData.append("eventId", eventData?.id);
        formData.append("partyId", -1);
        formData.append("eventFunctionId", -1);
        formData.append("adminTemplateModuleId", 12);
        formData.append("type", null);
        formData.append("userId", userId);
        formData.append("lang", lang);
        formData.append("isCategoryImage", 1);
        formData.append("isCategoryInstruction", 0);
        formData.append("isCategorySlogan", 1);
        formData.append("isItemImage", 1);
        formData.append("isCombo", 1);
        formData.append("isItemInstruction", 0);
        formData.append("isItemSlogan", 1);
        formData.append("isCompanyDetails", 1);
        formData.append("isExcel", 0);
        formData.append("isCompanyLogo", 0);
        formData.append("isPartyDetails", 0);
        formData.append("isWithQty", 0);
        formData.append("pageSize", "A4");
        formData.append("isWithPrice", 0);
        formData.append("agencyId[]", row.contactId);

        const reportRes = await AddExclusiveReport(formData);

        if (reportRes?.data?.success) {
          pdfUrl = reportRes.data.report_path || "";
        }
      } catch (reportErr) {
        console.error("PDF generation failed:", reportErr);
      }

      // ── NEW: notify via WhatsAppPdf API ──
      if (pdfUrl) {
        try {
          const { companyMobileNo, companyName } = getCompanyAuthInfo();
          const wres = await WhatsAppPdf({
            companyMobileNo,
            companyName,
            mobileNo: mobile.replace(/\D/g, ""),
            moduleName: "Labour Report",
            partyName: data.contactname || "",
            url: pdfUrl,
            userId: Number(userId) || 0,
          });

          if (wres?.data?.success) {
            Swal.fire({
              icon: "success",
              title: "Report sent successfully!",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        } catch (whatsAppErr) {
          console.error("WhatsAppPdf notify failed:", whatsAppErr);
          // non-blocking — don't stop the wa.me flow below if this fails
        }
      }

      // const message =
      //   `TO, ${data.contactname}\n` +
      //   `Date-(${firstShift.dateStr || ""})\n` +
      //   `Required : ${data.labortypename}\n` +
      //   `Venue : ${venue}\n` +
      //   `${firstShift.line || ""}\n` +
      //   `Qty. - ${firstShift.qty || ""},\n` +
      //   `Notes: ${notes || "-"}` +
      //   (pdfUrl ? `\n\nReport PDF:\n${pdfUrl}` : "");

      // const url = `https://api.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`;
      // window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("WhatsApp error:", err);
      Swal.fire({ icon: "error", title: "Failed to fetch labour details" });
    } finally {
      setPendingWhatsAppData(null);
    }
  },
  [pendingWhatsAppData, activeFunction?.id, eventData, userId],
);

  const filteredLabourData = useMemo(
    () =>
      labourData.filter((row) => {
        if (!row.labourType || !searchTerm.trim()) return true;
        return row.labourType.toLowerCase().includes(searchTerm.toLowerCase());
      }),
    [labourData, searchTerm],
  );

  const {
    selectedExpense,
    isModalOpen: isExtraExpenseModalOpen,
    closeModal,
    refetchExpenses,
  } = useExtraExpense(activeFunction?.id, eventData?.id);

  useEffect(() => {
    if (
      activeFunction?.id &&
      eventData?.id &&
      typeof refetchExpenses === "function"
    ) {
      refetchExpenses();
    }
  }, [activeFunction?.id, eventData?.id]);

  useEffect(() => {
    fetchContactCategories();
  }, [userId]);

  const fetchContactCategories = async () => {
    if (!userId) return;

    try {
      const res = await GetAllContactCategory(userId);

      const allCategories = res?.data?.data?.["Contact Category Details"] || [];

      const labour = allCategories.filter((cat) => {
        const typeName = cat?.contactType?.nameEnglish?.trim()?.toLowerCase();

        return typeName === LABOUR_TYPE;
      });

      setLabourCategories(labour);
    } catch (error) {
      console.error("❌ Error fetching contact categories:", error);
    }
  };

  useEffect(() => {
    activeRowIdRef.current = activeRowId;
  }, [activeRowId]);

  useEffect(() => {}, [labourCategories]);
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const res = await GetEventMasterById(eventId);

        if (res?.data?.data?.["Event Details"]?.length > 0) {
          const event = res.data.data["Event Details"][0];
          setEventData(event);

          if (event?.eventFunctions?.length > 0) {
       
            setActiveTab(event.eventFunctions[0].id);
            setActiveFunctionName(
              event.eventFunctions[0].function?.nameEnglish,
            );
            setSelectedFunctionPax(event.eventFunctions[0].pax || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const allContactsRef = useRef(allContacts);
  useEffect(() => {
    allContactsRef.current = allContacts;
  }, [allContacts]);

  useEffect(() => {
    const fetchLaborDetails = async () => {
      if (!eventData || !activeTab) return;

      const functionObj = eventData.eventFunctions.find(
        (fn) => fn.id === activeTab,
      );
      if (!functionObj) return;

      try {
        const res = await GetEventLaborDetails(functionObj.id, eventData.id);
        const laborData = (res?.data?.data?.eventLabor || []).sort((a, b) => {
          const aOrder =
            a.sortOrder !== undefined && a.sortOrder !== null
              ? a.sortOrder
              : Number.MAX_SAFE_INTEGER;

          const bOrder =
            b.sortOrder !== undefined && b.sortOrder !== null
              ? b.sortOrder
              : Number.MAX_SAFE_INTEGER;

          return aOrder - bOrder;
        });
        const categoryMap = {};
        const contactMap = {};
        const formattedRows = [];
        const newShiftRows = {};

        laborData
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .forEach((item) => {
            const rowId = `server-${item.id}`;
            categoryMap[rowId] = item.labortypeid;

            contactMap[rowId] = allContactsRef.current[item.labortypeid] || [];

            formattedRows.push({
              id: rowId,
              isSaved: true,
              labourType:
                item.labortypename ||
                labourCategories.find((c) => c.id === item.labortypeid)
                  ?.nameEnglish ||
                "",
              contact:
                item.contactname ||
                Object.values(allContactsRef.current)
                  .flat()
                  .find((c) => c.id === item.contactid)?.nameEnglish ||
                "",
              contactId: item.contactid,
              notesEnglish: item.labourShift?.[0]?.notesEnglish || "",
              notesGujarati: item.labourShift?.[0]?.notesGujarati || "",
              notesHindi: item.labourShift?.[0]?.notesHindi || "",
            });

            if (item.labourShift && Array.isArray(item.labourShift)) {
              newShiftRows[rowId] = item.labourShift.map((shift, index) => ({
                id: `shift-${item.id}-${index}`,
                shift: shift.laborshift || "",
                dateTime: parseDate(
                  shift.labordatetime,
                  eventData?.eventStartDateTime,
                ),
                price: shift.price || "",
                quantity: shift.qty || "",
                total: shift.totalprice || "",
                place: shift.place || "At Venue",
                transportPrice: shift.shiftTranPrice ?? "",
              }));
            }
          });

        setLabourData(formattedRows);
        setRowCategoryMap(categoryMap);
        setFilteredContacts(contactMap);
        setShiftRows(newShiftRows);
           initialLabourSnapshotRef.current = {
          labourData: JSON.parse(JSON.stringify(formattedRows)),
          shiftRows: JSON.parse(JSON.stringify(newShiftRows)),
        };
        if (formattedRows.length > 0) {
          setExpandedRows({ [formattedRows[0].id]: true });
        }
      } catch (err) {
        console.error("Error fetching labour details:", err);
      }
    };

    if (eventData && activeTab && labourCategories.length) {
      fetchLaborDetails();
    }
  }, [eventData, activeTab, labourCategories]);

  const handleRowChange = useCallback((id, field, value) => {
    setHasUnsavedChanges(true);

    setLabourData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        if (field === "price" || field === "quantity") {
          const price = parseFloat(updated.price || 0);
          const qty = parseFloat(updated.quantity || 0);
          updated.total = price * qty;
        }

        return updated;
      }),
    );
  }, []);

  const checkDuplicateVendor = useCallback(
    (rowId, categoryId, contactId) => {
      if (!categoryId || !contactId) return false;

      const duplicate = labourData.some((row) => {
        if (row.id === rowId) return false;

        const rowCategoryId = rowCategoryMap[row.id];
        return rowCategoryId === categoryId && row.contactId === contactId;
      });

      return duplicate;
    },
    [labourData, rowCategoryMap],
  );

  const handleFunctionChange = async (
    newFunctionId,
    newFunctionName,
    newPax,
  ) => {
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save before switching functions?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        denyButtonColor: "#6c757d",
        confirmButtonText: "Save & Switch",
        denyButtonText: "Switch Without Saving",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await handleSave();
        setActiveTab(newFunctionId);
        setActiveFunctionName(newFunctionName);
        setSelectedFunctionPax(newPax);
        setHasUnsavedChanges(false);
        setChecklistData([]);
      } else if (result.isDenied) {
        setActiveTab(newFunctionId);
        setActiveFunctionName(newFunctionName);
        setSelectedFunctionPax(newPax);
        setHasUnsavedChanges(false);
        setChecklistData([]);
      }
     
    } else {
      setActiveTab(newFunctionId);
      setActiveFunctionName(newFunctionName);
      setSelectedFunctionPax(newPax);
      setChecklistData([]);
    }
  };

  const handleContactChange = useCallback(
    async (rowId, contactName) => {
      setHasUnsavedChanges(true);

      const contactList = filteredContacts[rowId] || [];
      const selectedContact = contactList.find(
        (c) => c.nameEnglish === contactName,
      );

      const categoryId = rowCategoryMap[rowId];
      if (selectedContact && categoryId) {
        const isDuplicate = checkDuplicateVendor(
          rowId,
          categoryId,
          selectedContact.id,
        );

        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate Entry",
            text: "This vendor is already added for this category!",
            confirmButtonColor: "#005BA8",
          });

          setLabourData((prev) =>
            prev.map((r) =>
              r.id === rowId ? { ...r, contact: "", contactId: null } : r,
            ),
          );
          return;
        }
      }

      setLabourData((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? {
                ...r,
                contact: contactName,
                contactId: selectedContact?.id || null,
              }
            : r,
        ),
      );

      // ✅ Auto-fill price in all existing shift rows for this vendor
      if (
        selectedContact?.price !== undefined &&
        selectedContact?.price !== null
      ) {
        setShiftRows((prev) => {
          const existingShifts = prev[rowId] || [];
          if (existingShifts.length === 0) return prev;

          return {
            ...prev,
            [rowId]: existingShifts.map((shift) => {
              const price = parseFloat(selectedContact.price || 0);
              const qty = parseFloat(shift.quantity || 0);
              return {
                ...shift,
                price: selectedContact.price,
                total: price * qty + parseFloat(shift.transportPrice || 0),
              };
            }),
          };
        });
      }
    },
    [filteredContacts, rowCategoryMap, checkDuplicateVendor],
  );

  const addLabourRow = useCallback(() => {
    setHasUnsavedChanges(true);
    const newRow = createEmptyLabourRow();
    setLabourData((prev) => [...prev, newRow]);

    setExpandedRows({ [newRow.id]: true });
  }, []);
  const deleteRow = useCallback((id) => {
    setHasUnsavedChanges(true);
    setLabourData((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleLabourTypeChange = useCallback(
    async (rowId, value) => {
      setHasUnsavedChanges(true);

      const selectedCategory = labourCategories.find(
        (c) => c.nameEnglish === value,
      );

      if (!selectedCategory) return;

      let contacts = allContacts[selectedCategory.id];
      if (!contacts) {
        try {
          const res = await GetPartyMasterByCatId(selectedCategory.id, userId);
          contacts = res?.data?.data?.["Party Details"] || [];

          setAllContacts((prev) => ({
            ...prev,
            [selectedCategory.id]: contacts,
          }));
          allContactsRef.current = {
            ...allContactsRef.current,
            [selectedCategory.id]: contacts,
          };
        } catch (e) {
          console.error("Error fetching contacts for category:", e);
          contacts = [];
        }
      }

      const currentRow = labourData.find((r) => r.id === rowId);
      if (currentRow?.contactId && selectedCategory?.id) {
        const isDuplicate = checkDuplicateVendor(
          rowId,
          selectedCategory.id,
          currentRow.contactId,
        );

        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Duplicate Entry",
            text: "This category + vendor combination already exists! The vendor will be cleared.",
            confirmButtonColor: "#005BA8",
          });

          setRowCategoryMap((prev) => ({
            ...prev,
            [rowId]: selectedCategory.id,
          }));
          setLabourData((prev) =>
            prev.map((r) =>
              r.id === rowId
                ? { ...r, labourType: value, contact: "", contactId: null }
                : r,
            ),
          );
          setFilteredContacts((prev) => ({ ...prev, [rowId]: contacts }));
          return;
        }
      }

      setRowCategoryMap((prev) => ({ ...prev, [rowId]: selectedCategory.id }));
      setLabourData((prev) =>
        prev.map((r) =>
          r.id === rowId
            ? { ...r, labourType: value, contact: "", contactId: null }
            : r,
        ),
      );
      setFilteredContacts((prev) => ({ ...prev, [rowId]: contacts }));
    },
    [labourCategories, allContacts, labourData, checkDuplicateVendor, userId], // ← add userId
  );

  const handleSave = useCallback(async () => {
    if (!eventData || !activeFunction) {
      Swal.fire({
        icon: "warning",
        title: "Please select a function before saving!",
      });
      return;
    }

    const seenCombinations = new Set();
    const duplicates = [];

    labourData.forEach((row) => {
      if (!row.contactId || !row.labourType) return;
      const categoryId = rowCategoryMap[row.id];
      const key = `${categoryId}-${row.contactId}`;
      if (seenCombinations.has(key)) {
        duplicates.push(`${row.labourType} - ${row.contact}`);
      } else {
        seenCombinations.add(key);
      }
    });

    if (duplicates.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Entries Found",
        html: `The following combinations are duplicated:<br><br>${duplicates.map((d) => `• ${d}`).join("<br>")}`,
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    const groupedLabor = {};

    labourData.forEach((row, rowIndex) => {
   
      const selectedCategory = labourCategories.find(
        (c) => c.nameEnglish === row.labourType,
      );

      if (!selectedCategory) return;

      const shifts = shiftRows[row.id] || [];
      const key = `${row.contactId}-${selectedCategory.id}`;

      if (!groupedLabor[key]) {
        groupedLabor[key] = {
          contactid: row.contactId ?? null,
          labortypeid: selectedCategory.id,
          sortOrder: rowIndex, 
          labourShift: [],
        };
      }

      if (shifts.length === 0) {
        groupedLabor[key].labourShift.push({
          labordatetime: "",
          laborshift: "",
          place: "At Venue",
          price: 0,
          qty: 0,
          totalprice: 0,
           notesEnglish: "",   
  notesGujarati: "",
  notesHindi: "",
          shiftTranPrice: 0,
          sortOrder: 0, 
        });
        return;
      }

      shifts.forEach((shift, shiftIndex) => {
        let formattedDateTime = "";
        if (shift.dateTime) {
          const parsed = dayjs(shift.dateTime, "DD/MM/YYYY hh:mm A", true);
          if (parsed.isValid()) {
            formattedDateTime = parsed.format("DD/MM/YYYY hh:mm A");
          } else {
            const isoDate = dayjs(shift.dateTime);
            if (isoDate.isValid()) {
              formattedDateTime = isoDate.format("DD/MM/YYYY hh:mm A");
            }
          }
        }

       
groupedLabor[key].labourShift.push({
  labordatetime: formattedDateTime || "",
  laborshift: shift.shift || "",
  place: shift.place || "At Venue",
  price: parseFloat(shift.price || 0),
  qty: parseFloat(shift.quantity || 0),
  totalprice: parseFloat(shift.total || 0),
  notesEnglish: shift.notesEnglish || "",   
  notesGujarati: shift.notesGujarati || "", 
  notesHindi: shift.notesHindi || "",       
  shiftTranPrice: parseFloat(shift.transportPrice || 0),
  sortOrder: shiftIndex,
});
      });
    });
    const payload = {
      eventFunctionId: activeFunction.id,
      eventId: eventData.id,
      eventLaborDetails: Object.values(groupedLabor),
    };

    try {
      setIsSaving(true);
      setSaveProgress(0);
      animateProgress(0, 60, 800);
      const res = await AddUpdateLabor(payload);
      if (progressAnimRef.current) clearInterval(progressAnimRef.current);
      if (res?.data?.status === true || res?.data?.success === true) {
        setSaveProgress(100);
        await new Promise((res) => setTimeout(res, 600));
        const isUpdate = labourData.some((row) => row.isSaved === true);
        setIsSaving(false);
        setSaveProgress(0);
        setHasUnsavedChanges(false);
        try {
  const functionName = activeFunction?.function?.nameEnglish || `Function #${activeFunction?.id}`;
  const totalCategories = labourData.length;
  const totalVendors = labourData.filter((r) => r.contactId).length;
  const totalShiftsCount = Object.values(shiftRows).reduce(
    (sum, shifts) => sum + (shifts?.length || 0),
    0,
  );
  const grandTotalCost = Object.values(groupedLabor).reduce(
    (sum, entry) =>
      sum +
      entry.labourShift.reduce((s, sh) => s + (Number(sh.totalprice) || 0), 0),
    0,
  );

  const changeSummary = buildLabourLogSummary(
    initialLabourSnapshotRef.current,
    labourData,
    shiftRows,
  );

  const description =
    `Agency Distribution ${isUpdate ? "Updated" : "Saved"} — ` +
    `Event No: ${eventData?.eventNo || eventId} | Customer: ${eventData?.party?.nameEnglish || "N/A"} | ` +
    `Venue: ${eventData?.venue?.nameEnglish || "N/A"} | Function: ${functionName} | ` +
    `Categories: ${totalCategories} | Vendors: ${totalVendors} | Shifts: ${totalShiftsCount} | ` +
    `Estimated Cost: ₹${grandTotalCost.toLocaleString()} | Updated By: ${userEmail || "Unknown User"} | ${changeSummary}`;

  await AddLogs({
    id: 0,
    eventId: Number(eventData?.id || eventId) || 0,
    description,
    eventType: isUpdate ? "Labour Agency Update" : "Labour Agency Save",
    user: userEmail,
  });
} catch (logErr) {
  console.error("Log failed (non-blocking):", logErr);
}

        Swal.fire({
          icon: "success",
          title: "Success",
          text: res?.data?.message || res?.data?.msg || "Saved successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        setHasUnsavedChanges(false);

        if (activeFunction && eventData) {
          const laborRes = await GetEventLaborDetails(
            activeFunction.id,
            eventData.id,
          );
          const laborData = laborRes?.data?.data?.eventLabor || [];

          const categoryMap = {};
          const contactMap = {};
          const formattedRows = [];
          const newShiftRows = {};

          laborData.forEach((item) => {
            const rowId = `server-${item.id}`;
            categoryMap[rowId] = item.labortypeid;
            contactMap[rowId] = allContacts[item.labortypeid] || [];

            formattedRows.push({
              id: rowId,
              isSaved: true,
              labourType:
                item.labortypename ||
                labourCategories.find((c) => c.id === item.labortypeid)
                  ?.nameEnglish ||
                "",
              contact:
                item.contactname ||
                Object.values(allContacts)
                  .flat()
                  .find((c) => c.id === item.contactid)?.nameEnglish ||
                "",
              contactId: item.contactid,
              notesEnglish: item.labourShift?.[0]?.notesEnglish || "",
              notesGujarati: item.labourShift?.[0]?.notesGujarati || "",
              notesHindi: item.labourShift?.[0]?.notesHindi || "",
            });

            if (item.labourShift && Array.isArray(item.labourShift)) {
              newShiftRows[rowId] = item.labourShift.map((shift, index) => ({
                id: `shift-${item.id}-${index}`,
                shift: shift.laborshift || "",
                dateTime: parseDate(
                  shift.labordatetime,
                  eventData?.eventStartDateTime,
                ),
                price: shift.price || "",
                quantity: shift.qty || "",
                total: shift.totalprice || "",
                place: shift.place || "At Venue",
                transportPrice: shift.shiftTranPrice ?? "",
                 notesEnglish: shift.notesEnglish || "",   
  notesGujarati: shift.notesGujarati || "",
  notesHindi: shift.notesHindi || "",
              }));
            }
          });

          setLabourData(formattedRows);
          setRowCategoryMap(categoryMap);
          setFilteredContacts(contactMap);
          setShiftRows(newShiftRows);

          initialLabourSnapshotRef.current = {
            labourData: JSON.parse(JSON.stringify(formattedRows)),
            shiftRows: JSON.parse(JSON.stringify(newShiftRows)),
          };
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: res?.data?.message || res?.data?.msg || "Failed to save",
        });
      }
    } catch (error) {
      console.error("Error saving labour details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    eventData,
    activeFunction,
    labourData,
    labourCategories,
    allContacts,
    shiftRows,
    rowCategoryMap,
  ]);

  const animateProgress = (from, to, duration = 600) => {
    return new Promise((resolve) => {
      if (progressAnimRef.current) clearInterval(progressAnimRef.current);
      const steps = to - from;
      if (steps <= 0) {
        setSaveProgress(to);
        resolve();
        return;
      }
      const intervalMs = Math.floor(duration / steps);
      let current = from;
      progressAnimRef.current = setInterval(() => {
        current += 1;
        setSaveProgress(current);
        if (current >= to) {
          clearInterval(progressAnimRef.current);
          progressAnimRef.current = null;
          resolve();
        }
      }, intervalMs);
    });
  };
const handleSaveNotes = useCallback(
  (notesData) => {
    if (currentShiftNote) {
      setHasUnsavedChanges(true);

      // Save notes into the specific shift row, not the parent labour row
      setShiftRows((prev) => ({
        ...prev,
        [currentShiftNote.parentRowId]: (prev[currentShiftNote.parentRowId] || []).map((shift) =>
          shift.id === currentShiftNote.shiftId
            ? {
                ...shift,
                notesEnglish: notesData.notesEnglish || "",
                notesGujarati: notesData.notesGujarati || "",
                notesHindi: notesData.notesHindi || "",
              }
            : shift
        ),
      }));
    }
    setIsNotesOpen(false);
    setCurrentNoteRowId(null);
    setCurrentShiftNote(null);
  },
  [currentShiftNote],
);

  const openSelectMenureport = useCallback(() => {
    setMenuReportEventId(eventId);
    setIsSelectMenuReport(true);
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }
  const handleAddLabourType = async (newCategory) => {
    const category = {
      id: newCategory.id,
      nameEnglish: newCategory.nameEnglish,
      contactType: { nameEnglish: LABOUR_TYPE },
    };

    setLabourCategories((prev) => [...prev, category]);

    let contacts = [];
    try {
      const res = await GetPartyMasterByCatId(category.id, userId);
      contacts = res?.data?.data?.["Party Details"] || [];
    } catch (e) {
      console.error(e);
    }

    setAllContacts((prev) => ({
      ...prev,
      [category.id]: contacts,
    }));

    if (activeRowId) {
      const currentRow = labourData.find((r) => r.id === activeRowId);
      if (currentRow && !currentRow.labourType) {
        setRowCategoryMap((prev) => ({
          ...prev,
          [activeRowId]: category.id,
        }));

        setLabourData((prev) =>
          prev.map((r) =>
            r.id === activeRowId
              ? { ...r, labourType: category.nameEnglish }
              : r,
          ),
        );

        setFilteredContacts((prev) => ({
          ...prev,
          [activeRowId]: contacts,
        }));
      }
    }
  };
  const handleEventSelect = async (newEventId) => {
    setSelectedEventId(newEventId);
    setIsAllCustomerToogleOpen(false);
    navigate(`/labour-and-other-management/${newEventId}`);
  };

  const handleAssignKyc = async (selectedItems, partyId) => {
  const payload = {
    eventId: eventData?.id || 0,
    eventFunctionId: activeFunction?.id || 0,
    partyId: partyId || 0,
    laborHelperIds: selectedItems.map((item) => item.id),
  };

  const res = await saveEventLaborHelpers(payload);

  if (res?.data?.success === false) {
    throw new Error(res?.data?.msg || "Failed to assign labour helpers");
  }

  Swal.fire({
    icon: "success",
    title: "Success",
    text: res?.data?.msg || "Labour helpers assigned successfully.",
    timer: 1500,
    showConfirmButton: false,
  });
};

  return (
    <Fragment>
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <i className="ki-filled ki-information-2 text-yellow-500 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-5">
              You have unsaved changes. Do you want to save before leaving?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm btn-light"
                onClick={() => blocker.reset()}
              >
                Stay
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => blocker.proceed()}
              >
                Leave Without Saving
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  await handleSave();
                  blocker.proceed();
                }}
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-6">
              <h2 className="text-xl text-black font-semibold">
                <FormattedMessage
                  id="AGENCY_DISTRIBUTION.TITLE"
                  defaultMessage="5. Agency Distribution"
                />
              </h2>

              {/* DESKTOP & TABLET */}
             <div className="hidden md:flex gap-2">
  {permMenuPlanning.view && (
    <button
      onClick={() => navigate(`/menu-preparation/${eventId}`)}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    >
      <i className="ki-filled ki-menu text-primary text-md"></i>
      <FormattedMessage
        id="MENU_PLANNING.BUTTON"
        defaultMessage="2. Menu Planning"
      />
    </button>
  )}

  {permMenuExecution.view && (
    <button
      onClick={() => navigate(`/menu-allocation/${eventId}`)}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    >
      <i className="ki-filled ki-menu text-primary text-md"></i>
      <FormattedMessage
        id="MENU_EXECUTION.BUTTON"
        defaultMessage="3. Menu Execution"
      />
    </button>
  )}

  {permRawMaterial.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() =>
        navigate(`/raw-material-allocation/${eventId}`)
      }
    >
      <i className="ki-filled ki-gift text-primary text-md"></i>
      <FormattedMessage
        id="RAW_MATERIAL_DISTRIBUTION.BUTTON"
        defaultMessage="4. Raw Material Distribution"
      />
    </button>
  )}

  {permPerDishCosting.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() => navigate(`/dish-costing/${eventId}`)}
    >
      <i className="ki-filled ki-grid text-primary text-md"></i>
      6. Per Dish-costing
    </button>
  )}
  <button
    onClick={() => navigate("/")}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <Calendar size={16} className="text-primary" /> Back to Calendar
  </button>
</div>

              {/* MOBILE ONLY - Dropdown */}
              <div className="relative md:hidden">
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <i className="ki-filled ki-menu text-primary text-sm"></i>
    <span>Menu</span>
    <i
      className={`ki-filled ${isDropdownOpen ? "ki-up" : "ki-down"} text-gray-500 text-sm`}
    ></i>
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
      {permMenuPlanning.view && (
        <button
          onClick={() => {
            navigate(`/menu-preparation/${eventId}`);
            setIsDropdownOpen(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
        >
          <i className="ki-filled ki-menu text-primary"></i>
          <FormattedMessage
            id="MENU_PLANNING.BUTTON"
            defaultMessage="2. Menu Planning"
          />
        </button>
      )}

      {permMenuExecution.view && (
        <button
          onClick={() => {
            navigate(`/menu-allocation/${eventId}`);
            setIsDropdownOpen(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
        >
          <i className="ki-filled ki-menu text-primary"></i>
          <FormattedMessage
            id="MENU_EXECUTION.BUTTON"
            defaultMessage="3. Menu Execution"
          />
        </button>
      )}

      {permRawMaterial.view && (
        <button
          onClick={() => {
            navigate(`/raw-material-allocation/${eventId}`);
            setIsDropdownOpen(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
        >
          <i className="ki-filled ki-gift text-primary"></i>
          <FormattedMessage
            id="RAW_MATERIAL_DISTRIBUTION.BUTTON"
            defaultMessage="4. Raw Material Distribution"
          />
        </button>
      )}

      {permPerDishCosting.view && (
        <button
          onClick={() => {
            navigate(`/dish-costing/${eventId}`);
            setIsDropdownOpen(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
        >
          <i className="ki-filled ki-grid text-primary"></i>
          6. Per Dish-costing
        </button>
      )}
    </div>
  )}
</div>
            </div>
          </div>
        </div>
        {/* Event Info Card */}
        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between p-4 gap-3 md:gap-4 lg:gap-6">
            {" "}
            {/* ROW 1 */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_ID"
                    defaultMessage="Event ID:"
                  />
                </span>
                <span
                  className="text-sm font-medium text-gray-900 underline cursor-pointer"
                  onClick={() => setIsAllCustomerToogleOpen(true)}
                >
                  {eventData?.eventNo || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-user text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.PARTY_NAME"
                    defaultMessage="Party Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.party?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-geolocation-home text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_NAME"
                    defaultMessage="Event Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventType?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                    defaultMessage="Event Date & Time:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventStartDateTime || ""}
                </span>
              </div>
            </div>
            {/* FORCE NEW ROW */}
            <div className="w-full h-0"></div>
            {/* ROW 2 LEFT — Event Venue */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_VENUE"
                    defaultMessage="Event Venue:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.venue?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            {/* ROW 2 RIGHT — Buttons */}
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200 w-full md:w-auto">
              {" "}
              {/* Report Button */}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className={`text-sm px-3 py-2 rounded-md transition
          ${
            hasUnsavedChanges && !isSaving
              ? "bg-[#005BA8] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
              >
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              </button>
            </div>
          </div>
        </div>
        {/* Function Tabs */}
        <div className="w-full max-w-xxl bg-white shadow-md rounded-xl border border-gray-200 mb-4 p-2">
          <div className="inline-flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden overflow-x-auto max-w-full">
            {" "}
            {eventData?.eventFunctions?.map((fn, index) => (
              <button
                key={fn.id}
                onClick={() =>
                  handleFunctionChange(
                    fn.id,
                    fn.function?.nameEnglish,
                    fn.pax || 0,
                  )
                }
                className={`px-8 py-3 text-sm font-medium transition-all duration-200 
                  ${activeTab === fn.id ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}
                  ${index !== 0 ? "border-l border-gray-300" : ""}
                `}
              >
                {fn.function?.nameEnglish}
              </button>
            ))}
          </div>
        </div>
        {/* Action Bar */}
        <div className="card mb-5">
          <div className="card-body p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`btn btn-md ${activeCategory === category ? "btn-primary" : "btn-light"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:flex-1 sm:justify-between">
                {/* Person Count */}
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <i className="ki-filled ki-users text-primary"></i>
                  <span className="text-2sm font-medium text-gray-700">
                    <FormattedMessage
                      id="COMMON.PERSON"
                      defaultMessage="Person"
                    />
                  </span>
                  <span className="text-sm font-semibold bg-gray-300 rounded-md px-3 py-1">
                    {selectedFunctionPax || "-"}
                  </span>
                </div>

                {/* Search + Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <input
                    type="text"
                    placeholder="Search labour type..."
                    className="input h-10 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={openSelectMenureport}
                      className="btn btn-success btn-sm h-10 flex-1 sm:flex-initial"
                    >
                      <i className="ki-filled ki-document"></i>
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.REPORT"
                        defaultMessage="Report"
                      />
                    </button>
                    <button
                      onClick={() => {
                        fetchChecklist();
                        setIsChecklistOpen(true);
                      }}
                      className="btn btn-primary btn-sm h-10 flex-1 sm:flex-initial"
                    >
                      <i className="ki-filled ki-document"></i>
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.REPORT"
                        defaultMessage="Checklist"
                      />
                    </button>
                    {canAccessAccounting && (
                      <button
                        onClick={() => setAllLabour(true)}
                        className="btn btn-primary btn-sm h-10 flex-1 sm:flex-initial"
                      >
                        <img
                          src={toAbsoluteUrl("/media/icons/payall.png")}
                          className="size-6"
                          alt=""
                        />

                        <FormattedMessage
                          id="EVENT_MENU_ALLOCATION.REPORT"
                          defaultMessage="Pay All Labour"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Category Tabs */}

        {/* Labour Table */}
        {activeCategory === "Labour" && (
          <LabourTable
            data={filteredLabourData}
            labourCategories={labourCategories}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            filteredContacts={filteredContacts}
            shiftOptions={shiftOptions}
            eventData={eventData}
            shiftRows={shiftRows}
            expandedRows={expandedRows}
            setExpandedRows={setExpandedRows}
            onShiftRowChange={handleShiftRowChange}
            onAddShiftToRow={addShiftToRow}
            onDeleteShiftRow={deleteShiftRow}
            onRowChange={handleRowChange}
            onLabourTypeChange={handleLabourTypeChange}
            onContactChange={handleContactChange}
            onDelete={deleteRow}
            onAddRow={addLabourRow}
            onViewDetails={(row) => {
              setSelectedRow(row);
              setIsLabourSidebarOpen(true);
            }}
          onAddNotes={(parentRowId, shiftId) => {  
  setCurrentShiftNote({ parentRowId, shiftId });
  setCurrentNoteRowId(parentRowId);        
  setIsNotesOpen(true);
}}
 onKycClick={(row) => {
              setKycRow(row);
              setIsKycModalOpen(true);
            }}
            setActiveRowId={setActiveRowId}
            onSave={handleSave}
            onOpenAddLabourModal={() => setIsAddLabourModalOpen(true)}
            onOpenAddVendor={() => {
              const rowId =
                activeRowId ||
                (labourData.length
                  ? labourData[labourData.length - 1].id
                  : null);
              if (rowId) {
                activeRowIdRef.current = rowId; 
                setActiveRowId(rowId);
              }
              setIsMemberModalOpen(true);
            }}
            onWhatsAppClick={handleWhatsAppClick}
            onOpenAddLabourShift={handleOpenAddLabourShift}
            venueOptions={venueOptions}
            onOpenAddVenue={() => {
              setSelectedVenue(null);
              setIsAddVenueModalOpen(true);
            }}
            canAccesskyc={canAccesskyc}
          />
        )}
        {/* Modals */}
    <AddNotes
  isOpen={isNotesOpen}
  onClose={() => {
    setIsNotesOpen(false);
    setCurrentNoteRowId(null);
    setCurrentShiftNote(null);
  }}
  initialNotes={
    currentShiftNote
      ? shiftRows[currentShiftNote.parentRowId]?.find(
          (s) => s.id === currentShiftNote.shiftId
        ) ?? { notesEnglish: "", notesGujarati: "", notesHindi: "" }
      : { notesEnglish: "", notesGujarati: "", notesHindi: "" }
  }
  onSave={handleSaveNotes}
/>
        <LabourDetailSidebar
          isOpen={isLabourSidebarOpen}
          onClose={() => setIsLabourSidebarOpen(false)}
          eventFunctionId={activeFunction?.id}
          eventId={eventData?.id}
          contactId={selectedRow?.contactId || null}
        />
        {isExtraExpenseModalOpen && (
          <AddExtraExpense
            isOpen={isExtraExpenseModalOpen}
            onClose={closeModal}
            eventData={{
              ...eventData,
              eventFunctionId: activeFunction?.id,
              eventId: eventData?.id,
            }}
            selectedMeal={selectedExpense}
            refreshData={refetchExpenses}
          />
        )}
        <SelectMenureport
          isSelectMenureport={isSelectMenureport}
          setIsSelectMenuReport={setIsSelectMenuReport}
          onConfirm={() => {
            setIsSelectMenuReport(false);
            setIsMenuReport(true);
          }}
          setEventFunctionId={-1}
          mode={mode}
        />
        {isAddLabourModalOpen && (
          <AddContactCategory
            isOpen={isAddLabourModalOpen}
            onClose={() => {
              setIsAddLabourModalOpen(false);
            }}
            refreshData={fetchContactCategories}
            contactCategory={null}
            labourOnly={true}
            onSave={(newCategory) => {
              handleAddLabourType(newCategory);
              setIsAddLabourModalOpen(false);
            }}
          />
        )}
        <AddContactName
          isModalOpen={isMemberModalOpen}
          setIsModalOpen={setIsMemberModalOpen}
          concatId={concatId}
          contactTypeId={contactTypeId}
          refreshData={handleVendorAdded}
        />
        <AddLabourshift
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
          }}
          shiftData={selectedcontactType}
          refreshData={FetchLabourShift}
        />
        <AllCustomerToogle
          isModalOpen={isAllCustomerToogleOpen}
          setIsModalOpen={setIsAllCustomerToogleOpen}
          onEventSelect={handleEventSelect}
        />
        <MenuReport
          isModalOpen={isMenuReport}
          setIsModalOpen={setIsMenuReport}
          eventId={menuReportEventId}
        />
        <AllLabour
          isOpen={allLabour}
          onClose={() => setAllLabour(false)}
          eventId={eventData?.id}
        />
        <Checklist
          open={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          eventId={eventData?.id}
          checklistData={checklistData}
          loading={checklistLoading}
        />

        <LangSelectModal
          isOpen={showLangModal}
          onClose={() => {
            setShowLangModal(false);
            setPendingWhatsAppData(null);
          }}
          onSelect={handleLangSelectedForWhatsApp}
        />
        <AddVenueType
          isModalOpen={isAddVenueModalOpen}
          setIsModalOpen={setIsAddVenueModalOpen}
          refreshData={fetchVenues}
          selectedEvent={selectedVenue}
        />
   <ViewLabourKyc
  isOpen={isKycModalOpen}
  onClose={() => {
    setIsKycModalOpen(false);
    setKycRow(null);
  }}
  partyId={kycRow?.contactId}
  partyName={kycRow?.contact}
  eventFunctionId={activeFunction?.id}
  eventId={eventData?.id}
  onAssign={handleAssignKyc}
/>
      </Container>
      {isSaving && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClickCapture={(e) => e.stopPropagation()}
          style={{ cursor: "not-allowed" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - saveProgress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {saveProgress}%
              </span>
            </div>
            <span className="text-white text-sm font-medium tracking-wide">
              {saveProgress < 30
                ? "Preparing..."
                : saveProgress < 70
                  ? "Saving..."
                  : saveProgress < 100
                    ? "Finishing..."
                    : "Done!"}
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
};

const ChecklistBar = ({ rowId, checklistData, onOpenChecklist }) => {
  const arrivedCount = checklistData?.arrivedCount ?? 0;
  const isCompleted = checklistData?.isCompleted ?? false;
  const timeRange = checklistData?.timeRange ?? "";
  const avatars = checklistData?.avatars ?? [];

  return (
    <div
      className="flex items-center gap-3 py-1 px-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
      onClick={onOpenChecklist}
    >
      <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        <span>Checklist</span>
      </div>

      <div className="w-px h-4 bg-gray-300" />

      {arrivedCount > 0 && (
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
          {arrivedCount} ARRIVED
        </span>
      )}

      {isCompleted && (
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Completed</span>
        </div>
      )}

      {timeRange && (
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{timeRange}</span>
        </div>
      )}

      {avatars.length > 0 && (
        <div className="flex items-center ml-auto">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt=""
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <button className="ml-1 w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <span className="text-sm font-bold leading-none">+</span>
          </button>
        </div>
      )}
    </div>
  );
};

const LabourTable = ({
  data,
  labourCategories,
  filteredContacts,
  eventData,
  shiftOptions,
  shiftRows,
  expandedRows,
  setExpandedRows,
  onShiftRowChange,
  onAddShiftToRow,
  onDeleteShiftRow,
  onRowChange,
  onLabourTypeChange,
  onContactChange,
  onDelete,
  onAddRow,
  onViewDetails,
  onAddNotes,
  setActiveRowId,
  onSave,
  isSaving,
  hasUnsavedChanges,
  onOpenAddLabourModal,
  onOpenAddVendor,
  onOpenAddLabourShift,
  onWhatsAppClick,
  venueOptions,
  onOpenAddVenue,
  onKycClick,
  canAccesskyc,
}) => {
  const intl = useIntl();

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => {
      if (prev[rowId]) {
        return {};
      }
      return { [rowId]: true };
    });
  };
  // Calculate totals for parent row
  const calculateRowTotals = (rowId) => {
    const shifts = shiftRows[rowId] || [];
    const totalQty = shifts.reduce(
      (sum, s) => sum + (parseFloat(s.quantity) || 0),
      0,
    );
    const totalCost = shifts.reduce(
      (sum, s) => sum + (parseFloat(s.total) || 0),
      0,
    );
    return { totalQty, totalCost };
  };
  // const [expandedRows, setExpandedRows] = useState({});
  // const [shiftRows, setShiftRows] = useState({});

  // const toggleRowExpansion = (rowId) => {
  //   setExpandedRows((prev) => ({
  //     ...prev,
  //     [rowId]: !prev[rowId],
  //   }));
  // };

  // const addShiftToRow = (parentRowId) => {
  //   const newShiftId = `shift-${Date.now()}`;
  //   setShiftRows((prev) => ({
  //     ...prev,
  //     [parentRowId]: [
  //       ...(prev[parentRowId] || []),
  //       {
  //         id: newShiftId,
  //         shift: "",
  //         dateTime: "",
  //         price: "",
  //         quantity: "",
  //         total: "",
  //         place: "At Venue",
  //       },
  //     ],
  //   }));

  //   // Auto-expand when adding shift
  //   setExpandedRows((prev) => ({
  //     ...prev,
  //     [parentRowId]: true,
  //   }));
  // };

  // const deleteShiftRow = (parentRowId, shiftId) => {
  //   setShiftRows((prev) => ({
  //     ...prev,
  //     [parentRowId]: (prev[parentRowId] || []).filter((s) => s.id !== shiftId),
  //   }));
  // };

  // const handleShiftRowChange = (parentRowId, shiftId, field, value) => {
  //   setShiftRows((prev) => ({
  //     ...prev,
  //     [parentRowId]: (prev[parentRowId] || []).map((shift) => {
  //       if (shift.id !== shiftId) return shift;

  //       const updated = { ...shift, [field]: value };

  //       if (field === "price" || field === "quantity") {
  //         const price = parseFloat(updated.price || 0);
  //         const qty = parseFloat(updated.quantity || 0);
  //         updated.total = price * qty;
  //       }

  //       return updated;
  //     }),
  //   }));
  // };

  // Calculate totals for parent row
  // const calculateRowTotals = (rowId) => {
  //   const shifts = shiftRows[rowId] || [];
  //   const totalQty = shifts.reduce(
  //     (sum, s) => sum + (parseFloat(s.quantity) || 0),
  //     0,
  //   );
  //   const totalCost = shifts.reduce(
  //     (sum, s) => sum + (parseFloat(s.total) || 0),
  //     0,
  //   );
  //   return { totalQty, totalCost };
  // };

  return (
    <div className="space-y-4">
      {/* ===== TABLE HEADER — hidden on mobile, grid on md+ ===== */}
      <div className="hidden md:block card shadow-sm rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        <div className="p-4">
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-1 text-center font-semibold text-gray-700">
              #
            </div>
           <div className="col-span-3 font-semibold text-gray-700 flex items-center gap-2">
  <FormattedMessage
    id="COMMON.CATEGORY"
    defaultMessage="Category"
  />
  <button
    onClick={onOpenAddLabourModal}
    className="flex-shrink-0"
    title={intl.formatMessage({
      id: "COMMON.ADD_CATEGORY",
      defaultMessage: "Add Category",
    })}
  >
    <Plus className="w-5 h-5 text-white bg-primary rounded-full p-0.5" />
  </button>
</div>

<div className="col-span-3 font-semibold text-gray-700 flex items-center gap-2">
  <FormattedMessage
    id="COMMON.VENDORS"
    defaultMessage="Vendors"
  />
<button
  onClick={onOpenAddVendor}
  className="flex items-center gap-1"
>
  <Plus className="w-5 h-5 text-white bg-primary rounded-full p-0.5" />
  <FormattedMessage
    id="COMMON.ADD_VENDOR"
    defaultMessage="Add Vendors"
  />
</button>
</div>

<div className="col-span-1 text-center font-semibold text-gray-700">
  <FormattedMessage
    id="COMMON.TOTAL_QTY"
    defaultMessage="Total Qty"
  />
</div>

<div className="col-span-2 text-center font-semibold text-gray-700">
  <FormattedMessage
    id="COMMON.ESTIMATED_COST"
    defaultMessage="Estimated Cost"
  />
</div>

<div className="col-span-2 text-center font-semibold text-gray-700">
  <FormattedMessage
    id="COMMON.ACTIONS"
    defaultMessage="Actions"
  />
</div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE ONLY — Plus buttons row ===== */}
      <div className="flex md:hidden items-center justify-end gap-2 pb-1">
        <button
          onClick={onOpenAddLabourModal}
          className="flex items-center gap-1 text-sm text-primary font-medium"
          title="Add Category"
        >
          <Plus className="w-4 h-4 text-white bg-primary rounded-full p-0.5" />
          Category
        </button>
        <button
          onClick={onOpenAddVendor}
          className="flex items-center gap-1 text-sm text-primary font-medium"
          title="Add Vendor"
        >
          <Plus className="w-4 h-4 text-white bg-primary rounded-full p-0.5" />
          Vendor
        </button>
      </div>

      {/* ===== ROWS ===== */}
      {data.map((row, index) => {
        const isExpanded = expandedRows[row.id];
        const shifts = shiftRows[row.id] || [];
        const { totalQty, totalCost } = calculateRowTotals(row.id);

        return (
          <div
            key={row.id}
            className="card shadow-sm rounded-lg overflow-hidden border border-gray-200"
          >
            {/* ===== PARENT ROW ===== */}
            <div className="bg-white p-4">
              {/* MOBILE layout — card stack */}
              <div className="flex flex-col gap-3 md:hidden">
                {/* Top: # + Actions */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">
                    {index + 1}.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-red-100 rounded-full transition"
                      onClick={() => onDelete(row.id)}
                      title="Delete Category"
                    >
                      <Trash2 className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      onClick={() => toggleRowExpansion(row.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>

                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">
                    Category
                  </span>
                  <Select
                    className="custom-select-sm w-full"
                    showSearch
                    onFocus={() => setActiveRowId(row.id)}
                    placeholder="Select Category"
                    value={row.labourType || undefined}
                    onChange={(value) => onLabourTypeChange(row.id, value)}
                    style={{ width: "100%" }}
                  >
                    {labourCategories.map((item) => (
                      <Select.Option key={item.id} value={item.nameEnglish}>
                        {item.nameEnglish}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Vendors */}
                <div>
                  <span className="text-xs text-gray-500 mb-1 block">
                    Vendors
                  </span>
                  <Select
                    className="custom-select-sm w-full"
                    onFocus={() => setActiveRowId(row.id)}
                    showSearch
                    placeholder="Select Vendor"
                    value={row.contact || undefined}
                    onChange={(value) => onContactChange(row.id, value)}
                    style={{ width: "100%" }}
                  >
                    {(filteredContacts[row.id] || []).map((c) => (
                      <Select.Option key={c.id} value={c.nameEnglish}>
                        {c.nameEnglish}
                      </Select.Option>
                    ))}
                  </Select>
                </div>

                {/* Qty + Cost side by side */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 mb-1 block">
                      Total Qty
                    </span>
                    <input
                      type="text"
                      className="input input-sm w-full text-center bg-gray-50"
                      value={totalQty || "0"}
                      readOnly
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-500 mb-1 block">
                      Est. Cost
                    </span>
                    <input
                      type="text"
                      className="input text-green-700 input-sm w-full text-center bg-gray-50"
                      value={
                        totalCost ? `₹ ${totalCost.toLocaleString()}` : "0"
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* DESKTOP layout — grid row (md+) */}
              <div className="hidden md:grid grid-cols-12 gap-3 items-center">
                <div className="col-span-1 text-center font-medium">
                  {index + 1}.
                </div>
                <div className="col-span-3">
                  <Select
                    className="custom-select-sm w-full"
                    showSearch
                    onFocus={() => setActiveRowId(row.id)}
                    placeholder="Select Category"
                    value={row.labourType || undefined}
                    onChange={(value) => onLabourTypeChange(row.id, value)}
                    style={{ width: "100%" }}
                  >
                    {labourCategories.map((item) => (
                      <Select.Option key={item.id} value={item.nameEnglish}>
                        {item.nameEnglish}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    className="custom-select-sm w-full"
                    onFocus={() => setActiveRowId(row.id)}
                    showSearch
                    placeholder="Select Vendor"
                    value={row.contact || undefined}
                    onChange={(value) => onContactChange(row.id, value)}
                    style={{ width: "100%" }}
                  >
                    {(filteredContacts[row.id] || []).map((c) => (
                      <Select.Option key={c.id} value={c.nameEnglish}>
                        {c.nameEnglish}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-1 text-center">
                  <input
                    type="text"
                    className="input input-sm w-full text-center bg-gray-50"
                    value={totalQty || "0"}
                    readOnly
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    className="input text-green-700 input-sm w-full text-center bg-gray-50"
                    value={totalCost ? `₹ ${totalCost.toLocaleString()}` : "0"}
                    readOnly
                  />
                </div>

                <div className="col-span-2 flex items-center justify-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-full transition"
                    title="WhatsApp"
                    onClick={() => onWhatsAppClick(row, null)}
                  >
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </button>
                   {canAccesskyc && (
                   <button
  className="p-2 hover:bg-green-100 rounded-full transition"
  title="View KYC"  
  onClick={() => onKycClick(row)}
>
  <BadgeCheck className="w-5 h-5 text-green-600" />
</button>
                   )}
                  <button
                    className="p-2 hover:bg-red-100 rounded-full transition"
                    onClick={() => onDelete(row.id)}
                    title="Delete Category"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    onClick={() => toggleRowExpansion(row.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ===== EXPANDED SHIFT ROWS ===== */}
            {isExpanded && (
              <div className="bg-gray-50 border-t border-gray-200">
                {/* Shift Header — hidden on mobile */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-gray-100 border-b border-gray-200">
                  <div className="col-span-1"></div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Labour Shift
                    </span>
                    <button
                      onClick={onOpenAddLabourShift}
                      className="flex-shrink-0"
                    >
                      <Plus className="w-5 h-5 text-white bg-blue-600 rounded-full p-0.5" />
                    </button>
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-gray-700">
                      <FormattedMessage
      id="COMMON.DATE_TIME"
      defaultMessage="Date & Time"
    />
                  </div>
                  <div className="col-span-1 text-sm text-center font-semibold text-gray-700">
                      <FormattedMessage
      id="COMMON.PRICE"
      defaultMessage="Price"
    />
                  </div>
                  <div className="col-span-1 text-sm text-center font-semibold text-gray-700">
                      <FormattedMessage
      id="COMMON.QTY"
      defaultMessage="Qty."
    />
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      <FormattedMessage
        id="COMMON.VENUE"
        defaultMessage="Venue"
      />
                    </span>
                    <button onClick={onOpenAddVenue} className="flex-shrink-0">
                      <Plus className="w-5 h-5 text-white bg-blue-600 rounded-full p-0.5" />
                    </button>
                  </div>
                  <div className="col-span-1 text-sm text-center font-semibold text-gray-700">
                    <FormattedMessage
      id="COMMON.TRANSPORT_PRICE"
      defaultMessage="Trans. Price"
    />
                  </div>
                  <div className="col-span-1 text-sm text-center font-semibold text-gray-700">
                     <FormattedMessage
      id="COMMON.TOTAL"
      defaultMessage="Total"
    />
                  </div>
                  <div className="col-span-2 text-sm text-center font-semibold text-gray-700">
                    <FormattedMessage
      id="COMMON.ACTIONS"
      defaultMessage="Actions"
    />
                  </div>
                </div>

                {/* Mobile — Add Shift button with label */}
                <div className="flex md:hidden items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                     <FormattedMessage
      id="COMMON.SHIFTS"
      defaultMessage="Shifts"
    />
                  </span>
                  <button
                    onClick={onOpenAddLabourShift}
                    className="flex-shrink-0"
                  >
                    <Plus className="w-5 h-5 text-white bg-blue-600 rounded-full p-0.5" />
                  </button>
                </div>

                {/* Shift Rows */}
                {shifts.map((shift, shiftIndex) => (
                  <ShiftRow
                    key={shift.id}
                    shift={shift}
                    shiftIndex={shiftIndex}
                    parentRowId={row.id}
                    shiftOptions={shiftOptions}
                    eventData={eventData}
                    onShiftChange={onShiftRowChange}
                    onDelete={onDeleteShiftRow}
                    onViewDetails={onViewDetails}
                    onAddNotes={onAddNotes}
                    venueOptions={venueOptions}
                    row={row}
                    onWhatsAppClick={onWhatsAppClick}
                    checklistDataMap={{
                      arrivedCount: shiftIndex === 0 ? 3 : 1,
                      isCompleted: shiftIndex === 1,
                      timeRange:
                        shiftIndex === 0
                          ? "9:00 AM – 5:00 PM"
                          : "6:00 PM – 10:00 PM",
                      avatars: [
                        "https://i.pravatar.cc/40?img=1",
                        "https://i.pravatar.cc/40?img=2",
                        "https://i.pravatar.cc/40?img=3",
                      ],
                    }}
                    onOpenChecklist={(row) => {
                      setSelectedRow(row);
                      setIsChecklistOpen(true);
                      onOpenAddVenue = { onOpenAddVenue };
                    }}
                  />
                ))}

                {/* Add Shift Button */}
                <div className="px-4 py-4 bg-white">
                  <button
                    onClick={() => onAddShiftToRow(row.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md transition text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Shift
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ===== BOTTOM BUTTONS ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 gap-3">
        <button
          onClick={onAddRow}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md transition"
        >
          <Plus className="w-4 h-4" />
          Add Another Labor Category
        </button>

        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={`px-6 py-2 rounded-md transition ${
            hasUnsavedChanges && !isSaving
              ? "bg-primary text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ShiftRow = ({
  shift,
  shiftIndex,
  parentRowId,
  shiftOptions,
  eventData,
  onShiftChange,
  onDelete,
  onViewDetails,
  onAddNotes,
  row,
  onWhatsAppClick,
  onOpenChecklist,
  checklistDataMap,
  venueOptions,
  onOpenAddVenue,
}) => {
  const parseDateToObject = (dateString) => {
    if (!dateString) return null;
    const parsed = dayjs(dateString, "DD/MM/YYYY hh:mm A", true);
    return parsed.isValid() ? parsed.toDate() : null;
  };

  const getDateValue = () => {
    if (shift.dateTime) return parseDateToObject(shift.dateTime);
    if (eventData?.eventStartDateTime)
      return parseDateToObject(eventData.eventStartDateTime);
    return null;
  };

  return (
    <div className="border-b border-gray-200 bg-white hover:bg-gray-50 transition">
      {/* ===== MOBILE layout ===== */}
      <div className="flex flex-col gap-3 p-4 md:hidden">
        {/* Shift Select */}
        <div>
          <span className="text-xs text-gray-500 mb-1 block">Labour Shift</span>
          <select
            className="select select-sm w-full bg-white border-gray-300"
            value={shift.shift}
            onChange={(e) => {
              const selectedShiftName = e.target.value;
              const selectedShift = shiftOptions.find(
                (s) => s.name === selectedShiftName,
              );
              let finalDateTime = "";
              if (eventData?.eventStartDateTime && selectedShift?.time) {
                const [hour, minute] = selectedShift.time.split(":");
                finalDateTime = dayjs(
                  eventData.eventStartDateTime,
                  "DD/MM/YYYY hh:mm A",
                )
                  .hour(Number(hour))
                  .minute(Number(minute))
                  .second(0)
                  .format("DD/MM/YYYY hh:mm A");
              }
              onShiftChange(parentRowId, shift.id, "shift", selectedShiftName);
              onShiftChange(parentRowId, shift.id, "dateTime", finalDateTime);
              onShiftChange(
                parentRowId,
                shift.id,
                "transportPrice",
                selectedShift?.price ?? "",
              );
            }}
          >
            <option value="">Select Shift</option>
            {shiftOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div>
          <span className="text-xs text-gray-500 mb-1 block">Date & Time</span>
          <DatePicker
            selected={getDateValue()}
            onChange={(date) => {
              const formattedDate = date
                ? dayjs(date).format("DD/MM/YYYY hh:mm A")
                : "";
              onShiftChange(parentRowId, shift.id, "dateTime", formattedDate);
            }}
            showTimeSelect
            timeFormat="hh:mm aa"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy hh:mm aa"
            className="input input-sm w-full"
            placeholderText="Select date & time"
          />
        </div>

        {/* Price + Qty + Total — 3 equal columns */}
        <div className="flex gap-3">
          <div className="flex-1">
            <span className="text-xs text-gray-500 mb-1 block">Qty</span>
            <input
              type="tel"
              className="input input-sm w-full text-center"
              placeholder="0"
              value={shift.quantity}
              onChange={(e) =>
                onShiftChange(parentRowId, shift.id, "quantity", e.target.value)
              }
            />
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500 mb-1 block">Price</span>
            <input
              type="tel"
              className="input input-sm w-full text-center"
              placeholder="0"
              value={shift.price}
              onChange={(e) =>
                onShiftChange(parentRowId, shift.id, "price", e.target.value)
              }
            />
          </div>
          <div className="col-span-1">
            <Select
              className="w-full"
              size="small"
              value={shift.place || "At Venue"}
              onChange={(value) =>
                onShiftChange(parentRowId, shift.id, "place", value)
              }
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              dropdownStyle={{ minWidth: 280 }}
              popupMatchSelectWidth={false}
              getPopupContainer={() => document.body}
            >
              <Select.Option value="At Venue" label="At Venue">
                At Venue
              </Select.Option>
              {(venueOptions || [])
                .filter((v) => v.name !== "At Venue")
                .map((venue) => (
                  <Select.Option
                    key={venue.id}
                    value={venue.address}
                    label={venue.name}
                  >
                    {venue.name}{" "}
                  </Select.Option>
                ))}
            </Select>
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500 mb-1 block">
              Trans. Price
            </span>
            <input
              type="tel"
              className="input input-sm w-full text-center"
              placeholder="0"
              value={shift.transportPrice ?? ""}
              onChange={(e) =>
                onShiftChange(
                  parentRowId,
                  shift.id,
                  "transportPrice",
                  e.target.value,
                )
              }
            />
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500 mb-1 block">Total</span>
            <input
              type="text"
              className="input input-sm w-full text-center bg-gray-50"
              value={shift.total ? `₹${shift.total.toLocaleString()}` : "₹0"}
              readOnly
            />
          </div>
        </div>

        {/* Actions — right aligned */}
        <div className="flex items-center justify-end gap-1">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition"
           onClick={() => onAddNotes(parentRowId, shift.id)}
            title="Add Notes"
          >
            <FileText className="w-4 h-4 text-blue-600" />
          </button>

          <button
            className="p-2 hover:bg-red-100 rounded-full transition"
            onClick={() => onDelete(parentRowId, shift.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* ===== DESKTOP layout (md+) — exact same grid as before ===== */}
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 items-center">
        {/* Empty spacer */}
        <div className="col-span-1"></div>

        {/* Labour Shift */}
        <div className="col-span-2">
          <select
            className="select select-sm w-full bg-white border-gray-300"
            value={shift.shift}
            onChange={(e) => {
              const selectedShiftName = e.target.value;
              const selectedShift = shiftOptions.find(
                (s) => s.name === selectedShiftName,
              );
              let finalDateTime = "";
              if (eventData?.eventStartDateTime && selectedShift?.time) {
                const [hour, minute] = selectedShift.time.split(":");
                finalDateTime = dayjs(
                  eventData.eventStartDateTime,
                  "DD/MM/YYYY hh:mm A",
                )
                  .hour(Number(hour))
                  .minute(Number(minute))
                  .second(0)
                  .format("DD/MM/YYYY hh:mm A");
              }
              onShiftChange(parentRowId, shift.id, "shift", selectedShiftName);
              onShiftChange(parentRowId, shift.id, "dateTime", finalDateTime);
              onShiftChange(
                parentRowId,
                shift.id,
                "transportPrice",
                selectedShift?.price ?? "",
              );
            }}
          >
            <option value="">Select Shift</option>
            {shiftOptions.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="col-span-2">
          <DatePicker
            selected={getDateValue()}
            onChange={(date) => {
              const formattedDate = date
                ? dayjs(date).format("DD/MM/YYYY hh:mm A")
                : "";
              onShiftChange(parentRowId, shift.id, "dateTime", formattedDate);
            }}
            showTimeSelect
            timeFormat="hh:mm aa"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy hh:mm aa"
            className="input input-sm w-full"
            placeholderText="Select date & time"
          />
        </div>

        {/* Price */}
        <div className="col-span-1">
          <input
            type="tel"
            className="input input-sm w-full text-center"
            placeholder="0"
            value={shift.price}
            onChange={(e) =>
              onShiftChange(parentRowId, shift.id, "price", e.target.value)
            }
          />
        </div>

        {/* Qty */}
        <div className="col-span-1">
          <input
            type="tel"
            className="input input-sm w-full text-center"
            placeholder="0"
            value={shift.quantity}
            onChange={(e) =>
              onShiftChange(parentRowId, shift.id, "quantity", e.target.value)
            }
          />
        </div>
        {/* Venue dropdown ✅ */}
        <div className="col-span-1">
          <Select
            className="w-full"
            size="small"
            value={shift.place || "At Venue"}
            onChange={(value) =>
              onShiftChange(parentRowId, shift.id, "place", value)
            }
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            dropdownStyle={{ minWidth: 280 }}
            popupMatchSelectWidth={false}
            getPopupContainer={() => document.body}
          >
            <Select.Option value="At Venue" label="At Venue">
              At Venue
            </Select.Option>
            {(venueOptions || [])
              .filter((v) => v.id !== "at_venue")
              .map((venue) => (
                <Select.Option
                  key={venue.id}
                  value={String(venue.id)}
                  label={venue.name}
                >
                  {venue.name}
                </Select.Option>
              ))}
          </Select>
        </div>
        {/* Transport Price */}
        <div className="col-span-1">
          <input
            type="tel"
            className="input input-sm w-full text-center"
            placeholder="0"
            value={shift.transportPrice ?? ""}
            onChange={(e) =>
              onShiftChange(
                parentRowId,
                shift.id,
                "transportPrice",
                e.target.value,
              )
            }
          />
        </div>

        {/* Total */}
        <div className="col-span-1">
          <input
            type="text"
            className="input input-sm w-full text-center bg-gray-50"
            value={shift.total ? `₹${shift.total.toLocaleString()}` : "₹0"}
            readOnly
          />
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center justify-center gap-1">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition"
          onClick={() => onAddNotes(parentRowId, shift.id)}
            title="Add Notes"
          >
            <FileText className="w-4 h-4 text-blue-600" />
          </button>

          <button
            className="p-2 hover:bg-red-100 rounded-full transition"
            onClick={() => onDelete(parentRowId, shift.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white px-4 py-2">
        <div className="hidden md:grid grid-cols-12 gap-3 items-center">
          <div className="col-span-1" />{" "}
          <div className="col-span-11">
            {/* <ChecklistBar
              rowId={row.id}
              checklistData={checklistDataMap}
              onOpenChecklist={() => onOpenChecklist(row)}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const LangSelectModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const langs = [
    { label: "English", value: 0 },
    { label: "Hindi", value: 1 },
    { label: "Gujarati", value: 2 },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Select Language
        </h3>
        <div className="flex flex-col gap-3">
          {langs.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onSelect(lang.value)}
              className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary
                         hover:bg-blue-200 rounded-lg font-medium transition"
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 w-full hover:text-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default LabourOtherManagementPage;
