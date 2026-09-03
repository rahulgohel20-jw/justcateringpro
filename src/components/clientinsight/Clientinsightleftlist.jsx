import { useEffect, useState } from "react";
import { GETuserloglist } from "@/services/apiServices";

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
const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const mapApiToRow = (u) => ({
  id: u.userId,
  name: u.userName?.trim() || "—",
  email: u.email?.trim() || "", // ← now available
  role: u.companyName?.trim() || "—",
  isActive: u.status === "ACTIVE",
  avatar: getInitials(u.userName),
  avatarColor: getAvatarColor(u.userId),
  actsToday: 0,
});

export default function ClientInsightLeftList({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Total");
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 });

  const fetchUsers = async (tab) => {
    setLoading(true);
    try {
      let isActiveParam = null;
      if (tab === "Active") isActiveParam = true;
      else if (tab === "Inactive") isActiveParam = false;

      const res = await GETuserloglist(
        isActiveParam === null ? "" : isActiveParam,
      );
      const apiData = res?.data?.data || {};
      const raw = apiData.userLogs || [];
      const mapped = raw.map(mapApiToRow);

      setUsers(mapped);
      setFiltered(mapped);
      setCounts({
        total: apiData.totalCnt ?? mapped.length,
        active:
          apiData.totalActiveCnt ?? mapped.filter((u) => u.isActive).length,
        inactive:
          apiData.totalDeactiveCnt ?? mapped.filter((u) => !u.isActive).length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      ),
    );
  }, [search, users]);

  const handleTabClick = (tab) => {
    setSearch("");
    setActiveTab(tab);
  };

  const TABS = [
    { key: "Total", label: "Total", count: counts.total, color: "slate" },
    { key: "Active", label: "Active", count: counts.active, color: "blue" },
    {
      key: "Inactive",
      label: "Inactive",
      count: counts.inactive,
      color: "amber",
    },
  ];

  const tabStyles = {
    slate: { active: "border-slate-400 text-slate-700" },
    blue: { active: "border-blue-400 text-blue-600" },
    amber: { active: "border-amber-400 text-amber-500" },
  };

  return (
    <div className="w-80 min-h-screen bg-white border-r border-slate-100 flex flex-col font-sans">
      {/* Stats Row — clickable tabs */}
      <div className="px-4 pt-3 pb-3 border-b border-slate-100">
        <div className="grid grid-cols-3 gap-2 text-center">
          {TABS.map(({ key, label, count, color }) => {
            const isSelected = activeTab === key;
            const s = tabStyles[color];
            return (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={`bg-slate-50 rounded-xl py-2.5 cursor-pointer transition-all border-2 ${
                  isSelected
                    ? s.active
                    : "border-transparent hover:border-slate-200"
                }`}
              >
                <p
                  className={`text-[10px] font-medium mb-0.5 ${isSelected ? "" : "text-slate-400"}`}
                >
                  {label}
                </p>
                <p
                  className={`text-xl font-semibold leading-none ${isSelected ? "" : "text-slate-800"}`}
                >
                  {count}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="m-3">
        <input
          type="text"
          placeholder="Search by name, company or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
        />
      </div>

      {/* Member List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading &&
          filtered.map((member, i) => (
            <div key={`${member.id}-${i}`}>
              <div
                onClick={() => onSelectUser(member)}
                className={`flex items-center gap-3 px-4 py-2 mx-1 rounded-xl cursor-pointer transition-colors ${
                  selectedUser?.email === member.email
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                  style={{ background: member.avatarColor }}
                >
                  {member.avatar}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 truncate">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {member.email}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-green-400" : "bg-yellow-400"}`}
                  />
                  <span className="text-[10px] font-medium text-slate-500">
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {i < filtered.length - 1 && (
                <div className="h-px bg-slate-100 mx-4" />
              )}
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">
            No members found
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          {filtered.length} of {counts.total} members
        </p>
      </div>
    </div>
  );
}
