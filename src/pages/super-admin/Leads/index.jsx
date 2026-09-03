import {
  Fragment,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constact";
import { useNavigate, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import Leaddetailview from "../../../partials/modals/leadmodal/Leaddetailview";
import FollowUp from "../../../partials/modals/follow-up-modal/Followup";
import AssignLeadModal from "../../../partials/modals/follow-up-modal/Assignleadmodal";
import Moveleadmodal from "../../../partials/modals/leadmodal/Moveleadmodal";
import {
  Flame,
  Snowflake,
  Send,
  Monitor,
  Bell,
  Trophy,
  XCircle,
  ClipboardList,
} from "lucide-react";
import {
  DeleteLeadbyID,
  GetLeadByID,
  UpdateleadbyID,
  Fetchmanager,
  assignMultipleLeadToMember,
  GETstagesleaddatabypipeline,
  GETallpipeline,
  MoveLeadToStage,
  Getstagesbypipeline,
  Getstageleaddatabypipelineidandstage,
  GetAllLeadSource,
  Getallsubsource,
} from "@/services/apiServices";
import useStyle from "./style";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { DragAndDrop } from "@/components/drag-and-drop/DragAndDrop";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "../../../hooks/usePermission";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatFollowUpDateForAPI = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    const [datePart] = dateStr.split(" ");
    const [y, m, d] = datePart.split("-");
    return `${d}/${m}/${y} 12:00 AM`;
  }
  if (/\d{2}\/\d{2}\/\d{4}\s+\d/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y} 12:00 AM`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return `${dateStr} 12:00 AM`;
  return dateStr;
};

const getStoredUserId = () => {
  const direct =
    localStorage.getItem("mainId") ||
    localStorage.getItem("id") ||
    localStorage.getItem("user_id") ||
    localStorage.getItem("empId") ||
    localStorage.getItem("memberId");
  if (direct) return direct;
  for (const key of [
    "user",
    "userData",
    "authUser",
    "userInfo",
    "auth",
    "profile",
  ]) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "{}");
      const id =
        parsed?.id || parsed?.userId || parsed?.user_id || parsed?.empId;
      if (id) return String(id);
    } catch {}
  }
  return null;
};

const EMPTY_STATS = {
  total: 0,
  hot: 0,
  cold: 0,
  inquire: 0,
  assigned: 0,
  hotAmount: 0,
  lostAmount: 0,
  wonCount: 0,
  wonAmount: 0,
  lostCount: 0,
  totalAmount: 0,
  openAmount: 0,
  coldAmount: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────

const SuperLeads = () => {
  const permissions = usePermission("Leads");

  const classes = useStyle();
  const navigate = useNavigate();
  const location = useLocation();

  // ── View ──
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("superLeadsViewMode");
    return saved !== null ? Number(saved) : 0;
  });
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  // Add near other state declarations
  const [isFollowUpSaving, setIsFollowUpSaving] = useState(false);

  // ── Data ──
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);

  // ── Pipeline / Stage ──
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [activePipeline, setActivePipeline] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);
  const [noPipelines, setNoPipelines] = useState(false);
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState("");
  const [isStagesLoading, setIsStagesLoading] = useState(false);
  const [filteredByStage, setFilteredByStage] = useState(null);
  const [selectedAssignId, setSelectedAssignId] = useState("");
  const [managers, setManagers] = useState([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [assignCloseDate, setAssignCloseDate] = useState("");
  const [assignDescription, setAssignDescription] = useState("");
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveLeadPayload, setMoveLeadPayload] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLead, setDrawerLead] = useState(null);
  const [drawerFollowUps, setDrawerFollowUps] = useState([]);

  const [boardColumns, setBoardColumns] = useState([]);
  const [dndActive, setDndActive] = useState(false);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const [sourceTabs] = useState([
    { id: "online", label: "Online Sources" },
    { id: "offline", label: "Offline Sources" },
  ]);
  const [activeSourceTab, setActiveSourceTab] = useState("online");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedSubsource, setSelectedSubsource] = useState("");
  const [sources, setSources] = useState([]);
  const [subsources, setSubsources] = useState([]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null); // ← was new Date().getMonth() + 1 // 1-12, null = all
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [allSources, setAllSources] = useState([]);
  const [allSubsources, setAllSubsources] = useState([]);
  const [yearRangeStart, setYearRangeStart] = useState(
    new Date().getFullYear() - 5,
  );
  const yearPickerRef = useRef(null);

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const originalBoardColumnsRef = useRef([]);
  const pipelineCache = useRef({});

  const userId = localStorage.getItem("userId");
  const stagesRef = useRef([]);
  const fetchSourcesAndSubsources = useCallback(async () => {
    try {
      const [sourceRes, subsourceRes] = await Promise.all([
        GetAllLeadSource(userId),
        Getallsubsource(userId),
      ]);
      setAllSources(sourceRes?.data?.data || []);
      setAllSubsources(subsourceRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    }
  }, []);

  useEffect(() => {
    fetchSourcesAndSubsources();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (yearPickerRef.current && !yearPickerRef.current.contains(e.target)) {
        setShowYearPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // ─── Derived / memoized ────────────────────────────────────────────────────
  const filteredBoardColumns = useMemo(() => {
    const search = searchText.toLowerCase();
    if (!search) return boardColumns;
    return boardColumns.map((col) => ({
      ...col,
      children: col.children.filter(
        (item) =>
          item.clientName?.toLowerCase().includes(search) ||
          item.leadCode?.toLowerCase().includes(search) ||
          item.leadType?.toLowerCase().includes(search) ||
          item.contactNumber?.toLowerCase().includes(search),
      ),
    }));
  }, [searchText, boardColumns]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    const base = filteredByStage ?? tableData;
    if (!search) return base;
    return base.filter(
      (item) =>
        item.clientName?.toLowerCase().includes(search) ||
        item.leadCode?.toLowerCase().includes(search) ||
        item.leadType?.toLowerCase().includes(search) ||
        item.contactNumber?.toLowerCase().includes(search),
    );
  }, [searchText, filteredByStage, tableData]);

  // ─── Pipeline helpers ─────────────────────────────────────────────────────

  const buildBoardFromPipeline = useCallback((data, pipelineName = "") => {
    // ✅ Build columns FROM stagesRef (not from lead data keys)
    // This ensures ALL stages show even if they have 0 leads
    const stageNameLookup = {};
    stagesRef.current.forEach((s) => {
      stageNameLookup[s.name?.toLowerCase().trim()] = {
        stageId: s.id,
        stageType: s.type,
        group: s.group,
      };
    });

    const mapLeads = (leads, stageName) =>
      (leads || []).map((lead) => ({
        ...lead,
        id: String(lead.leadId),
        leadId: lead.leadId,
        title: lead.clientName,
        subtitle: lead.leadCode,
        assignedTo: lead.leadAssignName,
        amount: lead.estimateAmount || 0,
        city: lead.city || "-",
        cityName: lead.city || "-",
        pipelineId: lead.pipelineId,
        createdAt: lead.leadCreatedAt || null,
        updatedAt: lead.leadUpdatedAt || null,
        closeDate: lead.leadFollowUpDate || "NA",
        stage: lead.stage || stageName,
        pipelineName: lead.pipelineName || pipelineName || "-",
        leadSource:
          typeof lead.leadSource === "object"
            ? lead.leadSource?.sourceName || "-"
            : lead.leadSource || "-",
        leadSubSource:
          typeof lead.leadSubSource === "object"
            ? lead.leadSubSource?.name || "-"
            : lead.leadSubSource || "-",
      }));

    // ✅ Build a flat lead map from API response: { "hot": [...], "cold": [...] }
    const leadMap = {};
    Object.entries(data?.open_lead || {}).forEach(([stageName, leads]) => {
      leadMap[stageName?.toLowerCase().trim()] = { leads, tag: "open" };
    });
    Object.entries(data?.close_lead || {}).forEach(([stageName, leads]) => {
      leadMap[stageName?.toLowerCase().trim()] = { leads, tag: "close" };
    });

    // ✅ Build columns from stagesRef — ALL stages always present
    const openColumns = stagesRef.current
      .filter((s) => s.group === "open_stage")
      .map((s) => {
        const key = s.name?.toLowerCase().trim();
        const { leads = [], tag = "open" } = leadMap[key] || {};
        return {
          id: `open_${s.name}`,
          name: s.name,
          tag: "open",
          stageId: s.id,
          stageType: s.type,
          children: mapLeads(leads, s.name),
        };
      });

    const closeColumns = stagesRef.current
      .filter((s) => s.group === "close_close")
      .map((s) => {
        const key = s.name?.toLowerCase().trim();
        const { leads = [] } = leadMap[key] || {};
        return {
          id: `close_${s.name}`,
          name: s.name,
          tag: "close",
          stageId: s.id,
          stageType: s.type,
          children: mapLeads(leads, s.name),
        };
      });

    const finalColumns = [...openColumns, ...closeColumns];
    originalBoardColumnsRef.current = finalColumns;
    setBoardColumns(finalColumns);

    // ✅ Flat table data
    const allLeads = finalColumns
      .flatMap((col) => col.children)
      .map((lead, index) => ({
        ...lead,
        sr_no: index + 1,
        leadAssign: lead.leadAssignName || lead.assignedTo || "-",
        productType: lead.planName || "-",
        cityName: lead.city || lead.cityName || "-",
        createdAt: lead.leadCreatedAt?.split("T")[0] || lead.createdAt,
        stage: lead.stage || "-",
        source:
          typeof lead.leadSource === "object"
            ? lead.leadSource?.sourceName || "-"
            : lead.leadSource || "-",
      }));

    setTableData(allLeads);
  }, []);

  // fetchPipelineLeads now accepts stages as a parameter:
  const fetchPipelineLeads = useCallback(
    async (pipelineId, pipelineName = "") => {
      try {
        setIsLoadingLeads(true);

        const adminUserId = localStorage.getItem("userId");
        const mainId = localStorage.getItem("mainId");
        const memberId = mainId && mainId !== adminUserId ? mainId : -1;

        // ✅ Step 1: Fetch stages first — populates stagesRef
        const stagesRes = await Getstagesbypipeline(pipelineId, adminUserId);
        const responseData = stagesRes?.data?.data || {};
        const allStages = [];

        ["open_stage", "close_close"].forEach((groupKey) => {
          (responseData[groupKey] || []).forEach((stage) => {
            allStages.push({
              id: stage.stageId,
              name: stage.stageName,
              type: stage.stageType,
              group: groupKey,
              pipelineId: stage.pipelineId,
            });
          });
        });

        stagesRef.current = allStages; // ✅ populate ref BEFORE building board
        setStages(allStages);

        // ✅ Step 2: Fetch leads
        const res = await GETstagesleaddatabypipeline(
          pipelineId,
          adminUserId,
          memberId,
        );
        const data = res?.data?.data;

        // ✅ Step 3: Build board — columns come from stagesRef, leads fill them in
        buildBoardFromPipeline(data || {}, pipelineName);

        // ✅ Step 4: Stats
        const openLeads = Object.values(data?.open_lead || {}).flat();
        const closeLeads = Object.values(data?.close_lead || {}).flat();
        const allLeads = [...openLeads, ...closeLeads];

        // ✅ Step 4: Stats — use direct API fields
        setStats({
          total_lead_count: Number(data?.total_lead_count) || 0,
          total: Number(data?.total_lead_count) || 0,
          inquiry_lead_count: Number(data?.inquiry_lead_count) || 0,
          hot: Number(data?.hot_lead_count) || 0,
          cold: Number(data?.cold_lead_count) || 0,
          wonCount: Number(data?.confirm_lead_count) || 0,
          lostCount: Number(data?.cancel_lead_count) || 0,
          wonAmount: Number(data?.confirm_lead_amount) || 0,
          lostAmount: Number(data?.cancel_lead_amount) || 0,
          hotAmount: Number(data?.hot_lead_amount) || 0,
          coldAmount: Number(data?.cold_lead_amount) || 0,
          totalAmount: Number(data?.total_amount) || 0,
          openAmount: Number(data?.open_lead_amount) || 0,
          openCount: Number(data?.open_lead_count) || 0,
          closeCount: Number(data?.close_lead_count) || 0,
        });
      } catch (err) {
        console.error("Failed to fetch pipeline leads:", err);
      } finally {
        setIsLoadingLeads(false);
      }
    },
    [buildBoardFromPipeline],
  );
  useEffect(() => {
    localStorage.setItem("superLeadsViewMode", viewMode);
  }, [viewMode]);

  // ✅ Invalidate cache after mutations (move, assign, delete, follow-up)
  const invalidateAndRefetch = useCallback(
    (pipelineId, pipelineName = "") => {
      delete pipelineCache.current[pipelineId];
      fetchPipelineLeads(pipelineId, pipelineName);
    },
    [fetchPipelineLeads],
  );

  // Change fetchStagesForPipeline to RETURN the stages:
  const fetchStagesForPipeline = useCallback(async (pipelineId) => {
    const adminUserId = localStorage.getItem("userId");
    if (!adminUserId) return [];

    try {
      setIsStagesLoading(true);
      setSelectedStageId("");

      const stagesRes = await Getstagesbypipeline(pipelineId, adminUserId);
      const responseData = stagesRes?.data?.data || {};
      const allStages = [];

      ["open_stage", "close_close"].forEach((groupKey) => {
        const groupStages = responseData[groupKey];
        if (Array.isArray(groupStages)) {
          groupStages.forEach((stage) => {
            allStages.push({
              id: stage.stageId,
              name: stage.stageName,
              type: stage.stageType,
              group: groupKey,
              pipelineId: stage.pipelineId,
            });
          });
        }
      });

      stagesRef.current = allStages;
      setStages(allStages); // ✅ populates the Stage filter dropdown
      return allStages;
    } catch (err) {
      console.error("Failed to fetch stages:", err);
      setStages([]);
      stagesRef.current = [];
      return [];
    } finally {
      setIsStagesLoading(false);
    }
  }, []);
  // ─── Initialisation — single useEffect replaces two ──────────────────────

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const [pipelineRes, managerRes] = await Promise.all([
          GETallpipeline(userId),
          Fetchmanager(userId),
        ]);

        if (cancelled) return;

        // Managers
        const managerList = (managerRes?.data?.data?.userDetails || []).map(
          (m) => ({
            value: m.id,
            label: m.firstName || "-",
          }),
        );
        setManagers(managerList);

        // Pipelines
        const list = pipelineRes?.data?.data || [];
        setPipelines(list);

        if (list.length === 0) {
          setNoPipelines(true);
          setIsLoadingLeads(false);
          return;
        }
        setNoPipelines(false);

        const startPipeline = location.state?.pipelineId
          ? list.find((p) => p.id === location.state.pipelineId)
          : list.find((p) => p.id === 1) || list[0];

        if (startPipeline) {
          setActivePipeline({ id: startPipeline.id, name: startPipeline.name });
          setSelectedPipelineId(String(startPipeline.id));
          // ✅ fetchPipelineLeads now handles stages internally
          await fetchPipelineLeads(startPipeline.id, startPipeline.name);
        }
      } catch (err) {
        console.error("Init failed:", err);
        setNoPipelines(true);
        setIsLoadingLeads(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Pipeline change ─────────────────────────────────────────────────────

  const handlePipelineChange = useCallback(
    async (e) => {
      const pipelineId = Number(e.target.value);
      setSelectedPipelineId(String(pipelineId));
      const found = pipelines.find((p) => p.id === pipelineId);
      if (!found) return;
      setActivePipeline({ id: found.id, name: found.name });
      setSelectedStageId("");
      setFilteredByStage(null);
      // ✅ Single call — fetches stages + leads in correct order internally
      await fetchPipelineLeads(found.id, found.name);
    },
    [pipelines, fetchPipelineLeads],
  );

  // ─── Filter helpers ───────────────────────────────────────────────────────
  const handleStageChange = useCallback(
    async (e) => {
      const stageName = e.target.value; // dynamic string e.g. "Negotiation", "Qualified", "hot"
      setSelectedStageId(stageName);
      setSelectedAssignId("");

      // ── Reset ──
      if (!stageName) {
        setFilteredByStage(null);
        const cols = originalBoardColumnsRef.current;
        setBoardColumns(cols);
        setTableData(
          cols
            .flatMap((col) => col.children)
            .map((l, i) => ({
              ...l,
              sr_no: i + 1,
              leadAssign: l.leadAssignName || "-",
              productType: l.planName || "-",
              cityName: l.city || l.cityName || "-",
              stage: l.stage || "-",
            })),
        );
        return;
      }

      try {
        setIsFilterLoading(true);
        const userId = getStoredUserId();
        const adminUserId = localStorage.getItem("userId");
        const mainId = localStorage.getItem("mainId");
        const memberId = mainId && mainId !== adminUserId ? mainId : -1;
        const response = await Getstageleaddatabypipelineidandstage(
          selectedPipelineId,
          stageName,
          userId,
          memberId,
        );

        const data = response?.data?.data;

        const allLeads = [
          ...Object.values(data?.open_lead || {}).flat(),
          ...Object.values(data?.close_lead || {}).flat(),
        ].map((lead, i) => ({
          ...lead,
          id: String(lead.leadId),
          leadId: lead.leadId,
          sr_no: i + 1,
          title: lead.clientName,
          contact: lead.clientContactNo || "-",
          subtitle: lead.leadCode,
          assignedTo: lead.leadAssignName,
          amount: lead.estimateAmount || 0,
          city: lead.city || "-",
          cityName: lead.city || "-",
          stage: lead.stage || "-",
          leadAssign: lead.leadAssignName || "-",
          productType: lead.planName || "-",
          pipelineName: lead.pipelineName || activePipeline?.name || "-",
          closeDate: lead.closeDate || "-",
          description: lead.description || "-",
        }));

        const leadIdSet = new Set(allLeads.map((l) => l.leadId));

        // ── Update board: keep only columns/leads that match API response ──
        const filteredCols = originalBoardColumnsRef.current.map((col) => ({
          ...col,
          children: col.children.filter((l) => leadIdSet.has(l.leadId)),
        }));

        setBoardColumns(filteredCols);
        setFilteredByStage(allLeads);
        setTableData(allLeads);
      } catch (err) {
        console.error("Failed to fetch stage leads:", err);
        Swal.fire("Error", "Failed to load stage leads.", "error");
      } finally {
        setIsFilterLoading(false);
      }
    },
    [selectedPipelineId, activePipeline],
  );

  const handleMemberChange = useCallback((e) => {
    const assignId = e.target.value;
    setSelectedAssignId(assignId);
    setSelectedStageId("");

    const cols = originalBoardColumnsRef.current;

    if (!assignId) {
      setBoardColumns(cols);
      setTableData(
        cols
          .flatMap((c) => c.children)
          .map((l, i) => ({
            ...l,
            sr_no: i + 1,
            leadAssign: l.leadAssignName || "-",
            productType: l.planName || "-",
            cityName: l.city || l.cityName || "-",
            stage: l.stage || "-",
          })),
      );
      setFilteredByStage(null);
      return;
    }

    const filteredColumns = cols.map((col) => ({
      ...col,
      children: col.children.filter(
        (l) => String(l.leadAssignId) === String(assignId),
      ),
    }));
    setBoardColumns(filteredColumns);

    const filteredLeads = cols
      .flatMap((c) => c.children)
      .filter((l) => String(l.leadAssignId) === String(assignId))
      .map((l, i) => ({
        ...l,
        sr_no: i + 1,
        leadAssign: l.leadAssignName || "-",
        productType: l.planName || "-",
        cityName: l.city || l.cityName || "-",
        stage: l.stage || "-",
      }));
    setTableData(filteredLeads);
    setFilteredByStage(null);
  }, []);

  const handleSourceChange = useCallback(
    (e) => {
      const sourceId = e.target.value; // now an ID string
      setSelectedSource(sourceId);
      setSelectedSubsource("");

      const cols = originalBoardColumnsRef.current;
      if (!sourceId) {
        setBoardColumns(cols);
        setFilteredByStage(null);
        return;
      }

      // Find the source name for matching against lead data
      const sourceName = allSources.find(
        (s) => String(s.leadSourceId) === String(sourceId),
      )?.sourceName;

      const filteredCols = cols.map((col) => ({
        ...col,
        children: col.children.filter((l) => {
          const src =
            typeof l.leadSource === "object"
              ? l.leadSource?.sourceName
              : l.leadSource;
          return src?.toLowerCase() === sourceName?.toLowerCase();
        }),
      }));
      setBoardColumns(filteredCols);

      const filteredLeads = cols
        .flatMap((c) => c.children)
        .filter((l) => {
          const src =
            typeof l.leadSource === "object"
              ? l.leadSource?.sourceName
              : l.leadSource;
          return src?.toLowerCase() === sourceName?.toLowerCase();
        })
        .map((l, i) => ({
          ...l,
          sr_no: i + 1,
          leadAssign: l.leadAssignName || "-",
          productType: l.planName || "-",
          cityName: l.city || l.cityName || "-",
          stage: l.stage || "-",
        }));

      setTableData(filteredLeads);
      setFilteredByStage(filteredLeads);
    },
    [allSources],
  );

  const handleSubsourceChange = useCallback(
    (e) => {
      const subVal = e.target.value;
      setSelectedSubsource(subVal);
      const cols = originalBoardColumnsRef.current;
      if (!subVal) {
        // Reset to source filter
        handleSourceChange({ target: { value: selectedSource } });
        return;
      }
      const filteredCols = cols.map((col) => ({
        ...col,
        children: col.children.filter(
          (l) =>
            l.leadSource?.toLowerCase() === selectedSource.toLowerCase() &&
            l.leadSubSource?.toLowerCase() === subVal.toLowerCase(),
        ),
      }));
      setBoardColumns(filteredCols);
    },
    [selectedSource, handleSourceChange],
  );
  const handleClearFilters = useCallback(() => {
    setSelectedStageId("");
    setSelectedAssignId("");
    setFilteredByStage(null);
    setSearchText("");
    setSelectedSource("");
    setSelectedSubsource("");
    setSubsources([]);
    const cols = originalBoardColumnsRef.current;
    if (cols.length > 0) {
      setBoardColumns(cols);
      setTableData(
        cols
          .flatMap((c) => c.children)
          .map((l, i) => ({
            ...l,
            sr_no: i + 1,
            leadAssign: l.leadAssignName || "-",
            productType: l.planName || "-",
            cityName: l.city || l.cityName || "-",
            stage: l.stage || "-",
          })),
      );
    } else if (activePipeline?.id) {
      invalidateAndRefetch(activePipeline.id, activePipeline.name);
    }
  }, [activePipeline, invalidateAndRefetch]);

  // ─── Board drag-scroll ────────────────────────────────────────────────────

  const onPointerDown = (e) => {
    isDragging.current = true;
    if (dndActive) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
    scrollRef.current.classList.add("cursor-grabbing");
  };
  const onPointerMove = (e) => {
    if (!isDragging.current || dndActive) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    scrollRef.current.scrollLeft =
      scrollStart.current - (clientX - startX.current);
  };
  const onPointerUp = () => {
    isDragging.current = false;
    scrollRef.current?.classList.remove("cursor-grabbing");
  };

  // ─── Lead actions ─────────────────────────────────────────────────────────

  const handleOpenDrawer = useCallback(async (lead) => {
    try {
      const response = await GetLeadByID(lead.leadId);
      const fullLeadData = response?.data?.data?.[0] || lead;
      setDrawerLead({
        ...fullLeadData,
        leadId: fullLeadData.id,
        title: fullLeadData.clientName,
        contact: fullLeadData.clientContactNo || "-",
        subtitle: fullLeadData.leadCode,
        assignedTo: fullLeadData.leadAssignName || "-",
        city: fullLeadData.cityName || "-",
        closeDate: fullLeadData.leadFollowUpDate || "NA",
        pipelineName: fullLeadData.pipelineName || "-",
        openStageName: fullLeadData.openStageName || "-",
        createdAt: fullLeadData.createdAt || "N/A",
        updatedAt: fullLeadData.createdAt || "N/A",
        amount: fullLeadData.estimateAmount || 0,
        estimateAmount: fullLeadData.estimateAmount || 0,
      });
      setDrawerFollowUps(
        (fullLeadData.followUpDetails || []).map((fu) => ({
          id: fu.id,
          followUpType: fu.followUpType || "Call",
          followUpStatus: fu.followUpStatus || "Open",
          followUpDate: fu.followUpDate || "",
          clientRemarks: fu.clientRemarks || "",
          employeeRemarks: fu.employeeRemarks || "",
          createdAt: fu.createdAt || "",
          leadId: fu.leadId,
          memberId: fu.memberId,
          memberName: fu.memberName || "",
        })),
      );
      setIsDrawerOpen(true);
    } catch {
      setDrawerLead(lead);
      setDrawerFollowUps([]);
      setIsDrawerOpen(true);
    }
  }, []);

  const handleLeadDropped = useCallback(
    ({ lead, fromColumn, toColumn, pendingColumns }) => {
      // Find the full column with stageId from boardColumns by matching name
      const resolveColumn = (col) =>
        boardColumns.find(
          (c) =>
            c.name?.toLowerCase().trim() === col.name?.toLowerCase().trim(),
        ) || col;

      const resolvedFrom = resolveColumn(fromColumn);
      const resolvedTo = resolveColumn(toColumn);

      setMoveLeadPayload({
        lead,
        fromColumn: resolvedFrom,
        toColumn: resolvedTo, // ← already has stageId here
        pendingColumns,
      });
      setIsMoveModalOpen(true);
    },
    [boardColumns],
  );

  const handleConfirmMove = useCallback(
    async (formPayload) => {
      const lead = moveLeadPayload.lead;
      const toColumn = formPayload.toColumn?.stageId
        ? formPayload.toColumn
        : moveLeadPayload.toColumn;

      if (moveLeadPayload.pendingColumns?.length)
        setBoardColumns(moveLeadPayload.pendingColumns);

      const leadId = Number(lead.leadId);

      // Try stageId from column, fallback to lead's own current stageId
      const stageId = Number(toColumn.stageId) || Number(toColumn.stageId ?? 0);

      if (!stageId) {
        // Last resort: log what we have to debug
        console.error(
          "stageId missing. toColumn:",
          toColumn,
          "moveLeadPayload.toColumn:",
          moveLeadPayload.toColumn,
        );
        Swal.fire(
          "Error",
          "Could not determine destination stage. Please try again.",
          "error",
        );
        setIsMoveModalOpen(false);
        setMoveLeadPayload(null);
        return;
      }

      const stageType =
        toColumn.stageType ||
        (toColumn.tag === "open" ? "open_stage" : "close_stage");
      const assignId = formPayload.assignedTo
        ? Number(formPayload.assignedTo)
        : null;
      const isCloseStage = stageType === "close_stage";

      // ✅ Always pass real leadId and memberId regardless of followUp
      const requestDto = {
        clientRemarks: formPayload.remarks || "",
        employeeRemarks: "",
        followUpDate: formPayload.followUp?.date
          ? formatFollowUpDateForAPI(formPayload.followUp.date)
          : "",
        followUpStatus: formPayload.followUp?.date ? "Open" : "",
        followUpType: formPayload.followUp?.date
          ? formPayload.followUp.type || "Call"
          : "",
        id: 0,
        leadId, // ✅ real leadId always
        memberId: assignId || 0, // ✅ real memberId always
      };

      try {
        await MoveLeadToStage(
          leadId,
          stageId,
          stageType,
          assignId,
          formPayload.remarks || "",
          requestDto,
        );
        if (activePipeline?.id)
          invalidateAndRefetch(activePipeline.id, activePipeline.name);
      } catch (err) {
        console.error("Move lead failed:", err);
        Swal.fire("Error", "Failed to move lead. Please try again.", "error");
      }

      setIsMoveModalOpen(false);
      setMoveLeadPayload(null);
    },
    [moveLeadPayload, activePipeline, invalidateAndRefetch],
  );

  const handleCancelMove = () => {
    setIsMoveModalOpen(false);
    setMoveLeadPayload(null);
  };

  const handleFollowUp = useCallback(async (lead) => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching lead details",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await GetLeadByID(lead.leadId);
      Swal.close();
      const fullLeadData = response?.data?.data?.[0];
      if (!fullLeadData) {
        Swal.fire("Error", "Failed to fetch lead details", "error");
        return;
      }
      setSelectedLeadForFollowUp({
        leadId: fullLeadData.id,
        clientName: fullLeadData.clientName,
        leadCode: fullLeadData.leadCode,
        contactNumber: fullLeadData.contactNumber,
        emailId: fullLeadData.emailId,
        leadAssignId: fullLeadData.leadAssignId,
        followUps: fullLeadData.followUpDetails || [],
      });
      setIsFollowUpOpen(true);
    } catch {
      Swal.close();
      Swal.fire("Error", "Failed to load lead data", "error");
    }
  }, []);

  const refreshFollowUps = useCallback(async () => {
    if (!selectedLeadForFollowUp?.leadId) return;
    try {
      const response = await GetLeadByID(selectedLeadForFollowUp.leadId);
      const fullLeadData = response?.data?.data?.[0];
      if (fullLeadData) {
        setSelectedLeadForFollowUp((prev) => ({
          ...prev,
          followUps: fullLeadData.followUpDetails || [],
        }));
      }
    } catch (error) {
      console.error("Error refreshing follow-ups:", error);
    }
  }, [selectedLeadForFollowUp?.leadId]);

  const handleSaveFollowUp = useCallback(
    async (followUpData) => {
      setIsFollowUpSaving(true);
      try {
        const response = await GetLeadByID(selectedLeadForFollowUp.leadId);
        const fullLeadData = response?.data?.data?.[0];
        if (!fullLeadData) {
          Swal.fire("Error", "Failed to fetch lead details", "error");
          return;
        }

        const newFollowUp = {
          id: 0,
          leadId: selectedLeadForFollowUp.leadId,
          followUpType:
            followUpData.followUpType || followUpData.followType || "Call",
          followUpStatus: followUpData.followUpStatus || "Open",
          followUpDate: formatFollowUpDateForAPI(
            followUpData.followupDate || followUpData.followUpDate,
          ),
          clientRemarks:
            followUpData.clientRemarks || followUpData.description || "",
          employeeRemarks: followUpData.employeeRemarks || "",
          memberId: followUpData.memberId || followUpData.managerId || 0,
        };

        const existingFollowUps = (fullLeadData.followUpDetails || []).map(
          (fu) => ({
            id: fu.id ? Number(fu.id) : 0,
            leadId: selectedLeadForFollowUp.leadId,
            followUpType: fu.followUpType || "",
            followUpStatus: fu.followUpStatus || "Open",
            followUpDate: fu.followUpDate || "",
            clientRemarks: fu.clientRemarks || "",
            employeeRemarks: fu.employeeRemarks || "",
            memberId: fu.memberId || 0,
          }),
        );

        const payload = {
          userId: userId,
          address: fullLeadData.address || "",
          cityId: fullLeadData.cityId ? Number(fullLeadData.cityId) : 0,
          clientName: fullLeadData.clientName || "",
          contactNumber: fullLeadData.contactNumber || "",
          emailId: fullLeadData.emailId || "",
          leadAssignId: fullLeadData.leadAssignId
            ? Number(fullLeadData.leadAssignId)
            : 0,
          leadCode: fullLeadData.leadCode || "",
          leadRemark: fullLeadData.leadRemark || "",
          leadSource: fullLeadData.leadSource || "",
          leadStatus: fullLeadData.leadStatus || "",
          leadType: fullLeadData.leadType || "",
          overallRemark: fullLeadData.overallRemark || "",
          pinCode: fullLeadData.pinCode || "",
          planId: fullLeadData.planId ? Number(fullLeadData.planId) : 0,
          selectPrefix: fullLeadData.selectPrefix || "",
          stateId: fullLeadData.stateId ? Number(fullLeadData.stateId) : 0,
          pipelineId: fullLeadData.pipelineId
            ? Number(fullLeadData.pipelineId)
            : 0,
          openStageId: fullLeadData.openStageId
            ? Number(fullLeadData.openStageId)
            : 0,
          openStageName: fullLeadData.openStageName || "",
          closeStageId: fullLeadData.closeStageId
            ? Number(fullLeadData.closeStageId)
            : 0,
          closeStageName: fullLeadData.closeStageName || "",
          leadTitle: fullLeadData.leadTitle || "",
          leadFollowUpDate: formatFollowUpDateForAPI(
            fullLeadData.leadFollowUpDate || "",
          ).split(" ")[0],
          followUpDetails: [...existingFollowUps, newFollowUp],
        };

        const updateResponse = await UpdateleadbyID(
          selectedLeadForFollowUp.leadId,
          payload,
        );
        const apiData = updateResponse?.data || updateResponse;

        if (apiData?.success === true) {
          Swal.fire("Success", "Follow-up added successfully!", "success");
          await refreshFollowUps();
          if (activePipeline?.id)
            invalidateAndRefetch(activePipeline.id, activePipeline.name);
        } else {
          Swal.fire(
            "Error",
            apiData?.msg || "Failed to add follow-up",
            "error",
          );
        }
      } catch (error) {
        console.error("Error saving follow-up:", error);
        Swal.fire("Error", "Failed to save follow-up", "error");
      } finally {
        setIsFollowUpSaving(false); // ← ADD
      }
    },
    [
      selectedLeadForFollowUp,
      refreshFollowUps,
      activePipeline,
      invalidateAndRefetch,
    ],
  );

  const handleEditLead = useCallback(
    async (lead) => {
      try {
        Swal.fire({
          title: "Loading...",
          text: "Fetching lead details",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });
        const response = await GetLeadByID(lead.leadId);
        Swal.close();
        const fullLeadData = response?.data?.data?.[0];
        if (!fullLeadData) {
          Swal.fire("Error", "Failed to fetch lead details", "error");
          return;
        }

        navigate("/super-leads/addlead", {
          state: {
            leadData: {
              id: fullLeadData.id,
              leadId: fullLeadData.id,
              leadCode: fullLeadData.leadCode,
              leadType: fullLeadData.leadType,
              leadStatus: fullLeadData.leadStatus,
              leadSource: fullLeadData.leadSource,
              leadSubSource: fullLeadData.leadSubSource,
              leadSourceId: fullLeadData.leadSource?.leadSourceId || null,
              leadSubSourceId:
                fullLeadData.leadSubSource?.leadSubSourceId || null,
              leadRemark: fullLeadData.leadRemark,
              leadAssign: fullLeadData.leadAssignId,
              selectPrefix: fullLeadData.selectPrefix,
              clientName: fullLeadData.clientName,
              emailId: fullLeadData.emailId,
              contactNumber: fullLeadData.contactNumber,
              address: fullLeadData.address,
              pinCode: fullLeadData.pinCode,
              city: fullLeadData.cityId,
              state: fullLeadData.stateId,
              overallRemark: fullLeadData.overallRemark,
              productType: fullLeadData.planId,
              pipelineId: fullLeadData.pipelineId,
              pipelineName: fullLeadData.pipelineName,
              openStageId: fullLeadData.openStageId,
              openStageName: fullLeadData.openStageName,
              closeStageId: fullLeadData.closeStageId,
              leadTitle: fullLeadData.leadTitle || "",
              leadFollowUpDate: fullLeadData.leadFollowUpDate || "",
              estimateAmount: String(fullLeadData.estimateAmount ?? ""),
              // ADD these inside the navigate state leadData object:
              eventTypeId: fullLeadData.eventTypeId || 0,
              functionId: fullLeadData.functionId || 0,
              minPax: fullLeadData.minPax || "",
              maxPax: fullLeadData.maxPax || "",
              anyFunctionWithUs: fullLeadData.anyFunctionWithUs || false,
              inquiryDate: fullLeadData.inquiryDate || "",
              tentEventDate: fullLeadData.tentEventDate || [],
              companyName: fullLeadData.companyName || "",
              referralSource: fullLeadData.referralSource || "",
              stateId: fullLeadData.stateId || null, // ← also add these
              cityId: fullLeadData.cityId || null,
              followUpDetails: (fullLeadData.followUpDetails || []).map(
                (fu) => ({
                  id: fu.id,
                  followUpType: fu.followUpType || "",
                  followUpStatus: fu.followUpStatus || "Open",
                  followUpDate: fu.followUpDate || "",
                  clientRemarks: fu.clientRemarks || "",
                  employeeRemarks: fu.employeeRemarks || "",
                  memberId: fu.memberId || 0,
                  createdAt: fu.createdAt || null,
                }),
              ),
            },
          },
        });
      } catch (error) {
        Swal.close();
        Swal.fire("Error", "Failed to load lead data", "error");
      }
    },
    [navigate],
  );

  const handleDeleteLead = useCallback(
    (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          DeleteLeadbyID(id)
            .then(() => {
              Swal.fire("Deleted!", "Lead has been deleted.", "success");
              if (activePipeline?.id)
                invalidateAndRefetch(activePipeline.id, activePipeline.name);
            })
            .catch(() =>
              Swal.fire("Error!", "Failed to delete lead.", "error"),
            );
        }
      });
    },
    [activePipeline, invalidateAndRefetch],
  );

  const handleViewLead = useCallback(async (lead) => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching lead details",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await GetLeadByID(lead.leadId);
      Swal.close();
      setSelectedLead(response?.data?.data?.[0] || {});
      setIsViewModalOpen(true);
    } catch {
      Swal.close();
      setSelectedLead({});
      setIsViewModalOpen(true);
    }
  }, []);

  // ─── Assign ───────────────────────────────────────────────────────────────

  const handleAssignLead = () => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Leads Selected",
        text: "Please select at least one lead to assign.",
      });
      return;
    }
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedManager) {
      Swal.fire({
        icon: "warning",
        title: "No Manager Selected",
        text: "Please select a manager.",
      });
      return;
    }
    if (!assignCloseDate) {
      Swal.fire({
        icon: "warning",
        title: "Close Date Required",
        text: "Please select a close date.",
      });
      return;
    }
    if (!assignDescription) {
      Swal.fire({
        icon: "warning",
        title: "Description Required",
        text: "Please enter a description.",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Assigning...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await assignMultipleLeadToMember(
        selectedRows,
        Number(selectedManager),
        assignCloseDate,
        assignDescription,
      );
      Swal.close();
      const apiData = response?.data || response;

      if (apiData?.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `${selectedRows.length} lead(s) assigned successfully.`,
        });
        setIsAssignModalOpen(false);
        setSelectedManager("");
        setSelectedRows([]);
        setAssignCloseDate("");
        setAssignDescription("");
        if (activePipeline?.id)
          invalidateAndRefetch(activePipeline.id, activePipeline.name);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: apiData?.msg || apiData?.message || "Failed to assign leads",
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to assign leads.",
      });
    }
  };

  // ─── Row selection ────────────────────────────────────────────────────────

  const handleSelectRow = (leadId, isChecked) =>
    setSelectedRows((prev) =>
      isChecked ? [...prev, leadId] : prev.filter((id) => id !== leadId),
    );

  const handleSelectAll = (isChecked) =>
    setSelectedRows(isChecked ? dateFilteredData.map((r) => r.leadId) : []);

  // Option 2 — Fix the condition to only filter when BOTH are set
  const dateFilteredData = useMemo(() => {
    if (!selectedYear || !selectedMonth) return filteredData; // ← use || instead of &&
    return filteredData.filter((lead) => {
      if (!lead.createdAt) return true; // ← don't exclude missing dates
      const d = new Date(lead.createdAt);
      if (isNaN(d.getTime())) return true;
      const yearMatch = !selectedYear || d.getFullYear() === selectedYear;
      const monthMatch = !selectedMonth || d.getMonth() + 1 === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [filteredData, selectedYear, selectedMonth]);
  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Fragment>
      <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.CONTACT_TYPE_MASTER"
                    defaultMessage="Leads"
                  />
                ),
              },
            ]}
          />
        </div>
        {/* ── Year / Month Selector ── */}
        {/* <div className="bg-white rounded-xl border shadow-sm px-4 py-3 mb-5 flex items-center gap-2 flex-wrap">
          {/* Year pill with dropdown */}
        {/* <div className="relative" ref={yearPickerRef}>
            <button
              onClick={() => setShowYearPicker((v) => !v)}
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition min-w-[64px] text-center select-none"
            >
              {selectedYear}
            </button>

            {showYearPicker && (
              <div className="absolute top-11 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-56 p-3">
                {/* Range navigation — moves the VIEW window, not the selected year */}
        {/* <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setYearRangeStart((s) => s - 12)}
                    className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {yearRangeStart} – {yearRangeStart + 11}
                  </span>
                  <button
                    onClick={() => setYearRangeStart((s) => s + 12)}
                    className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
                  >
                    ›
                  </button>
                </div> */}

        {/* Year grid — 12 years starting from yearRangeStart */}
        {/* <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(
                    (yr) => (
                      <button
                        key={yr}
                        onClick={() => {
                          setSelectedYear(yr);
                          setShowYearPicker(false);
                        }}
                        className={`text-sm py-2 rounded-lg font-medium transition ${
                          yr === selectedYear
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {yr}
                      </button>
                    ),
                  )}
                </div> */}
        {/* </div> */}
        {/* )}
          </div> */}

        {/* Month pills */}
        {/* {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month, idx) => {
            const monthNum = idx + 1;
            const isActive = selectedMonth === monthNum;
            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(isActive ? null : monthNum)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {month}
              </button>
            );
          })}
        </div> */}
        {/* TOPCARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Leads",
              value: stats.total_lead_count || 0,
              bg: "bg-blue-100",
              iconBg: "text-blue-600",
              Icon: ClipboardList,
            },
            {
              label: "New Inquiry Leads",
              value: stats.inquiry_lead_count || 0, // ✅ was stats.total
              bg: "bg-blue-100",
              iconBg: "text-blue-600",
              Icon: ClipboardList,
            },
            {
              label: "Hot Leads",
              value: stats.hot || 0,
              bg: "bg-[#FEE2E2]",
              iconBg: "text-red-500",
              Icon: Flame,
            },
            {
              label: "Cold Leads",
              value: stats.cold || 0,
              bg: "bg-[#E0F2FE]",
              iconBg: "text-sky-500",
              Icon: Snowflake,
            },
            {
              label: "Confirmed Leads",
              value: stats.wonCount || 0,
              bg: "bg-[#DCFCE7]",
              iconBg: "text-emerald-600",
              Icon: Trophy,
            },
            {
              label: "Cancel Leads",
              value: stats.lostCount || 0,
              bg: "bg-[#F3E8FF]",
              iconBg: "text-purple-500",
              Icon: XCircle,
            },
          ].map(({ label, value, bg, iconBg, Icon }) => (
            <div
              key={label}
              className="bg-white p-5 rounded-lg shadow-sm border flex items-start justify-between"
            >
              <div>
                <p className="text-gray-600 text-sm font-medium">{label}</p>
                <p className="text-3xl font-semibold mt-1">{value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${iconBg}`} />
              </div>
            </div>
          ))}
        </div>

        {/* FILTER ROW */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-0.5 w-[100px]">
                <label className="text-xs text-gray-400 font-medium leading-none"></label>

                <div className="relative mt-2">
                  <i className="ki-filled ki-magnifier leading-none text-md text-gray-400 absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>

                  <input
                    className="w-full pl-2  py-2 border border-indigo-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-xs  font-medium leading-none">
                  Pipeline
                </label>
                <select
                  value={selectedPipelineId}
                  onChange={handlePipelineChange}
                  className="px-2 py-2 border border-indigo-200 rounded-md text-sm"
                >
                  {pipelines.length === 0 ? (
                    <option value="">Loading pipelines...</option>
                  ) : (
                    pipelines.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name || p.pipelineName || "Unnamed Pipeline"}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* In JSX — change value from s.id to s.name */}
              <div className="flex flex-col gap-0.5">
                <label className="text-xs  font-medium leading-none">
                  Stage
                </label>
                <select
                  value={selectedStageId}
                  onChange={handleStageChange}
                  className="px-2 py-2 border border-indigo-200 rounded-md text-sm"
                  disabled={isStagesLoading || isFilterLoading}
                >
                  <option value="">
                    {isStagesLoading ? "Loading stages..." : "All Stages"}
                  </option>
                  {stages.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-xs  font-medium leading-none">
                  Assigned To
                </label>
                <select
                  value={selectedAssignId}
                  onChange={handleMemberChange}
                  className="px-2 py-2 border border-indigo-200 rounded-md text-sm"
                  disabled={isFilterLoading}
                >
                  <option value="">All Members</option>
                  {managers.map((m) => (
                    <option key={m.value} value={String(m.value)}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source with Online/Offline tabs */}
              {/* <div className="flex flex-col gap-0.5">
                <label className="text-xs  font-medium leading-none">
                  Source
                </label>
                {/* Tab switcher */}

              {/* <select
                  value={selectedSource}
                  onChange={handleSourceChange}
                  className="px-2 py-2 border border-indigo-200 rounded-md text-sm"
                  disabled={isFilterLoading}
                >
                  <option value="">All Sources</option>
                  {allSources.map((s) => (
                    <option key={s.leadSourceId} value={s.leadSourceId}>
                      {s.sourceName}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Subsource — only show when a source is selected */}
              {/* Subsource — show as tabs when source is selected */}

              {(selectedStageId ||
                selectedAssignId ||
                searchText ||
                selectedSource ||
                selectedSubsource) && (
                <button
                  onClick={handleClearFilters}
                  className=" text-gray-600 hover:text-gray-800 flex items-center gap-2"
                  title="Clear all filters"
                >
                  <i className="ki-filled ki-cross-circle text-lg"></i>
                  <span className="text-sm">Clear</span>
                </button>
              )}

              {isFilterLoading && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 items-center">
              <div className="btn-tabs flex gap-1 bg-gray-100 rounded-md p-1">
                <button
                  className={`btn btn-icon ${viewMode === 0 ? "active bg-white shadow-sm" : ""}`}
                  onClick={() => setViewMode(0)}
                  title="Board View"
                >
                  <i className="ki-outline ki-element-11"></i>
                </button>
                <button
                  className={`btn btn-icon ${viewMode === 1 ? "active bg-white shadow-sm" : ""}`}
                  onClick={() => setViewMode(1)}
                  title="List View"
                >
                  <i className="ki-outline ki-row-horizontal"></i>
                </button>
              </div>

              {selectedRows.length > 0 && viewMode === 1 && (
                <button
                  onClick={handleAssignLead}
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 hover:bg-green-700 transition"
                >
                  <i className="ki-filled ki-user-tick"></i> Assign Lead (
                  {selectedRows.length})
                </button>
              )}

              {permissions.add && (
                <button
                  onClick={() => navigate("/super-leads/addlead")}
                  className="bg-primary text-white px-4 py-2 rounded-md shadow flex items-center gap-2 hover:bg-primary-dark transition"
                >
                  <i className="ki-filled ki-plus"></i> Create Lead
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Badges */}
        {viewMode === 0 && (
          <div className="flex flex-wrap justify-center items-end gap-2 mb-3">
            <div className="flex flex-wrap gap-2">
              {[
                {
                  cls: "badge-info",
                  icon: "ki-chart-line-up",
                  label: "Cold",
                  amount: stats.coldAmount,
                },
                {
                  cls: "bg-yellow-100 text-black",
                  icon: "ki-chart-line-up",
                  label: "Hot",
                  amount: stats.hotAmount,
                },
                {
                  cls: "badge-success",
                  icon: "ki-chart-line-up",
                  label: "Confirmed",
                  amount: stats.wonAmount,
                },
                {
                  cls: "badge-danger",
                  icon: "ki-chart-line-up",
                  label: "Cancel",
                  amount: stats.lostAmount,
                },
              ].map(({ cls, icon, label, count, amount }) => (
                <Badge
                  key={label}
                  className={`badge badge-outline ${cls} text-xs`}
                >
                  <span className="flex items-center">
                    <i className={`ki-filled ki-${icon} text-sm me-2`}></i>
                    <span className="flex flex-col">
                      <span>
                        {label} Amount
                        <strong>{count}</strong>
                      </span>
                      <span>
                        <strong>
                          ₹{Number(amount).toLocaleString("en-IN")}/-
                        </strong>
                      </span>
                    </span>
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full">
          {selectedSource &&
            allSubsources.filter(
              (s) =>
                String(s.leadSource?.leadSourceId) === String(selectedSource),
            ).length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs  font-medium leading-none">
                  Sub-Source
                </label>
                <div className="flex flex-wrap gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 mb-3">
                  {/* All tab */}
                  <button
                    onClick={() => {
                      setSelectedSubsource("");
                      handleSourceChange({ target: { value: selectedSource } });
                    }}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                      !selectedSubsource
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white"
                    }`}
                  >
                    All
                  </button>

                  {/* Divider */}
                  <div className="w-px bg-gray-200 my-0.5 mb-3" />

                  {/* Subsource tabs */}
                  {allSubsources
                    .filter(
                      (s) =>
                        String(s.leadSource?.leadSourceId) ===
                        String(selectedSource),
                    )
                    .map((s) => (
                      <button
                        key={s.leadSubSourceId}
                        onClick={() => {
                          setSelectedSubsource(String(s.leadSubSourceId));

                          const cols = originalBoardColumnsRef.current;
                          const sourceName = allSources.find(
                            (src) =>
                              String(src.leadSourceId) ===
                              String(selectedSource),
                          )?.sourceName;

                          const match = (l) => {
                            const src =
                              typeof l.leadSource === "object"
                                ? l.leadSource?.sourceName
                                : l.leadSource;
                            const sub =
                              typeof l.leadSubSource === "object"
                                ? l.leadSubSource?.name
                                : l.leadSubSource;
                            return (
                              src?.toLowerCase() ===
                                sourceName?.toLowerCase() &&
                              sub?.toLowerCase() === s.name?.toLowerCase()
                            );
                          };

                          const filteredCols = cols.map((col) => ({
                            ...col,
                            children: col.children.filter(match),
                          }));

                          const filteredLeads = cols
                            .flatMap((c) => c.children)
                            .filter(match)
                            .map((l, i) => ({
                              ...l,
                              sr_no: i + 1,
                              leadAssign: l.leadAssignName || "-",
                              productType: l.planName || "-",
                              cityName: l.city || l.cityName || "-",
                              stage: l.stage || "-",
                            }));

                          setBoardColumns(filteredCols);
                          setTableData(filteredLeads);
                          setFilteredByStage(filteredLeads);
                        }}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                          selectedSubsource === String(s.leadSubSourceId)
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 hover:bg-white"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          {noPipelines ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M17.5 14v6M14.5 17h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Pipelines Found
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                You don't have any pipelines set up yet. Create a pipeline to
                start organizing and tracking your leads efficiently.
              </p>
              <button
                onClick={() => navigate("/pipeline")}
                className="bg-primary text-white px-6 py-2.5 rounded-lg shadow flex items-center gap-2 hover:bg-primary-dark transition font-medium"
              >
                <i className="ki-filled ki-plus text-base"></i> Add Pipeline
              </button>
            </div>
          ) : viewMode === 0 ? (
            <div
              className="flex-1 flex flex-nowrap space-x-4 cursor-grab overflow-x-auto flex-shrink-0"
              ref={scrollRef}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            >
              {isLoadingLeads ? (
                <div className="w-full flex justify-center items-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading leads...</p>
                  </div>
                </div>
              ) : (
                <DragAndDrop
                  columns={filteredBoardColumns}
                  setColumns={setBoardColumns}
                  setDndActive={setDndActive}
                  onLeadDropped={handleLeadDropped}
                  onEditLead={handleEditLead}
                  onDeleteLead={handleDeleteLead}
                  onFollowUp={handleFollowUp}
                  onViewLead={handleOpenDrawer}
                />
              )}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <TableComponent
                columns={columns(
                  handleEditLead,
                  handleDeleteLead,
                  null,
                  handleViewLead,
                  handleFollowUp,
                  selectedRows,
                  handleSelectRow,
                  handleSelectAll,
                  filteredData.length,
                  navigate,
                  permissions,
                )}
                data={dateFilteredData}
                paginationSize={10}
              />
            </div>
          )}
        </div>

        {/* Modals */}
        {isDrawerOpen && drawerLead && (
          <Leaddetailview
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setDrawerLead(null);
            }}
            lead={drawerLead}
            followUps={drawerFollowUps}
            onNewFollowUp={() => {
              setIsDrawerOpen(false);
              handleFollowUp(drawerLead);
            }}
            onEdit={() => {
              setIsDrawerOpen(false);
              handleEditLead(drawerLead);
            }}
            onDelete={() => {
              setIsDrawerOpen(false);
              handleDeleteLead(drawerLead.id || drawerLead.leadId);
            }}
            permissions={permissions}
          />
        )}

        {isMoveModalOpen && moveLeadPayload && (
          <Moveleadmodal
            isOpen={isMoveModalOpen}
            onClose={handleCancelMove}
            onConfirm={handleConfirmMove}
            lead={moveLeadPayload.lead}
            fromColumn={moveLeadPayload.fromColumn}
            toColumn={moveLeadPayload.toColumn}
            managers={managers}
            boardColumns={boardColumns}
          />
        )}

        {isFollowUpOpen && selectedLeadForFollowUp && (
          <FollowUp
            isOpen={isFollowUpOpen}
            onClose={() => {
              setIsFollowUpOpen(false);
              setSelectedLeadForFollowUp(null);
            }}
            onSave={handleSaveFollowUp}
            clientName={selectedLeadForFollowUp.clientName}
            leadData={selectedLeadForFollowUp}
            existingFollowUps={selectedLeadForFollowUp.followUps}
            onRefresh={refreshFollowUps}
            isSaving={isFollowUpSaving}
            leadId={selectedLeadForFollowUp.leadId}
          />
        )}

        {isAssignModalOpen && (
          <AssignLeadModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedManager("");
              setAssignCloseDate("");
              setAssignDescription("");
            }}
            managers={managers}
            selectedManager={selectedManager}
            setSelectedManager={setSelectedManager}
            closeDate={assignCloseDate}
            setCloseDate={setAssignCloseDate}
            description={assignDescription}
            setDescription={setAssignDescription}
            onSave={handleSaveAssignment}
            selectedCount={selectedRows.length}
          />
        )}
      </div>
    </Fragment>
  );
};

export default SuperLeads;
