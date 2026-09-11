import React, { useEffect, useState } from "react";
import { Container } from "@/components/container";
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined,
  BookOutlined,
  AppstoreOutlined,
  InboxOutlined,
  TeamOutlined,
  DollarOutlined,
  StockOutlined,
  AccountBookOutlined,
  RestFilled,
  CalendarOutlined,   
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EditOutlined,
  DeleteOutlined,  
} from "@ant-design/icons";
import { GetAllMemberByUserId, GetUserlogs, GenerateDateWiseLogReport } from "@/services/apiServices";
import { Spin, Empty, message, Select } from "antd";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, FileText, Lock } from "lucide-react";


const DateInput = React.forwardRef(({ value, onClick, onChange, placeholder, onClear, hasValue }, ref) => (
  <div className="relative flex items-center">
    <span className="absolute left-2.5 text-gray-400 pointer-events-none z-10">
      <Calendar size={14} />
    </span>
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      className="w-36 pl-8 pr-7 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 cursor-pointer"
    />
    {hasValue && (
      <button
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        type="button"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
));

export default function Log() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedMemberEmail, setSelectedMemberEmail] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

useEffect(() => {
  fetchUserLogs();
}, [startDate, endDate, selectedMemberEmail]);

useEffect(() => {
  const fetchMembers = async () => {
    let loggedInUser = null;
    try {
      loggedInUser = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user || null;
    } catch {
      // Keep the member list usable if auth-storage contains invalid JSON.
    }

    const userId =
      localStorage.getItem("mainId") ||
      loggedInUser?.id ||
      localStorage.getItem("userId");

    const addLoggedInUser = (memberList) => {
      const combinedMembers = loggedInUser?.email
        ? [loggedInUser, ...memberList]
        : memberList;

      return combinedMembers.filter(
        (member, index, list) =>
          member?.email &&
          list.findIndex(
            (item) => item?.email?.toLowerCase() === member.email.toLowerCase(),
          ) === index,
      );
    };

    if (!userId) {
      setMembers(addLoggedInUser([]));
      return;
    }

    try {
      setMembersLoading(true);
      const response = await GetAllMemberByUserId(userId);
      const memberList =
        response?.data?.data?.userDetails?.UserDetails ||
        response?.data?.data?.UserDetails ||
        [];

      setMembers(addLoggedInUser(Array.isArray(memberList) ? memberList : []));
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers(addLoggedInUser([]));
    } finally {
      setMembersLoading(false);
    }
  };

  fetchMembers();
}, []);

 const fetchUserLogs = async () => {
  try {
    setLoading(true);
    // User logs are loaded without an email filter until a member is selected.
    const email = selectedMemberEmail || null;

    if (startDate && endDate && endDate < startDate) {
      message.error("End date cannot be before start date");
      return;
    }

    const formattedStart = startDate ? dayjs(startDate).format("DD/MM/YYYY") : "";
    const formattedEnd = endDate ? dayjs(endDate).format("DD/MM/YYYY") : "";

  

    const response = await GetUserlogs(email, formattedEnd, formattedStart, "");

  

    if (response?.data?.success) {
      const apiLogs = response.data.data;

      if (!Array.isArray(apiLogs)) {
        message.error("Unexpected response format");
        return;
      }

      const formattedLogs = apiLogs.map((log) => {
        const parsed =
          dayjs(log.createAt, "DD/MM/YYYY hh:mm A", true).isValid()
            ? dayjs(log.createAt, "DD/MM/YYYY hh:mm A", true)
            : dayjs(log.createAt);

        return {
          id: log.id,
          date: parsed.format("DD/MM/YYYY"),
          time: parsed.format("hh:mm A"),
          eventType: log.eventType,
          description: log.description,
          ipAddress: log.ipAddress,
          user: log.user,
          isActive: log.isActive,
          highlight:
            log.eventType?.toLowerCase() === "logout" ||
            log.eventType?.toLowerCase() === "auto-logout",
          createAt: parsed.isValid() ? parsed.toDate() : new Date(0),
        };
      });

      const sortedLogs = formattedLogs.sort(
        (a, b) => new Date(b.createAt) - new Date(a.createAt),
      );

      setLogs(sortedLogs);
    } else {
      const errMsg = response?.data?.message || "Failed to fetch user logs";
      console.error("API error:", response?.data);
      message.error(errMsg);
    }
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    message.error(error?.response?.data?.message || "Failed to fetch user logs");
  } finally {
    setLoading(false);
  }
};

  // ── Download report ────────────────────────────────────────────────────────
  const handleDownloadReport = async () => {
    try {
      setReportLoading(true);
      const formattedStart = startDate ? dayjs(startDate).format("DD/MM/YYYY") : "";
      const formattedEnd   = endDate   ? dayjs(endDate).format("DD/MM/YYYY")   : "";

      let loggedInEmail = "";
      try {
        loggedInEmail = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.user?.email || "";
      } catch { /* ignore */ }

      const response = await GenerateDateWiseLogReport(
        formattedStart,
        formattedEnd,
        loggedInEmail,
        selectedMemberEmail || "",
        localStorage.getItem("userId") || "",
      );

      // Handle blob (PDF/Excel) or JSON redirect URL
      const contentType = response?.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const url = response?.data?.report_path || response?.data?.data || response?.data?.url;
        if (url) {
          window.open(url, "_blank");
        } else {
          message.success(response?.data?.msg || "Report generated successfully");
        }
      } else {
        // Blob response — trigger download
        const blob = new Blob([response.data], { type: contentType });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `log-report-${dayjs().format("DDMMYYYY")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Report generation failed:", err);
      message.error(err?.response?.data?.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  // ── Normalize eventType for matching (case-insensitive, trim)
  const normalizeType = (eventType) =>
    (eventType || "").toLowerCase().trim();

 const getEventIcon = (eventType) => {
  const type = normalizeType(eventType);
 
  if (type === "login")                                           return <LoginOutlined        className="text-green-600" />;
  if (type === "logout" || type === "auto-logout")                return <LogoutOutlined       className="text-red-600" />;
 
if (type === "event create")                                    return <CalendarOutlined     className="text-blue-600" />;
  if (type === "event update")                                    return <EditOutlined         className="text-amber-600" />;
  if (type === "inquiry")                                         return <CalendarOutlined     className="text-sky-600" />;
  if (type === "confirm")                                         return <CheckCircleOutlined  className="text-emerald-600" />;
  if (type === "cancel")                                          return <CloseCircleOutlined  className="text-red-500" />;
  if (type === "menu save")                                       return <BookOutlined         className="text-blue-600" />;
  if (type === "menu update")                                     return <EditOutlined         className="text-violet-600" />;
 
  if (type.includes("menu planning"))                             return <BookOutlined         className="text-blue-600" />;
  if (type.includes("menu execution"))                            return <AppstoreOutlined     className="text-indigo-600" />;
  if (type.includes("raw material"))                              return <InboxOutlined        className="text-orange-600" />;
  if (type.includes("labour") || type.includes("agency"))         return <TeamOutlined         className="text-purple-600" />;
  if (type.includes("expense") || type.includes("extra charge"))  return <DollarOutlined      className="text-rose-600" />;
  if (type.includes("stock"))                                     return <StockOutlined        className="text-teal-600" />;
  if (type.includes("account"))                                   return <AccountBookOutlined  className="text-cyan-600" />;
 if (type === "delete") return <DeleteOutlined className="text-red-600" />;

 if (type.includes("quotation_lock_error"))   return <CloseCircleOutlined className="text-red-500" />;
if (type.includes("quotation_save_error"))   return <CloseCircleOutlined className="text-red-500" />;
if (type.includes("quotation_lock"))         return <Lock size={14} className="text-amber-600" />;
if (type.includes("quotation") && type.includes("save"))
                                              return <BookOutlined className="text-blue-600" />;
if (type.includes("quotation"))              return <FileText size={14} className="text-blue-600" />;

  return <ReloadOutlined className="text-gray-500" />;
};
 

  const getEventColor = (eventType) => {
  const type = normalizeType(eventType);
 
  if (type === "login")                                           return "border-green-500   text-green-500";
  if (type === "logout" || type === "auto-logout")                return "border-red-500     text-red-500";
     if (type === "event create")                                    return "border-blue-500    text-blue-500";
  if (type === "event update")                                    return "border-amber-500   text-amber-500";
  if (type === "inquiry")                                         return "border-sky-500     text-sky-500";
  if (type === "confirm")                                         return "border-emerald-500 text-emerald-500";
  if (type === "cancel")                                          return "border-red-400     text-red-400";
  if (type === "menu save")                                       return "border-blue-500    text-blue-500";
  if (type === "menu update")                                     return "border-violet-500  text-violet-500";
 
  if (type.includes("menu planning"))                             return "border-blue-500    text-blue-500";
  if (type.includes("menu execution"))                            return "border-indigo-500  text-indigo-500";
  if (type.includes("raw material"))                              return "border-orange-500  text-orange-500";
  if (type.includes("labour") || type.includes("agency"))         return "border-purple-500  text-purple-500";
  if (type.includes("expense") || type.includes("extra charge"))  return "border-rose-500    text-rose-500";
  if (type.includes("stock"))                                     return "border-teal-500    text-teal-500";
  if (type.includes("account"))                                   return "border-cyan-500    text-cyan-500";
    if (type === "delete") return "border-red-600 text-red-600";

    if (type.includes("quotation_lock_error"))   return "border-red-500    text-red-500";
if (type.includes("quotation_save_error"))   return "border-red-500    text-red-500";
if (type.includes("quotation_lock"))         return "border-amber-500  text-amber-500";
if (type.includes("quotation"))              return "border-blue-500   text-blue-500";
  return "border-gray-400 text-gray-400";
};
 

 const getBadgeColor = (eventType) => {
  const type = normalizeType(eventType);
 
  if (type === "login")                                           return "bg-green-100   text-green-700";
  if (type === "logout" || type === "auto-logout")                return "bg-red-100     text-red-700";
    if (type === "event create")                                    return "bg-blue-100    text-blue-700";
  if (type === "event update")                                    return "bg-amber-100   text-amber-700";
  if (type === "inquiry")                                         return "bg-sky-100     text-sky-700";
  if (type === "confirm")                                         return "bg-emerald-100 text-emerald-700";
  if (type === "cancel")                                          return "bg-red-100     text-red-600";
  if (type === "menu save")                                       return "bg-blue-100    text-blue-700";
  if (type === "menu update")                                     return "bg-violet-100  text-violet-700";
 
  if (type.includes("menu planning"))                             return "bg-blue-100    text-blue-700";
  if (type.includes("menu execution"))                            return "bg-indigo-100  text-indigo-700";
  if (type.includes("raw material"))                              return "bg-orange-100  text-orange-700";
  if (type.includes("labour") || type.includes("agency"))         return "bg-purple-100  text-purple-700";
  if (type.includes("expense") || type.includes("extra charge"))  return "bg-rose-100    text-rose-700";
  if (type.includes("stock"))                                     return "bg-teal-100    text-teal-700";
  if (type.includes("account"))                                   return "bg-cyan-100    text-cyan-700";

  
 if (type === "delete") return "bg-red-100 text-red-700";
 if (type.includes("quotation_lock_error"))   return "bg-red-100   text-red-700";
if (type.includes("quotation_save_error"))   return "bg-red-100   text-red-700";
if (type.includes("quotation_lock"))         return "bg-amber-100 text-amber-700";
if (type.includes("quotation"))              return "bg-blue-100  text-blue-700";
  return "bg-gray-100 text-gray-700";
};


  

  return (
    <Container>
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
       <div className="flex flex-wrap items-end gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">

 <div className="flex flex-col gap-1">
  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">From</label>
  <DatePicker
    selected={startDate}
    onChange={(date) => setStartDate(date)}
    selectsStart
    startDate={startDate}
    endDate={endDate}
    maxDate={endDate || new Date()}
    dateFormat="dd/MM/yyyy"
    placeholderText="DD/MM/YYYY"
    customInput={
      <DateInput
        placeholder="DD/MM/YYYY"
        hasValue={!!startDate}
        onClear={() => setStartDate(null)}
      />
    }
  />
</div>

  {/* End Date */}
  <div className="flex flex-col gap-1">
  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">To</label>
  <DatePicker
    selected={endDate}
    onChange={(date) => setEndDate(date)}
    selectsEnd
    startDate={startDate}
    endDate={endDate}
    minDate={startDate}
    maxDate={new Date()}
    dateFormat="dd/MM/yyyy"
    placeholderText="DD/MM/YYYY"
    customInput={
      <DateInput
        placeholder="DD/MM/YYYY"
        hasValue={!!endDate}
        onClear={() => setEndDate(null)}
      />
    }
  />
</div>

  {/* Divider */}
  <div className="hidden sm:block w-px h-8 bg-gray-200 self-end mb-0.5" />

  {/* Filter Button */}
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-transparent uppercase tracking-wide select-none">
      &nbsp;
    </label>
    <button
      onClick={fetchUserLogs}
      className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
      </svg>
      Filter
    </button>
  </div>

  {/* Reset Button */}
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-transparent uppercase tracking-wide select-none">
      &nbsp;
    </label>
    <button
      onClick={() => {
        setStartDate(null);
        setEndDate(null);
        setSelectedMemberEmail(null);
      }}
      className="flex items-center gap-1.5 bg-white hover:bg-gray-100 active:scale-95 transition-all text-gray-600 text-sm font-medium px-4 py-1.5 rounded-md shadow-sm border border-gray-300"
    >
     
     <RestFilled /> Reset
    </button>
  </div>

  {/* Download Report Button */}
  <div className="flex flex-col gap-1">
    <label className="text-[11px] font-semibold text-transparent uppercase tracking-wide select-none">
      &nbsp;
    </label>
    <button
      onClick={handleDownloadReport}
      disabled={reportLoading}
      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 transition-all text-white text-sm font-medium px-4 py-1.5 rounded-md shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {reportLoading ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
      )}
      {reportLoading ? "Generating..." : "Report"}
    </button>
  </div>

  {/* Member filter */}
  <div className="flex flex-col gap-1 min-w-44">
    <label className="text-[11px] font-semibold text-transparent uppercase tracking-wide select-none">
      &nbsp;
    </label>
    <Select
      value={selectedMemberEmail}
      onChange={setSelectedMemberEmail}
      allowClear
      showSearch
      loading={membersLoading}
      placeholder="Select member"
      optionFilterProp="label"
      className="w-full"
      options={members
        .filter((member) => member.email)
        .map((member) => ({
          value: member.email,
          label: `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Unnamed member",
        }))}
    />
  </div>

