import { useState, Fragment, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import AddTheme from "./components/AddTheme";
import { Search, X } from "lucide-react";
import {
  GetAllCustomTheme,
  GettemplatebyuserId,
  DeleteTemplate,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { usePermission } from "../../hooks/usePermission";

const ReportcustomeTheme = () => {
  const permissions = usePermission("All Themes");
  const [showMore, setShowMore] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [templateModules, setTemplateModules] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const tabContainerRef = useRef(null);

  const hasFetched = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditTheme = (theme) => {
    setEditingTheme(theme);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (tabContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll tabs left or right
  const scrollTabs = (direction) => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);

    const intervalId = setInterval(() => {
      const currentLang = localStorage.getItem("lang") || "en";
      if (currentLang !== currentLanguage) {
        setCurrentLanguage(currentLang);
      }
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  // Check scroll on mount and resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [templateModules]);

  // Get localized module name
  const getLocalizedModuleName = (module) => {
    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[currentLanguage] || "nameEnglish";
    return module[field] || module.nameEnglish || "";
  };

  useEffect(() => {
    if (!userId || hasFetched.current) return;

    hasFetched.current = true;
    fetchTemplateModules();
    fetchTemplates(userId);
  }, [userId]);

  const fetchTemplateModules = async () => {
    try {
      const response = await GettemplatebyuserId();

      if (response?.data?.success && response?.data?.data) {
        const modules = response.data.data.filter(
          (module) => module.isActive && !module.isDelete,
        );
        setTemplateModules(modules);

        // Set first module as default active tab if not set
        if (modules.length > 0 && !activeTab) {
          setActiveTab(modules[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching template modules:", error);
    }
  };

  const fetchTemplates = async (userId) => {
    setIsLoading(true);
    try {
      const response = await GetAllCustomTheme(userId);

      if (response?.data?.success && response?.data?.data) {
        setTemplateList(response.data.data);
      } else {
        setTemplateList([]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplateList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the API base URL from environment or construct it
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    return `${baseUrl}${path}`;
  };

  const getCurrentTemplates = () => {
    return templateList
      .filter((template) => template.templateModuleMaster?.id === activeTab)
      .filter((template) => {
        const name = template.name?.toLowerCase() || "";
        const module =
          template.templateModuleMaster?.nameEnglish?.toLowerCase() || "";

        return (
          name.includes(searchTerm.toLowerCase()) ||
          module.includes(searchTerm.toLowerCase())
        );
      });
  };

  const currentTemplates = getCurrentTemplates();

  const displayedThemes = showMore
    ? currentTemplates
    : currentTemplates.slice(0, 10);

  const openPDF = (theme) => {
    if (!theme.dummyPdf) {
      Swal.fire({
        title: "No PDF Available",
        text: "This template doesn't have a dummy PDF",
        icon: "info",
      });
      return;
    }

    setIsGenerating(true);
    setSelectedTheme(theme);

    const pdfFullUrl = getFullImageUrl(theme.dummyPdf || theme.namePlateBg);

    setTimeout(() => {
      setPdfUrl(pdfFullUrl);
      setIsGenerating(false);
    }, 1000);
  };

  const closeViewer = () => {
    setPdfUrl(null);
    setSelectedTheme(null);
  };

  const refreshTemplates = () => {
    const userId = localStorage.getItem("userId");
    fetchTemplateModules();
    fetchTemplates(userId);
  };

  const getTabCount = (tabId) => {
    return templateList.filter(
      (template) => template.templateModuleMaster?.id === tabId,
    ).length;
  };

  const handleDeleteTheme = async (themeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await DeleteTemplate(themeId);

        if (response?.data?.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Theme has been deleted successfully.",
            icon: "success",
          });

          refreshTemplates();
        } else {
          Swal.fire("Error!", "Failed to delete theme.", "error");
        }
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  return (
    <Fragment>
      <Container>
        <div>
          <div className="pb-4 mb-3 border-b border-gray-200">
            <Breadcrumbs items={[{ title: "Menu Reportaa Themes" }]} />
            <p className="text-sm text-gray-500 mt-1">
              Discover unique designs, crafted for your reports.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 mt-4">
              {/* 🔍 Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005BA8]"
                />

                {searchTerm && (
                  <X
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                  />
                )}
              </div>

              {/* ➕ Add Theme Button */}
              {permissions.add && (
                <button
                  className="flex items-center justify-center gap-2 bg-[#005BA8] text-white px-5 py-2 rounded-lg shadow hover:bg-[#004C8C] transition w-full sm:w-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/pushicon.png`}
                    alt="icon"
                    className="w-5 h-5"
                  />
                  Add Theme
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Tab Navigation - Outside Container to prevent overflow issues */}
          <Container>
            <div className="max-w-[1000px] mb-6">
              <div className="">
                <div
                  ref={tabContainerRef}
                  onScroll={checkScroll}
                  className="flex border-b border-gray-200 overflow-x-auto overflow-y-hidden"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {/* Dynamic tabs from API */}
                  {templateModules.map((module) => {
                    const count = getTabCount(module.id);
                    const moduleName = getLocalizedModuleName(module);

                    return (
                      <button
                        key={module.id}
                        onClick={() => {
                          setActiveTab(module.id);
                          setShowMore(false);
                        }}
                        className={`flex-shrink-0 px-4 sm:px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
                          activeTab === module.id
                            ? "text-[#005BA8] border-b-2 border-[#005BA8]"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {moduleName}
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            activeTab === module.id
                              ? "bg-[#005BA8] text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#005BA8] border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : currentTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No themes found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new theme.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#005BA8] hover:bg-[#004C8C]"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Theme
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayedThemes.map((theme, index) => (
                  <div
                    key={theme.id || index}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 relative transition-shadow duration-300 cursor-pointer group hover:shadow-lg"
                  >
                    {/* PDF View Button - Only show for themes with PDF */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-1">
                      {/* PDF View Button */}

                      {theme.dummyPdf && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPDF(theme);
                          }}
                          className="bg-white/80 hover:bg-white text-green-700 hover:text-green-900 p-2 rounded-full shadow-md transition"
                          title="View PDF"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      )}

                      {/* Edit Button */}
                      {permissions.edit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTheme(theme);
                          }}
                          className="bg-white/80 hover:bg-white text-[#005BA8] hover:text-[#004C8C] p-2 rounded-full shadow-md transition"
                          title="Edit Theme"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {/* Delete Button */}
                      {permissions.delete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTheme(theme.id);
                          }}
                          className="bg-white/80 hover:bg-white text-red-600 hover:text-red-800 p-2 rounded-full shadow-md transition"
                          title="Delete Theme"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22m-5-3H6a1 1 0 00-1 1v2h14V5a1 1 0 00-1-1z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="h-[250px] w-full overflow-hidden bg-gray-100">
                      {theme.isNamePlate && theme.namePlateBg ? (
                        <img
                          src={getFullImageUrl(theme.namePlateBg)}
                          alt={theme.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : theme.frontPage ? (
                        <img
                          src={getFullImageUrl(theme.frontPage)}
                          alt={theme.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="h-20 w-20 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-4 text-center bg-white">
                      <h3 className="text-[17px] font-semibold text-[#002D62] leading-snug tracking-wide">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {theme.templateModuleMaster?.nameEnglish || "N/A"}
                      </p>
                      {!theme.dummyPdf && !theme.isNamePlate && (
                        <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          No PDF Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {currentTemplates.length > 10 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="bg-[#005BA8] text-white px-6 py-2 rounded-full shadow hover:bg-[#004C8C] transition"
                  >
                    {showMore ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </>
          )}

          {/* PDF Viewer Modal */}
          {selectedTheme && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 gap-2">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-[#002D62]">
                      {selectedTheme.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedTheme.templateModuleMaster?.nameEnglish}
                    </p>
                  </div>
                  <button
                    onClick={closeViewer}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition"
                    title="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#005BA8] border-t-transparent mb-4"></div>
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  ) : pdfUrl ? (
                    <embed
                      src={pdfUrl}
                      className="w-full h-full border-0"
                      title={`PDF Viewer - ${selectedTheme.name}`}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <AddTheme
            isModalOpen={isModalOpen}
            setIsModalOpen={(value) => {
              setIsModalOpen(value);
              if (!value) {
                setIsEditMode(false);
                setEditingTheme(null);
              }
            }}
            refreshData={refreshTemplates}
            isEditMode={isEditMode}
            editingTheme={editingTheme}
          />
        </div>
      </Container>
    </Fragment>
  );
};

export default ReportcustomeTheme;
