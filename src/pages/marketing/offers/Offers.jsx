import { Fragment, useState } from "react";
import { Pencil, Trash2, CalendarDays, Plus, Tag } from "lucide-react";
import AddOffer from "./AddOffer";
import { Container } from "@/components/container";


const SEED_OFFERS = [
//   {
//     id: 1,
//     offerName: "Christmas Offer",
//     offerType: "Festival",
//     discount: "25% OFF",
//     expireDate: "Oct 12, 2026",
//     description: "Exclusive sitewide discount for premium members during the summer solstice event.",
//     active: true,
//     highlight: true,
//     imgSrc: "https://images.unsplash.com/photo-1482189349482-3defd547e0e9?w=400&q=80",
//   },
//   {
//     id: 2,
//     offerName: "Diwali Offer",
//     offerType: "Festival",
//     discount: "50% OFF",
//     expireDate: "Nov 05, 2026",
//     description: "Save big when bundling the latest laptop and smartphone accessories this season.",
//     active: true,
//     highlight: false,
//     imgSrc: "https://images.unsplash.com/photo-1604423035610-54d9f6e1e4e5?w=400&q=80",
//   },
//   {
//     id: 3,
//     offerName: "Organic Fresh Pass",
//     offerType: "Membership",
//     discount: "50% OFF",
//     expireDate: "Jan 01, 2026",
//     description: "Buy one monthly pass, get one free for new subscribers in the metropolitan area.",
//     active: true,
//     highlight: false,
//     imgSrc: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
//   },
//   {
//     id: 4,
//     offerName: "Organic Fresh Pass",
//     offerType: "Membership",
//     discount: "50% OFF",
//     expireDate: "Jan 01, 2026",
//     description: "Buy one monthly pass, get one free for new subscribers in the metropolitan area.",
//     active: true,
//     highlight: false,
//     imgSrc: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
//   },
//   {
//     id: 5,
//     offerName: "Organic Fresh Pass",
//     offerType: "Membership",
//     discount: "50% OFF",
//     expireDate: "Jan 01, 2026",
//     description: "Buy one monthly pass, get one free for new subscribers in the metropolitan area.",
//     active: true,
//     highlight: false,
//     imgSrc: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80",
//   },
];

/* ── Single offer card ── */
const OfferCard = ({ offer, onDelete }) => (
  <div
    className={`bg-white rounded-xl overflow-hidden border flex flex-col transition hover:shadow-md ${
      offer.highlight ? "border-primary border-2" : "border-gray-200"
    }`}
  >
    {/* Image */}
    <div className="relative">
      <img src={offer.imgSrc} alt={offer.offerName} className="w-full h-40 object-cover" />
      {offer.active && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          ACTIVE
        </span>
      )}
      <div className="absolute bottom-2 right-2 bg-yellow-400 text-white text-xs font-extrabold px-2 py-0.5 rounded-md shadow">
        {offer.discount}
      </div>
    </div>

    {/* Body */}
    <div className="p-4 flex flex-col gap-1.5 flex-1">
      <h3 className="font-bold text-gray-900">{offer.offerName}</h3>
      <p className="text-xs text-gray-500 leading-snug line-clamp-2">{offer.description}</p>
      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
        <CalendarDays size={12} />
        <span>Expires: {offer.expireDate}</span>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center justify-between px-4 pb-4">
      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition">
        <Pencil size={12} /> Edit
      </button>
      <button
        onClick={() => onDelete(offer.id)}
        className="text-red-400 hover:text-red-600 border border-red-100 rounded-md p-1.5 transition"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

/* ── Empty state ── */
const EmptyState = ({ onCreateOffer }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-5">
    {/* Icon stack */}
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-gray-100 rounded-2xl" />
      <div className="absolute bottom-0 right-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
        <Tag size={22} className="text-white" />
      </div>
      <div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
        <Plus size={14} className="text-primary" strokeWidth={3} />
      </div>
    </div>

    <div className="text-center space-y-2">
      <h3 className="text-lg font-bold text-gray-900">No Offers Created Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        Create your first offer to attract more customers and boost sales. Your curated
        dashboard will appear here once you start.
      </p>
    </div>

    <button
      onClick={onCreateOffer}
      className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition shadow-md"
    >
      <Plus size={16} strokeWidth={3} /> Create Offer
    </button>
  </div>
);

/* ── Main ActiveOffers page ── */
export default function Offers() {
  const [offers, setOffers] = useState(SEED_OFFERS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = (id) => setOffers((prev) => prev.filter((o) => o.id !== id));

  const handleSave = (data) => {
    const newOffer = {
      id: Date.now(),
      offerName: data.offerName || "New Offer",
      offerType: data.offerType || "",
      discount: data.discount ? `${data.discount}` : "OFF",
      expireDate: data.expireDate
        ? new Date(data.expireDate).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "TBD",
      description: data.description || "New promotional offer.",
      active: true,
      highlight: false,
      imgSrc: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
    };
    setOffers((prev) => [...prev, newOffer]);
  };

  return (
    <Fragment>
        <Container>
            <div className="">

            {/* Page header */}
            <div className="mb-5">
                <h1 className="text-xl font-extrabold text-gray-900">Active Offers</h1>
                <p className="text-sm text-gray-500">Manage and monitor your ongoing promotional campaigns.</p>
            </div>

            {/* Content card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm  relative">
                {offers.length === 0 ? (
            
                <EmptyState onCreateOffer={() => setModalOpen(true)} />
                ) : (
                
                <div className="p-5">
                    <div className="grid grid-cols-3 gap-4">
                    {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} onDelete={handleDelete} />
                    ))}
                    </div>

                    
                </div>
                )}
            </div>
                    <div className="fixed bottom-6 right-6 z-50">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-xl"
                        >
                            <Plus size={16} strokeWidth={3} /> Create Offer
                        </button>
                        </div>

            <AddOffer
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />
            </div>

        </Container>
    </Fragment>
  );
}