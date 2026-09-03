import { Fragment, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import {
  GetEventMasterById,
  GetAllCustomThemeByUserIdAndModuleId,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { Container } from "@/components/container";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import MenuReport from "../../../partials/modals/menu-report/MenuReport";
import CounterNameplate from "../../../partials/modals/counter-nameplate/CounterNameplate";
import MainStandyMenuReport from "../../../partials/modals/menu-report/MainStandyMenuReport";
import NamePlateReport from "../../../partials/modals/menu-report/NamePlateReport";
import CrockeryCutleryReportModal from "../../../partials/modals/menu-report/CrockeryCutleryReportModal";
import { useReportPermission } from "@/hooks/useReportPermission";

export default function AllReports() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();

  const activeLang = localStorage.getItem("lang") || "en";
  const userId = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang");
  const [isExclusive, setIsExclusive] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [reportSections, setReportSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isCrockeryModalOpen, setIsCrockeryModalOpen] = useState(false);
  const [isMenuReportOpen, setIsMenuReportOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedFunctionId, setSelectedFunctionId] = useState(-1);
  const [mappingId, setMappingId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [eventName, setEventName] = useState("");
  const [partyNumber, setPartyNumber] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [isNamePlateTheme, setIsNamePlateTheme] = useState(false);
  const [openNamePlate, setOpenNamePlate] = useState(false);
  const [openNamePlateTest, setOpenNamePlateTest] = useState(false);
  const [isCounterNameplateOpen, setIsCounterNameplateOpen] = useState(false);

  const currentlang = useMemo(() => {
    switch (lang) {
      case "en":
        return 0;
      case "hi":
        return 1;
      case "gu":
        return 2;
      default:
        return 0;
    }
  }, [lang]);

  const { filterSections, allowedTemplateIds } = useReportPermission();

  const visibleSections = useMemo(
    () => filterSections(reportSections),
    [reportSections, allowedTemplateIds],
  );

  const selectedEventFunction = useMemo(() => {
    if (selectedFunctionId === -1) return null;
    return eventData?.eventFunctions?.find(
      (item) => item.id === selectedFunctionId,
    );
  }, [eventData, selectedFunctionId]);

  const getLangValue = (obj, baseKey) => {
    if (!obj) return "";
    if (activeLang === "hi")
      return obj[`${baseKey}Hindi`] || obj[`${baseKey}English`];
    if (activeLang === "gu")
      return obj[`${baseKey}Gujarati`] || obj[`${baseKey}English`];
    return obj[`${baseKey}English`];
  };

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
    const fetchAllTemplatesByUserId = async () => {
      try {
        setLoading(true);
        const res = await GetAllCustomThemeByUserIdAndModuleId(userId, "");

        if (
          res?.data?.success &&
          res?.data?.data &&
          Array.isArray(res.data.data)
        ) {
          const allTemplates = res.data.data;
          const moduleGroups = {
            menu: [],
            allocation: [],
            raw: [],
            labour: [],
            costing: [],
            profitloss: [],
            menuForHM: [],
            generalFixTheme: [],
            crockertCutleryTheme: [],
            dishcounting: [],
             agencyBooking: [],
          };

          allTemplates.forEach((item) => {
            const moduleName = item.templateModuleMaster?.nameEnglish;
            const template = {
              // id: item.templateMaster.id,
              id: item.id,
              name: item.templateMaster.name,
              description: item.templateMaster.description || "",
              headingFontColor: item.templateMaster.headingFontColor,
              contentFontColor: item.templateMaster.contentFontColor,
              frontPage: item.templateMaster.frontPage,
              secondFrontPage: item.templateMaster.secondFrontPage,
              watermark: item.templateMaster.watermark,
              lastMainPage: item.templateMaster.lastMainPage,
              dummyPdf: item.templateMaster.dummyPdf,
              isNamePlate: item.templateMaster.isNamePlate,
              namePlateBg: item.templateMaster.namePlateBg,
              mappingId: item.templateMappingResponseDto?.id || item.id,
              namePlateType:
                item.templateMappingResponseDto?.namePlateType || "",
              moduleId: item.templateModuleMaster.id,
              moduleName: moduleName,
              moduleNameHindi: item.templateModuleMaster.nameHindi,
              moduleNameGujarati: item.templateModuleMaster.nameGujarati,
            };

            const addToModuleGroup = (group) => {
              const existingModule = group.find(
                (m) => m.id === item.templateModuleMaster.id,
              );
              if (existingModule) {
                existingModule.templates.push(template);
              } else {
                group.push({
                  id: item.templateModuleMaster.id,
                  name: getLangValue(item.templateModuleMaster, "name"),
                  nameEnglish: moduleName,
                  moduleId: item.templateModuleMaster.id,
                  templates: [template],
                  templatesLoaded: true,
                });
              }
            };

            if (["Exclusive Theme", "Back Office Theme"].includes(moduleName)) {
              addToModuleGroup(moduleGroups.menu);
            } else if (
              [
                "Menu Allocation Theme",
                "Chef Agency Theme",
                "Outside Agency Theme",
                "Name Plate Theme",
           
              ].includes(moduleName)
            ) {
              addToModuleGroup(moduleGroups.allocation);
            } else if (moduleName === "Raw Material Theme") {
              addToModuleGroup(moduleGroups.raw);
            } else if (moduleName === "Labour Agency Theme") {
              addToModuleGroup(moduleGroups.labour);
            } else if (moduleName === "Menu For HM") {
              addToModuleGroup(moduleGroups.menuForHM);
            } else if (moduleName === "Costing Report Theme") {
              addToModuleGroup(moduleGroups.costing);
            } else if (moduleName === "Profit And Loss") {
              addToModuleGroup(moduleGroups.profitloss);
            } else if (moduleName === "General Fix Theme") {
              addToModuleGroup(moduleGroups.generalFixTheme);
            } else if (moduleName === "Crockert Cutlery Theme") {
              addToModuleGroup(moduleGroups.crockertCutleryTheme);
            } else if (moduleName === "Dish counting") {
              addToModuleGroup(moduleGroups.dishcounting);
            }else if (moduleName === "Agency Booking Theme") {
  addToModuleGroup(moduleGroups.agencyBooking);}
         
          });

          const sections = [];
          if (moduleGroups.menu.length > 0)
            sections.push({
              id: "menu-planning",
              name: "Menu Planning",
              modules: moduleGroups.menu,
            });
          if (moduleGroups.allocation.length > 0)
            sections.push({
              id: "menu-allocation",
              name: "Menu Allocation Reports",
              modules: moduleGroups.allocation,
            });
          if (moduleGroups.raw.length > 0)
            sections.push({
              id: "raw-material",
              name: "Raw Material Reports",
              modules: moduleGroups.raw,
            });
          if (moduleGroups.labour.length > 0)
            sections.push({
              id: "labour-agency",
              name: "Labour Agency Reports",
              modules: moduleGroups.labour,
            });
          if (moduleGroups.costing.length > 0)
            sections.push({
              id: "costing",
              name: "Costing Reports",
              modules: moduleGroups.costing,
            });
          if (moduleGroups.dishcounting.length > 0)
            sections.push({
              id: "dishcounting",
              name: "Dish Counting",
              modules: moduleGroups.dishcounting,
            });
          if (moduleGroups.profitloss.length > 0)
            sections.push({
              id: "profitloss",
              name: "Profitloss Reports",
              modules: moduleGroups.profitloss,
            });
          if (moduleGroups.generalFixTheme.length > 0)
            sections.push({
              id: "generalFixTheme",
              name: "General Fix Theme",
              modules: moduleGroups.generalFixTheme,
            });
          if (moduleGroups.crockertCutleryTheme.length > 0)
            sections.push({
              id: "crockertCutleryTheme",
              name: "Crocket Cutlery Theme",
              modules: moduleGroups.crockertCutleryTheme,
            });
          if (moduleGroups.menuForHM.length > 0)
            sections.push({
              id: "menu-hm",
              name: "Menu For HM Reports",
              modules: moduleGroups.menuForHM,
            });
            if (moduleGroups.agencyBooking.length > 0)
  sections.push({
    id: "agencyBooking",
    name: "Agency Booking Reports",
    modules: moduleGroups.agencyBooking,
  });


          setReportSections(sections);
          if (sections.length > 0) setExpandedSection(sections[0].id);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchAllTemplatesByUserId();
  }, [eventId, activeLang, userId]);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleGenerateReport = (section, module, template) => {
    setSelectedCard(template.id);
    setSelectedTemplateId(template.id);
    setSelectedTemplateName(template.name);
    setMappingId(template.mappingId);
    setSelectedModuleId(template.moduleId);

    const isNamePlateModule = module.nameEnglish === "Name Plate Theme";
    setIsNamePlateTheme(isNamePlateModule);

    const isExclusiveTab = module?.nameEnglish === "Exclusive Theme";
    setIsExclusive(isExclusiveTab);

    if (section.id === "crockertCutleryTheme") {
      setIsCrockeryModalOpen(true);
      return;
    }
    if (
      isNamePlateModule &&
      template.isNamePlate &&
      template.namePlateType === "Counter Name Plate"
    ) {
      setIsCounterNameplateOpen(true);
      return;
    }
    if (
      isNamePlateModule &&
      template.isNamePlate &&
      template.namePlateType === "Table Menu"
    ) {
      setOpenNamePlate(true);
      return;
    }
    if (
      isNamePlateModule &&
      template.isNamePlate &&
      template.namePlateType === "Main Standy"
    ) {
      setOpenNamePlateTest(true);
      return;
    }
    setIsMenuReportOpen(true);
  };

  const allFunctionsLabel =
    activeLang === "hi"
      ? "सभी फंक्शन"
      : activeLang === "gu"
        ? "બધા ફંક્શન"
        : "All Functions";

  return (
    <Fragment>
      <Container>
        <div className="flex items-center gap-3 mb-5 px-3 sm:px-0">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <i className="ki-filled ki-left text-gray-700 text-sm" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            <FormattedMessage
              id="REPORTS.SELECT_REPORT_TYPE"
              defaultMessage="Select Report Type"
            />
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
          </div>
        ) : (
          <>
            {/* ── TOP: Party Name + Select Function dropdowns ── */}
            {/* {eventData && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4 mx-3 sm:mx-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-black mb-1.5">
                      <i className="ki-filled ki-user text-black text-sm" />
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.PARTY_NAME"
                        defaultMessage="Party Name"
                      />
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 appearance-none bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-8"
                        value={eventId}
                        disabled
                      >
                        <option>
                          {getLangValue(eventData.party, "name") || "-"}
                        </option>
                      </select>
                      <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-black mb-1.5">
                      <i className="ki-filled ki-calendar text-black text-sm" />
                      <FormattedMessage
                        id="COMMON.SELECT_FUNCTION"
                        defaultMessage="Select Function"
                      />
                    </label>
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-800 appearance-none bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-8"
                        value={selectedFunctionId}
                        onChange={(e) =>
                          setSelectedFunctionId(Number(e.target.value))
                        }
                      >
                        <option value={-1}>{allFunctionsLabel}</option>
                        {eventData?.eventFunctions?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getLangValue(item.function, "name")}
                          </option>
                        ))}
                      </select>
                      <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )} */}

            {/* ── Event Info Card ── */}
            {eventData && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4 mx-3 sm:mx-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniInfoItem
                    icon={toAbsoluteUrl("/media/icons/eventname.png")}
                    label={intl.formatMessage({
                      id: "EVENT_MENU_ALLOCATION.EVENT_NAME",
                      defaultMessage: "Event Name",
                    })}
                    value={getLangValue(eventData.eventType, "name") || "-"}
                  />
                  <MiniInfoItem
                    icon={toAbsoluteUrl("/media/icons/funtionname.png")}
                    label={intl.formatMessage({
                      id: "COMMON.FUNCTION",
                      defaultMessage: "Function",
                    })}
                    value={
                      selectedEventFunction
                        ? getLangValue(selectedEventFunction.function, "name")
                        : allFunctionsLabel
                    }
                  />
                  <MiniInfoItem
                    icon={toAbsoluteUrl("/media/icons/date&time.png")}
                    label={intl.formatMessage({
                      id: "TABLE.EVENT_DATE_TIME",
                      defaultMessage: "Event Date & Time",
                    })}
                    value={eventData.eventStartDateTime || "-"}
                  />
                  <MiniInfoItem
                    icon={toAbsoluteUrl("/media/icons/venue.png")}
                    label={intl.formatMessage({
                      id: "TABLE.VENUE",
                      defaultMessage: "Venue",
                    })}
                    value={getLangValue(eventData.venue, "name") || "-"}
                  />
                </div>
              </div>
            )}

            {/* ── Report Categories Header ── */}
            {visibleSections.length > 0 && (
              <div className="flex items-center justify-between px-3 sm:px-0 mb-3">
                <div className="flex items-center gap-2">
                  <i className="ki-filled ki-category text-gray-500 text-base" />
                  <span className="text-sm font-bold text-gray-700">
                    Report Categories
                  </span>
                </div>
                <span className="text-sm font-medium text-black bg-gray-100 px-2.5 py-1 rounded-full">
                  Showing {visibleSections.length} categories
                </span>
              </div>
            )}

            {/* ── Report Sections ── */}
            {visibleSections.length === 0 ? (
              <div className="text-center py-12 text-gray-500 px-3">
                <p className="text-base">No reports available</p>
              </div>
            ) : (
              <div className="space-y-3 px-3 sm:px-0 pb-6">
                {visibleSections.map((section) => {
                  const isExpanded = expandedSection === section.id;

                  return (
                    <div
                      key={section.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <div
                        onClick={() => toggleSection(section.id)}
                        className="px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i className="ki-filled ki-document text-primary text-base" />
                          </div>
                          <span className="font-bold text-sm sm:text-base text-gray-800">
                            {section.name}
                          </span>
                        </div>
                        <i
                          className={`ki-filled text-sm text-gray-500 transition-transform duration-200 ${
                            isExpanded ? "ki-up" : "ki-down"
                          }`}
                        />
                      </div>

                      {/* Section Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          {section.modules.map((module, moduleIndex) => (
                            <div
                              key={module.id}
                              className={
                                moduleIndex !== 0
                                  ? "border-t border-gray-100"
                                  : ""
                              }
                            >
                              {/* Module Sub-heading */}
                              <div className="px-4 py-2 bg-gray-50">
                                <span className="text-sm font-bold text-primary uppercase tracking-wide">
                                  • {module.name}
                                </span>
                              </div>

                              {/* Templates Grid */}
                              {module.templates.length === 0 ? (
                                <div className="text-center py-6 text-black text-sm px-4">
                                  No templates available
                                </div>
                              ) : (
                                <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                                  {module.templates.map((template) => {
                                    const isActive =
                                      selectedCard === template.id;
                                    return (
                                      <div
                                        key={template.id}
                                        className={`
                                          flex flex-col items-center bg-white rounded-xl border-2 p-3 transition-all duration-150
                                          ${
                                            isActive
                                              ? "border-primary shadow-md"
                                              : "border-gray-200 hover:border-primary/40 hover:shadow-sm"
                                          }
                                        `}
                                      >
                                        {/* File Icon */}
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2 flex-shrink-0">
                                          <img
                                            src={toAbsoluteUrl(
                                              "/media/icons/reportcard.png",
                                            )}
                                            alt={template.name || "Template"}
                                            className="w-6 h-6 object-contain"
                                          />
                                        </div>

                                        {/* Template Name */}
                                        <p
                                          className={`text-sm font-semibold text-center leading-tight mb-3 line-clamp-2 ${
                                            isActive
                                              ? "text-primary"
                                              : "text-gray-800"
                                          }`}
                                        >
                                          {template.name}
                                        </p>

                                        {/* Generate Button */}
                                        <button
                                          className="w-full btn btn-primary rounded-lg py-1.5 text-sm font-semibold mt-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateReport(
                                              section,
                                              module,
                                              template,
                                            );
                                          }}
                                        >
                                          <FormattedMessage
                                            id="REPORTS.GENERATE_REPORT"
                                            defaultMessage="Generate Report"
                                          />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>

      {/* ── Modals (unchanged) ── */}
      <CrockeryCutleryReportModal
        isModalOpen={isCrockeryModalOpen}
        setIsModalOpen={setIsCrockeryModalOpen}
        eventId={eventId}
        eventFunctionId={selectedFunctionId}
        moduleId={selectedModuleId}
        mappingId={mappingId}
        selectedTemplateId={selectedTemplateId}
        eventName={eventName}
        selectedTemplateName={selectedTemplateName}
        PartyNumber={partyNumber}
      />
      <MenuReport
        isModalOpen={isMenuReportOpen}
        setIsModalOpen={setIsMenuReportOpen}
        eventId={eventId}
        eventFunctionId={selectedFunctionId}
        moduleId={selectedModuleId}
        mappingId={mappingId}
        selectedTemplateId={selectedTemplateId}
        eventName={eventName}
        selectedTemplateName={selectedTemplateName}
        PartyNumber={partyNumber}
        isNamePlateTheme={isNamePlateTheme}
        exclusive={isExclusive}
      />
      <CounterNameplate
        isModalOpen={isCounterNameplateOpen}
        setIsModalOpen={setIsCounterNameplateOpen}
        eventId={eventId}
        eventFunctionId={selectedFunctionId}
        currentlang={currentlang}
        adminTemplatemoduleId={selectedModuleId}
        selectedTemplateId={selectedTemplateId}
      />
      {openNamePlateTest && (
        <MainStandyMenuReport
          isModalOpen={openNamePlateTest}
          setIsModalOpen={setOpenNamePlateTest}
          eventId={eventId}
          eventFunctionId={selectedFunctionId}
          selectedTemplateId={selectedTemplateId}
        />
      )}
      {openNamePlate && (
        <CustomModal
          open={openNamePlate}
          onClose={() => setOpenNamePlate(false)}
          width={900}
          footer={null}
        >
          <NamePlateReport
            onClose={() => setOpenNamePlate(false)}
            eventId={eventId}
            eventFunctionId={selectedFunctionId}
            selectedTemplateId={selectedTemplateId}
          />
        </CustomModal>
      )}
    </Fragment>
  );
}

const MiniInfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    {icon && (
      <img
        src={icon}
        alt={label}
        className="w-4 h-4 object-contain mt-0.5 flex-shrink-0 opacity-70"
      />
    )}
    <div className="min-w-0">
      <p className="text-sm text-black font-medium truncate">{label}</p>
      <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
    </div>
  </div>
);
