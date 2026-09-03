import {
  X, Users, MapPin, Sun, Moon, Clock,
  LayoutGrid, Briefcase, Timer, Calendar,
  Building2, CheckCircle2, XCircle,
} from "lucide-react";

const PRICING_SLOTS = [
  { key: "morning",    label: "Morning Session",  sub: "08:00 AM – 01:00 PM",     icon: Sun        },
  { key: "evening",   label: "Evening Session",   sub: "06:00 PM – 11:00 PM",     icon: Moon       },
  { key: "fullDay",   label: "Full Day",          sub: "Up to 12 Hours",           icon: Clock      },
  { key: "exhibition",label: "Exhibition Rate",   sub: "Flat 24h setup/display",   icon: LayoutGrid },
];

const fmt = (val) =>
  val ? `₹ ${Number(val).toLocaleString("en-IN")}` : "—";

export default function ViewBanquetModal({ isOpen, onClose, banquet }) {
  if (!isOpen || !banquet) return null;

  const images = banquet.images || [];
  const isActive = banquet.status === "Active";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900">{banquet.banquetName}</h2>
              <span
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {isActive
                  ? <CheckCircle2 className="w-3 h-3" />
                  : <XCircle className="w-3 h-3" />}
                {banquet.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {(banquet.capacityMin || banquet.capacityMax) && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {banquet.capacityMin}
                  {banquet.capacityMax ? ` – ${banquet.capacityMax}` : ""} Pax
                </span>
              )}
              {banquet.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {banquet.location}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex gap-6">
            {/* Left: Images */}
            <div className="w-56 shrink-0">
              <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-2 border border-gray-200">
                {images.length > 0 ? (
                  <img src={images[0]} alt={banquet.banquetName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                    <Building2 className="w-10 h-10" />
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {images.slice(0, 4).map((src, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-blue-400 cursor-pointer">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {images.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Pricing */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-bold text-gray-700">Tiered Pricing Schedule</p>
              </div>

              {/* 2×2 pricing grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {PRICING_SLOTS.map(({ key, label, sub, icon: Icon }) => (
                  <div key={key} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{fmt(banquet[key])}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Corporate + Extra */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <Briefcase className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">Corporate Base</p>
                    <p className="text-sm font-bold text-gray-900">{fmt(banquet.corporate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <Timer className="w-5 h-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">Extra Charge / Hr</p>
                    <p className="text-sm font-bold text-gray-900">{fmt(banquet.extraPerHr)}</p>
                  </div>
                </div>
              </div>

              {/* Registration date */}
              {banquet.createdAt && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Registration Date:{" "}
                    <strong className="text-gray-600">{banquet.createdAt}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}