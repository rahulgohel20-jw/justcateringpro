import { useEffect, useRef, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { toAbsoluteUrl } from "@/utils";
import { GetRawmaterialItemByRecipe } from "@/services/apiServices";





const extractImageUrl = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const match = raw.match(/imagePath=([^,)]+)/g);
  if (!match) return null;
  // Get the last imagePath= match (the item's own path, not nested entity paths)
  const last = match[match.length - 1];
  const url = last.replace("imagePath=", "").trim();
  if (!url || url === "null" || url === "" || !/\.(jpg|jpeg|png|webp|gif)/i.test(url)) return null;
  return url;
};


const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = match ? match[1] : null;
  if (!videoId) return "";

  const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const listParam = listMatch ? `&list=${listMatch[1]}` : "";

  return `https://www.youtube.com/embed/${videoId}${listParam}`;
};

const ShowMenuItems = ({ isOpen, onClose, item }) => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const autoSlideRef = useRef(null);

  const videoEmbedUrl = getYoutubeEmbedUrl(item?.url || item?.video);

  // ✅ MOVE THESE UP — before any useEffect that references them
  const rawImages = Array.isArray(item?.imagePath)
    ? item.imagePath
    : item?.imagePath
    ? [item.imagePath]
    : [];

  const imageUrls = rawImages.map(extractImageUrl).filter(Boolean);
  const displayImages = imageUrls.length > 0
    ? imageUrls
    : [toAbsoluteUrl("/media/menu/noImage.jpg")];

  // ✅ Now useEffects can safely reference displayImages
  useEffect(() => {
    setCurrentSlide(0);
    const menuItemId = item?.menuItemId;
    if (menuItemId) {
      fetchRawMaterials(menuItemId);
    } else {
      setRawMaterials([]);
    }
  }, [item]);

  useEffect(() => {
    if (displayImages.length <= 1 || isZoomed) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % displayImages.length);
    }, 3000);
    return () => clearInterval(autoSlideRef.current);
  }, [displayImages.length, isZoomed]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const fetchRawMaterials = async (menuItemId) => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      const isSync = false;

      const response = await GetRawmaterialItemByRecipe(
        menuItemId,
        userId,
        isSync,
      );

     

      const rawMaterialsArray =
        response?.data?.data?.menuItemRawMaterials || [];

      if (rawMaterialsArray.length > 0) {
        setRawMaterials(rawMaterialsArray);
        
      } else {
        setRawMaterials([]);
        console.warn("No raw materials found in response");
      }
    } catch (error) {
      console.error("Error fetching raw materials:", error);
      setRawMaterials([]);
    }
  };

  const handleModalClose = () => {
  
    onClose();
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={handleModalClose}
      title="Item Details"
      width={700}
      footer={[]}
    >
      <div className="w-full px-4 py-5">
        {/* Image Section */}
      <div className="relative mx-auto w-full max-w-[560px] rounded-xl overflow-hidden shadow-md bg-gray-100">
  {/* Zoom overlay backdrop */}
  {isZoomed && (
    <div
      className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center"
      onClick={() => setIsZoomed(false)}
    >
      <div
        className="relative w-[90vw] max-w-[800px] h-[80vh] overflow-hidden rounded-xl cursor-zoom-out"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomPos({ x: 50, y: 50 })}
      >
        <img
          src={displayImages[currentSlide]}
          alt="Zoomed"
          className="w-full h-full object-contain transition-transform duration-150"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: "scale(2.5)",
          }}
        />
        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsZoomed(false)}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
        >
          ✕
        </button>
        {/* Zoom hint */}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          Move mouse to pan · Click outside to close
        </span>
      </div>
    </div>
  )}

  {/* Main slide image */}
  <div
    className="relative w-full h-[260px] cursor-zoom-in overflow-hidden"
    onClick={() => setIsZoomed(true)}
    title="Click to zoom"
  >
    <img
      src={displayImages[currentSlide]}
      alt={`${item?.menuItemName} ${currentSlide + 1}`}
      className="w-full h-full object-cover transition-all duration-500"
    />

  </div>

  {/* Prev / Next arrows — only when multiple images */}
  {displayImages.length > 1 && (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clearInterval(autoSlideRef.current);
          setCurrentSlide((p) => (p - 1 + displayImages.length) % displayImages.length);
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary  text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition z-10"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clearInterval(autoSlideRef.current);
          setCurrentSlide((p) => (p + 1) % displayImages.length);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary  text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition z-10"
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {displayImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearInterval(autoSlideRef.current);
              setCurrentSlide(idx);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "bg-white scale-125" : "bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Counter */}
      <span className="absolute bottom-3 left-3 bg-primary text-white text-xs px-2 py-0.5 rounded-full z-10">
        {currentSlide + 1} / {displayImages.length}
      </span>

      {/* Auto-slide progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-10">
        <div
          key={currentSlide}
          className="h-full bg-white"
          style={{ animation: "slideProgress 3s linear forwards" }}
        />
      </div>
    </>
  )}

  {/* Label */}
  <span className="absolute bottom-3 right-3 bg-primary text-white text-xs px-3 py-1 rounded-full z-10">
{item?.decoreItemName || item?.decoreItemId ? "Decor Item" : "Menu Item"}  </span>

  {/* CSS for progress bar animation */}
  <style>{`
    @keyframes slideProgress {
      from { width: 0%; }
      to   { width: 100%; }
    }
  `}</style>
</div>

        {/* Content Section */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {item?.menuItemName}
          </h2>

          {item?.itemSlogan && (
            <p className="mt-2 text-gray-600 text-sm sm:text-base italic">
              “{item.itemSlogan}”
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200" />

        {/* Raw Materials */}
        

        {/* Raw Materials */}
{rawMaterials.length > 0 && (
  <div className="max-w-[560px] mx-auto">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      Raw Materials Used
    </h3>
    <div className="flex flex-wrap gap-2">
      {rawMaterials.map((rm) => (
        <span
          key={rm.id}
          className="px-3 py-1 rounded-full text-sm bg-blue-50 text-[#005BA8] border border-[#005BA8]"
        >
          {rm.rawMaterial?.nameEnglish}
        </span>
      ))}
    </div>
  </div>
)}

{/* Video */}
{videoEmbedUrl && (
  <div className="max-w-[560px] mx-auto mt-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      Video
    </h3>
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
      <iframe
        src={videoEmbedUrl}
        title={`${item?.menuItemName || "Item"} Video`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)}

{/* Empty State */}
{rawMaterials.length === 0 && (
  <div className="text-center text-gray-500 text-sm mt-6">
    No raw materials available for this item.
  </div>
)}

       
      </div>
    </CustomModal>
  );
};

export default ShowMenuItems;
