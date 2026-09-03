import { Navigate, Route, Routes } from "react-router";
import SsoLogin from "../auth/pages/SsoLogin.jsx";
import { Demo1DarkSidebarPage } from "@/pages/dashboards";
import {
  ProfileActivityPage,
  ProfileBloggerPage,
  CampaignsCardPage,
  CampaignsListPage,
  ProjectColumn2Page,
  ProjectColumn3Page,
  ProfileCompanyPage,
  ProfileCreatorPage,
  ProfileCRMPage,
  ProfileDefaultPage,
  ProfileEmptyPage,
  ProfileFeedsPage,
  ProfileGamerPage,
  ProfileModalPage,
  ProfileNetworkPage,
  ProfileNFTPage,
  ProfilePlainPage,
  ProfileTeamsPage,
  ProfileWorksPage,
} from "@/pages/public-profile";
import {
  AccountActivityPage,
  AccountAllowedIPAddressesPage,
  AccountApiKeysPage,
  AccountAppearancePage,
  AccountBackupAndRecoveryPage,
  AccountBasicPage,
  AccountCompanyProfilePage,
  AccountCurrentSessionsPage,
  AccountDeviceManagementPage,
  AccountEnterprisePage,
  AccountGetStartedPage,
  AccountHistoryPage,
  AccountImportMembersPage,
  AccountIntegrationsPage,
  AccountInviteAFriendPage,
  AccountMembersStarterPage,
  AccountNotificationsPage,
  AccountOverviewPage,
  AccountPermissionsCheckPage,
  AccountPermissionsTogglePage,
  AccountPlansPage,
  AccountPrivacySettingsPage,
  AccountRolesPage,
  AccountSecurityGetStartedPage,
  AccountSecurityLogPage,
  AccountSettingsEnterprisePage,
  AccountSettingsModalPage,
  AccountSettingsPlainPage,
  AccountSettingsSidebarPage,
  AccountTeamInfoPage,
  AccountTeamMembersPage,
  AccountTeamsPage,
  AccountTeamsStarterPage,
  AccountUserProfilePage,
} from "@/pages/account";
import {
  NetworkAppRosterPage,
  NetworkMarketAuthorsPage,
  NetworkAuthorPage,
  NetworkGetStartedPage,
  NetworkMiniCardsPage,
  NetworkNFTPage,
  NetworkSocialPage,
  NetworkUserCardsTeamCrewPage,
  NetworkSaasUsersPage,
  NetworkStoreClientsPage,
  NetworkUserTableTeamCrewPage,
  NetworkVisitorsPage,
} from "@/pages/network";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import {
  AuthenticationWelcomeMessagePage,
  AuthenticationAccountDeactivatedPage,
  AuthenticationGetStartedPage,
} from "@/pages/authentication";
import { LeadPage, LeadDetailPage, OverviewPage } from "@/pages/lead";
import { ProductListDetail, ProductListPage } from "@/pages/product";
import { ContactDetail, ContactListPage } from "@/pages/contact";
import { LinkList } from "@/pages/link";
import { CompanyListPage, CompanyDetails } from "@/pages/company";
import { SalesTeamList, MemberList } from "@/pages/team";
import {
  NotificationsSettingsPage,
  GeneralSettingsPage,
  SubscriptionSettingsPage,
  ChannelSettingsPage,
  UtilityPage,
} from "@/pages/setting";
import { BillingOverviewPage, WalletLogsPage } from "@/pages/billing";
import {
  ApplicationPage,
  TicketsPage,
  TutorialsPage,
  EventsPage,
  RaiseTicketPage,
  ProgressChecklistPage,
} from "@/pages/support";
import { FollowUpListPage } from "@/pages/follow-up";
import {
  TaskListPage,
  TaskTemplatePage,
  TaskDirectoryPage,
  TaskDashboard,
  MyTask,
} from "@/pages/tasks";
import { Holiday } from "@/pages/Leave/holiday";
import { MyLeaves } from "@/pages/Leave/my-leaves";
import { Approval } from "@/pages/Leave/approval";
import { Myattendance } from "@/pages/Leave/my-attendance/Myattendance";
import Allleave from "@/pages/Leave/all-leave/Allleave";
import { AllAttendance } from "@/pages/Leave/all-attendance";
import { LeaveType } from "@/pages/Leave/settings/leave-type/LeaveType";

import { AttendanceSetting } from "@/pages/Leave/settings/attendance-settings/AttendanceSettings";
import { OfficeSetting } from "@/pages/Leave/settings/offices-settings/OfficeSettings";

