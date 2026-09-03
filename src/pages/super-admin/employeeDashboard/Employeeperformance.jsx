import { useState, useMemo, useEffect } from "react";
import { Input, Button, Select, Checkbox } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GETallpipeline, GetEmployeeperformnace } from "@/services/apiServices";
import { BarChart } from "@mui/x-charts/BarChart";
const { Option } = Select;
import EmployeeReport from "./EmployeeReport";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-red-500",
  "bg-cyan-600",
  "bg-purple-600",
  "bg-green-600",
  "bg-orange-500",
  "bg-blue-600",
  "bg-teal-600",
  "bg-pink-600",
];

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const qualityInfo = (q) => {
  if (q >= 80)
    return { label: "Excellent", color: "text-green-600", bar: "bg-green-500" };
  if (q >= 50)
    return { label: "Good", color: "text-amber-600", bar: "bg-amber-500" };
  return {
    label: "Needs Improvement",
    color: "text-red-500",
    bar: "bg-red-500",
  };
};

const onTimeInfo = (v) => {
  if (v >= 80) return "bg-green-500";
  if (v >= 50) return "bg-amber-500";
  return "bg-red-500";
};

const toDateStr = (date) => date.toISOString().split("T")[0];

const getDateRange = (period) => {
  const now = new Date();
  const end = toDateStr(now);
  if (period === "This Month") {
    return {
      start: toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
      end,
    };
  }
  if (period === "Last 30 Days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { start: toDateStr(d), end };
  }
  if (period === "This Quarter") {
    const q = Math.floor(now.getMonth() / 3);
    return { start: toDateStr(new Date(now.getFullYear(), q * 3, 1)), end };
  }
  return { start: "2020-01-01", end };
};

const ProgressBar = ({ value, colorClass }) => (
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
    <div
      className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
      style={{ width: `${Math.min(Math.abs(value), 100)}%` }}
    />
  </div>
);

const Avatar = ({ name, idx }) => (
  <div
    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}
  >
    {getInitials(name)}
  </div>
);

