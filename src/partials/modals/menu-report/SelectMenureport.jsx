import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import NamePlateReport from "./NamePlateReport";
import { toAbsoluteUrl } from "@/utils";
import { Select } from "antd";
import {
  GetEventMasterById,
  GettemplatebyuserId,
  GetAllCustomThemeByUserIdAndModuleId,
} from "@/services/apiServices";
import { useMemo } from "react";
import CounterNameplate from "../counter-nameplate/CounterNameplate";
import MenuReport from "./MenuReport";
import { FormattedMessage, useIntl } from "react-intl";
import MainStandyMenuReport from "./MainStandyMenuReport";
import { useReportPermission } from "@/hooks/useReportPermission";

export default function SelectMenureport({
  eventId,
  isSelectMenureport,
  setIsSelectMenuReport,
  setEventFunctionId,
  disabled = false,
  mode,
  ischef,
  isOutside,
  mobileNumber,
  preSelectedAgencyId,
  customPackageId,          // NEW
  onPackageTemplateSelect, 
}) {
  const params = useParams();
  const finalEventId = eventId || params.eventId;
  const [selectedCard, setSelectedCard] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isMenuReportOpen, setIsMenuReportOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedFunctionIds, setSelectedFunctionIds] = useState([-1]);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [mappingId, setmappingId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [eventName, setEventName] = useState("");
  const [PartyNumber, setPartyNumber] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [isNamePlateTheme, setIsNamePlateTheme] = useState(1); // NEW STATE
  const [openNamePlate, setOpenNamePlate] = useState(false);
  const [openNamePlateTest, setOpenNamePlateTest] = useState(false);
  const [agencyType, setAgencyType] = useState(null);
  const [isModalOpenWithLogo, setIsModalOpenWithLogo] = useState(false);
  const [isTableMenuExclusive, setIsTableMenuExclusive] = useState(false);
  const userId = localStorage.getItem("userId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExclusive, setIsExclusive] = useState(false);
  const intl = useIntl();
  const lang = localStorage.getItem("lang");
  const [catFontId, setCatFontId] = useState(null);
  const [catFontSize, setCatFontSize] = useState(null);
  const [itemFontId, setItemFontId] = useState(null);
  const [itemFontSize, setItemFontSize] = useState(null);
  const [sloganFontId, setSloganFontId] = useState(null);
  const [sloganFontSize, setSloganFontSize] = useState(null);
  const [templateType, setTemplateType] = useState(null);



  

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

  const selectedEventFunction = useMemo(() => {
    const nonAll = selectedFunctionIds.filter((id) => id !== -1);
    if (nonAll.length !== 1) return null;
    return eventData?.eventFunctions?.find((item) => item.id === nonAll[0]);
  }, [eventData, selectedFunctionIds]);

  const activeLang = localStorage.getItem("lang") || "en";

  const getLangValue = (obj, baseKey, lang) => {
    if (!obj) return "";

    switch (lang) {
      case "hi":
        return obj[`${baseKey}Hindi`] || obj[`${baseKey}English`] || "";
      case "gu":
        return obj[`${baseKey}Gujarati`] || obj[`${baseKey}English`] || "";
      default:
        return obj[`${baseKey}English`] || "";
    }
  };

  const { filterSections, allowedTemplateIds } = useReportPermission();

  // Add this effect to reset state when mode changes
useEffect(() => {
  setSelectedCard(null);
  setTemplates([]);
  setActiveTab(null); // ← force tab reset before refetch
  
  const ALLOWED_WORK_REPORT_USER_IDS = ["499"];
  const fetchTemplateModules = async () => {
    try {
      const res = await GettemplatebyuserId();
      if (res?.data?.success && res?.data?.data) {
        let modules = res.data.data.filter(
          (module) => module.isActive && !module.isDelete,
        );

        const currentUserId = localStorage.getItem("userId");
      const canSeeWorkReport = ALLOWED_WORK_REPORT_USER_IDS.includes(currentUserId);

      if (mode === "menu") {
        const menuThemes = ["Exclusive Theme", "Back Office Theme"];
        if (canSeeWorkReport) {
          menuThemes.push("Work Report Theme");
        }
        modules = modules.filter((module) =>
          menuThemes.includes(module.nameEnglish),
        );
      } else if (mode === "decor") {
        modules = modules.filter(
          (module) => module.nameEnglish === "Decoration Theme",
        );
      }
else if (mode === "allocation" && !ischef && !isOutside) {
            modules = modules.filter((module) =>
              [
                "Menu Allocation Theme",
                "Chef Agency Theme",
                "Outside Agency Theme",
                "Name Plate Theme",
                "Attendance Theme", 
                
              ].includes(module.nameEnglish),
            );
          } else if (mode === "raw") {
            modules = modules.filter(
              (module) => module.nameEnglish === "Raw Material Theme",
            );
          } else if (mode === "labour") {
            modules = modules.filter(
              (module) => module.nameEnglish === "Labour Agency Theme",
            );
          } else if (mode === "costing") {
            modules = modules.filter(
              (module) => module.nameEnglish === "Costing Report Theme",
            );
          }  else if (mode === "package") {                         
  modules = modules.filter((module) =>
    ["Exclusive Theme",].includes(
      module.nameEnglish,
    ),
  );
} else if (mode === "allocation" && ischef) {
            modules = modules.filter(
              (module) => module.nameEnglish === "Chef Agency Theme",
            );
          } else if (mode === "allocation" && isOutside) {
            modules = modules.filter(
              (module) => module.nameEnglish === "Outside Agency Theme",
            );
          }

          const formattedModules = modules.map((module) => ({
            key: module.id,
            label: getLangValue(module, "name", activeLang),
            moduleId: module.id,
            img: "/media/icons/simple.png",
            nameEnglish: module.nameEnglish,
          }));

          setTabs(formattedModules);

          if (formattedModules.length > 0) {
            setActiveTab(formattedModules[0].key);
            setIsNamePlateTheme(
              formattedModules[0].nameEnglish === "Name Plate Theme",
            );
          }
        }
      } catch (error) {
        console.error("Error fetching template modules:", error);
      }
    };

    fetchTemplateModules();
  }, [isSelectMenureport, finalEventId, mode]);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!activeTab) return;

      setTemplates([]);

      try {
        setTemplatesLoading(true);

        const res = await GetAllCustomThemeByUserIdAndModuleId(
          userId,
          activeTab,
        );
       

        let dynamicTemplates = [];

        if (
          res?.data?.success &&
          res?.data?.data &&
          Array.isArray(res.data.data)
        ) {
          dynamicTemplates = res.data.data.map((item) => ({
            // id: item.templateMaster.id,
            id: item.id,
            templateMasterId: item.templateMaster.id,
            name: item.templateMaster.name || "",
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
            isCounterNamePlate: item.templateMaster.isCounterNamePlate,
            isStatic: false,
            mappingId: item.templateMappingResponseDto?.id || item.id,
            namePlateType: item.templateMappingResponseDto?.namePlateType || "",
            type: item.templateMappingResponseDto.nameEnglish || "",
            catFontId: item.catFontId,
            catFontSize: item.catFontSize,
            itemFontId: item.itemFontId,
            itemFontSize: item.itemFontSize,
            sloganFontId: item.sloganFontId,
            sloganFontSize: item.sloganFontSize,
          }));
        }

        setTemplates(dynamicTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [activeTab, tabs, userId]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!finalEventId) return;
      try {
        setLoading(true);
        const res = await GetEventMasterById(finalEventId);

        if (res?.data?.data?.["Event Details"]?.length > 0) {
          const event = res.data.data["Event Details"][0];

          setEventName(event?.party?.nameEnglish || "");
          setPartyNumber(event?.party?.mobileno || "");
          setEventData(event);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

   if (isSelectMenureport && finalEventId && mode !== "package") { 
    fetchEventData();
  }
  }, [isSelectMenureport, finalEventId , mode]);

  useEffect(() => {
    if (!eventData) return;
    if (setEventFunctionId !== undefined && setEventFunctionId !== null) {
      setSelectedFunctionIds([Number(setEventFunctionId)]);
    } else {
      setSelectedFunctionIds([-1]);
    }
  }, [eventData, setEventFunctionId, isSelectMenureport]);

  const handleGenerateReport = (template) => {
      if (mode === "package") {
 onPackageTemplateSelect?.({ ...template, moduleId: activeTab });    return;
  } 
    setSelectedCard(template.id);
    setSelectedTemplateId(template.id);
    setSelectedTemplateName(template.name);
    setmappingId(template.mappingId);
    setSelectedModuleId(activeTab);

    setCatFontId(template.catFontId);
    setCatFontSize(template.catFontSize);
    setItemFontId(template.itemFontId);
    setItemFontSize(template.itemFontSize);
    setSloganFontId(template.sloganFontId);
    setSloganFontSize(template.sloganFontSize);
     setTemplateType(template.type);

    const selectedTab = tabs.find((tab) => tab.key === activeTab);

    let type = null;

    const isExclusiveTab = selectedTab?.nameEnglish === "Exclusive Theme";
    setIsExclusive(isExclusiveTab);

    if (selectedTab?.nameEnglish === "Chef Agency Theme") {
      type = "chef";
    } else if (selectedTab?.nameEnglish === "Outside Agency Theme") {
      type = "outside";
    } else if (selectedTab?.nameEnglish === "Labour Agency Theme") {
      type = "labour";
    } 
    else if (selectedTab?.nameEnglish === "Raw Material Theme") {
 
  type = template.name === "Datewise Raw Material Report"
    ? "raw_material"
    : "supplier";
}

    setAgencyType(type);
  

    if (isNamePlateTheme && template.isCounterNamePlate) {
      setIsModalOpen(true);
      return;
    }

    if (
      isNamePlateTheme &&
      template.isNamePlate &&
      template.namePlateType === "Counter Name Plate With Logo"
    ) {
      setIsModalOpen(true);
      return;
    }

    if (
      isNamePlateTheme &&
      template.isNamePlate &&
      template.namePlateType === "Table Menu"
    ) {
      setIsTableMenuExclusive(false);
      setOpenNamePlate(true);
      return;
    }

    if (
      isNamePlateTheme &&
      template.isNamePlate &&
      template.namePlateType === "Table Menu Exclusive"
    ) {
      setIsTableMenuExclusive(true);
      setOpenNamePlate(true);
      return;
    }

    if (
      isNamePlateTheme &&
      template.isNamePlate &&
      template.namePlateType === "Main Standy"
    ) {
      setOpenNamePlateTest(true);
      return;
    }

    setIsMenuReportOpen(true);
  };

  const handleFunctionChange = (e) => {
    setSelectedFunctionIds(Number(e.target.value));
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const selectedTab = tabs.find((tab) => tab.key === tabKey);
    setIsNamePlateTheme(selectedTab?.nameEnglish === "Name Plate Theme");
  };

  return (
    <>
      <CustomModal
        open={isSelectMenureport && !disabled}
        onClose={() => setIsSelectMenuReport(false)}
        footer={null}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <i className="ki-filled ki-document text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-800">
              <FormattedMessage
                id="REPORTS.SELECT_REPORT_TYPE"
                defaultMessage="Select Report Type"
              />
            </span>
          </div>
        }
        width={1100}
      >
        <div className="p-6">
          {/* Event Info Card */}
          {!isOutside && !ischef &&  mode !== "package" &&(
            <div className="bg-gray-200 rounded-2xl p-6 mb-6 border border-gray-400">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <InfoItem
                  icon={toAbsoluteUrl("/media/icons/partyname.png")}
                  label={intl.formatMessage({
                    id: "EVENT_MENU_ALLOCATION.PARTY_NAME",
                    defaultMessage: "Party Name",
                  })}
                  value={
                    getLangValue(eventData?.party, "name", activeLang) || "-"
                  }
                />

                <InfoItem
                  icon={toAbsoluteUrl("/media/icons/eventname.png")}
                  label={intl.formatMessage({
                    id: "EVENT_MENU_ALLOCATION.EVENT_NAME",
                    defaultMessage: "Event Name",
                  })}
                  value={
                    getLangValue(eventData?.eventType, "name", activeLang) ||
                    "-"
                  }
                />
                <InfoItem
                  icon={toAbsoluteUrl("/media/icons/funtionname.png")}
                  label={intl.formatMessage({
                    id: "COMMON.FUNCTION",
                    defaultMessage: "Function",
                  })}
                  value={
                    selectedEventFunction
                      ? getLangValue(
                          selectedEventFunction.function,
                          "name",
                          activeLang,
                        )
                      : activeLang === "hi"
                        ? "सभी फंक्शन"
                        : activeLang === "gu"
                          ? "બધા ફંક્શન"
                          : "All Function"
                  }
                />
                <InfoItem
                  icon={toAbsoluteUrl("/media/icons/date&time.png")}
                  label={intl.formatMessage({
                    id: "TABLE.EVENT_DATE_TIME",
                    defaultMessage: "Event Date & Time",
                  })}
                  value={eventData?.eventStartDateTime || "-"}
                />
                <InfoItem
                  icon={toAbsoluteUrl("/media/icons/venue.png")}
                  label={intl.formatMessage({
                    id: "TABLE.VENUE",
                    defaultMessage: "Venue",
                  })}
                  value={
                    getLangValue(eventData?.venue, "name", activeLang) || "-"
                  }
                />
              </div>
            </div>
          )}

          {mode !== "package" && (() => {
            const activeTabName = tabs.find(
              (t) => t.key === activeTab,
            )?.nameEnglish;
            const isRawMaterial = activeTabName === "Raw Material Theme";

            if (isRawMaterial) {
              return (
                <div className="mb-6 max-w-sm">
                  <label className="block text-sm font-semibold mb-2">
                    Select Function(s)
                  </label>
                  <Select
  mode="multiple"
  allowClear
  style={{ width: "100%" }}
  placeholder="Select Functions"
  value={
    selectedFunctionIds.includes(-1)
      ? []
      : selectedFunctionIds
  }
  onChange={(values) => {
    setSelectedFunctionIds(
      values.length === 0 ? [-1] : values,
    );
  }}
  options={eventData?.eventFunctions?.map((item) => ({
  label: `${getLangValue(item.function, "name", activeLang)}${
    item.bookingDate ? `  ${item.bookingDate}` : ""
  }`,
  value: item.id,
}))}
/>
                  {!selectedFunctionIds.includes(-1) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedFunctionIds.length} function
                      {selectedFunctionIds.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              );
            }

            // Default: single select (all other themes)
            return (
              <div className="mb-6 max-w-sm">
                <label className="block text-sm font-semibold mb-2">
                  Select Function
                </label>
               <select
  className="w-full border rounded-lg px-4 py-2"
  value={selectedFunctionIds[0] ?? -1}
  onChange={(e) =>
    setSelectedFunctionIds([Number(e.target.value)])
  }
>
  <option value={-1}>All Functions</option>
{eventData?.eventFunctions?.map((item) => (
  <option key={item.id} value={item.id}>
    {getLangValue(item.function, "name", activeLang)}
    {item.bookingDate ? `  ( ${item.bookingDate} 
    )` : ""}
  </option>
))}
</select>
              </div>
            );
          })()}

          {/* Dynamic Tabs - FIXED with proper scroll and arrows */}
          <div className="relative mb-6">
            {/* Left Arrow Button */}
            <button
              onClick={() => {
                const container = document.getElementById("tabs-container");
                container.scrollBy({ left: -200, behavior: "smooth" });
              }}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all"
              aria-label="Scroll left"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Tabs Container */}
            <div
              id="tabs-container"
              className="flex gap-10 border-b border-gray-200 overflow-x-auto scrollbar-hide px-10"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`group relative pb-4 flex items-center gap-3 font-semibold text-lg transition-all flex-shrink-0 whitespace-nowrap
            ${isActive ? "text-gray-700 hover:text-[#005BA8]" : "text-gray-700 hover:text-[#005BA8]"}
          `}
                    style={isActive ? { color: "#005BA8" } : {}}
                  >
                    {/* Icon with blue filter when active */}
                    <img
                      src={toAbsoluteUrl(tab.img)}
                      alt={tab.label}
                      className="w-6 h-6 transition-all duration-300"
                      style={{
                        filter: isActive
                          ? "invert(26%) sepia(95%) saturate(1685%) hue-rotate(192deg) brightness(93%) contrast(101%)"
                          : "invert(50%) sepia(0%) saturate(0%)",
                      }}
                    />

                    {/* Label */}
                    <span className="max-w-[300px]">{tab.label}</span>

                    {/* Bottom underline */}
                    <span
                      className={`absolute left-0 -bottom-[1px] h-[4px] w-full transition-all duration-300
              ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
                      style={{ backgroundColor: "#005BA8" }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Arrow Button */}
            <button
              onClick={() => {
                const container = document.getElementById("tabs-container");
                container.scrollBy({ left: 200, behavior: "smooth" });
              }}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all"
              aria-label="Scroll right"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Dynamic Template Cards */}
          {templatesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : templates.length > 0 ? (
            <div className="space-y-4">
              {templates
                .filter((template) => {
                  const selectedTab = tabs.find((tab) => tab.key === activeTab);
                  if (!selectedTab) return true;
                  const tabName = selectedTab.nameEnglish;
                  if (
                    tabName === "Chef Agency Theme" &&
                    template.type === "Type 8"
                  ) {
                    return false;
                  }
                  if (
                    tabName === "Outside Agency Theme" &&
                    template.type === "Type 3"
                  ) {
                    return false;
                  }
                  if (
                    tabName === "Labour Agency Theme" &&
                    template.type === "Type 8"
                  ) {
                    return false;
                  }

                  if (
                    tabName === "Raw Material Theme" &&
                    template.type === "Type 6"
                  ) {
                    return false;
                  }
                  // for arroma new type 
if (template.type === "Type 19" || template.type === "Type 20") {
  if (location.pathname.includes("/menu-preparation/")) {
    return false;
  }
  if (!location.pathname.includes("master/custom-package")) {
    return false;
  }
}
 // Aroma Caterers (userId 359) requirement: in Custom Package mode,
if (mode === "package" && String(userId) === "359") {
  if (template.type !== "Type 19" && template.type !== "Type 20") {
    return false;
  }
}


                  if (allowedTemplateIds === null) return true;

                  if (allowedTemplateIds.size > 0)
                    return allowedTemplateIds.has(template.templateMasterId);

                  // if (allowedTemplateIds.size > 0) return allowedTemplateIds.has(template.id);

                  return false;
                })
                .map((template) => {
                  const isActive = selectedCard === template.id;

                  return (
                    <div
                      key={template.id}
                      className={`
            flex items-center gap-6 bg-white rounded-xl  
            border-2 ${isActive ? "border-[#005BA8]" : "border-gray-200"}
            shadow-sm hover:shadow-md transition-all duration-300
          `}
                    >
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden">
                        {template.frontPage ? (
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                            <img
                              src={toAbsoluteUrl("/media/icons/reportcard.png")}
                              alt={template.name || "Template"}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        ) : (
                          <img
                            src={toAbsoluteUrl("/media/icons/reportcard.png")}
                            alt="Template"
                            className="w-12 h-12 object-contain"
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3
                          className={`text-base font-bold ${
                            isActive ? "text-[#005BA8]" : "text-gray-800"
                          }`}
                        >
                          {template.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {template.description}
                        </p>
                      </div>

                      <div className="flex-shrink-0 pe-3">
                        <button
                          className="btn btn-primary px-6 h-[50px] w-[200px] text-md rounded-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport(template);
                          }}
                        >
                          <FormattedMessage
                            id="REPORTS.GENERATE_REPORT"
                            defaultMessage="Generate Report"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No templates available for this module
            </div>
          )}
        </div>
      </CustomModal>
      <MenuReport
        isModalOpen={isMenuReportOpen}
        setIsModalOpen={setIsMenuReportOpen}
        eventId={finalEventId}
        eventFunctionId={selectedFunctionIds}
        moduleId={selectedModuleId || activeTab}
        mappingId={mappingId}
        selectedTemplateId={selectedTemplateId}
        eventName={eventName}
        selectedTemplateName={selectedTemplateName}
        PartyNumber={PartyNumber}
        isNamePlateTheme={isNamePlateTheme}
        agencyType={agencyType}
        isAdminModuleReport={false}
        exclusive={isExclusive}
        mobileNumber={mobileNumber}
        catFontIds={catFontId}
        catFontSizes={catFontSize}
        itemFontIds={itemFontId}
        itemFontSizes={itemFontSize}
        sloganFontIds={sloganFontId}
        sloganFontSizes={sloganFontSize}
        preSelectedAgencyId={preSelectedAgencyId}
      />

      <CounterNameplate
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        eventId={finalEventId}
        eventFunctionId={selectedFunctionIds}
        currentlang={currentlang}
        adminTemplatemoduleId={selectedModuleId || activeTab}
        selectedTemplateId={selectedTemplateId}
        type={templateType}
      />

      <CounterNameplate
        isModalOpen={isModalOpenWithLogo}
        setIsModalOpen={setIsModalOpen}
        eventId={finalEventId}
        eventFunctionId={selectedFunctionIds}
        currentlang={currentlang}
        adminTemplatemoduleId={selectedModuleId || activeTab}
        selectedTemplateId={selectedTemplateId}
        type={templateType}
        withLogo={true}
      />
      {openNamePlateTest && (
        <MainStandyMenuReport
          isModalOpen={openNamePlateTest}
          setIsModalOpen={setOpenNamePlateTest}
          eventId={finalEventId}
          eventFunctionId={selectedFunctionIds}
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
            eventId={finalEventId}
            eventFunctionId={selectedFunctionIds}
            selectedTemplateId={selectedTemplateId}
            isTableMenuExclusive={isTableMenuExclusive}
          />
        </CustomModal>
      )}
    </>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 min-w-[120px]">
    {/* Icon */}
    {icon && <img src={icon} alt={label} className="w-5 h-5 object-contain" />}

    {/* Text */}
    <div className="flex flex-col">
      <span className=" text-black font-bold text-base">{label}</span>
      <span className="text-sm font-semibold text-gray-600">{value}</span>
    </div>
  </div>
);
