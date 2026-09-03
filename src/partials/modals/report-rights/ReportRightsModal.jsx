import { ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { GetAllCustomThemeByUserIdAndModuleId, AddReportRights, GetReportRights  } from "@/services/apiServices";
import Swal from "sweetalert2";

const COMMON_STYLE = {
  color: "text-blue-800",
  bg: "bg-blue-50",
  border: "border-blue-300",

  dot: "bg-blue-600",
  checkBg: "bg-blue-600",
  checkBorder: "border-blue-600",

  badgeBg: "bg-blue-50",
  badgeText: "text-blue-800",
  badgeBorder: "border-blue-300",

  pillBg: "bg-blue-50",
  pillBorder: "border-blue-300",
  labelColor: "text-blue-800",
};

const getStyle = () => COMMON_STYLE;


const MODULE_TO_SECTION = {
  "Exclusive Theme":        { id: "menu-planning",          name: "Menu Planning" },
  "Back Office Theme":      { id: "menu-planning",          name: "Menu Planning" },
  "Menu Allocation Theme":  { id: "menu-allocation",        name: "Menu Allocation Reports" },
  "Chef Agency Theme":      { id: "menu-allocation",        name: "Menu Allocation Reports" },
  "Outside Agency Theme":   { id: "menu-allocation",        name: "Menu Allocation Reports" },
  "Name Plate Theme":       { id: "menu-allocation",        name: "Menu Allocation Reports" },
  "Decoration Theme":       { id: "decor",                  name: "Decoration Planning" },
  "Raw Material Theme":     { id: "raw-material",           name: "Raw Material Reports" },
  "Labour Agency Theme":    { id: "labour-agency",          name: "Labour Agency Reports" },
  "Costing Report Theme":   { id: "costing",                name: "Costing Reports" },
  "Profit And Loss":        { id: "profitloss",             name: "Profit & Loss Reports" },
  "General Fix Theme":      { id: "generalFixTheme",        name: "General Fix Theme" },
  "Crockert Cutlery Theme": { id: "crockertCutleryTheme",   name: "Crockery Cutlery Theme" },
  "QUOTATION REPORTS":      { id: "quotation",              name: "Quotation Reports" },
  "INVOICE REPORTS":        { id: "invoice",                name: "Invoice Reports" },
  "Order Summary Theme":    { id: "order-summary",          name: "Order Summary Reports" },
  "Lead Module":            { id: "lead-module",            name: "Lead Module Reports" },
};

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${
        on ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-5" : "left-0.5"}`} />
    </div>
  );
}

