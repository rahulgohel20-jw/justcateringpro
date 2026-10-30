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
    default: "/images/just-catering-diwali-logo-sidebar.gif",
    monogram: "/images/monogram-diwali.gif",
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
    default: "/images/logo.svg",
    monogram: "/images/monogram.svg",
    defaultWhite: "/images/logo_white.svg",
    monogramWhite: "/images/monogram_white.svg",
  },
};

const getLogoSet = () => LOGO_MAP[getSoftType()] || LOGO_MAP.jcx;

// Shared sizing so every monogram sits in the same square box
const DEFAULT_LOGO = "default-logo h-auto max-w-none transition-all";
const MONOGRAM = "small-logo size-[60px] object-contain shrink-0 transition-all";

const SidebarHeader = forwardRef((props, ref) => {
  const { layout } = useDemo1Layout();
  const logos = getLogoSet();

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={toAbsoluteUrl(logos.default)}
          alt="Logo"
          className={`${DEFAULT_LOGO} w-[220px]`}
        />
        <img
          src={toAbsoluteUrl(logos.monogram)}
          alt="Logo"
          className={MONOGRAM}
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={toAbsoluteUrl(logos.defaultWhite)}
          alt="Logo"
          className="default-logo h-[40px] max-w-none transition-all"
        />
        <img
          src={toAbsoluteUrl(logos.monogramWhite)}
          alt="Logo"
          className={MONOGRAM}
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={toAbsoluteUrl(logos.defaultWhite)}
        alt="Logo"
        className="default-logo h-[40px] max-w-none transition-all"
      />
      <img
        src={toAbsoluteUrl(logos.monogramWhite)}
        alt="Logo"
        className={MONOGRAM}
      />
    </Link>
  );

  return (
    <div
      ref={ref}
      className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0 transition-all
                 [.sidebar-collapse_&]:justify-center [.sidebar-collapse_&]:px-0"
      style={{ minHeight: 90 }}
    >
      {layout.options.sidebar.theme === "light" ? lightLogo() : darkLogo()}
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };