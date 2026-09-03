import { useState } from "react";
import {
  X, Save, Building2, User, Phone, Mail,
  MapPin, CreditCard, Hash, Briefcase, ChevronDown,
} from "lucide-react";

const AddAccount = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    account_name: "",
    account_type: "",
    contact_person: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.account_name.trim()) return;
    onSave && onSave(form);
    setForm({
      account_name: "", account_type: "", contact_person: "",
      phone: "", email: "", gstin: "", pan: "",
      address: "", city: "", state: "", pincode: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-gray-400  text-sm text-gray-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white";

  const SectionHeading = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
      <div  />
      <span className="flex items-center gap-1.5 text-sm font-black uppercase tracking-widest text-gray-700">
         {title}
      </span>
    </div>
  );

  const Label = ({ icon: Icon, text, required }) => (
    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5 text-gray-600">
      {Icon && <Icon size={14} />}
      {text}
      {required && <span className="text-red-500">*</span>}
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Building2 size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">
                Add Account
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter supplier / vendor account details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 bg-white">

          {/* Basic Info */}
          <SectionHeading icon={Building2} title="Basic Information" />

          <div className="grid gap-4">
            <div>
              <Label icon={Building2} text="Account Name" required />
              <input
                name="account_name"
                value={form.account_name}
                onChange={handleChange}
                placeholder="Enter account / company name"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label icon={Briefcase} text="Account Type" />
                <div className="relative">
                  <select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer pr-8`}
                  >
                    <option value="">Select type</option>
                    <option>Vendor</option>
                    <option>Supplier</option>
                    <option>Manufacturer</option>
                    <option>Distributor</option>
                    <option>Retailer</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <Label icon={User} text="Contact Person" />
                <input
                  name="contact_person"
                  value={form.contact_person}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-blue-100 my-6" />

          {/* Contact */}
          <SectionHeading icon={Phone} title="Contact Details" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label icon={Phone} text="Phone" />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 00000 00000"
                className={inputClass}
              />
            </div>
            <div>
              <Label icon={Mail} text="Email" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="h-px bg-blue-100 my-6" />

          {/* Tax */}
          <SectionHeading icon={CreditCard} title="Tax Information" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label icon={CreditCard} text="GSTIN" />
              <input
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                className={inputClass}
              />
            </div>
            <div>
              <Label icon={Hash} text="PAN" />
              <input
                name="pan"
                value={form.pan}
                onChange={handleChange}
                placeholder="AAAAA0000A"
                className={inputClass}
              />
            </div>
          </div>

          <div className="h-px bg-blue-100 my-6" />

          {/* Address */}
          <SectionHeading icon={MapPin} title="Address" />
          <div className="grid gap-4">
            <div>
              <Label icon={MapPin} text="Street Address" />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street / Area / Locality"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label icon={MapPin} text="City" />
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass}
                />
              </div>
              <div>
                <Label icon={MapPin} text="State" />
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="max-w-xs">
              <Label icon={Hash} text="Pincode" />
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="000000"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-7 py-4 border-t bg-blue-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-blue-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition"
          >
            <Save size={16} /> Save Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;