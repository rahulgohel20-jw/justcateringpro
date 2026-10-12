import { toAbsoluteUrl } from "@/utils";
import { FormattedMessage } from "react-intl";

export default function DashboardCards({
  activeTab,
  totals = {},
  eventData = null,
}) {
  const {
    totalGiven = 0,
    totalUsed = 0,
    remaining = 0,
    totalReceived = 0,
  } = totals;

  const icons = {
    totalExpenses: "/media/icons/totalexpen.png",
    totalGiven: "/media/icons/totalgiven.png",
    usedAmount: "/media/icons/usedamount.png",
    remaining: "/media/icons/remaining.png",
    // placeholder: swap in a dedicated icon when you have one
    totalReceived: "/media/icons/totalgiven.png",
  };

  const isManager = activeTab === "manager";
  const isManagerOrCustomer = isManager || activeTab === "customer";

  const gridCols = isManager
    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
    : isManagerOrCustomer
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1";

  return (
    <>
      <div className={`grid gap-4 md:gap-6 lg:gap-8 ${gridCols}`}>
        {/* Total Given / Total Expenses Card */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              {isManagerOrCustomer ? (
                <FormattedMessage
                  id="DASHBOARD.TOTAL_GIVEN"
                  defaultMessage="Total Given"
                />
              ) : (
                <FormattedMessage
                  id="DASHBOARD.TOTAL_EXPENSES"
                  defaultMessage="Total Expenses"
                />
              )}
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              {totalGiven}
            </p>
          </div>
          <img
            src={toAbsoluteUrl(
              isManagerOrCustomer ? icons.totalGiven : icons.totalExpenses,
            )}
            className="max-h-[50px] md:max-h-[60px] lg:max-h-[80px]"
            alt=""
          />
        </div>

        {/* Used Amount & Remaining — manager and customer */}
        {isManagerOrCustomer && (
          <>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                  <FormattedMessage
                    id="DASHBOARD.USED_AMOUNT"
                    defaultMessage="Used Amount"
                  />
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {totalUsed}
                </p>
              </div>
              <img
                src={toAbsoluteUrl(icons.usedAmount)}
                className="max-h-[50px] md:max-h-[60px] lg:max-h-[80px]"
                alt=""
              />
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                  <FormattedMessage
                    id="DASHBOARD.REMAINING"
                    defaultMessage="Remaining"
                  />
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {remaining}
                </p>
              </div>
              <img
                src={toAbsoluteUrl(icons.remaining)}
                className="max-h-[50px] md:max-h-[60px] lg:max-h-[80px]"
                alt=""
              />
            </div>
          </>
        )}

        {/* Total Received — manager only */}
        {isManager && (
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                <FormattedMessage
                  id="DASHBOARD.TOTAL_RECEIVED"
                  defaultMessage="Total Received"
                />
              </p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {totalReceived}
              </p>
            </div>
            <img
              src={toAbsoluteUrl(icons.totalReceived)}
              className="max-h-[50px] md:max-h-[60px] lg:max-h-[80px]"
              alt=""
            />
          </div>
        )}
      </div>
    </>
  );
}