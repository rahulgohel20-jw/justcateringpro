import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { columns, defaultData } from "./constant";
import InvoiceTable from "@/components/InvoiceTable/InvoiceTable";
import { useNavigate } from "react-router-dom";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";
import { FormattedMessage } from "react-intl";
import { Download } from "lucide-react";

import {
  GetAllInvoice,
  GetAllInvoicedatabyfilter,
  getexcelforinvoice,
  GetVenueType,
  GetAllBanquet,
} from "@/services/apiServices";
import { useModuleAccess } from "../../../../hooks/useModuleAccess";

const InvoiceDashboard = () => {
   const { hasModuleAccess } = useModuleAccess();
    const canAccessBanquet = hasModuleAccess("Banquet");
  const navigate = useNavigate();
  const [tableData, setTableData] = useState(defaultData);
  const [originalData, setOriginalData] = useState([]);
  const [totals, setTotals] = useState({
    receivable: 0,
    dueToday: 0,
    dueWithin30Days: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
const [displayData, setDisplayData] = useState(defaultData);


  const userId = localStorage.getItem("userId");

  /* ---------------------- DATE FORMATTER FOR API ---------------------- */
  const formatDateAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ---------------------- FILTER STATES ---------------------- */
  const [filterType, setFilterType] = useState("0"); // 0=All,1=3m,2=6m,3=custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venueList, setVenueList] = useState([]);
const [banquetList, setBanquetList] = useState([]);
const [selectedVenue, setSelectedVenue] = useState("");
const [selectedBanquet, setSelectedBanquet] = useState("");

  /* ---------------------- NORMAL API (ALL INVOICE) ---------------------- */
const fetchInvoices = async () => {
  try {
    const response = await GetAllInvoice(userId);
    const list = response?.data?.data?.["Event Invoice Details"] || [];
    setOriginalData(list);
    updateTotalsFromList(list);
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }
};
  /* ---------------------- FILTER API ---------------------- */
const applyInvoiceFilter = async () => {
  try {
    let start = "";
    let end = "";
    let filterId = "";
    let isVenue = "";

    if (selectedVenue) {
      filterId = selectedVenue;
      isVenue = true;
    } else if (selectedBanquet) {
      filterId = selectedBanquet;
      isVenue = false;
    }

    if (filterType === "1") {
      const today = new Date();
      const before3 = new Date();
      before3.setMonth(today.getMonth() - 3);
      start = formatDateAPI(before3);
      end = formatDateAPI(today);
    } else if (filterType === "2") {
      const today = new Date();
      const before6 = new Date();
      before6.setMonth(today.getMonth() - 6);
      start = formatDateAPI(before6);
      end = formatDateAPI(today);
    } else if (filterType === "3") {
      if (!startDate || !endDate) return;
      start = formatDateAPI(startDate);
      end = formatDateAPI(endDate);
    } else {
      // All Invoice — still apply venue/banquet if selected
      if (filterId !== "") {
        const response = await GetAllInvoicedatabyfilter("", "", filterId, isVenue, userId);
        const list = response?.data?.data?.["Event Invoice Details"] || [];
        setOriginalData(list);
        updateTotalsFromList(list);
      } else {
        fetchInvoices();
      }
      return;
    }

    const response = await GetAllInvoicedatabyfilter(end, start, filterId, isVenue, userId);
    const filteredList = response?.data?.data?.["Event Invoice Details"] || [];
    setOriginalData(filteredList);
    updateTotalsFromList(filteredList);
  } catch (err) {
    console.error("Filter error:", err);
  }
};

const updateTotalsFromList = (list) => {
  if (list.length > 0) {
    setTotals({
      receivable: list[0]?.overAllReceivableAmnt || 0,
      dueToday: list[0]?.overAllRemainingAmnt || 0,
      dueWithin30Days: list[0]?.overallTotalAmnt || 0,
    });
  } else {
    setTotals({ receivable: 0, dueToday: 0, dueWithin30Days: 0 });
  }
};
  /* ---------------------- LOAD ALL ON FIRST RENDER ---------------------- */
  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ---------------------- AUTO APPLY FILTER ---------------------- */
  useEffect(() => {
    if (filterType !== "3") {
      applyInvoiceFilter();
    }
  }, [filterType]);

  /* ---------------------- MAP TABLE DATA ---------------------- */
  // useEffect(() => {
  //   const language = localStorage.getItem("lang");

  //   const languageMap = {
  //     en: "nameEnglish",
  //     hi: "nameHindi",
  //     gu: "nameGujarati",
  //   };

  //   const field = languageMap[language] || "nameEnglish";

  //   const mapped = originalData.map((invoice, index) => ({
  //     Invoice:
  //       invoice?.invoiceCode || `INV-${String(index + 1).padStart(4, "0")}`,

  //     CustomerName: invoice?.event?.party?.[field] || "-",
  //     Eventname: invoice?.event?.eventType?.[field] || "-",

  //     PartyId: invoice?.event?.party?.id || "-",
  //     EventId: invoice?.event?.id || "-",

  //     eventDate: invoice?.event?.eventStartDateTime
  //       ? new Date(invoice.event.eventStartDateTime).toLocaleDateString(
  //           "en-GB",
  //           { day: "2-digit", month: "short", year: "numeric" },
  //         )
  //       : "-",

  //     invoiceDate: invoice?.createdAt || "-",

  //     Paid: `₹ ${(invoice?.totalAmount || 0).toLocaleString("en-IN", {
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 2,
  //     })}`,

  //     Amount: `₹ ${(invoice?.grandTotal || 0).toLocaleString("en-IN", {
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 2,
  //     })}`,

  //     BalanceDue: `₹ ${(invoice?.remainingAmount || 0).toLocaleString("en-IN", {
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 2,
  //     })}`,

  //     Status: invoice?.remainingAmount === 0 ? "Paid" : "Pending",
  //   }));

  //   setTableData(mapped);
  // }, [originalData, localStorage.getItem("lang")]);

  // Fetch venue and banquet on mount
useEffect(() => {
  fetchVenueList();
  fetchBanquetList();
}, []);

const fetchVenueList = async () => {
  try {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
     const res = await GetVenueType("", uid);
   
    const list = res?.data?.data?.["Venue Details"] || [];
    setVenueList(list);
  } catch (err) {
    console.error("Venue fetch error FULL:", err);  // 👈 will show actual error
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


useEffect(() => {
  const language = localStorage.getItem("lang");
  const languageMap = { en: "nameEnglish", hi: "nameHindi", gu: "nameGujarati" };
  const field = languageMap[language] || "nameEnglish";

  const mapped = originalData.map((invoice, index) => ({
    Invoice: invoice?.invoiceCode || `INV-${String(index + 1).padStart(4, "0")}`,
    CustomerName: invoice?.event?.party?.[field] || "-",
    Eventname: invoice?.event?.eventType?.[field] || "-",
    PartyId: invoice?.event?.party?.id || "-",
    EventId: invoice?.event?.id || "-",
    eventDate: invoice?.event?.eventStartDateTime
      ? new Date(invoice.event.eventStartDateTime).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : "-",
    invoiceDate: invoice?.createdAt || "-",
    Paid: `₹ ${(invoice?.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    Amount: `₹ ${(invoice?.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    BalanceDue: `₹ ${(invoice?.remainingAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    Status: invoice?.remainingAmount === 0 ? "Paid" : "Pending",
  }));

  setTableData(mapped);
  setDisplayData(mapped);
}, [originalData]);



useEffect(() => {
  const q = searchQuery.toLowerCase().trim();
  if (!q) {
    setDisplayData(tableData);
    return;
  }
  const filtered = tableData.filter(
    (row) =>
      row.Invoice?.toLowerCase().includes(q) ||
      row.CustomerName?.toLowerCase().includes(q) ||
      row.Eventname?.toLowerCase().includes(q)
  );
  setDisplayData(filtered);
}, [searchQuery, tableData]);

  const steps = [
    {
      title: (
        <FormattedMessage
          id="TOTAL.OUTSTANDING_RECEIVABLE"
          defaultMessage="Total Outstanding Receivable"
        />
      ),
      value: `₹ ${totals.receivable.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <i className="ki-filled ki-wallet text-xl text-primary"></i>,
    },
    {
      title: (
        <FormattedMessage
          id="TOTAL.REMAINING"
          defaultMessage="Total Remainiing"
        />
      ),
      value: `₹ ${totals.dueToday.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <i className="ki-filled ki-calendar-tick text-xl text-primary"></i>,
    },
    {
      title: (
        <FormattedMessage id="TOTAL.AMOUNT" defaultMessage="Total Amount" />
      ),
      value: `₹ ${totals.dueWithin30Days.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <i className="ki-filled ki-time text-xl text-primary"></i>,
    },
  ];

const handleExcelDownload = async () => {
  let excelStart = "";
  let excelEnd = "";

  if (filterType === "1") {
    const today = new Date();
    const before3 = new Date();
    before3.setMonth(today.getMonth() - 3);
    excelStart = formatDateAPI(before3);
    excelEnd = formatDateAPI(today);
  } else if (filterType === "2") {
    const today = new Date();
    const before6 = new Date();
    before6.setMonth(today.getMonth() - 6);
    excelStart = formatDateAPI(before6);
    excelEnd = formatDateAPI(today);
  } else if (filterType === "3") {
    if (!startDate || !endDate) return;
    excelStart = formatDateAPI(startDate);
    excelEnd = formatDateAPI(endDate);
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
    const response = await getexcelforinvoice(excelStart, excelEnd, userId, filterId, isVenue);
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
        {/* Breadcrumb */}
        <div className="mb-4 md:px-6 lg:px-4">
          {" "}
          <h1 className="text-xl md:text-xl lg:text-2xl  text-gray-900">
            <FormattedMessage
              id="INVOICE.OVERVIEW"
              defaultMessage="Invoice Overview"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-2 mb-3 md:mb-4">
          {/* LEFT SIDE */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="filItems relative w-full sm:w-auto">
              <i className="ki-filled ki-magnifier leading-none text-sm md:text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
  className="input pl-8 w-full sm:w-64 text-sm md:text-base"
  placeholder="Search Invoice"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
            </div>
            {/* Filter Dropdown */}
            <div className="filItems relative w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select pe-7.5 w-full sm:w-auto text-sm md:text-base"
              >
                <option value="0">All Invoice</option>
                <option value="1">Last 3 Months</option>
                <option value="2">Last 6 Months</option>
                <option value="3">Custom Date</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {filterType === "3" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  className="input w-full sm:w-auto text-sm md:text-base"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="input w-full sm:w-auto text-sm md:text-base"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {/* <button
                  className="btn btn-primary w-full sm:w-auto text-sm md:text-base"
                  onClick={applyInvoiceFilter}
                >
                  Apply
                </button> */}
              </div>
            )}
              {/* Venue Dropdown */}
{/* Venue Dropdown */}
<select
  value={selectedVenue}
  onChange={(e) => {
    setSelectedVenue(e.target.value);
    setSelectedBanquet(""); // clear banquet when venue selected
  }}
  disabled={!!selectedBanquet} // ✅ disable if banquet selected
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
    setSelectedVenue(""); // clear venue when banquet selected
  }}
  disabled={!!selectedVenue} // ✅ disable if venue selected
  className={`select w-full sm:w-48 text-sm ${selectedVenue ? "opacity-50 cursor-not-allowed" : ""}`}
>
  <option value="">All Banquets</option>
  {banquetList.map((b) => (
    <option key={b.id} value={b.id}>{b.hallName}</option>
  ))}
</select>
)}
{/* Apply Filter Button */}
<button
  className="btn btn-primary w-full sm:w-auto text-sm"
  onClick={applyInvoiceFilter}
>
  Apply
</button>

{/* Reset Button — clears all filters */}
{(selectedVenue || selectedBanquet) && (
  <button
    className="btn btn-light w-full sm:w-auto text-sm"
    onClick={() => {
      setSelectedVenue("");
      setSelectedBanquet("");
      fetchInvoices(); // back to all
    }}
  >
    Reset
  </button>
)}
          </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">


  {/* Excel Download button */}
  <button
    className="btn btn-primary flex items-center gap-1.5 text-sm"
    onClick={handleExcelDownload}
  >
    <Download style={{ width: 16, height: 16 }} />
    Excel
  </button>
</div>

          {/* RIGHT SIDE */}
          {/* <button
            className="btn btn-primary flex items-center gap-2"
            title="Download"
          >
            <Download size={18} /> Download
          </button> */}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="card min-w-full p-3 md:p-4 bg-no-repeat bg-[length:460px] user-access-bg"
            >
              <div className="flex flex-col items-center gap-2">
                <CommonHexagonBadge
                  stroke="stroke-primary-clarity"
                  fill="fill-light"
                  size="size-[40px] md:size-[50px]"
                  badge={step.icon}
                />
                <p className="form-info text-gray-700 text-center text-xs md:text-sm">
                  {step.title}
                </p>
                <h3 className="text-lg md:text-xl font-semibold text-primary">
                  {step.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
        {/* Table */}
<InvoiceTable columns={columns} data={displayData} />
      </Container>
    </Fragment>
  );
};

export default InvoiceDashboard;
