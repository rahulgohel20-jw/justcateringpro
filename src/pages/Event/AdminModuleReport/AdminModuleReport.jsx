import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetEventMasterById,
  GettemplatebyuserId,
  GetAllCustomThemeByUserIdAndModuleId,
  Ftechpartydata,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { Container } from "@/components/container";
import MenuReport from "../../../partials/modals/menu-report/MenuReport";
import { useReportPermission } from "@/hooks/useReportPermission";
import Swal from "sweetalert2";

const AGENCY_MODULES = [
  "Chef Agency Theme",
  "Labour Agency Theme",
  "Outside Agency Theme",
];
const ORDER_MODULES = ["Order Summary Theme"];
const RAW_MATERIAL_MODULES = ["Raw Material Theme"];

export default function AdminModuleReport() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const activeLang = localStorage.getItem("lang") || "en";
  const userId = localStorage.getItem("userId");
  const { allowedTemplateIds } = useReportPermission();

  const [activeTab, setActiveTab] = useState("agency"); // "agency" | "order"
  const [isManager, setIsManager] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [modules, setModules] = useState([]);
  const [moduleTemplates, setModuleTemplates] = useState({});
  const [templatesLoading, setTemplatesLoading] = useState({});

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agencyType, setAgencyType] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [parties, setParties] = useState([]);

  const [isMenuReportOpen, setIsMenuReportOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedMappingId, setSelectedMappingId] = useState(null);
  const [selectedTemplateIdForReport, setSelectedTemplateIdForReport] =
    useState(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [eventName, setEventName] = useState("");
  const [partyNumber, setPartyNumber] = useState("");
  const [selectedTemplateIsDate, setSelectedTemplateIsDate] = useState(0);

  const getLangValue = (obj, baseKey) => {
    if (!obj) return "";
    if (activeLang === "hi")
      return obj[`${baseKey}Hindi`] || obj[`${baseKey}English`];
    if (activeLang === "gu")
      return obj[`${baseKey}Gujarati`] || obj[`${baseKey}English`];
    return obj[`${baseKey}English`];
  };

  useEffect(() => {
    const fetchParty = async () => {
      try {
        let isallstatus = true;
        let isbooking = activeTab === "order" ? true : false;
        const response = await Ftechpartydata(
          isallstatus,
          isbooking,
          localStorage.getItem("userId"),
        );

        const events = response.data.data;
        const formattedParties = events.map((event) => ({
          id: event.partyId,
          name:
            getLangValue(event, "partyName") ||
            event.partyName.toUpperCase() +
              " " +
              "(" +
              event.eventStartDate +
              ")" +
              " " +
              "(" +
              event.eventName +
              ")" ||
            "-",
        }));
        const unique = Array.from(
          new Map(formattedParties.map((p) => [p.id, p])).values(),
        );
        setParties(unique);
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };
    fetchParty();
  }, [activeTab]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await GetEventMasterById(eventId);
        const event = res?.data?.data?.["Event Details"]?.[0] || null;
        setEventData(event);

        if (event) {
          setEventName(event?.party?.nameEnglish || "");
          setPartyNumber(event?.party?.mobileno || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await GettemplatebyuserId();

        if (res?.data?.success && res?.data?.data) {
          const filteredModules = res.data.data.filter(
            (module) =>
              module.isActive &&
              !module.isDelete &&
              [
                "Chef Agency Theme",
                "Labour Agency Theme",
                "Outside Agency Theme",
                "Order Summary Theme",
                "Raw Material Theme",
              ].includes(module.nameEnglish),
          );

          const formattedModules = filteredModules.map((module) => ({
            id: module.id,
            name: getLangValue(module, "name"),
            nameEnglish: module.nameEnglish,
            icon: getModuleIcon(module.nameEnglish),
          }));

          setModules(formattedModules);

          formattedModules.forEach((module) => {
            fetchTemplatesForModule(module.id);
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [activeLang]);

  const getModuleIcon = (moduleName) => {
    switch (moduleName) {
      case "Order Summary Theme":
        return "ki-notepad-edit";
      default:
        return "ki-document";
    }
  };

  const fetchTemplatesForModule = async (moduleId) => {
    if (moduleTemplates[moduleId]) return;

    try {
      setTemplatesLoading((prev) => ({ ...prev, [moduleId]: true }));

      const res = await GetAllCustomThemeByUserIdAndModuleId(userId, moduleId);

      let templates = [];

      if (
        res?.data?.success &&
        res?.data?.data &&
        Array.isArray(res.data.data)
      ) {
       templates = res.data.data.map((item) => ({
  id: item.id,
  templateMasterId: item.templateMaster.id, // ← ADD THIS
  name: item.templateMaster.name,
  description: item.templateMaster.description,
  mappingId: item.templateMappingResponseDto?.id || item.id,
  isDate: item.templateMappingResponseDto?.isDate || 0,
  nameEnglish: item.templateModuleMaster?.nameEnglish || "",
}));
      }

      setModuleTemplates((prev) => ({
        ...prev,
        [moduleId]: templates,
      }));
    } catch (error) {
      console.error("Error fetching templates:", error);
      setModuleTemplates((prev) => ({
        ...prev,
        [moduleId]: [],
      }));
    } finally {
      setTemplatesLoading((prev) => ({ ...prev, [moduleId]: false }));
    }
  };

  // Now generates a report for one specific template directly (no toggle set involved)
  const handleGenerateReport = (module, template) => {
  if (!module || !template) return;

  // Validate date range before opening the report modal
  if (!startDate || !endDate) {
    Swal.fire({
      icon: "warning",
      title: intl.formatMessage({
        id: "COMMON.SELECT_DATE_RANGE",
        defaultMessage: "Please select both Start Date and End Date",
      }),
    });
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    Swal.fire({
      icon: "warning",
      title: intl.formatMessage({
        id: "COMMON.INVALID_DATE_RANGE",
        defaultMessage: "End Date cannot be before Start Date",
      }),
    });
    return;
  }

  setSelectedCard(template.id);
  setSelectedModuleId(module.id);
  setSelectedMappingId(template.mappingId);
  setSelectedTemplateIdForReport(template.id);
  setSelectedTemplateName(template.name);
  setSelectedTemplateIsDate(template.isDate || 0);

  if (module.nameEnglish === "Chef Agency Theme") {
    setAgencyType("chef");
    setIsManager(false);
  } else if (module.nameEnglish === "Labour Agency Theme") {
    setAgencyType("labour");
    setIsManager(false);
  } else if (module.nameEnglish === "Outside Agency Theme") {
    setAgencyType("outside");
    setIsManager(false);
  } else if (module.nameEnglish === "Order Summary Theme") {
    setAgencyType("order_summary");
    setIsManager(true);
  } else if (module.nameEnglish === "Raw Material Theme") {
    setAgencyType("raw_material");
    setIsManager(false);
  } else {
    setAgencyType("");
    setIsManager(false);
  }

  setIsMenuReportOpen(true);
};

  const getFilteredTemplates = (module) => {
  const templates = moduleTemplates[module.id] || [];
  return templates.filter((template) => {
    // ── Permission check (same pattern as SelectMenureport) ──
    if (allowedTemplateIds !== null) {
      if (allowedTemplateIds.size > 0) {
        if (!allowedTemplateIds.has(template.templateMasterId)) return false;
      } else {
        return false;
      }
    }

    if (module.nameEnglish === "Order Summary Theme") return true;
    if (module.nameEnglish === "Raw Material Theme") {
      return template.name === "Datewise Raw Material Report";
    }
    return template.isDate === 1;
  });
};

  // Filter modules based on active tab
  const visibleModules = modules.filter((m) => {
    if (activeTab === "agency") return AGENCY_MODULES.includes(m.nameEnglish);
    if (activeTab === "order") return ORDER_MODULES.includes(m.nameEnglish);
    if (activeTab === "raw") return RAW_MATERIAL_MODULES.includes(m.nameEnglish);
    return false;
  });

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <i className="ki-filled ki-left text-gray-600 text-sm" />
          </button>
          <i className="ki-filled ki-calendar-tick text-primary text-xl" />
          <h1 className="text-xl font-bold text-gray-800">
            <FormattedMessage
              id="REPORTS.ADMIN_MODULE_REPORT"
              defaultMessage="Date Wise Report"
            />
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => {
              setActiveTab("agency");
              setSelectedParty("");
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "agency"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="ki-filled ki-people text-base" />
 <FormattedMessage id="REPORTS.AGENCY_REPORT" defaultMessage="Agency Report" />          </button>
          <button
            onClick={() => {
              setActiveTab("order");
              setSelectedParty("");
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "order"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="ki-filled ki-notepad-edit text-base" />
<FormattedMessage id="REPORTS.ORDER_REPORT" defaultMessage="Order Report" />          </button>
          <button
            onClick={() => {
              setActiveTab("raw");
              setSelectedParty("");
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === "raw"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className="ki-filled ki-basket text-base" />
            <FormattedMessage id="REPORTS.RAW_MATERIAL_REPORT" defaultMessage="Raw Material Report" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full" />
          </div>
        ) : (
          <>
            {/* Filters Row */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                   <FormattedMessage id="COMMON.START_DATE" defaultMessage="Start Date" />
                     <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    End Date
                      <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      disabled={!startDate}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Select Party */}
                {activeTab === "order" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                     <FormattedMessage id="COMMON.SELECT_PARTY" defaultMessage="Select Party" />
                    </label>
                    <div className="relative">
                      <select
                        value={selectedParty}
                        onChange={(e) => {
                          const partyId = e.target.value;
                          setSelectedParty(partyId);
                          const party = parties.find(
                            (p) => String(p.id) === String(partyId),
                          );
                          if (party) {
                            setEventName(party.name);
                            setPartyNumber(party.mobileno);
                          } else {
                            setEventName("");
                            setPartyNumber("");
                          }
                        }}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white appearance-none pr-8 text-black"
                      >
                   <option value="">{intl.formatMessage({ id: "COMMON.CHOOSE_PARTY", defaultMessage: "Choose Party" })}</option>
                        {parties.map((party) => (
                          <option key={party.id} value={party.id}>
                            {party.name}
                          </option>
                        ))}
                      </select>
                      <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Module Sections -> each template is its own card with its own Generate Report button */}
            {visibleModules.length > 0 ? (
              <div className="space-y-8">
                {visibleModules.map((module) => {
                  const filteredTemplates = getFilteredTemplates(module);

                  return (
                    <div key={module.id}>
                      {/* Module Section Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i
                            className={`ki-filled ${module.icon} text-primary text-lg`}
                          />
                        </div>
                        <h3 className="font-bold text-gray-800 text-base">
                          {module.name}
                        </h3>
                      </div>

                      {templatesLoading[module.id] ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
                        </div>
                      ) : filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                            >
                              {/* Card Header */}
                              <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-gray-100">
                                <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                  <i className="ki-filled ki-abstract-33 text-gray-500 text-l" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-800 truncate">
                                    {template.name}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {template.description || ""}
                                  </div>
                                </div>
                              </div>

                              {/* Generate Report Button */}
                              <div className="px-5 py-4 mt-auto">
                                <button
                                  className="w-full btn btn-primary rounded-lg py-2.5 text-sm font-semibold"
                                  onClick={() =>
                                    handleGenerateReport(module, template)
                                  }
                                >
                                   <FormattedMessage id="COMMON.GENERATE_REPORT" defaultMessage="Generate Report" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                          <p className="text-gray-400 text-sm">
                          <FormattedMessage id="COMMON.NO_TEMPLATES_AVAILABLE" defaultMessage="No templates available" />
  
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <i className="ki-filled ki-information-2 text-gray-300 text-4xl mb-4" />
                <p className="text-gray-500 text-base"> <FormattedMessage id="COMMON.NO_MODULES_AVAILABLE" defaultMessage="No modules available" /></p>
              </div>
            )}
          </>
        )}
      </Container>

      {/* MenuReport Modal */}
      <MenuReport
        isModalOpen={isMenuReportOpen}
        setIsModalOpen={setIsMenuReportOpen}
        eventId={-1}
        eventFunctionId={-1}
        moduleId={selectedModuleId}
        mappingId={selectedMappingId}
        selectedTemplateId={selectedTemplateIdForReport}
        eventName={eventName}
        PartyNumber={partyNumber}
        selectedTemplateName={selectedTemplateName}
        isNamePlateTheme={false}
        startDate={startDate}
        endDate={endDate}
        isAdminModuleReport={false}
        agencyType={agencyType}
        selectedParty={selectedParty}
        isManager={isManager}
      />
    </Fragment>
  );
}