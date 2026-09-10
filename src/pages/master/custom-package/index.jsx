import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "../custom-package/constant";
import useStyle from "./style";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import {
  GetCustomPackageapi,
  DeleteCustomPackageapi,
  UpdateCustomPackageStatusapi,
  GetAllCustomThemeByUserId,
  CustomPackagePdf,
  GetAllFonts,
} from "@/services/apiServices";
import { Modal, Select, Button } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
import MenuReport from "../../../partials/modals/menu-report/MenuReport";

const getLangCode = (lang) => {
  switch (lang) {
    case "hindi":
      return 1;
    case "regional":
      return 2;
    default:
      return 0;
  }
};

const languageOptions = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "regional", label: "Gujarati" },
];

const FONT_SIZE_OPTIONS = [
  { value: -1, label: "Default" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
  { value: 11, label: "11" },
  { value: 12, label: "12" },
  { value: 14, label: "14" },
  { value: 16, label: "16" },
  { value: 18, label: "18" },
  { value: 20, label: "20" },
  { value: 22, label: "22" },
  { value: 23, label: "23" },
  { value: 24, label: "24" },
  { value: 26, label: "26" },
];

const CustomPackageMaster = () => {
  const permissions = usePermission("Menu Packages");
  const classes = useStyle();
  const navigate = useNavigate();
  const intl = useIntl();
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [customPackageTemplateId, setCustomPackageTemplateId] = useState(null);
  const pdfPlugin = defaultLayoutPlugin();

  // --- Font selection state ---
  const [fontList, setFontList] = useState([]);
  const [isFontModalVisible, setIsFontModalVisible] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const [catFontId, setCatFontId] = useState(-1);
  const [itemFontId, setItemFontId] = useState(-1);
  const [sloganFontId, setSloganFontId] = useState(-1);
  const [catFontSize, setCatFontSize] = useState(-1);
  const [itemFontSize, setItemFontSize] = useState(-1);
  const [sloganFontSize, setSloganFontSize] = useState(-1);
const [isSelectReportOpen, setIsSelectReportOpen] = useState(false);
const [isMenuReportOpen, setIsMenuReportOpen] = useState(false);   // NEW
const [menuReportTemplate, setMenuReportTemplate] = useState(null);
const [loadingTable, setLoadingTable] = useState(false);
  // Fetch the template ID for "Custome Package Theme" once on mount
 

  // Fetch fonts for the dropdowns once on mount
  const fetchFonts = async () => {
    try {
      const res = await GetAllFonts();
      const fonts = res?.data?.data || res?.data || [];
      setFontList(fonts);
    } catch (err) {
      console.error("Failed to fetch fonts:", err);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const getTranslatedName = (item) => {
    switch (intl.locale) {
      case "hi": return item.nameHindi || item.nameEnglish || "-";
      case "gu": return item.nameGujarati || item.nameEnglish || "-";
      default:   return item.nameEnglish || "-";
    }
  };

  const fontOptions = [
    { value: -1, label: "Default" },
    ...fontList.map((f) => ({
      value: f.id ?? f.fontId,
      label: f.fontName || f.name,
    })),
  ];


const handleDownloadPdf = (packageId) => {
  setSelectedPackageId(packageId);
  setIsSelectReportOpen(true);
};
const handlePackageTemplateSelect = (template) => {
  const templateId = template.id;
  setCustomPackageTemplateId(templateId);
  setIsSelectReportOpen(false);

// For arroma report 
  if (template.type === "Type 19" || template.type === "Type 20") {
    setMenuReportTemplate(template);
    setIsMenuReportOpen(true);
    return;
  }

  fetchFonts();
  setSelectedLanguage("english");
  setCatFontId(-1);
  setItemFontId(-1);
  setSloganFontId(-1);
  setCatFontSize(-1);
  setItemFontSize(-1);
  setSloganFontSize(-1);
  setIsFontModalVisible(true);
};
  // Step 2: user confirms fonts -> build full payload and generate PDF
  // Step 2: user confirms fonts -> build full payload and generate PDF
const generatePdf = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    Swal.fire("Error", "User ID not found!", "error");
    return;
  }

 const payload = {
  adminTemplateId: customPackageTemplateId || 0,
  catFontId: catFontId ?? 0,
  catFontSize: catFontSize ?? 0,
  customPackageId: selectedPackageId || 0,
  itemFontId: itemFontId ?? 0,
  itemFontSize: itemFontSize ?? 0,
  lang: getLangCode(selectedLanguage),
  sloganFontId: sloganFontId ?? 0,
  sloganFontSize: sloganFontSize ?? 0,
  userId: Number(userId),
};
  try {
    setLoadingPdf(true);
    setPdfUrl("");
    setIsFontModalVisible(false);
    setIsPdfModalVisible(false);

    const response = await CustomPackagePdf(payload);

    if (response?.data?.fileUrl) {
      setPdfUrl(response.data.fileUrl + `?t=${Date.now()}`);
      setIsPdfModalVisible(true);
    } else {
      Swal.fire("Error", "PDF not available.", "error");
    }
  } catch (error) {
    console.error("PDF load error:", error);
    Swal.fire("Error", "Failed to load PDF.", "error");
  } finally {
    setLoadingPdf(false);
  }
};

  const formatPackageData = (packages) => {
    return packages.map((pkg, index) => {
      const totalItemsCount =
        pkg.customPackageDetails?.reduce((sum, menu) => {
          return sum + (menu.customPackageMenuItemDetails?.length || 0);
        }, 0) || 0;

      return {
        sr_no: index + 1,
        packageid: pkg.id,
        package_name: getTranslatedName(pkg),
        price: pkg.price,
        total_items: totalItemsCount,
        sequence: pkg.sequence,
        isActive: pkg.isActive,
        raw: pkg,
      };
    });
  };

 const fetchPackages = async () => {
  setLoadingTable(true);
  try {
    const Id = localStorage.getItem("userId");
    if (!Id) {
      Swal.fire("Error", "User ID not found!", "error");
      return;
    }

    const res = await GetCustomPackageapi(Id);
    const allPackages = res?.data?.data?.["Package Details"] || [];

    setOriginalData(allPackages);

    const formatted = formatPackageData(allPackages);
    setTableData(formatted);
  } catch (err) {
    console.error("Failed to fetch packages:", err);
    Swal.fire("Error", "Failed to fetch package data.", "error");
  } finally {
    setLoadingTable(false);
  }
};  

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (originalData.length > 0) {
      const formatted = formatPackageData(originalData);
      setTableData(formatted);
    }
  }, [intl.locale]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        const formatted = formatPackageData(originalData);
        setTableData(formatted);
        return;
      }

      const filtered = originalData.filter((pkg) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (pkg.nameEnglish &&
            pkg.nameEnglish.toLowerCase().includes(searchLower)) ||
          (pkg.nameHindi &&
            pkg.nameHindi.toLowerCase().includes(searchLower)) ||
          (pkg.nameGujarati &&
            pkg.nameGujarati.toLowerCase().includes(searchLower))
        );
      });

      const formatted = formatPackageData(filtered);
      setTableData(formatted);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData, intl.locale]);

  const deletePackage = async (packageid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await DeleteCustomPackageapi(packageid);

          if (
            response?.data?.success === true ||
            response?.success ||
            response?.status === 200
          ) {
            Swal.fire({
              title: "Deleted!",
              text: "Custom package removed successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });

            await fetchPackages();
          } else {
            Swal.fire({
              title: "Delete Failed",
              text: response?.data?.msg || "Failed to delete package.",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Delete error:", error);
          Swal.fire({
            title: "Error",
            text:
              error?.response?.data?.msg || "An error occurred while deleting.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/master/custom-package/addpackage?id=${id}`);
  };

  const statusHandler = async (packageid, isActive) => {
    try {
      const response = await UpdateCustomPackageStatusapi(packageid, isActive);

      if (response?.data?.success === true) {
        await fetchPackages();
        Swal.fire({
          title: "Updated!",
          text: "Status updated successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response?.data?.msg || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      Swal.fire("Error", error.message || "Failed to update status", "error");

      setTableData((prev) =>
        prev.map((pkg) =>
          pkg.packageid === packageid ? { ...pkg, isActive: !isActive } : pkg,
        ),
      );
    }
  };

  return (
    <Fragment>
      <Container>
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_PACKAGE"
              defaultMessage="Menu Package Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_PACKAGE",
                  defaultMessage: "Search Package",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/master/custom-package/addpackage")}
                title="Add Package"
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

       {loadingTable ? (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    <span className="ml-3 text-sm text-gray-500">Loading packages…</span>
  </div>
) : (
  <TableComponent
    columns={columns(
      handleEdit,
      deletePackage,
      statusHandler,
      permissions,
      handleDownloadPdf,
    )}
    data={tableData}
    paginationSize={10}
  />
)}

        {/* Font Selection Modal */}
        <Modal
          title="Select Fonts for PDF"
          open={isFontModalVisible}
          onCancel={() => setIsFontModalVisible(false)}
          width={700}
          footer={[
            <Button key="cancel" onClick={() => setIsFontModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="generate"
              type="primary"
              loading={loadingPdf}
              onClick={generatePdf}
              className="bg-primary hover:bg-primary"
            >
              Generate PDF
            </Button>,
          ]}
        >
          <div className="space-y-6">
            {/* Language selector — button row, matches MenuReport pattern */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Select Language
              </label>
              <div className="flex border rounded-lg overflow-hidden shadow-sm">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.value)}
                    className={`flex-1 py-2.5 font-medium transition ${
                      selectedLanguage === lang.value
                        ? "bg-[#005BA8] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font family selectors */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Category Font Family
                </label>
                <Select
                  className="w-full"
                  value={catFontId ?? undefined}
                  onChange={(val) => setCatFontId(val)}
                  options={fontOptions}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Item Font Family
                </label>
                <Select
                  className="w-full"
                  value={itemFontId ?? undefined}
                  onChange={(val) => setItemFontId(val)}
                  options={fontOptions}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Slogan Font Family
                </label>
                <Select
                  className="w-full"
                  value={sloganFontId ?? undefined}
                  onChange={(val) => setSloganFontId(val)}
                  options={fontOptions}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
            </div>

            {/* Font size selectors */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Category Font Size
                </label>
                <Select
                  className="w-full"
                  value={catFontSize ?? -1}
                  onChange={(val) => setCatFontSize(val)}
                  options={FONT_SIZE_OPTIONS}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Item Font Size
                </label>
                <Select
                  className="w-full"
                  value={itemFontSize ?? -1}
                  onChange={(val) => setItemFontSize(val)}
                  options={FONT_SIZE_OPTIONS}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Slogan Font Size
                </label>
                <Select
                  className="w-full"
                  value={sloganFontSize ?? -1}
                  onChange={(val) => setSloganFontSize(val)}
                  options={FONT_SIZE_OPTIONS}
                  getPopupContainer={(trigger) => trigger.parentNode}
                />
              </div>
            </div>
          </div>
        </Modal>
<SelectMenureport
  eventId={null}
  isSelectMenureport={isSelectReportOpen}
  setIsSelectMenuReport={setIsSelectReportOpen}
  mode="package"
  customPackageId={selectedPackageId}
  onPackageTemplateSelect={handlePackageTemplateSelect}
/>

{isMenuReportOpen && (
  <MenuReport
    isModalOpen={isMenuReportOpen}
    setIsModalOpen={setIsMenuReportOpen}
    eventId={null}
    eventFunctionId={-1}
    moduleId={menuReportTemplate?.moduleId}
    mappingId={menuReportTemplate?.mappingId}
    selectedTemplateId={menuReportTemplate?.id}
    selectedTemplateName={menuReportTemplate?.name}
    isNamePlateTheme={false}
    isAdminModuleReport={false}
    exclusive={true}
    customPackageId={selectedPackageId}
    customPackageTemplateMasterId={menuReportTemplate?.templateMasterId}
  />
)}
        {/* PDF Preview Modal */}
        <Modal
          title="Package Report"
          open={isPdfModalVisible}
          onCancel={() => setIsPdfModalVisible(false)}
          width="70%"
          footer={null}
        >
          <div style={{ height: "80vh" }}>
            {pdfUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>
      </Container>
    </Fragment>
  );
};

export default CustomPackageMaster;