import Leavedashboard from "@/pages/Leave/dashboard/Leavedashboard";
import CalendarPage from "@/pages/Event/CalendarPage";
import CreateEventPage from "@/pages/Event/CreateEventPage";
import EventListPage from "@/pages/Event/EventListPage";
import EventPlanningPage from "../pages/Event/EventPlanningPage";
import EventMenuAllocationPage from "@/pages/Event/EventMenuAllocationPage";
import RawMaterialAllocationPage from "@/pages/Event/RawMaterialAllocationPage";
import GeneralFixPage from "@/pages/Event/GeneralFixPage";
import LabourOtherManagementPage from "@/pages/Event/LabourOtherManagementPage";
import CustomPackage from "@/pages/Event/CustomPackage";
import OrderBookingReportsPage from "@/pages/Event/OrderBookingReportsPage";
import DishCostingPage from "@/pages/Event/DishCostingPage";
import QuotationPage from "@/pages/Event/QuotationPage";
import EventInvoicePage from "@/pages/Event/EventInvoicePage";
import ProformaInvoicePage from "@/pages/Event/ProformaInvoicePage";
import AddInvoicePage from "@/pages/Event/AddInvoicePage";
import InvoiceViewPage from "@/pages/Event/InvoiceViewPage";
import CustomerMaster from "@/pages/master/customer";
import AllMemberMaster from "@/pages/master/all-menbers";
import SuperadminMember from "../pages/super-admin/master/Add-member";
import FunctionsMaster from "@/pages/master/functions";
import MealMaster from "@/pages/master/meals";
import ContactCategoryMaster from "@/pages/master/contact-category";
import EventTypeMaster from "@/pages/master/Event-type";
import UnitMaster from "@/pages/master/unit";
import MenuCategoryMaster from "@/pages/master/MenuCategory";
import MenuSubCategory from "@/pages/master/MenuSubCategory";
import MenuKitchenArea from "@/pages/master/MenuKitchenArea";
import MenuItemsMaster from "@/pages/master/MenuItems";
import EstimatePage from "@/pages/Event/EstimatePage";
import StateSearchForm from "@/pages/StateSearch";
import AllUser from "@/pages/master/user-master/alluser";
import DemoUsers from "../pages/master/user-master/alluser/Demousers";
import LeadUsers from "../pages/master/user-master/alluser/LeadUsers";
import AllVendor from "../pages/master/user-master/vendor";
import AllPlan from "@/pages/master/user-master/allplan";
import RoleMaster from "@/pages/master/role";
import RawMaterialMaster from "@/pages/master/raw-material-category";
import RawMaterialTypeMaster from "@/pages/master/raw-material-type";
import ContactTypeMaster from "@/pages/master/Contact-master";
import RawMaterial from "@/pages/master/Raw-Material";
import CustomPackageMaster from "@/pages/master/custom-package";
import AddCustomPackage from "@/pages/master/custom-package/Add-customepackage/AddCustomPackage";
import InvoiceDashboard from "@/pages/sales/invoice/InvoiceDashboard/InvoiceDashboard";
import InvoiceList from "@/pages/sales/invoice/InvoiceList/InvoiceList";
import QuotationDashboard from "@/pages/sales/quotaion/QuotationDashboard/QuotaionDashboard";
import QuotationViewPage from "@/pages/sales/quotaion/QuotationList/QuotationList";
import QuickCustomPackage from "@/pages/Event/QuickCustomPackage";
import Labourshiftmaster from "../pages/master/labour-shift";
import Priceplan from "@/partials/modals/priceplan/Priceplan";
// import DateWiseReport from "@/pages/Reports/DateWiseReport";
import ReportThemes from "@/pages/Event/ReportThemesPage";
import Editor from "@/pages/Event/ReportThemesPage/ReportThemeEditor/Editor";
import ClientDashboard from "../pages/clientdashboard/ClientDashboard";
import Dashboard from "../pages/dashboard/Dashboard";
import ReportCustomTheme from "@/pages/Reportcustomethemes";
import Database from "../pages/master/superadmindatabase";
import Plan from "../components/plan/Plan";
import SuperadminInvoice from "../pages/super-admin/superadmininvoice/SuperadminInvoice";
import Addinvoice from "../pages/super-admin/superadmininvoice/Adinvoice";
import RenewalCustomer from "../pages/renewalcustomer/RenewalCustomer";
import SuperCalendarPage from "../pages/super-admin/calender";
import SuperAdminMember from "../pages/superadminmember/SuperAdminMember";
import SuperAdminMemberEdit from "../pages/superadminmember/SuperAdminMemberEdit";
import UserRights from "../pages/userrights/UserRights";
import SuperAdminUserLogs from "../pages/superadminmember/SuperAdminUserLogs";
import VenuetypeMaster from "../pages/master/Venue-type";
import VendorMaster from "../pages/master/vendor-master";
import SuperContactTypeMaster from "../pages/super-admin/master/contact-master";
import SuperRawMaterialType from "../pages/super-admin/master/Raw-material-type";
import SuperUnitMaster from "../pages/super-admin/master/unit";
import PaymentHistory from "../pages/setting/paymenthistory";
import InvoicePreview from "../components/superadminInvoice/InvoicePreview";
import TemplateName from "../pages/super-admin/master/template-name";
import TemplateMapping from "../pages/super-admin/master/Template-mapping";
import MenuItemMaster from "../pages/master/MenuItemMaster";
import InteractionMaster from "../pages/super-admin/master/interaction-master";
import ExpenseDetails from "../pages/Event/ExpensePage";
import SuperLeads from "../pages/super-admin/Leads";
import AddLeadPage from "@/pages/super-admin/Leads/AddLead/AddLeadPage";
import { ChangeRawMaterialCategoryPage } from "../pages/Configuration/Change-Raw-Material-Category/ChangeRawMaterialCategoryPage";
import { ChangeMenuItemCategoryPage } from "../pages/Configuration/Change-Menu-Item-Category";
import ConfigMenuItemPage from "../pages/Configuration/Menu-Item-Allocation/ConfigMenuItemPage";
import { Allocatesupplier } from "../pages/Configuration/Allocate-supplier/Allocatesupplier";
import ReportsConfig from "../pages/Reports/ReportsConfig";
import ReportLabelConfiguration from "../pages/Reports/ReportLabelConfiguration";
import AdminReportCustomThem from "../pages/master/AdminReportCustomTheme";
import AllReportsConfig from "../pages/super-admin/master/super-report-config";
import RightsModule from "../pages/super-admin/master/RightsModule";
import GodownMaster from "../pages/master/Godown-master";
import PageMaster from "../pages/super-admin/master/pages-master";
import ExtraPaymentMaster from "../pages/super-admin/master/ExtraPayment-master";
import CouponMaster from "../pages/super-admin/master/Coupon-master";
import { CrockeryConfiguration } from "../pages/Configuration/CrockeryConfiguration/CrockeryConfiguration";
import AllReports from "../pages/Event/AllReportsPage/AllReports";
import AdminModuleReport from "../pages/Event/AdminModuleReport/AdminModuleReport";
import RecivedPayments from "../pages/payments/RecivedPayments";
import AccountLedger from "../pages/payments/AccountLedger";
import LeadDetails from "../pages/super-admin/Leads/LeadDetails";
import Pipeline from "../pages/lead/pipeline";
import BankPayment from "../pages/payments/BankPayment";
import CashRecipet from "../pages/payments/CashRecipet";
import BankDetails from "../pages/master/Bank-Details";
import EmployeeDashboard from "../pages/super-admin/employeeDashboard/EmployeeDashboard";
import FollowUpPage from "../pages/super-admin/Leads/Followup/FollowUpPage";
import EmployeePerformance from "../pages/super-admin/employeeDashboard/Employeeperformance";
import TeamPerformance from "../pages/super-admin/employeeDashboard/Teamperformance";
import VendorSignup from "../vendorsignup/VendorSignup";
import StockType from "../pages/stockmanagement/stocktype/StockType";
import Purchase from "../pages/stockmanagement/purchase/Purchase";
import AddPurchase from "../pages/stockmanagement/purchase/AddPurchase";
import PurchaseReturn from "../pages/stockmanagement/purchasereturn/PurchaseReturn";
import AddPurchaseReturn from "../pages/stockmanagement/purchasereturn/AddPurchaseReturn";
import StorePo from "../pages/stockmanagement/storepo/StorePo";
import AddStorePO from "../pages/stockmanagement/storepo/AddStorePO";
import StoreLedger from "../pages/stockmanagement/storeledger/StoreLedger";
import AllExpense from "../pages/super-admin/Expense";
import RecipeDashboard from "../pages/recipe/recipeDashboard/RecipeDashboard";
import ExploreRecipe from "../pages/recipe/recipeDashboard/ExploreRecipe";
import ItemRecipe from "../pages/recipe/ItemRecipe";
import UnitChange from "../pages/unitchange/UnitChange";
import AdminModuleOrderReport from "../pages/Event/AdminModuleReport/AdminModuleOrderReport";
import DynamicReports from "../pages/dynamicreport/DynamicReports";
import CustomiseReport from "../pages/dynamicreport/CustomiseReport";
import ReportNamePlateTheme from "../pages/Reportcustomethemes/ReportNamePlateTheme";
import QuotationTheme from "../pages/Reportcustomethemes/QuotationTheme";
import InvoiceTheme from "../pages/Reportcustomethemes/InvoiceTheme";
import Upgrade from "../pages/uprade/Uprade";
import SuperInvoiceDashboard from "../pages/super-admin/Account/Dashboard/SuperInvoiceDashboard";
import StorePoReturn from "../pages/stockmanagement/storeporeturn/StorePoReturn";
import AddStorePOReturn from "../pages/stockmanagement/storeporeturn/AddStorePOReturn";
import RawMaterialOPB from "../pages/master/RawMaterialOPB/RawMaterialOPB";
import SuperadminIncome from "../pages/super-admin/income/SuperadminIncome";
import ProfitnLoss from "../pages/super-admin/P&L/ProfitnLoss";
import OverView from "../pages/Event/EventListPage/OverView";
import ProtectedRoute from "../auth/ProtectedRoute";
import NoAccessPage from "../pages/PageNotFound/NoAccessPage";
import StockReport from "../pages/stockmanagement/stockreport/StockReport";
import Reportwiserights from "../pages/ReportRights/Reportwiserights";
import RawmaterialChange from "../pages/rawmaterialchange/rawmaterialchnage";
import Fonts from "../components/Fonts/Fonts";
import MarketingDashboard from "../pages/marketing/Dashboard";
import ProfileManagement from "../pages/marketing/ProfileManagement";
import Offers from "../pages/marketing/offers/Offers";
import CustomPackages from "../pages/marketing/packages/CustomPackages";
import AcceptSOT from "../pages/stockmanagement/store-ordering-tickets/acceptsot/AcceptSOT";
import AddChefRequisition from "../pages/stockmanagement/chef-requisition/AddChefRequisition";
import ChefRequisition from "../pages/stockmanagement/chef-requisition/ChefRequisition";
import UpgradeModule from "../components/upgrademodule/UpgradeModule";
import AutoManualPO from "../pages/stockmanagement/auto-manual-po/AutoManualPO";
import AddAutoManualPO from "../pages/stockmanagement/auto-manual-po/AddAutoManualPO";
import SuperAdminSource from "../pages/master/SuperadminSource";
import SuperAdminSubSource from "../pages/master/SuperAdminSubSource";
import QuotationFunction from "../components/quotationfunction/QuotationFunction";
import Portfolio from "../pages/marketing/portfolio/Portfolio";
import StoreOrderingTickets from "../pages/stockmanagement/store-ordering-tickets/StoreOrderingTickets";
import GenerateAutoManual from "../pages/stockmanagement/store-ordering-tickets/generate-auto-manual/GenerateAutoManual";
import ReturnSOT from "../pages/stockmanagement/store-ordering-tickets/return-sot/ReturnSOT";
import { ReportConfiguration } from "../pages/setting/report-configuration/ReportConfiguration";
import SuperAdminproformaInvoice from "../pages/super-admin/ProformaInvoice/SuperAdminproformaInvoice";
import CashAccountsList from "../pages/master/Cash-Details/Cash-Account/index";
import CashBook from "../pages/master/Cash-Details/cash-book";
import BankBook from "../pages/master/bank-book";
import SuperCashReceipt from "../pages/master/Cash-Details/cash-receipt/index";
import BankReceipts from "../pages/master/bank-receipt";
import Transfers from "../pages/master/Transfer-Amount-cashbank";
import Payable from "../pages/master/payable.jsx";
import UserTerms from "../components/usertermscondition/UserTerms";
import MasterExpenseType from "../pages/master/masterExpenseType/index.jsx";
import ReceiptManagement from "../pages/master/Cash-Details/Bank-cashReceipt/index.jsx";
import BookPage from "../pages/master/Cash-Details/AccountBook/index.jsx";
import { Integration } from "../pages/setting/integrations/Integration.jsx";
import JournalVoucher from "../pages/payments/JournalVoucher.jsx";
import AddJournalVoucher from "../pages/payments/AddJournalVoucher.jsx";
import MenuCategoryImage from "../pages/master/MenuCategoryImage/index.jsx";
import CashPayment from "../pages/master/Cash-Details/cash-payment/index.jsx";
import SuperBankPayment from "../pages/master/bank-payment/index.jsx";
import Receivable from "../pages/super-admin/Receivable/Receivable.jsx";
import SuperPayable from "../pages/super-admin/payable.jsx/Payable.jsx";
import ClientInsight from "../pages/master/user-master/alluser/ClientInsight.jsx";
import ClientInsightDashboard from "../pages/super-admin/Client-insight/ClientDashboad/index.jsx";
import ClientInsightHistory from "../pages/super-admin/Client-insight/client-history/index.jsx";
import AccountLedgerSuperadmin from "../pages/super-admin/accout-superleger/index.jsx";
import Superaccountmaster from "../pages/master/superaccountmaster/index.jsx";
import ExpensePage from "../pages/super-admin/Expense/ExpensePage.jsx";
import QueriesPage from "../pages/TicketModule/ClientQueriesDashboard/QueriesPage.jsx";
import SuperTicket from "../pages/super-admin/superamdinTicketModule/SuperTicket.jsx";
import ClientDetailPage from "../pages/super-admin/superamdinTicketModule/ClientDetilslist/ClientDetailsPage.jsx";
import DevloperDashBoard from "../pages/super-admin/superamdinTicketModule/Devloperscreen/DevloperDashBoard.jsx";
import DevloperClientDetailspage from "../pages/super-admin/superamdinTicketModule/Devloperscreen/DevloperClientDetailspage.jsx";
import AiTemplateMaster from "../pages/master/Ai-modalMaster/Ai-Template/index.jsx";
import GstReport from "../pages/payments/GstReport.jsx";
import PushNotification from "../pages/master/PushNotificatioForSuperadmin/index.jsx";
import Addaimodal from "../pages/master/Ai-modalMaster/Ai-Template/AddAItemplate.jsx";
import EventAssignManager from "../partials/modals/calendar-event/EventAssignManager.jsx";
import ViewAssignMember from "../partials/modals/calendar-event/ViewAssignmember/ViewAssignMember.jsx";
import ManagerViewOrder from "../partials/modals/calendar-event/ViewAssignmember/Managervieworder.jsx";
import CrokeyClutly from "../pages/Configuration/CrockeryConfiguration/crokeryConfiguration/crokeryconfiguration.jsx";
import CaptainRecipe from "../pages/master/CaptainRecipe/index.jsx";
import ApprovalPendingPage from "../partials/modals/priceplan/ApprovalPendingModal.jsx";
import MenuPlannerPage from "../pages/master/menuplaaingmaster/Menuplannerpage.jsx";
import BanquetMaster from "../pages/master/Banquet-Master/BanquetMaster.jsx";
import MenuViewPage from "../pages/Event/EventPlanningPage/MenuViewPage.jsx";
import BanquetShiftMaster from "../pages/master/banquet-shift/BanquetShiftMaster.jsx";
import EventRemark from "../pages/master/event-remark-master/index.jsx";
import RoomMaster from "../pages/master/room-master/RoomMaster.jsx";
import DailyStockManage from "../pages/stockmanagement/daily-stock-manage/DailyStockManage.jsx";
import AddDailyStock from "../pages/stockmanagement/daily-stock-manage/AddDailyStock.jsx";
import GuestMenuReviewPage from "../pages/Event/EventPlanningPage/GuestMenuReviewPage.jsx";
import GuestMaster from "../pages/master/guest-master/GuestMaster.jsx";
import AssignManagertask from "../pages/master/AssignManagertask/index.jsx";
import DecorCategory from "../pages/master/DecorCategory/DecorCategory.jsx";
import DecorItem from "../pages/master/DecorItem/DecorItem.jsx";
import AddDecorPackage from "../pages/master/custom-package/Add-customepackage/AddDecorPackage.jsx";
import DecorPackageMaster from "../pages/master/decor-package/DecorPackageMaster.jsx";
import HallPackageratemaster from "../pages/master/room-master/HallPackageratemaster.jsx";
import CrockerySot from "../pages/stockmanagement/Crockery_Sot/CrockeySot.jsx";
import AcceptCrockerySot from "../pages/stockmanagement/Crockery_Sot/acceptcrockerysot/AcceptCrockerySot.jsx";
import GenerateCrockeryAutoManual from "../pages/stockmanagement/Crockery_Sot/generate-crockery-auto-manual/GenerateCrockeryAutoManual.jsx";
import ReturnCrockerySOT from "../pages/stockmanagement/Crockery_Sot/return-crockerysot/ReturnCrockerySot.jsx";
import ManagerTaskMaster from "../pages/master/ManagerTaskMaster/index.jsx";
import ManagerTask from "../partials/modals/calendar-event/ManagerAllTask/ManagerTask.jsx";
import EventAssignManagerTask from "../partials/modals/calendar-event/EventAssignManagerTask.jsx";
import Labourhelper from "../pages/master/labourhelper/index.jsx";
import EventAssignManagerSpecialNotes from "../partials/modals/calendar-event/EventAssignManagerSecialNotes.jsx";
import ManagerAllSpecialNotes from "../partials/modals/calendar-event/ManagerAllSpecialNotes/ManagerAllSpecialNotes.jsx";
import AcceptMultipleSOT from "../pages/stockmanagement/store-ordering-tickets/acceptsot/AcceptMultipleSOT.jsx";
import TapInquiryListPage from "../pages/master/user-master/alluser/TapInquiryListPage.jsx";
import FollowUpCalendarPage from "../pages/Event/CalendarPage/FollowUpCalendarPage.jsx";
import InquiryList from "../pages/Event/Inquiry/InquiryList.jsx";


