import React, { forwardRef, Fragment } from "react";
import { Link } from "react-router-dom";
import { useDemo1Layout } from "../";
import { toAbsoluteUrl } from "@/utils";
import { SidebarToggle } from "./";

const getSoftType = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return auth?.state?.user?.softType || "jcx";
  } catch {
    return "jcx";
  }
};

const LOGO_MAP = {
  jcx: {
    default: "/images/logo.svg",
    monogram: "/images/monogram.svg",
    defaultWhite: "/images/logo_white.svg",
    monogramWhite: "/images/monogram_white.svg",
  },
  justbanq: {
    default: "/images/just_banq_logo.png",
    monogram: "/images/monogram_banq.png",
    defaultWhite: "/images/just_banq_logo_white.svg",
    monogramWhite: "/images/just_banq_monogram_white.svg",
  },
  jcxpro: {
    default: "/images/jcxpro_logo.svg",
    monogram: "/images/jcxpro_monogram.svg",
    defaultWhite: "/images/jcxpro_logo_white.svg",
    monogramWhite: "/images/jcxpro_monogram_white.svg",
  },
};

const getLogoSet = () => {
  const softType = getSoftType();
  return LOGO_MAP[softType] || LOGO_MAP.jcx;
};

const SidebarHeader = forwardRef((props, ref) => {
  const { layout } = useDemo1Layout();
  const logos = getLogoSet();

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={toAbsoluteUrl(logos.default)}
          className="default-logo h-[40px] max-w-none transition-all"
        />
        <img
          src={toAbsoluteUrl(logos.monogram)}
          className="small-logo h-[36px] max-w-none transition-all"
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={toAbsoluteUrl(logos.defaultWhite)}
          className="default-logo h-[40px] max-w-none transition-all"
        />
        <img
          src={toAbsoluteUrl(logos.monogramWhite)}
          className="small-logo h-[36px] max-w-none transition-all"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={toAbsoluteUrl(logos.defaultWhite)}
        className="default-logo h-[40px] max-w-none transition-all"
      />
      <img
        src={toAbsoluteUrl(logos.monogramWhite)}
        className="small-logo h-[36px] max-w-none transition-all"
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0 transition-all"
    >
      {layout.options.sidebar.theme === "light" ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };