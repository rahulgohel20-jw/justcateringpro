import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";
import { usePermission } from "@/hooks/usePermission";
import { DeleteStoreReq, GetAllStoreReq, GetStoreRequisitionPdf, UpdateStoreReqStatus, WhatsAppPdf } from "@/services/apiServices";
import { shareViaWhatsApp } from "@/hooks/useWhatsAppShare";
import { storeRequisitionColumns } from "./constant";
import useStyle from "./style";

const StoreRequisition = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const classes = useStyle();
  const userId = localStorage.getItem("userId");
  const permission = usePermission("Store Requisition");
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [selectedPrintItem, setSelectedPrintItem] = useState(null);
  const [printMode, setPrintMode] = useState("print");

  const loadRows = async () => {
    try {
      setLoading(true);
      const response = await GetAllStoreReq(userId);
      const data = response?.data?.success ? response.data.data || [] : [];
      const mapped = data.map((item, index) => ({
        id: item.id,
        issueid: item.id,
        sr_no: index + 1,
        crcode: item.crcode,
        crdate: item.crdate,
        partyName: item.partyName,
        stockTypeName: item.stockTypeName,
        status: item.status,
        remarks: item.remarks,
        details: item.details || [],
        raw: item,
      }));
      setRows(mapped);
      setOriginalRows(mapped);
    } catch (error) {
      console.error("Failed to load store requisitions:", error);
      setRows([]);
      setOriginalRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    const query = value.trim().toLowerCase();
    const filtered = query
      ? originalRows.filter((row) => Object.values(row).some((item) => String(item).toLowerCase().includes(query)))
      : originalRows;
    setRows(filtered.map((row, index) => ({ ...row, sr_no: index + 1 })));
  };

  const handleStatusChange = async (id, status) => {
    const result = await Swal.fire({ title: "Change Status?", text: `Are you sure you want to change status to "${status}"?`, icon: "question", showCancelButton: true, confirmButtonText: "Yes, update it!" });
    if (!result.isConfirmed) return;
    try {
      const response = await UpdateStoreReqStatus(id, status.toUpperCase());
      if (!response?.data?.success) throw new Error(response?.data?.msg || "Status update failed");
      const update = (items) => items.map((item) => item.id === id ? { ...item, status: status.toUpperCase() } : item);
      setRows(update);
      setOriginalRows(update);
      Swal.fire({ icon: "success", title: "Updated!", timer: 1200, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while updating status." });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Are you sure?", text: "This Store Requisition entry will be deleted.", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" });
    if (!result.isConfirmed) return;
    try {
      await DeleteStoreReq(id);
      const remove = (items) => items.filter((item) => item.issueid !== id).map((item, index) => ({ ...item, sr_no: index + 1 }));
      setRows(remove);
      setOriginalRows(remove);
      Swal.fire({ icon: "success", title: "Deleted!", text: "Store Requisition deleted.", confirmButtonColor: "#16a34a" });
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete Store Requisition." });
    }
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
        generatePdf: () => GetStoreRequisitionPdf(1, lang, item.id, userId),
        moduleName: "Store Requisition",
        defaultName: item.partyName || "",
        defaultMobile: item.mobile || item.partyMobile || "",
        whatsAppApi: WhatsAppPdf,
        userId,
      });
      setSelectedPrintItem(null);
      return;
    }

    try {
      const response = await GetStoreRequisitionPdf(1, lang, item.id, userId);
      const fileUrl = response?.data?.fileUrl || response?.data?.data?.fileUrl;
      if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
      else throw new Error(response?.data?.msg || "PDF URL was not returned");
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while generating the PDF." });
    } finally {
      setSelectedPrintItem(null);
    }
  };

  return <Fragment>
    <Container>
      <div className="pb-2 mb-3"><h1 className="text-xl text-gray-900"><FormattedMessage id="USER.STORE_REQUISITION.TITLE" defaultMessage="Store Requisition" /></h1></div>
      <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className={`flex flex-wrap items-center gap-2 ${classes?.customStyle ?? ""}`}>
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
            <input className="input pl-8" placeholder={intl.formatMessage({ id: "USER.STORE_REQUISITION.SEARCH", defaultMessage: "Search Store Requisition" })} type="text" value={search} onChange={handleSearch} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permission.add && <button className="btn btn-primary" onClick={() => navigate("/stock-management/add-store-requisition")}><i className="ki-filled ki-plus"></i>{" "}<FormattedMessage id="USER.STORE_REQUISITION.ADD" defaultMessage="Add Store Requisition" /></button>}
      </div>
      </div>
      <TableComponent columns={storeRequisitionColumns((item) => navigate("/stock-management/add-store-requisition", { state: { editData: item.raw } }), handleDelete, handlePrint, handleStatusChange, permission, handleWhatsApp)} data={rows} paginationSize={100} loading={loading} />
    </Container>
    {showLangSelect && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Select Language</h3>
        <div className="flex flex-col gap-3">
          <button onClick={() => handleLangSelect(0)} className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg">English</button>
          <button onClick={() => handleLangSelect(1)} className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg">Hindi</button>
          <button onClick={() => handleLangSelect(2)} className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg">Gujarati</button>
        </div>
        <button onClick={() => { setShowLangSelect(false); setSelectedPrintItem(null); }} className="mt-4 text-sm text-gray-500 w-full">Cancel</button>
      </div>
    </div>}
  </Fragment>;
};

export default StoreRequisition;
