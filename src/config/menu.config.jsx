import { Path } from "leaflet";
import { FormattedMessage } from "react-intl";

export const disableMenuItems = (menuItems) => {
  return menuItems.map((item) => {
    const isPlanPage = item.path && item.path.toLowerCase().includes("price");
    return {
      ...item,
      disabled: !isPlanPage,
      statusLabel: isPlanPage ? undefined : "Locked",
      children: item.children ? disableMenuItems(item.children) : undefined,
    };
  });
};

export const allMenuItems = (navigate) => {
  return [
    {
      title: (
        <FormattedMessage id="COMMON.DASHBOARD" defaultMessage="Dashboard" />
      ),
      icon: "element-11 text-primary text-lg",
      path: "/dashboard",
      pageName: "Dashboard",
    },
    {
  title: <FormattedMessage id="COMMON.EVENTS" defaultMessage="Events" />,
  icon: "ki-filled ki-calendar-tick text-primary text-lg",
  children: [
    {
      title: (
        <div className="w-full flex justify-between items-center">
          <FormattedMessage id="COMMON.EVENT_LIST" defaultMessage="Over View" />
          <span className="text-primary text-[12px] p-1 rounded-md cursor-pointer transition-colors">
            Coming Soon
          </span>
        </div>
      ),
      pageName: "Over View",
    },
    {
      title: <FormattedMessage id="COMMON.CALENDAR" defaultMessage="Calendar" />,
      pageName: "Calendar",
      path: "/",
    },
    {
      title: <FormattedMessage id="COMMON.CALENDAR" defaultMessage="Inquiry List" />,
      pageName: "Inquiry",
      path: "/inquiry",
    },
    {
      title: <FormattedMessage id="COMMON.EVENT_LIST" defaultMessage="Event List" />,
      pageName: "Event List",
      path: "/event",
    },

    
    // ── continues flat from here instead of nesting under "Event Hub" ──
    {
      title: <FormattedMessage id="COMMON.MENU_PLANNING" defaultMessage="Menu Planning" />,
      pageName: "Menu Planning",
      path: "/menu-preparation",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.MENU_EXECUTION" defaultMessage="Menu Execution" />,
      pageName: "Menu Execution",
      path: "/menu-allocation",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.RAW_MATERIAL_DIST" defaultMessage="Raw Material Distribution" />,
      pageName: "Raw Material Distribution",
      path: "/raw-material-allocation",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.LABOUR" defaultMessage="Labour" />,
      pageName: "Labour",
      path: "/labour-and-other-management",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.DISH_COSTING" defaultMessage="Per Dish Costing" />,
      pageName: "Per Dish Costing",
      path: "/dish-costing",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.EVENT_REPORT" defaultMessage="Event Report" />,
      pageName: "Event Report",
      path: "/allreports",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.QUOTATION" defaultMessage="Quotation" />,
      pageName: "Quotation",
      path: "/quotation",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.INVOICE" defaultMessage="Invoice" />,
      pageName: "Invoice",
      path: "/add-invoice",
      requiresEvent: true,
    },
    {
      title: <FormattedMessage id="COMMON.EXPENSE" defaultMessage="Expense" />,
      pageName: "Expense",
      path: "/expense-management",
      requiresEvent: true,
    },
    
  ],
},
  {
      title: (
        <FormattedMessage
          id="COMMON.VENDORSIDEBAR_MASTER"
          defaultMessage="Follow-up Calender"
        />
      ),
      icon: "  text-lg  ki-filled ki-calendar text-primary",
       path: "/followup-calendar",
      pageName: "followup",
      moduleName: "followup",
  
    },
    {
      title: (
        <FormattedMessage
          id="COMMON.VENDORSIDEBAR_MASTER"
          defaultMessage="Vendor"
        />
      ),
      icon: "  text-lg ki-filled ki-users text-primary",
      path: "/master/vendor-master",
      pageName: "Vendor",
  
    },

    {
      title: <FormattedMessage id="COMMON.MASTER" defaultMessage="Master" />,
      icon: "  text-lg ki-filled ki-abstract-26 text-primary",
     
      moduleName:"Master",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.CONTACTSIDEBAR_TYPE"
              defaultMessage="Types"
            />
          ),
          pageName: "Types",
          path: "/master/contact-type",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CONTACTSIDEBAR_CATEGORIES"
              defaultMessage="Categories"
            />
          ),
          pageName: "Categories",
          path: "/master/contact-categories",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMERS"
              defaultMessage="Customers"
            />
          ),
          path: "/master/customers",
          pageName: "Customers",
        },
       
        {
          title: (
            <FormattedMessage
              id="COMMON.EVENTSIDEBAR_TYPE"
              defaultMessage="Events"
            />
          ),
          path: "/master/event-type",
          pageName: "Events",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.FUNCTIONSIDEBAR_TYPE"
              defaultMessage="Function"
            />
          ),
          path: "/master/functions",
          pageName: "Function",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.MEALSIDEBAR_TYPE"
              defaultMessage="Food Prefrence"
            />
          ),
          path: "/master/meals",
          pageName: "Food Prefrence",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.VENUESIDEBAR_TYPE"
              defaultMessage="Venue "
            />
          ),
          path: "/master/venue-type",
          pageName: "Venue",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.GODOWNSIDEBAR_MASTER"
              defaultMessage="Godown"
            />
          ),
          path: "/master/godown",
          pageName: "Godown",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.LABOUR_SHIFT"
              defaultMessage="Labour Shift"
            />
          ),
          path: "/master/labour-shift",
          pageName: "Labour Shift",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_PACKAGE"
              defaultMessage="Menu Packages"
            />
          ),
          path: "/master/custom-package",
          pageName: "Menu Packages",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_QUOTATION_FUNCTION"
              defaultMessage="Quotation Function"
            />
          ),
          path: "/quotation-function",
          pageName: "Quotation Function",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_TERMS_CONDITION"
              defaultMessage="User Terms and Condition"
            />
          ),
          path: "/terms",
          pageName: "User Terms and Condition",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_MENU_PLANNING_MASTER"
              defaultMessage="Menu Planning Master"
            />
          ),
          path: "/menuplaaningmaster",
          pageName: "Menu Planning Master",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
              defaultMessage="Bank Details"
            />
          ),
          path: "/master/bank-details",
          pageName: "Bank Details",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CASH_OPB"
              defaultMessage="Cash OPB"
            />
          ),
          path: "/Cash-account",
          pageName: "CashOPB",
        },
       

        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.EVENT_REMARK_MASTER"
        //       defaultMessage="Event Remark Master"
        //     />
        //   ),
        //   path: "/event-remark",
        //   pageName: "Event Remark Master",
        // },

        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Profit and Loss"
        //     />
        //   ),
        //   path: "/super-admin/P&l",
        //   pageName: "ProfitandLoss",
        // },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Income"
        //     />
        //   ),
        //   path: "/super-admin/income",
        //   pageName: "Income",
        // },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Cash Book "
        //     />
        //   ),
        //   path: "/cash/cash-book",
        //   pageName: "cashBook",
        // },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Bank Book"
        //     />
        //   ),
        //   path: "/bank/bank-book",
        //   pageName: "BankBook",
        // },
      ],
    },

     {
          title: (
            <FormattedMessage
              id="COMMON.GUEST_MASTER"
              defaultMessage="Guest Master"
            />
          ),
          icon: "  text-lg ki-filled ki-people  text-primary",
          path: "/master/guest",
          pageName: "Guest Master",
           moduleName: "Food Taste Festival",
        },
  {
          title: (
            <FormattedMessage
              id="COMMON.GUEST_MASTER"
              defaultMessage="Labour Helper"
            />
          ),
          icon: "  text-lg ki-filled ki-people  text-primary",
          path: "/master/addlabourhelper",
          pageName: "kyc",
           moduleName: "kyc",
        },

    {
      title: (
        <FormattedMessage
          id="BANQUET.TITLE"
          defaultMessage="Banquet Master"
        />
      ),
      icon: "  text-lg ki-filled ki-home-2 text-primary",
      pageName: "Banquet",
      moduleName: "Banquet",
      children: [
        {
          title: (
            <FormattedMessage
              id="BANQUET.TITLE"
              defaultMessage="Banquet Master"
            />
          ),
          path: "/master/banquet-master",
          pageName: "Banquet Master",
          moduleName: "Banquet",
        },
        {
          title: (
            <FormattedMessage
              id="USER.MASTER.BANQUET_SHIFT_MASTER"
              defaultMessage="Banquet Shift"
            />
          ),
          path: "/master/banquet-shift",
          pageName: "Banquet Shift",
          moduleName: "Banquet",
        },
        {
          title: (
            <FormattedMessage
              id="USER.MASTER.EVENT_REMARK_MASTER"
              defaultMessage="Event Remark "
            />
          ),
          path: "/event-remark",
          pageName: "Event Remarks",
          moduleName: "Banquet",
        },
        {
          title: (
            <FormattedMessage
              id="USER.MASTER.ROOM_MASTER"
              defaultMessage="Room Master"
            />
          ),
          path: "/master/room",
          pageName: "Room",
          moduleName: "Banquet",
        },
        {
          title: (
            <FormattedMessage
              id="HALL.PACKAGE_RATE_MASTER"
              defaultMessage="Hall Package Rate"
            />
          ),
          path: "/hallpackagerate",
          pageName: "Hall Package Rate",
          moduleName: "Banquet",
        },
      ],
    },

    {
      title: (
        <FormattedMessage id="COMMON.SIDEBAR_USERS" defaultMessage="Members" />
      ),
      icon: "  text-lg ki-filled ki-user text-primary",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.USERSIDEBAR_MASTER"
              defaultMessage="User Master"
            />
          ),
          path: "/master/all-members",
          pageName: "User Master",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.DEPARTMENTSIDEBAR"
              defaultMessage="Department"
            />
          ),
          path: "/master/role",
          pageName: "Department",
        },
      ],
    },

    {
      title: (
        <FormattedMessage
          id="COMMON.RAW_MATERIAL"
          defaultMessage="Raw Material"
        />
      ),
      icon: "  text-lg ki-filled ki-badge text-primary",
      moduleName: "Raw Material",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.RAW_MATERIALSIDEBAR_TYPE"
              defaultMessage="Type"
            />
          ),
          path: "/master/raw-material-type-master",
          pageName: "Type",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.RAW_MATERIALSIDEBAR_CATEGORY"
              defaultMessage="Category"
            />
          ),
          path: "/master/raw-material-master",
          pageName: "Category",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.RAWSIDEBAR_MATERIAL"
              defaultMessage="Items"
            />
          ),
          path: "/master/raw-material",
          pageName: "Items",
        },
        {
          title: (
            <FormattedMessage id="COMMONSIDEBAR.UNIT" defaultMessage="Unit" />
          ),
          path: "/master/unit",
          pageName: "Unit",
        },
      ],
    },
    {
      title: (
        <FormattedMessage id="COMMON.MENU_ITEM" defaultMessage="Menu Item" />
      ),
      icon: "  text-lg ki-filled ki-additem text-primary",
      moduleName: "Menu Item",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.MENU_ITEMSIDEBAR_CATEGORY"
              defaultMessage=" Category"
            />
          ),
          path: "/master/menu-category",
          pageName: "Category",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.MENU_ITEM_SUBSIDEBAR_CATEGORY"
              defaultMessage=" Sub Category"
            />
          ),
          path: "/master/menu-sub-category",
          pageName: "Sub Category",
        },

        {
          title: (
            <FormattedMessage
              id="CATEGORY_IMAGE.MASTER"
              defaultMessage="Category Image"
            />
          ),
          path: "/master/category-image",
          pageName: "CategoryImage",
        },
      

        {
          title: (
            <FormattedMessage
              id="COMMON.MENUSIDEBAR_ITEM"
              defaultMessage="Items With Recipe "
            />
          ),
          path: "/master/menu-item",
          pageName: "Items With Recipe",
        },
      ],
    },
    {
      title: (
        <FormattedMessage id="COMMON.DECOR_MASTER" defaultMessage="Decor Master" />
      ),
      icon: "  text-lg ki-filled ki-additem text-primary",
      moduleName:"Decor",
      children: [
        {
          title: (
            <FormattedMessage
              id="DECOR_CATEGORY.MASTER"
              defaultMessage="Decor Category"
            />
          ),
          path: "/master/decor-category",
          pageName: "Decor Category",
        },
      
      

        {
          title: (
            <FormattedMessage
              id="DECOR_ITEM.MASTER"
              defaultMessage="Decor Items "
            />
          ),
          path: "/master/decor-item",
          pageName: "Decor Items",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.DECOR_PACKAGE_MASTER"
              defaultMessage="Decor Package "
            />
          ),
          path: "/master/decor-package",
          pageName: "Decor Package",
        },
      ],
    },
    // {
    //   title: <FormattedMessage id="COMMON.REPORTS" defaultMessage="Reports" />,
    //   icon: "  text-lg ki-duotone ki-document text-primary",
    //   children: [
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.DATE_WISE_REPORTS"
    //           defaultMessage="Date Wise Reports"
    //         />
    //       ),
    //       path: "/report-datewise",
    //     },
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.REPORT_CONFIGURATION"
    //           defaultMessage="Report Configuration"
    //         />
    //       ),
    //       path: "/report-congiguration",
    //     },
    //   ],
    // },

    {
      title: (
        <FormattedMessage id="COMMON.MANAGER_TASK_AND_MASTER" defaultMessage="Manager Task & Master" />
      ),
      icon: "ki-filled ki-book-open text-primary",
      moduleName: "Assign Manager",
      children: [
        
        {
      title: (
        <FormattedMessage
          id="COMMON.ASSIGN_TASK"
          defaultMessage="Assign Task"
        />
      ),
      
      path: "/assigntask",
      pageName: "Assign Manager",
      
    },
        {
      title: (
        <FormattedMessage
          id="COMMON.CUSTOM_MANAGER_TASK_MASTER"
          defaultMessage="Manager Task Master"
        />
      ),
      
      path: "/managertaskmaster",
      pageName: "Manager Task Master",
      
    },
      ],
    },
  
 
     {
      title: (
        <FormattedMessage
          id="COMMON.CAPTAIN_RECIPES"
          defaultMessage="Captain Recipe"
        />
      ),
      icon: "ki-filled ki-book text-primary",
      path: "/captainrecipe",
      pageName: "Captain Recipe",
      moduleName: "Captain Recipe",
    },
    {
      title: (
        <FormattedMessage
          id="COMMON.CUSTOM_THEMES"
          defaultMessage="Custom Themes"
        />
      ),
      icon: "ki-filled ki-color-swatch text-primary",
      path: "/adminreportcustomtheme",
      pageName: "Custom Themes",
    },
    // {
    //   title: (
    //     <FormattedMessage id="COMMON.CUSTOM_THEMES" defaultMessage="Ticket" />
    //   ),
    //   icon: "ki-filled ki-clipboard  text-primary",
    //   path: "/queries",
    //   pageName: "Custom Themes",
    // },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="COMMON.CUSTOM_THEMES"
    //       defaultMessage="Dynamic Reports"
    //     />
    //   ),
    //   icon: "ki-filled ki-color-swatch text-primary",
    //   path: "/report",
    //   pageName: "Reports",
    // },
    {
      title: (
        <FormattedMessage
          id="COMMON.ADMIN_MODULE_REPORT"
          defaultMessage="Reports"
        />
      ),
      icon: " ki-filled ki-document text-primary",
      
      moduleName: "Reports",
      children: [
        // {
        //   title: (
        //     <FormattedMessage id="COMMON.QUOTATION" defaultMessage="All Booking Reports" />
        //   ),
        //   path: "/allreports/",
        //   disabled: true
        // },
        {
          title: (
            <FormattedMessage
              id="REPORTS.ADMIN_MODULE_REPORT"
              defaultMessage="Datewise Reports"
            />
          ),
          path: "/adminmodulereport",
          pageName: "Datewise Reports",
        },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.INVOICE"
        //       defaultMessage="Datewise Booking Reports"
        //     />
        //   ),
        //   path: "/adminmoduleorderreport",
        //   pageName: "Datewise Booking Reports",
        // },
      ],
    },
    {
      title: <FormattedMessage id="COMMON.SALES" defaultMessage="Sales" />,
      icon: "  text-lg ki-filled ki-graph-up text-primary",
       moduleName: "Sales",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.QUOTATION"
              defaultMessage="Quotation"
            />
          ),
          path: "/quotation-dashboard",
          pageName: "Sales Quotation",
        },
        {
          title: (
            <FormattedMessage id="COMMON.INVOICE" defaultMessage="Invoice" />
          ),
          path: "/sales/invoice-dashboard",
          pageName: "Sales Invoice",
        },
      ],
    },

    {
      title: (
        <FormattedMessage
          id="COMMONSIDEBAR.CONFIGURATION"
          defaultMessage="Configuration"
          
        />
      ),
      icon: "  text-lg ki-filled ki-setting text-primary",
      disabled: false,
      moduleName: "Configuration",
      children: [
        {
          title: (
            <FormattedMessage
id="COMMON.ITEMRAWMATERIALUNITCHANGE"              defaultMessage="Item Raw Material Unit Change"
            />
          ),
          path: "/unitchange",
          pageName: "Unit Change",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.RAWMATERIALQUANTITYCHANGE"
              defaultMessage=" Raw Material Quantity Change"
            />
          ),
          path: "/raw-material-change",
          pageName: "Raw Material Change",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CROCKERYCONFIGURATION"
              defaultMessage="Crockery Configuration"
            />
          ),
          path: "/configuration/CrockeryConfiguration",
          pageName: "Crockery Configuration",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CHANGERAWMATERIALCATEGORY"
              defaultMessage="Change Raw Material Category"
            />
          ),
          path: "/configuration/changerawraterialcategory",
          pageName: "Change Raw Material Category",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CHANGESIDEBARMENUITEM"
              defaultMessage="Change Menu Item Category"
            />
          ),
          path: "/configuration/changemenuitemcategory",
          pageName: "Change Menu Item Category",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CHANGEMENUITEMALLOCATION"
              defaultMessage="Menu Item Allocation"
            />
          ),
          path: "/configuration/confimenuitemallocate",
          pageName: "Menu Item Allocation",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CHANGEALLOCATESUPLIER"
              defaultMessage="Allocate Supplier"
            />
          ),
          path: "/configuration/allocationsupplier",
          pageName: "Allocate Supplier",
        },
      ],
    },
{
  title: (
    <a
      href={`https://crm.justcatering.in/sso?t=${encodeURIComponent(
        localStorage.getItem("userToken") || ""
      )}`}
      target="_blank"
     
      className="flex items-center w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <FormattedMessage id="COMMON.CRM" defaultMessage="CRM" />
      <span className="ml-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">
        PRO
      </span>
    </a>
  ),
  icon: "ki-filled ki-security-user text-lg text-blue-600",
  path: "#",
  pageName: "CRM",
  moduleName: "CRM",
  alwaysVisible: true,
},
    {
     title: (
    <div className="w-full flex justify-between items-center">
      <FormattedMessage
        id="COMMONSIDEBAR.ACCOUNT"
        defaultMessage="Account"
      />
    </div>
  ),
      icon: "ki-filled ki-bank text-primary",
      pageName: "Account",
      moduleName: "Account",
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.DEBIT"
              defaultMessage="Debit"
            />
          ),
          path: "/bank-payment",
          pageName: "Debit",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CREDIT"
              defaultMessage="Credit"
            />
          ),
          path: "/cash-recipet",
          pageName: "Credit",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.JOURNAL_VOUCHER"
              defaultMessage="Journal Voucher"
            />
          ),
          path: "/journal-voucher",
          pageName: "Journal Voucher",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.GST_REPORT"
              defaultMessage="GST Report"
            />
          ),
          path: "/gst-report",
          pageName: "GST Report",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.ACCOUNT_LEDGER"
              defaultMessage="Account Ledger"
            />
          ),
          path: "/account",
          pageName: "Account Ledger",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.PAYMENTS"
              defaultMessage="Payments"
            />
          ),
          path: "/Payments",
          pageName: "Payments",
        },

        {
          title: (
            <FormattedMessage
              id="COMMON.CASH_BOOK"
              defaultMessage="Cash Book "
            />
          ),
          path: "/cash/cash-book",
          pageName: "Cash Book",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.BANK_BOOK"
              defaultMessage="Bank Book"
            />
          ),
          path: "/bank/bank-book",
          pageName: "Bank Book",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CONTACT_TYPE"
              defaultMessage="Transfer"
            />
          ),
          path: "/transfer",
          pageName: "Transfer",
        },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Payable"
        //     />
        //   ),
        //   path: "/super/payable",
        //   pageName: "Payable",
        // },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Receivable"
        //     />
        //   ),
        //   path: "/receivable",
        //   pageName: "receivable",
        // },
        {
          title: (
            <FormattedMessage
              id="COMMON.EXPENSE"
              defaultMessage="Expense"
            />
          ),
          path: "/account/expense",
          pageName: "Expense",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.ACCOUNT_CONTACT"
              defaultMessage="Account Contact "
            />
          ),
          path: "/master/accountmaster",
          pageName: "Account Contact",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.INCOME_EXPENSE_TYPE"
              defaultMessage="Income/Expense Type"
            />
          ),
          path: "/master/ExpenseType",
          pageName: "Income Expense Type",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.PROFIT_AND_LOSS"
              defaultMessage="Profit and Loss"
            />
          ),
          path: "/super-admin/P&l",
          pageName: "ProfitandLoss",
        },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.CONTACT_TYPE"
        //       defaultMessage="Income"
        //     />
        //   ),
        //   path: "/super-admin/income",
        //   pageName: "Income",
        // },
      ],
    },

    {
      title: (
        <div className="w-full flex justify-between items-center">
          <FormattedMessage
            id="COMMON.STOCK_MANAGEMENT"
            defaultMessage="Stock"
          />
        </div>
      ),
      icon: "ki-filled ki-chart-simple text-primary text-lg",
      pageName: "Stock",
      moduleName: "Stock",
      disabled: false,
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.RAW_MATERIAL_OPB"
              defaultMessage="Raw Material OPB"
            />
          ),
          path: "/master/rawmaterial-opb",
          pageName: "Raw Material OPB",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.STOCK_TYPE"
              defaultMessage="Stock Type"
            />
          ),
          path: "/stock-management/stock-type",
          pageName: "Stock Type",
        },

        {
          title: (
            <FormattedMessage
              id="BREADCRUMBS_PURCHASE"
              defaultMessage="Purchase"
            />
          ),
          path: "/stock-management/purchase",
          pageName: "Purchase",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.PURCHASE_RETURN"
              defaultMessage="Purchase Return"
            />
          ),
          path: "/stock-management/purchase-return",
          pageName: "Purchase Return",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.STORE_PO"
              defaultMessage="Store Issue"
            />
          ),
          path: "/stock-management/store-po",
          pageName: "Store Issue",
        },
        {
          title: (
            <FormattedMessage
              id="USER.STORE_ISSUE_RETURN.TITLE"
              defaultMessage="Store Issue Return"
            />
          ),
          path: "/stock-management/store-po-return",
          pageName: "Store Issue Return",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.AUTO_MANUAL_PO"
              defaultMessage="Auto / Manual PO"
            />
          ),
          path: "/stock-management/automanualpo",
          pageName: "Auto Manual PO",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CHEF_REQUISITION"
              defaultMessage="Chef Requisition"
            />
          ),
          path: "/stock-management/chef-requisition",
          pageName: "Chef Requisition",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.STOCK_LEDGER"
              defaultMessage="Stock Ledger"
            />
          ),
          path: "/stock-management/store-ledger",
          pageName: "Store Ledger",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.STORE_ORDERING_TICKETS"
              defaultMessage="Store Ordering Tickets"
            />
          ),
          path: "/stock-management/store-ordering-tickets",
          pageName: "Store Ordering Tickets",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.CROCKERY_SOT"
              defaultMessage="Crockery SOT"
            />
          ),
          path: "/stock-management/crockery-sot",
          pageName: "Crockery SOT",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.DAILY_STOCK_MANAGE"
              defaultMessage="Daily Stock Manage"
            />
          ),
          path: "/stock-management/daily-stock-manage",
          pageName: "Daily Stock Manage",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.STOCK_REPORT"
              defaultMessage="Stock Report"
            />
          ),
          path: "/stock-management/stock-report",
          pageName: "Stock Report",
        },

        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.NOTIFICATIONS"
        //       defaultMessage="Notifications"
        //     />
        //   ),
        //   path: "settings/notifications",
        // },
      ],
    },

    // {
    //   title: (
    //     <div className="w-full flex justify-between items-center">
    //       <FormattedMessage id="COMMON.MARKETING" defaultMessage="Marketing" />
    //       <span
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           navigate("/upgrade");
    //         }}
    //         className="text-white bg-primary text-[12px] p-1 rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
    //       >
    //         Upgrade
    //       </span>
    //     </div>
    //   ),
    //   icon: "ki-filled ki-graph text-primary text-lg",
    //   path: "/marketing",
    //   pageName: "Marketing",
    //   disabled: false,
    //   children: [
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.MARKETING_DASHBOARD"
    //           defaultMessage="Dashboard"
    //         />
    //       ),
    //       path: "/marketing/dashboard",
    //       pageName: "Dashboard",
    //     },

    //     {
    //       title: (
    //         <FormattedMessage id="BREADCRUMBS_PROFILE" defaultMessage="Profile" />
    //       ),
    //       path: "/marketing/profile",
    //       pageName: "Profile",
    //     },

    //     {
    //       title: (
    //         <FormattedMessage
    //           id="BREADCRUMBS_SERVICES"
    //           defaultMessage="Services"
    //         />
    //       ),
    //       path: "/marketing/services",
    //       pageName: "Services",
    //     },

    //     {
    //       title: (
    //         <FormattedMessage
    //           id="BREADCRUMBS_PACKAGES"
    //           defaultMessage="Packages"
    //         />
    //       ),
    //       path: "/marketing/packages",
    //       pageName: "Packages",
    //     },
    //     {
    //       title: <FormattedMessage id="COMMON.OFFERS" defaultMessage="Offers" />,
    //       path: "/marketing/offers",
    //       pageName: "Offers",
    //     },
    //     {
    //       title: (
    //         <FormattedMessage id="COMMON.PORTFOLIO" defaultMessage="Portfolio" />
    //       ),
    //       path: "/marketing/portfolio",
    //       pageName: "Portfolio",
    //     },
    //   ],
    // },

    // {
    //   title: (
    //     <div className="w-full flex justify-between items-center">
    //       <FormattedMessage id="COMMON.RECIPE" defaultMessage="Recipe" />
    //       <span
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           navigate("/upgrade");
    //         }}
    //         className="text-white bg-primary text-[12px] p-1 rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
    //       >
    //         Upgrade
    //       </span>
    //     </div>
    //   ),
    //   icon: "ki-filled ki-book text-primary text-lg",
    //   path: "/recipe",
    //   pageName: "Recipe",
    //   disabled: false,
    // },
    // {
    //   title: (
    //     <div className="w-full flex justify-between items-center">
    //       <FormattedMessage id="COMMON.CUSTOM_THEMES" defaultMessage="CRM" />
    //     </div>
    //   ),
    //   icon: "ki-filled ki-profile-circle text-primary",
    //   pageName: "CRM",
    //   moduleName: "CRM",
    //   children: [
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
    //           defaultMessage="Sources"
    //         />
    //       ),
    //       path: "/superadmin/source",
    //       pageName: "Sources",
    //     },
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
    //           defaultMessage="SubSources"
    //         />
    //       ),
    //       path: "/superadmin/subsource",
    //       pageName: "SubSources",
    //     },
    //     {
    //       title: (
    //         <FormattedMessage
    //           id="COMMON.CONTACT_TYPE"
    //           defaultMessage="Pipelines"
    //         />
    //       ),
    //       path: "/pipeline",
    //       pageName: "Pipelines",
    //     },
    //     {
    //       title: (
    //         <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Leads" />
    //       ),
    //       path: "/super-leads",
    //       pageName: "Leads",
    //     },
    //   ],
    // },
    {
      title: (
        <FormattedMessage id="COMMON.SETTINGS" defaultMessage="Settings" />
      ),
      icon: "ki-filled ki-setting-2 text-primary  text-lg",
      disabled: false,
      children: [
        {
          title: (
            <FormattedMessage
              id="COMMON.COMPANY_PROFILE"
              defaultMessage="Company Profile"
            />
          ),
          path: "/settings/general",
          pageName: "Company Profile",
        },
        {
          title: (
            <FormattedMessage
              id="BREADCRUMBS_USER_RIGHTS"
              defaultMessage="User Rights"
            />
          ),
          path: "/user-rights",
          pageName: "User Rights",
        },
        // {
        //   title: (
        //     <FormattedMessage
        //       id="BREADCRUMBS_USER_RIGHTS"
        //       defaultMessage="Report Rights"
        //     />
        //   ),
        //   path: "/report-rights",
        //   pageName: "Report Rights",
        // },
        {
          title: (
            <FormattedMessage
              id="BREADCRUMBS_USER_RIGHTS"
              defaultMessage="Integrations"
            />
          ),
          path: "/integrations",
          pageName: "Integrations",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.UTILITY_PAGE"
              defaultMessage="Utility Page"
            />
          ),
          path: "/utility",
          pageName: "Utility Page",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.REPORT_CONGIGURATION"
              defaultMessage="Report Configuration"
            />
          ),
          path: "/report-config",
          pageName: "Report Configuration",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.SUBSCRIPTION"
              defaultMessage="Subscription"
            />
          ),
          path: "/settings/subscription",
          pageName: "Subscription",
        },
        {
          title: (
            <FormattedMessage
              id="COMMON.PAYMENT_HISTORY"
              defaultMessage="Payment History"
            />
          ),
          path: "/setting/payment-history",
          pageName: "Payment History",
        },

        // {
        //   title: (
        //     <FormattedMessage
        //       id="COMMON.NOTIFICATIONS"
        //       defaultMessage="Notifications"
        //     />
        //   ),
        //   path: "settings/notifications",
        // },
      ],
    },
  ];
};

