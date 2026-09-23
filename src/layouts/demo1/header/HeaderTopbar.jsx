import { useRef, useState, useEffect, useCallback } from "react";
import { KeenIcon } from "@/components/keenicons";
import { toAbsoluteUrl } from "@/utils";
import { Menu, MenuItem, MenuToggle } from "@/components";
import { DropdownUser } from "@/partials/dropdowns/user";
import { DropdownNotifications } from "@/partials/dropdowns/notifications";
import { useNavigate, useLocation } from "react-router-dom";
import { DropdownChat } from "@/partials/dropdowns/chat";
import { useLanguage } from "@/i18n";
import { useUser } from "@/context/UserContext";
import CheckInModal from "@/partials/modals/CheckInModal";
import { useAuthContext } from "@/auth";
import { createPortal } from "react-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { DropdownFollowUp } from "../../../partials/dropdowns/notifications/DropdownFollowUp";
import { DropdownMenuPrepNotifications } from "../../../partials/dropdowns/notifications";
import dayjs from "dayjs";
import {
  followupnotiy,
  GetMenuPreparationNotifications,
  UpdateMenuPreparationNotificationVisibility,
  GetPreparationStatus,
} from "@/services/apiServices";
import { useMenuPrepStore } from "../../../store/useMenuPrepStore";
import { useModuleAccess } from "../../../hooks/useModuleAccess";

const PATH_TO_RIGHTS_KEY = {
  "/master/contact-type":             "Types",
  "/master/contact-categories":       "Categories",
  "/master/customers":                "Customers",
  "/master/vendor-master":            "Vendors",
  "/master/venue-type":               "Venue",
  "/master/godown":                   "Godown",
  "/master/labour-shift":             "Labour Shift",
  "/master/bank-details":             "Bank Details",
  "/Cash-account":                    "Cash OPB",
  "/master/event-type":               "Events",
  "/master/functions":                "Function",
  "/master/meals":                    "Food Prefrence",
  "/master/custom-package":           "Menu Packages",
  "/quotation-function":              "Quotation Function",
  "/terms":                           "Terms & Condition",
  "/menuplaaningmaster":              "Menu Planning Master",
  "/master/banquet-master":           "Banquet Master",
  "/master/banquet-shift":            "Banquet Shift",
  "/event-remark":                    "Event Remark",
  "/master/room":                     "Room Master",
  "/master/menu-category":            "Main Category",
  "/master/menu-sub-category":        "Sub Category",
  "/master/category-image":           "Main Category Theme",
  "/master/menu-item":                "Items With Recipe",
  "/master/raw-material-type-master": "Type",
  "/master/raw-material-master":      "Category",
  "/master/raw-material":             "Items",
  "/master/unit":                     "Unit",
  "/master/rawmaterial-opb":          "Raw Material OPB",
  "/stock-management/stock-type":     "Stock Type",
  "/stock-management/purchase":       "Purchase",
  "/stock-management/purchase-return":"Purchase Return",
  "/stock-management/automanualpo":   "Auto / Manual PO",
  "/stock-management/store-po":       "Store Issue",
  "/stock-management/store-po-return":"Store Issue Return",
  "/stock-management/chef-requisition":"Chef Requisition",
  "/stock-management/store-ledger":   "Stock Ledger",
  "/stock-management/store-ordering-tickets": "Store Ordering Tickets",
  "/stock-management/daily-stock-manage":     "Daily Stock Manage",
  "/stock-management/stock-report":   "Stock Report",
  "/bank-payment":                    "Debit",
  "/cash-recipet":                    "Credit",
  "/journal-voucher":                 "Journal Voucher",
  "/Payments":                        "Payments",
  "/account/expense":                 "Expense",
  "/gst-report":                      "GST Report",
  "/account":                         "Account Ledger",
  "/cash/cash-book":                  "Cash Book",
  "/bank/bank-book":                  "Bank Book",
  "/master/accountmaster":            "Account Contact",
  "/master/ExpenseType":              "Income/Expense Type",
};

