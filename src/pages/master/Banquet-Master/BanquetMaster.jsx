import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { usePermission } from "../../../hooks/usePermission";
import ViewBanquetModal from "./ViewBanquetModal";
import { Search, Plus, Building2, CheckCircle2, Wrench } from "lucide-react";
import Swal from "sweetalert2";
import AddBanquetModal from "../../../partials/modals/add-banquet/AddBanquetModal";
import { GetAllBanquet, DeleteBanquet, ChangeStatusBanquet } from "../../../services/apiServices";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
const StatCard = ({ icon: Icon, label, value, iconColor, iconBg }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 flex-1">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold text-gray-900 leading-tight">{value}</p>
    </div>
  </div>
);

const BanquetMaster = () => {
  const permissions = usePermission("Banquet Master");
  const userId = localStorage.getItem("userId");
const intl = useIntl();  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  useEffect(() => { fetchBanquets(); }, []);

 const fetchBanquets = async () => {
  try {
    setLoading(true);
    const res = await GetAllBanquet(userId);
    const list = (res?.data?.data || []).map((item, index) => ({
      ...item,
      // normalize API field names → frontend names
      capacity:item.capacity,
      banquetName: item.hallName,
      morning: item.morningPrice,
      evening: item.eveningPrice,
      fullDay: item.fullDayPrice,
      exhibition: item.exhibitionPrice,
      corporate: item.corporatePrice,
      extraPerHr: item.extraChargesPerHr,
      status: item.isActive ? "Active" : "Inactive",
      sr_no: index + 1,
    }));
    setOriginalData(list);
    setTableData(list);
  } catch (err) {
    console.error("Failed to fetch banquets:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!searchQuery.trim()) {
      setTableData(originalData.map((item, i) => ({ ...item, sr_no: i + 1 })));
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = originalData.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(q))
      );
      setTableData(filtered.map((item, i) => ({ ...item, sr_no: i + 1 })));
    }
  }, [searchQuery, originalData]);

  const handleView = (item) => setViewTarget(item);

  const handleEdit = (item) => {
    setEditTarget(item);
    setAddModalOpen(true);
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setAddModalOpen(true);
  };

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This banquet will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });
  if (result.isConfirmed) {
    try {
      await DeleteBanquet(id, userId);
      fetchBanquets();
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Failed to delete. Try again." });
    }
  }
};

const handleToggleStatus = async (id, currentStatus) => {
  const isCurrentlyActive = currentStatus === "Active";
  const result = await Swal.fire({
    title: `${isCurrentlyActive ? "Deactivate" : "Activate"} Banquet?`,
    text: `This banquet will be marked as ${isCurrentlyActive ? "Inactive" : "Active"}.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: isCurrentlyActive ? "#d33" : "#1e3a8a",
    cancelButtonColor: "#6b7280",
    confirmButtonText: isCurrentlyActive ? "Yes, Deactivate" : "Yes, Activate",
  });
  if (result.isConfirmed) {
    try {
      await ChangeStatusBanquet(id);
      fetchBanquets();
      Swal.fire({
        icon: "success",
        title: isCurrentlyActive ? "Deactivated!" : "Activated!",
        text: `Banquet is now ${isCurrentlyActive ? "Inactive" : "Active"}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Toggle status failed:", err);
      Swal.fire({ icon: "error", title: "Failed!", text: "Could not update status. Try again." });
    }
  }
};

  const total = originalData.length;
  const active = originalData.filter((b) => b.status === "Active").length;
  const inactive = originalData.filter((b) => b.status !== "Active").length;

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4">
          <div>
<h1 className="text-xl font-bold text-gray-900">
  <FormattedMessage id="BANQUET.TITLE" defaultMessage="Banquet Master" />
</h1>           <p className="text-xs text-gray-400 mt-0.5">
  <FormattedMessage
    id="BANQUET.DESCRIPTION"
    defaultMessage="Manage banquet halls, pricing structures, capacity details, and venue information efficiently."
  />
</p>
          </div>
          {permissions.add && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleAddNew}>
              <Plus className="w-4 h-4" /> <FormattedMessage id="BANQUET.ADD_BANQUET" defaultMessage="Add Banquet" />
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="flex gap-4 mb-6">
        <StatCard
  icon={Building2}
  label={intl.formatMessage({ id: "BANQUET.TOTAL_BANQUETS", defaultMessage: "Total Banquets" })}
  value={String(total).padStart(2, "0")}
  iconColor="text-blue-600"
  iconBg="bg-blue-50"
/>
<StatCard
  icon={CheckCircle2}
  label={intl.formatMessage({ id: "BANQUET.ACTIVE_HALLS", defaultMessage: "Active Halls" })}
  value={String(active).padStart(2, "0")}
  iconColor="text-green-600"
  iconBg="bg-green-50"
/>
<StatCard
  icon={Wrench}
  label={intl.formatMessage({ id: "BANQUET.MAINTENANCE_INACTIVE", defaultMessage: "Maintenance/Inactive" })}
  value={String(inactive).padStart(2, "0")}
  iconColor="text-orange-500"
  iconBg="bg-orange-50"
/>  
        </div>

        {/* Search */}
        <div className="filters flex flex-wrap items-center gap-2 mb-4">
          <div className="filItems relative">
            <Search className="w-4 h-4 text-primary absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Search banquets…"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

     <TableComponent
  columns={columns(handleView, handleEdit, handleDelete, handleToggleStatus, permissions, intl)}
  data={tableData}
  paginationSize={10}
  loading={loading}
/>

        <AddBanquetModal
          isOpen={addModalOpen}
          onClose={setAddModalOpen}
          refreshData={fetchBanquets}
          banquetDetails={editTarget}
          userId={userId}
        />

        <ViewBanquetModal
          isOpen={!!viewTarget}
          onClose={() => setViewTarget(null)}
          banquet={viewTarget}
        />
      </Container>
    </Fragment>
  );
};

export default BanquetMaster;