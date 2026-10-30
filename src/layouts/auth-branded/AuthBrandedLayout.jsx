import { Link, Outlet } from "react-router-dom";
import { Fragment } from "react";
import { toAbsoluteUrl } from "@/utils";
import useBodyClasses from "@/hooks/useBodyClasses";
import { AuthBrandedLayoutProvider } from "./AuthBrandedLayoutProvider";

/* Small diya icon used in the Diwali wish */
const DiyaIcon = () => (
  <svg width="34" height="30" viewBox="0 0 60 52" aria-hidden="true">
    <g className="dw-flame" style={{ transformOrigin: "30px 24px" }}>
      <path d="M30 24 C20 14 27 7 30 0 C33 7 40 14 30 24 Z" fill="#FF9F1C" />
      <path d="M30 22 C25 17 29 12 30 8 C31 12 35 17 30 22 Z" fill="#FFE27A" />
    </g>
    <path d="M4 27 Q30 56 56 27 Z" fill="#B05C28" />
    <ellipse cx="30" cy="27" rx="26" ry="4" fill="#DEAA46" />
  </svg>
);

/* Thin marigold toran along the top of the panel */
const Toran = () => (
  <svg className="absolute top-0 left-0 w-full h-[34px] pointer-events-none hidden lg:block" aria-hidden="true">
    <defs>
      <pattern id="dw-toran" width="44" height="34" patternUnits="userSpaceOnUse">
        <path d="M0 3 Q22 22 44 3" fill="none" stroke="#D9A441" strokeWidth="1.2" />
        <circle cx="22" cy="15" r="6" fill="#FF8A1F" />
        <circle cx="22" cy="15" r="4" fill="#FFB52E" />
        <circle cx="22" cy="15" r="2" fill="#FFD866" />
      </pattern>
    </defs>
    <rect width="100%" height="34" fill="url(#dw-toran)" />
  </svg>
);

const DIWALI_CSS = `
  @keyframes dw-flame { 0%,100% { transform: scale(1) rotate(0); } 35% { transform: scale(1.08,.94) rotate(-3deg); } 65% { transform: scale(.94,1.08) rotate(3deg); } }
  .dw-flame { animation: dw-flame 1.8s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .dw-flame { animation: none; } }
`;

const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses("dark:bg-coal-500");
  return (
    <Fragment>
      <style>{DIWALI_CSS}</style>

      <div className="grid lg:grid-cols-2 grow">
        {/* ---------- Left: brand panel ---------- */}
        <div className="relative overflow-hidden lg:rounded-xl w-full order-1 flex items-center justify-center bg-[linear-gradient(180deg,#FFF3D4_0%,#FFFFFF_42%)] dark:bg-none">
          <Toran />

          <div className="w-full px-8 pt-12 pb-8 text-center flex flex-col items-center justify-center">
            {/* Heading */}
            <h3 className="text-3xl font-semibold text-black mb-1">
              Welcome to <span className="text-[#005BA8]">Just Catering</span>
            </h3>

            {/* Subheading */}
            <p className="text-md text-gray-800 mb-4">
              One platform. Total control. Complete automation.
            </p>



            {/* Animated Diwali illustration (transparent WebP, works in light and dark) */}
            <img
              src={toAbsoluteUrl("/images/login_img_diwali_pro.webp")}
              alt="Just Catering Diwali illustration"
              className="hidden lg:block w-auto max-h-[60vh] min-h-[240px] object-contain"
            />

            {/* Description */}
            {/* <p className="text-md text-gray-700 leading-relaxed px-5 max-w-[520px] hidden lg:block">
              Streamline your kitchen operations, manage orders efficiently, and
              grow your hospitality business with our{" "}
              <span className="font-semibold">all-in-one digital solution</span>
              .
            </p> */}

            {/* Festive note */}
            <p className="text-sm text-[#8A5A00] mt-3 max-w-[460px] hidden lg:block">
              May the festival of lights bring new opportunities, growth and
              prosperity to your business. Warm wishes from the Just Catering
              team.
            </p>
          </div>
        </div>

        {/* ---------- Right: form ---------- */}
        <div className="flex justify-center flex-col items-center p-4 md:p-0 lg:p-10 order-2">
          <Link to="/" className="ms-auto me-auto mt-auto mb-5 lg:hidden">
            <img
              src={toAbsoluteUrl("/images/monogram_white.svg")}
              className="h-[28px] max-w-none"
              alt=""
            />
          </Link>
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };