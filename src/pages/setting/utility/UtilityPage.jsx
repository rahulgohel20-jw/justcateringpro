import { Fragment, useState, useEffect } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import {
  Input,
  Select,
  Switch,
  Button,
  Upload,
  Tooltip,
  ColorPicker,
  Modal,
  Checkbox,
  Tabs,
} from "antd";
import Swal from "sweetalert2";
import { UploadOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

import { AddUtility, GetUtility, GetActiveFonts } from "@/services/apiServices";
const { Option } = Select;

const UtilityPage = () => {
  const UserId = localStorage.getItem("userId");

  // State for form fields
  const [formData, setFormData] = useState({
    dateFormat: "",
    timeFormat: "",
    timeZone: "",
    directShare: "",
    sacNumber: "",
    counterNamePlate: "",
    pageSize: "",
    choiceOfMenu: "",
    twoLanguageDefault: "",
    twoLanguagePreferred: "",
    displayMaxPerson: false,
    adjustQuantity: false,
    displayAutoTime: false,
    editRawmaterialQuantityBeforeGenReport: false,
    fontColor: "#FE4444",
    bgColor: "#F3F4F6",
    file: null,
    user: UserId,
    catFontId: null,
    itemFontId: null,
    sloganFontId: null,
    catFontSize: null,
    itemFontSize: null,
    sloganFontSize: null,
  });

  const [fileList, setFileList] = useState([]);
  const [imdodalOpen, setImdodalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menuPreparation");
  const [loading, setLoading] = useState(false);

  const [fonts, setFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);

  const fetchFonts = async () => {
    setFontsLoading(true);
    try {
      const response = await GetActiveFonts();
      setFonts(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching fonts:", error);
    } finally {
      setFontsLoading(false);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const reportSections = {
    menuPreparation: [
      { id: 1, label: "Custom Menu Report", checked: false },
      { id: 2, label: "Simple Menu Report", checked: true },
      { id: 3, label: "Exclusive Menu Report", checked: false },
      { id: 4, label: "Slogan Menu Report", checked: false },
      { id: 5, label: "Premium Image Menu Report", checked: false },
      { id: 6, label: "Image Report With Menu", checked: false },
      { id: 7, label: "Image And Slogan Menu Report", checked: false },
    ],
    menuAllocation: [
      { id: 1, label: "Menu Allocation Report 1", checked: false },
      { id: 2, label: "Menu Allocation Report 2", checked: true },
    ],
    rawMaterialAllocation: [
      { id: 1, label: "Raw Material Report 1", checked: false },
      { id: 2, label: "Raw Material Report 2", checked: false },
    ],
    chefLabour: [
      { id: 1, label: "Chef Labour Report 1", checked: true },
      { id: 2, label: "Chef Labour Report 2", checked: false },
    ],
    labourAgency: [
      { id: 1, label: "Labour & Agency Report 1", checked: false },
      { id: 2, label: "Labour & Agency Report 2", checked: false },
    ],
    generalFix: [
      { id: 1, label: "General Fix Report 1", checked: false },
      { id: 2, label: "General Fix Report 2", checked: true },
    ],
    adminHub: [
      { id: 1, label: "Admin Hub Report 1", checked: false },
      { id: 2, label: "Admin Hub Report 2", checked: false },
    ],
  };

  const [reportConfig, setReportConfig] = useState(reportSections);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        file: null,
      }));
    }
  };

  const getUserConfig = async () => {
    try {
      setLoading(true);
      const response = await GetUtility(UserId);

      if (response.data.success && response.data.data) {
        const data = response?.data?.data;

        // Set form data from API response
        setFormData({
          dateFormat: data.dateFormat || "dd/mm/yyyy",
          timeFormat: data.timeFormat || "12",
          timeZone: data.timeZone || "asia/kolkata",
          directShare: data.directShare || "",
          sacNumber: data.sacNumber || "",
          counterNamePlate: data.counterNamePlate || "A4",
          pageSize: data.pageSize || "10",
          choiceOfMenu: data.choiceOfMenu || "",
          twoLanguageDefault: data.twoLanguageDefault || "en",
          twoLanguagePreferred: data.twoLanguagePreferred || "en",
          displayMaxPerson: data.displayMaxPerson ?? true,
          adjustQuantity: data.adjustQuantity ?? true,
          displayAutoTime: data.displayAutoTime ?? false,
          editRawmaterialQuantityBeforeGenReport:
            data.editRawmaterialQuantityBeforeGenReport ?? false,
          fontColor: data.fontColor || "#FE4444",
          bgColor: data.bgColor || "#F3F4F6",
          file: null,
          user: UserId,
          combineReportConfiguration: data.combineReportConfiguration || null,
          catFontId: data.catFontId || null,
          itemFontId: data.itemFontId || null,
          sloganFontId: data.sloganFontId || null,
          catFontSize: data.catFontSize || null,
          itemFontSize: data.itemFontSize || null,
          sloganFontSize: data.sloganFontSize || null,
        });

        // If there's a background image
        if (data.bgImage && !data.bgImage.includes("null")) {
          setFileList([
            {
              uid: "-1",
              name: "background-image.jpg",
              status: "done",
              url: data.bgImage,
            },
          ]);
        }

        // If combineReportConfiguration exists
        if (data.combineReportConfiguration) {
          const config =
            typeof data.combineReportConfiguration === "string"
              ? JSON.parse(data.combineReportConfiguration)
              : data.combineReportConfiguration;

          setReportConfig((prev) => {
            const updated = { ...prev };
            Object.keys(config).forEach((section) => {
              if (updated[section]) {
                updated[section] = updated[section].map((item) => ({
                  ...item,
                  checked: config[section].includes(item.id),
                }));
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user config:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load configuration data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (UserId) {
      getUserConfig();
    }
  }, [UserId]);

  const showModal = () => {
    setImdodalOpen(true);
  };

  const handleCancel = () => {
    setImdodalOpen(false);
  };

  const handleModalSave = () => {
    // Format the combine report configuration for API
    const combineReportConfig = Object.keys(reportConfig).reduce((acc, key) => {
      acc[key] = reportConfig[key]
        .filter((item) => item.checked)
        .map((item) => item.id);
      return acc;
    }, {});

    setFormData((prev) => ({
      ...prev,
      combineReportConfiguration: combineReportConfig,
    }));

    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Combine report configuration updated",
      timer: 2000,
      showConfirmButton: false,
    });

    setImdodalOpen(false);
  };

  const handleCheckboxChange = (section, id) => {
    setReportConfig((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.dateFormat || !formData.timeFormat || !formData.timeZone) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please fill all required fields",
        });
        return;
      }

      // Prepare data for API
      const apiData = new FormData();

      // Add all form fields
      apiData.append("dateFormat", formData.dateFormat);
      apiData.append("timeFormat", formData.timeFormat);
      apiData.append("timeZone", formData.timeZone);
      apiData.append("directShare", formData.directShare || "");
      apiData.append("sacNumber", formData.sacNumber || "");
      apiData.append("counterNamePlate", formData.counterNamePlate);
      apiData.append("pageSize", formData.pageSize);
      apiData.append("choiceOfMenu", formData.choiceOfMenu || "");
      apiData.append("twoLanguageDefault", formData.twoLanguageDefault);
      apiData.append("twoLanguagePreferred", formData.twoLanguagePreferred);
      apiData.append("displayMaxPerson", formData.displayMaxPerson);
      apiData.append("adjustQuantity", formData.adjustQuantity);
      apiData.append("displayAutoTime", formData.displayAutoTime);
      apiData.append(
        "editRawmaterialQuantityBeforeGenReport",
        formData.editRawmaterialQuantityBeforeGenReport,
      );
      apiData.append("fontColor", formData.fontColor);
      apiData.append("bgColor", formData.bgColor);
      apiData.append("user", formData.user);
      apiData.append("catFontId", formData.catFontId || -1);
      apiData.append("itemFontId", formData.itemFontId || -1);
      apiData.append("sloganFontId", formData.sloganFontId || -1);
      apiData.append("catFontSize", formData.catFontSize || -1);
      apiData.append("itemFontSize", formData.itemFontSize || -1);
      apiData.append("sloganFontSize", formData.sloganFontSize || -1);

      // Add combine report configuration as JSON string
      if (formData.combineReportConfiguration) {
        apiData.append(
          "combineReportConfiguration",
          JSON.stringify(formData.combineReportConfiguration),
        );
      }

      // Add file if exists
      if (formData.file) {
        apiData.append("file", formData.file);
      }

      // Call API
      const response = await AddUtility(apiData);

      if (response.data.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Utility settings saved successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.message || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving utility settings:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "An error occurred while saving settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: "menuPreparation",
      label: "Menu Preparation",
      children: (
        <div className="space-y-2">
          {reportConfig.menuPreparation.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() =>
                  handleCheckboxChange("menuPreparation", item.id)
                }
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "menuAllocation",
      label: "Menu Allocation",
      children: (
        <div className="space-y-2">
          {reportConfig.menuAllocation.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange("menuAllocation", item.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "rawMaterialAllocation",
      label: "Raw Material Allocation Re...",
      children: (
        <div className="space-y-2">
          {reportConfig.rawMaterialAllocation.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() =>
                  handleCheckboxChange("rawMaterialAllocation", item.id)
                }
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "chefLabour",
      label: "Chef Labour Wise Raw Mat...",
      children: (
        <div className="space-y-2">
          {reportConfig.chefLabour.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange("chefLabour", item.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "labourAgency",
      label: "Labour & Agency",
      children: (
        <div className="space-y-2">
          {reportConfig.labourAgency.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange("labourAgency", item.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "generalFix",
      label: "General Fix and Crockery A...",
      children: (
        <div className="space-y-2">
          {reportConfig.generalFix.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange("generalFix", item.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "adminHub",
      label: "Admin Hub",
      children: (
        <div className="space-y-2">
          {reportConfig.adminHub.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="text-md">{item.label}</span>
              <Checkbox
                checked={item.checked}
                onChange={() => handleCheckboxChange("adminHub", item.id)}
              />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="SETTING.UTILITY"
                    defaultMessage="Utility"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-black text-base font-semibold mb-5">
              <FormattedMessage
                id="SETTING.LOCALIZATION"
                defaultMessage="Localization"
              />
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.DATE_FORMAT"
                    defaultMessage="Date Format "
                  />
                </label>
                <Select
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                  value={formData.dateFormat}
                  onChange={(value) => handleInputChange("dateFormat", value)}
                >
                  <Option value="dd/mm/yyyy">dd/mm/yyyy</Option>
                  <Option value="mm/dd/yyyy">mm/dd/yyyy</Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.TIME_FORMAT"
                    defaultMessage="Time Format"
                  />
                </label>
                <Select
                  placeholder="12 Hour"
                  className="w-full"
                  value={formData.timeFormat}
                  onChange={(value) => handleInputChange("timeFormat", value)}
                >
                  <Option value="12">
                    <FormattedMessage
                      id="SETTING.TIME_FORMAT_12"
                      defaultMessage="12 Hour"
                    />
                  </Option>
                  <Option value="24">
                    <FormattedMessage
                      id="SETTING.TIME_FORMAT_24"
                      defaultMessage="24 Hour"
                    />
                  </Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.TIME_ZONE"
                    defaultMessage="Time Zone"
                  />
                </label>
                <Select
                  placeholder="Asia/Kolkata"
                  className="w-full"
                  value={formData.timeZone}
                  onChange={(value) => handleInputChange("timeZone", value)}
                >
                  <Option value="asia/kolkata">Asia/Kolkata</Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.DIRECT_SHARE_WHATSAPP_URL_EXPIRY"
                    defaultMessage="Direct Share WhatsApp URL Expiry In Days"
                  />
                </label>
                <Input
                  placeholder="Enter number of days"
                  type="tel"
                  min="1"
                  value={formData.directShare}
                  onChange={(e) =>
                    handleInputChange("directShare", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.SAC_NUMBER"
                    defaultMessage="SAC Number"
                  />
                </label>
                <Input
                  placeholder=""
                  value={formData.sacNumber}
                  onChange={(e) =>
                    handleInputChange("sacNumber", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-black text-base font-semibold mb-5">
              <FormattedMessage
                id="SETTING.REPORT"
                defaultMessage="Reporting"
              />
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.COUNTER_NAME_PLATE_REPORT_SIZE"
                    defaultMessage="Counter Name Plate Report Size"
                  />
                </label>
                <Select
                  placeholder="A4"
                  className="w-full"
                  value={formData.counterNamePlate}
                  onChange={(value) =>
                    handleInputChange("counterNamePlate", value)
                  }
                >
                  <Option value="A4">
                    <FormattedMessage
                      id="SETTING.COUNTER_NAME_PLATE_REPORT_SIZE_A4"
                      defaultMessage="A4"
                    />
                  </Option>
                  <Option value="A3">
                    <FormattedMessage
                      id="SETTING.COUNTER_NAME_PLATE_REPORT_SIZE_A3"
                      defaultMessage="A3"
                    />
                  </Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.PAGE_SIZE_OPTIONS"
                    defaultMessage="Page Size Options in Page Index"
                  />
                </label>
                <Select
                  placeholder="10"
                  className="w-full"
                  value={formData.pageSize}
                  onChange={(value) => handleInputChange("pageSize", value)}
                >
                  <Option value="10">
                    <FormattedMessage
                      id="SETTING.PAGE_SIZE_OPTIONS_10"
                      defaultMessage="10"
                    />
                  </Option>
                  <Option value="20">
                    <FormattedMessage
                      id="SETTING.PAGE_SIZE_OPTIONS_20"
                      defaultMessage="20"
                    />
                  </Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.CHOICE_OF_MENU_ORDER_EXECUTION"
                    defaultMessage="Choice of Menu in Order Execution Icon"
                  />
                </label>
                <Select
                  placeholder="Select option"
                  className="w-full"
                  value={formData.choiceOfMenu}
                  onChange={(value) => handleInputChange("choiceOfMenu", value)}
                >
                  <Option value="quotation">
                    <FormattedMessage
                      id="SETTING.CHOICE_OF_MENU_QUOTATION"
                      defaultMessage="Quotation"
                    />
                  </Option>
                  <Option value="invoice">
                    <FormattedMessage
                      id="SETTING.CHOICE_OF_MENU_INVOICE"
                      defaultMessage="Invoice"
                    />
                  </Option>
                  <Option value="proforma_invoice">
                    <FormattedMessage
                      id="SETTING.CHOICE_OF_MENU_PROFORMA_INVOICE"
                      defaultMessage="Proforma Invoice"
                    />
                  </Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.TWO_LANGUAGE_REPORT_DEFAULT_LANGUAGE"
                    defaultMessage="Two Language Report - Default Language"
                  />
                </label>
                <Select
                  placeholder="English (en)"
                  className="w-full"
                  value={formData.twoLanguageDefault}
                  onChange={(value) =>
                    handleInputChange("twoLanguageDefault", value)
                  }
                >
                  <Option value="en">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_DEFAULT_LANGUAGE_EN"
                      defaultMessage="English (en)"
                    />
                  </Option>
                  <Option value="gu">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_DEFAULT_LANGUAGE_GU"
                      defaultMessage="Gujarati (gu)"
                    />
                  </Option>
                  <Option value="hi">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_DEFAULT_LANGUAGE_HI"
                      defaultMessage="Hindi (hi)"
                    />
                  </Option>
                </Select>
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.TWO_LANGUAGE_REPORT_PREFERRED_LANGUAGE"
                    defaultMessage="Two Language Report - Preferred Language"
                  />
                </label>
                <Select
                  placeholder="English (en)"
                  className="w-full"
                  value={formData.twoLanguagePreferred}
                  onChange={(value) =>
                    handleInputChange("twoLanguagePreferred", value)
                  }
                >
                  <Option value="en">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_PREFERRED_LANGUAGE_EN"
                      defaultMessage="English (en)"
                    />
                  </Option>
                  <Option value="gu">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_PREFERRED_LANGUAGE_GU"
                      defaultMessage="Gujarati (gu)"
                    />
                  </Option>
                  <Option value="hi">
                    <FormattedMessage
                      id="SETTING.TWO_LANGUAGE_REPORT_PREFERRED_LANGUAGE_HI"
                      defaultMessage="Hindi (hi)"
                    />
                  </Option>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-black text-base font-semibold mb-5">
              <FormattedMessage
                id="SETTING.GENERAL_CONFIGURATION"
                defaultMessage="General Configuration"
              />
            </h3>
            <div className="space-y-4">
              {[
                {
                  field: "displayMaxPerson",
                  label: (
                    <FormattedMessage
                      id="SETTING.DISPLAY_MAX_PERSON_FUNCTION"
                      defaultMessage="Display max person Function"
                    />
                  ),
                  tooltip: (
                    <FormattedMessage
                      id="SETTING.DISPLAY_MAX_PERSON_FUNCTION_TOOLTIP"
                      defaultMessage="It will show the details of crockery and general fix raw material data"
                    />
                  ),
                },
                {
                  field: "adjustQuantity",
                  label: (
                    <FormattedMessage
                      id="SETTING.ADJUST_QUANTITY"
                      defaultMessage="Adjust Quantity"
                    />
                  ),
                  tooltip: (
                    <FormattedMessage
                      id="SETTING.ADJUST_QUANTITY_TOOLTIP"
                      defaultMessage="It will display adjusted quantity"
                    />
                  ),
                },
                {
                  field: "displayAutoTime",
                  label: (
                    <FormattedMessage
                      id="SETTING.DISPLAY_AUTO_TIME_RAW_MATERIAL"
                      defaultMessage="Display Auto Time Raw Material"
                    />
                  ),
                  tooltip: (
                    <FormattedMessage
                      id="SETTING.DISPLAY_AUTO_TIME_RAW_MATERIAL_TOOLTIP"
                      defaultMessage="It will set the raw material time according to the labour shift that you set in your function type."
                    />
                  ),
                },
                {
                  field: "editRawmaterialQuantityBeforeGenReport",
                  label: (
                    <FormattedMessage
                      id="SETTING.EDIT_RAW_MATERIAL_QUANTITY_BEFORE_GENERATING_REPORT"
                      defaultMessage="Edit Raw Material Quantity Before Generating Report"
                    />
                  ),
                  tooltip: (
                    <FormattedMessage
                      id="SETTING.EDIT_RAW_MATERIAL_QUANTITY_BEFORE_GENERATING_REPORT_TOOLTIP"
                      defaultMessage="It will allow editing the raw material quantity before generating the report."
                    />
                  ),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-md text-gray-700 break-words">
                      {item.label}
                    </span>
                    <Tooltip title={item.tooltip}>
                      <i className="ki-filled ki-information-2 cursor-pointer"></i>
                    </Tooltip>
                  </div>
                  <Switch
                    checked={formData[item.field]}
                    onChange={(checked) =>
                      handleInputChange(item.field, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h3 className="text-black text-base font-semibold mb-5">
            Font Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-md text-gray-600 mb-1">
                Category Font Family
              </label>
              <Select
                className="w-full"
                placeholder="Select font"
                value={formData.catFontId}
                onChange={(val) => handleInputChange("catFontId", val)}
                loading={fontsLoading}
                allowClear
                options={fonts.map((f) => ({
                  value: f.fontId,
                  label: f.fontName,
                }))}
              />
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Item Font Family
              </label>
              <Select
                className="w-full"
                placeholder="Select font"
                value={formData.itemFontId}
                onChange={(val) => handleInputChange("itemFontId", val)}
                loading={fontsLoading}
                allowClear
                options={fonts.map((f) => ({
                  value: f.fontId,
                  label: f.fontName,
                }))}
              />
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Slogan Font Family
              </label>
              <Select
                className="w-full"
                placeholder="Select font"
                value={formData.sloganFontId}
                onChange={(val) => handleInputChange("sloganFontId", val)}
                loading={fontsLoading}
                allowClear
                options={fonts.map((f) => ({
                  value: f.fontId,
                  label: f.fontName,
                }))}
              />
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Category Font Size
              </label>
              <Select
                className="w-full"
                placeholder="Select size"
                value={formData.catFontSize}
                onChange={(val) => handleInputChange("catFontSize", val)}
                allowClear
                options={[
                  "9",
                  "10",
                  "11",
                  "12",
                  "14",
                  "16",
                  "18",
                  "20",
                  "22",
                  "23",
                  "24",
                  "26",
                ].map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Item Font Size
              </label>
              <Select
                className="w-full"
                placeholder="Select size"
                value={formData.itemFontSize}
                onChange={(val) => handleInputChange("itemFontSize", val)}
                allowClear
                options={[
                  "9",
                  "10",
                  "11",
                  "12",
                  "14",
                  "16",
                  "18",
                  "20",
                  "22",
                  "23",
                  "24",
                  "26",
                ].map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </div>

            <div>
              <label className="block text-md text-gray-600 mb-1">
                Slogan Font Size
              </label>
              <Select
                className="w-full"
                placeholder="Select size"
                value={formData.sloganFontSize}
                onChange={(val) => handleInputChange("sloganFontSize", val)}
                allowClear
                options={[
                  "9",
                  "10",
                  "11",
                  "12",
                  "14",
                  "16",
                  "18",
                  "20",
                  "22",
                  "23",
                  "24",
                  "26",
                ].map((s) => ({
                  value: s,
                  label: s,
                }))}
              />
            </div>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-[50%] gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-black text-base font-semibold mb-5">
              <FormattedMessage
                id="SETTING.CUSTOMIZATION"
                defaultMessage="Customization"
              />
            </h3>
            <div className="md:col-span-2 flex flex-col gap-3 mb-3">
              <label className="block text-md text-gray-600 flex align-center">
                <FormattedMessage
                  id="SETTING.COMBINE_REPORT_CONFIGURATION"
                  defaultMessage="Combine Report Configuration"
                />
              </label>
              <Button
                type="default"
                onClick={showModal}
                className="bg-[#005BA8] text-white w-[100px]"
                size="large"
              >
                <FormattedMessage id="COMMON.CONFIG" defaultMessage="Config" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.FONT_COLOUR"
                    defaultMessage="Font Colour"
                  />
                </label>
                <ColorPicker
                  value={formData.fontColor}
                  onChange={(color) =>
                    handleInputChange("fontColor", color.toHexString())
                  }
                  showText
                  className="w-full border-0"
                />
              </div>
              <div>
                <label className="block text-md text-gray-600 mb-1">
                  <FormattedMessage
                    id="SETTING.BACKGROUND_COLOUR"
                    defaultMessage="Background Colour"
                  />
                </label>
                <ColorPicker
                  value={formData.bgColor}
                  onChange={(color) =>
                    handleInputChange("bgColor", color.toHexString())
                  }
                  showText
                  className="w-full border-0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-md text-gray-600 mb-2">
                  <FormattedMessage
                    id="SETTING.BACKGROUND_IMAGE"
                    defaultMessage="Background Image"
                  />
                </label>
                <div className="flex items-center gap-4">
                  <Upload
                    maxCount={1}
                    accept="image/*"
                    fileList={fileList}
                    onChange={handleFileUpload}
                    beforeUpload={() => false}
                  >
                    <Button
                      className="bg-[#005BA8] text-white"
                      size={"large"}
                      icon={<UploadOutlined />}
                    >
                      Upload
                    </Button>
                  </Upload>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="primary"
            className="bg-[#005BA8] text-white flex items-center gap-2"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSave}
            loading={loading}
          >
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          </Button>
        </div>
      </Container>

      {/* Combine Report Configuration Modal */}
      <Modal
        title="Combine Report Configuration"
        open={imdodalOpen}
        onCancel={handleCancel}
        width={1200}
        closeIcon={<CloseOutlined />}
        footer={[
          <Button key="save" onClick={handleModalSave} className="bg-gray-200">
            <SaveOutlined /> Save
          </Button>,
          <Button key="cancel" danger onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        <div className="flex gap-0">
          <Tabs
            tabPosition="left"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="w-full"
            style={{ minHeight: 400 }}
          />
        </div>
      </Modal>
    </Fragment>
  );
};

export { UtilityPage };
