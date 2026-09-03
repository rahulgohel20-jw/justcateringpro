import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { GetAllSOT, DeleteIssue, DeleteSOT, SotReportPdf  , getMultipleSotData, WhatsAppPdf} from "../../../services/apiServices";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";
import { Spin } from "antd";
import { shareViaWhatsApp } from "../../../hooks/useWhatsAppShare";

const StoreOrderingTickets = () => {
  const [searchQuery, setSearchQuery]   = useState("");
  const [tableData, setTableData]       = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading]           = useState(false);
   const [selectedRows, setSelectedRows] = useState([]); 

  const userId = localStorage.getItem("userId"); 
  const permission = usePermission("Store Ordering Tickets");

  const navigate = useNavigate();
  const intl     = useIntl();
 const handleSelectRow = (id, checked) => {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    );
  };

  const handleSelectAll = (checked) => {
  const eligibleIds = tableData
    .filter((row) => row.status !== "PO_GENERATED")
    .map((row) => row.id);
  setSelectedRows(checked ? eligibleIds : []);
};

const isAllSelected =
  tableData.filter((row) => row.status !== "PO_GENERATED").length > 0 &&
  selectedRows.length ===
    tableData.filter((row) => row.status !== "PO_GENERATED").length;

    const handleBulkAccept = async () => {
if (selectedRows.length === 0 || loading) return;
    try {
      setLoading(true);
      const res = await getMultipleSotData(selectedRows, userId);

      if (res?.data?.success) {
       navigate("/stock-management/accept-multiple-sot", {
  state: { data: res?.data?.data, sotIds: selectedRows },
});
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to fetch selected SOT data.",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch selected SOT data. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };


  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res  = await GetAllSOT(userId);
      
      const data = (res?.data?.data || []).map((item, index) => ({
        ...item,
        issueid:   item.id,
        sr_no:     index + 1,
        pocode:    item.sotNo,          
        partyName: item.eventName, 
        eventDate : item.eventDate,     
       
        isAccepted: item.status !== "PENDING",
      }));
      setTableData(data);
      setOriginalData(data);
    } catch (err) {
      console.error(err);
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

  const handleAccept = (item) => {
    navigate("/stock-management/acceptsot", { state: { data: item } });
  };

  const handleReturn = (item) => {
    navigate("/stock-management/storepo/return", { state: { editData: item } });
  };

  const handleWhatsApp = (item) => {
  const isCompanyDetails = 1;
  shareViaWhatsApp({
    generatePdf: () => SotReportPdf(item.id, isCompanyDetails, userId),
    moduleName: "Store Ordering Ticket",
    defaultName: item?.eventName || item?.partyName || "",
    defaultMobile: item?.mobile || item?.partyMobile || "",
    whatsAppApi: WhatsAppPdf,
    userId,
  });
};

const handleStoreReport = async (item) => {
  try {
    setLoading(true);
    const userId = localStorage.getItem("userId");
    const isCompanyDetails = 1; 

    const res = await SotReportPdf(item.id, isCompanyDetails, userId);

    const fileUrl = res?.data?.fileUrl;
    if (res?.data?.success && fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res?.data?.msg || "Failed to generate report.",
        confirmButtonColor: "#dc2626",
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to generate report. Please try again.",
      confirmButtonColor: "#dc2626",
    });
  } finally {
    setLoading(false);
  }
};

  const handleGeneratePO = (item) => {
    navigate("/stock-management/storepo/generate", { state: { data: item } });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This store ordering ticket will be Withdraw",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Withdraw it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await DeleteSOT(id);

          const reindex = (prev) =>
            prev
              .filter((item) => item.id !== id)
              .map((item, i) => ({ ...item, sr_no: i + 1 }));

          setTableData((prev) => reindex(prev));
          setOriginalData((prev) => reindex(prev));

          Swal.fire({
            icon: "success",
            title: "Withdrew!",
            text: "Entry has been Withdrew.",
            confirmButtonColor: "#16a34a",
          });
        } catch {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to withdraw. Please try again.",
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

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between pb-2 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <FormattedMessage
                id="USER.STORE_ORDERING_TICKET.TITLE"
                defaultMessage="Store Ordering Ticket"
              />
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage store ordering tickets and track their status
            </p>
          </div>

          {/* <button
            className="flex items-center gap-2 px-4 py-2.5 bg-[#005BA8] hover:bg-[#004a8c] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            onClick={() => navigate("/stock-management/storepo/add")}
          >
            <i className="ki-filled ki-plus text-base"></i>
            <FormattedMessage
              id="USER.STORE_ORDERING_TICKET.ADD"
              defaultMessage="Add Store Issue"
            />
          </button> */}
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={intl.formatMessage({
                id: "USER.STORE_ORDERING_TICKET.SEARCH",
                defaultMessage: "Search by SOT number, event…",
              })}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
            />
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-[#005BA8] hover:text-[#005BA8] transition"
          >
            <i className="ki-filled ki-arrows-circle text-sm"></i>
            Refresh
          </button>
            {permission?.add && selectedRows.length > 1 && (
  <button
    onClick={handleBulkAccept}
    disabled={loading}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
  >
    {loading ? <Spin size="small" /> : null}
    {loading ? "Fetching…" : `ACCEPT SOT (${selectedRows.length})`}
  </button>
)}
        </div>

       

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
           <TableComponent
              columns={columns(
                handleAccept,
                handleReturn,
                handleDelete,
                handleStoreReport,
                handleGeneratePO,
                permission,
                selectedRows,
                handleSelectRow,
                handleSelectAll,
                isAllSelected,
                handleWhatsApp
              )}
              data={tableData}
              paginationSize={10}
              loading={loading}
            />
        </div>

      </Container>
    </Fragment>
  );
};

export default StoreOrderingTickets;