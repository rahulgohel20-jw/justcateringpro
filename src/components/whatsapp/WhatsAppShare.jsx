import { useState } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { WhatsAppPdf } from "@/services/apiServices";
import { successMsgPopup, errorMsgPopup } from "@/underConstruction";

const WA_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const parseWaDate = (s) => dayjs(s, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]);
const formatWaDate = (s) => {
  if (!s) return "";
  const p = parseWaDate(s);
  return p.isValid() ? p.format("DD.MM.YYYY") : "";
};
const formatWaTime = (s) => {
  if (!s) return "";
  const p = parseWaDate(s);
  return p.isValid() ? p.format("hh:mm A") : "";
};

export const buildWaMessage = ({ greeting, functionName, functionDateTime, venueName, pdfUrl }) => {
  const dateStr = formatWaDate(functionDateTime);
  const timeStr = formatWaTime(functionDateTime);
  return [
    `TO ${(greeting || "THERE").toUpperCase()},`,
    dateStr ? ` Date : ${dateStr} ` : null,
    venueName ? ` At Venue : ${venueName}` : null,
    functionName
      ? `${functionName.toUpperCase()}${timeStr ? ` at ${timeStr}` : ""} Ready,`
      : null,
    "",
    pdfUrl,
  ]
    .filter((l) => l !== null)
    .join("\n");
};

export const getCompanyAuthInfo = () => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { companyMobileNo: "", companyName: "" };
    const user = JSON.parse(raw)?.state?.user || {};
    return {
      companyMobileNo:
        user.userBasicDetails?.officeNo ||
        user.company?.mobileNo ||
        user.mobileNo ||
        user.mobile ||
        "",
      companyName:
        user.userBasicDetails?.companyName ||
        user.company?.nameEnglish ||
        user.company?.name ||
        "",
    };
  } catch {
    return { companyMobileNo: "", companyName: "" };
  }
};

/* ───────────── Modal (moved as-is from MenuReport) ───────────── */
export const WhatsAppModal = ({ isOpen, onClose, onSend, mode = "api" }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) {
      setError("Please enter a valid mobile number (min 10 digits).");
      return;
    }
    setError("");
    onSend(`+91${cleaned}`, name.trim());
    setName("");
    setMobile("");
  };

  const handleClose = () => {
    setName("");
    setMobile("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d={WA_PATH} />
          </svg>
          <h2 className="text-white font-semibold text-lg">
            {mode === "web" ? "Open in WhatsApp Web" : "Share via WhatsApp"}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">
            Enter the recipient's WhatsApp number to share the report PDF.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="9876543210"
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-gray-400 text-xs mt-1">Enter 10 digit mobile number</p>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d={WA_PATH} />
            </svg>
            {mode === "web" ? "Open WhatsApp" : "Send"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* ───────────── Footer buttons ───────────── */
export const WhatsAppButtons = ({ onShare }) => (
  <>
    <button
      onClick={() => onShare("api")}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Share on WhatsApp
    </button>
    <button
      onClick={() => onShare("web")}
      className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
      title="Opens web.whatsapp.com with the message pre-filled — you send it manually"
    >
      Web WhatsApp
    </button>
  </>
);

/* ───────────── Hook ───────────── */
export const useWhatsAppShare = ({
  pdfUrl,
  moduleName = "Menu Report",
  eventName,
  functionName,
  functionDateTime,
  venueName,
}) => {
  const userId = localStorage.getItem("userId");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("api");

  const openWeb = (mobile, recipientName) => {
    const message = buildWaMessage({
      greeting: recipientName || eventName || "there",
      functionName,
      functionDateTime,
      venueName,
      pdfUrl,
    });
    const cleaned = mobile.replace(/\D/g, "");
    window.open(
      `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  };

  const sendViaApi = async (mobile, recipientName) => {
    try {
      const { companyMobileNo, companyName } = getCompanyAuthInfo();
      const res = await WhatsAppPdf({
        companyMobileNo,
        companyName,
        mobileNo: mobile.replace(/\D/g, ""),
        moduleName,
        partyName: recipientName || "",
        url: pdfUrl,
        userId: Number(userId) || 0,
      });
      if (res?.data?.success) successMsgPopup("Report sent successfully!");
      else errorMsgPopup(res?.data?.msg || "Failed to send report");
    } catch (err) {
      console.error("WhatsAppPdf notify failed:", err);
      errorMsgPopup(err?.response?.data?.msg || "Failed to send report");
    }
    setOpen(false);
  };

  // contact = optional { contactNo, nameEnglish } to skip the modal
  const share = (m = "api", contact = null) => {
    setMode(m);
    if (contact?.contactNo) {
      const full = `+91${String(contact.contactNo).replace(/\D/g, "")}`;
      return m === "web"
        ? openWeb(full, contact.nameEnglish || "")
        : sendViaApi(full, contact.nameEnglish || "");
    }
    setOpen(true);
  };

  return {
    share,
    modalProps: {
      isOpen: open,
      onClose: () => setOpen(false),
      onSend: mode === "web" ? openWeb : sendViaApi,
      mode,
    },
  };
};