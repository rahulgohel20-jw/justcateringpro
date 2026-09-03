import { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  Upload,
  Plus,
  Trash2,
  Hash,
  Users,
  MapPin,
  Lock,
  Sun,
  Moon,
  Clock,
  LayoutGrid,
  Briefcase,
  Timer,
  Activity,
  Image as ImageIcon,
  Building2,
} from "lucide-react";
import { AddBanquet } from "../../../services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const EMPTY_FORM = {
  banquetName: "",
  capacity: "",
  morning: "",
  evening: "",
  fullDay: "",
  exhibition: "",
  corporate: "",
  extraPerHr: "",
  password: "",

  status: "Active",
};

const PRICING_FIELDS = [
  { key: "morning", label: "Morning", icon: Sun, placeholder: "2,500" },
  { key: "evening", label: "Evening", icon: Moon, placeholder: "4,000" },
  { key: "fullDay", label: "Full Day", icon: Clock, placeholder: "6,500" },
  {
    key: "exhibition",
    label: "Exhibition",
    icon: LayoutGrid,
    placeholder: "5,000",
  },
  {
    key: "corporate",
    label: "Corporate",
    icon: Briefcase,
    placeholder: "3,500",
  },
  {
    key: "extraPerHr",
    label: "Extra (Per Hr)",
    icon: Timer,
    placeholder: "150",
  },
];

