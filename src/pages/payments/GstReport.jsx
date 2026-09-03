import { useState, useEffect, useMemo, Fragment } from "react";
import {
  ArrowLeft,
  FileText,
  Printer,
  TrendingUp,
  BadgePercent,
  CircleDollarSign,
  AlertCircle,
  Loader2,
  Search,
  ArrowUpDown,
  Download,
  Receipt,
  ShoppingCart,
  Landmark,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Filter,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Container } from "@/components/container";
import { GetGstReportData, GetGstReportPdf } from "@/services/apiServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormattedMessage, useIntl } from "react-intl";
// ─────────────────────────────────────────────────────────────────────────────
const TYPES = ["SALES", "PURCHASE"];
const PAGE_SIZE = 10;

const fmt = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtShort = (n) => `₹${fmt(n)}`;

// ── Column configs (as functions so labels can be translated) ─────────────────
const getSalesCols = (intl) => [
  { label: intl.formatMessage({ id: "COMMON.SR_NO", defaultMessage: "Sr No." }), key: "srNo", align: "center", width: "60px" },
  { label: intl.formatMessage({ id: "COMMON.DATE", defaultMessage: "Date" }), key: "date", align: "center", width: "100px", nowrap: true },
  { label: intl.formatMessage({ id: "COMMON.INV_NO", defaultMessage: "Inv No" }), key: "invNo", align: "center", width: "110px" },
  { label: intl.formatMessage({ id: "COMMON.NAME", defaultMessage: "Name" }), key: "name", align: "left", width: "180px" },
  {
    label: intl.formatMessage({ id: "COMMON.GST_NO", defaultMessage: "GST No." }),
    key: "gstNo",
    align: "center",
    width: "120px",
    small: true,
  },
  {
    label: intl.formatMessage({ id: "COMMON.BASIC_AMOUNT", defaultMessage: "Basic Amount" }),
    key: "basic",
    align: "right",
    width: "120px",
    numeric: true,
  },
  { label: intl.formatMessage({ id: "COMMON.CGST", defaultMessage: "CGST" }), key: "cgst", align: "right", width: "100px", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.SGST", defaultMessage: "SGST" }), key: "sgst", align: "right", width: "100px", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.IGST", defaultMessage: "IGST" }), key: "igst", align: "right", width: "100px", numeric: true },
  {
    label: intl.formatMessage({ id: "COMMON.TOTAL", defaultMessage: "Total" }),
    key: "total",
    align: "right",
    width: "120px",
    numeric: true,
    bold: true,
  },
];

const getPurchaseCols = (intl) => [
  { label: intl.formatMessage({ id: "COMMON.SR_NO", defaultMessage: "Sr No." }), key: "srNo", align: "center" },
  { label: intl.formatMessage({ id: "COMMON.DATE", defaultMessage: "Date" }), key: "date", align: "center", nowrap: true },
  { label: intl.formatMessage({ id: "COMMON.BILL_NO", defaultMessage: "Bill No" }), key: "billNo", align: "center" },
  { label: intl.formatMessage({ id: "COMMON.NAME", defaultMessage: "Name" }), key: "name", align: "left" },
  { label: intl.formatMessage({ id: "COMMON.PRODUCT_NAME", defaultMessage: "Product Name" }), key: "productName", align: "left" },
  { label: intl.formatMessage({ id: "COMMON.QTY", defaultMessage: "QTY." }), key: "qty", align: "center" },
  { label: intl.formatMessage({ id: "COMMON.BASIC_AMOUNT", defaultMessage: "Basic Amount" }), key: "basic", align: "right", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.CGST", defaultMessage: "CGST" }), key: "cgst", align: "right", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.SGST", defaultMessage: "SGST" }), key: "sgst", align: "right", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.IGST", defaultMessage: "IGST" }), key: "igst", align: "right", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.GST_AMOUNT", defaultMessage: "GST Amount" }), key: "gstAmt", align: "right", numeric: true },
  { label: intl.formatMessage({ id: "COMMON.TOTAL", defaultMessage: "Total" }), key: "total", align: "right", numeric: true, bold: true },
];

const TODAY = new Date();

