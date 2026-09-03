import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { columns } from "./constant";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { SubscriptionByUser } from "../../../services/apiServices";

const SubscriptionSettingsPage = () => {
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const DeleteEventtype = () => {};
  const handleEdit = () => {};

  const intl = useIntl();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.warn("No userId found in localStorage");
          return;
        }

        const response = await SubscriptionByUser(userId);
        const histories = response?.data?.data?.["User Plans Histories"];

        if (histories?.length > 0) {
          const latest = histories[0];
          setSubscriptionData(latest);

          // 🟢 Transform API data to match table columns
          const formattedTableData = histories.map((item, index) => ({
            sr_no: index + 1,
            type: item?.plan?.name || "-",
            billing_cycle: item?.plan?.billingCycle || "no billing cycle",
            start_date: item?.startDate || "-",
            end_date: item?.endDate || "-",
            status: item?.isActive ? "Active" : "Inactive",
          }));

          setTableData(formattedTableData);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="SETTING.SUBSCRIPTION"
              defaultMessage="Subscription"
            />
          </h1>
        </div>
        {loading ? (
          <div className="text-center py-10">
            Loading subscription details...
          </div>
        ) : subscriptionData ? (
          <div className="card min-w-full p-4 mb-10">
            <div className="mb-4">
              <h2 className="text-black text-lg font-semibold">
                <FormattedMessage
                  id="SETTING.SUBSCRIPTION"
                  defaultMessage="Subscription"
                />
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-base">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage
                    id="SETTING.PLAN"
                    defaultMessage="Plan Name"
                  />
                </p>
                <p className="font-semibold">
                  {subscriptionData?.plan?.name || "-"}
                </p>{" "}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage
                    id="SETTING.BILLING"
                    defaultMessage="Billing Cycle"
                  />
                </p>
                <p className="font-semibold">
                  {subscriptionData?.plan?.billingCycle || "-"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage id="SETTING.PRICE" defaultMessage="Price" />
                </p>
                <p className="font-semibold">
                  Rs. {subscriptionData?.plan?.price || 0}.00 /mo
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage
                    id="SETTING.USERS"
                    defaultMessage="Subscription Status"
                  />
                </p>
                <p className="font-semibold pt-2">
                  {subscriptionData?.isActive ? (
                    <span className="text-green-600 bg-green-100 px-2 py-1 rounded-md">
                      <FormattedMessage
                        id="SETTING.ACTIVE"
                        defaultMessage="Active"
                      />
                    </span>
                  ) : (
                    <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md">
                      <FormattedMessage
                        id="SETTING.INACTIVE"
                        defaultMessage="Inactive"
                      />
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_START_DATE"
                    defaultMessage="Start Date"
                  />
                </p>
                <p className="font-semibold">
                  {subscriptionData?.startDate || "-"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_END_DATE"
                    defaultMessage="End Date"
                  />
                </p>
                <p className="font-semibold">
                  {subscriptionData?.endDate || "-"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No subscription data found.
          </div>
        )}

        <div className="card min-w-full p-4  mb-10">
          <div className=" flex  items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-black text-lg font-semibold">
                <FormattedMessage
                  id="SETTING.SUBSCRIPTION_ACTIVITY"
                  defaultMessage="Subscription Activity"
                />
              </h2>
            </div>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "SETTING.SEARCH_SUBSCRIPTION_ACTIVITY",
                  defaultMessage: "Search Subscription Activity...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <TableComponent
            columns={columns(handleEdit, DeleteEventtype)}
            data={tableData}
            paginationSize={10}
          />
        </div>
      </Container>
    </Fragment>
  );
};
export { SubscriptionSettingsPage };
