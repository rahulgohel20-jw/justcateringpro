import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, getRowClassName } from "./constant";
import useStyle from "./style";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import {
  DeleteIssue,
  GetAllStorePO,
  GetStoreIssuePdf,
  AddLogs,
  storeissueexcel,
  GetStorePoPdf,
  StorePoPricePdf,
  generateDatewiseStoreIssueReport,
  WhatsAppPdf,
  GetStockTypeByUserId
} from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import Swal from "sweetalert2";

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};


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




// Converts native <input type="date"> value (YYYY-MM-DD) to DD/MM/YYYY
const toDDMMYYYY = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};
// ─── Print Options Modal ─────────────────────────────────────────
const PrintModal = ({ item, onClose, onConfirm }) => {
  const [isCompanyDetails, setIsCompanyDetails] = useState(false);
  const [isRate, setIsRate] = useState(false);
  const [priceType, setPriceType] = useState("");

  const buildPayload = () => ({
    isCompanyDetails: isCompanyDetails ? 1 : 0,
    isRate: isRate ? 1 : 0,
    poId: item?.id || item?.issueid,
    priceType: isRate ? priceType : "",
  });

  const validate = () => {
    if (isRate && !priceType) {
      Swal.fire({ icon: "warning", title: "Please select a price type" });
      return false;
    }
    return true;
  };
  const userId = localStorage.getItem("userId");
useEffect(() => {
    const fetchKitchenTypes = async () => {
      try {
        setKitchenLoading(true);
       
        const res = await GetStockTypeByUserId(userId, "Kitchen");
        const list = res?.data?.data || res?.data || [];
        setKitchenTypes(list);
      } catch (error) {
        console.error("Failed to fetch kitchen types:", error);
      } finally {
        setKitchenLoading(false);
      }
    };
    fetchKitchenTypes();
  }, [userId]);
  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({ mode: "pdf", ...buildPayload() });
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    onConfirm({ mode: "whatsapp", ...buildPayload() });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl"
        style={{ transform: "translate(-50%,-50%)", width: "min(580px,95vw)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Print Options</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Company Details toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Company Details</p>
              <p className="text-xs text-gray-400 mt-0.5">Include company info in the report</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isCompanyDetails}
                  onChange={(e) => setIsCompanyDetails(e.target.checked)}
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isCompanyDetails ? "bg-primary" : "bg-gray-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isCompanyDetails ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>

          {/* With Price toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">With Price</p>
              <p className="text-xs text-gray-400 mt-0.5">Show item prices in the report</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isRate}
                  onChange={(e) => {
                    setIsRate(e.target.checked);
                    if (!e.target.checked) setPriceType("");
                  }}
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isRate ? "bg-primary" : "bg-gray-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRate ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>

          {/* Price Type — shown only when With Price is on */}
          {isRate && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">
                Price Type <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Average Price", value: "avg" },
                  { label: "Master Price", value: "Master" },
                  { label: "Last Price", value: "LAST" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriceType(opt.value)}
                    className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all text-center
                      ${priceType === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-wrap">
          <button
            className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-9 px-4 rounded-lg bg-green-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-green-700"
            onClick={handleWhatsApp}
          >
            <i className="ki-filled ki-send text-white text-sm" />
            Generate & Send WhatsApp
          </button>
          <button
            className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2"
            onClick={handleConfirm}
          >
            <i className="ki-filled ki-printer text-white text-sm" />
            Print
          </button>
        </div>
      </div>
    </>
  );
};
// ─── Datewise Report Modal ───────────────────────────────────────
const DateRangeReportModal = ({ onClose, onConfirm, loading }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCompanyDetails, setIsCompanyDetails] = useState(false);
  const [isRate, setIsRate] = useState(false);
  const [priceType, setPriceType] = useState("");
  const [kitchenTypeId, setKitchenTypeId] = useState("");
  const [kitchenTypes, setKitchenTypes] = useState([]);
  const [kitchenLoading, setKitchenLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchKitchenTypes = async () => {
      try {
        setKitchenLoading(true);
        // NOTE: confirm the correct `mainType` value used for kitchen types
        // in your backend — placeholder used below.
        const res = await GetStockTypeByUserId(userId, "1");
     const list = (res?.data?.data || []).filter(
  (t) => t.nameEnglish?.toLowerCase() === "kitchen" || t.mainType === 1
);
        setKitchenTypes(list);
      } catch (error) {
        console.error("Failed to fetch kitchen types:", error);
      } finally {
        setKitchenLoading(false);
      }
    };
    fetchKitchenTypes();
  }, [userId]);

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      Swal.fire({ icon: "warning", title: "Please select both start and end date" });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Swal.fire({ icon: "warning", title: "Start date cannot be after end date" });
      return;
    }
    if (isRate && !priceType) {
      Swal.fire({ icon: "warning", title: "Please select a price type" });
      return;
    }
    onConfirm({
      startDate,
      endDate,
      isCompanyDetails: isCompanyDetails ? 1 : 0,
      isRate: isRate ? 1 : 0,
      priceType: isRate ? priceType : "",
      kitchenTypeId: kitchenTypeId || -1,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl"
        style={{ transform: "translate(-50%,-50%)", width: "min(440px,95vw)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Store Issue Report</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="input"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="input"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
           <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Kitchen Type</label>
            <select
              className="input"
              value={kitchenTypeId}
              onChange={(e) => setKitchenTypeId(e.target.value)}
              disabled={kitchenLoading}
            >
              <option value="">
                {kitchenLoading ? "Loading..." : "All Kitchens"}
              </option>
             {kitchenTypes.map((kt) => (
  <option key={kt.id} value={kt.id}>
    {kt.nameEnglish}
  </option>
))}
            </select>
          </div>

          {/* Company Details toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Company Details</p>
              <p className="text-xs text-gray-400 mt-0.5">Include company info in the report</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isCompanyDetails}
                  onChange={(e) => setIsCompanyDetails(e.target.checked)}
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isCompanyDetails ? "bg-primary" : "bg-gray-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isCompanyDetails ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>

          {/* With Price toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">With Price</p>
              <p className="text-xs text-gray-400 mt-0.5">Show item prices in the report</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isRate}
                  onChange={(e) => {
                    setIsRate(e.target.checked);
                    if (!e.target.checked) setPriceType("");
                  }}
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isRate ? "bg-primary" : "bg-gray-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRate ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>

          {/* Price Type — shown only when With Price is on */}
          {isRate && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-700">
                Price Type <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Average Price", value: "Average" },
                  { label: "Master Price", value: "Master" },
                  { label: "Last Price", value: "Latest" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriceType(opt.value)}
                    className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all text-center
                      ${priceType === opt.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading}
          >
            <i className="ki-filled ki-printer text-white text-sm" />
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </>
  );
};
// ─── Main Component ──────────────────────────────────────────────
const StorePo = () => {
  const classes = useStyle();
  const navigate = useNavigate();
  const intl = useIntl();
  const permissions = usePermission("Store Issue");

  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
const [reportModalOpen, setReportModalOpen] = useState(false);
const [reportLoading, setReportLoading] = useState(false);

  // Print modal state
  const [printModalItem, setPrintModalItem] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchStorePO();
  }, []);

  const sendLog = async (status, item = {}) => {
  try {
    const poId = item.id || item.issueid || 0;
    const poCode = item.pocode || "-";
    const party = item.partyName || "-";
    const totalItems = item.details?.length ?? item.totalItems ?? "N/A";

    const description =
      status === "DELETE_SUCCESS"
        ? `Store Issue Deleted — PO Code: ${poCode} (ID: ${poId}) | Party: ${party} | ` +
          `Items: ${totalItems} | Deleted By: ${getUserEmail() || "Unknown User"}`
        : `Store Issue Delete FAILED — PO Code: ${poCode} (ID: ${poId}) | Party: ${party} | ` +
          `Attempted By: ${getUserEmail() || "Unknown User"}`;

    await AddLogs({
      description,
      eventType:
        status === "DELETE_SUCCESS"
          ? "StoreIssue_Delete"
          : "StoreIssue_Delete_Error",
      id:  0,
      eventId:0,
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};
  const handleStorePoPdf = async (item) => {
    try {
      const poId = item.id || item.issueid;
      const res = await GetStorePoPdf(userId, poId, 1);
      const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to generate PDF report.",
        });
      }
    } catch (error) {
      console.error("Store PO PDF error:", error);
      Swal.fire({
        icon: "info",
        title: "Return Not Generated",
        text:
          error?.response?.data?.msg ||
          "Something went wrong while generating the PDF report.",
      });
    }
  };

  const fetchStorePO = async () => {
    try {
      setLoading(true);
      const res = await GetAllStorePO(userId);
      const data = (res?.data?.data || []).map((item, index) => ({
        ...item,
        issueid: item.id,
        sr_no: index + 1,
      }));
      setTableData(data);
      setOriginalData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setTableData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(query.toLowerCase()),
        ),
      );
      setTableData(
        filtered.map((item, index) => ({ ...item, sr_no: index + 1 })),
      );
    }
  };

  const handleDelete = (issueid) => {
    const targetItem = tableData.find((i) => i.issueid === issueid) || {};

    Swal.fire({
      title: "Are you sure?",
      text: "This purchase entry will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await DeleteIssue(issueid);
          await sendLog("DELETE_SUCCESS", targetItem);

          const removeAndReindex = (prev) =>
            prev
              .filter((item) => item.id !== issueid)
              .map((item, index) => ({ ...item, sr_no: index + 1 }));

          setTableData(removeAndReindex);
          setOriginalData(removeAndReindex);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Purchase entry deleted.",
            confirmButtonColor: "#005BA8",
          });
        } catch (error) {
            console.error("Delete failed:", error);
            await sendLog("DELETE_ERROR", targetItem);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete purchase. Please try again.",
              confirmButtonColor: "#d33",
            });
          }
      }
    });
  };

  const handleEdit = (item) => {
    navigate("/stock-management/storepo/add", { state: { editData: item } });
  };

  // ─── Open modal on print click ───────────────────────────────
  const handlePrint = (item) => {
    setPrintModalItem(item);
  };

  // ─── Called when user clicks Print inside modal ──────────────