const formatDateForApi = (date) => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const GstReport = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [fromDate, setFromDate] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1),
  );
  const [toDate, setToDate] = useState(TODAY);
  const [gstType, setGstType] = useState("SALES");
  const [gstFilter, setGstFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [oppositeTotal, setOppositeTotal] = useState(0);

  const isSales = gstType === "SALES";
  const columns = isSales ? getSalesCols(intl) : getPurchaseCols(intl);

  const fetchData = async () => {
    if (!fromDate || !toDate) return;
    try {
      setLoading(true);
      setError(null);
      setRows([]);
      setPage(1);

      const oppositeType = gstType === "SALES" ? "PURCHASE" : "SALES";

      const [res, oppositeRes] = await Promise.all([
        GetGstReportData(
          formatDateForApi(fromDate),
          formatDateForApi(toDate),
          userId,
          gstType,
          gstFilter,
        ),
        GetGstReportData(
          formatDateForApi(fromDate),
          formatDateForApi(toDate),
          userId,
          oppositeType,
          gstFilter,
        ),
      ]);

      const data = res?.data?.data?.data ?? [];
      const mappedData = data.map((r, i) => ({
        srNo: i + 1,
        date: r.date,
        invNo: r.invNo,
        billNo: r.billNo,
        name: r.name,
        productName: r.productName || r.name,
        qty: r.qty || "-",
        gstNo: r.gstNumber,
        basic: r.basicAmount,
        cgst: r.cgst,
        sgst: r.sgst,
        igst: r.igst,
        gstAmt: r.totalgst,
        total: r.total,
      }));
      setRows(mappedData);

      const oppositeData = oppositeRes?.data?.data?.data ?? [];
      const oppTotal = oppositeData.reduce(
        (s, r) => s + (Number(r.total) || 0),
        0,
      );
      setOppositeTotal(oppTotal);
    } catch (err) {
      console.error("GST report fetch error:", err);
      setError(
        intl.formatMessage({
          id: "COMMON.FAILED_TO_LOAD_DATA",
          defaultMessage: "Failed to load data. Please try again.",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate, gstType, gstFilter]);

  const totals = useMemo(() => {
    const total = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const cgst = rows.reduce((s, r) => s + (Number(r.cgst) || 0), 0);
    const sgst = rows.reduce((s, r) => s + (Number(r.sgst) || 0), 0);
    const igst = rows.reduce((s, r) => s + (Number(r.igst) || 0), 0);
    const gstAmt = rows.reduce((s, r) => s + (Number(r.gstAmt) || 0), 0);
    const allGst = cgst + sgst + igst;

    return {
      basic: total - allGst,
      cgst,
      sgst,
      igst,
      gstAmt,
      total,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pagedRows = filteredRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handlePrint = async () => {
    if (!fromDate || !toDate) return;
    try {
      setPdfLoading(true);
      const res = await GetGstReportPdf(
        formatDateForApi(fromDate),
        formatDateForApi(toDate),
        userId,
        gstType,
        gstFilter,
      );
      const fileUrl = res?.data?.fileUrl;
      if (fileUrl) window.open(fileUrl, "_blank");
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  // Stat cards
  const statCards = [
    {
      label: intl.formatMessage({ id: "COMMON.TOTAL_BASIC_AMOUNT", defaultMessage: "Total Basic Amount" }),
      value: fmtShort(totals.basic),
      sub: intl.formatMessage({ id: "COMMON.NET_TAXABLE_VALUE", defaultMessage: "Net taxable value" }),
      icon: Landmark,
      color: "#1e40af",
      bg: "#eff6ff",
    },
    {
      label: intl.formatMessage({ id: "COMMON.TOTAL_CGST", defaultMessage: "Total CGST" }),
      value: fmtShort(totals.cgst),
      sub: intl.formatMessage({ id: "COMMON.STANDARD_RATE", defaultMessage: "Standard 9% Rate" }),
      icon: BadgePercent,
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
    {
      label: intl.formatMessage({ id: "COMMON.TOTAL_SGST", defaultMessage: "Total SGST" }),
      value: fmtShort(totals.sgst),
      sub: intl.formatMessage({ id: "COMMON.STANDARD_RATE", defaultMessage: "Standard 9% Rate" }),
      icon: BadgePercent,
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
    {
      label: intl.formatMessage({ id: "COMMON.TOTAL_IGST", defaultMessage: "Total IGST" }),
      value: fmtShort(totals.igst),
      sub: intl.formatMessage({ id: "COMMON.INTER_STATE_TAX", defaultMessage: "Inter-state Tax" }),
      icon: CreditCard,
      color: "#1d4ed8",
      bg: "#eff6ff",
    },
    {
      label: intl.formatMessage({ id: "COMMON.TOTAL_AMOUNT", defaultMessage: "Total Amount" }),
      value: fmtShort(totals.total),
      sub: intl.formatMessage({ id: "COMMON.NET_RECEIVABLE_PAYABLE", defaultMessage: "Net Receivable / Payable" }),
      icon: Wallet,
      color: "#fff",
      bg: "#1e40af",
      dark: true,
    },
  ];

  return (
    <Fragment>
      <Container>
        <style>{`
          .gst-datepicker-wrap .react-datepicker-wrapper { width: 100%; }
          .gst-table th, .gst-table td { border-bottom: 1px solid #f1f5f9; }
          .gst-table tbody tr:last-child td { border-bottom: none; }
        `}</style>

        {/* ── Page Title ── */}
        <div className="mb-1">
          <h1 className="text-xl font-bold text-slate-900">
            <FormattedMessage
              id="COMMON.MONTH_WISE_GST_REPORT"
              defaultMessage="Month-wise GST Report"
            />
          </h1>

          <p className="text-xs text-slate-400 mt-0.5">
            <FormattedMessage
              id="COMMON.GST_REPORT_DESCRIPTION"
              defaultMessage="Analyze your tax liabilities and input tax credits across multiple periods."
            />
          </p>
        </div>

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 mt-4 mb-4">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div className="gst-datepicker-wrap">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <FormattedMessage id="COMMON.FROM_DATE" defaultMessage="From Date" />
              </label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => {
                  setFromDate(date);
                  if (toDate && date && toDate < date) setToDate(null);
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                className={inputCls}
                wrapperClassName="w-full"
                autoComplete="off"
              />
            </div>
            <div className="gst-datepicker-wrap">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <FormattedMessage id="COMMON.TO_DATE" defaultMessage="To Date" />
              </label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                minDate={fromDate || undefined}
                className={inputCls}
                wrapperClassName="w-full"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
              </label>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value)}
                className={inputCls}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                <FormattedMessage id="COMMON.GST_TYPE" defaultMessage="GST Type" />
              </label>
              <select
                value={gstFilter}
                onChange={(e) => setGstFilter(e.target.value)}
                className={inputCls}
              >
                <option value="">
                  <FormattedMessage id="COMMON.BOTH" defaultMessage="Both" />
                </option>
                <option value="with_gst">
                  <FormattedMessage id="COMMON.WITH_GST" defaultMessage="With GST" />
                </option>
                <option value="without_gst">
                  <FormattedMessage id="COMMON.WITHOUT_GST" defaultMessage="Without GST" />
                </option>
              </select>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-sm"
              style={{ background: "#2563eb" }}
            >
              <Filter size={14} />
              <FormattedMessage id="COMMON.APPLY_FILTER" defaultMessage="Apply Filter" />
            </button>
          </div>
        </div>

        {/* ── Summary Row — Sales / Purchase / Net ── */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Total GST Sales */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FormattedMessage id="COMMON.TOTAL_GST_SALES" defaultMessage="Total GST Sales" />
              </p>
              <TrendingUp size={24} className="text-primary" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              ₹{fmt(isSales ? totals.total : oppositeTotal)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              ↑ <FormattedMessage id="COMMON.GST_APPLICABLE" defaultMessage="GST Applicable" />
            </p>
          </div>

          {/* Total GST Purchase */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FormattedMessage id="COMMON.TOTAL_GST_PURCHASE" defaultMessage="Total GST Purchase" />
              </p>
              <ShoppingCart size={24} className="text-primary" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              ₹{fmt(isSales ? oppositeTotal : totals.total)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              ↑ <FormattedMessage id="COMMON.GST_APPLICABLE" defaultMessage="GST Applicable" />
            </p>
          </div>

          {/* Net Difference */}
          <div className="rounded-2xl px-5 py-4 flex flex-col justify-center bg-primary">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                <FormattedMessage id="COMMON.NET_DIFFERENCE" defaultMessage="Net Difference" />
              </p>
              <CircleDollarSign size={18} className="text-white/60" />
            </div>
            <p className="text-2xl font-black text-white">
              ₹
              {fmt(
                Math.abs(
                  (isSales ? totals.total : oppositeTotal) -
                    (isSales ? oppositeTotal : totals.total),
                ),
              )}
            </p>
            <p className="text-[10px] text-white/70 mt-1 font-medium">
              {(isSales ? totals.total : oppositeTotal) >=
              (isSales ? oppositeTotal : totals.total) ? (
                <>
                  ↑ <FormattedMessage id="COMMON.GROWTH_INDICATED" defaultMessage="Growth Indicated" />
                </>
              ) : (
                <>
                  ↓ <FormattedMessage id="COMMON.PURCHASE_EXCEEDS_SALES" defaultMessage="Purchase Exceeds Sales" />
                </>
              )}
            </p>
          </div>
        </div>

        {/* ── Stat Cards Row ── */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-2xl border px-4 py-4 flex items-start justify-between gap-2"
                style={{
                  background: card.dark ? card.bg : "#fff",
                  borderColor: card.dark ? "transparent" : "#f1f5f9",
                }}
              >
                <div className="min-w-0">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight ${card.dark ? "text-blue-200" : "text-slate-400"}`}
                  >
                    {card.label}
                  </p>
                  {loading ? (
                    <div
                      className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mt-1 ${card.dark ? "border-blue-300" : "border-blue-300"}`}
                    />
                  ) : (
                    <p
                      className={`text-xl font-black leading-tight ${card.dark ? "text-white" : "text-slate-900"}`}
                    >
                      {card.value}
                    </p>
                  )}
                  <p
                    className={`text-[9px] mt-1 font-medium ${card.dark ? "text-blue-300" : "text-slate-400"}`}
                  >
                    {card.sub}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: card.dark ? "rgba(255,255,255,0.15)" : card.bg,
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: card.dark ? "#fff" : card.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 gap-3">
            <div className="relative w-64">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_CUSTOMER_INVOICE",
                  defaultMessage: "Search customer, invoice, or city...",
                })}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                <ArrowUpDown size={12} />
                <FormattedMessage id="COMMON.SORT" defaultMessage="Sort" />
              </button>
              <button
                onClick={handlePrint}
                disabled={pdfLoading || rows.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Download size={12} />
                )}
                <FormattedMessage id="COMMON.EXPORT_PDF" defaultMessage="Export PDF" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-5 py-3 bg-red-50 border-b border-red-100">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto relative" style={{ minHeight: 200 }}>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-xs text-slate-400 font-medium">
                    <FormattedMessage id="COMMON.LOADING_RECORDS" defaultMessage="Loading records…" />
                  </span>
                </div>
              </div>
            )}

            <table
              className="w-full text-sm gst-table"
              style={{ tableLayout: "fixed" }}
            >
              <thead>
                <tr style={{ background: "#eff6ff" }}>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-[11px] font-bold text-slate-600 uppercase tracking-wide whitespace-nowrap"
                      style={{
                        textAlign: col.align,
                        width: col.width,
                        minWidth: col.width,
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && pagedRows.length > 0 ? (
                  pagedRows.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={[
                            "px-4 py-3 text-sm",
                            col.nowrap ? "whitespace-nowrap" : "",
                            col.small ? "text-xs text-slate-500" : "",
                            col.bold
                              ? "font-semibold text-slate-900"
                              : "text-slate-600",
                          ].join(" ")}
                          style={{
                            textAlign: col.align,
                            width: col.width,
                            minWidth: col.width,
                          }}
                        >
                          {col.numeric
                            ? `₹ ${fmt(row[col.key])}`
                            : row[col.key] != null && row[col.key] !== ""
                              ? row[col.key]
                              : "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-16 text-center text-slate-400 text-sm"
                    >
                      <FormattedMessage
                        id="COMMON.NO_RECORDS_FOUND"
                        defaultMessage="No records found for the selected filters."
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              {filteredRows.length > 0 ? (
                <FormattedMessage
                  id="COMMON.SHOWING_ENTRIES"
                  defaultMessage="Showing {from} to {to} of {total} entries"
                  values={{
                    from: (page - 1) * PAGE_SIZE + 1,
                    to: Math.min(page * PAGE_SIZE, filteredRows.length),
                    total: filteredRows.length,
                  }}
                />
              ) : (
                <FormattedMessage id="COMMON.NO_ENTRIES" defaultMessage="No entries" />
              )}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={12} />
                <FormattedMessage id="COMMON.PREVIOUS" defaultMessage="Previous" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .map((p, idx, arr) => (
                  <Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-1 text-slate-400 text-xs">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-colors"
                      style={
                        p === page
                          ? { background: "#2563eb", color: "#fff" }
                          : { color: "#64748b" }
                      }
                    >
                      {p}
                    </button>
                  </Fragment>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FormattedMessage id="COMMON.NEXT" defaultMessage="Next" />
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </Container>
    </Fragment>
  );
};

export default GstReport;