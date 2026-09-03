import { useLanguage } from "@/i18n";
import { KeenIcon } from "@/components";
import { MenuSub } from "@/components/menu";
import { CalendarClock, Building2 } from "lucide-react";

const DropdownFollowUp = ({ menuTtemRef, followUps = [], loading = false }) => {
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
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "560px", maxHeight: "80vh" }}
      >
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900">Follow Ups</p>
              <p className="text-xs text-gray-400">Upcoming and pending client follow-ups</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <CalendarClock size={20} className="text-gray-700" />
                {followUps.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[9px] text-white font-medium">
                      {followUps.length > 9 ? "9+" : followUps.length}
                    </span>
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <KeenIcon icon="cross" className="text-sm text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : !followUps.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <CalendarClock size={28} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 font-medium">No pending follow-ups</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {followUps.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 size={15} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.eventName || "Untitled Event"}
                    </p>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {item.followupDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.managerName || "Unassigned"}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MenuSub>
  );
};

export { DropdownFollowUp };