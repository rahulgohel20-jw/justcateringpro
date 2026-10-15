import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { usePermission } from "../../../hooks/usePermission";
import ViewNoteModal from "./ViewNoteModal";
import AddNoteModal from "./AddNoteModal";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";
import { Search, Plus, StickyNote, FileText, Heading } from "lucide-react";
import Swal from "sweetalert2";
import {
  GetAllNotes,
  GetNoteById,
  DeleteNoteById,
  GetNotesModules,
  GetNotesPages,
} from "../../../services/apiServices";
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

const NotesManagement = () => {
  const permissions = usePermission("Notes Management");
  const userId = localStorage.getItem("userId");
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  // Filter dropdowns
  const [modules, setModules] = useState([]);
  const [pages, setPages] = useState([]);
  const [filterModuleId, setFilterModuleId] = useState("");
  const [filterPageId, setFilterPageId] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await GetNotesModules(userId);
      const data = res?.data?.data || res?.data;
      setModules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load modules:", err);
    }
  };

  const fetchPages = async (moduleId) => {
    try {
      const res = await GetNotesPages(moduleId, userId);
      const data = res?.data?.data || res?.data;
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load pages:", err);
    }
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await GetAllNotes(userId);
      const list = (res?.data?.data || res?.data || []).map((item, index) => ({
        ...item,
        sr_no: index + 1,
      }));
      setOriginalData(list);
      setTableData(list);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search + filter
  useEffect(() => {
    let filtered = [...originalData];

    // Filter by module
    if (filterModuleId) {
      filtered = filtered.filter(
        (item) => String(item.moduleId) === String(filterModuleId)
      );
    }

    // Filter by page
    if (filterPageId) {
      filtered = filtered.filter(
        (item) => String(item.pageId) === String(filterPageId)
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    setTableData(filtered.map((item, i) => ({ ...item, sr_no: i + 1 })));
  }, [searchQuery, originalData, filterModuleId, filterPageId]);

  const handleModuleFilterChange = (moduleId) => {
    setFilterModuleId(moduleId);
    setFilterPageId("");
    setPages([]);
    if (moduleId) {
      fetchPages(moduleId);
    }
  };

  const handleView = async (item) => {
    try {
      const res = await GetNoteById(item.id, userId);
      const noteData = res?.data?.data || res?.data || item;
      setViewTarget({
        ...item,
        ...noteData,
      });
    } catch {
      setViewTarget(item);
    }
  };

  const handleEdit = async (item) => {
    try {
      const res = await GetNoteById(item.id, userId);
      const noteData = res?.data?.data || res?.data || item;
      setEditTarget({
        ...item,
        ...noteData,
      });
      setAddModalOpen(true);
    } catch {
      setEditTarget(item);
      setAddModalOpen(true);
    }
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This note will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        const res = await DeleteNoteById(id, userId);
        if (res?.data?.success === false) {
          Swal.fire({ icon: "error", title: "Failed!", text: res.data.msg || "Delete failed." });
          return;
        }
        fetchNotes();
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
      } catch {
        Swal.fire({ icon: "error", title: "Failed to delete. Try again." });
      }
    }
  };

  const handleSearch = () => {
    // Search is already reactive via useEffect
  };

  const total = originalData.length;
  const totalHeadings = originalData.reduce(
    (acc, n) => acc + (n.headings?.length || 0),
    0
  );
  const uniqueModules = new Set(originalData.map((n) => n.moduleId)).size;

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <FormattedMessage id="NOTES.TITLE" defaultMessage="Notes Management" />
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <FormattedMessage
                id="NOTES.DESCRIPTION"
                defaultMessage="Create, organize, and manage notes with headings and descriptions across modules."
              />
            </p>
          </div>
          {permissions.add && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleAddNew}>
              <Plus className="w-4 h-4" /> <FormattedMessage id="NOTES.ADD_NOTE" defaultMessage="Add Note" />
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="flex gap-4 mb-6">
          <StatCard
            icon={StickyNote}
            label={intl.formatMessage({ id: "NOTES.TOTAL_NOTES", defaultMessage: "Total Notes" })}
            value={String(total).padStart(2, "0")}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatCard
            icon={Heading}
            label={intl.formatMessage({ id: "NOTES.TOTAL_HEADINGS", defaultMessage: "Total Headings" })}
            value={String(totalHeadings).padStart(2, "0")}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            icon={FileText}
            label={intl.formatMessage({ id: "NOTES.MODULES_USED", defaultMessage: "Modules Used" })}
            value={String(uniqueModules).padStart(2, "0")}
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
          />
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-end gap-3 mb-4">
          {/* Module Filter */}
          <div className="filItems min-w-[200px]">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <FormattedMessage id="NOTES.FILTER.MODULE" defaultMessage="Module" />
            </label>
            <SearchableSelect
              name="filterModuleId"
              value={filterModuleId}
              onChange={(e) => handleModuleFilterChange(e.target.value)}
              options={modules.map((m) => ({ value: String(m.moduleId), label: m.moduleName }))}
            />
          </div>

          {/* Page Filter */}
          <div className="filItems min-w-[200px]">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <FormattedMessage id="NOTES.FILTER.PAGE" defaultMessage="Page" />
            </label>
            <SearchableSelect
              name="filterPageId"
              value={filterPageId}
              onChange={(e) => setFilterPageId(e.target.value)}
              options={pages.map((p) => ({ value: String(p.pageId), label: p.pageName }))}
            />
          </div>

          {/* Search Button */}
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" /> <FormattedMessage id="NOTES.SEARCH_BTN" defaultMessage="Search" />
          </button>

          {/* Text Search */}
          <div className="filItems relative ml-auto">
            <Search className="w-4 h-4 text-primary absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Search notes…"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <TableComponent
          columns={columns(handleView, handleEdit, handleDelete, permissions, intl)}
          data={tableData}
          paginationSize={10}
          loading={loading}
        />

        {/* Add/Edit Modal */}
        <AddNoteModal
          isOpen={addModalOpen}
          onClose={setAddModalOpen}
          refreshData={fetchNotes}
          noteDetails={editTarget}
          userId={userId}
        />

        {/* View Modal */}
        <ViewNoteModal
          isOpen={!!viewTarget}
          onClose={() => setViewTarget(null)}
          note={viewTarget}
        />
      </Container>
    </Fragment>
  );
};

export default NotesManagement;