const MiniBarChart = ({ quality, total }) => {
  const getColor = (label, value) => {
    if (label === "Total") return "#3b82f6"; // blue for total
    if (value >= 80) return "#22c55e"; // green
    if (value >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const labels = ["Score", "Total"];

  const values = [quality, total];

  return (
    <div className="w-full sm:w-56">
  <BarChart height={120}
        xAxis={[
          {
            scaleType: "band",
            data: labels,
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: Math.max(100, total), // auto adjust if total > 100
          },
        ]}
        series={[
          {
            data: values,
            color: "#8884d8", // default fallback
          },
        ]}
        margin={{ top: 10, bottom: 30, left: 35, right: 10 }}
        slotProps={{
          legend: { hidden: true },
        }}
      />
    </div>
  );
};
const MemberCard = ({ member, idx, pipelineId }) => {
  const [openReport, setOpenReport] = useState(false);
  const qi = qualityInfo(member.quality);
  const effSign = member.efficiency > 0 ? "+" : "";

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition p-5 ${member.under ? "border-red-200 bg-red-50/30" : "border-gray-100"}`}
    >
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
         <div className="flex items-center gap-3">
          <Avatar name={member.name} idx={idx} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">
                {member.name}
              </span>
              {member.under && (
                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                  <AlertTriangle className="w-3 h-3" /> Underperforming
                </span>
              )}
              {member.quality < 50 ? (
                <span className="inline-flex items-center gap-1 bg-yellow-200 text-black text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                  <AlertTriangle className="w-3 h-3" /> Warning
                </span>
              ) : (
                ""
              )}
              <span className="inline-flex items-center gap-1 bg-yellow-200 text-black text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-200">
                <AlertTriangle className="w-3 h-3" />
                After 3 Warning you will be disqualify
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {member.role}
            </p>
          </div>
        </div>
        <div className="flex text-right gap-4 sm:ml-auto">
          <div>
            <div className="text-2xl font-bold text-gray-800 leading-none">
              {member.total}
            </div>
            <div className="text-xs text-gray-900 mt-0.5">Total Leads</div>{" "}
          </div>
          <button
            className="bg-primary text-white px-2 py-1 rounded-lg text-sm hover:bg-primary transition-colors flex items-center gap-2"
            onClick={() => setOpenReport(true)}
          >
            Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tasks Breakdown */}
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
            Leads
          </p>
          <div className="space-y-1">
            {[
              [
                "Hot",
                member.hotLeads,
                member.hotLeads > 0
                  ? "text-orange-500 font-bold"
                  : "text-gray-700",
              ],
              ["Cold", member.coldLeads, "text-gray-700"],
              [
                "Won",
                member.wonLeads,
                member.wonLeads > 0
                  ? "text-green-600 font-bold"
                  : "text-gray-700",
              ],
              [
                "Lost",
                member.lostLeads,
                member.lostLeads > 0
                  ? "text-red-500 font-bold"
                  : "text-gray-700",
              ],
              [
                "Client Demo",
                member.clientDemoLeads,
                member.clientDemoLeads > 0
                  ? "text-blue-500 font-bold"
                  : "text-gray-700",
              ],
            ].map(([label, val, cls]) => (
              <div
                key={label}
                className="flex justify-between items-center text-xs text-gray-500"
              >
                <span>{label}:</span>
                <span className={`font-mono ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* On-Time Delivery */}
        <div>
          <p className="text-xs font-semibold text-black uppercase tracking-wide mb-2">
            On-Time Delivery
          </p>
          <div className="text-xl font-bold text-gray-800 font-mono">
            {member.onTime}%
          </div>
          <ProgressBar
            value={member.onTime}
            colorClass={onTimeInfo(member.onTime)}
          />
          <p className="text-xs text-gray-800 mt-1.5">Target: 80%+</p>
        </div>

        {/* Task Efficiency */}
        {/* <div>
          <p className="text-xs font-semibold text-black uppercase tracking-wide mb-2">
            Task Efficiency
          </p>
          <div
            className={`text-xl font-bold font-mono flex items-center gap-1 ${effColor(member.efficiency)}`}
          >
            {member.efficiency > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : member.efficiency < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            {effSign}
            {member.efficiency}%
          </div>
          <ProgressBar
            value={Math.abs(member.efficiency)}
            colorClass={effBar(member.efficiency)}
          />
          <p className="text-xs text-gray-900 mt-1.5">Target: -20%+</p>
        </div> */}

        {/* Quality Score */}
        <div>
          <p className="text-xs font-semibold text-black uppercase tracking-wide mb-2">
            Performance Score
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-gray-800 font-mono">
                {member.quality}
                <span className="text-sm text-gray-400 font-normal">/100</span>
              </div>
              <p className={`text-xs font-semibold mt-1.5 ${qi.color}`}>
                {qi.label}
              </p>
            </div>
            <MiniBarChart quality={member.quality} total={member.total} />{" "}
          </div>
        </div>
      </div>
      <EmployeeReport
        isModalOpen={openReport}
        setIsModalOpen={() => setOpenReport(false)}
        employeeId={member.id}
        pipelineId={pipelineId}
      />
    </div>
  );
};