export default function ReportRightsModal({ isOpen, onClose, role, onSave }) {
  const userId = localStorage.getItem("userId");
  const [modulesData, setModulesData]     = useState([]);
  const [loading, setLoading]             = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedReports, setSelectedReports] = useState({});
  const [expanded, setExpanded]           = useState({});
  const [saving, setSaving] = useState(false);

  // ── Fetch + build same structure as AllReports ──────────────
 useEffect(() => {
  if (!isOpen || !userId) return;

  const fetchTemplates = async () => {
    try {
      setLoading(true);

      // Fetch both APIs in parallel
      const [templateRes, rightsRes] = await Promise.all([
        GetAllCustomThemeByUserIdAndModuleId(userId, ""),
        GetReportRights(role?.roleId, userId),
      ]);

      if (!templateRes?.data?.success || !Array.isArray(templateRes.data.data)) return;

      // Build existing rights lookup: adminTemplateModuleId → isAllowed
      const rightsLookup = {};
      if (rightsRes?.data?.success) {
        rightsRes.data.data.modules?.forEach((mod) => {
          mod.reports?.forEach((report) => {
            rightsLookup[report.adminTemplateModuleId] = report.isAllowed;
          });
        });
      }

      // Build sectionMap same as before
      const sectionMap = {};
     templateRes.data.data.forEach((item) => {
  const moduleName = item.templateModuleMaster?.nameEnglish;
  if (!moduleName) return;
  const sectionMeta = MODULE_TO_SECTION[moduleName] || {
    id: `auto-${item.templateModuleMaster.id}`,
    name: moduleName,
  };
        if (!sectionMeta) return;

        if (!sectionMap[sectionMeta.id]) {
          sectionMap[sectionMeta.id] = {
            id: sectionMeta.id,
            name: sectionMeta.name,
            groupMap: {},
          };
        }

        const section = sectionMap[sectionMeta.id];
        if (!section.groupMap[moduleName]) {
          section.groupMap[moduleName] = {
            id: item.templateModuleMaster.id,
            name: moduleName,
            nameEnglish: moduleName,
            templates: [],
          };
        }

        section.groupMap[moduleName].templates.push({
          id: item.id,
          name: item.templateMaster.name,
          mappingId: item.templateMappingResponseDto?.id || item.id,
          moduleId: item.templateModuleMaster.id,
        });
      });

      const built = Object.values(sectionMap).map((sec) => ({
        id: sec.id,
        name: sec.name,
        groups: Object.values(sec.groupMap),
      }));

      setModulesData(built);
      setSelectedModule(built[0]?.id || null);
      const closedMap = {};
built.forEach((sec) => {
  sec.groups.forEach((grp) => {
    closedMap[`${sec.id}::${grp.name}`] = false;
  });
});
      setExpanded(closedMap);

      // ✅ Pre-populate selectedReports from existing rights
      const preSelected = {};
      built.forEach((section) => {
        section.groups.forEach((group) => {
          group.templates.forEach((template) => {
            const isAllowed = rightsLookup[template.id]; // template.id = adminTemplateModuleId
            if (isAllowed) {
              if (!preSelected[section.id]) preSelected[section.id] = {};
              if (!preSelected[section.id][group.name]) preSelected[section.id][group.name] = {};
              preSelected[section.id][group.name][template.id] = true;
            }
          });
        });
      });

      setSelectedReports(preSelected);

    } catch (e) {
      console.error("ReportRightsModal fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  fetchTemplates();
}, [isOpen, userId, role?.roleId]);

  if (!isOpen) return null;

  const activeModule = modulesData.find((m) => m.id === selectedModule);

  // ── helpers ──────────────────────────────────────────────────
  const isSelected = (modId, grp, templateId) =>
    !!selectedReports[modId]?.[grp]?.[templateId];

  const groupAllSelected = (modId, grpName) => {
    const templates =
      modulesData.find((m) => m.id === modId)
        ?.groups.find((g) => g.name === grpName)?.templates || [];
    return templates.length > 0 && templates.every((t) => isSelected(modId, grpName, t.id));
  };

  const groupAnySelected = (modId, grpName) => {
    const templates =
      modulesData.find((m) => m.id === modId)
        ?.groups.find((g) => g.name === grpName)?.templates || [];
    return templates.some((t) => isSelected(modId, grpName, t.id));
  };

  const totalSelected = () =>
    Object.values(selectedReports)
      .flatMap((mod) => Object.values(mod).flatMap((grp) => Object.values(grp)))
      .filter(Boolean).length;

  const modSelectedCount = (modId) =>
    Object.values(selectedReports[modId] || {})
      .flatMap((grp) => Object.values(grp))
      .filter(Boolean).length;

  // ── actions ──────────────────────────────────────────────────
  const toggleGroup = (modId, grpName) => {
    const templates =
      modulesData.find((m) => m.id === modId)
        ?.groups.find((g) => g.name === grpName)?.templates || [];
    const allOn = groupAllSelected(modId, grpName);
    setSelectedReports((prev) => ({
      ...prev,
      [modId]: {
        ...prev[modId],
        [grpName]: Object.fromEntries(templates.map((t) => [t.id, !allOn])),
      },
    }));
  };

  const toggleReport = (modId, grpName, templateId) => {
    setSelectedReports((prev) => ({
      ...prev,
      [modId]: {
        ...prev[modId],
        [grpName]: {
          ...prev[modId]?.[grpName],
          [templateId]: !prev[modId]?.[grpName]?.[templateId],
        },
      },
    }));
  };

 const toggleExpand = (modId, grp) => {
  const newExpanded = {};
  const key = `${modId}::${grp}`;

  // close all first
  Object.keys(expanded).forEach((k) => {
    newExpanded[k] = false;
  });

  // open only clicked one
  newExpanded[key] = !expanded[key];

  setExpanded(newExpanded);
};

  const handleSave = async () => {
  const userId = localStorage.getItem("userId");
  
const roleId = role?.roleId;

  
 const templateToModuleId = {};
modulesData.forEach((section) => {
  section.groups.forEach((group) => {
    group.templates.forEach((template) => {
      templateToModuleId[template.id] = template.mappingId; 
    });
  });
});

  const reports = [];
  Object.values(selectedReports).forEach((sectionObj) => {
    Object.values(sectionObj).forEach((groupObj) => {
      Object.entries(groupObj).forEach(([templateId, isAllowed]) => {
        reports.push({
          adminTemplateModuleId: Number(templateId),
          isAllowed,
        });
      });
    });
  });

  const payload = {
    reports,
    roleId,
    userId: Number(userId),
  };

try {
  setSaving(true);
  const response = await AddReportRights(payload);

  if (response?.data?.success) {
    onSave?.(selectedReports);
    onClose();

    Swal.fire({
      icon: "success",
      title: "Rights Saved!",
      text: "Report permissions have been updated successfully.",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

  } else {
    Swal.fire({
      icon: "error",
      title: "Failed!",
      text: response?.data?.msg || "Something went wrong while saving permissions.",
      confirmButtonColor: "#ef4444",
    });
  }

} catch (e) {
  console.error("Failed to save report rights:", e);

  Swal.fire({
    icon: "error",
    title: "Error!",
    text: "Something went wrong while saving permissions. Please try again.",
    confirmButtonColor: "#ef4444",
  });

} finally {
  setSaving(false);
}
};

  // ── render ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div
  className="bg-white rounded-2xl w-[950px] h-[92vh] flex flex-col border border-slate-200"
  onClick={(e) => e.stopPropagation()}
>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-200">
          <div>
            <p className="text-[15px] font-medium text-slate-900">
              Report permissions — {role?.role}
            </p>
           
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-md bg-transparent flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
          </div>
        ) : modulesData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            No templates available
          </div>
        ) : (
         <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Sidebar */}
              <div className="w-[300px] border-r border-slate-200 overflow-y-auto flex-shrink-0 py-2 h-full">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest px-3 pb-1.5">
                Sections
              </p>
              {modulesData.map((mod) => {
                const active = mod.id === selectedModule;
                const cnt = modSelectedCount(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedModule(mod.id)}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between text-sm transition-all border-l-2 ${
                      active
                        ? "bg-blue-50 border-blue-500 font-medium text-blue-700"
                        : "border-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{mod.name}</span>
                    {cnt > 0 && (
                      <span className="bg-blue-600 text-white rounded-full text-xs font-bold px-2.5 py-1.5">
                        {cnt}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Groups panel */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0 pb-20">
              {activeModule?.groups.map((group) => {
                const s = getStyle(group.name);
                const allOn = groupAllSelected(activeModule.id, group.name);
                const anyOn = groupAnySelected(activeModule.id, group.name);
                const open = !!expanded[`${activeModule.id}::${group.name}`];
                const selCount = group.templates.filter((t) =>
                  isSelected(activeModule.id, group.name, t.id)
                ).length;

                return (
                  <div
                    key={group.name}
                    className={`rounded-xl border overflow-hidden transition-colors ${
                      anyOn ? `${s.border} border-[1.5px]` : "border-slate-200"
                    }`}
                  >
                    {/* Group header */}
                    <div className={`flex items-center justify-between px-4 py-3 transition-colors ${allOn ? s.bg : "bg-white"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${anyOn ? s.dot : "bg-slate-300"}`} />
                        <div>
                          <p className={`text-[13px] font-medium ${allOn ? s.color : "text-slate-700"}`}>
                            {group.name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-px">
                            {selCount} / {group.templates.length} selected
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {allOn ? (
                          <span className={`text-[10px] font-bold px-2 py-px rounded border ${s.badgeBg} ${s.badgeText} ${s.badgeBorder}`}>
                            All selected
                          </span>
                        ) : anyOn ? (
                          <span className="text-[10px] font-bold px-2 py-px rounded border border-slate-200 bg-slate-50 text-slate-500">
                            Partial
                          </span>
                        ) : null}

                        <span className={`text-[11px] font-medium w-5 ${anyOn ? s.labelColor : "text-slate-400"}`}>
                          {allOn ? "On" : "Off"}
                        </span>

                        <Toggle on={allOn} onToggle={() => toggleGroup(activeModule.id, group.name)} />

                        
<button
  onClick={(e) => {
    e.stopPropagation();
    toggleExpand(activeModule.id, group.name);
  }}
  className={`w-6 h-6 rounded border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
>
  <ChevronDown size={14} />
</button>
                      </div>
                    </div>

                   {/* Expanded template pills */}
{open && (
  <div className={`border-t px-4 pt-2.5 pb-3.5 bg-slate-50 ${anyOn ? s.border : "border-slate-100"}`}>
    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-2">
      Click templates to select / deselect
    </p>
    <div className="flex flex-wrap gap-1.5">  {/* ← changed from grid to flex flex-wrap */}
      {group.templates.map((template) => {
        const sel = isSelected(activeModule.id, group.name, template.id);
        return (
          <div
            key={template.id}
            onClick={() => toggleReport(activeModule.id, group.name, template.id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer select-none border transition-all flex-shrink-0 ${
              sel
                ? `${s.pillBg} ${s.pillBorder} border-[1.5px]`
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-all ${sel ? `${s.checkBg} ${s.checkBorder}` : "bg-transparent border-slate-300"}`}>
              {sel && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <polyline points="1.5,4.5 3.5,6.5 7.5,2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-xs transition-colors whitespace-nowrap ${sel ? `${s.labelColor} font-medium` : "text-slate-500 font-normal"}`}>
              {template.name}
            </span>
          </div>
        );
      })}
    </div>
  </div>
)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-2.5 border-t border-slate-200">
          
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-light">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
  {saving ? "Saving..." : "Save permissions"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}