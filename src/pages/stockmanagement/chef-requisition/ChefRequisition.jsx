import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { DeleteChefReq, GetAllChefReq, UpdateChefReqStatus, GetChefRequisitionPdf, AddLogs, WhatsAppPdf } from "../../../services/apiServices";
import { shareViaWhatsApp } from "../../../hooks/useWhatsAppShare";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";


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


const ChefRequisition = () => {
  const classes = useStyle();
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState([]);
const [originalData, setOriginalData] = useState([]);
const [loading, setLoading] = useState(false);
const [statusLoadingId, setStatusLoadingId] = useState(null);
  const navigate = useNavigate();

  const intl = useIntl();

  const userId = localStorage.getItem("userId");
  const permission = usePermission("Chef Requisition");
  const [showLangSelect, setShowLangSelect] = useState(false);
const [selectedPrintItem, setSelectedPrintItem] = useState(null);
const [printMode, setPrintMode] = useState("print");

useEffect(() => {
  fetchStorePO();
}, []);




const sendLog = async (status, item = {}) => {
  try {
    await AddLogs({
      description: (() => {
        switch (status) {
          case "DELETE_SUCCESS":
            return `Chef Requisition deleted | CR Code: ${item.crcode || "-"} | Party: ${item.partyName || "-"}`;
          case "DELETE_ERROR":
            return `Chef Requisition delete failed | CR Code: ${item.crcode || "-"} | ID: ${item.issueid || "-"}`;
          case "STATUS_SUCCESS":
            return `Chef Requisition status updated | CR Code: ${item.crcode || "-"} | Status: ${item.newStatus || "-"}`;
          case "STATUS_ERROR":
            return `Chef Requisition status update failed | CR Code: ${item.crcode || "-"}`;
          default:
            return "Chef Requisition action performed";
        }
      })(),
      eventType: (() => {
        switch (status) {
          case "DELETE_SUCCESS": return "ChefReq_Delete";
          case "DELETE_ERROR":   return "ChefReq_Delete_Error";
          case "STATUS_SUCCESS": return "ChefReq_Status_Update";
          case "STATUS_ERROR":   return "ChefReq_Status_Error";
          default:               return "ChefReq";
        }
      })(),
      id: 0,
      eventId:0,
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};

const handleStatusChange = async (id, newStatus) => {
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  
  const targetItem = tableData.find((i) => i.id === id) || {};

  const result = await Swal.fire({
    title: "Change Status?",
    text: `Are you sure you want to change status to "${statusLabel}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, update it!",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await UpdateChefReqStatus(id, newStatus.toUpperCase());

    if (res?.data?.success) {
     
      await sendLog("STATUS_SUCCESS", { ...targetItem, newStatus: newStatus.toUpperCase() });

      const update = (prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus.toUpperCase() } : item
        );

      setTableData(update);
      setOriginalData(update);

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Status changed to ${statusLabel}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: res?.data?.msg || "Failed to update status",
      });
    }
  } catch (error) {
    console.error(error);

    

    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "Something went wrong while updating status",
    });
  }
};


const fetchStorePO = async () => {
  try {
    setLoading(true);

    const res = await GetAllChefReq(userId);

    if (res?.data?.success) {
      const data = (res?.data?.data || []).map((item, index) => ({
        id: item.id,
        issueid: item.id,
        sr_no: index + 1,
        totalItems: item.details?.length || 0,
        crcode: item.crcode,
        partyName: item.partyName,
        crdate: item.crdate,
        stockTypeName: item.stockTypeName,
        status: item.status,
        remarks: item.remarks,

        
        details: item.details,
        raw: item, 
      }));

      setTableData(data);
      setOriginalData(data);
    } else {
      setTableData([]);
      setOriginalData([]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

 
  const handleSearch = (e) => {
  const query = e.target.value;
  setSearchQuery(query);
  if (!query.trim()) {
    setTableData(originalData);
  } else {
    const filtered = originalData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(query.toLowerCase())
      )
    );
    setTableData(filtered.map((item, index) => ({ ...item, sr_no: index + 1 })));
  }
};

 
const handleDelete = (issueid) => {
  const targetItem = tableData.find((i) => i.issueid === issueid) || {};

  Swal.fire({
    title: "Are you sure?",
    text: "This Chef Requisition entry will be deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await DeleteChefReq(issueid);

        // ✅ Log success
        await sendLog("DELETE_SUCCESS", targetItem);

        const removeAndReindex = (prev) =>
          prev
            .filter((item) => item.issueid !== issueid)
            .map((item, index) => ({ ...item, sr_no: index + 1 }));

        setTableData(removeAndReindex);
        setOriginalData(removeAndReindex);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Chef Requisition deleted.",
          confirmButtonColor: "#16a34a",
        });
      } catch (error) {
        console.error("Delete failed:", error);

  
        

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete Chef Requisition. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    }
  });
};

  
  const handleEdit = (item) => {
  navigate('/stock-management/add-chef-requisition', {
    state: { editData: item.raw }, 
  });
};
  
const handlePrint = (item) => {
  setSelectedPrintItem(item);
  setPrintMode("print");
  setShowLangSelect(true);
};

const handleWhatsApp = (item) => {
  setSelectedPrintItem(item);
  setPrintMode("whatsapp");
  setShowLangSelect(true);
};

const handleLangSelect = async (lang) => {
  setShowLangSelect(false);
  if (!selectedPrintItem) return;

  const item = selectedPrintItem;

  if (printMode === "whatsapp") {
    shareViaWhatsApp({
      generatePdf: () => GetChefRequisitionPdf(1, lang, item.id, userId),
      moduleName: "Chef Requisition",
      defaultName: item?.partyName || "",
      defaultMobile: item?.mobile || item?.partyMobile || "",
      whatsAppApi: WhatsAppPdf,
      userId,
    });
    setSelectedPrintItem(null);
    return;
  }

  // existing plain-print flow, unchanged
  try {
    const res = await GetChefRequisitionPdf(1, lang, item.id, userId);
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
  } finally {
    setSelectedPrintItem(null);
  }
};

  return (
    <Fragment>
      <Container>
        {/* Page Title */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.STORE_PO.TITLE"
              defaultMessage="Chef Requisition"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 ${classes?.customStyle ?? ""}`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.STORE_PO.SEARCH",
                  defaultMessage: "Search Chef Requisition",
                })}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permission.add &&(
            <button className="btn btn-primary" onClick={() => navigate('/stock-management/add-chef-requisition')}>
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="USER.STORE_PO.ADD"
                defaultMessage="Add Chef Requisition"
              />
            </button>
            )}
          </div>
        </div>

        {/* Table */}
    <TableComponent
  columns={columns(handleEdit, handleDelete, handlePrint, handleStatusChange, permission, handleWhatsApp)}
  data={tableData}
  paginationSize={100}
  loading={loading}
/>
      </Container>
       {showLangSelect && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[300px]">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Select Language
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleLangSelect(0)}
                className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
              >
                English
              </button>

              <button
                onClick={() => handleLangSelect(1)}
                className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
              >
                Hindi
              </button>

              <button
                onClick={() => handleLangSelect(2)}
                className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
              >
                Gujarati
              </button>
            </div>

            <button
              onClick={() => setShowLangSelect(false)}
              className="mt-4 text-sm text-gray-500 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ChefRequisition;