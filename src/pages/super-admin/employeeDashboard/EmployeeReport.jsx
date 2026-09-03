import { useState } from "react";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { EmployeePerformance } from "@/services/apiServices";

const EmployeeReport = ({
  isModalOpen,
  setIsModalOpen,
  employeeId,
  pipelineId,
}) => {
  const pdfPlugin = defaultLayoutPlugin();

  const [language, setLanguage] = useState("english");
  const [dateFilter, setDateFilter] = useState("today");
  const [customFrom, setCustomFrom] = useState(null);
  const [customTo, setCustomTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const userId = localStorage.getItem("userId")

  const languages = [
    { value: "english", label: "English", lang: 0 },
    { value: "hindi", label: "हिन्दी", lang: 1 },
    { value: "gujarati", label: "ગુજરાતી", lang: 2 },
  ];

  const dateOptions = [
    { value: "today", label: "Today" },
    { value: "this_month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const getDateRange = () => {
    const today = new Date();
    const formatDate = (date) => {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    if (dateFilter === "today") {
      return { startDate: formatDate(today), endDate: formatDate(today) };
    } else if (dateFilter === "this_month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(firstDay), endDate: formatDate(today) };
    } else if (dateFilter === "custom" && customFrom && customTo) {
      return {
        startDate: formatDate(customFrom),
        endDate: formatDate(customTo),
      };
    }
    return { startDate: "", endDate: "" };
  };

  const handleGenerate = async () => {
    const { startDate, endDate } = getDateRange();
    const selectedLang = languages.find((l) => l.value === language)?.lang ?? 0;

    try {
      setLoading(true);
      const response = await EmployeePerformance(
        userId,
        employeeId,
        endDate,
        selectedLang,
        pipelineId,
        startDate,
      );
      console.log("Report Response:", response);

      // If API returns a PDF URL, set it to show the viewer
      if (response?.data?.success && response?.data?.report_path) {
        setPdfUrl(response.data.report_path);
      }
    } catch (error) {
      console.error("Report Generation Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPdfUrl(null);
    setIsModalOpen();
  };

  const isGenerateDisabled =
    loading || (dateFilter === "custom" && (!customFrom || !customTo));

  return (
    <CustomModal
      open={isModalOpen}
      title={"Report"}
      onClose={handleClose}
      width={900}
      footer={
        pdfUrl ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={handleClose}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#6b7280",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          ""
        )
      }
    >
      {!pdfUrl ? (
        <div
          style={{
            padding: "16px 0",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Language Selection */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              Language / भाषा / ભાષા
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: `2px solid ${language === lang.value ? "#4f46e5" : "#e5e7eb"}`,
                    background: language === lang.value ? "#4f46e5" : "#fff",
                    color: language === lang.value ? "#fff" : "#374151",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: 8,
                color: "#374151",
              }}
            >
              Date Range
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateFilter(opt.value)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: `2px solid ${dateFilter === opt.value ? "#4f46e5" : "#e5e7eb"}`,
                    background: dateFilter === opt.value ? "#4f46e5" : "#fff",
                    color: dateFilter === opt.value ? "#fff" : "#374151",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker */}
          {dateFilter === "custom" && (
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "#6b7280",
                  }}
                >
                  From
                </label>
                <DatePicker
                  selected={customFrom}
                  onChange={(date) => setCustomFrom(date)}
                  selectsStart
                  startDate={customFrom}
                  endDate={customTo}
                  maxDate={customTo || new Date()}
                  placeholderText="Select start date"
                  className="p-2 ant-input"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "#6b7280",
                  }}
                >
                  To
                </label>
                <DatePicker
                  selected={customTo}
                  onChange={(date) => setCustomTo(date)}
                  selectsEnd
                  startDate={customFrom}
                  endDate={customTo}
                  minDate={customFrom}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="p-2 ant-input"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderTop: "1px solid #f3f4f6",
              paddingTop: 16,
            }}
          >
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              style={{
                padding: "10px 32px",
                borderRadius: 8,
                border: "none",
                background: isGenerateDisabled ? "#c7d2fe" : "#4f46e5",
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                cursor: isGenerateDisabled ? "not-allowed" : "pointer",
                boxShadow: isGenerateDisabled
                  ? "none"
                  : "0 4px 12px rgba(79,70,229,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      ) : (
        /* PDF Viewer */
        <div style={{ height: "80vh" }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
          </Worker>
        </div>
      )}
    </CustomModal>
  );
};

export default EmployeeReport;
