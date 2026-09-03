import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import AddTask from "@/partials/modals/add-task/AddTask";
import { Checkbox } from "@mui/material";
import { useState } from "react";

const AllTasks = ({ itemList }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const renderItem = (item) => {
    return (
      <div key={item.id}>
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
        <div className="card min-w-full max-h-[600px] overflow-auto scrollable-y">
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-1">
                Description It was popularised in the 1960s with the release of
                Letraset sheets containing.
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-up"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
          <div className="flex items-start border-t first:border-0 border-gray-200 px-4.5 pt-4">
            <div className="flex items-center gap-2.5 me-3 pt-1">
              <i className="ki-filled ki-star text-warning"></i>
              <input type="checkbox" name="" value="" />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <div className="flex items-center w-full gap-2 cursor-pointer">
                <div className="flex flex-no-wrap text-md font-normal text-gray-700">
                  {item.title}-{item.id}
                </div>
                <div className="text-md font-medium text-primary">
                  Task title Lorem Ipsum has been the industry's standard dummy
                  text ever since the 1500s, when an unknown printer took
                </div>
              </div>
              {/* <di className="text-sm text-gray-700 mb-1">Description It was popularised in the 1960s with the release of Letraset sheets containing.</div> */}
              <div className="flex items-center gap-4">
                <div
                  className="flex justify-between items-start gap-1 h-[24px] cursor-pointer"
                  title="User"
                >
                  <span className="text-xs font-medium text-primary">
                    <i className="ki-filled ki-user"></i> User name
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Date"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-calendar-2"></i> July 26 2025
                  </span>
                </div>
                <div
                  className="flex items-start gap-1 h-[24px] cursor-pointer"
                  title="Category"
                >
                  <span className="text-xs font-medium text-gray-700">
                    <i className="ki-filled ki-bookmark"></i> Category name
                  </span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Priority"
                >
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <span className="w-full h-[4px] bg-danger rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Status"
                >
                  <span className="text-xs font-medium text-gray-700">
                    In progress
                  </span>
                  <span className="w-full h-[4px] bg-success rounded-t"></span>
                </div>
                <div
                  className="flex flex-col justify-between items-start gap-1 h-[24px] w-[80px] cursor-pointer"
                  title="Repeat"
                >
                  <span className="text-xs font-medium text-gray-700">
                    Daily
                  </span>
                  <span className="w-full h-[4px] bg-info rounded-t"></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5 ms-auto">
              <div className="flex items-center gap-3.5 ms-auto">
                <span className="flex items-center gap-1 cursor-pointer">
                  <i className="ki-filled ki-messages text-success hover:text-gray-600"></i>
                  <span className="text-sm">3</span>
                </span>
                <span className="cursor-pointer">
                  <i className="ki-filled ki-like hover:text-gray-600 text-primary"></i>
                </span>
              </div>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="Expand"
              >
                <i className="ki-filled ki-down"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="fixed left-[0px] right-[0px] bottom-[20px] mx-auto text-center">
          <div className="inline-flex items-center bg-light shadow-lg px-4 py-2 gap-4 rounded-md border">
            <span className="text-xs font-medium text-gray-600">
              1 of 23 tickets selected
            </span>
            <div className="inline-flex items-center gap-5">
              <button
                type="text"
                className="text-gray-500 hover:text-gray-700"
                title="Edit"
              >
                <i className="ki-filled ki-message-edit"></i>
              </button>
              <button
                type="text"
                className="text-gray-500 hover:text-gray-700"
                title="Downoad"
              >
                <i className="ki-filled ki-file-down"></i>
              </button>
              <button
                type="text"
                className="text-gray-500 hover:text-gray-700"
                title="Delete"
              >
                <i className="ki-filled ki-trash"></i>
              </button>
            </div>
            <span className="text-gray-300">|</span>
            <button
              type="text"
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <i className="ki-filled ki-cross"></i>
            </button>
          </div>
        </div>
        <div className="my-7"></div>
        <div className="flex flex-col gap-3 lg:gap-4">
          <div className="card min-w-full">
            <div className="flex flex-col flex-1">
              <div className="flex flex-wrap justify-between items-center gap-7 px-4 pt-4 rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:650px] user-access-bg">
                <div className="flex flex-wrap items-center gap-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>(T-{item.id})</span>
                    <div className="grid grid-col">
                      <p
                        className="text-md font-medium text-gray-900"
                        title={item.title}
                      >
                        Title: {item.title}
                      </p>
                    </div>
                    <small
                      className="text-md font-medium"
                      title={item.user_name}
                    >
                      Assign to: {item.user_name}
                    </small>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="badge badge-outline badge-secondary rounded-full badge-lg"
                    title="Status"
                  >
                    {item.status}
                  </div>
                </div>
              </div>
              <span className="text-sm px-4 pb-4" title={item.description}>
                {item.description}
              </span>
              <div className="flex flex-wrap justify-between items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-md">
                    <i className="ki-filled ki-time me-2"></i>
                    {item.created_at}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-time me-2"></i>
                    {item.category}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-time me-2"></i>
                    {item.priority}
                  </p>
                  <p className="text-md">
                    <i className="ki-filled ki-time me-2"></i>
                    {item.repeated}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <KeenIcon
                      icon="pencil"
                      className="text-success hover:text-gray-700 cursor-pointer"
                      title="Edit Task"
                    />
                    <KeenIcon
                      icon="trash"
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Delete Task"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="all-tasks">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700 flex items-center gap-2 ps-8 ms-3">
          <input type="checkbox" name="" value="" /> Select all
        </p>
        <button
          className="btn btn-primary mb-4"
          onClick={() => setIsTaskModalOpen(true)}
        >
          <i className="ki-filled ki-plus"></i>
          Add Task
        </button>
      </div>
      (itemList)
      <div>{itemList.map((item) => renderItem(item))}</div>
      <AddTask
        isModalOpen={isTaskModalOpen}
        setIsModalOpen={setIsTaskModalOpen}
      />
    </div>
  );
};

export { AllTasks };
