import { Fragment, useState } from "react";
import { Pencil, Trash2, Plus, Images, Film } from "lucide-react";
import AddPortfolio from "./AddPortfolio";
import { Container } from "@/components/container";

const CATEGORY_COLORS = {
  "Fine Dining": "bg-amber-100 text-amber-800",
  "Rustic Weddings": "bg-orange-100 text-orange-800",
  "Corporate Events": "bg-blue-100 text-blue-800",
  "Private Parties": "bg-pink-100 text-pink-800",
  "Outdoor Events": "bg-green-100 text-green-800",
};

const PLACEHOLDER_SWATCHES = [
  "#2d5a27", "#1a3a14", "#4a7c3f", "#0d2a08",
  "#8b5e3c", "#5c3d22", "#c9a96e",
];

const SEED_PORTFOLIOS = [];


const PortfolioCard = ({ portfolio, onDelete, onEdit }) => {
  const swatches = portfolio.swatches || PLACEHOLDER_SWATCHES.slice(0, 4);
  const extra = portfolio.extraCount || 0;
  const photoCount = portfolio.photoCount || 0;
  const videoCount = portfolio.videoCount || 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col transition hover:shadow-lg hover:-translate-y-0.5 group">
      {/* Cover image */}
      <div className="relative">
        <img
          src={portfolio.coverImg}
          alt={portfolio.portfolioName}
          className="w-full h-44 object-cover"
        />
        {/* Category badge */}
        {portfolio.category && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide ${
              CATEGORY_COLORS[portfolio.category] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            {portfolio.category}
          </span>
        )}
        {/* Media count badge */}
        {videoCount > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Film size={10} /> {videoCount}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-bold text-gray-900 text-sm">{portfolio.portfolioName}</h3>
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">
          {portfolio.description}
        </p>

        {/* Color swatches row */}
        <div className="flex items-center gap-1.5 mt-2">
          {swatches.map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
          {extra > 0 && (
            <span className="text-[11px] font-semibold text-gray-500 ml-0.5">
              +{extra}
            </span>
          )}
        </div>

        {/* Photo count */}
        <div className="flex items-center gap-3 mt-1">
          {photoCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Images size={12} />
              <span>{photoCount} Photos</span>
            </div>
          )}
          {videoCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Film size={12} />
              <span>{videoCount} Videos</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          onClick={() => onEdit?.(portfolio)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition p-1.5 rounded-md hover:bg-gray-100"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(portfolio.id)}
          className="flex items-center gap-1 text-red-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};


const EmptyState = ({ onCreatePortfolio }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-5">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 bg-primary/10 rounded-2xl" />
      <div className="absolute bottom-0 right-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
        <Images size={22} className="text-white" />
      </div>
      <div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
        <Plus size={14} className="text-primary" strokeWidth={3} />
      </div>
    </div>

    <div className="text-center space-y-2">
      <h3 className="text-lg font-bold text-gray-900">No Portfolios Yet</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
        Create your first gallery portfolio to showcase your culinary artistry.
        Your editorial layout will appear here.
      </p>
    </div>

    <button
      onClick={onCreatePortfolio}
      className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition shadow-md"
    >
      <Plus size={16} strokeWidth={3} /> Create Gallery Portfolio
    </button>
  </div>
);


export default function Portfolio() {
  const [portfolios, setPortfolios] = useState(SEED_PORTFOLIOS);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = (id) =>
    setPortfolios((prev) => prev.filter((p) => p.id !== id));

  const handleSave = (data) => {
    const imageFiles = (data.mediaFiles || []).filter((f) => f.kind === "image");
    const videoFiles = (data.mediaFiles || []).filter((f) => f.kind === "video");

    const coverImg =
      imageFiles[0]?.preview ||
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80";

 
    const swatchPalette = [
      "#2d5a27", "#1a3a14", "#4a7c3f", "#0d2a08",
      "#8b5e3c", "#5c3d22", "#c9a96e", "#3d1f0a",
    ];
    const swatches = swatchPalette.slice(0, Math.min(4, imageFiles.length + 2));
    const extra = Math.max(0, imageFiles.length - 4);

    const newPortfolio = {
      id: Date.now(),
      portfolioName: data.portfolioName || "New Portfolio",
      category: data.category || "",
      description: data.description || "A curated collection of our finest work.",
      coverImg,
      swatches,
      extraCount: extra,
      photoCount: imageFiles.length,
      videoCount: videoFiles.length,
    };

    setPortfolios((prev) => [...prev, newPortfolio]);
  };

  return (
    <Fragment>
      <Container>
        <div>
       
          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-gray-900">Gallery Portfolio</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and showcase your work. Our editorial layout ensures your culinary
              artistry takes center stage.
            </p>
          </div>

    
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative">
            {portfolios.length === 0 ? (
              <EmptyState onCreatePortfolio={() => setModalOpen(true)} />
            ) : (
              <div className="p-5">
                <div className="grid grid-cols-3 gap-5">
                  {portfolios.map((portfolio) => (
                    <PortfolioCard
                      key={portfolio.id}
                      portfolio={portfolio}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

    
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-xl"
            >
              <Plus size={16} strokeWidth={3} /> Create Gallery Portfolio
            </button>
          </div>

          <AddPortfolio
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        </div>
      </Container>
    </Fragment>
  );
}