export default function EmployeePerformance() {
  // Get userId from localStorage — adjust the key to match your app
  const userId =
    localStorage.getItem("userId") ??
    JSON.parse(localStorage.getItem("user") || "{}")?.id;

  // Pipeline state
  const [pipelines, setPipelines] = useState([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  // Performance data state
  const [members, setMembers] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [underOnly, setUnderOnly] = useState(false);
  const [timePeriod, setTimePeriod] = useState("All Time");
  const [sortBy, setSortBy] = useState("Completed Tasks");
  const [showCount, setShowCount] = useState(10);
  const [page, setPage] = useState(1);

  /* ── Step 1: Fetch all pipelines via GETallpipeline ── */
  useEffect(() => {
    setPipelinesLoading(true);
    GETallpipeline(userId)
      .then((res) => {
        // ⚠️ Adjust res?.data to match your actual API response shape
        // e.g. res?.data?.pipelines  or  res?.pipelines
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];
      

        setPipelines(list);

       
        if (list.length > 0) {
          setSelectedPipeline(list[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load pipelines:", err);
      })
      .finally(() => {
        setPipelinesLoading(false);
      });
  }, []);

  /* ── Step 2: Fetch employee performance when pipeline or date changes ── */
  useEffect(() => {
    if (!selectedPipeline) return;

    const { start, end } = getDateRange(timePeriod);
    setPerformanceLoading(true);

    GetEmployeeperformnace(start, end, userId, selectedPipeline)
      .then((res) => {
        const responseData = res?.data?.data?.employee_performance ?? [];
       

        // 1️⃣ Flatten all employees from all date groups
        const allEmployees = responseData.flatMap(
          (item) => item.employees ?? [],
        );

        // 2️⃣ Merge same employees (because same user can appear on multiple dates)
        const employeeMap = {};

        allEmployees.forEach((emp) => {
          if (!employeeMap[emp.leadAssignId]) {
            employeeMap[emp.leadAssignId] = { ...emp };
          } else {
            // Sum values if employee already exists
            employeeMap[emp.leadAssignId].hotLeads += emp.hotLeads || 0;
            employeeMap[emp.leadAssignId].coldLeads += emp.coldLeads || 0;
            employeeMap[emp.leadAssignId].wonLeads += emp.wonLeads || 0;
            employeeMap[emp.leadAssignId].lostLeads += emp.lostLeads || 0;
            employeeMap[emp.leadAssignId].clientDemoLeads +=
              emp.clientDemoLeads || 0;
            employeeMap[emp.leadAssignId].onTimeDelivery +=
              emp.onTimeDelivery || 0;
            employeeMap[emp.leadAssignId].totalLeads += emp.totalLeads || 0;

            // If qualityScore needs averaging instead of summing:
            employeeMap[emp.leadAssignId].qualityScore =
              (employeeMap[emp.leadAssignId].qualityScore + emp.qualityScore) /
              2;
          }
        });

        // 3️⃣ Convert to array and map for UI
        const mapped = Object.values(employeeMap).map((emp) => ({
          id: emp.leadAssignId,
          name: emp.userName,
          role: "member",
          hotLeads: emp.hotLeads,
          coldLeads: emp.coldLeads,
          wonLeads: emp.wonLeads,
          lostLeads: emp.lostLeads,
          clientDemoLeads: emp.clientDemoLeads,
          total:
            emp.totalLeads ??
            emp.hotLeads +
              emp.coldLeads +
              emp.wonLeads +
              emp.lostLeads +
              emp.clientDemoLeads,
          onTime: emp.onTimeDelivery,
          quality: emp.qualityScore,
          efficiency: 0,
          under: emp.qualityScore < 50 || emp.onTimeDelivery < 50,
        }));

        setMembers(mapped.length > 0 ? mapped : MEMBERS);
      })
      .catch((err) => {
        console.error("Failed to load performance data:", err);
        setMembers(MEMBERS);
      })
      .finally(() => {
        setPerformanceLoading(false);
        setPage(1);
      });
  }, [selectedPipeline, timePeriod]);

  /* ── Filtered + sorted list ── */
  const filtered = useMemo(() => {
    let list = [...members];
    if (search)
      list = list.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (underOnly) list = list.filter((m) => m.under);
    if (sortBy === "Quality Score") list.sort((a, b) => b.quality - a.quality);
    else if (sortBy === "On-Time Delivery")
      list.sort((a, b) => b.onTime - a.onTime);
    else if (sortBy === "Task Efficiency")
      list.sort((a, b) => b.efficiency - a.efficiency);
    else list.sort((a, b) => b.total - a.total);
    return list;
  }, [members, search, underOnly, sortBy]);

  const totalPages = Math.ceil(filtered.length / showCount);
  const paginated = filtered.slice((page - 1) * showCount, page * showCount);

  // Change p._id → p.id and p.name → p.pipelineName
  const selectedPipelineName = Array.isArray(pipelines)
    ? (pipelines.find((p) => p.id === selectedPipeline)?.pipelineName ?? "")
    : "";
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Page Header */}
      <div className="flex items-start justify-between px-0 sm:px-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor employee productivity and quality metrics
            {selectedPipelineName && (
              <span className="ml-1 text-blue-600 font-medium">
                · {selectedPipelineName}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-end gap-4 mb-5">
          {/* Pipeline Dropdown — populated from GETallpipeline */}
          <div className="w-full sm:w-auto">
            <p className="text-xs font-semibold text-gray-700 mb-1.5">
              Pipeline <span className="text-red-500">*</span>
            </p>
            <Select
              value={selectedPipeline}
              onChange={(v) => {
                setSelectedPipeline(v);
                setPage(1);
              }}
              style={{ width: "100%", maxWidth: 250 }}
              loading={pipelinesLoading}
              placeholder={
                pipelinesLoading ? "Loading pipelines..." : "Select a pipeline"
              }
              disabled={pipelinesLoading}
            >
              {(Array.isArray(pipelines) ? pipelines : []).map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.pipelineName}
                </Option>
              ))}
            </Select>
          </div>

          {/* Time Period — disabled until pipeline is chosen */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">
              Time Period
            </p>
            <Select
              value={timePeriod}
              onChange={(v) => {
                setTimePeriod(v);
                setPage(1);
              }}
              style={{ width: "100%", maxWidth: 200 }}
              disabled={!selectedPipeline}
            >
              <Option value="All Time">All Time</Option>
              <Option value="This Month">This Month</Option>
              <Option value="Last 30 Days">Last 30 Days</Option>
              <Option value="This Quarter">This Quarter</Option>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">
              Sort By
            </p>
            <Select
              value={sortBy}
              onChange={(v) => {
                setSortBy(v);
                setPage(1);
              }}
              style={{ width: "100%", maxWidth: 200 }}
            >
              <Option value="Completed Tasks">Completed Tasks</Option>
              <Option value="Quality Score">Quality Score</Option>
              <Option value="On-Time Delivery">On-Time Delivery</Option>
              <Option value="Task Efficiency">Task Efficiency</Option>
            </Select>
          </div>

          {/* Underperformers filter */}
          <div className="flex items-center gap-2 pb-0.5">
            <Checkbox
              checked={underOnly}
              onChange={(e) => {
                setUnderOnly(e.target.checked);
                setPage(1);
              }}
            >
              <span className="text-sm text-gray-600">
                Show underperformers only
              </span>
            </Checkbox>
          </div>
        </div>

        {/* Prompt if no pipeline selected yet */}
        {!selectedPipeline && !pipelinesLoading && (
          <div className="py-12 text-center rounded-xl bg-blue-50 border border-blue-100 mb-4">
            <p className="text-blue-600 font-semibold text-sm">
              Please select a pipeline to view performance data
            </p>
            <p className="text-blue-400 text-xs mt-1">
              Performance metrics are scoped per pipeline
            </p>
          </div>
        )}

        {/* Toolbar + Cards — only shown after pipeline is selected */}
        {selectedPipeline && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <Input
                placeholder="Search team members..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-72"
                disabled={performanceLoading}
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Show:</span>
                  <Select
                    value={showCount}
                    onChange={(v) => {
                      setShowCount(v);
                      setPage(1);
                    }}
                    style={{ width: 70 }}
                  >
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                    <Option value={50}>50</Option>
                  </Select>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {filtered.length} members
                </span>
              </div>
            </div>

            {/* Member Cards */}
            <div className="space-y-3">
              {performanceLoading ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p>Loading performance data...</p>
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  No members found.
                </div>
              ) : (
                paginated.map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    idx={members.findIndex((x) => x.id === m.id)}
                    pipelineId={selectedPipeline}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!performanceLoading && filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-5 pt-4 border-t border-gray-100 gap-3">
  <span className="text-sm text-gray-500">
                  Showing {(page - 1) * showCount + 1} to{" "}
                  {Math.min(page * showCount, filtered.length)} of{" "}
                  {filtered.length} members
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="small"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${page === p ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <Button
                    size="small"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
