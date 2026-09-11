import { useEffect, useState } from "react";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import NamePlateReport from "./NamePlateReport";
import { GetAllfunctioneventbyid } from "@/services/apiServices";
import {
  AddExclusiveReport,
  GetReportConfiguration,
  GetAgenciesForReportFilter,
  GetSelectedItemsForReportFilter,
} from "@/services/apiServices";
import { successMsgPopup, errorMsgPopup } from "../../../underConstruction";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const CrockeryCutleryReportModal = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  eventFunctionId,
  moduleId,
  mappingId,
  selectedTemplateId,
  eventName,
  PartyNumber,
  selectedTemplateName,
  isNamePlateTheme,
  startDate: adminStartDate,
  endDate: adminEndDate,
  agencyType,
  isAdminModuleReport = false, // ✅ NEW PROP
}) => {
  const pdfPlugin = defaultLayoutPlugin();
  const userId = localStorage.getItem("userId");

  const [visibleOptions, setVisibleOptions] = useState([]);
  const [reportType, setReportType] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [options, setOptions] = useState({});
  const [showNamePlateUI, setShowNamePlateUI] = useState(false);
  const [isDropdownStatus, setisDropdownStatus] = useState();
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [eventFunctions, setEventFunctions] = useState([]);
  const [selectedFunctionIds, setSelectedFunctionIds] = useState([]);
  const [isDateStatus, setisDateStatus] = useState();

  // Filter states
  const [agencies, setAgencies] = useState([]);
  const [items, setItems] = useState([]);

  const [selectedAgency, setSelectedAgency] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(false);

  const SIZE_LABELS = {
    size1: "A4",
    size2: "A6",
  };

  /* ---------------- FETCH CONFIG ---------------- */
  useEffect(() => {
    if (!isModalOpen || !eventId) return;

    const fetchEventFunctions = async () => {
      try {
        const res = await GetAllfunctioneventbyid(eventId);
        const data = res?.data?.data?.["Event Function Details"];

        if (Array.isArray(data) && data.length > 0) {
          setEventFunctions(data);
          setSelectedFunctionIds(data.map((fn) => fn.id)); // ✅ Pre-select ALL
        } else {
          setEventFunctions([]);
          setSelectedFunctionIds([]);
        }
      } catch (err) {
        console.error("Event function fetch error", err);
        setEventFunctions([]);
        setSelectedFunctionIds([]);
      }
    };

    fetchEventFunctions();
  }, [isModalOpen, eventId]);
  useEffect(() => {
    if (!isModalOpen || !mappingId) return;

    const fetchConfig = async () => {
      try {
        const res = await GetReportConfiguration(mappingId, moduleId);
        const config = res?.data?.data?.[0];
        if (!config) return;

        setReportType(config.type);

        // ✅ UPDATED LOGIC: Hide agency/item dropdowns for Admin Module
        if (isAdminModuleReport || agencyType == null) {
          setisDropdownStatus(0);
          setShowAgencyDropdown(false);
          setShowItemDropdown(false);
        } else if (config.isAgency === 1 && config.isItem === 1) {
          setisDropdownStatus(1);
          setShowAgencyDropdown(config.isAgency === 1);
          setShowItemDropdown(config.isItem === 1);
        } else if (config.isAgency === 1) {
          setisDropdownStatus(1);
          setShowAgencyDropdown(config.isAgency === 1);
        } else if (config.isItem === 1) {
          setisDropdownStatus(1);
          setShowItemDropdown(config.isItem === 1);
        }
        if (config.isDate === 1) {
          setisDateStatus(1);
        }

        setOptions({
          categorySlogan: config.isCategorySlogan === 1, // ✅ consistent: 1 = enabled
          categoryInstruction: config.isCategoryInstruction === 1,
          categoryImage: config.isCategoryImage === 1,
          itemSlogan: config.isItemSlogan === 1,
          itemInstruction: config.isItemInstruction === 1,
          CompanyInfo: config.isCompanyDetails === 1,
          companyLogo: config.isCompanyLogo === 1,
          itemImage: config.isItemImage === 1,
          isCombo: config.isCombo === 1,
          partyDetails: config.isPartyDetails === 1,
          isWithQty: config.isWithQty === 1,
          size1: {
            label: config.size1,
            enabled: Boolean(config.size1 === 1),
          },
          size2: {
            label: config.size2,
            enabled: Boolean(config.size2 === 0),
          },
          isWithPrice: config.isWithPrice === 1,
          isContactNoVisible: config.isContactNoVisible === 1, 
          isSignatureVisible: config.isSignatureVisible === 0 , 
          isAddMenu: config.isAddMenu === 0,
          showLastPage: config.showLastPage === 0,
          isAdvancePayment : config.isAdvancePayment === 0,
          isNotes : config.isNotes == 0,
          showAddOnLabel : config.showAddOnLabel === 0,
          withOutBg : config.withOutBg === 0,
          withVendor : config.withVendor === 0,
          isAllItemTogether : config.isAllItemTogether === 0,
        });

        setVisibleOptions(
          Object.entries({
            CompanyInfo: config.isCompanyDetails,
            categorySlogan: config.isCategorySlogan,
            categoryInstruction: config.isCategoryInstruction,
            categoryImage: config.isCategoryImage,
            itemSlogan: config.isItemSlogan,
            itemInstruction: config.isItemInstruction,
            companyLogo: config.isCompanyLogo,
            itemImage: config.isItemImage,
            isCombo: config.isCombo,
            partyDetails: config.isPartyDetails,
            isWithQty: config.isWithQty,
            size1: config.size1 === 1 ? 1 : 0,
            size2: config.size2 === 1 ? 1 : 0,
            isWithPrice: config.isWithPrice,
            isContactNoVisible: config.isContactNoVisible,
            isSignatureVisible: config.isSignatureVisible,
            isAddMenu: config.isAddMenu,
            isAdvancePayment: config.isAdvancePayment,
            isNotes : config.isNotes,
            showLastPage: config.showLastPage,
            showAddOnLabel: config.showAddOnLabel,
            withOutBg: config.withOutBg,
            withVendor: config.withVendor,
            isAllItemTogether:config.isAllItemTogether,
          })
            .filter(([_, value]) => value === 1)
            .map(([key]) => key),
        );
      } catch (err) {
        console.error("Config fetch error", err);
      }
    };

    fetchConfig();
  }, [isModalOpen, mappingId, moduleId, isAdminModuleReport, agencyType]);

  /* ---------------- FETCH AGENCIES (INITIAL LOAD) ---------------- */
  useEffect(() => {
    // ✅ Don't fetch agencies if this is Admin Module Report
    if (!isModalOpen || isDropdownStatus !== 1 || isAdminModuleReport) return;

    const fetchAgencies = async () => {
      setLoadingFilters(true);
      try {
        // ✅ Fetch agencies with empty partyIds initially
        const userId = localStorage.getItem("userId");
        const agencyRes = await GetAgenciesForReportFilter(
          eventFunctionId,
          eventId,
          agencyType,
          userId,
        );

        if (agencyRes?.data?.success && agencyRes?.data?.data) {
          const agencyList = agencyRes.data.data;

          setAgencies(agencyList);

          const allAgencyIds = agencyList.map((a) => a.id);
          setSelectedAgency(allAgencyIds);
        } else {
          setAgencies([]);
          setSelectedAgency([]);
        }
      } catch (err) {
        console.error("Agency fetch error", err);
        errorMsgPopup("Failed to load agencies");
        setAgencies([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchAgencies();
  }, [
    isModalOpen,
    isDropdownStatus,
    eventFunctionId,
    eventId,
    agencyType,
    isAdminModuleReport,
  ]);

  /* ---------------- FETCH ITEMS (WHEN AGENCY CHANGES) ---------------- */
  useEffect(() => {
    if (
      !isModalOpen ||
      isDropdownStatus !== 1 ||
      selectedAgency.length === 0 ||
      isAdminModuleReport
    ) {
      setItems([]);
      setSelectedItems([]);
      return;
    }

    const fetchItemsByAgency = async () => {
      setLoadingFilters(true);
      try {
    

        const itemsRes = await GetSelectedItemsForReportFilter(
          eventFunctionId,
          eventId,
          selectedAgency, 
        );

        if (itemsRes?.data?.success && itemsRes?.data?.data) {
          setItems(itemsRes.data.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Items fetch error", err);
        errorMsgPopup("Failed to load items");
        setItems([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchItemsByAgency();
  }, [
    isModalOpen,
    isDropdownStatus,
    eventFunctionId,
    eventId,
    selectedAgency,
    isAdminModuleReport,
  ]);

  const formatAdminDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const toggleAll = (checked) => {
    setOptions((prev) => {
      const updated = { ...prev };

      visibleOptions.forEach((key) => {
        if (key !== "size1" && key !== "size2") {
          updated[key] = checked;
        }
      });

      return updated;
    });
  };

  const toggleOne = (key) => {
    setOptions((prev) => {
      // Handle mutually exclusive sizes
      if (key === "size1") {
        return {
          ...prev,
          size1: {
            ...prev.size1,
            enabled: true,
          },
          size2: {
            ...prev.size2,
            enabled: false,
          },
        };
      }

      if (key === "size2") {
        return {
          ...prev,
          size1: {
            ...prev.size1,
            enabled: false,
          },
          size2: {
            ...prev.size2,
            enabled: true,
          },
        };
      }

      // Normal toggle for other options
      return { ...prev, [key]: !prev[key] };
    });
  };

  const isCheckAll =
    visibleOptions.length > 0 && visibleOptions.every((key) => options[key]);

  const formatDate = (date) => {
    if (!date) return null;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleReport = async () => {
    if (isNamePlateTheme) {
      setShowNamePlateUI(true);
      return;
    }

    const pageSize = options.size1?.enabled
      ? options.size1.label
      : options.size2?.enabled
        ? options.size2.label
        : "";

    const payload = {
      eventId,
      eventFunctionIds: selectedFunctionIds,
      eventFunctionId: eventFunctionId ?? -1,
      adminTemplateModuleId: selectedTemplateId ?? 0,
      type: reportType || null,
      userId,
      lang:
        selectedLanguage === "english"
          ? 0
          : selectedLanguage === "hindi"
            ? 1
            : 2,
      isCategoryImage: options.categoryImage,
      isCategoryInstruction: options.categoryInstruction,
      isCategorySlogan: options.categorySlogan,
      isItemImage: options.itemImage,
      isCombo: options.isCombo,
      isItemInstruction: options.itemInstruction,
      isItemSlogan: options.itemSlogan,
      isCompanyDetails: options.CompanyInfo,
       isContactNoVisible: options.isContactNoVisible,
       isAddMenu: options.isAddMenu,
       isAdvancePayment: options.isAdvancePayment,
       showAddOnLabel: options.showAddOnLabel,
       withOutBg: options.withOutBg,
       withVendor: options.withVendor,
       isAllItemTogether:options.isAllItemTogether,
       isNotes : options.isNotes,
       showLastPage : option.showLastPage,
       isSignatureVisible: options.isSignatureVisible,
      isCompanyLogo: options.companyLogo,
      isPartyDetails: options.partyDetails,
      isWithQty: options.isWithQty,
      pageSize,
      isWithPrice: options.isWithPrice,
      agencyId: selectedAgency,
      itemId: selectedItems,
      ...(adminStartDate && {
        startDate: formatAdminDate(adminStartDate),
      }),
      ...(adminEndDate && {
        endDate: formatAdminDate(adminEndDate),
      }),
    };

    if (!payload.eventId || !payload.adminTemplateModuleId) {
      errorMsgPopup("Missing required data");
      return;
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // ✅ Sends as eventFunctionIds[]=1&eventFunctionIds[]=2&...
        value.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(
          key,
          value === true ? "1" : value === false ? "0" : value,
        );
      }
    });
    setLoading(true);
    try {
      const { data } = await AddExclusiveReport(formData);
      if (data?.success && data?.report_path) {
        successMsgPopup(data?.msg || "Report generated");
        setPdfUrl(data?.report_path);
      } else {
        errorMsgPopup(data?.msg || "Failed to generate report");
      }
    } catch (err) {
      errorMsgPopup(err?.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPdfUrl(null);
    setShowNamePlateUI(false);
    setIsModalOpen(false);
    // Reset filters
    setSelectedAgency([]);
    setSelectedItems([]);
    setStartDate(null);
    setEndDate(null);
  };

  const handleWhatsAppShare = (pdfUrl) => {
    const name = eventName || "there";
    const mobile = PartyNumber || "";
    if (!mobile) return alert("Mobile number not available");

    const message = `Hi ${name},\nPlease find the attached PDF.\n\n${pdfUrl}`;
    window.open(
      `https://web.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <CustomModal
      open={isModalOpen}
      title={selectedTemplateName || "Report"}
      onClose={handleClose}
      width={900}
      footer={
        pdfUrl ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Close
            </button>
            <button
              onClick={() => handleWhatsAppShare(pdfUrl)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Share on WhatsApp
            </button>
          </div>
        ) : (
          <button
            onClick={handleReport}
            disabled={loading}
            className={`px-6 py-2 text-white rounded transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#005BA8] hover:bg-[#004a8d]"
            }`}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        )
      }
    >
      {showNamePlateUI ? (
        <NamePlateReport onClose={() => setShowNamePlateUI(false)} />
      ) : !pdfUrl ? (
        <div className="space-y-6">
          {/* Language Selector */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Select Language
            </label>
            <div className="flex border rounded-lg overflow-hidden shadow-sm">
              {["english", "hindi", "gujarati"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex-1 py-2.5 font-medium transition ${
                    selectedLanguage === lang
                      ? "bg-[#005BA8] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Function Dropdown */}

          {/* Function Dropdown - Multi Select */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Select Function
            </label>

            <Select
              mode="multiple"
              value={selectedFunctionIds}
              onChange={(values) => {
                if (values.length === 0) {
                  setSelectedFunctionIds(eventFunctions.map((fn) => fn.id));
                } else {
                  setSelectedFunctionIds(values);
                }
              }}
              placeholder="Select functions..."
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="label"
              options={eventFunctions.map((fn) => ({
                value: fn.id,
                label: fn.function?.nameEnglish || "-",
              }))}
              maxTagCount="responsive"
              allowClear={false} // ✅ Disable clear button — use "Deselect All" link instead
            />
          </div>

          {/* ✅ UPDATED: Only show filter section if NOT admin module report */}
          {!isAdminModuleReport &&
            (isDateStatus === 1 || showAgencyDropdown || showItemDropdown) && (
              <div className=" p-5 rounded-xl border-2 ">
                <div className="grid grid-cols-2 gap-4">
                  {/* Dropdowns */}
                  {showAgencyDropdown && (
                    <>
                      <div className="relative">
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          <TeamOutlined className="mr-1" />
                          Agency
                        </label>
                        <Select
                          mode="multiple"
                          value={selectedAgency}
                          onChange={setSelectedAgency}
                          placeholder="Select agencies..."
                          className="w-full custom-select"
                          size="large"
                          loading={loadingFilters}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={agencies.map((agency) => ({
                            value: agency.id,
                            label: agency.nameEnglish,
                          }))}
                          maxTagCount="responsive"
                          allowClear
                        />
                      </div>

                      {showItemDropdown && (
                        <div className="relative">
                          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                            <AppstoreOutlined className="mr-1" />
                            Items
                          </label>
                          <Select
                            mode="multiple"
                            value={selectedItems}
                            onChange={setSelectedItems}
                            placeholder="Select items..."
                            className="w-full custom-select"
                            size="large"
                            loading={loadingFilters}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={items.map((item) => ({
                              value: item.id,
                              label: item.nameEnglish,
                            }))}
                            maxTagCount="responsive"
                            allowClear
                            disabled={selectedAgency.length === 0}
                            style={{
                              borderRadius: "8px",
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

          {/* Report Options */}
          {!isNamePlateTheme && (
            <>
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <span className="font-semibold text-gray-700">
                  Check All Options
                </span>
                <Toggle
                  checked={isCheckAll}
                  onChange={() => toggleAll(!isCheckAll)}
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {visibleOptions.map((key) => (
                  <div
                    key={key}
                    className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="capitalize text-gray-700">
                      {key === "size1" || key === "size2"
                        ? `Size ${options[key]?.label}`
                        : key.replace(/([A-Z])/g, " $1")}
                    </span>

                    <Toggle
                      checked={
                        key === "size1" || key === "size2"
                          ? options[key]?.enabled
                          : options[key]
                      }
                      onChange={() => toggleOne(key)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ height: "80vh" }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
          </Worker>
        </div>
      )}
    </CustomModal>
  );
};

export default CrockeryCutleryReportModal;
