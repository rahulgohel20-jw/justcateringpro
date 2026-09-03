import { Fragment, useState } from "react";
import { toAbsoluteUrl } from "@/utils";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import AddContact from "@/partials/modals/add-company/AddCompany";
import { CommonHexagonBadge } from "@/partials/common";

import { Navbar, NavbarActions, NavbarDropdown } from "@/partials/navbar";
import { PageMenu } from "@/pages/public-profile";
import { Tooltip } from "antd";
const CompanyDetails = () => {
  const image = (
    <div className="flex items-center justify-center rounded-full border-2 border-success-clarity size-[100px] shrink-0 bg-light">
      <img
        src={toAbsoluteUrl("/media/brand-logos/duolingo.svg")}
        className="size-[50px]"
      />
    </div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const items = [
    {
      logo: "300-2.png",
      name: "Jason Tatum",
      email: "jasontatum21@gmail.com",
      mobile: "9087676588",
      label: false,
    },
    {
      logo: "300-2.png",
      name: "Jason Tatum",
      email: "jasontatum21@gmail.com",
      mobile: "9087676588",
      label: false,
    },
    {
      logo: "300-2.png",
      name: "Jason Tatum",
      email: "jasontatum21@gmail.com",
      mobile: "9087676588",
      label: false,
    },
  ];
  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="flex items-center justify-between border border-gray-200 rounded-xl gap-2 px-4 py-4 bg-secondary-clarity"
      >
        <div className="flex items-center rounded-circle gap-3.5">
          <img
            src={toAbsoluteUrl(`/media/avatars/${item.logo}`)}
            className="w-10 shrink-0"
            alt=""
          />

          <div className="flex flex-col">
            <a
              href="#"
              className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
            >
              {item.name}
            </a>
            <span className="text-2sm text-gray-700">{item.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="#"
            className="text-sm font-medium text-gray-900 hover:text-primary-active mb-px"
          >
            {item.mobile}
          </a>
        </div>
        <div className="flex items-center gap-5">
          {item.label && (
            <span className="badge badge-sm badge-success badge-outline">
              Primary
            </span>
          )}
          <div className="flex gap-0.5">
            <div className="btn btn-sm btn-icon btn-clear btn-info">
              <KeenIcon icon="notepad-edit" />
            </div>
            <div className="btn btn-sm btn-icon btn-clear btn-light">
              <KeenIcon icon="trash" />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      <Fragment>
        <Container>
          {/* filters */}
          <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* <PageMenu /> */}
              <button
                type="button"
                className="btn btn-sm btn-primary"
                title="All Tasks"
              >
                All Tasks
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                title="Tasks Templates"
              >
                Tasks Templates
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                title="Tasks Directory"
              >
                Tasks Directory
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleModalOpen}
                title="Edit Company"
              >
                <i className="ki-filled ki-notepad-edit"></i> Edit Company
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                title="Delete Company"
              >
                <i className="ki-filled ki-trash"></i> Delete Company
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 border rounded-lg">
            {/* Left */}
            <div className="col-span-1">
              <div className="h-full lg:border-e lg:border-e-border shrink-0 p-4 lg:p-7 bg-muted/15">
                <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
                  Company Details
                  <CommonHexagonBadge
                    stroke="stroke-success"
                    fill="fill-light"
                    size="size-[38px]"
                    badge={
                      <i className="ki-filled ki-bank text-lg text-success"></i>
                    }
                  />
                </h6>
                <div className="flex flex-col flex-wrap gap-1.5">
                  <div className="flex items-center gap-2">
                    <i className="ki-filled ki-bank text-success"></i>
                    <div className="text-sm text-gray-700">Company Name:</div>
                    <div className="text-md font-medium text-gray-900">
                      John Ferki
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ki-filled ki-geolocation text-success"></i>
                    <div className="text-sm text-gray-700">Location:</div>
                    <div className="text-md font-medium text-gray-900">
                      Frank,Italy
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ki-filled ki-map text-success"></i>
                    <div className="text-sm text-gray-700">Addres:</div>
                    <div className="text-md font-medium text-gray-900">
                      'ABS', Corps ferli Cab
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ki-filled ki-ship text-success"></i>
                    <div className="text-sm text-gray-700">
                      Shipping Address:
                    </div>
                    <div className="text-md font-medium text-gray-900">
                      null
                    </div>
                  </div>
                </div>
                <hr className="border-t border-gray-200 my-5" />
                <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
                  Tags
                  <button
                    className="btn btn-success w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                    title="Add Tag"
                  >
                    <i className="ki-filled ki-plus"></i>
                  </button>
                </h6>
                <div className="flex flex-col my-3">
                  <div className="filItems relative">
                    <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                    <input
                      className="input pl-8"
                      placeholder="Search company"
                      type="text"
                    />
                  </div>
                  <div className="text-center text-gray-500 mt-2 text-sm">
                    No Tags
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className="btn btn-light h-7 rounded-full px-3"
                    title="Lead"
                  >
                    Lead <span className="ki-filled ki-cross text-sm"></span>
                  </button>
                  <button
                    className="btn btn-light h-7 rounded-full px-3"
                    title="Sample"
                  >
                    Sample <span className="ki-filled ki-cross text-sm"></span>
                  </button>
                  <button
                    className="btn btn-light h-7 rounded-full px-3"
                    title="Demo"
                  >
                    Demo <span className="ki-filled ki-cross text-sm"></span>
                  </button>
                </div>
              </div>
            </div>
            {/* Right */}
            <div className="col-span-2 space-y-4">
              <div className="cop-4 lg:p-7 grow">
                {/* Filter */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Contact Related to Company
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="filItems relative">
                      <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                      <input
                        className="input pl-8"
                        placeholder="Search contact"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 lg:gap-4 max-h-[600px] overflow-auto scrollable-y">
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-wrap justify-between items-center gap-7 p-4 rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                        <div className="flex flex-wrap items-center gap-7">
                          <div className="flex flex-wrap items-center gap-3">
                            <img
                              src={toAbsoluteUrl("/images/user_img.jpg")}
                              className="rounded-full max-h-10 max-w-full shrink-0"
                              alt=""
                            />
                            <div className="grid grid-col">
                              <p className="text-md font-medium text-gray-900">
                                Ragnar Lothbrok
                              </p>
                              <span
                                className="text-sm"
                                title="ragnar.lothbrok@gmail.com"
                              >
                                ragnar.lothbrok@gmail.com
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-md font-medium text-gray-900">
                          <i className="ki-filled ki-call text-success me-2"></i>
                          +91 9988776655
                        </div>
                        <div className="flex gap-2">
                          <Tooltip title="View">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-success"
                              title="View"
                            >
                              <i className="ki-filled ki-eye"></i>
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
                              src={toAbsoluteUrl("/images/user_img.jpg")}
                              className="rounded-full max-h-10 max-w-full shrink-0"
                              alt=""
                            />
                            <div className="grid grid-col">
                              <p className="text-md font-medium text-gray-900">
                                Ragnar Lothbrok
                              </p>
                              <span
                                className="text-sm"
                                title="ragnar.lothbrok@gmail.com"
                              >
                                ragnar.lothbrok@gmail.com
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-md font-medium text-gray-900">
                          <i className="ki-filled ki-call text-success me-2"></i>
                          +91 9988776655
                        </div>
                        <div className="flex gap-2">
                          <Tooltip title="View">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-success"
                              title="View"
                            >
                              <i className="ki-filled ki-eye"></i>
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
              </div>
            </div>
          </div>
          <AddContact
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        </Container>
      </Fragment>
      {/* <div className="grid gap-5">
        {items.map((item, index) => {
          return renderItem(item, index);
        })}
      </div> */}
    </>
  );
};
export { CompanyDetails };
