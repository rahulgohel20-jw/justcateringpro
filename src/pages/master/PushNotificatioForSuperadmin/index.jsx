import { useState, useMemo, useRef, useEffect } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { getPushNotificationColumns } from "./constant";
import { Plus, Search, Bell, FileText, Send } from "lucide-react";
import NewPushNoti from "../../../partials/modals/PushNotificationModal/NewPushNoti";
import ViewPushNoti from "../../../partials/modals/PushNotificationModal/ViewPushNoti";
import AssignClientPushNoti from "../../../partials/modals/PushNotificationModal/AssignclientPushNotifi";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const stats = [
  {
    label: "Total Generated",
    value: "1,284",
    icon: Bell,
    bg: "#eff6ff",
    color: "#1e40af",
  },
  {
    label: "Total Drafts",
    value: "12",
    icon: FileText,
    bg: "#fff7ed",
    color: "#854f0b",
  },
  {
    label: "Total Sent",
    value: "24",
    icon: Send,
    bg: "#f0fdf4",
    color: "#3b6d11",
  },
];

const PushNotification = () => {
  const [search, setSearch] = useState("");
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  // ── Modal states ──
  const [newModal, setNewModal] = useState({ open: false, data: null });
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [assignModal, setAssignModal] = useState({ open: false, data: null });

  const [data, setData] = useState([
    {
      id: 1,
      title: "New High-Priority Request",
      audience: "All Clients",
      date: "Oct 24, 2023 - 12:30 PM",
      status: "Sent",
    },
    {
      id: 2,
      title: "Invoice Payment Overdue",
      audience: "12 Selected",
      date: "Oct 23, 2023 - 09:15 AM",
      status: "Draft",
    },
    {
      id: 3,
      title: "Security Protocol Update",
      audience: "All Clients",
      date: "Oct 22, 2023 - 04:45 PM",
      status: "Pending",
    },
    {
      id: 4,
      title: "Scheduled Maintenance Notice",
      audience: "All Clients",
      date: "Oct 21, 2023 - 11:00 PM",
      status: "Sent",
    },
  ]);

  const dictWords = useMemo(
    () => extractDictWords(data, ["title", "audience", "status"]),
    [data]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(search, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, dictWords]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearch(word);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) => (prev + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev <= 0 ? spellSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  // ── Handlers ──
  const handleCreate = () => setNewModal({ open: true, data: null });

  const handleEdit = (row) => setNewModal({ open: true, data: row });

  const handleView = (row) => setViewModal({ open: true, data: row });

  const handlePush = (row) => setAssignModal({ open: true, data: row });

  const handleSaveDraft = (formData) => {
    if (newModal.data) {
      // edit existing
      setData((prev) =>
        prev.map((d) =>
          d.id === newModal.data.id
            ? { ...d, ...formData, status: "Draft" }
            : d
        )
      );
    } else {
      // new
      setData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          audience: "All Clients",
          date: new Date().toLocaleString(),
          status: "Draft",
        },
      ]);
    }
  };

  const handleAddToModule = (formData) => {
    if (newModal.data) {
      setData((prev) =>
        prev.map((d) =>
          d.id === newModal.data.id
            ? { ...d, ...formData, status: "Pending" }
            : d
        )
      );
    } else {
      setData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          audience: "All Clients",
          date: new Date().toLocaleString(),
          status: "Pending",
        },
      ]);
    }
  };

  const filtered = data.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.audience.toLowerCase().includes(search.toLowerCase()) ||
      d.status.toLowerCase().includes(search.toLowerCase())
  );

  const columns = getPushNotificationColumns({
    onEdit: handleEdit,
    onView: handleView,
    onPush: handlePush,
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Push Notification Control Hub
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Send real-time alerts and manage global notifications for all clients
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
        >
          <Plus size={16} />
          Create Notification
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-xs"
            >
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {s.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: s.bg }}
              >
                <Icon size={18} style={{ color: s.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Recent Notifications
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Track your sent push communications
            </p>
          </div>
          <div ref={searchBoxRef} className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              spellCheck={false}
              placeholder="Search notifications..."
              className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            {showSpell && spellSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 pt-2 pb-1 text-xs text-gray-400">Suggestions:</div>
                <ul>
                  {spellSuggestions.map((s, i) => (
                    <li
                      key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySpellSuggestion(s);
                      }}
                      onMouseEnter={() => setSpellIndex(i)}
                      className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                        i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="p-4">
          <TableComponent
            columns={columns}
            data={filtered}
            paginationSize={10}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      <NewPushNoti
        open={newModal.open}
        initialData={newModal.data}
        onClose={() => setNewModal({ open: false, data: null })}
        onSaveDraft={handleSaveDraft}
        onAddToModule={handleAddToModule}
      />

      <ViewPushNoti
        open={viewModal.open}
        notification={viewModal.data}
        onClose={() => setViewModal({ open: false, data: null })}
        onEdit={(row) => {
          setViewModal({ open: false, data: null });
          setNewModal({ open: true, data: row });
        }}
      />

      <AssignClientPushNoti
        open={assignModal.open}
        notificationTitle={assignModal.data?.title}
        onClose={() => setAssignModal({ open: false, data: null })}
        onPush={() => {
          setAssignModal({ open: false, data: null });
        }}
      />
    </div>
  );
};

export default PushNotification;
