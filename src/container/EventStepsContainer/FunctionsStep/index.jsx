import { DatePicker, Tooltip } from "antd";
import FunctionTypeDropdown from "@/components/dropdowns/FunctionTypeDropdown";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { toAbsoluteUrl } from "@/utils";
import AddFunctionModal from "@/partials/modals/add-event-function/AddFunction";

import useStyles from "./style";
import { useState } from "react";

const FunctionsStep = ({ formData, setFormData }) => {
  const classes = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState({
    customer_id: "",
    person: "",
    start_date: null,
    end_date: null,
    rate: "",
    raw_material_time: null,
    address: "",
    notes: "",
  });
  const functionDataStore = () => {
    if (eventModalData.is_edit >= 0) {
      var index = eventModalData.is_edit;
      var new_function_data = formData.function_data.map((f, i) => {
        return i === index ? eventModalData : f;
      });
    } else {
      var new_function_data = formData?.function_data
        ? [...formData.function_data, eventModalData]
        : [eventModalData];
    }
    setFormData({
      ...formData,
      function_data: new_function_data,
    });

    setEventModalData({
      customer_id: "",
      person: "",
      start_date: null,
      end_date: null,
      rate: "",
      raw_material_time: null,
      address: "",
      notes: "",
    });
  };
  const handleAddFunction = () => {
    const newFunction = {
      customer_id: "",
      person: "",
      start_date: null,
      end_date: null,
      rate: "",
      raw_material_time: null,
      address: "",
      venueName: formData?.venueName || "", // ✅ Default event venue
      notes: "",
    };

    setFormData({
      ...formData,
      eventFunction: [...(formData.eventFunction || []), newFunction],
    });
  };

  const handleRemoveFunction = (index) => {
    setFormData({
      ...formData,
      function_data: formData.function_data.filter((_, i) => i !== index),
    });
  };

  const handleEditFunction = (item, index) => {
    setEventModalData({ ...item, is_edit: index });
    setIsModalOpen(true);
  };
  const handleInputChange = ({ target: { value, name } }, index) => {
    setFormData({
      ...formData,
      eventFunction: formData.eventFunction.map((f, i) =>
        i === index ? { ...f, [name]: value } : f
      ),
    });
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
      <div className="flex flex-col gap-3">
        {/* <div className="flex items-center grow gap-4">
          <div className="card w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
              <div className="flex items-center gap-5">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    Function Name Here
                  </h4>
                  <p className="form-info text-gray-700 font-normal">
                    Date: 05 February 2025 to 06 February 2025
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="form-info text-gray-700 font-normal">Start</p>
                  <h4 className="text-sm font-medium text-gray-900">
                    06 February 2025
                  </h4>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="form-info text-gray-700 font-normal">
                    End Date
                  </p>
                  <h4 className="text-sm font-medium text-gray-900">
                    06 February 2025
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Edit Function">
              <button
                type="button"
                title="Edit Function"
                className="btn btn-sm btn-primary p-0 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <i className="ki-filled ki-notepad-edit"></i>
              </button>
            </Tooltip>
            <Tooltip title="Remove Function">
              <button
                type="button"
                title="Remove Function"
                className="btn btn-sm btn-danger p-0 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <i className="ki-filled ki-trash"></i>
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center grow gap-4">
          <div className="card w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg">
            <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
              <div className="flex items-center gap-5">
                <div className="flex flex-col gap-1">
                  <p className="form-info text-gray-700 font-normal">
                    Function Name
                  </p>
                  <h4 className="text-sm font-medium text-gray-900">
                    Function Name Here
                  </h4>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="form-info text-gray-700 font-normal">
                    Start Date
                  </p>
                  <h4 className="text-sm font-medium text-gray-900">
                    05 February 2025
                  </h4>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="form-info text-gray-700 font-normal">
                    End Date
                  </p>
                  <h4 className="text-sm font-medium text-gray-900">
                    06 February 2025
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Edit Function">
              <button
                type="button"
                title="Edit Function"
                className="btn btn-sm btn-primary p-0 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <i className="ki-filled ki-notepad-edit"></i>
              </button>
            </Tooltip>
            <Tooltip title="Remove Function">
              <button
                type="button"
                title="Remove Function"
                className="btn btn-sm btn-danger p-0 w-8 h-8 rounded-full flex items-center justify-center"
              >
                <i className="ki-filled ki-trash"></i>
              </button>
            </Tooltip>
          </div>
        </div> */}

        {formData?.function_data ? (
          formData.function_data.map((item, index) => {
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* card */}
                  <div className="card min-w-full">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-col flex-wrap items-start gap-3 p-4 h-full bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id
                              ? item.customer_id.join(",")
                              : "Title is here"}
                          </h4>
                          <p className="text-sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-col flex-wrap w-full gap-3 mt-auto">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600">
                              Location
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              123, Ashram Road, Navrangpura, Ahmedabad - 380009
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                Start Date
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.start_date
                                  ? dayjs(item.start_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-600">
                                End Date
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.end_date
                                  ? dayjs(item.end_date).format("DD MMM YYYY")
                                  : "DD MM YYYY"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center items-center border-t border-gray-200 rounded-b-xl gap-2 px-4 py-3 mt-auto">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* Add More Functions */}
                  <div className="card border-2 border-dashed border-green-600/15 bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                    <div className="card-body p-5">
                      <div className="flex flex-col gap-5">
                        <img
                          src={toAbsoluteUrl("/images/not_found.svg")}
                          className="max-h-24 max-w-full shrink-0"
                          alt=""
                        />
                        <div className="flex flex-col gap-2 text-center px-5">
                          <h2 className="text-sm text-base leading-none font-bold text-gray-700">
                            Add More Functions
                          </h2>
                          <p className="text-2sm text-gray-500">
                            Please click below to add more functions
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <button
                            className="btn btn-sm btn-success"
                            // onClick={handleAddFunction}
                            onClick={() => setIsModalOpen(true)}
                            title="Add Function"
                          >
                            <i className="ki-filled ki-plus"></i> Add Function
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center grow gap-4">
                  <div className="card min-w-full py-7 px-5 rtl:[background-position:left_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                    <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
                      <div className="flex flex-wrap items-center gap-7">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-base font-medium text-gray-900">
                            {item.customer_id ? item.customer_id.join(",") : ""}
                          </h4>
                          <p className="text-2sm text-gray-700 overflow-hidden text-clip">
                            Delegate Tasks and get them completed without manual
                            followups
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-5 lg:gap-7">
                          <div className="flex flex-col">
                            <div className="text-xs">Start Date</div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.start_date
                                ? dayjs(item.start_date).format("DD MMM YYYY")
                                : ""}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs">End Date</div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.end_date
                                ? dayjs(item.end_date).format("DD MMM YYYY")
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip title="Edit">
                          <button
                            type="button"
                            title="Edit"
                            className="btn btn-sm btn-icon btn-light btn-clear"
                            onClick={() => handleEditFunction(item, index)}
                          >
                            <i className="ki-filled ki-notepad-edit"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <button
                            type="button"
                            title="Remove"
                            className="btn btn-sm btn-icon btn-danger btn-clear"
                            onClick={() => handleRemoveFunction(index)}
                          >
                            <i className="ki-filled ki-trash"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div> */}
              </>
            );
          })
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <div className="md:col-start-2 col-span-1 card border-2 border-dashed border-green-600/15 bg-center bg-[length:500px] bg-no-repeat user-access-bg">
                <div className="card-body p-5">
                  <div className="flex flex-col gap-5">
                    <img
                      src={toAbsoluteUrl("/images/not_found.svg")}
                      className="max-h-24 max-w-full shrink-0"
                      alt=""
                    />
                    <div className="flex flex-col gap-2 text-center px-5">
                      <h2 className="text-sm text-base leading-none font-bold text-gray-700">
                        No functions added yet.
                      </h2>
                      <p className="text-2sm text-gray-500">
                        You haven't created any functions yet, please click the
                        below button to start.
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <button
                        className="btn btn-sm btn-success"
                        // onClick={handleAddFunction}
                        onClick={() => setIsModalOpen(true)}
                        title="Add Function"
                      >
                        <i className="ki-filled ki-plus"></i> Add Function
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div className="my-4 text-center">
        <button
          className="btn btn-success"
          onClick={() => setIsModalOpen(true)}
          title="Add Function"
        >
          <i className="ki-filled ki-plus"></i> Add Function
        </button>
      </div> */}
      {isModalOpen && (
        <AddFunctionModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          eventData={eventModalData}
          setEventModalData={setEventModalData}
          functionDataStore={functionDataStore}
        />
      )}
    </>
  );
};

export default FunctionsStep;
