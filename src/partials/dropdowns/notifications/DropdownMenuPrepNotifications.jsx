// v2 — grouped by event/function/category
import React from "react";
import { KeenIcon } from "@/components";
import { MenuSub } from "@/components/menu";
import { UtensilsCrossed, CheckCheck, Trash2, ChevronRight, Calendar, Tag } from "lucide-react";

const DropdownMenuPrepNotifications = ({
  menuItemRef,
  notifications = [],
  loading = false,
  onDismissItem,
  onClearAll,
  onEventClick,
  onItemClick,
}) => {
  const handleClose = () => {
    if (menuItemRef?.current) {
      menuItemRef.current.hide();
    }
  };

  const handleEventClick = (eventId) => {
    if (!eventId) return;
    handleClose();
    if (onEventClick) {
      onEventClick(eventId);
    } else {
      window.location.href = `/menu-preparation/${eventId}`;
    }
  };

  const handleItemClick = (item) => {
    if (!item) return;
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // Group flat enriched notifications by Event → Function → Category
  // (plain computation — no hook, component may be called as a function)
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const buildGrouped = () => {
    const map = new Map();
    safeNotifications.forEach((item) => {
      const eKey = item.eventId ?? item.eventName ?? "unknown";
      if (!map.has(eKey)) {
        map.set(eKey, {
          eventId:            item.eventId,
          eventName:          item.eventName || `Event #${item.eventId}`,
          eventStartDateTime: item.eventStartDateTime || "",
          eventEndDateTime:   item.eventEndDateTime || "",
          functions: new Map(),
        });
      }
      const eventGroup = map.get(eKey);

      const fnKey = item.eventFunctionId ?? item.functionName ?? "unknown_fn";
      if (!eventGroup.functions.has(fnKey)) {
        eventGroup.functions.set(fnKey, {
          functionName:    item.functionName || "",
          fnStartDateTime: item.fnStartDateTime || "",
          fnEndDateTime:   item.fnEndDateTime || "",
          categories: new Map(),
        });
      }
      const fnGroup = eventGroup.functions.get(fnKey);

      const catKey = item.menuCategoryId ?? item.categoryName ?? "unknown_cat";
      if (!fnGroup.categories.has(catKey)) {
        fnGroup.categories.set(catKey, { categoryName: item.categoryName || "", items: [] });
      }
      fnGroup.categories.get(catKey).items.push(item);
    });

    return Array.from(map.values()).map((e) => ({
      ...e,
      functions: Array.from(e.functions.values()).map((fn) => ({
        ...fn,
        categories: Array.from(fn.categories.values()),
      })),
    }));
  };
  const grouped = buildGrouped();

  return (
    <MenuSub
      rootClassName="w-full max-w-[480px]"
      className="light:border-gray-300 shadow-xl rounded-xl bg-white"
    >
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "540px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-gray-900">Menu Added Items</p>
                {safeNotifications.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                    {safeNotifications.length} new
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Items added/modified after menu completion
              </p>
            </div>
            <div className="flex items-center gap-2">
              {safeNotifications.length > 0 && onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-danger hover:text-danger-active font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-danger/10 transition-colors"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                title="Close"
              >
                <KeenIcon icon="cross" className="text-sm text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            <span className="text-xs text-gray-400">Loading notifications...</span>
          </div>
        ) : !safeNotifications.length ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCheck size={26} className="text-green-500" />
            </div>
            <p className="text-sm text-gray-800 font-semibold">No New Added Items</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
              No items were added or updated after menu completion.
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/30">
            {grouped.map((event, eIdx) => (
              <div key={event.eventId ?? eIdx} className="mb-4 last:mb-0">
                {/* Event Header */}
                <div
                  onClick={() => handleEventClick(event.eventId)}
                  className={`sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-gray-100/90 hover:bg-primary/10 backdrop-blur-sm border-y border-gray-200 shadow-sm transition-colors ${
                    event.eventId ? "cursor-pointer group/event" : ""
                  }`}
                  title={event.eventId ? `Go to /menu-preparation/${event.eventId}` : undefined}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={14} className="text-gray-600 group-hover/event:text-primary transition-colors flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-800 group-hover/event:text-primary transition-colors truncate">
                      {event.eventName}
                    </span>
                    {event.eventId && (
                      <span className="text-[10px] text-primary opacity-0 group-hover/event:opacity-100 transition-opacity font-semibold whitespace-nowrap ml-1 flex items-center gap-0.5">
                        <span>Open</span>
                        <ChevronRight size={11} />
                      </span>
                    )}
                  </div>
                  {event.eventStartDateTime && (
                    <span className="ml-2 text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200 whitespace-nowrap flex-shrink-0">
                      {event.eventStartDateTime}
                      {event.eventEndDateTime && ` - ${event.eventEndDateTime}`}
                    </span>
                  )}
                </div>

                <div className="px-4 py-2 bg-white">
                  {event.functions.map((fn, fnIdx) => (
                    <div key={fn.functionName || fnIdx} className="mb-4 last:mb-1">
                      {/* Function Sub-Header */}
                      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wide truncate">
                          {fn.functionName}
                        </span>
                        {fn.fnStartDateTime && (
                          <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                            {fn.fnStartDateTime}
                            {fn.fnEndDateTime && ` - ${fn.fnEndDateTime}`}
                          </span>
                        )}
                      </div>

                      <div className="pl-2 ml-1 border-l-2 border-gray-100 flex flex-col gap-3">
                        {fn.categories.map((cat, catIdx) => (
                          <div key={cat.categoryName || catIdx}>
                            {/* Category Label */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Tag size={10} className="text-blue-500 flex-shrink-0" />
                              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider truncate">
                                {cat.categoryName}
                              </span>
                            </div>

                            {/* Items */}
                            <div className="flex flex-col gap-1 pl-1">
                              {cat.items.map((item) => {
                                const id = item.notificationId;
                                return (
                                  <div
                                    key={id ?? item.menuItemId}
                                    onClick={() => handleItemClick(item)}
                                    className="group flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                                    title="Click to mark as read & open"
                                  >
                                    <div className="w-6 h-6 mt-0.5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                      <UtensilsCrossed size={12} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[13px] font-semibold text-gray-800 truncate leading-tight group-hover:text-primary transition-colors">
                                        {item.menuItemName}
                                      </p>
                                      {(item.menuItemNameHindi || item.menuItemNameGujarati) && (
                                        <p className="text-[11px] text-gray-400 truncate mt-0.5 leading-tight">
                                          {item.menuItemNameHindi}
                                          {item.menuItemNameHindi && item.menuItemNameGujarati && " · "}
                                          {item.menuItemNameGujarati}
                                        </p>
                                      )}
                                    </div>
                                    {onDismissItem && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDismissItem(id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-danger p-1 rounded hover:bg-danger/10 transition-all flex-shrink-0 mt-0.5"
                                        title="Dismiss / Mark as read"
                                      >
                                        <KeenIcon icon="cross" className="text-xs" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MenuSub>
  );
};

export { DropdownMenuPrepNotifications };
