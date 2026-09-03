import { Fragment, useState } from "react";
import { Star, Heart, Play, ChefHat, HandPlatterIcon } from "lucide-react";
import { Container } from "@/components/container";
import { toAbsoluteUrl } from "@/utils/Assets";

const ImgPlaceholder = ({
  className = "",
  label = "Image",
  rounded = "rounded-2xl",
  bg = "bg-[#e8e0d8]",
}) => (
  <div
    className={`${className} ${rounded} ${bg} flex flex-col items-center justify-center gap-1.5 text-[#b0a898] select-none`}
  >
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
    {label && (
      <span className="text-[10px] font-medium tracking-wide uppercase">
        {label}
      </span>
    )}
  </div>
);

const ingredients = {
  produce: [
    { name: "Heirloom Rainbow Carrots", amount: "2.5", unit: "KG" },
    { name: "Butternut Squash (Cubed)", amount: "1.8", unit: "KG" },
    { name: "Purple Fingerling Potatoes", amount: "1.8", unit: "KG" },
  ],
  pantry: [
    { name: "Extra Virgin Olive Oil", amount: "150", unit: "ML" },
    { name: "Wildflower Honey", amount: "60", unit: "ML" },
  ],
  herbs: [
    { name: "Fresh Rosemary Sprigs", amount: "04", unit: "II" },
    { name: "Smoked Sea Salt", amount: "15", unit: "GM" },
  ],
};

const steps = [
  {
    num: 1,
    title: "Prep & Chop",
    desc: "Wash and cut all vegetables into uniform 2.5cm pieces. Ensure even sizing for consistent roasting results and beautiful presentation.",
  },
  {
    num: 2,
    title: "Seasoning & Coating",
    desc: "Combine olive oil, wildflower honey, and fresh herbs. Toss vegetables until every piece is evenly coated with the aromatic mixture.",
  },
  {
    num: 3,
    title: "Slow Roast",
    desc: "Spread in a single layer on lined baking sheets. Roast at 200°C for 35-40 minutes, turning halfway for caramelized perfection.",
  },
  {
    num: 4,
    title: "Garnish & Serve",
    desc: "Remove from oven, drizzle with remaining honey glaze, garnish with fresh rosemary and a final pinch of smoked sea salt.",
  },
];

const reviews = [
  {
    name: "Sarah M.",
    rating: 5,
    text: "The texture, flavor and not only delicious but also easy to follow",
    avatar: "SM",
    liked: false,
  },
  {
    name: "Foodie J.",
    rating: 5,
    text: "I've discovered a treasure trove of inspiring recipes that look made by meals!",
    avatar: "FJ",
    liked: true,
  },
];

const IngredientSection = ({ title, items }) => (
  <div className="mb-4">
    <div className="text-md font-bold text-orange-600 uppercase tracking-widest mb-2">
      {title}
    </div>
    {items.map((item, i) => (
      <div
        key={i}
        className="flex items-center justify-between py-1.5 border-b border-[#f3ede7] last:border-0"
      >
        <span className="text-md text-[#555] font-medium">{item.name}</span>
        <span className="text-sm text-[#1a1a1a] font-bold tabular-nums">
          {item.amount}{" "}
          <span className="text-sm text-[#999] font-normal">{item.unit}</span>
        </span>
      </div>
    ))}
  </div>
);

const StepItem = ({ num, title, desc, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all ${
      active ? "bg-[#fff4ee]" : "hover:bg-[#fdf9f6]"
    }`}
  >
    <div
      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-black mt-0.5 ${
        active ? "bg-orange-600 text-white" : "bg-[#f0e8e1] text-[#999]"
      }`}
    >
      {num}
    </div>
    <div className="flex-1 min-w-0">
      <div
        className={`text-[14px] font-bold mb-0.5 ${
          active ? "text-orange-600" : "text-[#1a1a1a]"
        }`}
      >
        {title}
      </div>
      <div className="text-[12px] text-[#999] leading-relaxed">{desc}</div>
    </div>
  </div>
);

