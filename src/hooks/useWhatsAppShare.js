import Swal from "sweetalert2";

const getCompanyAuthInfo = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return { companyMobileNo: "", companyName: "" };
    const parsed = JSON.parse(authStorage);
    const user = parsed?.state?.user || {};
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

/**
 * Shared "Generate PDF + Send via WhatsApp" flow.
 *
 * @param {Object} opts
 * @param {Function} opts.generatePdf - async () => { fileUrl } — must call your
 *   existing PDF-generation API and return { fileUrl } (or throw).
 * @param {string} opts.moduleName - label sent to WhatsAppPdf, e.g. "Purchase Report"
 * @param {string} [opts.defaultName] - prefill for recipient name
 * @param {string} [opts.defaultMobile] - prefill for mobile number
 * @param {Function} opts.whatsAppApi - the WhatsAppPdf service function
 * @param {number|string} opts.userId
 */
export const shareViaWhatsApp = async ({
  generatePdf,
  moduleName,
  defaultName = "",
  defaultMobile = "",
  whatsAppApi,
  userId,
}) => {
  const { value: waInput, isConfirmed } = await Swal.fire({
    title: "Send via WhatsApp",
    html: `
      <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px; text-align:left;">
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
            Recipient Name
          </label>
          <input id="waName" type="text" value="${defaultName}"
            style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
        </div>
        <div>
          <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
            Mobile Number
          </label>
          <input id="waMobile" type="tel" maxlength="10" value="${defaultMobile}"
            placeholder="9876543210"
            style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Send",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
    preConfirm: () => {
      const name = document.getElementById("waName").value.trim();
      const mobile = document.getElementById("waMobile").value.replace(/\D/g, "");
      if (!mobile || mobile.length < 10) {
        Swal.showValidationMessage("Please enter a valid 10 digit mobile number.");
        return false;
      }
      return { name, mobile };
    },
  });

  if (!isConfirmed || !waInput) return;

  try {
    Swal.fire({
      title: "Generating & sending...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await generatePdf();
    const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

    if (!fileUrl) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.msg || "Failed to generate PDF.",
      });
      return;
    }

    const { companyMobileNo, companyName } = getCompanyAuthInfo();

    const wres = await whatsAppApi({
      companyMobileNo,
      companyName,
      mobileNo: waInput.mobile,
      moduleName,
      partyName: waInput.name || "",
      url: fileUrl,
      userId: Number(userId) || 0,
    });

    if (wres?.data?.success) {
      Swal.fire({
        icon: "success",
        title: "Sent!",
        text: "Report sent successfully via WhatsApp.",
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      // WhatsApp send failed, but PDF was generated — open it instead.
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      Swal.close();
    }
  } catch (err) {
    console.error("Generate & send WhatsApp failed:", err?.response?.data || err?.message);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.response?.data?.msg || "Something went wrong while generating/sending the report.",
      confirmButtonColor: "#dc2626",
    });
  }
};