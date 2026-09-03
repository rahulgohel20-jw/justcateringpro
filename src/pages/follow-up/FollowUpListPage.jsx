import { Fragment, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Confirmation } from "@/components/confirmation/confirmation";
import AddFollowUp from "@/partials/modals/add-follow-up/AddFollowUp";
import { Tooltip } from "antd";

const FollowUpListPage = () => {
  const image = (
    <div className="flex items-center justify-center rounded-full border-2 border-success-clarity size-[100px] shrink-0 bg-light">
      <img
        src={toAbsoluteUrl("/media/brand-logos/duolingo.svg")}
        className="size-[50px]"
      />
    </div>
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (data) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  const removeContact = () => {};

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const items = [
    {
      logo: "300-2.png",
      name: "Jason Tatum",
      email: "jasontatum21@gmail.com",
      mobile: "9087676588",
      status: "Open",
      type: "Call",
      date_of_followup: "2023-10-01 05:45 PM",
      assigned_to: "John Doe",
      label: false,
    },
  ];
  const renderItem = (item, index) => {
    return (
      <>
        <style>
          {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
        </style>
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="card min-w-full">
            <div className="flex flex-col flex-1">
              <div className="flex flex-wrap justify-between items-center gap-7 p-4 rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                <div className="flex flex-wrap items-center gap-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <img
                      src={toAbsoluteUrl(`/media/avatars/${item.logo}`)}
                      className="rounded-full max-h-10 max-w-full shrink-0"
                      alt=""
                    />
                    <div className="grid grid-col">
                      <p
                        className="text-md font-medium text-gray-900"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <span className="text-sm" title={item.email}>
                        {item.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                    <div className="flex flex-col">
                      <div className="text-xs">Type</div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.type}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs">Reminder</div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.date_of_followup}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip title="Follow Status">
                    <div
                      className="badge badge-outline badge-secondary rounded-full badge-lg"
                      title="Status"
                    >
                      {item.status}
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-md">
                    <i className="ki-filled ki-user text-success me-2"></i>
                    {item.name}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-ki-filled ki-sms text-success me-2"></i>
                    {item.email}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-call text-success me-2"></i>
                    {item.mobile}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Tooltip title="Edit">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-primary"
                      title="Edit"
                    >
                      <KeenIcon icon="notepad-edit" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Close">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-info"
                      title="Close"
                    >
                      <KeenIcon icon="check-circle" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Remark">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-warning"
                      title="Remark"
                    >
                      <i className="ki-filled ki-tab-tablet"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-danger"
                      title="Delete"
                    >
                      <KeenIcon icon="trash" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full">
            <div className="flex flex-col flex-1">
              <div className="flex flex-wrap justify-between items-center gap-7 p-4 rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                <div className="flex flex-wrap items-center gap-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <img
                      src={toAbsoluteUrl(`/media/avatars/${item.logo}`)}
                      className="rounded-full max-h-10 max-w-full shrink-0"
                      alt=""
                    />
                    <div className="grid grid-col">
                      <p
                        className="text-md font-medium text-gray-900"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      <span className="text-sm" title={item.email}>
                        {item.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                    <div className="flex flex-col">
                      <div className="text-xs">Type</div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.type}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs">Reminder</div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.date_of_followup}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip title="Follow Status">
                    <div
                      className="badge badge-outline badge-success rounded-full badge-lg"
                      title="Status"
                    >
                      Success
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-md">
                    <i className="ki-filled ki-user text-success me-2"></i>
                    {item.name}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-ki-filled ki-sms text-success me-2"></i>
                    {item.email}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-call text-success me-2"></i>
                    {item.mobile}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Tooltip title="Edit">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-primary"
                      title="Edit"
                    >
                      <KeenIcon icon="notepad-edit" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Close">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-info"
                      title="Close"
                    >
                      <KeenIcon icon="check-circle" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Remark">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-warning"
                      title="Remark"
                    >
                      <i className="ki-filled ki-tab-tablet"></i>
                    </button>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <button
                      className="btn btn-sm btn-icon btn-clear btn-danger"
                      title="Delete"
                    >
                      <KeenIcon icon="trash" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Follow Up" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search Follow Up"
                type="text"
              />
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Assigned to</option>
                <option value="1">John Doe</option>
                <option value="2">Hen Mark</option>
                <option value="3">Ken Folk</option>
                <option value="4">Jimmy Bar</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Today</option>
                <option value="1">Yesterday</option>
                <option value="2">This Week</option>
                <option value="3">This Month</option>
                <option value="4">Last Month</option>
                <option value="5">All Time</option>
                <option value="6">Custom</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">All</option>
                <option value="1">Overdue</option>
                <option value="2">Open</option>
                <option value="3">Closed</option>
              </select>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Refresh">
                <i className="ki-filled ki-arrows-circle"></i>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              title="Add Follow Up"
              onClick={handleModalOpen}
            >
              <i className="ki-filled ki-plus"></i> Add Follow Up
            </button>
          </div>
        </div>
        <div className="grid gap-5">
          {items.map((item, index) => {
            return renderItem(item, index);
          })}
        </div>
        {/* TableComponent */}
      </Container>
      <AddFollowUp
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};
export { FollowUpListPage };