const HEADER_MENUS = [
  {
    key: "master",
    groups: [
      {
        key: "master_general",
        label: "Master",
        icon: "ki-filled ki-abstract-26",
        items: [
          { label: "Types",            path: "/master/contact-type",       desc: "Contact types" },
          { label: "Categories",       path: "/master/contact-categories", desc: "Contact categories" },
          { label: "Customers",        path: "/master/customers",          desc: "Manage customers" },
          { label: "Vendors",          path: "/master/vendor-master",      desc: "Manage Vendor" },
          { label: "Venue",            path: "/master/venue-type",         desc: "Venue types" },
          { label: "Godown",           path: "/master/godown",             desc: "Godown master" },
          { label: "Labour Shift",     path: "/master/labour-shift",       desc: "Shift management" },
          { label: "Bank Details",     path: "/master/bank-details",       desc: "Bank information" },
          { label: "Cash OPB",         path: "/Cash-account",              desc: "Opening balance" },
        ],
      },
      {
        key: "master_event",
        label: "Event Master",
        icon: "ki-filled ki-calendar-tick",
        items: [
          { label: "Events",               path: "/master/event-type",    desc: "Event types" },
          { label: "Function",             path: "/master/functions",      desc: "Function types" },
          { label: "Food Preference",      path: "/master/meals",          desc: "Meal preferences" },
          { label: "Menu Packages",        path: "/master/custom-package", desc: "Custom packages" },
          { label: "Quotation Function",   path: "/quotation-function",    desc: "Quotation setup" },
          { label: "Terms & Condition",    path: "/terms",                 desc: "User terms" },
          { label: "Menu Planning Master", path: "/menuplaaningmaster",    desc: "Planning config" },
        ],
      },
    ],
  },
  {
    key: "banquet",
    groups: [
      {
        key: "banquet_master",
        label: "Banquet Master",
        icon: "ki-filled ki-user",
        items: [
          { label: "Banquet Master", path: "/master/banquet-master", desc: "Banquet configuration" },
          { label: "Banquet Shift",  path: "/master/banquet-shift",  desc: "Shift management" },
          { label: "Event Remark",   path: "/event-remark",          desc: "Event remarks" },
          { label: "Room Master",    path: "/master/room",           desc: "Room configuration" },
        ],
      },
    ],
  },
  {
    key: "menuitem",
    groups: [
      {
        key: "menuitem_main",
        label: "Menu Master",
        icon: "ki-filled ki-additem",
        items: [
          { label: "Main Category",       path: "/master/menu-category",     desc: "Menu categories" },
          { label: "Sub Category",        path: "/master/menu-sub-category", desc: "Sub-categories" },
          { label: "Main Category Theme", path: "/master/category-image",    desc: "Category visuals" },
          { label: "Items With Recipe",   path: "/master/menu-item",         desc: "Menu items" },
        ],
      },
    ],
  },
  {
    key: "rawmaterial",
    groups: [
      {
        key: "rawmaterial_main",
        label: "Raw Material",
        icon: "ki-filled ki-badge",
        items: [
          { label: "Type",     path: "/master/raw-material-type-master", desc: "Material types" },
          { label: "Category", path: "/master/raw-material-master",      desc: "Material categories" },
          { label: "Items",    path: "/master/raw-material",             desc: "Raw material items" },
          { label: "Unit",     path: "/master/unit",                     desc: "Units of measure" },
        ],
      },
    ],
  },
  {
    key: "stock",
    groups: [
      {
        key: "stock_purchase",
        label: "Stock",
        icon: "ki-filled ki-chart-simple",
        items: [
          { label: "Raw Material OPB",       path: "/master/rawmaterial-opb",                    desc: "Opening balances" },
          { label: "Stock Type",             path: "/stock-management/stock-type",               desc: "Stock categories" },
          { label: "Purchase",               path: "/stock-management/purchase",                 desc: "Purchase orders" },
          { label: "Purchase Return",        path: "/stock-management/purchase-return",          desc: "Return management" },
          { label: "Auto / Manual PO",       path: "/stock-management/automanualpo",             desc: "Purchase orders" },
          { label: "Store Issue",            path: "/stock-management/store-po",                 desc: "Issue to kitchen" },
          { label: "Store Issue Return",     path: "/stock-management/store-po-return",          desc: "Return from kitchen" },
          { label: "Chef Requisition",       path: "/stock-management/chef-requisition",         desc: "Chef requests" },
          { label: "Stock Ledger",           path: "/stock-management/store-ledger",             desc: "Ledger view" },
          { label: "Store Ordering Tickets", path: "/stock-management/store-ordering-tickets",   desc: "Order tickets" },
          { label: "Daily Stock Manage",     path: "/stock-management/daily-stock-manage",       desc: "Daily tracking" },
          { label: "Stock Report",           path: "/stock-management/stock-report",             desc: "Reports" },
        ],
      },
    ],
  },
  {
    key: "account",
    groups: [
      {
        key: "account_transactions",
        label: "Account",
        icon: "ki-filled ki-bank",
        items: [
          { label: "Debit",               path: "/bank-payment",          desc: "Bank payments" },
          { label: "Credit",              path: "/cash-recipet",          desc: "Cash receipts" },
          { label: "Journal Voucher",     path: "/journal-voucher",       desc: "Journal entries" },
          { label: "Payments",            path: "/Payments",              desc: "Payment records" },
          { label: "Expense",             path: "/account/expense",       desc: "Expense tracking" },
          { label: "GST Report",          path: "/gst-report",            desc: "Tax reports" },
          { label: "Account Ledger",      path: "/account",               desc: "Ledger view" },
          { label: "Cash Book",           path: "/cash/cash-book",        desc: "Cash transactions" },
          { label: "Bank Book",           path: "/bank/bank-book",        desc: "Bank transactions" },
          { label: "Account Contact",     path: "/master/accountmaster",  desc: "Contact accounts" },
          { label: "Income/Expense Type", path: "/master/ExpenseType",    desc: "Type configuration" },
        ],
      },
    ],
  },
];

