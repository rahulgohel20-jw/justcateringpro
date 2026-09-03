import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeenIcon } from "@/components/keenicons";

const masterItems = [
  { label: "Types", path: "/master/contact-type" },
  { label: "Categories", path: "/master/contact-categories" },
  { label: "Customers", path: "/master/customers" },
  { label: "Events", path: "/master/event-type" },
  { label: "Function", path: "/master/functions" },
  { label: "Food Preference", path: "/master/meals" },
  { label: "Venue", path: "/master/venue-type" },
  { label: "Godown", path: "/master/godown" },
  { label: "Labour Shift", path: "/master/labour-shift" },
  { label: "Menu Packages", path: "/master/custom-package" },
  { label: "Quotation Function", path: "/quotation-function" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Menu Planning Master", path: "/menuplaaningmaster" },
  { label: "Bank Details", path: "/master/bank-details" },
  { label: "Cash OPB", path: "/Cash-account" },
];

const banquetItems = [
  { label: "Banquet Master", path: "/master/banquet-master" },
  { label: "Banquet Shift", path: "/master/banquet-shift" },
  { label: "Event Remark", path: "/event-remark" },
  { label: "Room Master", path: "/master/room" },
];

const menuItemItems = [
  { label: "Category", path: "/master/menu-category" },
  { label: "Sub Category", path: "/master/menu-sub-category" },
  { label: "Category Image", path: "/master/category-image" },
  { label: "Items With Recipe", path: "/master/menu-item" },
];

const rawMaterialItems = [
  { label: "Type", path: "/master/raw-material-type-master" },
  { label: "Category", path: "/master/raw-material-master" },
  { label: "Items", path: "/master/raw-material" },
  { label: "Unit", path: "/master/unit" },
];

const stockItems = [
  { label: "Raw Material OPB", path: "/master/rawmaterial-opb" },
  { label: "Stock Type", path: "/stock-management/stock-type" },
  { label: "Purchase", path: "/stock-management/purchase" },
  { label: "Purchase Return", path: "/stock-management/purchase-return" },
  { label: "Store Issue", path: "/stock-management/store-po" },
  { label: "Store Issue Return", path: "/stock-management/store-po-return" },
  { label: "Auto / Manual PO", path: "/stock-management/automanualpo" },
  { label: "Chef Requisition", path: "/stock-management/chef-requisition" },
  { label: "Stock Ledger", path: "/stock-management/store-ledger" },
  { label: "Store Ordering Tickets", path: "/stock-management/store-ordering-tickets" },
  { label: "Daily Stock Manage", path: "/stock-management/daily-stock-manage" },
  { label: "Stock Report", path: "/stock-management/stock-report" },
];

const accountItems = [
  { label: "Debit", path: "/bank-payment" },
  { label: "Credit", path: "/cash-recipet" },
  { label: "Journal Voucher", path: "/journal-voucher" },
  { label: "GST Report", path: "/gst-report" },
  { label: "Account Ledger", path: "/account" },
  { label: "Payments", path: "/Payments" },
  { label: "Cash Book", path: "/cash/cash-book" },
  { label: "Bank Book", path: "/bank/bank-book" },
  { label: "Expense", path: "/account/expense" },
  { label: "Account Contact", path: "/master/accountmaster" },
  { label: "Income/Expense Type", path: "/master/ExpenseType" },
];

const DROPDOWNS = [
  { key: "master",      label: "Master",          icon: "abstract-26",  items: masterItems },
  { key: "banquet",     label: "Banquet",          icon: "home-3",       items: banquetItems },
  { key: "menuItem",    label: "Menu Item",        icon: "additem",      items: menuItemItems },
  { key: "rawMaterial", label: "Raw Material",     icon: "badge",        items: rawMaterialItems },
  { key: "stock",       label: "Stock",            icon: "chart-simple", items: stockItems },
  { key: "account",     label: "Account",          icon: "bank",         items: accountItems },
];

const HeaderDropdown = ({ label, icon, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 bg-white text-gray-700 whitespace-nowrap"
      >
        <i className={`ki-filled ki-${icon} text-primary text-sm`} />
        {label}
        <i className={`ki-filled ki-${open ? "up" : "down"} text-gray-400 text-xs`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] w-52 bg-white border border-gray-100 rounded-lg shadow-lg z-[999] py-1 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            {label}
          </div>
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const HeaderMasterDropdowns = () => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {DROPDOWNS.map(({ key, label, icon, items }) => (
        <HeaderDropdown key={key} label={label} icon={icon} items={items} />
      ))}
    </div>
  );
};

export { HeaderMasterDropdowns };