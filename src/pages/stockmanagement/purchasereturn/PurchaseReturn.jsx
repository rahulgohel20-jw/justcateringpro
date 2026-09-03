import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";

import {
  GetAllPOReturn,
  DeletePOReturn,
  GetPurchaseReturnPdf,
  AddLogs,
  purchaseorderreturnexcel,
  WhatsAppPdf,
} from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import Swal from "sweetalert2";

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



const PurchaseReturn = () => {
  const classes = useStyle();
  const navigate = useNavigate();
  const intl = useIntl();
  const permissions = usePermission("Purchase Return");

  const [rawData, setRawData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId") ?? 1;

  const sendLog = useCallback(
    async (status, item = {}) => {
      try {
        await AddLogs({
          description:
            status === "DELETE_SUCCESS"
              ? `Purchase Return deleted | Voucher: ${item.voucher_no || "-"} | Bill: ${item.bill_no || "-"} | ${item.party || "-"}`
              : `Purchase Return delete failed | Voucher: ${item.voucher_no || "-"} | ID: ${item.purchaseid || "-"}`,
          eventType:
            status === "DELETE_SUCCESS"
              ? "PurchaseReturn_Delete"
              : "PurchaseReturn_Delete_Error",
          id:  0,
          eventId:0,
          user: getUserEmail(),
        });
      } catch (logErr) {
        console.error("Failed to save log:", logErr);
      }
    },
    [userId],
  );

  const mapRow = (item, index) => ({
    sr_no: index + 1,
    purchaseid: item.id,
    voucher_no: item.porcode,
    voucher_date: item.returndate,
    party: item.supplierName,
    total: item.finalamount ?? 0,
    bill_no: item.billno,
    remark: item.remarks ?? "",
    _raw: item, // ← keep full original
  });

  const withSerialNos = (rows) => rows.map((r, i) => ({ ...r, sr_no: i + 1 }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem("userId") ?? 1;

      const res = await GetAllPOReturn(userId);
      const list = res?.data?.data ?? [];
      const mapped = list.map(mapRow);
      setRawData(mapped);
      setTableData(mapped);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to fetch purchase returns:", err);
      setError(
        err?.message ?? "Something went wrong while fetching purchase returns.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setTableData(rawData);
    } else {
      const q = query.toLowerCase();
      const filtered = rawData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q),
        ),
      );
      setTableData(withSerialNos(filtered));
    }
  };

  const handleDelete = async (purchaseid) => {
    const targetItem = rawData.find((i) => i.purchaseid === purchaseid) || {};

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This purchase return will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#005BA8",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await DeletePOReturn(purchaseid);

      if (res?.data?.success) {
        await sendLog("DELETE_SUCCESS", targetItem);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Purchase return deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        const updateList = (prev) =>
          prev
            .filter((item) => item.purchaseid !== purchaseid)
            .map((item, i) => ({ ...item, sr_no: i + 1 }));

        setRawData(updateList);
        setTableData(updateList);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to delete purchase return.",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while deleting.",
      });
    }
  };

  const handleEdit = (item) => {
    navigate("/stock-management/purchase-return/add", {
      state: { editData: item },
    });
    navigate("/stock-management/purchase-return/add", {
      state: { editData: item },
    });
  };

 const handlePrint = async (item) => {
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

  if (!isConfirmed && !isDenied) return; // cancelled

  const porId = item.purchaseid || item._raw?.id;

  // ── Plain "Generate PDF" flow (unchanged) ──
  if (isConfirmed) {
    try {
      const res = await GetPurchaseReturnPdf(
        optionsValue.isCompanyDetails,
        porId,
        userId,
        optionsValue.isPrice,
      );
      const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

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
    } catch (error) {
      console.error("Print error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          "Something went wrong while generating the PDF.",
        confirmButtonColor: "#d33",
      });
    }
    return;
  }

  // ── "Generate & Send WhatsApp" flow ──
  if (isDenied) {
    const { value: waInput, isConfirmed: waConfirmed } = await Swal.fire({
      title: "Send via WhatsApp",
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px; text-align:left;">
          <div>
            <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              Recipient Name
            </label>
            <input id="waName" type="text" value="${item.party || ""}"
              style="width:100%; padding:8px 10px; border:1px solid #d1d5db; border-radius:8px; font-size:14px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#374151; display:block; margin-bottom:4px;">
              Mobile Number
            </label>
            <input id="waMobile" type="tel" maxlength="10" value="${item.mobile || item._raw?.mobile || ""}"
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

      const res = await GetPurchaseReturnPdf(
        optionsValue.isCompanyDetails,
        porId,
        userId,
        optionsValue.isPrice,
      );
      const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

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
        moduleName: "Purchase Return Report",
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
        window.open(fileUrl, "_blank", "noopener,noreferrer");
  Swal.close();
      }
    } catch (error) {
      console.error("Generate & send WhatsApp failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          "Something went wrong while generating/sending the report.",
        confirmButtonColor: "#d33",
      });
    }
  }
};

  const handleExcel = async (item) => {
    try {
      const porId = item.purchaseid || item._raw?.id;

      const response = await purchaseorderreturnexcel(porId, userId);

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
      link.download = `PurchaseReturn_${item.voucher_no}.xlsx`;
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
  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.PURCHASE_RETURN.TITLE"
              defaultMessage="Purchase Return"
            />
          </h1>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <i className="ki-filled ki-information-2"></i>
            {error}
            <button className="ml-auto underline text-xs" onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {/* Filters */}
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
            {/* Refresh — always visible */}
            {/* <button
              className="btn btn-light"
              onClick={fetchData}
              disabled={loading}
              title="Refresh"
            >
             
              <i
                className={`ki-filled ki-arrows-circle ${loading ? "animate-spin" : ""}`}
              ></i>
            </button> */}

            {/* Add button — only if permissions.add ← guarded */}
            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate("/stock-management/purchase-return/add")
                }
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.PURCHASE.ADD"
                  defaultMessage="Add Purchase Return"
                />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#005BA8]/20 border-t-[#005BA8] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              Loading purchases Returns...
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
            data={tableData}
            paginationSize={100}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default PurchaseReturn;
