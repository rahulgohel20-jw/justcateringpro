import { Fragment } from "react";
import { Container } from "@/components/container";
import { KeenIcon } from "@/components";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";

const BillingOverviewPage = () => {
  return (
    <Fragment>
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
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Billing Overview" }]} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 mb-4">
          <div className="card min-w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
              <div className="flex items-center gap-4">
                <CommonHexagonBadge
                  stroke="stroke-success-clarity"
                  fill="fill-light"
                  size="size-[60px]"
                  badge={
                    <i className="ki-filled ki-wallet text-xl text-success"></i>
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h3 className="text-xl font-semibold text-success">
                      &#8377; 0.00
                    </h3>
                    <span className="badge badge-sm badge-outline shrink-0">
                      16 days left
                    </span>
                  </div>
                  <div className="form-info text-gray-800 font-normal">
                    Wallet Balance
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
                <button
                  className="btn btn-sm btn-success shrink-0"
                  title="Recharge Now"
                >
                  &#8377; Recharge Now
                </button>
              </div>
            </div>
          </div>
          <div className="card min-w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
              <div className="flex items-center gap-4">
                <CommonHexagonBadge
                  stroke="stroke-success-clarity"
                  fill="fill-light"
                  size="size-[60px]"
                  badge={
                    <KeenIcon
                      icon="security-user"
                      className="text-xl text-success text-brand"
                    />
                  }
                />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Contact Seles Team
                    </h3>
                    <span className="badge badge-sm badge-outline shrink-0">
                      79 connections
                    </span>
                  </div>
                  <div className="form-info text-gray-800 font-normal">
                    Get personalized assistance for your business needs
                  </div>
                </div>
              </div>
              <div className="flex items-center flex-wrap md:flex-nowrap gap-1.5">
                <button
                  className="btn btn-sm btn-success shrink-0"
                  title="Connect"
                >
                  <i className="ki-filled ki-ki-filled ki-whatsapp"></i> Connect
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
          <div className="card min-w-full">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Automate Tasks
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Delegate Tasks and get them completed without manual
                      followups
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-primary shrink-0"
                    title="Add Users"
                  >
                    <i className="ki-filled ki-ki-filled ki-user"></i>Add Users
                  </button>
                </div>
                <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        5 Users
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Subscribers
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        21 Feb 2026
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Renews on
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        1,999/user
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Per year
                      </span>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <h4 className="font-semibold text-gray-900">Features:</h4>
                  <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Unlimited Tasks Team Performance Report
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Links Management for Your Team
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Email Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        WhatsApp Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Mobile Apps
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Repeated Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        File Uploads
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Tasks with Voice Notes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Task Wise Reminders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Save more than 4 hours per day per employee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full ">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Automate Tasks
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Delegate Tasks and get them completed without manual
                      followups
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-primary shrink-0"
                    title="Add Users"
                  >
                    <i className="ki-filled ki-ki-filled ki-user"></i>Add Users
                  </button>
                </div>
                <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        5 Users
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Subscribers
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        21 Feb 2026
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Renews on
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        1,999/user
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Per year
                      </span>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <h4 className="font-semibold text-gray-900">Features:</h4>
                  <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Unlimited Tasks Team Performance Report
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Links Management for Your Team
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Email Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        WhatsApp Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Mobile Apps
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Repeated Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        File Uploads
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Tasks with Voice Notes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Task Wise Reminders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Save more than 4 hours per day per employee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Automate Tasks
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Delegate Tasks and get them completed without manual
                      followups
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-primary shrink-0"
                    title="Add Users"
                  >
                    <i className="ki-filled ki-ki-filled ki-user"></i>Add Users
                  </button>
                </div>
                <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        5 Users
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Subscribers
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        21 Feb 2026
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Renews on
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        1,999/user
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Per year
                      </span>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <h4 className="font-semibold text-gray-900">Features:</h4>
                  <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Unlimited Tasks Team Performance Report
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Links Management for Your Team
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Email Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        WhatsApp Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Mobile Apps
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Repeated Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        File Uploads
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Tasks with Voice Notes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Task Wise Reminders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Save more than 4 hours per day per employee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full ">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Automate Tasks
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Delegate Tasks and get them completed without manual
                      followups
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-primary shrink-0"
                    title="Add Users"
                  >
                    <i className="ki-filled ki-ki-filled ki-user"></i>Add Users
                  </button>
                </div>
                <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        5 Users
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Subscribers
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        21 Feb 2026
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Renews on
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">
                        1,999/user
                      </span>
                      <span className="text-2sm text-2sm text-gray-700">
                        Per year
                      </span>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <h4 className="font-semibold text-gray-900">Features:</h4>
                  <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Unlimited Tasks Team Performance Report
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Links Management for Your Team
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Email Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        WhatsApp Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Mobile Apps
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Repeated Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        File Uploads
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Delegate Tasks with Voice Notes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Task Wise Reminders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">
                        Save more than 4 hours per day per employee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Sales & Payments
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Track your Sales and Automate Payment Reminders
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-light shrink-0"
                    title="Coming soon"
                    disabled
                  >
                    Coming soon
                  </button>
                </div>
                {/* <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">5 Users</span>
                      <span className="text-2sm text-2sm text-gray-700">Subscribers</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">21 Feb 2026</span>
                      <span className="text-2sm text-2sm text-gray-700">Renews on</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">1,999/user</span>
                      <span className="text-2sm text-2sm text-gray-700">Per year</span>
                    </div>
                  </div>
                </div> */}
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <p className="text-sm text-gray-400 font-light text-center py-3">
                    Feature is not available
                  </p>
                  {/* <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Delegate Unlimited Tasks Team Performance Report</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Links Management for Your Team</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">WhatsApp Notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Mobile Apps</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Repeated Tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">File Uploads</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Delegate Tasks with Voice Notes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Task Wise Reminders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Save more than 4 hours per day per employee</span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="card min-w-full">
            <div className="card-body p-5">
              <div className="flex flex-col gap-3 lg:gap-4 grow">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Automate WA Chatbot
                    </h2>
                    <p className="text-2sm text-gray-700">
                      Create WhatsApp Chatbot to automate WA conversations for
                      Sales, Support and lead Generation
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-light shrink-0"
                    title="Coming soon"
                    disabled
                  >
                    Coming soon
                  </button>
                </div>
                {/* <div className="flex items-center justify-between w-full flex-wrap gap-1 lg:gap-1.5">
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-users text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">5 Users</span>
                      <span className="text-2sm text-2sm text-gray-700">Subscribers</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <i className="ki-filled ki-timer text-xl"></i>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">21 Feb 2026</span>
                      <span className="text-2sm text-2sm text-gray-700">Renews on</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-dashed border-input shrink-0 rounded-md px-2 py-3 min-w-24 max-w-auto">
                    <span className="text-xl">&#8377;</span>
                    <div className="flex flex-col">
                      <span className="text-sm text-base leading-none font-bold text-gray-800">1,999/user</span>
                      <span className="text-2sm text-2sm text-gray-700">Per year</span>
                    </div>
                  </div>
                </div> */}
                <hr />
                <div className="grid md:grid-cols-1 gap-2">
                  <p className="text-sm text-gray-400 font-light text-center py-3">
                    Feature is not available
                  </p>
                  {/* <div className="grid md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Delegate Unlimited Tasks Team Performance Report</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Links Management for Your Team</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Email Notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">WhatsApp Notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Mobile Apps</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Repeated Tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">File Uploads</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Delegate Tasks with Voice Notes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Task Wise Reminders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ki-filled ki-check-circle text-base text-success"></i>
                      <span className="text-sm text-gray-900 text-nowrap">Save more than 4 hours per day per employee</span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};
export { BillingOverviewPage };