const ALL_GROUPS = HEADER_MENUS.flatMap((menu) => menu.groups);

const HeaderMenuDropdown = ({ menu, isOpen, onToggle, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const btnRef   = useRef(null);
  const dropRef  = useRef(null);
  const [dropPos, setDropPos] = useState(null);

  useEffect(() => {
    const updatePos = () => {
      if (btnRef.current) {
        const rect   = btnRef.current.getBoundingClientRect();
        const vw     = window.innerWidth;
        const twoCol = menu.items.length > 4;
        const dropW  = twoCol ? 440 : 230;
        const left   = rect.left + dropW > vw
          ? Math.max(0, rect.right - dropW)
          : rect.left;
        setDropPos({ top: rect.bottom + 4, left });
      }
    };

    if (isOpen) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    } else {
      setDropPos(null);
    }
  }, [isOpen, menu.items.length]);

  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const isActive = menu.items.some((i) => location.pathname === i.path);
  const twoCol   = menu.items.length > 4;
  const half     = Math.ceil(menu.items.length / 2);
  const col1     = twoCol ? menu.items.slice(0, half) : menu.items;
  const col2     = twoCol ? menu.items.slice(half)    : [];

  const renderItem = (item) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => { navigate(item.path); onClose(); }}
        className={`
          w-full text-left px-4 py-2.5 flex items-start gap-3
          transition-colors group
          ${active ? "bg-primary/10" : "hover:bg-gray-50"}
        `}
      >
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors
          ${active ? "bg-primary" : "bg-gray-200 group-hover:bg-primary/40"}`}
        />
        <span className="flex flex-col min-w-0">
          <span className={`text-xs font-medium leading-tight
            ${active ? "text-primary" : "text-gray-800"}`}>
            {item.label}
          </span>
          {item.desc && (
            <span className="text-[11px] text-gray-400 leading-tight mt-0.5">
              {item.desc}
            </span>
          )}
        </span>
      </button>
    );
  };

  const dropdownContent = isOpen && dropPos ? (
    <div
      ref={dropRef}
      style={{
        position:      "fixed",
        top:           dropPos.top,
        left:          dropPos.left,
        zIndex:        99999,
        minWidth:      twoCol ? 440 : 230,
        maxHeight:     `calc(100vh - ${dropPos.top}px - 16px)`,
        display:       "flex",
        flexDirection: "column",
      }}
      className="bg-white border border-gray-100 rounded-xl shadow-2xl"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
        <i className={`${menu.icon} text-primary`} style={{ fontSize: 15 }} />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {menu.label}
        </span>
      </div>
      <div
        className={`flex flex-1 min-h-0 ${twoCol ? "divide-x divide-gray-100" : ""}`}
        style={{ overflowY: "auto" }}
      >
        <div className="flex flex-col py-1 flex-1 min-w-0">
          {col1.map(renderItem)}
        </div>
        {twoCol && (
          <div className="flex flex-col py-1 flex-1 min-w-0">
            {col2.map(renderItem)}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className={`
          flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5
          rounded-md border transition-all whitespace-nowrap select-none border-none
          ${isActive
            ? "border-primary bg-primary/10 text-primary"
            : "bg-white text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          }
        `}
      >
        <i className={`${menu.icon} text-primary`} style={{ fontSize: 16 }} />
        {menu.label}
        <i
          className="ki-filled ki-down text-gray-400"
          style={{
            fontSize:  14,
            transition: "transform .15s",
            transform:  isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {createPortal(dropdownContent, document.body)}
    </>
  );
};

const HeaderTopbar = () => {
  const { currentUser } = useAuthContext();
  const roleId      = Number(currentUser?.userBasicDetails?.role?.id);
  const isSuperUser = roleId === 1 || roleId === 2;
    const { hasModuleAccess } = useModuleAccess();
  
      const canAccessfollowup = hasModuleAccess("followup");
    const canAccessMenuExtraFeature = hasModuleAccess("Menu Extra Features");

 const navigate    = useNavigate();
  const storeUser = useAuthStore((state) => state.user);
  const rights    = useAuthStore((state) => state.rights);
  const isVisible = ["jcxpro", "justbanq"].includes(storeUser?.softType);
  // const isVisible = ["jcx"].includes(storeUser?.softType);
  const visibleGroups = ALL_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => {
      if (isSuperUser) return true;
      const rightsKey = PATH_TO_RIGHTS_KEY[item.path];
      if (!rightsKey) return false;
      return rights[rightsKey]?.view === true;
    });
    return { ...group, items: filteredItems };
  }).filter((group) => group.items.length > 0);

  const { isRTL } = useLanguage();

  const location = useLocation();
  const prepStatus = useMenuPrepStore((state) => state.prepStatus);
  const isMenuPrepRoute = location.pathname.includes("/menu-preparation");
  const isStatusComplete = prepStatus === "COMPLETED" || prepStatus === "Complete";

  const itemChatRef          = useRef(null);
  const itemUserRef          = useRef(null);
  const itemNotificationsRef = useRef(null);
  const itemFollowUpRef      = useRef(null);
  const itemMenuPrepNotifRef = useRef(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [menuPrepNotifications, setMenuPrepNotifications] = useState([]);
  const [menuPrepUnreadCount, setMenuPrepUnreadCount] = useState(0);
  const dismissedNotificationIdsRef = useRef(new Set());

  const [menuPrepLoading, setMenuPrepLoading] = useState(false);
  const [checkInModal, setCheckInModal] = useState(false);
  const [openMenuKey, setOpenMenuKey]   = useState(null);
  const { user, refreshUser } = useUser();

  useEffect(() => {
    if (!isMenuPrepRoute) return;
    const match = location.pathname.match(/\/menu-preparation\/(\d+)/);
    if (match && match[1] && prepStatus === null) {
      GetPreparationStatus(match[1])
        .then((res) => {
          if (res?.data?.data) {
            useMenuPrepStore.getState().setPrepStatus(res.data.data, match[1]);
          }
        })
        .catch(() => {});
    }
  }, [location.pathname, isMenuPrepRoute, prepStatus]);

  const getLoginUserManagerId = useCallback(() => {
    const storeUserObj = useAuthStore.getState().user;
    const rawAuth = localStorage.getItem("auth-storage");
    let parsedUser = null;
    if (rawAuth) {
      try {
        parsedUser = JSON.parse(rawAuth)?.state?.user;
      } catch (e) {}
    }
    const uid =
      storeUserObj?.id ||
      storeUserObj?.managerId ||
      parsedUser?.id ||
      parsedUser?.managerId ||
      currentUser?.id ||
      currentUser?.managerId ||
      localStorage.getItem("userId") ||
      localStorage.getItem("mainId");
    return uid ? Number(uid) : null;
  }, [currentUser]);

  // Shared helper: parse API response into a flat list of enriched items
  const parseNotificationResponse = (res) => {
    const body = res?.data;
    const eventNotifications =
      body?.data?.eventNotification ||
      body?.eventNotification ||
      [];

    const flatList = [];
    (Array.isArray(eventNotifications) ? eventNotifications : []).forEach((event) => {
      const eventName  = event?.eventName || event?.eventNameGujarati || `Event #${event?.eventId}`;
      const eventStart = event?.eventStartDateTime || "";
      const eventEnd   = event?.eventEndDateTime   || "";

      (event?.eventFunctions || event?.functions || []).forEach((fn) => {
        const functionName = fn?.eventFunctionName || fn?.functionName || fn?.eventFunctionNameGujarati || "";
        const fnStart = fn?.eventFunctionStartDateTime || fn?.startDateTime || eventStart;
        const fnEnd   = fn?.eventFunctionEndDateTime   || fn?.endDateTime   || eventEnd;

        (fn?.categories || fn?.menuCategories || []).forEach((cat) => {
          const categoryName = cat?.menuCategoryName || cat?.categoryName || cat?.menuCategoryNameGujarati || "";

          (cat?.items || cat?.menuItems || []).forEach((item) => {
            const notifId =
              item.notificationId ??
              item.id ??
              `${event?.eventId}_${fn?.eventFunctionId}_${cat?.menuCategoryId}_${item?.menuItemId}`;

            flatList.push({
              notificationId:       notifId,
              menuItemId:           item.menuItemId,
              menuItemName:         item.menuItemName,
              menuItemNameHindi:    item.menuItemNameHindi,
              menuItemNameGujarati: item.menuItemNameGujarati,
              isVisible:            item.isVisible,
              eventId:              event.eventId,
              eventName,
              eventStartDateTime:   eventStart,
              eventEndDateTime:     eventEnd,
              eventFunctionId:      fn.eventFunctionId,
              functionName,
              fnStartDateTime:      fnStart,
              fnEndDateTime:        fnEnd,
              menuCategoryId:       cat.menuCategoryId,
              categoryName,
            });
          });
        });
      });
    });
    return flatList;
  };

  // Background fetch — sets badge count for active notifications and merges into display list
  const fetchMenuPrepBadge = useCallback(() => {
    const managerId = getLoginUserManagerId();
    if (!managerId) return;

    GetMenuPreparationNotifications(managerId)
      .then((res) => {
        const flatList = parseNotificationResponse(res);
        const activeList = flatList.filter(
          (item) => item.isVisible !== false && !dismissedNotificationIdsRef.current.has(item.notificationId)
        );
        setMenuPrepUnreadCount(activeList.length);

        // Merge items into display list (so they're ready when dropdown opens)
        setMenuPrepNotifications((prev) => {
          const existingIds = new Set(prev.map((i) => i.notificationId));
          const brandNew = activeList.filter((i) => !existingIds.has(i.notificationId));
          return [...prev, ...brandNew];
        });
      })
      .catch(() => {});
  }, [getLoginUserManagerId]);

  // Dropdown-open fetch — shows items & sets badge count to active items (never increments)
  const fetchMenuPrepNotifications = useCallback(() => {
    const managerId = getLoginUserManagerId();
    if (!managerId) return;

    setMenuPrepLoading(true);
    GetMenuPreparationNotifications(managerId)
      .then((res) => {
        const flatList = parseNotificationResponse(res);
        const activeList = flatList.filter(
          (item) => item.isVisible !== false && !dismissedNotificationIdsRef.current.has(item.notificationId)
        );

        // Merge new items — existing notifications stay visible
        setMenuPrepNotifications((prev) => {
          const existingIds = new Set(prev.map((i) => i.notificationId));
          const brandNew = activeList.filter((i) => !existingIds.has(i.notificationId));
          return [...prev, ...brandNew];
        });

        // Set badge count directly to active items (accurate count, never increments)
        setMenuPrepUnreadCount(activeList.length);
      })
      .catch((err) => console.error("[MenuPrepNotif] Fetch failed:", err))
      .finally(() => setMenuPrepLoading(false));
  }, [getLoginUserManagerId]);

  // Fetch badge count on load and poll every 15 seconds when user has Menu Extra Features access
  useEffect(() => {
    if (!canAccessMenuExtraFeature) return;
    fetchMenuPrepBadge();
    const timer = setInterval(() => {
      fetchMenuPrepBadge();
    }, 15000);
    return () => clearInterval(timer);
  }, [canAccessMenuExtraFeature, fetchMenuPrepBadge]);

  const handleDismissMenuPrepItem = useCallback(async (id) => {
    try {
      if (id) {
        dismissedNotificationIdsRef.current.add(id);
        UpdateMenuPreparationNotificationVisibility([id], false).catch((err) =>
          console.error("Failed to update notification visibility:", err)
        );
      }
      setMenuPrepNotifications((prev) =>
        prev.filter((item) => item.notificationId !== id)
      );
      setMenuPrepUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  }, []);

  const handleNotificationItemClick = useCallback(async (item) => {
    const id = item?.notificationId;
    try {
      if (id) {
        dismissedNotificationIdsRef.current.add(id);
        // Call visibility API to mark notification as read
        UpdateMenuPreparationNotificationVisibility([id], false).catch((err) =>
          console.error("Failed to update notification visibility:", err)
        );
      }
      setMenuPrepNotifications((prev) =>
        prev.filter((i) => i.notificationId !== id)
      );
      setMenuPrepUnreadCount((prev) => Math.max(0, prev - 1));

      // Close dropdown
      if (itemMenuPrepNotifRef?.current) {
        itemMenuPrepNotifRef.current.hide();
      }

      // Navigate to menu preparation for this event if eventId is present
      if (item?.eventId) {
        navigate(`/menu-preparation/${item.eventId}`);
      }
    } catch (err) {
      console.error("Error handling notification item click:", err);
    }
  }, [navigate]);

  const handleClearAllMenuPrep = useCallback(async () => {
    const ids = menuPrepNotifications
      .map((item) => item.notificationId)
      .filter(Boolean);
    if (!ids.length) return;
    try {
      ids.forEach((id) => dismissedNotificationIdsRef.current.add(id));
      setMenuPrepNotifications([]);
      setMenuPrepUnreadCount(0);
      UpdateMenuPreparationNotificationVisibility(ids, false).catch((err) =>
        console.error("Failed to clear all notifications visibility:", err)
      );
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
    }
  }, [menuPrepNotifications]);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const companyName  = user?.userBasicDetails?.companyName || "Company";
  const services     = user?.userBasicDetails?.services    || "";
  const planValidity = user?.userPlan?.endDate?.split(" ")?.[0] || "";
  const userLogo     = user?.logo;

  const [remainingDays, setRemainingDays] = useState(null);
const getAuthFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return { followupDay: null, userId: null };
    const parsed = JSON.parse(raw);
    return {
      followupDay: parsed?.state?.user?.followupDay != null ? Number(parsed.state.user.followupDay) : null,
      userId: parsed?.state?.user?.id ?? null,
    };
  } catch (err) {
    console.error("[getAuthFromLocalStorage] Failed:", err);
    return { followupDay: null, userId: null };
  }
};