const handlePrintConfirm = async (payload) => {
  if (payload.mode === "whatsapp") {
    await handlePrintWhatsApp(payload);
    return;
  }

  // existing plain PDF flow
  try {
    setPrintLoading(true);
    const res = await StorePoPricePdf(payload, userId);
    const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      setPrintModalItem(null);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.msg || "Failed to generate PDF.",
      });
    }
  } catch (error) {
    console.error("Print error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.response?.data?.msg || "Something went wrong while generating the PDF.",
    });
  } finally {
    setPrintLoading(false);
  }
};

// ─── Generate PDF + send via WhatsApp ─────────────────────────
const handlePrintWhatsApp = async (payload) => {
  const item = printModalItem;

  const { value: waInput, isConfirmed: waConfirmed } = await Swal.fire({
    title: "Send via WhatsApp",
    html: `
      <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px; text-align:left;">
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
            Recipient Name
          </label>
          <input id="waName" type="text" value="${item?.partyName || ""}"
            style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
        </div>
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
            Mobile Number
          </label>
          <input id="waMobile" type="tel" maxlength="10" value="${item?.mobile || item?.partyMobile || ""}"
            placeholder="9876543210"
            style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Send",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
    preConfirm: () => {
      const name = document.getElementById("waName").value.trim();
      const mobile = document.getElementById("waMobile").value.replace(/\D/g, "");
      if (!mobile || mobile.length < 10) {
        Swal.showValidationMessage("Please enter a valid 10 digit mobile number.");
        return false;
      }
      return { name, mobile };
    },
  });

  if (!waConfirmed || !waInput) return;

  try {
    setPrintLoading(true);
    Swal.fire({
      title: "Generating & sending...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const { mode, ...pdfPayload } = payload;
    const res = await StorePoPricePdf(pdfPayload, userId);
    const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

    if (!fileUrl) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.msg || "Failed to generate PDF.",
      });
      return;
    }

    const { companyMobileNo, companyName } = getCompanyAuthInfo();

    const wres = await WhatsAppPdf({
      companyMobileNo,
      companyName,
      mobileNo: waInput.mobile,
      moduleName: "Store Issue Report",
      partyName: waInput.name || "",
      url: fileUrl,
      userId: Number(userId) || 0,
    });

    if (wres?.data?.success) {
      Swal.fire({
        icon: "success",
        title: "Sent!",
        text: "Report sent successfully via WhatsApp.",
        timer: 1800,
        showConfirmButton: false,
      });
      setPrintModalItem(null);
    } else {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
  Swal.close();
  setPrintModalItem(null);
    }
  } catch (error) {
    console.error("Generate & send WhatsApp failed:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.response?.data?.msg || "Something went wrong while generating/sending the report.",
    });
  } finally {
    setPrintLoading(false);
  }
};
const handleReportConfirm = async (payload) => {
  try {
    setReportLoading(true);
    const res = await generateDatewiseStoreIssueReport(
      toDDMMYYYY(payload.startDate),
      toDDMMYYYY(payload.endDate),
      userId,
      payload.isCompanyDetails,
      payload.isRate,
      payload.priceType,
      payload.kitchenTypeId,
    );
    const fileUrl = res?.data?.report_path;

    if (res?.data?.success && fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      setReportModalOpen(false);
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.msg || "Failed to generate report.",
      });
    }
  } catch (error) {
    console.error("Store Issue report error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.response?.data?.msg || "Something went wrong while generating the report.",
    });
  } finally {
    setReportLoading(false);
  }
};
  const handleExcel = async (item) => {
    try {
      const poId = item.id || item.issueid;
      const response = await storeissueexcel(poId, userId);
      const fileUrl = response?.data?.fileUrl;

      if (!fileUrl) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to generate Excel file.",
        });
        return;
      }

      window.open(fileUrl, "_blank", "noopener,noreferrer");

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `StoreIssue_${item.pocode || poId}.xlsx`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Downloaded",
        text: "Excel file downloaded successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Excel download failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to download Excel file.",
      });
    }
  };

  return (
    <Fragment>
      <Container>
        {/* Page Title */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.STORE_PO.TITLE"
              defaultMessage="Store Issue"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 ${classes?.customStyle ?? ""}`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.STORE_PO.SEARCH",
                  defaultMessage: "Search Store Issue",
                })}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
              <button
              className="btn btn-light"
               onClick={() => setReportModalOpen(true)}
            >
              <i className="ki-filled ki-document"></i>{" "}
              Store Issue Report
            </button>
            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/stock-management/storepo/add")}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.STORE_PO.ADD"
                  defaultMessage="Add Store Issue"
                />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#005BA8]/20 border-t-[#005BA8] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading Store Issues...</p>
          </div>
        ) : (
          <TableComponent
            columns={columns(
              permissions.edit ? handleEdit : null,
              permissions.delete ? handleDelete : null,
              handlePrint,
              handleExcel,
              handleStorePoPdf,
            )}
            data={tableData}
            paginationSize={100}
            loading={loading}
            getRowClassName={getRowClassName}
          />
        )}
      </Container>

      {/* Print Options Modal */}
      {printModalItem && (
        <PrintModal
          item={printModalItem}
          onClose={() => setPrintModalItem(null)}
          onConfirm={handlePrintConfirm}
        />
      )}
      {/* Store Issue Report Modal */}
{reportModalOpen && (
  <DateRangeReportModal
    onClose={() => setReportModalOpen(false)}
    onConfirm={handleReportConfirm}
    loading={reportLoading}
  />
)}
    </Fragment>
  );
};

export default StorePo;