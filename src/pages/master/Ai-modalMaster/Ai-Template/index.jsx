import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { GETALLaiteplate, Deleteaitemplate } from "@/services/apiServices";
import Addaitemplate from "../../../../partials/modals/AddAitemplatemodal/Addaitemplate";
import { usePermission } from "../../../../hooks/usePermission";
import Swal from "sweetalert2";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { useNavigate } from "react-router-dom";
// ─── Billing badge ────────────────────────────────────────────────────────────
const BillingBadge = ({ cycle }) => {
  if (!cycle || cycle === "N/A" || cycle === "null")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider bg-gray-100 text-gray-400 border border-gray-200">
        N/A
      </span>
    );

  const isMonthly = cycle?.toUpperCase().includes("MONTH");
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider border ${
        isMonthly
          ? "bg-violet-50 text-violet-600 border-violet-200"
          : "bg-amber-50 text-amber-600 border-amber-200"
      }`}
    >
      {cycle?.toUpperCase()}
    </span>
  );
};

// ─── Status toggle display ────────────────────────────────────────────────────
const StatusToggle = ({ isActive }) => (
  <div className="flex items-center gap-2">
    <div
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        isActive ? "" : "bg-gray-300"
      }`}
      style={
        isActive
          ? { background: "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)" }
          : {}
      }
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          isActive ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </div>
    <span
      className={`text-sm font-medium ${isActive ? "text-gray-800" : "text-gray-400"}`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  </div>
);

// ─── AI model icon ────────────────────────────────────────────────────────────
const ModelIcon = ({ model }) => {
  const icons = {
    GPT: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-5h2v2h-2zm0-8h2v6h-2z" />
      </svg>
    ),
    CLAUDE: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    ),
  };

  const key = Object.keys(icons).find((k) => model?.toUpperCase().includes(k));
  const icon = icons[key] || (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  );

  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-sm flex-shrink-0">
      {icon}
    </div>
  );
};

// ─── Template Card Row ────────────────────────────────────────────────────────
const TemplateRow = ({ item, onEdit, onDelete, permissions, index }) => (
  <div
    className="grid items-center gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50/60 transition-colors duration-150"
    style={{
      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
      animationDelay: `${index * 40}ms`,
    }}
  >
    {/* Module Entity */}
    <div className="flex items-center gap-3 min-w-0">
      <ModelIcon model={item.aiModel} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {item.name}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {item.aiModel || "—"} •{" "}
          {item.isActive ? (
            "Active"
          ) : (
            <span className="text-red-400">Suspended</span>
          )}
        </p>
      </div>
    </div>

    {/* Status */}
    <div>
      <StatusToggle isActive={item.isActive} />
    </div>

    {/* Billing */}
    <div>
      <BillingBadge cycle={item.billingCycle} />
    </div>

    {/* Price */}
    <div>
      <p className="text-sm font-bold text-gray-900">
        ₹{Number(item.price ?? 0).toLocaleString("en-IN")}
      </p>
      <p className="text-[10px] text-gray-400">
        {item.billingCycle?.toLowerCase().includes("month")
          ? "excluding GST"
          : item.price > 0
            ? "Billed yearly"
            : "Free Tier"}
      </p>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 justify-start">
      {permissions.edit && (
        <button
          onClick={() => onEdit(item)}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-all duration-150 group"
          title="Edit"
        >
          <svg
            className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2 2 0 112.828 2.828L11.828 13.828A2 2 0 0110 14.5H9v-1a2 2 0 01.586-1.414L9 11z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 16H5a1 1 0 01-1-1V5"
            />
          </svg>
        </button>
      )}
      {permissions.delete && (
        <button
          onClick={() => onDelete(item.id)}
          className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition-all duration-150 group"
          title="Delete"
        >
          <svg
            className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AiTemplateMaster = () => {
  const permissions = usePermission("Categories");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const lang = localStorage.getItem("lang") || "en";
  const handleEdit = (row) => {
    navigate("/Ai-module/addaitemplate", {
      state: { contactType: row.original ?? row },
    });
  };
  const getNameByLang = (item) => {
    switch (lang) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [lang]);

  const fetchTemplates = () => {
    setLoading(true);
    GETALLaiteplate()
      .then((res) => {
        const list = res?.data?.data?.AITemplates || [];
        const formatted = list.map((item, index) => ({
          sr_no: index + 1,
          name: getNameByLang(item),
          id: item.id,
          isActive: item.isActive,
          billingCycle: item.billingCycle,
          price: item.price,
          aiModel: item.aiModel,
          original: item,
        }));
        setTableData(formatted);
      })
      .catch((err) => console.error("Error fetching AI templates:", err))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This template will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: { popup: "!rounded-2xl" },
    }).then((result) => {
      if (result.isConfirmed) {
        Deleteaitemplate(id)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: "!rounded-2xl" },
            });
            fetchTemplates();
          })
          .catch(() => Swal.fire("Error", "Failed to delete.", "error"));
      }
    });
  };

  const filtered = tableData.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.aiModel?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <Fragment>
      <Container>
        <div className="py-6">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                AI Template
              </h1>
              <p className="text-sm text-gray-700 mt-1 max-w-sm">
                Manage and orchestrate your enterprise AI processing units with
                real-time throughput monitoring.
              </p>
            </div>
            {permissions.add && (
              <button
                onClick={() => navigate("/Ai-module/addaitemplate")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Module
              </button>
            )}
          </div>

          {/* ── Search ── */}
          <div className="relative mb-6 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* ── Table Card ── */}
        </div>
        {/* ── Modal ── */}
        <Addaitemplate
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshData={fetchTemplates}
          contactType={selectedTemplate}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            permissions,
            fetchTemplates,
          )}
          data={filtered}
        />
      </Container>
    </Fragment>
  );
};

export default AiTemplateMaster;