const fetchFollowUps = useCallback(() => {
  const { followupDay, userId } = getAuthFromLocalStorage();
  if (!userId) return;

  const days = followupDay && followupDay > 0 ? followupDay : 5;
  const startDate = dayjs().format("DD/MM/YYYY");
  const endDate = dayjs().add(days, "day").format("DD/MM/YYYY");

  console.log("params used:", { endDate, startDate, userId }); // ✅ safe here, before the call

  setFollowUpLoading(true);
  followupnotiy(endDate, "", false, "", startDate, userId)
    .then((res) => {
      console.log("followupnotiy raw response:", res?.data); // ✅ now res exists

      const list =
        res?.data?.data?.["Event Followup Details"] ||
        res?.data?.data ||
        res?.data ||
        [];
      console.log("parsed list length:", list.length);

      const pending = (Array.isArray(list) ? list : [])
        .filter((item) => !item.isDone)
        .sort((a, b) => {
          const da = dayjs(a.followupDate, "DD/MM/YYYY", true);
          const db = dayjs(b.followupDate, "DD/MM/YYYY", true);
          return da.valueOf() - db.valueOf();
        });

      setFollowUps(pending);
    })
    .catch((err) => {
      console.error("Failed to fetch follow-up notifications:", err);
      setFollowUps([]);
    })
    .finally(() => setFollowUpLoading(false));
}, []);
  useEffect(() => {
    if (user?.userPlan?.endDate) {
      const rawDate = user.userPlan.endDate.split(" ")[0];
      const [day, month, year] = rawDate.split("/");
      const end   = new Date(`${year}-${month}-${day}`);
      const today = new Date();
      end.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      setRemainingDays(Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
    }
  }, [user]);

  const getServiceIcon = () => {
    if (services === "Good")    return <i className="ki-filled ki-verify text-primary" />;
    if (services === "Average") return <i className="ki-filled ki-verify text-gray-400" />;
    if (services === "Bad")     return <i className="ki-filled ki-verify text-danger" />;
    return null;
  };

  const handleToggle = useCallback((key) => {
    setOpenMenuKey((prev) => (prev === key ? null : key));
  }, []);

  const handleClose = useCallback(() => setOpenMenuKey(null), []);

  return (
    <div className="flex items-center justify-between w-full gap-2 min-w-0">

   
      {!isVisible && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-black text-lg truncate hidden sm:inline">
            {companyName}
          </span>
          <span className="font-semibold text-black text-xl hidden sm:inline">
            {getServiceIcon()}
          </span>
        </div>
      )}


      {isVisible && (
        <div className="flex items-center gap-1 flex-1 mx-2 flex-wrap">
          {visibleGroups.map((group) => (
            <HeaderMenuDropdown
              key={group.key}
              menu={group}
              isOpen={openMenuKey === group.key}
              onToggle={() => handleToggle(group.key)}
              onClose={handleClose}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {remainingDays !== null && remainingDays <= 7 && remainingDays >= 0 && (
          <span className="text-sm font-medium text-white bg-danger p-2 rounded-md whitespace-nowrap">
            {remainingDays === 0
              ? `Expires today (${planValidity})`
              : remainingDays === 1
                ? `Expires tomorrow (${planValidity})`
                : `Expires in ${remainingDays} days (${planValidity})`}
          </span>
        )}

        <div className="fixed left-0 right-0 bottom-10 flex justify-center md:static">
          <div className="flex items-center gap-2 lg:gap-3 shadow-lg md:shadow-none py-3 md:py-0 px-7 md:px-0 rounded-full md:rounded-none bg-white md:bg-transparent border md:border-0">
             {/* Upgrade button — new */}
{/* Upgrade button — only show if user has no active plan */}
{!storeUser?.plan && (
  <button
    onClick={() => navigate("/price")}
    className="btn btn-sm px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
  >
    Upgrade
  </button>
)}
            {canAccessMenuExtraFeature && (
              <Menu>
                <MenuItem
                  ref={itemMenuPrepNotifRef}
                  toggle="dropdown"
                  trigger="click"
                  onShow={fetchMenuPrepNotifications}
                  dropdownProps={{
                    placement: isRTL() ? "bottom-start" : "bottom-end",
                    modifiers: [
                      {
                        name: "offset",
                        options: { offset: isRTL() ? [-70, 10] : [70, 10] },
                      },
                    ],
                  }}
                >
                  <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-clarity hover:text-primary text-gray-500">
                    <KeenIcon icon="notification-on" />
                    {menuPrepUnreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                        <span className="text-[9px] text-white font-medium">
                          {menuPrepUnreadCount > 9 ? "9+" : menuPrepUnreadCount}
                        </span>
                      </span>
                    )}
                  </MenuToggle>
                  {DropdownMenuPrepNotifications({
                    menuItemRef: itemMenuPrepNotifRef,
                    notifications: menuPrepNotifications,
                    loading: menuPrepLoading,
                    onDismissItem: handleDismissMenuPrepItem,
                    onClearAll: handleClearAllMenuPrep,
                    onEventClick: (eventId) => navigate(`/menu-preparation/${eventId}`),
                    onItemClick: handleNotificationItemClick,
                  })}
                </MenuItem>
              </Menu>
            )}
            <Menu>
              <MenuItem
                ref={itemChatRef}
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? "bottom-start" : "bottom-end",
                  modifiers: [{ name: "offset", options: { offset: isRTL() ? [-70, 10] : [70, 10] } }],
                }}
              >
                <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-clarity hover:text-primary text-gray-500">
                  <KeenIcon icon="ki-filled ki-whatsapp" />
                </MenuToggle>
                {DropdownChat({ menuTtemRef: itemChatRef })}
              </MenuItem>
            </Menu>

            <Menu>
              <MenuItem
                ref={itemNotificationsRef}
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? "bottom-start" : "bottom-end",
                  modifiers: [{ name: "offset", options: { offset: isRTL() ? [-70, 10] : [70, 10] } }],
                }}
              >
                <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-clarity hover:text-primary text-gray-500">
                  <KeenIcon icon="notification-status" />
                </MenuToggle>
                {DropdownNotifications({ menuTtemRef: itemNotificationsRef })}
              </MenuItem>
            </Menu>
{ canAccessfollowup && (
    <Menu>
  <MenuItem
    ref={itemFollowUpRef}
    toggle="dropdown"
    trigger="click"
    onShow={fetchFollowUps}
    dropdownProps={{
      placement: isRTL() ? "bottom-start" : "bottom-end",
      modifiers: [{ name: "offset", options: { offset: isRTL() ? [-70, 10] : [70, 10] } }],
    }}
  >
    <MenuToggle className="btn btn-icon btn-icon-lg relative cursor-pointer size-9 rounded-full hover:bg-primary-clarity hover:text-primary text-gray-500">
      <KeenIcon icon="ki-filled ki-calendar-tick" />
    </MenuToggle>
    {DropdownFollowUp({ menuTtemRef: itemFollowUpRef, followUps, loading: followUpLoading })}
  </MenuItem>
</Menu>
)}
          </div>
        </div>

        <Menu>
          <MenuItem
            ref={itemUserRef}
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [{ name: "offset", options: { offset: isRTL() ? [-20, 10] : [20, 10] } }],
            }}
          >
            <MenuToggle className="btn btn-icon rounded-full">
              <img
                className="size-9  border-2 border-gray-500  rounded-3xl shrink-0"
                src={
                  userLogo &&
                  typeof userLogo === "string" &&
                  userLogo.trim() !== "" &&
                  userLogo !== "null" &&
                  userLogo !== "undefined" &&
                  !userLogo.toLowerCase().includes("/null") &&
                  /\.(jpg|jpeg|png|webp|gif)$/i.test(userLogo)
                    ? userLogo
                    : toAbsoluteUrl("/media/menu/noImage.jpg")
                }
                alt=""
              />
            </MenuToggle>
            {DropdownUser({ menuItemRef: itemUserRef })}
          </MenuItem>
        </Menu>

        <CheckInModal
          isModalOpen={checkInModal}
          setIsModalOpen={setCheckInModal}
        />
      </div>
    </div>
  );
};

export { HeaderTopbar };