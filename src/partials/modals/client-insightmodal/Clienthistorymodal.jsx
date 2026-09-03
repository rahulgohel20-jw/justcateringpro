import { CustomModal } from "@/components/custom-modal/CustomModal";

const MetricCard = ({ label, value, icon }) => (
  <div className="flex flex-col gap-2 p-4 bg-white border  border-gray-800 rounded-xl">
    <span className="text-gray-800 text-[16px]">
      <i className={icon} />
    </span>
    <p className="text-[10px] font-bold tracking-widest text-gray-800 uppercase m-0">
      {label}
    </p>
    <p className="text-[20px] font-extrabold text-gray-900 m-0 leading-tight">
      {value ?? "—"}
    </p>
  </div>
);

const buildMetricCards = (data) => [
  {
    label: "EVENTS",
    value: data?.eventCount ?? "—",
    icon: "ki-filled ki-calendar",
  },
  {
    label: "MENUS",
    value: data?.menuCount ?? "—",
    icon: "ki-filled ki-check-circle",
  },
  {
    label: "LABOUR",
    value: data?.labourCount ?? "—",
    icon: "ki-filled ki-people",
  },
  {
    label: "RAW MATERIAL",
    value: data?.rawMaterialCount ?? "—",
    icon: "ki-filled ki-dollar",
  },
  {
    label: "QUOTATION",
    value: data?.quotationCount ?? "—",
    icon: "ki-filled ki-document",
  },
  {
    label: "INVOICE",
    value: data?.invoiceCount ?? "—",
    icon: "ki-filled ki-bill",
  },
  {
    label: "MENU ALLOCATION",
    value: data?.menuAllocationCount ?? "—",
    icon: "ki-filled ki-abstract-26",
  },
];

const ClientHistoryModal = ({
  open,
  onClose,
  client,
  summaryData,
  loading,
}) => {
  if (!client) return null;

  const metricCards = buildMetricCards(summaryData);

  const footer = (
    <div className="flex items-center justify-between w-full">
      <span className="text-xs text-gray-400">
        View-only · historical audit data
      </span>
      <button
        onClick={onClose}
        className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white bg-blue-700 hover:bg-blue-800 cursor-pointer border-none"
      >
        Done
      </button>
    </div>
  );

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      width={560}
      footer={footer}
      centered
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ background: client.avatarColor || "#386edb" }}
        >
          {client.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-gray-900 truncate">
              {client.name}
            </span>
            <span
              className={`shrink-0 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full ${
                client.membershipType === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {client.membershipType}
            </span>
          </div>
          <p className="text-[12px] text-gray-400 m-0 truncate">
            {client.enterprise}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-lg leading-none shrink-0"
        >
          <i className="ki-filled ki-cross" />
        </button>
      </div>

      {/* ── Client Since ── */}
      <div className="flex items-center gap-1.5 mb-4 pb-4 border-b border-gray-100">
        <i className="ki-filled ki-clock text-gray-300 text-sm" />
        <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
          Client since
        </span>
        <span className="text-[12px] font-bold text-gray-700 ml-1">
          {client.partnershipDate || "—"}
        </span>
      </div>

      {/* ── Metrics ── */}
      <p className="text-[10px] font-bold tracking-widest text-gray-800 uppercase m-0 mb-3">
        Performance Metrics
      </p>

      {loading ? (
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {metricCards.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      )}
    </CustomModal>
  );
};

export { ClientHistoryModal };
