import { Copy, ArrowRight, Plus, Share2, Pencil } from "lucide-react";
import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import AddServiceModal from "./services/AddServiceModal";



const ServiceCard = ({ imgSrc, name, price }) => (
  <div className="flex flex-col gap-1.5">
    <div className="rounded-xl overflow-hidden">
      <img src={imgSrc} alt={name} className="w-full  object-cover" />
    </div>
    <p className="text-sm font-semibold text-gray-800">{name}</p>
    <p className="text-xs text-gray-500">{price}</p>
  </div>
);
 

const AddServiceCard = ({ onClick }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center h-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-primary cursor-pointer transition gap-2 group"
  >
    <div className="w-8 h-8 rounded-full border-2 border-gray-400 group-hover:border-primary flex items-center justify-center transition">
      <Plus size={16} className="text-gray-500 group-hover:text-primary transition" />
    </div>
    <span className="text-xs font-semibold text-gray-600 group-hover:text-primary transition">
      Add New Service
    </span>
  </div>
);


export default function ProfileManagement() {

  const [modalOpen, setModalOpen] = useState(false);
   const [services, setServices] = useState([
    {
      imgSrc: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80",
      name: "Restaurant Catering",
      price: "₹ 1700/- Per plate",
    },
    {
      imgSrc: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&q=80",
      name: "Banquet Catering",
      price: "₹ 1200/- Per plate",
    },
    {
      imgSrc: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
      name: "Outdoor Catering",
      price: "₹ 2000/- Per plate",
    },
  ]);
 
  const handleSaveService = (data) => {
    setServices((prev) => [
      ...prev,
      {
        imgSrc: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80",
        name: data.serviceName || "New Service",
        price: data.price ? `₹ ${data.price}/- Per plate` : "Price TBD",
      },
    ]);
  };

  return (
    <Fragment>
      <Container>
    <div className="space-y-5">

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Profile Management</h1>
        <p className="text-sm text-gray-500">Update your business profile and details.</p>
      </div>

      {/* My Business QR Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-bold text-gray-900">My Business QR</h1>
            <p className="text-sm text-gray-500 mt-0.5">My business, contact and payment info</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs font-semibold text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition flex items-center gap-1.5">
              <Share2 size={13} /> Share QR Code
            </button>
            <button className="text-xs font-semibold text-white bg-gray-900 rounded-lg px-3 py-1.5 hover:bg-gray-700 transition flex items-center gap-1.5">
              <Pencil size={13} /> Edit Business Info
            </button>
          </div>
        </div>

        {/* Business Info + QR */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/40?img=5"
                alt="logo"
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <p className="font-bold text-lg text-gray-900 leading-tight">
                The Web Minds Technology Pvt. Ltd.
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed">
              Leading catering &amp; events service provider with a range of customization
              options for every occasion.
            </p>

            {/* Address */}
            <p className="text-sm text-gray-600">
              123, Slicon valley, MG road, bangalore, karnataka 560001
            </p>

            {/* Phone */}
            <p className="text-sm text-gray-600">+91 98765 43210</p>
          </div>

          {/* QR Code */}
          <div className="shrink-0">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://webminds.com/the-web-minds-tech"
              alt="QR Code"
              className="w-[150px] h-[150px] rounded-xl"
            />
          </div>
        </div>

        {/* URL bar */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <span className="text-xs text-gray-800 flex-1 font-bold text-center truncate">
            https://webminds.com/the-web-minds-tech
          </span>
          <button className="text-gray-800 hover:text-gray-700 transition shrink-0">
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Your Services Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Your Services</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage Servicing &amp; Pricing</p>
          </div>
          <button className="flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition">
            View all <ArrowRight size={15} />
          </button>
        </div>
 
        <div className="grid grid-cols-4 gap-3">
          {services.map((s, i) => (
            <ServiceCard key={i} {...s} />
          ))}
          <div className="flex flex-col gap-1.5">
            <AddServiceCard onClick={() => setModalOpen(true)} />
          </div>
        </div>
      </div>
       <AddServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveService}
      />
    </div>

      </Container>
    </Fragment>
  );
}