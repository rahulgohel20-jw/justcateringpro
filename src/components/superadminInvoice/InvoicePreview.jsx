import { useState, useEffect, Fragment } from "react";
import InvoiceList from "./InvoiceList";
import InvoiceDetail from "./InvoiceDetail";
import PaymentReceived from "@/components/InvoiceTable/PaymentReceived";
import { FormattedMessage } from "react-intl";
import { Button, Modal } from "antd";
import { Container } from "@/components/container";
import { useCloseDateAll } from "@/hooks/useCloseDate";
import { usePermission } from "../../hooks/usePermission";
import {
  EditOutlined,
  MailOutlined,
  PrinterOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { GenrateSuperInvoiceReport } from "@/services/apiServices";
import RecordPayment from "../../components/RecordPayment/RecordPayment";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Swal from "sweetalert2";

export default function InvoicePreview() {
  const Permissions = usePermission();
  const navigate = useNavigate();
  const { EventId, id } = useParams();
  const location = useLocation();
  const passedMonth = location.state?.selectedMonth ?? null;
  const passedYear = location.state?.selectedYear ?? null;
  
  const dmyToDate = (str) => {
    if (!str) return new Date();
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const formatDateAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [apiDueAmount, setApiDueAmount] = useState(0);
  const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);
  const [selectedYear, setSelectedYear] = useState(passedYear ?? currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    passedMonth ?? currentMonth,
  );
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(currentYear / 12) * 12,
  );
  const [showYearPicker, setShowYearPicker] = useState(false);

  const [filterStartDate, setFilterStartDate] = useState(() => {
    if (passedMonth !== null && passedYear !== null) {
      const start = new Date(passedYear, passedMonth, 1);
      const val = `${String(start.getDate()).padStart(2, "0")}/${String(start.getMonth() + 1).padStart(2, "0")}/${start.getFullYear()}`;
      
      return val;
    }
   
    return "";
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    if (passedMonth !== null && passedYear !== null) {
      const end = new Date(passedYear, passedMonth + 1, 0);
      const val = `${String(end.getDate()).padStart(2, "0")}/${String(end.getMonth() + 1).padStart(2, "0")}/${end.getFullYear()}`;
      
      return val;
    }
    return "";
  });

  const pdfPlugin = defaultLayoutPlugin();

  const { monthCloseDates, isLoading: loadingDates } =
    useCloseDateAll(selectedYear);

  const activeMonth = (() => {
    const today = new Date();
    for (const entry of Object.values(monthCloseDates)) {
      if (!entry?.startDate || !entry?.closeDate) continue;
      const start = dmyToDate(entry.startDate);
      const end = dmyToDate(entry.closeDate);
      if (today >= start && today <= end) {
        return entry.monthIndex;
      }
    }
    return null;
  })();

  useEffect(() => {
   

    if (!monthCloseDates || Object.keys(monthCloseDates).length === 0) return;

    if (passedMonth !== null && passedYear !== null) {
      const key = `${passedYear}-${passedMonth + 1}`;
      const entry = monthCloseDates[key];
      
      if (entry?.startDate && entry?.closeDate) {
        
        setFilterStartDate(entry.startDate);
        setFilterEndDate(entry.closeDate);
      } else {
        const start = new Date(passedYear, passedMonth, 1);
        const end = new Date(passedYear, passedMonth + 1, 0);
        
        setFilterStartDate(formatDateAPI(start));
        setFilterEndDate(formatDateAPI(end));
      }
      return;
    }

    const today = new Date();
    let activeEntry = null;

    for (const entry of Object.values(monthCloseDates)) {
      if (!entry?.startDate || !entry?.closeDate) continue;
      const start = dmyToDate(entry.startDate);
      const end = dmyToDate(entry.closeDate);
      if (today >= start && today <= end) {
        activeEntry = entry;
        break;
      }
    }

    if (!activeEntry) {
      const fallbackKey = `${selectedYear}-${today.getMonth() + 1}`;
      activeEntry = monthCloseDates[fallbackKey] ?? null;
    }

    if (!activeEntry) return;

    setSelectedMonth(activeEntry.monthIndex);
    setFilterStartDate(activeEntry.startDate);
    setFilterEndDate(activeEntry.closeDate);
  }, [monthCloseDates]);

  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getMonthStatus = (index) => {
    if (activeMonth === null) return "";
    if (index === activeMonth) return "active";
    if (index < activeMonth) return "locked";
    return "upcoming";
  };

  const getPeriodLabel = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];
    if (entry?.startDate && entry?.closeDate) {
      const start = dmyToDate(entry.startDate);
      const end = dmyToDate(entry.closeDate);
      const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
      return `${fmt(start)} → ${fmt(end)}`;
    }
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
    return `${fmt(start)} → ${fmt(end)}`;
  };

  const handleMonthFilter = (monthIndex) => {
    setSelectedMonth(monthIndex);

    const key = `${selectedYear}-${monthIndex + 1}`;
    const monthData = monthCloseDates[key];

    if (monthData?.startDate && monthData?.closeDate) {
      setFilterStartDate(monthData.startDate);
      setFilterEndDate(monthData.closeDate);
    } else {
      // Fallback: calendar month boundaries
      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0);
      setFilterStartDate(formatDateAPI(start));
      setFilterEndDate(formatDateAPI(end));
    }
  };

  const handleInvoiceDataLoad = (data) => setInvoiceData(data);

  const refreshInvoice = () => setInvoiceRefreshKey((prev) => prev + 1);

  const handleEditPayment = (payment) => {
    setEditPaymentData(payment);
    setIsPaymentOpen(true);
  };

  const handleNewPayment = () => {
    setEditPaymentData(null);
    setIsPaymentOpen(true);
  };

  const handleClosePayment = (shouldClose) => {
    setIsPaymentOpen(shouldClose);
    if (!shouldClose) setEditPaymentData(null);
  };

  const handleGenerateReport = async () => {
    try {
      setLoadingPdf(true);

      const response = await GenrateSuperInvoiceReport({
        invoiceId: activeEventId,
      });

      if (response?.data?.report_path) {
        setPdfUrl(response.data.report_path); // ✅ direct URL
        setIsPdfModalVisible(true);
      }
    } catch (error) {
      console.error("Error generating invoice report:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to generate PDF",
        icon: "error",
        confirmButtonColor: "#005BA8",
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  const activeEventId = selectedInvoice ?? id ?? EventId;

  // ── Year Picker Component ──────────────────────────────────────────────────
  const YearPicker = () => (
    <div className="relative">
      <button
        onClick={() => setShowYearPicker((v) => !v)}
        className="px-2 py-1 rounded-lg bg-primary text-white font-medium min-w-[40px] text-sm"
      >
        {selectedYear}
      </button>

      {showYearPicker && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowYearPicker(false)}
          />
          <div className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setYearRangeStart((d) => d - 12)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer text-lg"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-gray-700">
                {yearRangeStart}–{yearRangeStart + 11}
              </span>
              <button
                type="button"
                onClick={() => setYearRangeStart((d) => d + 12)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer text-lg"
              >
                ›
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(
                (y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setSelectedYear(y);
                      setShowYearPicker(false);
                      // hook will refetch for new year; useEffect will set dates
                    }}
                    className={`py-2 rounded-xl text-sm font-semibold transition border-0 cursor-pointer ${
                      y === selectedYear
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {y}
                  </button>
                ),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Container>
        <div className="scrollbar-hide">
          {/* ── Month / Year Picker Grid ── */}
          <div className="grid grid-cols-7 gap-3 mb-4">
            {/* Year picker — col 1 row 1 */}
            <div className="relative">
              <YearPicker />
            </div>

            {/* First 6 months — row 1 */}
            {monthNames.slice(0, 6).map((month, index) => {
              const isSelected = selectedMonth === index;
              const periodLabel = getPeriodLabel(index, selectedYear);
              return (
                <button
                  key={index}
                  onClick={() => handleMonthFilter(index)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? "bg-[#005BA8] text-white border-[#005BA8]"
                      : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                  }`}
                >
                  <span className="font-semibold">{month}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {periodLabel}
                  </span>
                </button>
              );
            })}

            {/* Empty cell — col 1 row 2 */}
            <div />

            {/* Last 6 months — row 2 */}
            {monthNames.slice(6, 12).map((month, index) => {
              const realIndex = index + 6;
              const isSelected = selectedMonth === realIndex;
              const periodLabel = getPeriodLabel(realIndex, selectedYear);
              return (
                <button
                  key={realIndex}
                  onClick={() => handleMonthFilter(realIndex)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? "bg-[#005BA8] text-white border-[#005BA8]"
                      : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                  }`}
                >
                  <span className="font-semibold">{month}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {periodLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Main Layout ── */}
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            {/* Invoice List */}
            <div className="w-full lg:w-80 lg:max-w-xs lg:flex-shrink-0 overflow-hidden rounded-2xl border border-gray-200 h-[500px] lg:h-[600px]">
              {!loadingDates && (
                <InvoiceList
                  onSelectInvoice={(invoiceId) => {
                    if (String(invoiceId) === String(selectedInvoice ?? id))
                      return;
                    setSelectedInvoice(invoiceId);
                    navigate(`/super/invoice-preview/${invoiceId}`, {
                      replace: true,
                    });
                  }}
                  selectedId={selectedInvoice ?? id}
                  startDate={filterStartDate}
                  endDate={filterEndDate}
                />
              )}
            </div>

            {/* Invoice Detail + Actions */}
            <div className="w-full z-999 lg:flex-1 h-[500px] lg:h-[600px] lg:min-w-0 space-y-4 pr-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between gap-2 w-full">
                <h2 className="text-2xl font-bold text-primary">
                  {invoiceData?.invoiceCode || "INV – 0001"}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 w-full">
                {Permissions.edit && (
                  <Button
                    icon={<EditOutlined className="text-primary" />}
                    className="rounded-lg border font-bold text-primary w-full"
                    onClick={() =>
                      navigate(`/addInvoice?id=${invoiceData?.invoiceId}`, {
                        state: { eventId: activeEventId },
                      })
                    }
                  >
                    <FormattedMessage
                      id="SALES.CLONE_INVOICE"
                      defaultMessage="Edit"
                    />
                  </Button>
                )}

                <Button className="rounded-lg border font-bold text-primary w-full">
                  <i className="ki-filled ki-whatsapp"></i>
                  <FormattedMessage id="COMMON.SHARE" defaultMessage="Share" />
                </Button>

                <Button
                  icon={<MailOutlined className="text-primary" />}
                  className="rounded-lg border font-bold text-primary w-full"
                  disabled={loadingEmail}
                >
                  {loadingEmail ? (
                    <>
                      <i className="ki-filled ki-loading animate-spin"></i>
                      <FormattedMessage
                        id="COMMON.LOADING"
                        defaultMessage="Loading..."
                      />
                    </>
                  ) : (
                    <FormattedMessage id="COMMON.SEND" defaultMessage="Send" />
                  )}
                </Button>
                <Button
                  icon={<PrinterOutlined className="text-primary" />}
                  className="rounded-lg border font-bold text-primary w-full"
                  onClick={handleGenerateReport}
                  disabled={loadingPdf}
                >
                  {loadingPdf ? (
                    <>
                      <i className="ki-filled ki-loading animate-spin"></i>
                      <FormattedMessage
                        id="COMMON.LOADING"
                        defaultMessage="Loading..."
                      />
                    </>
                  ) : (
                    <FormattedMessage
                      id="COMMON.PRINT"
                      defaultMessage="Print"
                    />
                  )}
                </Button>
                {Permissions.edit && (
                  <Button
                    icon={<DollarCircleOutlined className="text-primary" />}
                    className="rounded-lg border font-bold text-primary w-full"
                    onClick={handleNewPayment}
                    disabled={!invoiceData && !activeEventId}
                  >
                    <FormattedMessage
                      id="SALES.RECORD_PAYMENT"
                      defaultMessage="Record Payment"
                    />
                  </Button>
                )}
              </div>

              <PaymentReceived
                salesInvoiceData={invoiceData?.salesInvoiceData}
                onEditPayment={handleEditPayment}
                refreshKey={invoiceRefreshKey}
                onDueAmountLoad={(amount) => setApiDueAmount(amount)}
                onRefresh={refreshInvoice}
                isSuperAdmin={true}
                invoiceId={activeEventId}
              />

              <InvoiceDetail
                Eventid={activeEventId}
                refreshKey={invoiceRefreshKey}
                onInvoiceDataLoad={handleInvoiceDataLoad}
                isSuperAdmin={true}
              />
            </div>
          </div>
        </div>

        {/* PDF Modal */}
        <Modal
          title="Invoice Report"
          open={isPdfModalVisible}
          onCancel={() => setIsPdfModalVisible(false)}
          width="70%"
          footer={null}
        >
          <style>{`
            .rpv-core__inner-pages { scrollbar-width: none !important; }
            .rpv-core__inner-pages::-webkit-scrollbar { display: none !important; }
          `}</style>
          <div style={{ height: "80vh" }}>
            {pdfUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>

        {/* Record Payment Modal */}
        <RecordPayment
          isModalOpen={isPaymentOpen}
          setIsModalOpen={handleClosePayment}
          eventId={activeEventId}
          refreshData={() => {
            refreshInvoice();
            setIsPaymentOpen(false);
          }}
          invoiceData={{
            ...invoiceData,
            invoiceId: activeEventId,
            due_amount: editPaymentData
              ? editPaymentData.dueAmount
              : apiDueAmount > 0
                ? apiDueAmount
                : (invoiceData?.grandTotal ?? 0),
          }}
          editPayment={editPaymentData}
          isSuperAdmin={true}
        />
      </Container>
    </Fragment>
  );
}
