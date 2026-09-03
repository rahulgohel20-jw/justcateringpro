import { useState, useEffect } from "react";
import { STAT_CARDS, FILTER_TABS } from "./constant";
import { TableComponent } from "@/components/table/TableComponent";
import { ClientHistoryModal } from "../../../../partials/modals/client-insightmodal/Clienthistorymodal";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Getsummaryforclientinsightdashboard } from "@/services/apiServices";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const AVATAR_COLORS = [
  "#386edb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const mapApiToRow = (item) => ({
  id: item.userId,
  name: item.userName?.trim() || "—",
  enterprise: item.companyName?.trim() || "—",
  partnershipDate: item.createdAt || "—",
  membershipType: item.status?.toUpperCase() === "MEMBER" ? "ACTIVE" : "DEMO",
  initials: getInitials(item.userName),
  avatarColor: getAvatarColor(item.userId),
});

// ─── Membership Badge ─────────────────────────────────────────────────────────
const MembershipBadge = ({ type }) => {
  const isActive = type === "ACTIVE";
  return (
    <span className="inline-flex flex-col gap-0.5 items-start">
      <span
        className={`text-[10px] font-bold tracking-widest rounded-xl px-2.5 py-0.5 ${
          isActive
            ? "bg-[#D1FAE5] text-green-700"
            : "bg-[#FEF3C7] text-amber-700"
        }`}
      >
        {type}
      </span>
    </span>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ client }) => (
  <div
    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
    style={{ background: client.avatarColor }}
  >
    {client.initials}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const accentBorderMap = {
  "#22c55e": "border-t-green-500",
  "#f59e0b": "border-t-amber-400",
  "#386edb": "border-t-blue-500",
  "#ef4444": "border-t-red-500",
  "#6b7280": "border-t-gray-400",
};
const subTextColorMap = {
  "#22c55e": "text-green-500",
  "#ef4444": "text-red-500",
  "#386edb": "text-blue-500",
  "#6b7280": "text-gray-500",
  "#bfdbfe": "text-blue-200",
};

const StatCard = ({ card }) => {
  const borderClass = accentBorderMap[card.accent] || "border-t-gray-300";
  const subClass = subTextColorMap[card.subColor] || "text-gray-500";
  return (
    <div
      className={`flex-1 min-w-[110px] bg-white rounded-xl p-4 flex flex-col gap-1 border border-gray-200 border-t-2 shadow-sm ${borderClass}`}
    >
      {/* Label + icon always on one line */}
      <div className="flex items-center justify-between gap-1.5 overflow-hidden">
        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap overflow-hidden text-ellipsis">
          {card.label}
        </span>
        {card.icon && (
          <img
            src={toAbsoluteUrl(card.icon)}
            alt=""
            className="dark:hidden w-6 h-6 object-contain opacity-80 shrink-0"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      {/* Value always on one line */}
      <span className="text-gray-900 text-[26px] font-extrabold leading-tight whitespace-nowrap">
        {card.value}
      </span>

      {card.sub && (
        <span className={`text-[11px] font-medium ${subClass}`}>
          {card.sub}
        </span>
      )}
    </div>
  );
};
// ─── Column definitions ───────────────────────────────────────────────────────
const buildColumns = (onClientClick) => [
  {
    accessorKey: "identity",
    header: "CLIENT IDENTITY",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onClientClick(c)}
        >
          <Avatar client={c} />
          <div>
            <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
              {c.name}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "enterprise",
    header: "ENTERPRISE",
    cell: ({ row }) => (
      <div className="font-semibold text-[13px] text-gray-900">
        {row.original.enterprise}
      </div>
    ),
  },
  {
    accessorKey: "membership",
    header: "MEMBERSHIP",
    cell: ({ row }) => <MembershipBadge type={row.original.membershipType} />,
  },
  {
    accessorKey: "partnershipDate",
    header: "PARTNERSHIP DATE",
    cell: ({ row }) => (
      <span className="text-[13px] text-gray-700">
        {row.original.partnershipDate}
      </span>
    ),
  },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClientInsightDashboard() {
  const [activeTab, setActiveTab] = useState("All Clients");
  const [clientList, setClientList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState({});
  useEffect(() => {
    const loadList = async () => {
      try {
        setListLoading(true);

        const res = await Getsummaryforclientinsightdashboard(-1);
        const apiData = res?.data?.data || {};

        // ✅ Set table data
        const users = apiData.topUserData || [];
        setClientList(users.map(mapApiToRow));

        // ✅ Set stats (IMPORTANT)
        setStats(apiData);
      } catch (err) {
        console.error("❌ Client list load error →", err);
      } finally {
        setListLoading(false);
      }
    };

    loadList();
  }, []);
  // ── On row click: fetch that user's summary and open modal ──
  const handleClientClick = async (client) => {
    setSelectedClient(client);
    setModalOpen(true);
    setModalData(null); // clear stale data
    try {
      setModalLoading(true);
      const res = await Getsummaryforclientinsightdashboard(client.id);
      setModalData(res?.data?.data || null);
    } catch (err) {
      console.error("❌ Modal data load error →", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedClient(null);
    setModalData(null);
  };

  const filtered =
    activeTab === "All Clients"
      ? clientList
      : clientList.filter((c) =>
          activeTab === "Active"
            ? c.membershipType === "ACTIVE"
            : c.membershipType === "DEMO",
        );

  const columns = buildColumns(handleClientClick);

  return (
    <div className="font-sans min-h-screen px-8 py-7">
      {/* ── Stat Cards ── */}
      <div className="flex gap-3 flex-wrap mb-8">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.id}
            card={{
              ...card,
              value: stats?.[card.id] ?? 0, // ✅ dynamic binding
            }}
          />
        ))}
      </div>
      {/* ── Client Directory Panel ── */}
      <div className="bg-white rounded-2xl shadow-sm px-7 py-6">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
          <div>
            <h2 className="m-0 text-[22px] font-extrabold text-gray-900">
              Client Directory
            </h2>
            <p className="mt-1 text-[13px] text-gray-400">
              Manage your active partnerships and trial accounts.
            </p>
          </div>
        </div>

        <TableComponent
          columns={columns}
          data={filtered}
          loading={listLoading}
          hidePagination={false}
          paginationSize={10}
        />
      </div>

      {/* ── Client History Modal ── */}
      <ClientHistoryModal
        open={modalOpen}
        onClose={handleModalClose}
        client={selectedClient}
        summaryData={modalData} // ← per-user API data
        loading={modalLoading} // ← loading state for modal
      />
    </div>
  );
}
