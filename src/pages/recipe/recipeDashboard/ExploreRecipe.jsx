import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Search, ChevronRight, Plus } from "lucide-react";

const cuisines = [
  { name: "Gujarati Cuisines",      desc: "Curated classics from Gujarat's rich culinary heritage.",          count: 18, image: "/media/images/recipe1.png" },
  { name: "Maharashtrian Cuisines", desc: "Signature flavors inspired by Maharashtra's rich culinary legacy.", count: 34, image: "/media/images/recipe2.png" },
  { name: "Punjabi Cuisines",       desc: "Curated Punjabi signatures with bold and indulgent character.",     count: 40, image: "/media/images/recipe3.png" },
  { name: "Asian Cuisines",         desc: "Authentic Pan-Asian recipes crafted with balance, flavor, and artistry.", count: 25, image: "/media/images/recipe4.png" },
  { name: "European Cuisines",      desc: "A curated selection of classic European culinary masterpieces.",    count: 19, image: "/media/images/recipe5.png" },
  { name: "Modern Indian",          desc: "A curated selection of classic European culinary masterpieces.",    count: 22, image: "/media/images/recipe1.png" },
  { name: "Classic French",         desc: "A curated selection of classic European culinary masterpieces.",    count: 31, image: "/media/images/recipe1.png" },
  { name: "South Indian",           desc: "A curated selection of classic European culinary masterpieces.",    count: 18, image: "/media/images/recipe1.png" },
  { name: "Rajasthani Cuisines",    desc: "A curated selection of classic European culinary masterpieces.",    count: 13, image: "/media/images/recipe1.png" },
  { name: "Middle Eastern",         desc: "A curated selection of classic European culinary masterpieces.",    count: 20, image: "/media/images/recipe1.png" },
  { name: "North Indian",           desc: "A curated selection of classic European culinary masterpieces.",    count: 16, image: "/media/images/recipe1.png" },
];

const CuisineCard = ({ name, desc, count, image }) => (
  <div className="relative rounded-2xl overflow-hidden cursor-pointer bg-[#1e1e1e] shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-[280px] group">
    {/* Image — replace div with <img> when ready */}
    {image ? (
      <img
        src={toAbsoluteUrl(image)}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    ) : (
      <div className="absolute inset-0 w-full h-full bg-[#2a2a2a] flex items-center justify-center text-white/10 text-xs uppercase tracking-widest">
        img
      </div>
    )}

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="font-serif text-[17px] font-bold text-white leading-tight mb-2">
        {name}
      </div>
      <div className="text-[11px] text-[#f5834a] leading-snug font-light mb-3">
        {desc}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-white font-medium">
          🍽 {count}
        </div>
        <div className="text-[11px] text-white/80 font-semibold flex items-center gap-0.5 hover:text-[#f5834a] transition-colors">
          Explore <ChevronRight size={12} />
        </div>
      </div>
    </div>
  </div>
);

const ExploreRecipe = () => {
  const [search, setSearch] = useState("");

  const filtered = cuisines.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
      <Container>

        {/* ── HEADER ── */}
        <div className="flex grid grid-cols-3 items-start justify-between mb-6">
          <div className="col-span-2 flex-1 min-w-0">
            <h1 className="font-serif text-5xl font-black leading-tight text-[#1a1a1a] mb-2">
              Explore the World's Flavors
            </h1>
            <p className="text-lg text-orange-800 font-light leading-relaxed ">
              Discover a curated collection of global cuisines, refined <br/>
              techniques, and master-crafted recipes.
            </p>

            {/* Search */}
            <div className="relative mt-4 max-w-[380px]">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a region, flavor, or ingredients..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#e0dbd2] bg-white text-sm text-[#333] placeholder-[#bbb] outline-none focus:border-[#e8470a] focus:ring-2 focus:ring-[#e8470a]/10 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Illustration placeholder — top right */}
          <div className=" rounded-2xl flex justify-end ">
            
              
              <img src={toAbsoluteUrl("/media/images/explorerecipe.png")} alt="" className="w-p[356px] h-[251px] " />
           
           
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="grid grid-cols-4 gap-4 py-8">
          {filtered.map((c, i) => (
            <CuisineCard key={i} {...c} />
          ))}

          {/* Discover More Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-[#e8d5c8] bg-[#fff8f3] flex flex-col items-center justify-center gap-3 h-[280px] cursor-pointer hover:border-[#e8470a] hover:bg-[#fff2ea] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-full bg-[#e8470a] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-center px-5">
              <div className="font-serif text-[17px] font-bold text-[#1a1a1a] mb-1">
                Discover More
              </div>
              <div className="text-[11.5px] text-[#888] leading-relaxed font-light">
                Explore our extended library of 50+ regional culinary styles.
              </div>
            </div>
            <button className="mt-1 px-5 py-2 border border-[#e8470a] text-[#e8470a] rounded-full text-xs font-semibold hover:bg-[#e8470a] hover:text-white transition-all">
              Browse All
            </button>
          </div>
        </div>

      </Container>
    </Fragment>
  );
};

export default ExploreRecipe;