const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          {/* project routs */}
          <Route path="/tapinquiry" element={<TapInquiryListPage/>}/>
          <Route path="/StateSearch" element={<StateSearchForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          <Route path="/followup-calendar" element={<FollowUpCalendarPage />} />
          <Route path="/stock-management/accept-multiple-sot" element={<AcceptMultipleSOT />}/>
          <Route path="/master/addlabourhelper" element={<Labourhelper/>}/>
          <Route path="/assigntask" element={<AssignManagertask />}/>
          <Route path="/managertaskmaster" element={<ManagerTaskMaster/>}/>
           <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/event-remark" element={<EventRemark/>}/>
          <Route path="/menuplaaningmaster" element={<MenuPlannerPage />} />
          <Route path="/approvepending" element={<ApprovalPendingPage />} />
          <Route path="/captainrecipe" element={<CaptainRecipe />} />

          <Route
            path="/event-view/assginMemberview/mangerorder"
            element={<ManagerViewOrder />}
          />
          <Route
            path="/event-view/assginMemberview/:eventId"
            element={<ViewAssignMember />}
          />

          <Route
            path="/event-view/managertask/:eventId"
            element={<ManagerTask />}
          />

           <Route
            path="/event-view/managerspecialnotes/:eventId"
            element={<ManagerAllSpecialNotes />}
          />
          <Route
            path="/event-view/eventassignmember/:eventId"
            element={<EventAssignManager />}
          />
          <Route
            path="/event-view/eventassignmanagertask/:eventId"
            element={<EventAssignManagerTask />}
          />
          <Route
            path="/event-view/eventassignmanagerspecialnotes/:eventId"
            element={<EventAssignManagerSpecialNotes />}
          />
          <Route path="/Ai-module/addaitemplate" element={<Addaimodal />} />
          <Route path="/PushNotification" element={<PushNotification />} />
          <Route path="/ai-templatemaster" element={<AiTemplateMaster />} />
          <Route
            path="/super/ticket/devlopwrdashboard/clientdetil"
            element={<DevloperClientDetailspage />}
          />
          <Route
            path="/super/ticket/devloperdashboard"
            element={<DevloperDashBoard />}
          />
          <Route
            path="/super/ticketdashboard/clientticket"
            element={<ClientDetailPage />}
          />
          <Route path="/super/ticketdahboard" element={<SuperTicket />} />
          <Route path="/queries" element={<QueriesPage />} />
          <Route
            path="/master/accountmaster"
            element={<Superaccountmaster />}
          />
          <Route
            path="/SuperAdminAccountLedger"
            element={<AccountLedgerSuperadmin />}
          />
          <Route
            path="/client-insight/history"
            element={<ClientInsightHistory />}
          />
          <Route
            path="/client-insight/Dashboard"
            element={<ClientInsightDashboard />}
          />
          <Route path="/vendor" element={<VendorSignup />} />
          <Route path="/super-dashboard" element={<Dashboard />} />
          <Route path="/contacts/details" element={<ContactDetail />} />
          <Route path="/contacts" element={<ContactListPage />} />
          <Route path="/lead" element={<LeadPage />} />
          <Route path="/lead/details" element={<LeadDetailPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/plans" element={<Plan />} />
          <Route path="/upgrade-module" element={<UpgradeModule />} />
          <Route path="/company" element={<CompanyListPage />}></Route>
          <Route path="/companydetails" element={<CompanyDetails />}></Route>
          <Route path="/followup" element={<FollowUpListPage />}></Route>
          {/* Theme routes */}
          <Route path="/company" element={<CompanyListPage />}></Route>
          <Route path="/companydetail" element={<CompanyDetails />}></Route>
          <Route path="/links" element={<LinkList />}></Route>
          <Route path="/product" element={<ProductListPage />}></Route>
          <Route path="/product/detail" element={<ProductListDetail />}></Route>
          <Route path="/team/seals-team" element={<SalesTeamList />} />
          <Route path="/team/all-members" element={<MemberList />} />
          <Route path="/database" element={<Database />} />
          <Route path="/master/menu-items" element={<MenuItemMaster />} />
          <Route path="/unitchange" element={<UnitChange />} />
          {/* event management routes */}
             <Route path="/master/decor-category" element={<DecorCategory />} />
           <Route path="/master/decor-item" element={<DecorItem />} />



          <Route
            path="/quick-custom-package"
            element={<QuickCustomPackage />}
          />
          <Route path="/event" element={<EventListPage />} />
          <Route path="/inquiry" element={<InquiryList />} />

          <Route path="/event-overview" element={<OverView />} />
          <Route path="/add-event" element={<CreateEventPage />} />
          <Route
            path="/edit-event/:eventId"
            element={<CreateEventPage mode="edit" />}
          />
          <Route path="/Payments" element={<RecivedPayments />} />
          <Route path="/account" element={<AccountLedger />} />
          <Route path="/journal-voucher" element={<JournalVoucher />} />
          <Route path="/journal-voucher/add" element={<AddJournalVoucher />} />
          <Route path="/gst-report" element={<GstReport />} />
          <Route
            path="/edit-event/:eventId/copy"
            element={<CreateEventPage mode="copy" />}
          />
          <Route path="/menu-preparation" element={<EventPlanningPage />} />
          <Route path="/admin-invoice" element={<SuperadminInvoice />} />
          <Route
            path="/super-proforma-invoice"
            element={<SuperAdminproformaInvoice />}
          />
          <Route
            path="/super/invoice-preview/:id"
            element={<InvoicePreview />}
          />
          <Route
            path="/super/account/dashboard"
            element={<SuperInvoiceDashboard />}
          />
          <Route path="/user-rights" element={<UserRights />} />
          <Route path="/report-rights" element={<Reportwiserights />} />
          <Route path="/renewal-history" element={<RenewalCustomer />} />
          <Route path="/addInvoice" element={<Addinvoice />} />
        <Route path="/hallpackagerate" element={<HallPackageratemaster/>}/>
<Route path="/menu-preparation/:eventId"  element={<EventPlanningPage mode="menu"  />} />
<Route path="/decor-preparation/:eventId" element={<EventPlanningPage mode="decor" />} />
          <Route
            path="/menu-allocation/:eventId"
            element={<EventMenuAllocationPage mode="allocation" />}
          />
          <Route
            path="/raw-material-allocation"
            element={<RawMaterialAllocationPage mode="raw" />}
          />
          <Route path="/raw-material-change" element={<RawmaterialChange />} />
          <Route
            path="/raw-material-allocation/:eventId/"
            element={<RawMaterialAllocationPage mode="raw" />}
          />
          <Route
            path="/general-fix/:eventId"
            element={<GeneralFixPage />}
          />
          <Route path="/custom-package" element={<CustomPackage />} />
          <Route path="/report-configuration" element={<ReportsConfig />} />
          {/* <Route path="/report-datewise" element={<DateWiseReport />} /> */}
          <Route
            path="/report-label-configuration"
            element={<ReportLabelConfiguration />}
          />
          <Route
            path="/labour-and-other-management"
            element={<LabourOtherManagementPage />}
          />
          <Route
            path="/labour-and-other-management/:eventId"
            element={<LabourOtherManagementPage mode="labour" />}
          />
          <Route path="/expense-management/" element={<ExpenseDetails />} />
          <Route
            path="/expense-management/:eventId"
            element={<ExpenseDetails />}
          />
          <Route
            path="/order-booking-reports"
            element={<OrderBookingReportsPage />}
          />
          <Route path="/dish-costing/:eventId" element={<DishCostingPage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/quotation/:eventId" element={<QuotationPage />} />
          <Route path="/event-invoice" element={<EventInvoicePage />} />
          <Route path="/proforma-invoice" element={<ProformaInvoicePage />} />
          <Route path="/invoice-dashboard" element={<EventInvoicePage />} />
          <Route path="/add-invoice/:id" element={<AddInvoicePage />} />
          <Route path="/view-invoice" element={<InvoiceViewPage />} />
          <Route path="/estimate" element={<EstimatePage />} />
          <Route path="/report-themes" element={<ReportThemes />} />
          <Route path="/report-themes/editor" element={<Editor />} />
          <Route path="/reportcustomethemes" element={<ReportCustomTheme />} />
          <Route
            path="/adminreportcustomtheme"
            element={<AdminReportCustomThem />}
          />
          <Route
            path="/super-reportcustomethemes"
            element={<ReportCustomTheme />}
          />
          <Route
            path="/super-reportcustomethemes/nameplates"
            element={<ReportNamePlateTheme />}
          />
          <Route
            path="/super-reportcustomethemes/quotations"
            element={<QuotationTheme />}
          />
          <Route
            path="/super-reportcustomethemes/invoices"
            element={<InvoiceTheme />}
          />
          <Route path="/super-admin/income" element={<SuperadminIncome />} />
          <Route path="/super-admin/P&l" element={<ProfitnLoss />} />
          <Route path="/super-calendar" element={<SuperCalendarPage />} />
          {/* Sales */}
          <Route
            path="/sales/invoice-dashboard"
            element={<InvoiceDashboard />}
          />
          <Route
            path="/sales/invoice-list/:PartyId/:EventId"
            element={<InvoiceList />}
          />
          <Route path="/sales/add-invoice" element={<AddInvoicePage />} />
          <Route path="/quotation-dashboard" element={<QuotationDashboard />} />
          <Route path="/price" element={<Priceplan />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route
            path="/sales/quotation-list/:PartyId/:EventId"
            element={<QuotationViewPage />}
          />
          {/* Masters */}
          <Route path="/master/customers" element={<CustomerMaster />} />
          <Route path="/master/guest" element={<GuestMaster />} />
          <Route path="/master/vendor-master" element={<VendorMaster />} />
          <Route
            path="/master/raw-material-master"
            element={<RawMaterialMaster />}
          />
          <Route
            path="/master/raw-material-type-master"
            element={<RawMaterialTypeMaster />}
          />
          <Route path="/master/bank-details" element={<BankDetails />} />
          <Route path="/Cash-account" element={<CashAccountsList />} />
          <Route path="/cash/cash-book" element={<CashBook />} />
          <Route path="/bank/bank-book" element={<BankBook />} />
          <Route path="/cash/cash-recipet" element={<SuperCashReceipt />} />
          <Route path="/cash/cash-payment" element={<CashPayment />} />
          <Route path="/reciptManage" element={<ReceiptManagement />} />
          <Route path="/bank/bank-recipet" element={<BankReceipts />} />
          <Route path="/bank/bank-payment" element={<SuperBankPayment />} />
          <Route path="/receivable" element={<Receivable />} />
          <Route path="/super/payable" element={<SuperPayable />} />
          <Route path="/transfer" element={<Transfers />} />
          <Route path="/terms" element={<UserTerms />} />
          <Route path="/payable" element={<Payable />} />
          <Route path="/accoutbook" element={<BookPage />} />
          <Route path="/master/expensetype" element={<MasterExpenseType />} />
          <Route path="/master/all-members" element={<AllMemberMaster />} />
          <Route path="/superadmin/members" element={<SuperadminMember />} />
          <Route path="/master/functions" element={<FunctionsMaster />} />
          <Route path="/master/meals" element={<MealMaster />} />
          <Route
            path="/master/contact-categories"
            element={<ContactCategoryMaster />}
          />
          <Route path="/master/banquet-master" element={<BanquetMaster />} />

          {/* Stock Management Route */}
          <Route path="/stock-management/stock-type" element={<StockType />} />
          <Route path="/stock-management/purchase" element={<Purchase />} />
          <Route
            path="/stock-management/purchase/add"
            element={<AddPurchase />}
          />
          <Route
            path="/stock-management/purchase-return"
            element={<PurchaseReturn />}
          />
          <Route
            path="/stock-management/purchase-return/add"
            element={<AddPurchaseReturn />}
          />
          <Route path="/stock-management/store-po" element={<StorePo />} />
          <Route
            path="/stock-management/store-po-return"
            element={<StorePoReturn />}
          />
          <Route
            path="/stock-management/storepo/add"
            element={<AddStorePO />}
          />
          <Route
            path="/stock-management/storeporeturn/add"
            element={<AddStorePOReturn />}
          />
          <Route
            path="/stock-management/store-ordering-tickets"
            element={<StoreOrderingTickets />}
          />

          <Route
            path="/stock-management/crockery-sot"
            element={<CrockerySot />}
          />

          <Route
            path="/stock-management/daily-stock-manage"
            element={<DailyStockManage />}
          />
          <Route
            path="/stock-management/daily-stock/add/:id?"
            element={<AddDailyStock />}
          />
          
          <Route
            path="/stock-management/storepo/generate"
            element={<GenerateAutoManual />}
          />
              <Route
            path="/stock-management/storepo/crockery-generate"
            element={<GenerateCrockeryAutoManual />}
          />
          
          <Route
            path="/stock-management/storepo/return"
            element={<ReturnSOT />}
          />

           <Route
            path="/stock-management/crockerystorepo/return"
            element={<ReturnCrockerySOT />}
          />
          <Route path="/stock-management/acceptsot" element={<AcceptSOT />} />
            <Route path="/stock-management/acceptcrockerysot" element={<AcceptCrockerySot />} />
          <Route
            path="/stock-management/automanualpo"
            element={<AutoManualPO />}
          />

          
          <Route
            path="/stock-management/automanualpo/add"
            element={<AddAutoManualPO />}
          />
          <Route
            path="/stock-management/store-ledger"
            element={<StoreLedger />}
          />
          <Route
            path="/stock-management/stock-report"
            element={<StockReport />}
          />
          <Route
            path="/stock-management/chef-requisition"
            element={<ChefRequisition />}
          />
          <Route
            path="/stock-management/add-chef-requisition"
            element={<AddChefRequisition />}
          />
          <Route path="/report" element={<DynamicReports />} />
          <Route path="/quotation-function" element={<QuotationFunction />} />
          <Route path="/reportcustomise" element={<CustomiseReport />} />
          {/* Recipe Route */}
          <Route path="/recipe" element={<RecipeDashboard />} />
          <Route path="/recipe/explorerecipe" element={<ExploreRecipe />} />
          <Route path="/recipe/itemrecipe" element={<ItemRecipe />} />
          {/* Marketing Routing */}
          <Route path="/marketing/dashboard" element={<MarketingDashboard />} />
          <Route path="/marketing/profile" element={<ProfileManagement />} />
          <Route path="/marketing/offers" element={<Offers />} />
          <Route path="/marketing/packages" element={<CustomPackages />} />
          <Route path="/marketing/portfolio" element={<Portfolio />} />
          <Route
            path="/recipe/list"
            element={<div style={{ padding: 20 }}>Recipe List Page</div>}
          />
          <Route
            path="/recipe/add"
            element={<div style={{ padding: 20 }}>Add Recipe Page</div>}
          />
          <Route
            path="/recipe/category"
            element={<div style={{ padding: 20 }}>Recipe Category Page</div>}
          />
          <Route path="/master/rawmaterial-opb" element={<RawMaterialOPB />} />
          <Route path="/master/event-type" element={<EventTypeMaster />} />
          <Route path="/master/venue-type" element={<VenuetypeMaster />} />
          <Route path="/master/godown" element={<GodownMaster />} />
          <Route path="/master/unit" element={<UnitMaster />} />
          <Route path="/master/user-master" element={<AllUser />} />
          <Route path="/master/demousers" element={<DemoUsers />} />
          <Route path="/member/clientinsight" element={<ClientInsight />} />
          <Route path="/master/leadusers" element={<LeadUsers />} />
          <Route path="/vendors" element={<AllVendor />} />
          <Route path="/expense" element={<AllExpense />} />
          <Route path="/account/expense" element={<ExpensePage />} />
          <Route path="/superadmin-logs" element={<SuperAdminUserLogs />} />
          <Route path="/Superadmin-member/:id" element={<SuperAdminMember />} />
          <Route path="/allreports/:eventId" element={<AllReports />} />
          <Route
            path="/adminmodulereport"
            element={<AdminModuleReport />}
            mode="adminmodulereport"
          />
          <Route
            path="/adminmoduleorderreport"
            element={<AdminModuleOrderReport />}
            mode="adminmodulereport"
          />
          <Route
            path="/Superadmin-member-edit/:id"
            element={<SuperAdminMemberEdit />}
          />
          <Route path="/super-Leads" element={<SuperLeads />} />
          <Route path="/super-leads/addlead" element={<AddLeadPage />} />
          <Route
            path="/super-leads/lead-details/:id"
            element={<LeadDetails />}
          />
          <Route
            path="/super-contact-type-master"
            element={<SuperContactTypeMaster />}
          />
          <Route path="/bank-payment" element={<BankPayment />} />
          <Route path="/cash-recipet" element={<CashRecipet />} />
          <Route path="/pages-master" element={<PageMaster />} />
          <Route path="/extrapayment" element={<ExtraPaymentMaster />} />
          <Route path="/coupon" element={<CouponMaster />} />
          <Route path="/master/Fonts" element={<Fonts />} />
          <Route path="/superadmin/source" element={<SuperAdminSource />} />
          <Route
            path="/superadmin/subsource"
            element={<SuperAdminSubSource />}
          />
          <Route
            path="/super-raw-material-type-master"
            element={<SuperRawMaterialType />}
          />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route
            path="/superadmin/employeeperformance"
            element={<EmployeePerformance />}
          />
          <Route
            path="/superadmin/teamperformance"
            element={<TeamPerformance />}
          />
          <Route path="/super-unit-master" element={<SuperUnitMaster />} />
          <Route
            path="/super-template-name-master"
            element={<TemplateName />}
          />
          <Route path="/ModuleRights" element={<RightsModule />} />
          <Route path="/super-templateMapping" element={<TemplateMapping />} />
          <Route path="/interaction-master" element={<InteractionMaster />} />
          <Route path="super-allreport-config" element={<AllReportsConfig />} />
          {/* <Route path="/super-report-config" element={<ReportsConfig />} /> */}
          <Route path="/master/user-master/plan" element={<AllPlan />} />
          <Route
            path="/master/menu-category"
            element={<MenuCategoryMaster />}
          />
          <Route
            path="/master/category-image"
            element={<MenuCategoryImage />}
          />
          <Route
            path="/master/menu-sub-category"
            element={<MenuSubCategory />}
          />
          <Route
            path="/master/menu-kitchan-area"
            element={<MenuKitchenArea />}
          />
          <Route path="/master/menu-item" element={<MenuItemsMaster />} />
          <Route path="/master/role" element={<RoleMaster />} />
          <Route path="/master/contact-type" element={<ContactTypeMaster />} />
          <Route path="/master/raw-material" element={<RawMaterial />} />
          <Route
            path="/master/custom-package"
            element={<CustomPackageMaster />}
          />
          <Route
            path="/master/decor-package"
            element={<DecorPackageMaster />}
          />
          <Route
            path="/master/custom-package/addpackage"
            element={<AddCustomPackage />}
          />
          <Route
            path="/master/decor-package/addpackage"
            element={<AddDecorPackage />}
          />
          <Route path="/master/labour-shift" element={<Labourshiftmaster />} />
          <Route
            path="/master/banquet-shift"
            element={<BanquetShiftMaster />}
          />

            <Route path="/master/room" element={<RoomMaster />} />


          {/* Tasks routes */}
          <Route path="/tasks/dashboard" element={<TaskDashboard />}></Route>
          <Route path="task/mytask" element={<MyTask />}></Route>
          <Route path="/tasks" element={<TaskListPage />}></Route>
          <Route
            path="/tasks-directory"
            element={<TaskDirectoryPage />}
          ></Route>
          <Route path="/tasks-template" element={<TaskTemplatePage />}></Route>
          {/* leavs route */}
          <Route path="/approval" element={<Approval />}></Route>
          <Route path="/holiday" element={<Holiday />}></Route>
          <Route path="/myleaves" element={<MyLeaves />}></Route>
          <Route path="/allleave" element={<Allleave />}></Route>
          <Route path="allattendance" element={<AllAttendance />}></Route>
          <Route path="leavetype" element={<LeaveType />}></Route>
          <Route path="/myattendance" element={<Myattendance />}></Route>
          <Route path="/leave-dashboard" element={<Leavedashboard />}></Route>
          <Route
            path="/attendance-setting"
            element={<AttendanceSetting></AttendanceSetting>}
          ></Route>
          <Route path="officesetting" element={<OfficeSetting />}></Route>
          {/* Settings routes */}
          <Route path="/settings/general" element={<GeneralSettingsPage />} />
          <Route path="/utility" element={<UtilityPage />} />
          <Route path="/report-config" element={<ReportConfiguration />} />
          <Route path="/integrations" element={<Integration />} />
          <Route
            path="/settings/subscription"
            element={<SubscriptionSettingsPage />}
          />
          <Route path="/setting/payment-history" element={<PaymentHistory />} />
          <Route path="/settings/channel" element={<ChannelSettingsPage />} />
          <Route
            path="/settings/notifications"
            element={<NotificationsSettingsPage />}
          />
          {/* Configuration */}
          <Route
            path="/configuration/changerawraterialcategory"
            element={<ChangeRawMaterialCategoryPage />}
          />
          <Route
            path="/configuration/changemenuitemcategory"
            element={<ChangeMenuItemCategoryPage />}
          />
          <Route
            path="/configuration/confimenuitemallocate"
            element={<ConfigMenuItemPage />}
          />
          <Route
            path="/configuration/allocationsupplier"
            element={<Allocatesupplier />}
          />
          <Route
            path="/configuration/CrockeryConfiguration"
            element={<CrockeryConfiguration />}
          />
          <Route
            path="/configuration/CrockeryConfigurationnew"
            element={<CrokeyClutly />}
          />
          {/* Support routes */}
          <Route path="/support/events" element={<EventsPage />} />
          <Route path="/support/tutorials" element={<TutorialsPage />} />
          <Route path="/support/tickets" element={<TicketsPage />} />
          <Route path="/support/application" element={<ApplicationPage />} />
          <Route
            path="/support/progress-checklist"
            element={<ProgressChecklistPage />}
          />
          <Route path="/support/raise-ticket" element={<RaiseTicketPage />} />
          {/* Billing routes */}
          <Route path="/billing/overview" element={<BillingOverviewPage />} />
          <Route path="/billing/wallet-logs" element={<WalletLogsPage />} />
          {/* Theme route */}
          <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
          <Route
            path="/superadmin/employeedashboard"
            element={<EmployeeDashboard />}
          />
          <Route path="/superadmin/lead/followup" element={<FollowUpPage />} />
          <Route
            path="/public-profile/profiles/default"
            element={<ProfileDefaultPage />}
          />
          <Route
            path="/public-profile/profiles/creator"
            element={<ProfileCreatorPage />}
          />
          <Route
            path="/public-profile/profiles/company"
            element={<ProfileCompanyPage />}
          />
          <Route
            path="/public-profile/profiles/nft"
            element={<ProfileNFTPage />}
          />
          <Route
            path="/public-profile/profiles/blogger"
            element={<ProfileBloggerPage />}
          />
          <Route
            path="/public-profile/profiles/crm"
            element={<ProfileCRMPage />}
          />
          <Route
            path="/public-profile/profiles/gamer"
            element={<ProfileGamerPage />}
          />
          <Route
            path="/public-profile/profiles/feeds"
            element={<ProfileFeedsPage />}
          />
          <Route
            path="/public-profile/profiles/plain"
            element={<ProfilePlainPage />}
          />
          <Route
            path="/public-profile/profiles/modal"
            element={<ProfileModalPage />}
          />
          <Route
            path="/public-profile/projects/3-columns"
            element={<ProjectColumn3Page />}
          />
          <Route
            path="/public-profile/projects/2-columns"
            element={<ProjectColumn2Page />}
          />
          <Route path="/public-profile/works" element={<ProfileWorksPage />} />
          <Route path="/public-profile/teams" element={<ProfileTeamsPage />} />
          <Route
            path="/public-profile/network"
            element={<ProfileNetworkPage />}
          />
          <Route
            path="/public-profile/activity"
            element={<ProfileActivityPage />}
          />
          <Route
            path="/public-profile/campaigns/card"
            element={<CampaignsCardPage />}
          />
          <Route
            path="/public-profile/campaigns/list"
            element={<CampaignsListPage />}
          />
          <Route path="/public-profile/empty" element={<ProfileEmptyPage />} />
          <Route
            path="/account/home/get-started"
            element={<AccountGetStartedPage />}
          />
          <Route
            path="/account/home/user-profile"
            element={<AccountUserProfilePage />}
          />
          <Route
            path="/account/home/company-profile"
            element={<AccountCompanyProfilePage />}
          />
          <Route
            path="/account/home/settings-sidebar"
            element={<AccountSettingsSidebarPage />}
          />
          <Route
            path="/account/home/settings-enterprise"
            element={<AccountSettingsEnterprisePage />}
          />
          <Route
            path="/account/home/settings-plain"
            element={<AccountSettingsPlainPage />}
          />
          <Route
            path="/account/home/settings-modal"
            element={<AccountSettingsModalPage />}
          />
          <Route path="/account/billing/basic" element={<AccountBasicPage />} />
          <Route
            path="/account/billing/enterprise"
            element={<AccountEnterprisePage />}
          />
          <Route path="/account/billing/plans" element={<AccountPlansPage />} />
          <Route
            path="/account/billing/history"
            element={<AccountHistoryPage />}
          />
          <Route
            path="/account/security/get-started"
            element={<AccountSecurityGetStartedPage />}
          />
          <Route
            path="/account/security/overview"
            element={<AccountOverviewPage />}
          />
          <Route
            path="/account/security/allowed-ip-addresses"
            element={<AccountAllowedIPAddressesPage />}
          />
          <Route
            path="/account/security/privacy-settings"
            element={<AccountPrivacySettingsPage />}
          />
          <Route
            path="/account/security/device-management"
            element={<AccountDeviceManagementPage />}
          />
          <Route
            path="/account/security/backup-and-recovery"
            element={<AccountBackupAndRecoveryPage />}
          />
          <Route
            path="/account/security/current-sessions"
            element={<AccountCurrentSessionsPage />}
          />
          <Route
            path="/account/security/security-log"
            element={<AccountSecurityLogPage />}
          />
          <Route
            path="/account/members/team-starter"
            element={<AccountTeamsStarterPage />}
          />
          <Route path="/account/members/teams" element={<AccountTeamsPage />} />
          <Route
            path="/account/members/team-info"
            element={<AccountTeamInfoPage />}
          />
          <Route
            path="/account/members/members-starter"
            element={<AccountMembersStarterPage />}
          />
          <Route
            path="/account/members/team-members"
            element={<AccountTeamMembersPage />}
          />
          <Route
            path="/account/members/import-members"
            element={<AccountImportMembersPage />}
          />
          <Route path="/account/members/roles" element={<AccountRolesPage />} />
          <Route
            path="/account/members/permissions-toggle"
            element={<AccountPermissionsTogglePage />}
          />
          <Route
            path="/account/members/permissions-check"
            element={<AccountPermissionsCheckPage />}
          />
          <Route
            path="/account/integrations"
            element={<AccountIntegrationsPage />}
          />
          <Route
            path="/account/notifications"
            element={<AccountNotificationsPage />}
          />
          <Route path="/account/api-keys" element={<AccountApiKeysPage />} />
          <Route
            path="/account/appearance"
            element={<AccountAppearancePage />}
          />
          <Route
            path="/account/invite-a-friend"
            element={<AccountInviteAFriendPage />}
          />
          <Route path="/account/activity" element={<AccountActivityPage />} />
          <Route
            path="/network/get-started"
            element={<NetworkGetStartedPage />}
          />
          <Route
            path="/network/user-cards/mini-cards"
            element={<NetworkMiniCardsPage />}
          />
          <Route
            path="/network/user-cards/team-crew"
            element={<NetworkUserCardsTeamCrewPage />}
          />
          <Route
            path="/network/user-cards/author"
            element={<NetworkAuthorPage />}
          />
          <Route path="/network/user-cards/nft" element={<NetworkNFTPage />} />
          <Route
            path="/network/user-cards/social"
            element={<NetworkSocialPage />}
          />
          <Route
            path="/network/user-table/team-crew"
            element={<NetworkUserTableTeamCrewPage />}
          />
          <Route
            path="/network/user-table/app-roster"
            element={<NetworkAppRosterPage />}
          />
          <Route
            path="/network/user-table/market-authors"
            element={<NetworkMarketAuthorsPage />}
          />
          <Route
            path="/network/user-table/saas-users"
            element={<NetworkSaasUsersPage />}
          />
          <Route
            path="/network/user-table/store-clients"
            element={<NetworkStoreClientsPage />}
          />
          <Route
            path="/network/user-table/visitors"
            element={<NetworkVisitorsPage />}
          />
          <Route
            path="/auth/welcome-message"
            element={<AuthenticationWelcomeMessagePage />}
          />
          <Route
            path="/auth/account-deactivated"
            element={<AuthenticationAccountDeactivatedPage />}
          />
          <Route
            path="/authentication/get-started"
            element={<AuthenticationGetStartedPage />}
          />
        </Route>
      </Route>

      <Route path="/menu-share/verify" element={<MenuViewPage />} />
      <Route path="/menu-review" element={<GuestMenuReviewPage />} />
         <Route path="/sso-login" element={<SsoLogin />} />
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
      <Route path="/403" element={<NoAccessPage />} />
    </Routes>
  );
};
export { AppRoutingSetup };