export default function AddBanquetModal({
  isOpen,
  onClose,
  refreshData,
  banquetDetails = null,
  userId,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);

  const isEdit = !!banquetDetails;

  useEffect(() => {
    if (!isOpen) return;
    if (banquetDetails) {
      setForm({
        banquetName: banquetDetails.banquetName || "",
        capacity: banquetDetails.capacity || "",
        morning: banquetDetails.morning || "",
        evening: banquetDetails.evening || "",
        fullDay: banquetDetails.fullDay || "",
        exhibition: banquetDetails.exhibition || "",
        corporate: banquetDetails.corporate || "",
        extraPerHr: banquetDetails.extraPerHr || "",
        password: banquetDetails.password || "",
        location: banquetDetails.location || "",
        status: banquetDetails.status || "Active",
      });
      setPreviewImages(banquetDetails.images || []);
      setExistingImageUrls(banquetDetails.images || []);
      setImageFiles([]);
    } else {
      setForm(EMPTY_FORM);
      setPreviewImages([]);
      setExistingImageUrls([]);
      setImageFiles([]);
    }
    setErrors({});
    setShowPassword(false);
  }, [isOpen, banquetDetails]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.banquetName.trim()) e.banquetName = "Banquet name is required";
    //    if (!form.capacity) e.capacity = "Capacity is required";
    //     if (!form.morning)            e.morning      = "Required";
    //     if (!form.evening)            e.evening      = "Required";
    //     if (!form.fullDay)            e.fullDay      = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      setImageFiles((prev) => [...prev, file]);
      const reader = new FileReader();
      reader.onloadend = () =>
        setPreviewImages((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    const src = previewImages[idx];
    if (typeof src === "string" && src.startsWith("http")) {
      setExistingImageUrls((prev) => prev.filter((url) => url !== src));
    } else {
      const newFileIdx = previewImages
        .slice(0, idx)
        .filter((s) => !s.startsWith("http")).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== newFileIdx));
    }
    setPreviewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("id", isEdit ? banquetDetails.id : 0);
      payload.append("userId", userId);
      payload.append("hallName", form.banquetName);
      payload.append("capacity", form.capacity);
      payload.append("morningPrice", form.morning);
      payload.append("eveningPrice", form.evening);
      payload.append("fullDayPrice", form.fullDay);
      payload.append("exhibitionPrice", form.exhibition);
      payload.append("corporatePrice", form.corporate);
      payload.append("extraChargesPerHr", form.extraPerHr);
      payload.append("password", form.password);
      payload.append("isActive", form.status === "Active");

      existingImageUrls.forEach((url, index) => {
        payload.append(`existingImages[${index}]`, url);
      });
      imageFiles.forEach((file, index) => {
        payload.append(`images[${index}]`, file);
      });

      await AddBanquet(payload);
      refreshData?.();
      onClose(false);

      Swal.fire({
        icon: "success",
        title: isEdit ? "Banquet Updated!" : "Banquet Created!",
        text: isEdit
          ? "Banquet details have been updated successfully."
          : "New banquet has been added successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition-colors
     ${err ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-500 bg-white"}`;

  const labelCls =
    "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1";

  const SectionTitle = ({ title }) => (
    <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-3 pb-1 border-b-2 border-blue-900 inline-block">
      {title}
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 no-scrollbar"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden no-scrollbar"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
           <h2 className="text-lg font-bold text-gray-900">
  {isEdit
    ? <FormattedMessage id="BANQUET.FORM.EDIT_TITLE" defaultMessage="Edit Banquet" />
    : <FormattedMessage id="BANQUET.FORM.ADD_TITLE" defaultMessage="Add New Banquet" />}
</h2>
<p className="text-xs text-gray-400 mt-0.5">
  <FormattedMessage id="BANQUET.FORM.SUBTITLE" defaultMessage="Configure logistics and pricing for your premium venue." />
</p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 no-scrollbar">
          {/* General Information */}
          <div>
<SectionTitle title={<FormattedMessage id="BANQUET.FORM.SECTION.GENERAL_INFO" defaultMessage="General Information" />} />            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
               <label className={labelCls}>
  <Building2 className="w-4 h-4" /> <FormattedMessage id="BANQUET.FORM.LABEL.BANQUET_NAME" defaultMessage="Banquet Name" />
</label>
                <input
                  value={form.banquetName}
                  onChange={(e) => set("banquetName", e.target.value)}
                  placeholder="e.g. Sapphire Grand Ballroom"
                  className={inputCls(errors.banquetName)}
                />
                {errors.banquetName && (
                  <p className="text-red-500 text-[10px] mt-0.5">
                    {errors.banquetName}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <div>
                 <label className={labelCls}>
  <Users className="w-3 h-3" /> <FormattedMessage id="BANQUET.FORM.LABEL.CAPACITY" defaultMessage="Capacity (Pax)" />
</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => set("capacity", e.target.value)}
                    placeholder="500"
                    className={inputCls(errors.capacity)}
                  />
                  {errors.capacity && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors.capacity}
                    </p>
                  )}
                </div>
                <div>
                <label className={labelCls}>
  <Activity className="w-3 h-3" /> <FormattedMessage id="BANQUET.FORM.LABEL.STATUS" defaultMessage="Status" />
</label>
                 <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls(false)}>
  <option value="Active"><FormattedMessage id="BANQUET.FORM.STATUS.ACTIVE" defaultMessage="Active" /></option>
  <option value="Inactive"><FormattedMessage id="BANQUET.FORM.STATUS.INACTIVE" defaultMessage="Inactive" /></option>
</select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div>
           <SectionTitle title={<FormattedMessage id="BANQUET.FORM.SECTION.PRICING_DETAILS" defaultMessage="Pricing Details" />} />
            <div className="grid grid-cols-3 gap-4">
              {PRICING_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>
                    <Icon className="w-3 h-3" /> {label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder={placeholder}
                      className={`${inputCls(errors[key])} pl-7`}
                    />
                  </div>
                  {errors[key] && (
                    <p className="text-red-500 text-[10px] mt-0.5">
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Access & Media */}
          <div>
<SectionTitle title={<FormattedMessage id="BANQUET.FORM.SECTION.ACCESS_MEDIA" defaultMessage="Access & Media" />} />
            {/* Password */}
            <div className="mb-4">
              <label className={labelCls}>
  <Lock className="w-3 h-3" /> <FormattedMessage id="BANQUET.FORM.LABEL.PASSWORD" defaultMessage="Booking Access Password" />
</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Set a secure access code"
                  className={`${inputCls(false)} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>
  <ImageIcon className="w-3 h-3" /> <FormattedMessage id="BANQUET.FORM.LABEL.GALLERY" defaultMessage="Venue Gallery" />
</label>
               <span className="text-[10px] text-gray-400">
  <FormattedMessage id="BANQUET.FORM.MAX_FILE_SIZE" defaultMessage="Max 5MB per file" />
</span>
              </div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                <Upload className="w-7 h-7 text-gray-300 mb-2" />
               <p className="text-sm text-gray-500">
  <FormattedMessage id="BANQUET.FORM.DROP_TEXT" defaultMessage="Drop assets here or" />{" "}
  <span className="text-blue-500 font-semibold">
    <FormattedMessage id="BANQUET.FORM.BROWSE_FILES" defaultMessage="browse files" />
  </span>
</p>
<p className="text-xs text-gray-400 mt-0.5">
  <FormattedMessage id="BANQUET.FORM.HIGH_RES_HINT" defaultMessage="High-resolution interior shots recommended" />
</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {previewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {previewImages.map((src, i) => (
                    <div
                      key={i}
                      className="relative w-16 h-16 rounded-lg overflow-hidden group border border-gray-200"
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
          <button
            onClick={() => onClose(false)}
            className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
<FormattedMessage id="BANQUET.FORM.CANCEL" defaultMessage="Cancel" />          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
 {saving
    ? <FormattedMessage id="BANQUET.FORM.SAVING" defaultMessage="Saving…" />
    : isEdit
      ? <FormattedMessage id="BANQUET.FORM.UPDATE_BTN" defaultMessage="Update Banquet" />
      : <FormattedMessage id="BANQUET.FORM.CREATE_BTN" defaultMessage="Create Banquet" />}
          </button>
        </div>
      </div>
    </div>
  );
}