export const superAdminMenuItems = [
  {
    title: (
      <FormattedMessage id="COMMON.DASHBOARD" defaultMessage="Dashboard" />
    ),
    icon: "element-11 text-primary",
    path: "/super-dashboard",
    pageName: "Dashboard",
  },
  {
    title: "Calender",
    icon: "ki-filled ki-calendar-tick text-primary",
    path: "/super-calendar",
    pageName: "Calendar",
  },
  {
    title: (
      <FormattedMessage
        id="COMMON.MEMBER_LIST"
        defaultMessage="Client Insight "
      />
    ),
    icon: "ki-filled ki-user text-primary",
    children: [
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Client Dashboard"
          />
        ),
        path: "/client-insight/Dashboard",
        pageName: "clientdashboard",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Daily Activity Report"
          />
        ),
        path: "/member/clientinsight",
        pageName: "Demo Member",
      },
    ],
  },
  {
    title: (
      <FormattedMessage id="COMMON.MEMBER_LIST" defaultMessage="Member " />
    ),
    icon: "ki-filled ki-user text-primary",
    children: [
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Lead Member"
          />
        ),
        path: "/master/leadusers",
        pageName: "Lead Member",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Demo Member"
          />
        ),
        path: "/master/demousers",
        pageName: "Demo Member",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Active Member"
          />
        ),
        path: "/master/user-master/",
        pageName: "Members",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Tap Inquiry"
          />
        ),
        path: "/tapinquiry",
        pageName: "Members",
      },
    ],
  },
  {
    title: <FormattedMessage id="COMMON.MEMBER_LIST" defaultMessage="Vendor" />,
    icon: "ki-filled ki-users text-primary",
    path: "/vendors",
    pageName: "Vendors",
  },
  // {
  //   title: (
  //     <FormattedMessage id="COMMON.MEMBER_LIST" defaultMessage="Expense" />
  //   ),
  //   icon: "ki-filled ki-users text-primary",
  //   path: "/expense",
  //   pageName: "Expense",
  // },

  {
    title: (
      <FormattedMessage id="COMMON.MASTER" defaultMessage="Superadmin Master" />
    ),
    icon: "ki-filled ki-abstract-26 text-primary",
    children: [
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACTSIDEBAR_CATEGORIES"
      //       defaultMessage="Categories "
      //     />
      //   ),
      //   pageName: "Categories",
      //   path: "/master/contact-categories",
      // },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Categories Type"
          />
        ),
        path: "/super-contact-type-master",
        pageName: "Categories",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_CATEGORIES"
            defaultMessage="Raw Material "
          />
        ),
        path: "/super-raw-material-type-master",
        pageName: "Raw Material",
      },
      {
        title: <FormattedMessage id="COMMON.CUSTOMERS" defaultMessage="Unit" />,
        path: "/super-unit-master",
        pageName: "Unit",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CUSTOMERS" defaultMessage="Theme Type" />
        ),
        path: "/super-templateMapping",
        pageName: "Theme Type",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CUSTOMERS" defaultMessage="Theme" />
        ),
        path: "/super-template-name-master",
        pageName: "Theme",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMERS"
            defaultMessage="Interaction"
          />
        ),
        path: "/interaction-master",
        pageName: "Interaction",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMERS"
            defaultMessage="Report Configuration"
          />
        ),
        path: "/super-allreport-config",
        pageName: "Report Configuration",
      },

      {
        title: (
          <FormattedMessage
            id="COMMON.EXTRA_PAYMENTS"
            defaultMessage="Extra Payments"
          />
        ),
        path: "/extrapayment",
        pageName: "Extra Payments",
      },
      {
        title: (
          <FormattedMessage id="COMMON.COUPONS" defaultMessage="Coupons" />
        ),
        path: "/coupon",
        pageName: "Coupons",
      },

      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Fonts"
          />
        ),
        path: "/master/Fonts",
        pageName: "Fonts",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Sources"
          />
        ),
        path: "/superadmin/source",
        pageName: "Sources",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="SubSources"
          />
        ),
        path: "/superadmin/subsource",
        pageName: "SubSources",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Income/Expense Type"
          />
        ),
        path: "/master/ExpenseType",
        pageName: "Income/ExpenseType",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Account Contact "
          />
        ),
        path: "/master/accountmaster",
        pageName: "accountmaster",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Push Notification "
          />
        ),
        path: "/PushNotification",
        pageName: "accountmaster",
      },
    ],
  },

  // Aimodule
  {
    title: (
      <span className="px-2 py-1 rounded-md text-violet-600 font-semibold flex items-center gap-1.5">
        <span className="relative flex items-center justify-center w-4 h-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-violet-500 animate-pulse"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="currentColor"
            />
            <path
              d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M5 4L5.5 5.5L7 6L5.5 6.5L5 8L4.5 6.5L3 6L4.5 5.5L5 4Z"
              fill="currentColor"
              opacity="0.4"
            />
          </svg>
          <span className="absolute inset-0 rounded-full bg-violet-400 opacity-20 animate-ping" />
        </span>
        <FormattedMessage id="COMMON.MASTER" defaultMessage="AI Module" />
      </span>
    ),
    icon: "ki-filled ki-abstract-26 text-violet-500",
    children: [
      {
        title: (
          <span className="px-2 py-1 text-violet-600 flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-3 h-3 text-violet-400"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="currentColor"
              />
            </svg>
            <FormattedMessage id="COMMON.MASTER" defaultMessage="AI Template" />
          </span>
        ),
        path: "/ai-templatemaster",
        pageName: "Ai Template",
      },
    ],
  },

  {
    title: <FormattedMessage id="COMMON.MASTER" defaultMessage="Leads" />,
    icon: "ki-filled ki-abstract-26 text-primary",
    children: [
      {
        title: (
          <FormattedMessage id="COMMON.MEMBER_LIST" defaultMessage="Users" />
        ),
        icon: "ki-filled ki-users text-primary",
        path: "/superadmin/members",
        pageName: "Users",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage=" Dashboard"
          />
        ),
        path: "/superadmin/teamperformance",
        pageName: "Empoloyee Dashboard",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage=" Performance"
          />
        ),
        path: "/superadmin/employeeperformance",
        pageName: " Performance",
      },

      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Pipelines"
          />
        ),
        path: "/pipeline",
        pageName: "Pipelines",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Leads" />
        ),
        path: "/super-leads",
        pageName: "Leads",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Follow Up"
          />
        ),
        path: "/superadmin/lead/followup",
        pageName: "Follow Up",
      },
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage="Employee Dashbaord"
      //     />
      //   ),
      //   path: "/superadmin/employeedashboard",
      //   pageName: "Employee Dashbaord",
      // },

      {
        title: (
          <FormattedMessage
            id="COMMON.DEPARTMENTSIDEBAR"
            defaultMessage="Department"
          />
        ),
        icon: "ki-filled ki-users text-primary",
        path: "/master/role",
        pageName: "Department",
      },
    ],
  },

  {
    title: (
      <FormattedMessage id="COMMON.MASTER" defaultMessage="User Right Master" />
    ),
    icon: "ki-filled ki-abstract-26 text-primary",
    children: [
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMERS"
            defaultMessage="Module Right Name"
          />
        ),
        path: "/ModuleRights",
        pageName: "Module Right Name",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Pages" />
        ),
        path: "/pages-master",
        pageName: "Pages",
      },
    ],
  },

  {
    title: (
      <FormattedMessage id="COMMON.CUSTOM_THEMES" defaultMessage="Themes" />
    ),
    icon: "ki-filled ki-color-swatch text-primary",
    children: [
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOM_ALL_THEMES"
            defaultMessage="All Themes"
          />
        ),
        path: "/super-reportcustomethemes",
        pageName: "All Themes",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOM_NAMEPLATES"
            defaultMessage="Nameplates"
          />
        ),
        path: "/super-reportcustomethemes/nameplates",
        pageName: "Nameplates",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOM_QUOTATIONS"
            defaultMessage="Quotations"
          />
        ),
        path: "/super-reportcustomethemes/quotations",
        pageName: "Quotations",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOM_INVOICES"
            defaultMessage="Invoices"
          />
        ),
        path: "/super-reportcustomethemes/invoices",
        pageName: "Invoices",
      },
    ],
  },
  {
    title: "Plans",
    icon: "ki-filled ki-crown text-primary",
    path: "/plans",
    pageName: "Plans",
  },
  {
    title: "Extra Features",
    icon: "ki-filled ki-star  text-primary",
    path: "/upgrade-module",
    pageName: "Extra Features",
  },
  {
    title: "Database",
    icon: "ki-filled ki-abstract-26 text-primary",
    path: "/database",
    pageName: "Database",
  },
  {
    title: (
      <FormattedMessage id="COMMON.SIDEBAR_USERS" defaultMessage="Ticket" />
    ),
    icon: "  text-lg ki-filled ki-user text-primary",
    children: [
      {
        title: (
          <FormattedMessage
            id="COMMON.USERSIDEBAR_MASTER"
            defaultMessage="SuperTicket"
          />
        ),
        path: "/super/ticketdahboard",
        pageName: "User Master",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.USERSIDEBAR_MASTER"
            defaultMessage="Devloper"
          />
        ),
        path: "/super/ticket/devloperdashboard",
        pageName: "User Master",
      },
    ],
  },
  {
    title: (
      <FormattedMessage
        id="COMMON.RENEWAL_CUSTOMER"
        defaultMessage="Renewal Customer"
      />
    ),
    icon: "ki-filled ki-users text-primary",
    path: "/renewal-history",
    pageName: "Renewal Customer",
  },

  // {
  //   title: (
  //     <FormattedMessage
  //       id="COMMON.INVOICE_LIST"
  //       defaultMessage="superadmin Invoices"
  //     />
  //   ),
  //   icon: "ki-filled ki-minus-folder text-primary",
  //   path: "/admin-invoice",
  //   pageName: "superadmin Invoices",
  // },

  {
    title: (
      <FormattedMessage id="COMMON.MEMBER_LIST" defaultMessage="Super Admin Account " />
    ),
    moduleName:"SuperAdminAccount",
    icon: "ki-filled ki-user text-primary",
    children: [
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage="Dashboard"
      //     />
      //   ),
      //   path: "/super/account/dashboard",
      //   pageName: "Dashboard",
      // },
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage="Account Ledger"
      //     />
      //   ),
      //   path: "/SuperAdminAccountLedger",
      //   pageName: "AccountLedger",
      // },
       {
          title: (
            <FormattedMessage
              id="COMMON.CHANGESIDEARRAWMATIRAL"
              defaultMessage="Account Ledger"
            />
          ),
          path: "/account",
          pageName: "Account Ledger",
        },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Cash OPB"
          />
        ),
        path: "/Cash-account",
        pageName: "CashOPB",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CUSTOMSIDEBAR_BANK_DETAILS"
            defaultMessage="Bank Details"
          />
        ),
        path: "/master/bank-details",
        pageName: "BankDetails",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Cash Book "
          />
        ),
        path: "/cash/cash-book",
        pageName: "cashBook",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Bank Book"
          />
        ),
        path: "/bank/bank-book",
        pageName: "BankBook",
      },
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage="Account Book"
      //     />
      //   ),
      //   path: "/accoutbook",
      //   pageName: "AccountBook",
      // },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Cash Recipet "
          />
        ),
        path: "/cash/cash-recipet",
        pageName: "CashRecipet",
      },

      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Bank Recipet "
          />
        ),
        path: "/bank/bank-recipet",
        pageName: "BankRecipet",
      },
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage=" Recipet "
      //     />
      //   ),
      //   path: "/reciptManage",
      //   pageName: "Recipet",
      // },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Bank Payment "
          />
        ),
        path: "/bank/bank-payment",
        pageName: "Bankpayment",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="cash Payment "
          />
        ),
        path: "/cash/cash-payment",
        pageName: "cashpayment",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Transfer"
          />
        ),
        path: "/transfer",
        pageName: "Transfer",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Payable" />
        ),
        path: "/super/payable",
        pageName: "Payable",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Receivable"
          />
        ),
        path: "/receivable",
        pageName: "receivable",
      },

      // {
      //   title: (
      //     <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Payable" />
      //   ),
      //   path: "/payable",
      //   pageName: "Payable",
      // },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Invoice "
          />
        ),
        path: "/admin-invoice",
        pageName: "Invoice",
      },
      // {
      //   title: (
      //     <FormattedMessage
      //       id="COMMON.CONTACT_TYPE"
      //       defaultMessage="OldExpense"
      //     />
      //   ),
      //   path: "/expense",
      //   pageName: "Expense",
      // },
      {
        title: (
          <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Expense" />
        ),
        path: "/account/expense",
        pageName: "Expense",
      },
      {
        title: (
          <FormattedMessage id="COMMON.CONTACT_TYPE" defaultMessage="Income" />
        ),
        path: "/super-admin/income",
        pageName: "Income",
      },
      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Proforma Invoice"
          />
        ),
        path: "/super-proforma-invoice",
        pageName: "ProformaInvoice",
      },

      {
        title: (
          <FormattedMessage
            id="COMMON.CONTACT_TYPE"
            defaultMessage="Profit and Loss"
          />
        ),
        path: "/super-admin/P&l",
        pageName: "ProfitandLoss",
      },
    ],
  },
];

