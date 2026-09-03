import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

const ReportThemes = () => {
  const [showMore, setShowMore] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const themes = [
    { title: "Elegant – Wedding", img: "/images/report-theme1.png" },
    { title: "Basic – Dark", img: "/images/report-theme2.png" },
    { title: "Classic – Event", img: "/images/report-theme3.png" },
    { title: "Outdoor – Elegant", img: "/images/report-theme1.png" },
    { title: "Luxury – Banquet", img: "/images/report-theme2.png" },
    { title: "Rustic – Party", img: "/images/report-theme3.png" },
    { title: "Luxury – Banquet", img: "/images/report-theme2.png" },
    { title: "Rustic – Party", img: "/images/report-theme3.png" },
  ];

  const allThemes = showMore ? [...themes, ...themes] : themes;

  // ✅ Navigate to Editor Page on Card Click
  const handleCardClick = (theme) => {
    navigate("/report-themes/editor", { state: { theme } });
  };

  // ✅ Generate PDF
  const generatePDF = async (theme) => {
    setIsGenerating(true);
    setSelectedTheme(theme);

    try {
      // Load jsPDF dynamically if not already loaded
      if (!window.jspdf) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const { jsPDF } = window.jspdf;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFontSize(24);
      pdf.setTextColor(0, 91, 168);
      pdf.text("Report Theme Preview", 105, 20, { align: "center" });

      pdf.setFontSize(18);
      pdf.setTextColor(51, 51, 51);
      pdf.text(theme.title, 105, 35, { align: "center" });

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = function () {
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - 80;

        let imgWidth = maxWidth;
        let imgHeight = (img.height * maxWidth) / img.width;

        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (img.width * maxHeight) / img.height;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = 50;

        pdf.addImage(img, "PNG", x, y, imgWidth, imgHeight);

        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setIsGenerating(false);
      };

      img.onerror = function () {
        console.error("Failed to load image");
        setIsGenerating(false);
        alert("Failed to load image. Please check the image path.");
      };

      img.src = theme.img;
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
      alert("Error generating PDF. Please try again.");
    }
  };

  const closeViewer = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setSelectedTheme(null);
  };

  return (
    <Fragment>
      <Container className="flex flex-col min-h-screen">
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs items={[{ title: "Menu Report Themes" }]} />
          <p className="text-sm text-gray-500 mt-1">
            Discover unique designs, crafted for your reports.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {allThemes.map((theme, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(theme)} // ✅ Navigate to editor on click
              className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 relative transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              {/* View Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when clicking View PDF
                  generatePDF(theme);
                }}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-[#005BA8] hover:text-[#004C8C] p-2 rounded-full shadow-md transition"
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

              {/* Image */}
              <div className="h-[180px] sm:h-[220px] md:h-[250px] w-full overflow-hidden">
                <img
                  src={theme.img}
                  alt={theme.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Title */}
              <div className="px-5 py-4 text-center bg-white">
                <h3 className="text-[17px] font-semibold text-[#002D62] leading-snug tracking-wide">
                  {theme.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowMore(!showMore)}
            className="bg-[#005BA8] text-white px-6 py-2 rounded-full shadow hover:bg-[#004C8C] transition"
          >
            {showMore ? "Show Less" : "Show More"}
          </button>
        </div>
      </Container>

      {/* PDF Viewer Modal */}
      {selectedTheme && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] sm:h-[90vh] overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm sm:text-lg font-semibold text-[#002D62] truncate pr-2">
                {selectedTheme.title}
              </h3>
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

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#005BA8] border-t-transparent mb-4"></div>
                  <p className="text-gray-600">Generating PDF...</p>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={`PDF Viewer - ${selectedTheme.title}`}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ReportThemes;
