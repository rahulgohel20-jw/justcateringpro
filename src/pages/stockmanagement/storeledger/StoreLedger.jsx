import { useState, useEffect, useRef, Fragment, useMemo } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Printer,
  Search,
  Utensils,
  Wallet,
  PackageCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Container } from "@/components/container";
import { SearchRawMaterial, GetStockLedger, GetStockLedgerPdfReport  } from "@/services/apiServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TableComponent } from "../../../components/table/TableComponent";
import { columns } from "./constant";

const DROPDOWN_PAGE_SIZE = 100;
const TODAY = new Date();









const StoreLedger = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({ from_date: TODAY, to_date: TODAY });
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [dropdownTotalRecords, setDropdownTotalRecords] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef(null);
  const dropdownRef = useRef(null);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");

  const tableData = useMemo(() => {
    if (!ledgerData?.rows) return [];
    return ledgerData.rows.map((row, index) => ({
      id: index,
      date: row.date || "-",
      vno: row.vno || "-",
      supplier_name: row.supplierName || "-",
      bill_no: row.billNo || "-",
      purchase: row.purchase ?? 0,
      purchase_return: row.purchaseReturn ?? 0,
      sale: row.sale ?? 0,
      sale_return: row.saleReturn ?? 0,
      balance: row.balance ?? 0,
      increase:row.increase??0,
      wastage:row.wastage ?? 0
    }));
  }, [ledgerData]);

  const FetchSearchDropdown = (searchTerm, page = 1, append = false) => {
    if (!searchTerm.trim()) {
      setMenuItems([]);
      setDropdownTotalRecords(0);
      setDropdownPage(1);
      setHasMore(false);
      setShowDropdown(false);
      return;
    }
    page === 1 ? setLoadingItems(true) : setLoadingMore(true);
    SearchRawMaterial(true,userId, page, DROPDOWN_PAGE_SIZE, searchTerm)
      .then((res) => {
        const data = res?.data?.data || {};
        const items = data["Raw Material Details"] || [];
        const totalItems = data.totalItems || 0;
        setMenuItems((prev) => (append ? [...prev, ...items] : items));
        setDropdownTotalRecords(totalItems);
        setDropdownPage(page);
        setHasMore(page * DROPDOWN_PAGE_SIZE < totalItems);
        setShowDropdown(true);
      })
      .catch(() => { setMenuItems([]); setHasMore(false); })
      .finally(() => { setLoadingItems(false); setLoadingMore(false); });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setDropdownPage(1); setMenuItems([]); setHasMore(false);
        FetchSearchDropdown(searchQuery, 1, false);
      } else {
        setMenuItems([]); setShowDropdown(false); setHasMore(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore)
        FetchSearchDropdown(searchQuery, dropdownPage + 1, true);
    }, { threshold: 1.0 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, dropdownPage, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectItem = (item) => {
  setSelectedItem({ id: item.id, name: item.nameEnglish });
  setSearchQuery(item.nameEnglish || "");
  setShowDropdown(false);

  
  setPrice(item.supplierRate ?? "");
  setUnit(item.unitName ?? "");

  if (form.from_date && form.to_date)
    fetchLedger(item.id, form.from_date, form.to_date);
};

  const formatDateForApi = (date) => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const fetchLedger = async (itemId, fromDate, toDate) => {
    if (!itemId || !fromDate || !toDate) return;
    try {
      setLedgerLoading(true);
      const res = await GetStockLedger(
        formatDateForApi(fromDate), itemId, formatDateForApi(toDate), userId
      );
      if (res?.data?.success) {
  setLedgerData(res.data.data);

  
  setPrice(res.data.data?.supplierRate ?? "");
  setUnit(res.data.data?.unitName ?? "");
}
      
      else setLedgerData(null);
    } catch (err) {
      console.error("Error fetching stock ledger:", err);
      setLedgerData(null);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItem?.id && form.from_date && form.to_date)
      fetchLedger(selectedItem.id, form.from_date, form.to_date);
  }, [selectedItem, form.from_date, form.to_date]);

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelCls =
    "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

