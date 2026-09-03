import { Fragment, useEffect, useState, useCallback, useMemo } from "react";
import { Container } from "@/components/container";
import {
  Printer, Eye, DollarSign, FileText, ShoppingCart,
  ClipboardList, Package, ChevronDown, X, PrinterCheck, FileSpreadsheet,
} from "lucide-react";
import {
  GetRawMaterialcategory, GetStockReport, GetStockTypeByUserId,
  GetStockPdfReport, GetStockPdfReport2, GetStockExcelReport,
} from "../../../services/apiServices";
import { message } from "antd";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

// ── Constants ──────────────────────────────────────────────────────────────
const PAGE_SIZES = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 20;

// Godown / Kitchen main-type filter — drives which Item Types get fetched,
// same pattern as AddPurchaseReturn's `selectedMainType`.
const MAIN_TYPES = [

  { value: 0, label: "Godown" },
  { value: 1, label: "Kitchen" },
];

const ThreeTypeSelect = ({ godownTypes, kitchenTypes, godownVal, kitchenVal, onGodownChange, onKitchenChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {/* Godown */}
    <div className="flex flex-col">
      <FieldLabel>Type</FieldLabel>
      <div className="relative">
        <select
          value={godownVal ?? ""}
          onChange={(e) => onGodownChange(e.target.value || undefined)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition appearance-none pr-8 cursor-pointer"
        >
          {godownTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>

    {/* Kitchen */}
    {/* <div className="flex flex-col">
      <FieldLabel>Kitchen</FieldLabel>
      <div className="relative">
        <select
          value={kitchenVal ?? ""}
          onChange={(e) => onKitchenChange(e.target.value || undefined)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition appearance-none pr-8 cursor-pointer"
        >
          {kitchenTypes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div> */}
  </div>
);

// ── Reusable UI Components ─────────────────────────────────────────────────
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
      <div className="w-1 h-5 rounded-full bg-[#005BA8] flex-shrink-0" />
      <Icon size={18} className="text-[#005BA8]" />
      <span className="font-semibold text-md text-gray-800">{title}</span>
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
    {children}
  </label>
);

const DateField = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <FieldLabel>{label}</FieldLabel>
    <input
      type="date" value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <FieldLabel>{label}</FieldLabel>
    <div className="relative">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition appearance-none pr-8 cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

// ── Generic Action Buttons ─────────────────────────────────────────────────
const ActionButton = ({ onClick, loading, disabled, icon: Icon, label, variant = "default" }) => {
  const variants = {
    default: "border border-gray-700 bg-white text-gray-600 hover:border-[#005BA8] hover:text-[#005BA8]",
    primary: "bg-[#005BA8] text-white hover:bg-[#004a8c]",
    excel:   "border border-green-700 bg-white text-green-800 hover:border-green-600 hover:bg-green-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {loading ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          {variant === "excel" ? "Exporting..." : "Generating..."}
        </>
      ) : (
        <><Icon size={16} /> {label}</>
      )}
    </button>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({ size = "md" }) => {
  const s = size === "sm" ? "w-4 h-4 border-2" : "w-10 h-10 border-4";
  return <div className={`${s} border-[#005BA8]/20 border-t-[#005BA8] rounded-full animate-spin`} />;
};

// ── Pagination ─────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalRecords, pageSize, onPageChange, onPageSizeChange }) => {
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
      .reduce((acc, p, idx, arr) => {
        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  }, [totalPages, currentPage]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-sm text-gray-600 flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <span>
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
          {totalRecords > 0 && <span className="ml-2 text-gray-400">({totalRecords} records)</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#005BA8]"
          >
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {[
          { label: "«", page: 1, disabled: currentPage === 1 },
          { label: "‹", page: currentPage - 1, disabled: currentPage === 1 },
        ].map(({ label, page, disabled }) => (
          <button key={label} onClick={() => onPageChange(page)} disabled={disabled}
            className="px-2 py-1 rounded border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-xs">
            {label}
          </button>
        ))}

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1 text-gray-400">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded border text-xs font-medium transition ${currentPage === p ? "bg-[#005BA8] text-white border-[#005BA8]" : "border-gray-200 hover:bg-white text-gray-700"}`}>
              {p}
            </button>
          )
        )}

        {[
          { label: "›", page: currentPage + 1, disabled: currentPage === totalPages },
          { label: "»", page: totalPages,       disabled: currentPage === totalPages },
        ].map(({ label, page, disabled }) => (
          <button key={label} onClick={() => onPageChange(page)} disabled={disabled}
            className="px-2 py-1 rounded border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-xs">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Preview Modal ──────────────────────────────────────────────────────────
const PreviewModal = ({
  open, onClose, reportData, loadingReport, searchQuery, onSearchChange,
  currentPage, totalPages, totalRecords, pageSize,
  onPageChange, onPageSizeChange, onPrint, onExcel,
  printLoading, excelLoading,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[1300px] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b gap-4">
          <h2 className="font-semibold text-lg whitespace-nowrap">Stock Report Preview</h2>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text" placeholder="Search item or category..."
              value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[500px] overflow-auto">
          {loadingReport ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Spinner />
              <p className="text-sm text-gray-500 font-medium">Generating report...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No data found</div>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {["#","Item","Category","OPB","Purchase","P. Return","Sell","S. Return","Increase","Wastage","Final","Unit","Rate","Amount"]
                    .map((h) => (
                      <th key={h} className={`border px-2 py-2 ${["OPB","Purchase","P. Return","Sell","S. Return","Increase","Wastage","Final","Rate","Amount"].includes(h) ? "text-right" : ""}`}>{h}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.srNo} className="hover:bg-gray-50">
                    <td className="border px-2 py-1 text-center">{row.srNo}</td>
                    <td className="border px-2 py-1">{row.itemName}</td>
                    <td className="border px-2 py-1">{row.categoryName}</td>
                    {[row.opb, row.purchase, row.purchaseReturn, row.sell, row.sellReturn, row.increase, row.wastage ,].map((v, i) => (
                      <td key={i} className="border px-2 py-1 text-right">{v}</td>
                    ))}
                    <td className={`border px-2 py-1 text-right font-semibold ${row.amount < 0 ? "text-red-800" : "text-gray-800"}`}>{row.finalTotal}</td>
                    <td className="border px-2 py-1">{row.unit}</td>
                    <td className="border px-2 py-1 text-right">{row.rate}</td>
                    <td className={`border px-2 py-1 text-right font-bold ${row.amount < 0 ? "text-red-800" : "text-primary"}`}>₹ {row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage} totalPages={totalPages}
          totalRecords={totalRecords} pageSize={pageSize}
          onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
        />

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Close</button>
          <ActionButton onClick={onExcel} loading={excelLoading} disabled={loadingReport} icon={FileSpreadsheet} label="Excel" variant="excel" />
          <ActionButton onClick={onPrint} loading={printLoading} disabled={loadingReport} icon={PrinterCheck} label="Print" variant="primary" />
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function StockReport() {
  const userId = Number(localStorage.getItem("userId")) || 0;

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
const [soMainType, setSoMainType] = useState(1); // Godown (1) by default
const [soType,     setSoType]     = useState("");
const [soStockTypes, setSoStockTypes] = useState([]);
  // Stock Order filters
  const [soCategory, setSoCategory] = useState("");
// Stock Order section
const [soAllTypes, setSoAllTypes]         = useState([]);
const [soGodownTypes, setSoGodownTypes]   = useState([]);
const [soKitchenTypes, setSoKitchenTypes] = useState([]);
const [soAllType, setSoAllType]           = useState(undefined);
const [soGodownType, setSoGodownType]     = useState(undefined);
const [soKitchenType, setSoKitchenType]   = useState(undefined);

// Date Wise section
const [dwsAllTypes, setDwsAllTypes]         = useState([]);
const [dwsGodownTypes, setDwsGodownTypes]   = useState([]);
const [dwsKitchenTypes, setDwsKitchenTypes] = useState([]);
const [dwsAllType, setDwsAllType]           = useState(undefined);
const [dwsGodownType, setDwsGodownType]     = useState(undefined);
const [dwsKitchenType, setDwsKitchenType]   = useState(undefined);
  // Date Wise Stock filters
  const [dwsFrom,     setDwsFrom]     = useState("");
  const [dwsTo,       setDwsTo]       = useState("");
  const [dwsCategory, setDwsCategory] = useState("");
 const [dwsMainType, setDwsMainType] = useState(1);
  const [dwsType,     setDwsType]     = useState("");

  // Preview modal state
  const [previewOpen,   setPreviewOpen]   = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [reportData,    setReportData]    = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalRecords,  setTotalRecords]  = useState(0);
  const [pageSize,      setPageSize]      = useState(DEFAULT_PAGE_SIZE);

  // Loading states
  const [soPrintLoading,  setSoPrintLoading]  = useState(false);
  const [dwsPrintLoading, setDwsPrintLoading] = useState(false);
  const [soExcelLoading,  setSoExcelLoading]  = useState(false);
  const [dwsExcelLoading, setDwsExcelLoading] = useState(false);
  const [printLoading,    setPrintLoading]    = useState(false);
  const [modalExcelLoading, setModalExcelLoading] = useState(false);
  const { filterStockTypes } = useStockTypePermission();



  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const openFile = (url) => {
    if (url) setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 0);
  };

const getFilters = useCallback((section) => ({
  catId:         section === "stockOrder" ? soCategory || 0 : dwsCategory || 0,
  stockId:       section === "stockOrder" ? soGodownType || 0 : dwsGodownType || 0,
  kitchenTypeId: section === "stockOrder" ? soKitchenType || 0 : dwsKitchenType || 0,
  fromDate:      section === "stockOrder" ? "" : formatDate(dwsFrom),
  toDate:        section === "stockOrder" ? "" : formatDate(dwsTo),
}), [soCategory, soGodownType, soKitchenType,
     dwsCategory, dwsGodownType, dwsKitchenType,
     dwsFrom, dwsTo]);


  // ── Fetch report data ─────────────────────────────────────────────────────
const fetchReportData = useCallback(async ({ section, page = 1, size = pageSize, itemName = "" }) => {
  try {
    setLoadingReport(true);
    const { catId, stockId, kitchenTypeId, fromDate, toDate } = getFilters(section);
    const res = await GetStockReport(itemName, userId, catId, stockId, fromDate, toDate, page, size, kitchenTypeId);
      const data = res?.data?.data;
      setReportData(data?.items || []);
      setCurrentPage(page);
      setTotalRecords(data?.totalItems ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReport(false);
    }
  }, [userId, pageSize, getFilters]);

  // ── Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewOpen) return;
    const timer = setTimeout(() => {
      fetchReportData({ section: activeSection, page: 1, size: pageSize, itemName: searchQuery });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Load categories (once) ────────────────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catRes = await GetRawMaterialcategory(userId);
        const cats = catRes?.data?.data?.["Raw Material Category Details"] || [];
        setCategories([
          { value: "", label: "All Categories" },
          ...cats.map((c) => ({ value: c.id, label: c.nameEnglish })),
        ]);
      } catch (err) {
        console.error("Category load error:", err);
      }
    };
    loadCategories();
  }, [userId]);

// ── Load item types whenever Godown/Kitchen (main type) changes — Date Wise section ──
useEffect(() => {
  const loadAllStockTypes = async () => {
    try {
      const [allRes, godownRes, kitchenRes] = await Promise.all([
        GetStockTypeByUserId(userId, ''),
        GetStockTypeByUserId(userId, ''),
        GetStockTypeByUserId(userId, 1),
      ]);

      const parse = (res) =>
        Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];

      const toOptions = (arr) => [
        { value: "", label: "All Types" },
        ...filterStockTypes(arr).map((t) => ({
          value: t.stocktypeid ?? t.stockTypeId ?? t.id,
          label: t.nameEnglish,
        })),
      ];

      const all     = toOptions(parse(allRes));
      const godown  = toOptions(parse(godownRes));
      const kitchen = toOptions(parse(kitchenRes));

      // both sections share same lists
      setSoAllTypes(all);
      setSoGodownTypes(godown);
      setSoKitchenTypes(kitchen);

      setDwsAllTypes(all);
      setDwsGodownTypes(godown);
      setDwsKitchenTypes(kitchen);
    } catch (err) {
      console.error("Stock type load error:", err);
    }
  };
  loadAllStockTypes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId]);

  // ── PDF/Excel helpers ─────────────────────────────────────────────────────
  const downloadExcel = async (catId, stockId, fromDate, toDate, setLoading, itemName = "" , kitchenTypeId = 0) => {
    try {
      setLoading(true);
   const res = await GetStockExcelReport(userId, catId, stockId, fromDate, toDate, "", kitchenTypeId);
      const fileUrl = res?.data?.fileUrl;
      fileUrl ? openFile(fileUrl) : message.error(res?.data?.msg || "Failed to generate Excel");
    } catch {
      message.error("Failed to generate Excel report");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (apiCall, setLoading) => {
    try {
      setLoading(true);
      const res = await apiCall();
      const fileUrl = res?.data?.fileUrl;
      fileUrl ? openFile(fileUrl) : message.error(res?.data?.msg || "Failed to generate PDF");
    } catch {
      message.error("Failed to generate PDF report");
    } finally {
      setLoading(false);
    }
  };

  // ── Section handlers ──────────────────────────────────────────────────────
  const openPreview = (section) => {
    setReportData([]);
    setSearchQuery("");
    setPreviewOpen(true);
    setActiveSection(section);
    setCurrentPage(1);
    fetchReportData({ section, page: 1 });
  };

  const handlePageChange = (page) => fetchReportData({ section: activeSection, page, size: pageSize, itemName: searchQuery });
  const handlePageSizeChange = (size) => { setPageSize(size); fetchReportData({ section: activeSection, page: 1, size, itemName: searchQuery }); };

  // Selecting a new Godown/Kitchen main type invalidates the previously
  // selected Item Type, since the available list of types changes.
  const handleMainTypeChange = (value) => {
    setDwsMainType(value);
    setDwsType("");
  };

const handleModalPrint = () => {
  const { catId, stockId, kitchenTypeId, fromDate, toDate } = getFilters(activeSection);
  downloadPdf(
    () => GetStockPdfReport(userId, catId, stockId, fromDate, toDate, 1, "", kitchenTypeId),
    setPrintLoading
  );
};

const handleModalExcel = () => {
  const { catId, stockId, kitchenTypeId, fromDate, toDate } = getFilters(activeSection);
  downloadExcel(catId, stockId, fromDate, toDate, setModalExcelLoading, searchQuery, kitchenTypeId);
};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Container>
        <PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          reportData={reportData}
          loadingReport={loadingReport}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onPrint={handleModalPrint}
          onExcel={handleModalExcel}
          printLoading={printLoading}
          excelLoading={modalExcelLoading}
        />

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-gray-800">Report Generation Center</h1>
        </div>


      <SectionCard icon={Package} title="Stock Order Report">
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="w-64">
      <SelectField label="Item Category" value={soCategory} onChange={setSoCategory} options={categories} />
    </div>
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={() => downloadPdf(
          () => GetStockPdfReport(userId, soCategory || 0, 0, "", "", 1, "", 0),
          setSoPrintLoading
        )}
        loading={soPrintLoading} icon={Printer} label="Print"
      />
      <ActionButton
        onClick={() => downloadExcel(soCategory || 0, 0, "", "", setSoExcelLoading, "", 0)}
        loading={soExcelLoading} icon={FileSpreadsheet} label="Excel" variant="excel"
      />
      <ActionButton onClick={() => openPreview("stockOrder")} icon={Eye} label="Preview" variant="primary" />
    </div>
  </div>
</SectionCard>
        {/* Date Wise Stock Report */}
       <SectionCard icon={ClipboardList} title="Date Wise Stock Report">
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <DateField label="From Date" value={dwsFrom} onChange={setDwsFrom} />
      <DateField label="To Date"   value={dwsTo}   onChange={setDwsTo} />
      <SelectField label="Item Category" value={dwsCategory} onChange={setDwsCategory} options={categories} />
      <div className="col-span-2">
       <ThreeTypeSelect
  godownTypes={dwsGodownTypes}   kitchenTypes={dwsKitchenTypes}
  godownVal={dwsGodownType}      kitchenVal={dwsKitchenType}
  onGodownChange={setDwsGodownType}
  onKitchenChange={setDwsKitchenType}
/>
      </div>
    </div>
    <div className="flex justify-end gap-2">
      <ActionButton
  onClick={() => downloadPdf(
    () => GetStockPdfReport(
      userId,
      dwsCategory || 0,
      dwsAllType || dwsGodownType || dwsKitchenType || 0,
      formatDate(dwsFrom), formatDate(dwsTo), 1, "",
      dwsGodownType || dwsKitchenType || 0   // ← kitchenTypeId
    ),
    setDwsPrintLoading
  )}
  loading={dwsPrintLoading} icon={Printer} label="Print"
/>
      <ActionButton
  onClick={() => downloadExcel(
    dwsCategory || 0,
    dwsAllType || dwsGodownType || dwsKitchenType || 0,
    formatDate(dwsFrom), formatDate(dwsTo),
    setDwsExcelLoading, "",
    dwsGodownType || dwsKitchenType || 0   // ← kitchenTypeId
  )}
  loading={dwsExcelLoading} icon={FileSpreadsheet} label="Excel" variant="excel"
/>
      <ActionButton onClick={() => openPreview("dateWise")} icon={Eye} label="Preview" variant="primary" />
    </div>
  </div>
</SectionCard>
      </Container>
    </Fragment>
  );
}