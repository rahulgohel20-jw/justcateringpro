import { Link, Outlet } from "react-router-dom";
import { Fragment } from "react";
import { toAbsoluteUrl } from "@/utils";
import useBodyClasses from "@/hooks/useBodyClasses";
import { AuthBrandedLayoutProvider } from "./AuthBrandedLayoutProvider";
const Layout = () => {
  // Applying body classes to manage the background color in dark mode
  useBodyClasses("dark:bg-coal-500");
  return (
    <Fragment>
      <style>
        {/* {`
          .branded-bg {
            background-image: url('${toAbsoluteUrl("/images/login_img.png")}');
          }
          .dark .branded-bg {
            background-image: url('${toAbsoluteUrl("/images/login_img.png")}');
          }
        `} */}
      </style>
      <div className="grid lg:grid-cols-2 grow">
        <div className="relative lg:rounded-xl w-full   order-1 lg:order-1  flex items-center justify-center">
          {/* Logo top-left */}

          {/* Center Card */}
          <div className="  w-full px-8 py-10 md:pb-0 text-center rounded-sm flex flex-col items-center justify-center">
            {/* Heading */}
            <h3 className="text-3xl font-semibold text-black mb-2">
              Welcome to <span className="text-[#005BA8]">Just Catering</span>
            </h3>

            {/* Subheading */}
            <p className="text-md text-gray-800 mb-3">
              One platform. Total control. Complete automation.
            </p>

            {/* Image */}
            <img
              src={toAbsoluteUrl("/images/login_img.png")}
              alt="Just Catering Illustration"
              className="w-[500px]  mb-3 md:hidden sm:hidden lg:flex"
            />

            {/* Description */}
            <p className="text-md text-gray-700 leading-relaxed px-5 md:hidden sm:hidden lg:block">
              Streamline your kitchen operations, manage orders efficiently, and
              grow your hospitality business with our{" "}
              <span className="font-semibold">all-in-one digital solution</span>
              .
            </p>
          </div>
        </div>

        <div className=" flex justify-center flex-col items-center p-4 md:p-0 lg:p-10 order-2 lg:order-2">
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
