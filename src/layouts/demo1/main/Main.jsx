import { Fragment, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Outlet, useLocation } from "react-router";
import { useIntl } from "react-intl";
import { useMenuCurrentItem } from "@/components/menu";
import { Footer, Header, Sidebar, useDemo1Layout } from "../";
import { useMenus } from "@/providers";

const Main = () => {
  const intl = useIntl();
  const { layout } = useDemo1Layout();
  const { pathname } = useLocation();
  const { getMenuConfig } = useMenus();
  const menuConfig = getMenuConfig("primary");
  const menuItem = useMenuCurrentItem(pathname, menuConfig);

  const getPageTitle = (menuItems, pathname) => {
    if (!Array.isArray(menuItems)) return ""; // guard against undefined/null

    for (const item of menuItems) {
      if (item.path === pathname) {
        if (typeof item.title === "string") return item.title;
        if (item.title?.props?.id) {
          return intl.formatMessage({
            id: item.title.props.id,
            defaultMessage: item.title.props.defaultMessage,
          });
        }
        return item.pageName ?? "";
      }
      if (item.children) {
        const found = getPageTitle(item.children, pathname);
        if (found) return found;
      }
    }
    return "";
  };

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add("demo1");
    if (layout.options.sidebar.fixed) bodyClass.add("sidebar-fixed");
    if (layout.options.sidebar.collapse) bodyClass.add("sidebar-collapse");
    if (layout.options.header.fixed) bodyClass.add("header-fixed");

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove("demo1");
      bodyClass.remove("sidebar-fixed");
      bodyClass.remove("sidebar-collapse");
      bodyClass.remove("header-fixed");
    };
  }, [layout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add("layout-initialized");
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      document.body.classList.remove("layout-initialized");
      clearTimeout(timer);
    };
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>{getPageTitle(menuConfig, pathname)}</title>{" "}
      </Helmet>
      <Sidebar />
      <div className="wrapper flex grow flex-col">
        <Header />
        <main className="grow content pt-5" role="content">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </Fragment>
  );
};

export { Main };