export const MENU_MEGA = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Profiles",
    children: [
      {
        title: "Profiles",
        children: [
          {
            children: [
              {
                title: "Default",
                icon: "badge",
                path: "/public-profile/profiles/default",
              },
              {
                title: "Creator",
                icon: "coffee",
                path: "/public-profile/profiles/creator",
              },
              {
                title: "Company",
                icon: "abstract-41",
                path: "/public-profile/profiles/company",
              },
              {
                title: "NFT",
                icon: "bitcoin",
                path: "/public-profile/profiles/nft",
              },
              {
                title: "Blogger",
                icon: "message-text",
                path: "/public-profile/profiles/blogger",
              },
              {
                title: "CRM",
                icon: "devices",
                path: "/public-profile/profiles/crm",
              },
              {
                title: "Gamer",
                icon: "ghost",
                path: "/public-profile/profiles/gamer",
              },
            ],
          },
          {
            children: [
              {
                title: "Feeds",
                icon: "book",
                path: "/public-profile/profiles/feeds",
              },
              {
                title: "Plain",
                icon: "files",
                path: "/public-profile/profiles/plain",
              },
              {
                title: "Modal",
                icon: "mouse-square",
                path: "/public-profile/profiles/modal",
              },
              {
                title: "Freelancer",
                icon: "financial-schedule",
                path: "#",
                disabled: true,
              },
              {
                title: "Developer",
                icon: "technology-4",
                path: "#",
                disabled: true,
              },
              {
                title: "Team",
                icon: "users",
                path: "#",
                disabled: true,
              },
              {
                title: "Events",
                icon: "calendar-tick",
                path: "#",
                disabled: true,
              },
            ],
          },
        ],
      },
      {
        title: "Other Pages",
        children: [
          {
            children: [
              {
                title: "Projects - 3 Columns",
                icon: "element-6",
                path: "/public-profile/projects/3-columns",
              },
              {
                title: "Projects - 2 Columns",
                icon: "element-4",
                path: "/public-profile/projects/2-columns",
              },
              {
                title: "Works",
                icon: "office-bag",
                path: "/public-profile/works",
              },
              {
                title: "Teams",
                icon: "people",
                path: "/public-profile/teams",
              },
              {
                title: "Network",
                icon: "icon",
                path: "/public-profile/network",
              },
              {
                title: "Activity",
                icon: "chart-line-up-2",
                path: "/public-profile/activity",
              },
              {
                title: "Campaigns - Card",
                icon: "element-11",
                path: "/public-profile/campaigns/card",
              },
            ],
          },
          {
            children: [
              {
                title: "Campaigns - List",
                icon: "kanban",
                path: "/public-profile/campaigns/list",
              },
              {
                title: "Empty",
                icon: "file-sheet",
                path: "/public-profile/empty",
              },
              {
                title: "Documents",
                icon: "document",
                path: "#",
                disabled: true,
              },
              {
                title: "Badges",
                icon: "award",
                path: "#",
                disabled: true,
              },
              {
                title: "Awards",
                icon: "gift",
                path: "#",
                disabled: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "My Account",
    children: [
      {
        title: "General Pages",
        children: [
          {
            title: "Integrations",
            icon: "technology-2",
            path: "/account/integrations",
          },
          {
            title: "Notifications",
            icon: "notification-1",
            path: "/account/notifications",
          },
          {
            title: "API Keys",
            icon: "key",
            path: "/account/api-keys",
          },
          {
            title: "Appearance",
            icon: "eye",
            path: "/account/appearance",
          },
          {
            title: "Invite a Friend",
            icon: "user-tick",
            path: "/account/invite-a-friend",
          },
          {
            title: "Activity",
            icon: "support",
            path: "/account/activity",
          },
          {
            title: "Brand",
            icon: "verify",
            disabled: true,
          },
          {
            title: "Get Paid",
            icon: "euro",
            disabled: true,
          },
        ],
      },
      {
        title: "Other pages",
        children: [
          {
            title: "Account Home",
            children: [
              {
                title: "Get Started + ",
                path: "/account/home/get-started",
              },
              {
                title: "User Profile",
                path: "/account/home/user-profile",
                disabled: true,
                statusLabel: "Locked ",
              },
              {
                title: "Company Profile",
                path: "/account/home/company-profile",
              },
              {
                title: "With Sidebar",
                path: "/account/home/settings-sidebar",
              },
              {
                title: "Enterprise",
                path: "/account/home/settings-enterprise",
              },
              {
                title: "Plain",
                path: "/account/home/settings-plain",
              },
              {
                title: "Modal",
                path: "/account/home/settings-modal",
              },
            ],
          },
          {
            title: "Billing",
            children: [
              {
                title: "Basic Billing",
                path: "/account/billing/basic",
              },
              {
                title: "Enterprise",
                path: "/account/billing/enterprise",
              },
              {
                title: "Plans",
                path: "/account/billing/plans",
              },
              {
                title: "Billing History",
                path: "/account/billing/history",
              },
              {
                title: "Tax Info",
                disabled: true,
              },
              {
                title: "Invoices",
                disabled: true,
              },
              {
                title: "Gateaways",
                disabled: true,
              },
            ],
          },
          {
            title: "Security",
            children: [
              {
                title: "Get Started",
                path: "/account/security/get-started",
              },
              {
                title: "Security Overview",
                path: "/account/security/overview",
              },
              {
                title: "IP Addresses",
                path: "/account/security/allowed-ip-addresses",
              },
              {
                title: "Privacy Settings",
                path: "/account/security/privacy-settings",
              },
              {
                title: "Device Management",
                path: "/account/security/device-management",
              },
              {
                title: "Backup & Recovery",
                path: "/account/security/backup-and-recovery",
              },
              {
                title: "Current Sessions",
                path: "/account/security/current-sessions",
              },
              {
                title: "Security Log",
                path: "/account/security/security-log",
              },
            ],
          },
          {
            title: "Members & Roles",
            children: [
              {
                title: "Teams Starter",
                path: "/account/members/team-starter",
              },
              {
                title: "Teams",
                path: "/account/members/teams",
              },
              {
                title: "Team Info",
                path: "/account/members/team-info",
              },
              {
                title: "Members Starter",
                path: "/account/members/members-starter",
              },
              {
                title: "Team Members",
                path: "/account/members/team-members",
              },
              {
                title: "Import Members",
                path: "/account/members/import-members",
              },
              {
                title: "Roles",
                path: "/account/members/roles",
              },
              {
                title: "Permissions - Toggler",
                path: "/account/members/permissions-toggle",
              },
              {
                title: "Permissions - Check",
                path: "/account/members/permissions-check",
              },
            ],
          },
          {
            title: "Other Pages",
            children: [
              {
                title: "Integrations",
                path: "/account/integrations",
              },
              {
                title: "Notifications",
                path: "/account/notifications",
              },
              {
                title: "API Keys",
                path: "/account/api-keys",
              },
              {
                title: "Appearance",
                path: "/account/appearance",
              },
              {
                title: "Invite a Friend",
                path: "/account/invite-a-friend",
              },
              {
                title: "Activity",
                path: "/account/activity",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Network",
    children: [
      {
        title: "General Pages",
        children: [
          {
            title: "Get Started",
            icon: "flag",
            path: "/network/get-started",
          },
          {
            title: "Colleagues",
            icon: "users",
            path: "#",
            disabled: true,
          },
          {
            title: "Donators",
            icon: "heart",
            path: "#",
            disabled: true,
          },
          {
            title: "Leads",
            icon: "abstract-21",
            path: "#",
            disabled: true,
          },
        ],
      },
      {
        title: "Other pages",
        children: [
          {
            title: "User Cards",
            children: [
              {
                title: "Mini Cards",
                path: "/network/user-cards/mini-cards",
              },
              {
                title: "Team Members",
                path: "/network/user-cards/team-crew",
              },
              {
                title: "Authors",
                path: "/network/user-cards/author",
              },
              {
                title: "NFT Users",
                path: "/network/user-cards/nft",
              },
              {
                title: "Social Users",
                path: "/network/user-cards/social",
              },
              {
                title: "Gamers",
                path: "#",
                disabled: true,
              },
            ],
          },
          {
            title: "User Base",
            badge: "Datatables",
            children: [
              {
                title: "Team Crew",
                path: "/network/user-table/team-crew",
              },
              {
                title: "App Roster",
                path: "/network/user-table/app-roster",
              },
              {
                title: "Market Authors",
                path: "/network/user-table/market-authors",
              },
              {
                title: "SaaS Users",
                path: "/network/user-table/saas-users",
              },
              {
                title: "Store Clients",
                path: "/network/user-table/store-clients",
              },
              {
                title: "Visitors",
                path: "/network/user-table/visitors",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Authentication",
    children: [
      {
        title: "General pages",
        children: [
          {
            title: "Classic Layout",
            children: [
              {
                title: "Sign In",
                path: "/auth/classic/login",
              },
              {
                title: "Sign Up",
                path: "/auth/classic/signup",
              },
              {
                title: "2FA",
                path: "/auth/classic/2fa",
              },
              {
                title: "Check Email",
                path: "/auth/classic/check-email",
              },
              {
                title: "Reset Password",
                children: [
                  {
                    title: "Enter Email",
                    path: "/auth/classic/reset-password/enter-email",
                  },
                  {
                    title: "Check Email",
                    path: "/auth/classic/reset-password/check-email",
                  },
                  {
                    title: "Change Password",
                    path: "/auth/classic/reset-password/change",
                  },
                  {
                    title: "Password is Changed",
                    path: "/auth/classic/reset-password/changed",
                  },
                ],
              },
            ],
          },
          {
            title: "Branded Layout",
            children: [
              {
                title: "Sign In",
                path: "/auth/login",
              },
              {
                title: "Sign Up",
                path: "/auth/signup",
              },
              {
                title: "2FA",
                path: "/auth/2fa",
              },
              {
                title: "Check Email",
                path: "/auth/check-email",
              },
              {
                title: "Reset Password",
                children: [
                  {
                    title: "Enter Email",
                    path: "/auth/reset-password/enter-email",
                  },
                  {
                    title: "Check Email",
                    path: "/auth/reset-password/check-email",
                  },
                  {
                    title: "Change Password",
                    path: "/auth/reset-password/change",
                  },
                  {
                    title: "Password is Changed",
                    path: "/auth/reset-password/changed",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Other Pages",
        children: [
          {
            title: "Welcome Message",
            icon: "like-2",
            path: "/auth/welcome-message",
          },
          {
            title: "Account Deactivated",
            icon: "shield-cross",
            path: "/auth/account-deactivated",
          },
          {
            title: "Error 404",
            icon: "message-question",
            path: "/error/404",
          },
          {
            title: "Error 500",
            icon: "information",
            path: "/error/500",
          },
        ],
      },
    ],
  },
  {
    title: "Help",
    children: [
      {
        title: "Getting Started",
        icon: "coffee",
      },
      {
        title: "Support Forum",
        icon: "information",
        children: [
          {
            title: "All Questions",
            icon: "questionnaire-tablet",
          },
          {
            title: "Popular Questions",
            icon: "star",
          },
          {
            title: "Ask Question",
            icon: "message-question",
          },
        ],
      },
      {
        title: "Licenses & FAQ",
        tooltip: {
          title: "Learn more about licenses",
          placement: "right",
        },
        icon: "subtitle",
      },
      {
        title: "Documentation",
        icon: "questionnaire-tablet",
      },
      {
        separator: true,
      },
      {
        title: "Contact Us",
        icon: "share",
      },
    ],
  },
];

export const MENU_ROOT = [
  {
    title: "Public Profile",
    icon: "profile-circle",
    rootPath: "/public-profile/",
    path: "public-profile/profiles/default",
    childrenIndex: 2,
  },
  {
    title: "Account",
    icon: "setting-2",
    rootPath: "/account/",
    path: "/",
    childrenIndex: 3,
  },
  {
    title: "Network",
    icon: "users",
    rootPath: "/network/",
    path: "network/get-started",
    childrenIndex: 4,
  },
  {
    title: "Authentication",
    icon: "security-user",
    rootPath: "/authentication/",
    path: "authentication/get-started",
    childrenIndex: 5,
  },
];
