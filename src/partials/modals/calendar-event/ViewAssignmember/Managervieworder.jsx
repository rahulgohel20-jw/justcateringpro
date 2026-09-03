import React, { useState, useEffect } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import ViewDetailsModal from "./ViewDetailsModal";
import { getEventVendorDatainviewmanger } from "@/services/apiServices";
import { useLocation } from "react-router";
import { toAbsoluteUrl } from "@/utils";

const TABS = [
  { key: "chef", label: "Chef Labor", icon: ChefIcon },
  { key: "outside", label: "Outsource", icon: OutsourceIcon },
  { key: "labour", label: "Labor", icon: LaborIcon },
];

const STATUS_STYLES = {
  RUNNING:   { dot: "bg-amber-400",   text: "text-amber-500",   label: "Running"   },
  CONFIRMED: { dot: "bg-emerald-500", text: "text-emerald-600", label: "Confirmed" },
  PENDING:   { dot: "bg-slate-400",   text: "text-slate-500",   label: "Pending"   },
  COMPLETED: { dot: "bg-green-600",    text: "text-green-700",    label: "Completed" },
};


const getStatusStyle = (rawStatus) =>
  STATUS_STYLES[(rawStatus ?? "").toUpperCase()] ?? STATUS_STYLES.PENDING;

function ChefIcon({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function OutsourceIcon({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M19 11l2 2-2 2" />
    </svg>
  );
}

function LaborIcon({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ResourceIcon({ type }) {
  if (type === "chef")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
        <line x1="6" y1="17" x2="18" y2="17" />
      </svg>
    );
  if (type === "helper")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (type === "labor")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (type === "plates")
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    );
  return null;
}

function EmptyStatePlaceholder({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10">
      <img src={toAbsoluteUrl("/media/placeholders/placeholder.png")} alt="No data" className="w-auto h-[220px]" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

const OrderCard = ({ order, onViewDetails }) => {
  // Use raw status string from API response — normalize inside getStatusStyle
  const status = getStatusStyle(order.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 flex items-center gap-6 hover:shadow-md transition-shadow duration-200">
      <div className="min-w-[160px]">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">Order #</p>
        <p className="text-[15px] font-bold text-slate-800 leading-tight">#{order.id}</p>
        <p className="text-[13px] text-slate-500 mt-0.5">{order.name}</p>
      </div>

      <div className="h-12 w-px bg-slate-100 shrink-0" />

      {/* Status — label comes from STATUS_STYLES, not hardcoded */}
      <div className="min-w-[110px]">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-1">Status</p>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className={`text-[13px] font-semibold ${status.text}`}>{status.label}</span>
        </div>
      </div>

      <div className="h-12 w-px bg-slate-100 shrink-0" />

      <div className="min-w-[110px]">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-1">Type</p>
        <p className="text-[13px] font-medium text-slate-700">{order.type}</p>
      </div>

      <div className="h-12 w-px bg-slate-100 shrink-0" />

      <div className="flex-1">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-1.5">{order.resourceType}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {order.resources?.length ? (
            order.resources.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-[12px] font-medium text-slate-600">
                <ResourceIcon type={r.icon} />
                {r.label}
              </span>
            ))
          ) : (
            <span className="text-[12px] text-slate-400 italic">No resource data available</span>
          )}
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="flex items-center gap-2 bg-primary hover:bg-[#1246891] text-white text-[13px] font-semibold rounded-lg px-5 py-2.5 transition-colors duration-150 whitespace-nowrap shrink-0 ml-auto"
      >
        View Details
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

const buildResources = (detail) => {
  if (!detail) return [];
  const resources = [];
  if (detail.labour != null)      resources.push({ icon: "labor",  label: `Labour: ${detail.labour}` });
  if (detail.helpers != null)     resources.push({ icon: "helper", label: `Helpers: ${detail.helpers}` });
  if (detail.weight != null) {
    const unitLabel = detail.unitNameEnglish ? ` ${detail.unitNameEnglish}` : "";
    resources.push({ icon: "plates", label: `Qty: ${detail.weight}${unitLabel}` });
  }
  if (detail.shift != null)       resources.push({ icon: "labor",  label: `Shift: ${detail.shift}` });
  if (detail.assignedQty != null) resources.push({ icon: "helper", label: `AssignedQTY: ${detail.assignedQty}` });
  if (detail.confirmedQty != null)resources.push({ icon: "helper", label: `Confirmed: ${detail.confirmedQty}` });
  return resources;
};

const mapOrders = (list) =>
  (list ?? []).map((item, index) => {
    const detail = item.chefLabour ?? item.outside ?? item.labour ?? {};
    return {
      id: index + 1,
      rawId: item.id,
      name: item.vendorNameEnglish || "—",
      type: detail.staffCategory ? detail.staffCategory.replace(/_/g, " ") : item.resourceType,
      resourceType: item.resourceType,
      resources: buildResources(detail),
      status: item.status,   // keep raw string from API — getStatusStyle normalizes it
      raw: item,
    };
  });

const ManagerViewOrder = () => {
  const [activeTab, setActiveTab]       = useState("chef");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const location = useLocation();
  const { eventId, eventFunctionId } = location.state ?? {};

  const fetchOrders = async (type) => {
    if (!eventFunctionId || !eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await getEventVendorDatainviewmanger(eventFunctionId, eventId, type);
      const data = res?.data?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setOrders(mapOrders(list));
    } catch (err) {
      const beMsg = err?.response?.data?.msg || err?.response?.data?.message || "Failed to load orders.";
      setError(beMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(activeTab); }, [activeTab, eventFunctionId, eventId]);

  const handleOrderSaved = () => {
    fetchOrders(activeTab);
    setSelectedOrder(null);
  };

  // Filter: normalize both sides to uppercase so "Completed" == "COMPLETED"
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "All Status") return true;
    return (order.status ?? "").toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="min-h-screen px-8 font-sans">
      <div className="mb-4">
        <Breadcrumbs items={[{ title: "Events", path: "/calendar" }, { title: "Manager View" }]} />
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? "bg-slate-100 text-primary shadow-sm"
                : "text-slate-500 hover:bg-[#005AB81A] hover:text-slate-700"
            }`}
          >
            <Icon size={16} className={activeTab === key ? "text-primary" : "text-slate-400"} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Header + filter */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">All Orders</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Manage and track all your orders</p>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[13px] text-slate-600 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Running</option>
            <option>Confirmed</option>
            <option>Completed</option>
          </select>
          <svg
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading orders...
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <img src={toAbsoluteUrl("/media/placeholders/placeholder.png")} alt="No data" className="w-auto h-[400px]" />
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <img src={toAbsoluteUrl("/media/placeholders/placeholder.png")} alt="No data" className="w-auto h-[400px]" />
            </div>
          </div>
        ) : (
          filteredOrders.map((order, i) => (
            <OrderCard key={i} order={order} onViewDetails={() => setSelectedOrder(order)} />
          ))
        )}
      </div>

      <ViewDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onArrivalTimeUpdated={handleOrderSaved}
      />
    </div>
  );
};

export default ManagerViewOrder;