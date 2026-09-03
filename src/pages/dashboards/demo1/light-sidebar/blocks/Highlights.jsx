import { KeenIcon, Menu, MenuItem, MenuToggle } from "@/components";
import { useLanguage } from "@/i18n";
import { DropdownCard1 } from "@/partials/dropdowns/general";
import { FormattedMessage } from "react-intl";

const Highlights = ({ limit, data }) => {
  const { isRTL } = useLanguage();

  const totalSale = data?.planData?.reduce(
    (sum, p) => sum + p.totalAmountReceived,
    0
  );

  const rows =
    data?.planData?.map((item) => ({
      text: item.planName,
      total: item.totalAmountReceived,
      stats: 0,
      increase: false,
    })) ?? [];

  const colorMap = {
    Lite: "badge-orange",
    "E-Lite": "badge-success",
    Premium: "badge-info",
  };

  const barColorMap = {
    Lite: "bg-orange",
    "E-Lite": "bg-success",
    Premium: "bg-info",
  };

  // ✅ FIXED HERE → use data.planData instead of planData
  const items =
    data?.planData?.map((plan) => ({
      badgeColor: colorMap[plan.planName] || "badge-secondary",
      lebel: plan.planName,
      amount: plan.totalAmountReceived,
    })) ?? [];

  const total = data?.planData?.reduce(
    (sum, p) => sum + p.totalAmountReceived,
    0
  );

  const barData = data?.planData?.map((p) => ({
    name: p.planName,
    percent: total > 0 ? (p.totalAmountReceived / total) * 100 : 0,
  }));

  const renderRow = (row, index) => (
    <div
      key={index}
      className="flex items-center justify-between flex-wrap gap-2"
    >
      <div className="flex items-center gap-1.5">
        <KeenIcon icon={row.icon} className="text-base text-gray-500" />
        <span className="text-sm font-normal text-gray-900">{row.text}</span>
      </div>

      <div className="flex items-center text-sm font-medium text-gray-800 gap-6">
        <span className="lg:text-right ">
          <span className="text-[#005AA7]">₹</span> {row.total}
        </span>
        {/* <span className="lg:text-right">
          {row.increase ? (
            <KeenIcon icon="arrow-up" className="text-success" />
          ) : (
            <KeenIcon icon="arrow-down" className="text-danger" />
          )}
          &nbsp;{row.stats}%
        </span> */}
      </div>
    </div>
  );

  const renderItem = (item, index) => (
    <div key={index} className="flex items-center gap-1.5">
      <span className={`badge badge-dot size-2 ${item.badgeColor}`}></span>
      <span className="text-sm font-normal text-gray-800">{item.lebel}</span>
    </div>
  );

  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="card-title">
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_HIGHLIGHTS"
            defaultMessage="Highlights"
          />
        </h3>

        {/* <Menu>
          <MenuItem
            toggle="dropdown"
            trigger="click"
            dropdownProps={{
              placement: isRTL() ? "bottom-start" : "bottom-end",
              modifiers: [
                {
                  name: "offset",
                  options: { offset: isRTL() ? [0, -10] : [0, 10] },
                },
              ],
            }}
          >
            <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
              <KeenIcon icon="dots-vertical" />
            </MenuToggle>
            {DropdownCard1()}
          </MenuItem>
        </Menu> */}
      </div>

      <div className="card-body flex flex-col gap-4 p-5 lg:p-7.5 lg:pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-normal text-gray-700">
            <FormattedMessage
              id="USER.DASHBOARD.DASHBOARD_HIGHLIGHT_ALLTIMEUSER"
              defaultMessage="All time sales"
            />
          </span>

          <div className="flex justify-between items-center gap-2.5">
            <span className="text-3xl font-semibold text-gray-900">
              ₹ {totalSale}
            </span>
            {/* <span className="badge badge-outline badge-success badge-sm">
              +0%
            </span> */}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-1.5">
          {barData?.map((bar, index) => (
            <div
              key={index}
              className={`${barColorMap[bar.name] || "bg-secondary"} h-2 rounded-md`}
              style={{ width: `${bar.percent}%` }}
            ></div>
          ))}
        </div>

        <div className="flex items-center flex-wrap gap-4 mb-1">
          {items.map(renderItem)}
        </div>

        <div className="border-b border-gray-300"></div>

        <div className="grid gap-3">{rows.slice(0, limit).map(renderRow)}</div>
      </div>
    </div>
  );
};

export { Highlights };
