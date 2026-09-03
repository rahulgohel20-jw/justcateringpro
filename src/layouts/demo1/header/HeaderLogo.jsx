import { Link } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import { useDemo1Layout } from "../";
const HeaderLogo = () => {
  const { setMobileSidebarOpen, setMobileMegaMenuOpen, megaMenuEnabled } =
    useDemo1Layout();
  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };
  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };
  return (
    <div className="flex gap-2 lg:hidden items-center -ms-1">
      <Link to="/" className="shrink-0">
        <img
          src={toAbsoluteUrl("/images/monogram.svg")}
          className="max-h-[25px] w-full"
          alt="Monogram"
        />
      </Link>

      <div className="flex items-center">
        <button
          type="button"
          className="btn btn-icon btn-light btn-clear btn-sm"
          onClick={handleSidebarOpen}
        >
          {/* <KeenIcon icon="menu" /> */}
          <i className="ki-filled ki-burger-menu-6"></i>
        </button>

        {megaMenuEnabled && (
          <button
            type="button"
            className="btn btn-icon btn-light btn-clear btn-sm"
            onClick={handleMegaMenuOpen}
          >
            <KeenIcon icon="burger-menu-2" />
          </button>
        )}
      </div>
    </div>
  );
};
export { HeaderLogo };
