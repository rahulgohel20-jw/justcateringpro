import { Fragment, useState } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Pencil,
  Trash2,
  CalendarDays,
  Send,
  Copy,
  Filter,
} from "lucide-react";
import { Container } from "@/components/container";


const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-md border border-gray-100 hover:shadow-md transition">
    <span className="text-md text-gray-700 font-medium">{label}</span>

    <div className="flex items-center justify-between">
      <span className="text-3xl font-bold text-gray-900">{value}</span>

    </div>
    <div className="w-full flex justify-end">
      <div className={`p-4 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={24} className={iconColor} strokeWidth={2} />
      </div>

    </div>
  </div>
);

const OfferCard = ({ title, description, discount, expires, active, highlight, imgSrc }) => (
  <div
    className={`rounded-xl overflow-hidden border bg-white flex flex-col transition hover:shadow-md ${
      highlight ? "border-blue-500 border-2" : "border-gray-200"
    }`}
  >
    <div className="relative">
      <img src={imgSrc} alt={title} className="w-full h-36 object-cover" />

      {active && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ACTIVE
        </span>
      )}

      <div className="absolute bottom-2 right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
        {discount}
      </div>
    </div>

    <div className="p-4 flex flex-col gap-2 flex-1">
      <h3 className="font-semibold text-gray-800">{title}</h3>

      <p className="text-xs text-gray-500 leading-snug line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <CalendarDays size={12} />
        <span>Expires: {expires}</span>
      </div>
    </div>

    
  </div>
);

const AvatarStack = ({ count }) => (
  <div className="flex items-center">
    {[...Array(Math.min(count, 3))].map((_, i) => (
      <img
        key={i}
        src={`https://i.pravatar.cc/28?img=${i + 10}`}
        alt="avatar"
        className="w-6 h-6 rounded-full border-2 border-white -ml-1 first:ml-0"
      />
    ))}

    {count > 3 && (
      <span className="ml-1 text-[10px] text-gray-500 font-medium">
        +{count - 3}
      </span>
    )}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="flex items-center justify-between mb-3">
    <div>
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
    <button className="text-xs font-medium bg-primary py-2 px-3 rounded-2xl text-white hover:bg-blue-600  transition">
      View All
    </button>
  </div>
);