</div>
        <div className="relative pl-4 md:pl-9 py-6">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Spin size="large" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <Empty description="No logs found" />
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={log.id} className="relative flex items-start mb-8">

                {/* Date and time */}
                <div className="w-40 text-sm font-semibold text-gray-700">
                  {log.date} <br /> {log.time}
                </div>

                {/* Circle icon */}
                <div
                  className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-dotted bg-white ${getEventColor(log.eventType)}`}
                >
                  {getEventIcon(log.eventType)}
                  {index !== logs.length - 1 && (
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 w-[2px] h-8 bg-gray-300"></div>
                  )}
                </div>

                {/* Log details */}
                <div className="ml-3 sm:ml-4 md:ml-6 flex-1">
                  <div className="mb-1">
                    <span className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${getBadgeColor(log.eventType)}`}>
                      {log.eventType}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm ${log.highlight ? "text-red-600 font-medium" : "text-gray-700"}`}>
                    {log.description}
                  </p>
                  {log.ipAddress && (
                    <p className="text-xs sm:text-sm font-semibold text-green-700 mt-1 break-all">
                      IP Address: {log.ipAddress}
                    </p>
                  )}
                  {log.user && (
                    <p className="text-xs sm:text-sm text-gray-800 break-words">
                      User: {log.user}
                    </p>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
}
