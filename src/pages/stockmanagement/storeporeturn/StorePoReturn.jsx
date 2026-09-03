import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import {
  GetAllIssueReturn,
  DeleteIssueReturn,
  GetStoreIssueReturnPdf,
  AddLogs,
  storeissuereturnexcel,
  WhatsAppPdf,
} from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import { shareViaWhatsApp } from "../../../hooks/useWhatsAppShare";

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

const StorePOReturn = () => {
  const classes = useStyle();
  const navigate = useNavigate();
  const intl = useIntl();
  const permissions = usePermission("Store Issue Return");

  const [rawData, setRawData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem("userId");

  const sendLog = useCallback(
    async (status, item = {}) => {
      try {
        const returnId = item.id || 0;
        const returnCode = item.issue_return_code || "-";
        const voucherCode = item.voucher_code || "-";
        const stockType = item.stockTypeName || "N/A";

        const description =
          status === "DELETE_SUCCESS"
            ? `Store Issue Return Deleted — Return Code: ${returnCode} (ID: ${returnId}) | ` +
              `Voucher: ${voucherCode} | Stock Type: ${stockType} | ` +
              `Deleted By: ${getUserEmail() || "Unknown User"}`
            : `Store Issue Return Delete FAILED — Return Code: ${returnCode} (ID: ${returnId}) | ` +
              `Voucher: ${voucherCode} | Attempted By: ${getUserEmail() || "Unknown User"}`;

        await AddLogs({
          description,
          eventType:
            status === "DELETE_SUCCESS"
              ? "StoreIssueReturn_Delete"
              : "StoreIssueReturn_Delete_Error",
          id: 0,
          eventId: 0,
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
    id: item.id,
    issue_return_code: item.sircode || "",
    voucher_code: item.voucher || "",
    voucher_date: item.returndate || "",
    partyName: item.partyName || "",
    stockTypeName: item.stockTypeName || "",
    remarks: item.remarks || "",
  });

  const withSerialNos = (rows) => rows.map((r, i) => ({ ...r, sr_no: i + 1 }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await GetAllIssueReturn(userId);
      const list = res?.data?.data ?? [];
      const mapped = list.map(mapRow);
      setRawData(mapped);
      setTableData(mapped);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to fetch store issue returns:", err);
      setError(err?.message ?? "Something went wrong.");
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

  const handleDelete = async (id) => {
    const targetItem = rawData.find((i) => i.id === id) || {};

    const confirm = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This store issue return will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await DeleteIssueReturn(id);

      if (res?.data?.success) {
        await sendLog("DELETE_SUCCESS", targetItem);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Store issue return deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });

        const updateList = (prev) =>
          prev
            .filter((item) => item.id !== id)
            .map((item, i) => ({ ...item, sr_no: i + 1 }));

        setRawData(updateList);
        setTableData(updateList);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to delete.",
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
    navigate("/stock-management/storeporeturn/add", {
      state: { editData: item },
    });
  };

  const handlePrint = async (item) => {
    try {
      const res = await GetStoreIssueReturnPdf(1, item.id, userId);
      const fileUrl = res?.data?.fileUrl || res?.data?.data?.fileUrl;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to generate PDF.",
        });
      }
    } catch (error) {
      console.error("Print error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while generating the PDF.",
      });
    }
  };

  const handleWhatsApp = (item) => {
    shareViaWhatsApp({
      generatePdf: () => GetStoreIssueReturnPdf(1, item.id, userId),
      moduleName: "Store Issue Return",
      defaultName: item?.partyName || "",
      defaultMobile: item?.mobile || item?.partyMobile || "",
      whatsAppApi: WhatsAppPdf,
      userId,
    });
  };

  const handleExcel = async (item) => {
    try {
      const poId = item.id || item.issueid;

      const response = await storeissuereturnexcel(poId, userId);

      const fileUrl = response?.data?.fileUrl;

      if (!fileUrl) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to generate Excel file.",
        });
        return;
      }

      window.open(fileUrl, "_blank", "noopener,noreferrer");

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `StoreIssue_${item.pocode || poId}.xlsx`;
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
              id="USER.STORE_ISSUE_RETURN.TITLE"
              defaultMessage="Store Issue Return"
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

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes?.customStyle ?? ""}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.STORE_ISSUE_RETURN.SEARCH",
                  defaultMessage: "Search Store Issue Return",
                })}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-light"
              onClick={fetchData}
              disabled={loading}
              title="Refresh"
            >
              <i
                className={`ki-filled ki-arrows-circle ${loading ? "animate-spin" : ""}`}
              ></i>
            </button>

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/stock-management/storeporeturn/add")}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.STORE_ISSUE_RETURN.ADD"
                  defaultMessage="Add Store Issue Return"
                />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-[#005BA8]/20 border-t-[#005BA8] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">
              Loading Store Issue Returns...
            </p>
          </div>
        ) : (
          <TableComponent
            columns={columns(
              permissions.edit ? handleEdit : null,
              permissions.delete ? handleDelete : null,
              handlePrint,
              handleExcel,
              handleWhatsApp,
            )}
            data={tableData}
            paginationSize={100}
            loading={loading}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default StorePOReturn;