const ItemRecipe = () => {
  const [servings, setServings] = useState(12);
  const [activeStep, setActiveStep] = useState(1);

  return (
    <Fragment>
      <Container>
        <div>
          {/* ══ HERO ══ */}
          <div className="grid grid-cols-3 gap-8 mb-10 items-start">
            {/* LEFT: title + desc + button */}
            <div className="py-4 col-span-2">
              <h1 className="font-serif text-5xl font-black text-[#1a1a1a] leading-[1.1] mb-5">
                Roasted Harvest Vegetable Medley
              </h1>
              <p className="text-[15px] text-[#999] leading-relaxed mb-8 max-w-[400px]">
                A sophisticated medley of seasonal root vegetables,
                slow-roasting with aromatic herbs and a touch of wildflower
                honey glaze. Perfect for autumn events and upscale dinner
                service.
              </p>
              <button className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl text-[15px] font-bold hover:bg-[#d03d08] transition-all shadow-lg shadow-orange-600/25 hover:-translate-y-0.5">
                Add To Event
              </button>
            </div>

            {/* RIGHT: food image + overlapping review cards */}
            <div className="relative h-[400px]">
              {/* Food image top-right */}
              <div className="absolute top-0 right-0">
                <img
                  src={toAbsoluteUrl("/media/images/banner.png")}
                  alt="Roasted Harvest Vegetable Medley"
                  className="w-[400px] h-[360px] object-contain object-right-top"
                />
              </div>

              {/* Review card 1 — bottom-left, overlapping image */}
              <div className="absolute bottom-0 left-0 w-[210px] bg-white rounded-2xl p-4 border border-[#ede8e1] shadow-xl z-999">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(reviews[0].rating)].map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      fill="#f5a623"
                      className="text-[#f5a623]"
                    />
                  ))}
                </div>
                <p className="text-[13px] text-[#555] leading-snug italic mb-3">
                  "{reviews[0].text}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-[9px] font-bold">
                      {reviews[0].avatar}
                    </div>
                    <span className="text-[12px] font-semibold text-[#444]">
                      {reviews[0].name}
                    </span>
                  </div>
                  <Heart size={14} className="text-[#ddd]" />
                </div>
              </div>

              {/* Review card 2 — bottom-right, slightly higher */}
              <div className="absolute bottom-12 right-0 w-[210px] bg-white rounded-2xl p-4 border border-[#ede8e1] shadow-xl z-999">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(reviews[1].rating)].map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      fill="#f5a623"
                      className="text-[#f5a623]"
                    />
                  ))}
                </div>
                <p className="text-[13px] text-[#555] leading-snug italic mb-3">
                  "{reviews[1].text}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-[9px] font-bold">
                      {reviews[1].avatar}
                    </div>
                    <span className="text-[12px] font-semibold text-[#444]">
                      {reviews[1].name}
                    </span>
                  </div>
                  <Heart size={14} className="text-orange-600" fill="#e8470a" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[320px]">
              <img
                src={toAbsoluteUrl("/media/images/videobg.png")}
                alt="Chef cooking"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />

              <div className="relative z-999 flex items-center justify-center">
                <button className="relative w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-[#d03d08] transition-all duration-300 z-999">
                  <Play size={24} className="text-white ml-1" fill="white" />
                </button>
              </div>
            </div>

            {/* Preparation panel — bigger fonts */}
            <div className="bg-white rounded-3xl p-5 border border-[#ede8e1] overflow-y-auto">
              <div className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-1">
                Preparation
              </div>
              <div className="text-[20px] font-black text-[#1a1a1a] mb-4">
                Step-by-Step
              </div>
              {steps.map((step) => (
                <StepItem
                  key={step.num}
                  {...step}
                  active={activeStep === step.num}
                  onClick={() => setActiveStep(step.num)}
                />
              ))}
            </div>
          </div>

          {/* ══ INGREDIENTS + CHEF TIPS ══ */}
          <div className="grid grid-cols-3 gap-4">
            {/* Ingredient List */}
            <div className="col-span-2 bg-white rounded-3xl p-6 border border-[#ede8e1]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[11px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <img
                      src={toAbsoluteUrl("/media/icons/ingredients.png")}
                      alt="Chef Marcus Thorne"
                      className="w-6 h-6 "
                    />{" "}
                    Ingredient List
                  </div>
                  <div className="text-lg font-black text-black mt-3">
                    Standard Mise en Place
                  </div>
                </div>
                <div className="text-[13px] font-semibold text-orange-600">
                  Yields {servings} Portions
                </div>
              </div>
              <IngredientSection title="Produce" items={ingredients.produce} />
              <IngredientSection title="Pantry" items={ingredients.pantry} />
              <IngredientSection
                title="Herbs & Seasoning"
                items={ingredients.herbs}
              />
            </div>

            {/* Chef Pro Tips */}
            <div className="bg-[#fdf6ed] rounded-3xl p-5 border border-[#e8d5b8]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center">
                  <ChefHat size={13} className="text-white" />
                </div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  ChefPro Tips
                </div>
              </div>
              <div className="text-[17px] font-black text-[#1a1a1a] mb-3 leading-tight">
                Mastering the Roast
              </div>
              <p className="text-sm font-italic   text-[#777] leading-relaxed mb-4">
                For optimal caramelization, ensure your vegetables are
                completely dry before tossing them with mixture oil. Moisture is
                the enemy of a perfectly crisp edge. To elevate the dish, I
                recommend glazing the medley with a crisp Chardonnay or a bright
                Pinot Noir, which cuts beautifully through the sweetness of the 
                honey.
              </p>  
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#ede8e1]">
                <img
                  src={toAbsoluteUrl("/media/images/chef.png")}
                  alt="Chef Marcus Thorne"
                  className="w-12 h-12 flex-shrink-0 rounded-full object-cover"
                />
                <div>
                  <div className="text-[13px] font-bold text-[#1a1a1a]">
                    Chef Marcus Thorne
                  </div>
                  <div className="text-[11px] text-orange-600 font-medium">
                    Executive Chef
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default ItemRecipe;
