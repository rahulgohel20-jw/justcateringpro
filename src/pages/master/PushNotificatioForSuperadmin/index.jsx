import React, { useState } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { getPushNotificationColumns } from "./constant";
import { Plus, Search, Bell, FileText, Send } from "lucide-react";
import NewPushNoti from "../../../partials/modals/PushNotificationModal/NewPushNoti";
import ViewPushNoti from "../../../partials/modals/PushNotificationModal/ViewPushNoti";
import AssignClientPushNoti from "../../../partials/modals/PushNotificationModal/AssignclientPushNotifi";

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
            : d,
        ),
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
    setNewModal({ open: false, data: null });
  };

  const handleAddToModule = (formData) => {
    if (newModal.data) {
      setData((prev) =>
        prev.map((d) =>
          d.id === newModal.data.id
            ? { ...d, ...formData, status: "Pending" }
            : d,
        ),
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
    setNewModal({ open: false, data: null });
  };

  const filtered = data.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = getPushNotificationColumns({
    handleView,
    handleEdit,
    handlePush,
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Push Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage and send push communications
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Create Notification
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Recent Notifications
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Track your sent push communications
            </p>
          </div>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
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
        onPush={(selectedIds) => {
          
          setAssignModal({ open: false, data: null });
        }}
      />
    </div>
  );
};

export default PushNotification;
