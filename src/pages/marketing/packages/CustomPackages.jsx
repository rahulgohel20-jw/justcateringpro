import { Fragment, useState } from "react";
import { Pencil, Trash2, Plus, Tag, Users, Search, ChevronDown } from "lucide-react";
import AddPackages from "./AddPackage";
import { Container } from "@/components/container";


const SEED_PACKAGES = [
  {
    id: 1,
    packageName: "Grand Royal Wedding",
    badge: "PLATINUM",
    price: 2500,
    guestMin: "50",
    guestMax: "200",
    sections: [
      { label: "STARTERS (2)", avatars: 2 },
      { label: "MAIN COURSE (3)", avatars: 3 },
    ],
    items: "Items: 12 (4 Starters, 5 Main, 3 Desserts)",
  },
  {
    id: 2,
    packageName: "Corporate Executive Lunch",
    badge: "GOLD",
    price: 1800,
    guestMin: "20",
    guestMax: "100",
    sections: [
      { label: "MAIN COURSE (4)", avatars: 4 },
      { label: "DESSERT (2)", avatars: 2 },
    ],
    items: "Items: 8 (2 Starters, 4 Main, 2 Desserts)",
  },
  {
    id: 3,
    packageName: "Summer Beach Gala",
    badge: "CUSTOM",
    price: 3200,
    guestMin: "100",
    guestMax: "500",
    sections: [
      { label: "BEVERAGES (5)", avatars: 5 },
      { label: "SEAFOOD STATION (3)", avatars: 3 },
    ],
    items: "Items: 18 (5 Starters, 6 Main, 4 Desserts, 3 Drinks)",
  },
];

const BADGE_STYLES = {
  PLATINUM: "bg-purple-500",
  GOLD: "bg-yellow-400",
  CUSTOM: "bg-blue-500",
};

/* ── Avatar stack ── */
const AvatarStack = ({ count }) => (
  <div className="flex items-center">
    {[...Array(Math.min(count, 3))].map((_, i) => (
      <img
        key={i}
        src={`https://i.pravatar.cc/28?img=${i + 10}`}
        alt="avatar"
        className="w-6 h-6 rounded-full border-2 border-white -ml-1 first:ml-0 object-cover"
      />
    ))}
    {count > 3 && (
      <span className="ml-1 text-[10px] text-gray-500 font-semibold">+{count - 3}</span>
    )}
  </div>
);

/* ── Package card ── */
const PackageCard = ({ pkg, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition">
    <div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{pkg.packageName}</h3>
        {pkg.badge && (
          <span className={`text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[pkg.badge]}`}>
            {pkg.badge}
          </span>
        )}
      </div>
      <div className="text-lg font-extrabold text-gray-900">
        ₹ {pkg.price.toLocaleString("en-IN")}
        <span className="text-xs font-normal text-gray-400 ml-1">/ plate</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
        <Users size={11} />
        <span>{pkg.guestMin}-{pkg.guestMax} Guests</span>
      </div>
    </div>

    <div className="flex flex-col gap-2">
      {pkg.sections.map((s, i) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-[11px] text-gray-600 font-medium">{s.label}</span>
          <AvatarStack count={s.avatars} />
        </div>
      ))}
    </div>

    <div className="bg-purple-50 rounded-lg px-3 py-2 text-[11px] text-gray-500 leading-relaxed">
      {pkg.items}
    </div>

    <div className="flex items-center justify-between pt-1">
      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition">
        <Pencil size={12} /> Edit
      </button>
      <button
        onClick={() => onDelete(pkg.id)}
        className="text-red-400 hover:text-red-600 border border-red-100 rounded-md p-1.5 transition"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

/* ── Empty state ── */
const EmptyState = ({ onCreatePackage }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-5">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gray-100 rounded-2xl" />
      <div className="absolute bottom-0 right-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
        <Tag size={22} className="text-white" />
      </div>
      <div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
        <Plus size={14} className="text-blue-600" strokeWidth={3} />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-lg font-bold text-gray-900">No Custom Package Created Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        Create your first Custom Package to attract more customers and boost sales. Your
        curated dashboard will appear here once you start.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onCreatePackage}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-md"
      >
        <Plus size={15} strokeWidth={3} /> Create Custom Package
      </button>
      <button className="flex items-center gap-2 text-blue-600 border border-blue-200 hover:bg-blue-50 text-sm font-semibold px-5 py-2.5 rounded-full transition">
        <Plus size={15} strokeWidth={3} /> Create Item Package
      </button>
    </div>
  </div>
);

/* ── Main page ── */
export default function CustomPackages() {
  const [packages, setPackages] = useState(SEED_PACKAGES);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCustomPackageModal, setShowCustomPackageModal] = useState(false);

  const handleDelete = (id) => setPackages((prev) => prev.filter((p) => p.id !== id));

  const handleSave = (data) => {
    const newPkg = {
      id: Date.now(),
      packageName: data.packageName || "New Package",
      badge: "CUSTOM",
      price: parseFloat(data.price) || 0,
      guestMin: data.guestMin || "0",
      guestMax: data.guestMax || "100",
      sections: data.sections || [],
      items: `Items: ${Object.values(data.selected || {}).flat().length} selected`,
    };
    setPackages((prev) => [...prev, newPkg]);
  };

  const filtered = packages.filter((p) =>
    p.packageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
        <Container>
            <div className="space-y-4">

                {/* Page header */}
                <div>
                <h1 className="text-xl font-extrabold text-gray-900">Custom Package</h1>
                <p className="text-sm text-gray-500">Manage and view all your created packages</p>
                </div>

                {/* Content card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                {packages.length === 0 ? (
                    <EmptyState onCreatePackage={() => setModalOpen(true)} />
                ) : (
                    <div className="p-5 flex flex-col gap-4">
                    {/* Search + filter row */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                            placeholder="Search packages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        </div>
                        <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 h-9 hover:bg-gray-50 transition ml-auto">
                        Package Type <ChevronDown size={14} />
                        </button>
                    </div>

                    {/* Package grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {filtered.map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onDelete={handleDelete} />
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* Fixed FAB */}
                <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-xl"
                >
                    <Plus size={16} strokeWidth={3} /> Create Custom Package
                </button>
                </div>  

                

                <AddPackages
                 open={modalOpen}
                onClose={() => setModalOpen(false)}
               
                onSave={handleSave}
                />
            </div>

        </Container>
    </Fragment>
  );
}