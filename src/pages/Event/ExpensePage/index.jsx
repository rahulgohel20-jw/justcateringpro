import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import DashboardCards from "./component/DashboardCards";
import ExpenseTabs from "./component/ExpenseTabs";
import ExpenseTable from "./component/ExpenseTable";
import AddNewManagerModal from "@/partials/modals/add-manager/AddNewManagerModal";
import AddSupplierCustomerModal from "@/partials/modals/add-supplier-customer-modal/AddSupplierCustomerModal";
import AddExpenseModal from "../../../partials/modals/add-Expense-Modal/AddExpenseModal";
import ViewExpenseDetailsModal from "@/partials/modals/view-expense-modal/ViewExpenseDetailsModal";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

import NoData from "../../../components/Nodata";
import {
  GETExpenseBYUserType,
  GetEventMasterById,
  DeleteByExpenseID,
} from "@/services/apiServices";

export default function ExpenseDetails() {
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState("manager");
  const [searchQuery, setSearchQuery] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eventDataLoading, setEventDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [contactType, setContactType] = useState("Supplier");
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [openManagerModal, setOpenManagerModal] = useState(false);
  const [eventData, setEventData] = useState(null);

  const userId = localStorage.getItem("userId");

  const [cards, setCards] = useState([]);

  const [totals, setTotals] = useState({
    totalGiven: 0,
    totalUsed: 0,
    remaining: 0,
  });

  // Add this derived value (no new state needed)
  const filteredExpenses = expenses.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.role?.toLowerCase().includes(q) ||
      e.mobile?.toLowerCase().includes(q) ||
      e.date?.toLowerCase().includes(q) ||
      e.paymentType?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        return;
      }

      setEventDataLoading(true);
      setError(null);

      try {
        const response = await GetEventMasterById(eventId);
        let data = response?.data?.data || response?.data || response;

        if (data["Event Details"]?.length) {
          data = data["Event Details"][0];
        }

        setEventData(data);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(err?.message || "Failed to load event data");
      } finally {
        setEventDataLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    setTotals({
      totalGiven: 0,
      totalUsed: 0,
      remaining: 0,
    });

    setExpenses([]);
  }, [activeTab]);

  useEffect(() => {
    fetchExpenses();
  }, [activeTab, eventId, userId]);

  const fetchExpenses = async () => {
    if (!eventId || !userId) return;

    setLoading(true);
    const userType = activeTab.toUpperCase();

    try {
      const res = await GETExpenseBYUserType({
        eventId,
        userId,
        userType,
      });

      const apiData = res?.data?.data || {};
      const list = apiData.data || [];

      const normalized = list.map((e) => {
        const managerName =
          e.managerFirstname && e.managerLastname
            ? `${e.managerFirstname} ${e.managerLastname}`
            : e.partyNameEnglish || "-";

        return {
          id: e.expenseId,
          name: managerName,
          role: e.roleName || "-",
          mobile: e.mobileNo || "-",
          date: e.date,
          amount: e.amount,
          paymentType: e.paymentType === "cash" ? "Cash" : "Online",
          initials: (managerName[0] || "U").toUpperCase(),
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      });

      setExpenses(normalized);

      if (activeTab === "manager") {
        setTotals({
          totalGiven: Number(apiData.total_given_amount) || 0,
          totalUsed: Number(apiData.total_used_amount) || 0,
          remaining: Number(apiData.remaining_amount) || 0,
        });
      } else {
        setTotals({
          totalGiven: Number(apiData.total_given_amount) || 0,
          totalUsed: 0,
          remaining: 0,
        });
      }
    } catch (err) {
      console.error(err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (expense) => {
    setSelectedExpenseId(expense.id);
    setViewOpen(true);
  };

  const getTitle = () => {
    return `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Expense Usage Details`;
  };

  const getAddButtonText = () =>
    `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;

  const handleModalClose = (newExpense) => {
    setOpenManagerModal(false);
    setOpenSupplierModal(false);
    setOpenExpenseModal(false);

    if (newExpense) {
      fetchExpenses();
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!expenseId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await DeleteByExpenseID(expenseId);
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));

        Swal.fire({
          title: "Deleted!",
          text: "Expense has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to delete expense:", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete expense. Please try again.",
          icon: "error",
        });
      }
    }
  };

  if (eventDataLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold text-yellow-900">
                Unable to load event data
              </p>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 lg:mb-8">
          {getTitle()}
        </h1>

        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-wrap items-center justify-between p-4 gap-3">
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_ID"
                    defaultMessage="Event ID:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventNo || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-user text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.PARTY_NAME"
                    defaultMessage="Party Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.party?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-geolocation-home text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_NAME"
                    defaultMessage="Event Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventType?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                    defaultMessage="Event Date & Time:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventStartDateTime || ""}
                </span>
              </div>
            </div>
            <div className="w-full h-0"></div>
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_VENUE"
                    defaultMessage="Event Venue:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.venue?.nameEnglish || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="bg-gray-100 rounded-lg shadow-lg p-6 mb-8">
          <DashboardCards
            activeTab={activeTab}
            totals={totals}
            eventData={eventData}
          />
        </div>

        {/* Expense Table */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">
              Recent Expense Reports
            </h2>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
              />
            </div>
          </div>

          <ExpenseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <NoData
                text={`No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} expenses found`}
              />
            ) : (
              <ExpenseTable
                activeTab={activeTab}
                data={filteredExpenses}
                onAddExpense={(managerName, expenseId) => {
                  setSelectedManager(managerName);
                  setSelectedExpenseId(expenseId);
                  setOpenExpenseModal(true);
                }}
                onView={handleView}
                onDelete={handleDeleteExpense}
              />
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            if (activeTab === "manager") setOpenManagerModal(true);
            else if (activeTab === "supplier") {
              setContactType("Supplier");
              setOpenSupplierModal(true);
            } else if (activeTab === "customer") {
              setContactType("Customer");
              setOpenSupplierModal(true);
            }
          }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-primary hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-3xl flex items-center gap-2 shadow-lg text-sm md:text-base z-50"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">{getAddButtonText()}</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Modals */}
        <AddNewManagerModal
          open={openManagerModal}
          onClose={handleModalClose}
          eventId={eventId}
          eventData={eventData}
        />
        <AddSupplierCustomerModal
          open={openSupplierModal}
          type={contactType}
          onClose={handleModalClose}
          eventId={eventId}
          eventData={eventData}
          eventNo={eventData?.eventNo}
        />
        <AddExpenseModal
          open={openExpenseModal}
          onClose={handleModalClose}
          managerName={selectedManager}
          expenseId={selectedExpenseId}
          eventId={eventId}
          userId={userId}
          userType={activeTab.toUpperCase()}
          eventNo={eventData?.eventNo}
        />

        <ViewExpenseDetailsModal
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setSelectedExpenseId(null);
          }}
          expenseId={selectedExpenseId}
          eventId={eventId}
          userId={userId}
          userType={activeTab.toUpperCase()}
        />
      </div>
    </div>
  );
}
