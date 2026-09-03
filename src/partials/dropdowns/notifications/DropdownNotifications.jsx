import { useLanguage } from "@/i18n";
import { KeenIcon } from "@/components";
import { MenuSub } from "@/components/menu";
import { DropdownNotificationsAll } from "./DropdownNotificationsAll";
import { Bell } from "lucide-react";

const DropdownNotifications = ({ menuTtemRef }) => {
  const { isRTL } = useLanguage();

  const handleClose = () => {
    if (menuTtemRef.current) {
      menuTtemRef.current.hide();
    }
  };

  return (
    <MenuSub
      rootClassName="w-full max-w-[460px]"
      className="light:border-gray-300"
    >
      <div className="flex flex-col" style={{ height: "560px" }}>
        {/* ── Single header — lives here only ── */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900">
                Notifications
              </p>
              <p className="text-xs text-gray-400">
                Stay updated with latest features
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell size={20} className="text-gray-700" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[9px] text-white font-medium">5</span>
                </span>
              </div>
              {/* Single close button */}
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <KeenIcon icon="cross" className="text-sm text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content — no header inside ── */}
        <DropdownNotificationsAll />
      </div>
    </MenuSub>
  );
};

export { DropdownNotifications };
