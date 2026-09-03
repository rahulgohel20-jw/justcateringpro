import { Fragment, useState } from "react";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import AddContact from "@/partials/modals/add-contact/AddContact";
import { toAbsoluteUrl } from "@/utils";
import { CommonHexagonBadge } from "@/partials/common";
import { Tooltip } from "antd";

const ContactDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [searchTag, setSearchTag] = useState("");

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const toggleTag = () => {
    setIsTagOpen((prev) => !prev);
  };

  const items = [
    {
      fullName: "Babubhai Vaghela",
      username: "vaghela",
      created: "3 days ago",
      updated: "3 days ago",
      initials: "MG",
      assign: "Manan Gandhi",
    },
    // more items...
  ];
  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-4 bg-white shadow-sm"
      >
        <div className="w-1/4">
          <div className="text-sm font-semibold text-gray-800">
            {item.fullName}
          </div>
          <div className="text-xs text-gray-500">{item.username}</div>
        </div>
        <div className="text-sm text-gray-500 w-10 text-center">0</div>
        <div className="flex items-center gap-3 w-1/3">
          <div className="text-xs text-gray-500">
            <div>{item.assign}</div>
            <div>Created At: {item.created}</div>
            <div>Updated At: {item.updated}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
            {item.initials}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
            New Inquiry
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button">
            <KeenIcon icon="eye" />
          </button>
          <button type="button">
            <KeenIcon icon="dots-horizontal" />
          </button>
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
                title="Edit Contact"
              >
                <i className="ki-filled ki-notepad-edit"></i> Edit Contact
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                title="Delete Contact"
              >
                <i className="ki-filled ki-trash"></i> Delete Contact
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border rounded-lg">
            {/* Left */}
            <div className="col-span-1">
              <div className="h-full lg:border-e lg:border-e-border shrink-0 p-4 lg:p-7 bg-muted/15">
                <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
                  Contact Details
                  <CommonHexagonBadge
                    stroke="stroke-success"
                    fill="fill-light"
                    size="size-[38px]"
                    badge={
                      <i className="ki-filled ki-book-open text-lg text-success"></i>
                    }
                  />
                </h6>
                <div className="flex flex-col flex-wrap gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">First Name:</div>
                    <div className="text-md font-medium text-gray-900">
                      John
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">Last Name:</div>
                    <div className="text-md font-medium text-gray-900">
                      Ferki
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">Phone No:</div>
                    <div className="text-md font-medium text-gray-900">
                      +91 98765 54321
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">Email:</div>
                    <div className="text-md font-medium text-gray-900">
                      example@gmail.com
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">Date of Birth:</div>
                    <div className="text-md font-medium text-gray-900">
                      DD/MM/YYYY
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">
                      Date of Anniversary:
                    </div>
                    <div className="text-md font-medium text-gray-900">
                      DD/MM/YYYY
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-700">Status:</div>
                    <div className="text-md font-medium text-gray-900">
                      <span className="badge badge-sm badge-success badge-outline">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <hr className="border-t border-gray-200 my-5" />
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
                    <div className="text-sm text-gray-700">Company Addres:</div>
                    <div className="text-md font-medium text-gray-900">
                      Ahmedabad Gujarat India
                    </div>
                  </div>
                </div>

                <hr className="border-t border-gray-200 my-5" />
                <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
                  Tags
                  <button
                    onClick={toggleTag}
                    className="btn btn-success w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                    title="Add Tag"
                  >
                    <i className="ki-filled ki-plus"></i>
                  </button>
                </h6>
                {isTagOpen && (
                  <div className="flex flex-col my-3">
                    <div className="filItems relative">
                      <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                      <input
                        className="input pl-8"
                        placeholder="Search here"
                        type="text"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                      />
                    </div>
                    <div className="text-center text-gray-500 mt-2 text-sm">
                      No Tags
                    </div>
                  </div>
                )}
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
                    Leads related to this contact
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Leads Status">
                            <div
                              className="badge badge-outline badge-warning rounded-full badge-lg"
                              title="New Inquiry"
                            >
                              New Inquiry
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
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
                          <Tooltip title="Edit">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-primary"
                              title="Edit"
                            >
                              <KeenIcon icon="notepad-edit" />
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
                          <Tooltip title="More">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-info"
                              title="More"
                            >
                              <i className="ki-filled ki-dots-vertical"></i>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Leads Status">
                            <div
                              className="badge badge-outline badge-warning rounded-full badge-lg"
                              title="New Inquiry"
                            >
                              New Inquiry
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
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
                          <Tooltip title="Edit">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-primary"
                              title="Edit"
                            >
                              <KeenIcon icon="notepad-edit" />
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
                          <Tooltip title="More">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-info"
                              title="More"
                            >
                              <i className="ki-filled ki-dots-vertical"></i>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Leads Status">
                            <div
                              className="badge badge-outline badge-warning rounded-full badge-lg"
                              title="New Inquiry"
                            >
                              New Inquiry
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
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
                          <Tooltip title="Edit">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-primary"
                              title="Edit"
                            >
                              <KeenIcon icon="notepad-edit" />
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
                          <Tooltip title="More">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-info"
                              title="More"
                            >
                              <i className="ki-filled ki-dots-vertical"></i>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tooltip title="Leads Status">
                            <div
                              className="badge badge-outline badge-warning rounded-full badge-lg"
                              title="New Inquiry"
                            >
                              New Inquiry
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
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
                          <Tooltip title="Edit">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-primary"
                              title="Edit"
                            >
                              <KeenIcon icon="notepad-edit" />
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
                          <Tooltip title="More">
                            <button
                              className="btn btn-sm btn-icon btn-clear btn-info"
                              title="More"
                            >
                              <i className="ki-filled ki-dots-vertical"></i>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
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
                                Company name
                              </p>
                              <span className="text-sm" title="User name">
                                User name
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs">Created At</div>
                              <div className="text-sm font-medium text-gray-900">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs">Updated At</div>
                              <span className="text-sm font-medium text-gray-900">
                                3 days ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="badge badge-outline badge-warning rounded-full badge-lg"
                            title="New Inquiry"
                          >
                            New Inquiry
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                        <div className="flex flex-wrap items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white text-2xs font-bold uppercase flex items-center justify-center me-2">
                            mg
                          </div>
                          <p className="text-sm font-medium">Manan Gandhi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="View"
                          >
                            <i className="ki-filled ki-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Edit"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Delete"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-clear btn-light"
                            title="Action"
                          >
                            <i className="ki-filled ki-dots-vertical"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="grow">
                  <div className="lg:pb-7.5 space-y-3">
                    {items.map((item, index) => renderItem(item, index))}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          <AddContact
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        </Container>
      </Fragment>
    </>
  );
};

export { ContactDetail };
