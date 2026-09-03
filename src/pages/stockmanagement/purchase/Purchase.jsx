import { Fragment, useCallback, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, getRowClassName } from "./constant";
import useStyle from "./style";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "antd";

import {
  GetAllPurchase,
  DeletePurchase,
  GetPurchasePdfReport2,
  GeneratePurchaseDateWiseReport,
  AddLogs,
  purchasorderexcel,
  WhatsAppPdf,
} from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};


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



const Purchase = () => {
  const classes = useStyle();
  const permissions = usePermission("Purchase");

  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState({
    open: false,
    startDate: null,
    endDate: null,
    isCompanyDetails: true,
    isPrice: true,
    submitting: false,
  });

  const navigate = useNavigate();
  const intl = useIntl();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setTableData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(query.toLowerCase()),
        ),
      );
      setTableData(
        filtered.map((item, index) => ({ ...item, sr_no: index + 1 })),
      );
    }
  };

  const userId = localStorage.getItem("userId");

  const sendLog = useCallback(
    async (status, item = {}) => {
      try {
        const logPayload = {
          description:
            status === "DELETE_SUCCESS"
              ? `Purchase deleted | Voucher: ${item.voucher || "-"} | Date: ${item.podate || "-"} | Supplier: ${item.supplierName || `ID:${item.purchaseid}`}`
              : `Purchase delete failed | Voucher: ${item.voucher || "-"} | ID: ${item.purchaseid || "-"}`,
          eventType:
            status === "DELETE_SUCCESS"
              ? "Purchase_Delete"
              : "Purchase_Delete_Error",
              eventId:0,
          id: 0,
          user: getUserEmail(),
        };
        await AddLogs(logPayload);
      } catch (logErr) {
        console.error("Failed to save log:", logErr);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchPurchase();
  }, []);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      const res = await GetAllPurchase(userId);
      const data = (res?.data?.data || []).map((item, index) => ({
        ...item,
        sr_no: index + 1,
        purchaseid: item.id,
        voucher: item.pocode,
        podate: item.podate ? item.podate.split("-").reverse().join("/") : "",
      }));
      setTableData(data);
      setOriginalData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (purchaseid) => {
    const targetItem = tableData.find((i) => i.purchaseid === purchaseid) || {};

    Swal.fire({
      title: "Are you sure?",
      text: "This purchase entry will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await DeletePurchase(purchaseid);

          // ✅ Log delete success
          await sendLog("DELETE_SUCCESS", targetItem);

          const removeAndReindex = (prev) =>
            prev
              .filter((item) => item.id !== purchaseid)
              .map((item, index) => ({ ...item, sr_no: index + 1 }));

          setTableData(removeAndReindex);
          setOriginalData(removeAndReindex);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Purchase entry deleted.",
            confirmButtonColor: "#16a34a",
          });
        } catch (error) {
          console.error("Delete failed:", error);

          // ✅ Log delete error
          await sendLog("DELETE_ERROR", targetItem);

          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete purchase. Please try again.",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  const handleEdit = (item) => {
    navigate("/stock-management/purchase/add", { state: { editData: item } });
  };

const handlePrint = async (item) => {
  // Track checkbox state live so it works for both Confirm and Deny buttons
  const optionsValue = { isCompanyDetails: 1, isPrice: 1 };

  const { isConfirmed, isDenied } = await Swal.fire({
    title: "PDF Options",
    html: `
      <div style="display:flex; flex-direction:column; gap:16px; margin-top:8px;">
        <label style="display:flex; align-items:center; justify-content:space-between; font-size:14px; font-weight:500; color:#374151;">
          With Company Details
          <input type="checkbox" id="isCompanyDetails" checked
            style="width:18px; height:18px; accent-color:#005BA8; cursor:pointer;" />
        </label>
        <label style="display:flex; align-items:center; justify-content:space-between; font-size:14px; font-weight:500; color:#374151;">
          With Price
          <input type="checkbox" id="isPrice" checked
            style="width:18px; height:18px; accent-color:#005BA8; cursor:pointer;" />
        </label>
      </div>
    `,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Generate PDF",
    denyButtonText: "Generate & Send WhatsApp",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#005BA8",
    denyButtonColor: "#16a34a",
    cancelButtonColor: "#6b7280",
    didOpen: () => {
      document
        .getElementById("isCompanyDetails")
        .addEventListener("change", (e) => {
          optionsValue.isCompanyDetails = e.target.checked ? 1 : 0;
        });
      document.getElementById("isPrice").addEventListener("change", (e) => {
        optionsValue.isPrice = e.target.checked ? 1 : 0;
      });
    },
  });

  if (!isConfirmed && !isDenied) return; // user cancelled

  // ── Plain "Generate PDF" flow (unchanged) ──
  if (isConfirmed) {
    try {
      const res = await GetPurchasePdfReport2(
        userId,
        item.id,
        optionsValue.isCompanyDetails,
        optionsValue.isPrice,
      );
      const fileUrl = res?.data?.fileUrl;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to generate PDF.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          "Something went wrong while generating the PDF.",
        confirmButtonColor: "#d33",
      });
    }
    return;
  }

  // ── "Generate & Send WhatsApp" flow ──
  if (isDenied) {
    // Ask for the recipient's WhatsApp number (prefill from item if available)
    const { value: waInput, isConfirmed: waConfirmed } = await Swal.fire({
      title: "Send via WhatsApp",
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px; text-align:left;">
          <div>
            <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              Recipient Name
            </label>
            <input id="waName" type="text" value="${item.supplierName || ""}"
              style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              Mobile Number
            </label>
            <input id="waMobile" type="tel" maxlength="10" value="${item.mobile || item.supplierMobile || ""}"
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
        const mobile = document
          .getElementById("waMobile")
          .value.replace(/\D/g, "");
        if (!mobile || mobile.length < 10) {
          Swal.showValidationMessage("Please enter a valid 10 digit mobile number.");
          return false;
        }
        return { name, mobile };
      },
    });

    if (!waConfirmed || !waInput) return;

    try {
      Swal.fire({
        title: "Generating & sending...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await GetPurchasePdfReport2(
        userId,
        item.id,
        optionsValue.isCompanyDetails,
        optionsValue.isPrice,
      );
      const fileUrl = res?.data?.fileUrl;

      if (!fileUrl) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to generate PDF.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const { companyMobileNo, companyName } = getCompanyAuthInfo();

      const wres = await WhatsAppPdf({
        companyMobileNo,
        companyName,
        mobileNo: waInput.mobile,
        moduleName: "Purchase Report",
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
        // WhatsApp send failed, but the PDF was generated successfully —
        // open it instead of showing an error/warning.
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        Swal.close();
      }
    } catch (err) {
      console.error("Generate & send WhatsApp failed:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          "Something went wrong while generating/sending the report.",
        confirmButtonColor: "#d33",
      });
    }
  }
};

  const handleExcel = async (item) => {
    try {
      const response = await purchasorderexcel(item.purchaseid, userId);

      const fileUrl = response?.data?.fileUrl;

      if (!fileUrl) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to generate Excel file.",
        });
        return;
      }

      // ✅ Open in new tab
      window.open(fileUrl, "_blank", "noopener,noreferrer");

      // ✅ Force download
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `Purchase_${item.voucher}.xlsx`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Downloaded",
        text: "Excel file downloaded successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Excel download failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to download Excel file.",
      });
    }
  };

  // ── Purchase Report modal (date-range report) ──────────────────────────
  const formatDMY = (date) => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${mo}/${y}`;
  };

  const openReportModal = () => {
    const today = new Date();
    setReportModal({
      open: true,
      startDate: today,
      endDate: today,
      isCompanyDetails: true,
      isPrice: true,
      submitting: false,
    });
  };

  const closeReportModal = () => {
    setReportModal((prev) => ({ ...prev, open: false }));
  };

  const handleReportStartDateChange = (date) => {
    setReportModal((prev) => ({
      ...prev,
      startDate: date,
      // keep end date valid if it now falls before the new start date
      endDate: prev.endDate && date && prev.endDate < date ? date : prev.endDate,
    }));
  };

  const handleGenerateReport = async () => {
    const { startDate, endDate, isCompanyDetails, isPrice } = reportModal;

    if (!startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing dates",
        text: "Please select both a start date and an end date.",
        confirmButtonColor: "#005BA8",
      });
      return;
    }
    if (endDate < startDate) {
      Swal.fire({
        icon: "warning",
        title: "Invalid range",
        text: "End date cannot be before start date.",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    setReportModal((prev) => ({ ...prev, submitting: true }));

    try {
      const res = await GeneratePurchaseDateWiseReport(
        formatDMY(endDate),
        formatDMY(startDate),
        isCompanyDetails ? 1 : 0,
        isPrice ? 1 : 0,
        userId,
      );
      const fileUrl = res?.data?.report_path;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        closeReportModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to generate report.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          "Something went wrong while generating the report.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setReportModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.PURCHASE.TITLE"
              defaultMessage="Purchase"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes?.customStyle ?? ""}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.PURCHASE.SEARCH",
                  defaultMessage: "Search Purchase",
                })}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip
    title={
      <div className="text-xs leading-relaxed">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
          Bill No. present — will update in Account Ledger
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-green-200 inline-block" />
          Bill No. missing — will not update in Account Ledger
        </div>
      </div>
    }
  >
    <button
      type="button"
      className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
    >
      <Info size={16} />
    </button>
  </Tooltip>
            <button
              className="btn btn-light"
              onClick={openReportModal}
            >
              <i className="ki-filled ki-document"></i>{" "}
              Purchase Report
            </button>

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/stock-management/purchase/add")}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.PURCHASE.ADD"
                  defaultMessage="Add Purchase"
                />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#005BA8]/20 border-t-[#005BA8] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              Loading purchases...
            </p>
          </div>
        ) : (
    <TableComponent
  columns={columns(
    permissions.edit ? handleEdit : null,
    permissions.delete ? handleDelete : null,
    handlePrint,
    handleExcel,
  )}
  getRowClassName={getRowClassName}
  data={tableData}
  paginationSize={100}
  loading={loading}
/>
        )}
      </Container>

      {reportModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Purchase Report
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <DatePicker
                  selected={reportModal.startDate}
                  onChange={handleReportStartDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="input w-full"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <DatePicker
                  selected={reportModal.endDate}
                  onChange={(date) =>
                    setReportModal((prev) => ({ ...prev, endDate: date }))
                  }
                  dateFormat="dd/MM/yyyy"
                  minDate={reportModal.startDate}
                  className="input w-full"
                  placeholderText="dd/mm/yyyy"
                />
              </div>

              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                With Company Details
                <input
                  type="checkbox"
                  checked={reportModal.isCompanyDetails}
                  onChange={(e) =>
                    setReportModal((prev) => ({
                      ...prev,
                      isCompanyDetails: e.target.checked,
                    }))
                  }
                  className="w-[18px] h-[18px] accent-[#005BA8] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                With Price
                <input
                  type="checkbox"
                  checked={reportModal.isPrice}
                  onChange={(e) =>
                    setReportModal((prev) => ({
                      ...prev,
                      isPrice: e.target.checked,
                    }))
                  }
                  className="w-[18px] h-[18px] accent-[#005BA8] cursor-pointer"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: "#6b7280", color: "#fff" }}
                onClick={closeReportModal}
                disabled={reportModal.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateReport}
                disabled={reportModal.submitting}
              >
                {reportModal.submitting ? "Generating..." : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Purchase;