const handlePrint = async () => {
  if (!selectedItem?.id || !form.from_date || !form.to_date) return;
  try {
    const res = await GetStockLedgerPdfReport(
      userId,
      selectedItem.id,
      formatDateForApi(form.from_date),
      formatDateForApi(form.to_date),
      1
    );

    const fileUrl = res?.data?.fileUrl;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  } catch (err) {
    console.error("Failed to generate PDF:", err);
  }
};



  return (
    <Fragment>
      <Container>

        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-primary" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              General Stock Ledger
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
  onClick={handlePrint}
  disabled={!selectedItem?.id || !form.from_date || !form.to_date}
  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors shadow-sm ${
    selectedItem?.id && form.from_date && form.to_date
      ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
  }`}
>
  <Printer size={14} /> Print
</button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* ── Filter Row + OPB Card ── */}
        <div className="flex items-stretch gap-4 mb-5">

          {/* Filters */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
            <div className="grid grid-cols-4 gap-5">

              {/* Item Name */}
              <div>
                <label className={labelCls}>Item Name</label>
                <div ref={dropdownRef} className="relative">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value.trim()) {
                          setSelectedItem(null);
                          setLedgerData(null);
                        }
                      }}
                      placeholder="Search item name..."
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                    {loadingItems && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {showDropdown && (
                    <div className="absolute z-[999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                      <ul className="max-h-48 overflow-y-auto">
                        {menuItems.length > 0 ? (
                          <>
                            {menuItems.map((item, i) => (
                              <li
                                key={i}
                                onMouseDown={() => handleSelectItem(item)}
                                className="px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                              >
                                <span className="font-medium">{item.nameEnglish}</span>
                                {item.rawMaterialCat?.nameEnglish && (
                                  <span className="ml-2 text-xs text-slate-400">
                                    ({item.rawMaterialCat.nameEnglish})
                                  </span>
                                )}
                              </li>
                            ))}
                            <li ref={loaderRef} className="px-4 py-2 text-center">
                              {loadingMore && (
                                <div className="flex justify-center">
                                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </li>
                          </>
                        ) : (
                          !loadingItems && (
                            <li className="px-4 py-3 text-sm text-slate-400 text-center">
                              No items found
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Unit</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled
                  className={inputCls}
                />
              </div>
             

              {/* From Date */}
              <div>
                <label className={labelCls}>From Date</label>
                <DatePicker
                  selected={form.from_date}
                  onChange={(date) =>
                    setForm((prev) => ({
                      ...prev,
                      from_date: date,
                      to_date: prev.to_date && date && prev.to_date < date ? null : prev.to_date,
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  
                  className={inputCls}
                  wrapperClassName="w-full"
                  autoComplete="off"
                />
              </div>

              {/* To Date */}
              <div>
                <label className={labelCls}>To Date</label>
                <DatePicker
                  selected={form.to_date}
                  onChange={(date) => setForm((prev) => ({ ...prev, to_date: date }))}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  minDate={form.from_date || undefined}
                  
                  className={inputCls}
                  wrapperClassName="w-full"
                  autoComplete="off"
                />
              </div>

            </div>
          </div>

          {/* ── Opening Balance (OPB) Card ── */}
          <div className="w-52 shrink-0 bg-primary rounded-2xl shadow-sm px-5 py-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none">
                  Opening Balance
                </p>
                <p className="text-[10px] font-semibold text-blue-300 mt-0.5">(OPB)</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-4xl font-black text-white leading-none">
                {ledgerData?.opb ?? "0"}
              </span>
              <span className="ml-1.5 text-sm font-semibold text-blue-200">{unit}</span>
            </div>
            {/* <div className="mt-2">
  <p className="text-[10px] text-blue-200 uppercase">Price</p>
  <p className="text-lg font-bold text-white">₹ {price || 0}</p>
</div> */}
          </div>

        </div>

        {/* ── Stock Details Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Section Header */}
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Stock Details
              {ledgerData?.itemName && (
                <span className="ml-2 font-extrabold text-primary uppercase">
                  — {ledgerData.itemName}
                </span>
              )}
              {selectedItem?.name && !ledgerData?.itemName && (
                <span className="ml-2 font-extrabold text-primary uppercase">
                  — {selectedItem.name}
                </span>
              )}
            </h2>
          </div>

          {/* Table */}
          <div className="relative">
            {ledgerLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                <div className="w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <TableComponent columns={columns()} data={tableData} />
          </div>

        </div>

        {/* ── Final Closing Stock Card (bottom-right, like screenshot) ── */}
        <div className="flex justify-end mt-4">
          <div className="bg-primary rounded-2xl shadow-lg px-6 py-4 flex items-center gap-5 min-w-[220px]">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none">
                Final Closing Stock
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white leading-none">
                  {ledgerData?.closingStock ?? "0"}
                </span>
                <span className="text-sm font-semibold text-blue-200">{unit}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <PackageCheck size={25} className="text-white" />
            </div>
          </div>
        </div>

      </Container>
    </Fragment>
  );
};

export default StoreLedger;