import { Fragment } from "react";
import { Container } from "@/components/container";

import { toAbsoluteUrl } from "@/utils/Assets";
import {
  Compass,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router";

export default function RecipePortal() {
  const navigate = useNavigate();
  const cuisines = [
    {
      name: "Gujarati Cuisines",
      desc: "Vibrant flavors rooted in Gujarat's rich culinary heritage.",
      count: 18,
      image: "/media/images/recipe1.png",
    },
    {
      name: "Maharashtrian Cuisines",
      desc: "Signature flavors inspired by Maharashtra's rich culinary legacy.",
      count: 34,
      image: "/media/images/recipe2.png",
    },
    {
      name: "Punjabi Cuisines",
      desc: "Curated Punjabi signatures with bold and indulgent character.",
      count: 40,
      image: "/media/images/recipe3.png",
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* ── HERO ── */}
        <div className="flex bg-white border border-[#ece8e0] rounded-2xl mb-6 overflow-hidden min-h-[340px] w-full">
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-4 px-10 py-10">
            <h1 className="font-serif text-[40px] font-black leading-[1.1] text-[#1a1a1a]">
              Welcome to Your
              <br />
              Exclusive
              <br />
              <span className="text-[#e8470a]">Recipe Portal</span>
            </h1>

            <p className="text-[18px] text-[#444] leading-[1.75] font-light">
              Elevate your culinary services with a world of{" "}
              <span className="text-[#e8470a] font-medium">Indian</span> and{" "}
              <span className="text-[#e8470a] font-medium">International</span>{" "}
              cuisines, meticulously curated for high-end events.
              <br />
              <br />
              Master your{" "}
              <span className="text-[#e8470a] font-medium">
                Raw Material Planning
              </span>{" "}
              and{" "}
              <span className="text-[#e8470a] font-medium">
                Quantity Estimations
              </span>{" "}
              with precision. Scale your operations efficiently from intimate
              private dinners to massive wedding banquets.
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              <button
                className="inline-flex items-center gap-2 px-6 py-[11px] bg-[#e8470a] text-white rounded-full text-sm font-semibold shadow-[0_4px_14px_rgba(232,71,10,0.28)] hover:bg-[#d13d06] hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  navigate("/recipe/explorerecipe");
                }}
              >
                <Compass size={16} /> Explore Recipes
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-[11px] bg-white text-[#1a1a1a] border border-[#d0cac0] rounded-full text-sm font-semibold hover:border-[#e8470a] hover:text-[#e8470a] transition-all">
                <CalendarDays size={16} /> Browse by Event Type
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden flex-none w-[380px] bg-gradient-to-br from-[#f07230] to-[#e8470a] rounded-r-2xl">
            <img
              src={toAbsoluteUrl(`/media/images/recipedashboard.png`)}
              alt="Recipe"
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        </div>

        {/* ── VAULT ── */}
        <div className="pt-4 pb-3">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-[21px] font-bold text-[#1a1a1a]">
              Explore our Global Recipe Vault
            </h2>
            <a
              href="#"
              className="text-[13px] text-[#e8470a] font-medium hover:underline"
            >
              <span className="flex items-center gap-1">
                View entire Vault <ChevronRight size={14} />
              </span>
            </a>
          </div>

          <div className="overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-[#ece8e0] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#e8470a] [&::-webkit-scrollbar-thumb]:rounded">
            <div className="flex gap-6 overflow-x-auto pb-4">
              {cuisines.map((c, i) => (
                <div
                  key={i}
                  className="group relative flex-none w-[380px] h-[390px] rounded-3xl overflow-hidden border border-gary shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Background Image */}
                  <img
                    src={toAbsoluteUrl(c.image)}
                    alt={c.name}
                    className="w-full h-[250px] object-cover"
                  />

                  <div
                    className="absolute bottom-0  bg-white/10 backdrop-blur-sm
 
  left-0 right-0  rounded-t-3xl p-6"
                  >
                    <h3 className="text-2xl text-white text-center font-extrabold leading-tight ">
                      {c.name}
                    </h3>
                    <p className="text-[#b35a00] text-lg font-semibold mt-6 mb-4">
                      {c.desc}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-3  bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-semibold">
                        <Menu size={18} />
                        {c.count}
                      </span>

                      <span className="flex items-center gap-3  text-gray-900 px-1 py-1 rounded-full text-sm font-semibold">
                        Explore <ChevronRight size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA BANNER ── */}
        <div className=" mt-5 mb-4 bg-[#fff8f3] border border-[#fcd5b8] rounded-2xl px-9 py-7 flex items-center justify-between gap-5 flex-wrap">
          <div>
            <div className="font-serif text-[22px] font-bold text-[#1a1a1a] mb-1">
              Ready to begin your journey?
            </div>
            <div className="text-sm text-[#666] font-light">
              Join a community dedicated to the pursuit of culinary excellence.
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-8 py-3 bg-[#e8470a] text-white rounded-full text-[15px] font-semibold shadow-[0_4px_14px_rgba(232,71,10,0.28)] hover:bg-[#d13d06] hover:-translate-y-0.5 transition-all whitespace-nowrap">
            <RefreshCw size={15} /> Begin Exploration
          </button>
        </div>
      </Container>
    </Fragment>
  );
}
