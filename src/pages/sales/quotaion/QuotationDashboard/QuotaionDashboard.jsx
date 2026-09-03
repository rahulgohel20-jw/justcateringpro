import { Fragment, useState, useEffect, useMemo } from "react";
import { Container } from "@/components/container";
import { columns, defaultData } from "./constant";
import QuotationTable from "@/components/QuotationTable/QuotationTable";
import { CommonHexagonBadge } from "@/partials/common";
import {
  GetAllQuotation,
  GetAllQuotationByFilter,
  getexcelforqutation,
  GetVenueType,
  GetAllBanquet,
} from "@/services/apiServices";
import { toAbsoluteUrl } from "@/utils";
import { Download } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { usePermission } from "../../../../hooks/usePermission";
import { useModuleAccess } from "../../../../hooks/useModuleAccess";

const formatDateAPI = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const QuotationDashboard = () => {
  const permissions = usePermission("Quotation");
  const userId = localStorage.getItem("userId");

  const [tableData, setTableData] = useState(defaultData);
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [originalData, setOriginalData] = useState([]);
  const [totals, setTotals] = useState({ receivable: 0, remaining: 0, total: 0 });
  const [venueList, setVenueList] = useState([]);
  const [banquetList, setBanquetList] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState("");
const { hasModuleAccess } = useModuleAccess();
    const canAccessBanquet = hasModuleAccess("Banquet");
  const calculateDateRange = (filterValue) => {
    const end = new Date();
    const start = new Date();

    if (filterValue === "1") {
      start.setMonth(start.getMonth() - 3);
    } else if (filterValue === "2") {
      start.setMonth(start.getMonth() - 6);
    } else if (filterValue === "3" && customRange.start && customRange.end) {
      return {
        startDate: new Date(customRange.start),
        endDate: new Date(customRange.end),
      };
    }

    return { startDate: start, endDate: end };
  };

  const fetchQuotations = async (filterValue = "", venueId = "", banquetId = "") => {
  try {
    let filterId = "";
    let isVenue = "";

    if (venueId) {
      filterId = venueId;
      isVenue = true;
    } else if (banquetId) {
      filterId = banquetId;
      isVenue = false;
    }

    let response;

    if (filterValue === "") {
      if (filterId !== "") {
        // ✅ userId in correct position
        response = await GetAllQuotationByFilter("", "", userId, filterId, isVenue);
      } else {
        response = await GetAllQuotation(userId);
      }
    } else {
      const { startDate, endDate } = calculateDateRange(filterValue);
      // ✅ already correct
      response = await GetAllQuotationByFilter(
        formatDateAPI(endDate),
        formatDateAPI(startDate),
        userId,
        filterId,
        isVenue,
      );
    }

    const list = response?.data?.data?.["Event Functions Quotation Details"] || [];
    setOriginalData(list);
    setTotals({
      receivable: list[0]?.overAllReceivableAmnt || 0,
      remaining: list[0]?.overAllRemainingAmnt || 0,
      total: list[0]?.overallTotalAmnt || 0,
    });
  } catch (err) {
    console.error("Fetch quotations error:", err);
  }
};

  const fetchVenueList = async () => {
    try {
      const uid = localStorage.getItem("userId");
      if (!uid) return;
      const res = await GetVenueType("", uid);
      const list = res?.data?.data?.["Venue Details"] || [];
      setVenueList(list);
    } catch (err) {
      console.error("Venue fetch error:", err);
    }
  };

  const fetchBanquetList = async () => {
  try {
    const res = await GetAllBanquet(userId);
    const list = res?.data?.data || [];
    setBanquetList(list);
  } catch (err) {
    console.error("Banquet fetch error:", err);
  }
};

const handleExcelDownload = async () => {
  let excelStart = "";
  let excelEnd = "";

  if (selectedMonth === "1") {
    const today = new Date();
    const before3 = new Date();
    before3.setMonth(today.getMonth() - 3);
    excelStart = formatDateAPI(before3);
    excelEnd = formatDateAPI(today);
  } else if (selectedMonth === "2") {
    const today = new Date();
    const before6 = new Date();
    before6.setMonth(today.getMonth() - 6);
    excelStart = formatDateAPI(before6);
    excelEnd = formatDateAPI(today);
  } else if (selectedMonth === "3") {
    if (!customRange.start || !customRange.end) return;
    excelStart = formatDateAPI(customRange.start);
    excelEnd = formatDateAPI(customRange.end);
  }

  let filterId = "";
  let isVenue = "";

  if (selectedVenue) {
    filterId = selectedVenue;
    isVenue = true;
  } else if (selectedBanquet) {
    filterId = selectedBanquet;
    isVenue = false;
  }

  try {
    const response = await getexcelforqutation(
      excelStart,
      excelEnd,
      userId,
      filterId,
      isVenue,
    );
    const fileUrl = response?.data?.data;
    if (!fileUrl) {
      console.error("No download URL returned");
      return;
    }

    const fileName = fileUrl.split("/").pop();
    const blobResponse = await fetch(fileUrl);
    const blob = await blobResponse.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Excel download failed", err);
  }
};

  useEffect(() => {
    fetchQuotations("", "", "");
    fetchVenueList();
    fetchBanquetList();
  }, []);

  useEffect(() => {
    const lang = localStorage.getItem("lang");
    const languageMap = { en: "nameEnglish", hi: "nameHindi", gu: "nameGujarati" };
    const field = languageMap[lang] || "nameEnglish";

    const mapped = originalData.map((q, index) => ({
      Invoice: index + 1,
      EventId: q?.event?.id || "-",
      PartyId: q?.event?.party?.id || "-",
      CustomerName: q?.event?.party?.[field] || "-",
      Eventname: q?.event?.eventType?.[field] || "-",
      eventDate: q?.event?.eventStartDateTime
        ? formatDateDisplay(q.event.eventStartDateTime)
        : "-",
      QuotationDate: q?.createdAt || "-",
      Amount: q?.totalAmount || "-",
      BalanceDue: q?.remainingAmount || "-",
      TotalAmount: q?.grandTotal || "-",
    }));

    setTableData(mapped);
  }, [originalData]);

  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const s = searchText.toLowerCase();
      return (
        row.CustomerName?.toLowerCase().includes(s) ||
        row.Eventname?.toLowerCase().includes(s) ||
        String(row.Invoice)?.toLowerCase().includes(s)
      );
    });
  }, [tableData, searchText]);

  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>

      <Container>
        <div className="mb-3 md:mb-4">
          <h1 className="text-xl md:text-xl lg:text-2xl text-gray-900">
            <FormattedMessage
              id="SALES.QUOTATION_OVERVIEW"
              defaultMessage="Quotation Overview"
            />
          </h1>
        </div>

        <div className="filters flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2 mb-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 md:gap-3 flex-1">

            {/* Search */}
            <div className="filItems relative w-full sm:w-auto">
              <i className="ki-filled ki-magnifier leading-none text-sm md:text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8 w-full sm:w-64 text-sm md:text-base"
                placeholder="Search Quotation"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div className="filItems relative w-full sm:w-auto">
              <select
                className="select pe-7.5 w-full sm:w-auto text-sm md:text-base"
                value={selectedMonth}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedMonth(v);
                  if (v !== "3") fetchQuotations(v, selectedVenue, selectedBanquet);
                }}
              >
                <option value="">All Quotations</option>
                <option value="1">Last 3 Months</option>
                <option value="2">Last 6 Months</option>
                <option value="3">Custom Date</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {selectedMonth === "3" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="date"
                  className="input"
                  value={customRange.start}
                  onChange={(e) => setCustomRange((p) => ({ ...p, start: e.target.value }))}
                />
                <input
                  type="date"
                  className="input"
                  value={customRange.end}
                  onChange={(e) => setCustomRange((p) => ({ ...p, end: e.target.value }))}
                />
              </div>
            )}

            {/* Venue Dropdown */}
            <select
              value={selectedVenue}
              onChange={(e) => {
                setSelectedVenue(e.target.value);
                setSelectedBanquet("");
              }}
              disabled={!!selectedBanquet}
              className={`select w-full sm:w-48 text-sm ${selectedBanquet ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">All Venues</option>
              {venueList.map((v) => (
                <option key={v.id} value={v.id}>{v.nameEnglish}</option>
              ))}
            </select>

            {/* Banquet Dropdown */}
            {canAccessBanquet && (
            <select
              value={selectedBanquet}
              onChange={(e) => {
                setSelectedBanquet(e.target.value);
                setSelectedVenue("");
              }}
              disabled={!!selectedVenue}
              className={`select w-full sm:w-48 text-sm ${selectedVenue ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">All Banquets</option>
              {banquetList.map((b) => (
                <option key={b.id} value={b.id}>{b.hallName}</option>
              ))}
            </select>
            )}
            {/* Apply */}
            <button
              className="btn btn-primary w-full sm:w-auto text-sm"
              onClick={() => fetchQuotations(selectedMonth, selectedVenue, selectedBanquet)}
            >
              Apply
            </button>

            {/* Reset */}
            {(selectedVenue || selectedBanquet) && (
              <button
                className="btn btn-light w-full sm:w-auto text-sm"
                onClick={() => {
                  setSelectedVenue("");
                  setSelectedBanquet("");
                  fetchQuotations(selectedMonth, "", "");
                }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Excel Download */}
          <button
            className="btn btn-primary flex items-center gap-1.5"
            onClick={handleExcelDownload}
          >
            <Download style={{ width: 16, height: 16 }} />
            Excel
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          {[
            { label: "Total Outstanding Receivable", value: totals.receivable },
            { label: "Total Remaining", value: totals.remaining },
            { label: "Total Amount", value: totals.total },
          ].map((s, i) => (
            <div key={i} className="card p-3 md:p-4 user-access-bg">
              <div className="flex flex-col items-center gap-2">
                <CommonHexagonBadge
                  stroke="stroke-primary"
                  fill="fill-light"
                  size="size-[40px] md:size-[50px]"
                  badge={<i className="ki-filled ki-wallet text-lg md:text-xl text-primary"></i>}
                />
                <p className="form-info text-gray-700 text-center text-xs md:text-sm">{s.label}</p>
                <h3 className="text-lg md:text-xl font-semibold text-primary">₹ {s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <QuotationTable columns={columns(permissions)} data={filteredData} />
      </Container>
    </Fragment>
  );
};

export default QuotationDashboard;