import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const normalizeMobile = (v) => String(v || "").replace(/\D/g, "").slice(-10);

const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * WhatsApp sharing modal with two methods:
 *  - "direct"  : share straight away, no name / number asked
 *  - "details" : user enters recipient name + mobile, then shares
 *
 * onShare({ method, name, mobile }) is called when the user clicks "Share".
 * `mobile` is returned as full number "+91XXXXXXXXXX" (only for method "details").
 * The parent decides which API to call (e.g. WhatsAppPdf) and may return a promise.
 */
const WhatsAppShareModal = ({
  isOpen,
  onClose,
  onShare,
  defaultName = "",
  defaultMobile = "",
  directHint = "",
}) => {
  const [method, setMethod] = useState("direct");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMethod("direct");
    setName(defaultName || "");
    setMobile(normalizeMobile(defaultMobile));
    setError("");
    setSending(false);
  }, [isOpen, defaultName, defaultMobile]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (sending) return;

    if (method === "details") {
      const cleaned = mobile.replace(/\D/g, "");
      if (cleaned.length < 10) {
        setError("Please enter a valid 10 digit mobile number.");
        return;
      }
      setError("");
      setSending(true);
      try {
        await onShare({ method, name: name.trim(), mobile: `+91${cleaned}` });
      } finally {
        setSending(false);
      }
      return;
    }

    setError("");
    setSending(true);
    try {
      await onShare({ method: "direct", name: "", mobile: "" });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    onClose();
  };

  const optionClass = (active) =>
    `w-full text-left rounded-xl border-2 px-4 py-3 transition cursor-pointer ${
      active
        ? "border-green-500 bg-green-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    }`;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <WhatsAppIcon className="w-6 h-6 text-white" />
          <h2 className="text-white font-semibold text-lg">Share via WhatsApp</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-gray-600 text-sm">Choose how you want to share the report.</p>

          {/* Option 1: Direct Share */}
          <button
            type="button"
            onClick={() => {
              setMethod("direct");
              setError("");
            }}
            className={optionClass(method === "direct")}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  method === "direct" ? "border-green-600" : "border-gray-300"
                }`}
              >
                {method === "direct" && <span className="h-2 w-2 rounded-full bg-green-600" />}
              </span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Direct Share</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Share right away without entering a name or number.
                </p>
                {directHint && method === "direct" && (
                  <p className="text-xs text-green-700 mt-1">{directHint}</p>
                )}
              </div>
            </div>
          </button>

          {/* Option 2: Share with Details */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMethod("details")}
            onKeyDown={(e) => e.key === "Enter" && setMethod("details")}
            className={optionClass(method === "details")}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                  method === "details" ? "border-green-600" : "border-gray-300"
                }`}
              >
                {method === "details" && <span className="h-2 w-2 rounded-full bg-green-600" />}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">Share with Details</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter the recipient's name and WhatsApp number.
                </p>

                {method === "details" && (
                  <div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleShare()}
                        placeholder="e.g. Rahul"
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Mobile Number
                      </label>
                      <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500 transition">
                        <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={mobile}
                          maxLength={10}
                          onChange={(e) => {
                            setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                            setError("");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleShare()}
                          placeholder="9876543210"
                          className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                          autoFocus
                        />
                      </div>
                      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={sending}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={sending}
            className={`px-5 py-2 text-sm text-white rounded-lg transition font-medium flex items-center gap-2 ${
              sending ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <WhatsAppIcon className="w-4 h-4" />
            {sending ? "Sharing..." : "Share"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default WhatsAppShareModal;