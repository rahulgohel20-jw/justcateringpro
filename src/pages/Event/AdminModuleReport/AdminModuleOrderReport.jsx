import { Fragment, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetEventMasterById,
  GettemplatebyuserId,
  GetAllCustomThemeByUserIdAndModuleId,
  GetEventMaster,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { Container } from "@/components/container";
import MenuReport from "../../../partials/modals/menu-report/MenuReport";

export default function AdminModuleOrderReport() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
const isChildUser = authStorage?.state?.user?.ischilduser ?? false;

  const activeLang = localStorage.getItem("lang") || "en";
  const userId = localStorage.getItem("userId");

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

  // Per-module toggled templates: { [moduleId]: Set<templateId> }
  const [moduleSelectedTemplate, setModuleSelectedTemplate] = useState({});

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
        const response = await GetEventMaster(localStorage.getItem("userId"), isChildUser);
        const events = response.data.data["Event Details"];
        const formattedParties = events.map((event) => ({
          id: event.party.id,
          name:
            getLangValue(event.party, "name") || event.party.nameEnglish || "-",
          mobileno: event.party.mobileno || "",
        }));
        // Deduplicate by party id
        const unique = Array.from(
          new Map(formattedParties.map((p) => [p.id, p])).values(),
        );
        setParties(unique);
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };
    fetchParty();
  }, []);

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
              ["Order Summary Theme"].includes(module.nameEnglish),
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
      case "Chef Agency Theme":
        return "ki-timer";
      case "Labour Agency Theme":
        return "ki-people";
      case "Outside Agency Theme":
        return "ki-sun";
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

      // All templates ON by default
      if (templates.length > 0) {
        setModuleSelectedTemplate((prev) => ({
          ...prev,
          [moduleId]:
            prev[moduleId] !== undefined
              ? prev[moduleId]
              : new Set(templates.map((t) => t.id)),
        }));
      }
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

  const handleToggleTemplate = (moduleId, templateId) => {
    setModuleSelectedTemplate((prev) => {
      const current = new Set(prev[moduleId] || []);
      if (current.has(templateId)) {
        current.delete(templateId);
      } else {
        current.add(templateId);
      }
      return { ...prev, [moduleId]: current };
    });
  };

  const handleGenerateReport = (moduleId) => {
    const enabledSet = moduleSelectedTemplate[moduleId] || new Set();
    const templates = moduleTemplates[moduleId] || [];
    const filteredTemplates = getFilteredTemplates(
      modules.find((m) => m.id === moduleId),
    );
    const template = filteredTemplates.find((t) => enabledSet.has(t.id));
    if (!template) return;

    setSelectedCard(template.id);
    setSelectedModuleId(moduleId);
    setSelectedMappingId(template.mappingId);
    setSelectedTemplateIdForReport(template.id);
    setSelectedTemplateName(template.name);
    setSelectedTemplateIsDate(template.isDate || 0);

    const selectedModule = modules.find((m) => m.id === moduleId);

    if (selectedModule?.nameEnglish === "Chef Agency Theme") {
      setAgencyType("chef");
    } else if (selectedModule?.nameEnglish === "Labour Agency Theme") {
      setAgencyType("labour");
    } else if (selectedModule?.nameEnglish === "Outside Agency Theme") {
      setAgencyType("outside");
    } else if (selectedModule?.nameEnglish === "Order Summary Theme") {
      setAgencyType("order_summary");
    } else {
      setAgencyType("");
    }

    setIsMenuReportOpen(true);
  };

  const getFilteredTemplates = (module) => {
    const templates = moduleTemplates[module.id] || [];
    return templates.filter((template) => {
      if (module.nameEnglish === "Order Summary Theme") return true;
      return template.isDate === 1;
    });
  };

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
                    Start Date
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
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Select Party
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white appearance-none pr-8 text-gray-500"
                    >
                      <option value="">Choose Party</option>
                      {parties.map((party) => (
                        <option key={party.id} value={party.id}>
                          {party.name}
                        </option>
                      ))}
                    </select>
                    <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  </div>
                </div> */}
              </div>
            </div>

            {/* Module Cards Grid */}
            {modules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const filteredTemplates = getFilteredTemplates(module);
                  const enabledSet =
                    moduleSelectedTemplate[module.id] || new Set();

                  return (
                    <div
                      key={module.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                    >
                      {/* Card Header */}
                      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i
                            className={`ki-filled ${module.icon} text-primary text-lg`}
                          />
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">
                          {module.name}
                        </h3>
                      </div>

                      {/* Templates List */}
                      <div className="flex-1 px-5 py-4 space-y-3">
                        {templatesLoading[module.id] ? (
                          <div className="flex justify-center py-6">
                            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full" />
                          </div>
                        ) : filteredTemplates.length > 0 ? (
                          filteredTemplates.map((template) => {
                            const isOn = enabledSet.has(template.id);
                            return (
                              <div
                                key={template.id}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <i className="ki-filled ki-abstract-33 text-gray-500 text-l" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate">
                                      {template.name}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                      {template.description || ""}
                                    </div>
                                  </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleTemplate(module.id, template.id)
                                  }
                                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isOn ? "bg-primary" : "bg-gray-200"
                                  }`}
                                  role="switch"
                                  aria-checked={isOn}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                                      isOn ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-gray-400 text-sm py-6">
                            No templates available
                          </div>
                        )}
                      </div>

                      {/* Generate Report Button */}
                      <div className="px-5 pb-5">
                        <button
                          className="w-full btn btn-primary rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleGenerateReport(module.id)}
                          disabled={
                            enabledSet.size === 0 ||
                            filteredTemplates.length === 0
                          }
                        >
                          Generate Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <i className="ki-filled ki-information-2 text-gray-300 text-4xl mb-4" />
                <p className="text-gray-500 text-base">No modules available</p>
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
      />
    </Fragment>
  );
}
