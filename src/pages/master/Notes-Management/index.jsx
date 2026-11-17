import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { usePermission } from "../../../hooks/usePermission";
import ViewNoteModal from "./ViewNoteModal";
import AddNoteModal from "./AddNoteModal";
import { Search, Plus } from "lucide-react";
import Swal from "sweetalert2";
import {
  GetAllNotes,
  GetNoteById,
  DeleteNoteById,
  generatereportnotes,
} from "../../../services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

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

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

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

      const words = extractDictWords(list, [
        "title",
        "name",
        "noteName",
        "heading",
      ]);
      setDictWords(words);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Apply search
  useEffect(() => {
    let filtered = [...originalData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    setTableData(filtered.map((item, i) => ({ ...item, sr_no: i + 1 })));
  }, [searchQuery, originalData]);

  // Build suggestions while typing
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (searchQuery || "").trim().toLowerCase();
    if (q.length < 2 || dictWords.length === 0) {
      setSpellSuggestions([]);
      setShowSpell(false);
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, dictWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchQuery(word);
    setShowSpell(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev < spellSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev > 0 ? prev - 1 : spellSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
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

  const handleGenerateReport = async (note) => {
    const noteId = note?.id || note?.notesId;
    const fallbackUrl = `${import.meta.env.VITE_API_BASE_URL}/notes/generate-report?notesId=${noteId}&userId=${userId}`;

    try {
      const res = await generatereportnotes(noteId, userId);
      const reportUrl = [
        res?.data?.fileUrl,
        res?.data?.data,
        res?.data?.report_path,
        res?.request?.responseURL,
      ].find((value) => typeof value === "string" && value);

      window.open(reportUrl || fallbackUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to generate note report:", error);
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
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
                defaultMessage="Create, organize, and manage notes with headings and descriptions."
              />
            </p>
          </div>
          {permissions.add && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleAddNew}>
              <Plus className="w-4 h-4" /> <FormattedMessage id="NOTES.ADD_NOTE" defaultMessage="Add Note" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="filters flex flex-wrap justify-start gap-3 mb-4">
          <div className="filItems relative ml-auto" ref={searchBoxRef}>
            <Search className="w-4 h-4 text-primary absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none" />
            <input
              className="input pl-9"
              placeholder="Search notes…"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
            {showSpell && spellSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                  Suggestions:
                </div>
                <ul>
                  {spellSuggestions.map((s, i) => (
                    <li
                      key={s}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applySpellSuggestion(s);
                      }}
                      onMouseEnter={() => setSpellIndex(i)}
                      className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                        i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <TableComponent
          columns={columns(handleView, handleEdit, handleDelete, handleGenerateReport, permissions, intl)}
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