const PackageCard = ({ title, badge, price, guests, sections, items }) => {
  const badgeColors = {
    PLATINUM: "bg-purple-500",
    GOLD: "bg-yellow-400",
    CUSTOM: "bg-blue-500",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{title}</h3>

          {badge && (
            <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColors[badge]}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="text-lg font-bold text-gray-900">
          ₹ {price.toLocaleString("en-IN")}
          <span className="text-xs text-gray-500 ml-1">/ plate</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-800 mt-1">
          <Users size={12} />
          <span>{guests} Guests</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sections.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{s.label}</span>
            <AvatarStack count={s.avatars} />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-bold text-gray-800">
        {items}
      </div>

      
    </div>
  );
};

/* -------------------- Dashboard -------------------- */
export default function Dashboard() {
  const [tab, setTab] = useState("Monthly");

  return (
    <Fragment>
      <Container>
        <div className="space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Showcase, Manage & Grow Your Catering Business
            </p>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Analytics & Insights</h2>

              <div className="flex items-center gap-3">
                <div className="flex rounded-full border text-xs overflow-hidden">
                  {["Monthly", "Weekly"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-4 py-1.5 ${
                        tab === t
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <Filter size={16} className="text-gray-400 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={Users} label="Visitors" value="10" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
              <StatCard icon={ShoppingBag} label="Orders" value="9" iconBg="bg-orange-100" iconColor="text-orange-600" />
              <StatCard icon={TrendingUp} label="Growth" value="10" iconBg="bg-green-100" iconColor="text-green-600" />

              {/* QR */}
              <div className="flex flex-col items-center justify-center gap-2 border rounded-xl p-3">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://webminds.com"
                  className="w-[120px]"
                />

                <div className="flex items-center gap-1 text-sm text-gray-700">
                  webminds.com
                  <Copy size={16} className="cursor-pointer" />
                </div>

                {/* <button className="flex items-center gap-1 bg-primary hover:bg-blue-600 text-white text-xs py-2 px-4 rounded-full">
                  <Send size={16} /> Share
                </button> */}
              </div>
            </div>
          </div>

          {/* Offers */}
          <div>
            <SectionHeader title="Active Offers" subtitle="Manage and monitor your ongoing promotional campaigns." />

            <div className="grid md:grid-cols-3 gap-4">
              <OfferCard title="Christmas Offer" description="Exclusive discount" discount="25%" expires="Oct 12" active imgSrc="https://images.unsplash.com/photo-1482189349482-3defd547e0e9?w=300&q=80" />
              <OfferCard title="Diwali Offer" description="Big festive sale" discount="50%" expires="Nov 01" active highlight imgSrc="https://images.unsplash.com/photo-1604423035610-54d9f6e1e4e5?w=300&q=80" />
              <OfferCard title="Organic Pass" description="Buy 1 get 1" discount="50%" expires="Jan 01" active imgSrc="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&q=80" />
            </div>
          </div>

          {/* Packages */}
          <div>
            <SectionHeader title="Custom Packages" />

            <div className="grid md:grid-cols-3 gap-4">
              <PackageCard title="Grand Royal Wedding" badge="PLATINUM" price={2500} guests="50-200"
                sections={[{ label: "STARTERS (2)", avatars: 2 }]}
                items="Items: 13 total"
              />
              <PackageCard title="Corporate Lunch" badge="GOLD" price={1800} guests="20-100"
                sections={[{ label: "MAIN (4)", avatars: 4 }]}
                items="Items: 8 total"
              />
              <PackageCard title="Beach Gala" badge="CUSTOM" price={3200} guests="100-500"
                sections={[{ label: "DRINKS (5)", avatars: 5 }]}
                items="Items: 18 total"
              />
            </div>
          </div>

          <div>
  <SectionHeader title="Gallery Portfolio" subtitle="Manage and showcase your work. Our editorial layout ensures your culinary artistry takes center stage." />
  

  <div className="grid md:grid-cols-3 gap-4">
    {[
      {
        category: "FINE DINING",
        title: "Ethereal Summer Gala",
        description: "A high-end editorial showcase of our signature summer tasting menu for...",
        photos: 27,
        swatches: ["#b0c4d8", "#c8a97e", "#f4b8c1"],
        extraSwatches: 24,
        imgSrc: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      },
      {
        category: "RUSTIC WEDDINGS",
        title: "The Orchard Collection",
        description: "Farm-to-table elegance showcasing our seasonal harvest dinners and...",
        photos: 15,
        swatches: ["#1a1a1a", "#c87941", "#222222"],
        extraSwatches: 12,
        imgSrc: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
      },
      {
        category: "CORPORATE EVENTS",
        title: "Modern Brunch Series",
        description: "Innovative breakfast and brunch solutions for morning seminars and...",
        photos: 41,
        swatches: ["#6c5fc7", "#4a9bb5", "#e8e8e8"],
        extraSwatches: 38,
        imgSrc: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
      },
    ].map((item, idx) => (
      <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition">
        
        {/* Image + category badge */}
        <div className="relative">
          <img src={item.imgSrc} alt={item.title} className="w-full h-52 object-cover" />
          <span className="absolute top-3 left-3 bg-white text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-bold text-gray-900">{item.title}</h3>
          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{item.description}</p>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5 mt-1">
            {item.swatches.map((color, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-lg border border-gray-100"
                style={{ backgroundColor: color }}
              />
            ))}
            <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-[10px] font-semibold text-gray-500">
              +{item.extraSwatches}
            </div>
          </div>

          {/* Photo count */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>{item.photos} Photos</span>
          </div>
        </div>

        
      </div>
    ))}
  </div>
</div>  

        </div>
      </Container>
    </Fragment>
  );
}