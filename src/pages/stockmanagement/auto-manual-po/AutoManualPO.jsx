import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { GetAllAutoManualPO, PrintAutoManualPO, GetInfoAutoManualPO, AddLogs, DeleteAutoManual, WhatsAppPdf, } from "../../../services/apiServices";



import InfoModal from "../../../partials/modals/info/InfoModal";
import { usePermission } from "../../../hooks/usePermission";
import { shareViaWhatsApp } from "../../../hooks/useWhatsAppShare";



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





const AutoManualPO = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [tableData, setTableData]       = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading]           = useState(false);

  // Info modal state
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedRow, setSelectedRow]     = useState(null);

  const navigate = useNavigate();
  const intl     = useIntl();
  const userId   = localStorage.getItem("userId");
  const permissions = usePermission("Auto Manual PO");
  console.log(permissions);
  


  const sendLog = async (status, item = {}) => {
  try {
    const voucher = item.voucherNo || "-";
    const sotNo   = item.sotNo    || "-";
    const party   = item.partyName || "-";

    await AddLogs({
      description: (() => {
        switch (status) {
          case "DELETE_SUCCESS":
            return `Auto/Manual PO deleted | Voucher: ${voucher} | SOT: ${sotNo} | Party: ${party}`;
          case "DELETE_ERROR":
            return `Auto/Manual PO delete failed | Voucher: ${voucher} | ID: ${item.id || "-"}`;
          case "INVOICE_NAVIGATE":
            return `Generate Invoice initiated | Voucher: ${voucher} | SOT: ${sotNo} | Party: ${party}`;
          default:
            return `Auto/Manual PO action performed | Voucher: ${voucher}`;
        }
      })(),
      eventType: (() => {
        switch (status) {
          case "DELETE_SUCCESS":  return "AutoManualPO_Delete";
          case "DELETE_ERROR":    return "AutoManualPO_Delete_Error";
          case "INVOICE_NAVIGATE": return "AutoManualPO_GenerateInvoice";
          default:                return "AutoManualPO";
        }
      })(),
      eventId:0,
      id:  0,
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res  = await GetAllAutoManualPO(userId);
      const raw  = res?.data?.data || [];
      const data = raw.map((item, index) => ({
        ...item,
        sr_no:     index + 1,
        voucherNo: item.voucherNo  || item.poNo       || "—",
        sotNo:     item.sotNo      || item.sotNumber   || "—",
        partyName: item.partyName  || item.party?.name || "—",
      }));
      setTableData(data);
      setOriginalData(data);
    } catch (err) {
      console.error("GetAllAutoManualPO failed:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setTableData(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q.toLowerCase())
        )
      );
      setTableData(filtered.map((item, i) => ({ ...item, sr_no: i + 1 })));
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  // Opens the Info modal
const handleInfo = async (item) => {
  const sotPoId = item?.id || item?.sotPoId;

  try {
    setLoading(true);

    const res = await GetInfoAutoManualPO(sotPoId);
    const infoData = res?.data?.data;

    setSelectedRow(infoData || item); // fallback
    setInfoModalOpen(true);

  } catch (err) {
    console.error("GetInfoAutoManualPO failed:", err?.response?.data || err?.message);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.response?.data?.message || "Failed to fetch info data.",
      confirmButtonColor: "#dc2626",
    });

  } finally {
    setLoading(false);
  }
};

  const handlePrint = async (item) => {
  const sotPoId = item?.id || item?.sotPoId;

  try {
    const res = await PrintAutoManualPO(sotPoId, userId);

    const fileUrl = res?.data?.fileUrl;

    if (fileUrl) {
      window.open(fileUrl, "_blank"); // 🔥 opens PDF in new tab
      return;
    }

    // fallback (if API returns data instead of URL)
    const printData = res?.data?.data || item;
    navigate("/stock-management/automanualpo/print", {
      state: { data: printData },
    });

  } catch (err) {
    console.error("PrintAutoManualPO failed:", err?.response?.data || err?.message);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err?.response?.data?.message || "Failed to fetch print data.",
      confirmButtonColor: "#dc2626",
    });
  }
};


const handleWhatsApp = (item) => {
  const sotPoId = item?.id || item?.sotPoId;
  shareViaWhatsApp({
    generatePdf: () => PrintAutoManualPO(sotPoId, userId),
    moduleName: "Auto/Manual PO",
    defaultName: item?.partyName || "",
    defaultMobile: item?.mobile || item?.partyMobile || "",
    whatsAppApi: WhatsAppPdf,
    userId,
  });
};


  const handleGenerateInvoice = async (item) => {
 
  await sendLog("INVOICE_NAVIGATE", item);

  navigate("/stock-management/purchase/add", { state: { poData: item } });
};

 const handleDelete = (id) => {
  const targetItem = tableData.find((i) => i.id === id) || {};

  Swal.fire({
    title: "Are you sure?",
    text: "This PO will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await DeleteAutoManual(id); // ✅ API call

        const reindex = (prev) =>
          prev
            .filter((item) => item.id !== id)
            .map((item, i) => ({ ...item, sr_no: i + 1 }));

        setTableData((prev) => reindex(prev));
        setOriginalData((prev) => reindex(prev));

        await sendLog("DELETE_SUCCESS", targetItem);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "PO has been deleted.",
          confirmButtonColor: "#16a34a",
        });
      } catch (err) {
        await sendLog("DELETE_ERROR", targetItem);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.response?.data?.message || "Failed to delete. Please try again.",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  });
};

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Container>

        {/* Page Header */}
        <div className="flex items-center justify-between pb-2 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <FormattedMessage
                id="PURCHASE.AUTO_MANUAL_PO.TITLE"
              defaultMessage="Purchase Orders"
              />
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage auto and manual purchase orders
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={intl.formatMessage({
                id: "PURCHASE.AUTO_MANUAL_PO.SEARCH",
                defaultMessage: "Search by voucher, SOT no, party…",
              })}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
            />
          </div>
          {/* <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-[#005BA8] hover:text-[#005BA8] transition"
          >
            <i className="ki-filled ki-arrows-circle text-sm"></i>
            Refresh
          </button> */}

          <div className="flex flex-wrap items-center gap-2">
                      {permissions.add && (
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate("/stock-management/automanualpo/add")}
                        >
                          <i className="ki-filled ki-plus"></i>{" "}
                          <FormattedMessage
                            id="USER.PURCHASE.ADD_AUTO_MANUAL_PO"
                            defaultMessage="Add Auto/Manual PO"
                          />
                        </button>
                      )}
                    </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <TableComponent
  columns={columns(
    handleInfo,
    handlePrint,
    handleDelete,
    handleGenerateInvoice,
    handleWhatsApp,
    {
      delete: permissions.delete,
      add: permissions.add,
    }
  )}
  data={tableData}
  paginationSize={10}
  loading={loading}
/>
        </div>

      </Container>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => {
          setInfoModalOpen(false);
          setSelectedRow(null);
        }}
        data={selectedRow}
        onSuccess={fetchData}
      />
    </Fragment>
  );
};

export default AutoManualPO;