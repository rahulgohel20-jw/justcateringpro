import { useState, useEffect, useRef, Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Search, X } from "lucide-react";
import { GetAllCustomTheme } from "@/services/apiServices";
import Swal from "sweetalert2";

const ThemeViewer = ({
  title,
  description,
  filterKeyword,   
  isNameplate,    
  badgeLabel,
  badgeDarkColor, 
}) => {
  const [showMore, setShowMore]       = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pdfUrl, setPdfUrl]           = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");

  const userId      = localStorage.getItem("userId");
  const hasFetched  = useRef(false);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    hasFetched.current = true;
    fetchTemplates();
  }, [userId]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await GetAllCustomTheme(userId);
      if (response?.data?.success && response?.data?.data) {
        let data = response.data.data;

        // ── filter by nameplate flag ──
        if (isNameplate) {
          data = data.filter((t) => t.isNamePlate === true);
        }

        // ── filter by module name keyword ──
        if (filterKeyword) {
          data = data.filter((t) =>
            t.templateModuleMaster?.nameEnglish
              ?.toUpperCase()
              .includes(filterKeyword.toUpperCase())
          );
        }

        setTemplateList(data);
      } else {
        setTemplateList([]);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
      setTemplateList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_API_BASE_URL || ""}${path}`;
  };

  const filteredTemplates = templateList.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedThemes = showMore
    ? filteredTemplates
    : filteredTemplates.slice(0, 10);

  const openPDF = (theme) => {
    if (!theme.dummyPdf) {
      Swal.fire({ title: "No PDF Available", text: "This template doesn't have a dummy PDF", icon: "info" });
      return;
    }
    setIsGenerating(true);
    setSelectedTheme(theme);
    setTimeout(() => {
      setPdfUrl(getFullImageUrl(theme.dummyPdf));
      setIsGenerating(false);
    }, 1000);
  };

  const closeViewer = () => {
    setPdfUrl(null);
    setSelectedTheme(null);
  };

  return (
    <Fragment>
      <Container>
        <div>
          {/* ── Header ── */}
          <div className="pb-4 mb-3 border-b border-gray-200">
            <Breadcrumbs items={[{ title }]} />
            <p className="text-sm text-gray-500 mt-1">{description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 mt-4">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${badgeLabel} themes...`}
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

              
            </div>
          </div>

          {/* ── Loading ── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#005BA8] border-t-transparent mb-4" />
                <p className="text-gray-600">Loading {badgeLabel} themes...</p>
              </div>
            </div>

          /* ── Empty ── */
          ) : filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {badgeLabel} themes found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? `No results for "${searchTerm}"` : `No ${badgeLabel} themes available.`}
                </p>
              </div>
            </div>

          /* ── Grid ── */
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayedThemes.map((theme, index) => (
                  <div
                    key={theme.id || index}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 relative transition-shadow duration-300 cursor-pointer group hover:shadow-lg"
                  >
                    {/* Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeDarkColor}`}>
  {badgeLabel}
</span>
                    </div>

                    {/* PDF button */}
                    {theme.dummyPdf && (
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); openPDF(theme); }}
                          className="bg-white/80 hover:bg-white text-green-700 hover:text-green-900 p-2 rounded-full shadow-md transition"
                          title="View PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Image */}
                    <div className="h-[250px] w-full overflow-hidden bg-gray-100">
                      {theme.namePlateBg ? (
                        <img src={getFullImageUrl(theme.namePlateBg)} alt={theme.name} className="w-full h-full object-cover object-center" />
                      ) : theme.frontPage ? (
                        <img src={getFullImageUrl(theme.frontPage)} alt={theme.name} className="w-full h-full object-cover object-center" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-5 py-4 text-center bg-white">
                      <h3 className="text-[17px] font-semibold text-[#002D62] leading-snug tracking-wide">
                        {theme.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {theme.templateModuleMaster?.nameEnglish || "N/A"}
                      </p>
                      {!theme.dummyPdf && (
                        <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          No PDF Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length > 10 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="bg-[#005BA8] text-white px-6 py-2 rounded-full shadow hover:bg-[#004C8C] transition"
                  >
                    {showMore ? "Show Less" : `Show More (${filteredTemplates.length - 10} more)`}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PDF Modal ── */}
          {selectedTheme && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-[#002D62]">{selectedTheme.name}</h3>
                    <p className="text-sm text-gray-500">{selectedTheme.templateModuleMaster?.nameEnglish}</p>
                  </div>
                  <button onClick={closeViewer} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#005BA8] border-t-transparent mb-4" />
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  ) : pdfUrl ? (
                    <embed src={pdfUrl} className="w-full h-full border-0" title={`PDF - ${selectedTheme.name}`} />
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Fragment>
  );
};

export default ThemeViewer;