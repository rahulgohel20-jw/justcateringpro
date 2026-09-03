import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { Select } from "antd";

import {
  Fetchmanager,
  fetchStatesByCountry,
  fetchCitiesByState,
  AddExpensemanagement,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { AddLogs } from "../../../services/apiServices";

export default function AddNewManagerModal({
  open,
  onClose,
  eventId,
  eventData,
  eventNo,
}) {
  const [form, setForm] = useState({
    manager: "",
    role: "",
    mobile: "",
    date: "",
    amount: "",
    paymentType: "",
    description: "",
    remarks: "",
    stateId: "",
    cityId: "",
    image: null,
  });
  const [showGST, setShowGST] = useState(false);
  const [managers, setManagers] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [leadData, setLeadData] = useState({});
  const [partyId, setPartyId] = useState(null);
  const { Option } = Select;
  const [managerSearch, setManagerSearch] = useState("");
  const [managerDropdownOpen, setManagerDropdownOpen] = useState(false);
  const managerDropdownRef = useRef(null);

  const userId = Number(localStorage.getItem("userId"));
  const userEmail = (() => {
  try {
    return JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || "";
  } catch { return ""; }
})();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        managerDropdownRef.current &&
        !managerDropdownRef.current.contains(e.target)
      ) {
        setManagerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (open) {
      FetchManager();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const stateRes = await fetchStatesByCountry(1);
        const stateArray = stateRes?.data?.data?.["state Details"];
        if (Array.isArray(stateArray)) {
          setStates(stateArray);
        } else {
          setStates([]);
        }
      } catch (err) {
        console.error("Failed to load states:", err);
        setStates([]);
      }
    };
    loadStates();
  }, []);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setForm((prev) => ({
      ...prev,
      stateId,
      cityId: "",
    }));

    if (!stateId) {
      setCities([]);
      return;
    }

    try {
      const res = await fetchCitiesByState(Number(stateId));
      const cityArray = res?.data?.data?.["City Details"] || [];
      setCities(Array.isArray(cityArray) ? cityArray : []);
    } catch (err) {
      console.error("Failed to load cities:", err);
      setCities([]);
    }
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const FetchManager = () => {
    if (!userId) return;

    Fetchmanager(userId)
      .then((res) => {
        if (res?.data?.data?.userDetails) {
          const managerList = res.data.data.userDetails.map((man) => ({
            value: man.id,
            label: `${man.firstName || ""} ${man.lastName || ""}`.trim(),
            roleName: man.userBasicDetails?.role?.name || "",
            roleId: man.userBasicDetails?.role?.id || 0,

            // 👇 AUTO FILL DATA
            mobile: man.contactNo || "",
            gst: man.userBasicDetails?.gstin || "",
            billFlat: man.userBasicDetails?.address || "",
            stateId: man.userBasicDetails?.state?.id || "",
            cityId: man.userBasicDetails?.city?.id || "",
            billPincode: man.userBasicDetails?.pincode || "",
          }));

          setManagers(managerList);
        } else {
          setManagers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch managers:", err);
        setManagers([]);
      });
  };

  const handleManagerChange = (e) => {
    const selectedManagerId = e.target.value;

    const selectedManager = managers.find(
      (m) => String(m.value) === String(selectedManagerId),
    );

    setForm((prev) => ({
      ...prev,

      // IDs
      manager: selectedManagerId,
      role: selectedManager?.roleName || "",
      roleId: selectedManager?.roleId || 0,

      // 👇 AUTO FILLED FIELDS
      mobile: selectedManager?.mobile || "",
      gst: selectedManager?.gst || "",
      billFlat: selectedManager?.billFlat || "",
      billCity: selectedManager?.billCity || "",
      billState: selectedManager?.billState || "",
      billPincode: selectedManager?.billPincode || "",
    }));
  };

  const initialFormState = {
    manager: "",
    role: "",
    roleId: 0,
    mobile: "",
    date: "",
    amount: "",
    paymentType: "",
    description: "",
    remarks: "",
    gst: "",
    billFlat: "",
    billArea: "",
    billPincode: "",
    stateId: "",
    cityId: "",
    image: null,
    mangerId: "",
    expenseId: "",
    sameShipping: false,
  };

  const resetForm = () => {
    setForm(initialFormState);
    setShowGST(false);
    setCities([]);
  };
  const handleSubmit = async () => {
    const error = validateForm();

    if (error) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: error,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      };

      const formData = new FormData();

      // BASIC
      formData.append("amount", Number(form.amount || 0));
      formData.append("date", formatDate(form.date));
      formData.append("description", form.description || "");
      formData.append("remark", form.remarks || "");
      formData.append("paymentType", form.paymentType || "");
      formData.append("mobileNo", form.mobile || "");
      formData.append("name", form.name || "");
      formData.append("expenseId", -1);
      formData.append("partyId", 0);

      // ADDRESS
      formData.append("buildingAddress", form.billFlat || "");
      formData.append("area", form.billArea || "");
      formData.append("city", form.cityId || "");
      formData.append("state", form.stateId || "");
      formData.append("pincode", form.billPincode || "");
      formData.append("countryCode", "+91");

      // META
      formData.append("managerId", Number(form.manager || 0));
      formData.append("userId", userId);
      formData.append("roleId", form.roleId || 0);
      formData.append("eventId", Number(eventId));
      formData.append("userType", "MANAGER");
      formData.append("gstin", form.gst || "");

      // FILE
      if (form.image) {
        formData.append("file", form.image);
        formData.append("document", "");
      }

      const res = await AddExpensemanagement(formData);

     Swal.fire({
  icon: "success",
  title: "Saved Successfully",
  text: res?.data?.message || "Manager expense added successfully",
  confirmButtonColor: "#3085d6",
}).then(async () => {
  
  try {
    await AddLogs({
  id: 0,
  description: `Manager expense added for event No: ${eventData?.eventNo || eventId} — Manager: ${form.manager}, Amount: ${form.amount}`,
  eventType: "Expense Save",
  user: userEmail,
});
  } catch (logErr) {
    console.error("Log failed (non-blocking):", logErr);
  }

  resetForm();
  onClose(res?.data?.data);
});
    } catch (err) {
      console.error("Failed to add expense", err);

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const validateForm = () => {
    if (!form.date) return "Date is required";
    return null;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 pointer-events-none flex items-center justify-end p-4">
            <motion.div
              className="pointer-events-auto w-[900px] max-w-[95vw] h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 220, damping: 28 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  <h2 className="text-xl font-semibold text-gray-800">
                    <FormattedMessage
                      id="MANAGER.ADD.TITLE"
                      defaultMessage="Add New Manager"
                    />
                  </h2>
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="MANAGER.NAME"
                        defaultMessage="Manager Name"
                      />
                    </label>

                    {/* REPLACE the <Select>...</Select> block with: */}
                    <div ref={managerDropdownRef} className="relative mt-1">
                      <div
                        className={`flex items-center w-full border rounded-lg px-3 py-2 bg-white cursor-text transition-all ${
                          managerDropdownOpen
                            ? "border-blue-500 ring-2 ring-blue-100"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => {
                          setManagerDropdownOpen(true);
                          setTimeout(
                            () =>
                              document
                                .getElementById("manager-search-input")
                                ?.focus(),
                            0,
                          );
                        }}
                      >
                        <input
                          id="manager-search-input"
                          type="text"
                          className="flex-1 outline-none text-sm bg-transparent text-gray-800 placeholder-gray-400"
                          placeholder="Search manager..."
                          value={managerSearch}
                          onChange={(e) => {
                            setManagerSearch(e.target.value);
                            setManagerDropdownOpen(true);
                          }}
                          onFocus={() => setManagerDropdownOpen(true)}
                        />

                        {/* Clear button */}
                        {(managerSearch || form.manager) && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setManagerSearch("");
                              setManagerDropdownOpen(false);
                              setForm((prev) => ({
                                ...prev,
                                manager: "",
                                role: "",
                                mobile: "",
                              }));
                            }}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}

                        {/* Chevron */}
                        <svg
                          className={`w-4 h-4 text-gray-400 ml-1 flex-shrink-0 transition-transform ${managerDropdownOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {/* Dropdown list */}
                      {managerDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <ul className="max-h-52 overflow-y-auto py-1">
                            {managers.filter((m) =>
                              m.label
                                .toLowerCase()
                                .includes(managerSearch.toLowerCase()),
                            ).length === 0 ? (
                              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                                No managers found
                              </li>
                            ) : (
                              managers
                                .filter((m) =>
                                  m.label
                                    .toLowerCase()
                                    .includes(managerSearch.toLowerCase()),
                                )
                                .map((mgr) => {
                                  const isSelected =
                                    String(form.manager) === String(mgr.value);
                                  return (
                                    <li
                                      key={mgr.value}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setManagerSearch(mgr.label);
                                        setManagerDropdownOpen(false);
                                        handleManagerChange({
                                          target: {
                                            name: "manager",
                                            value: mgr.value,
                                          },
                                        });
                                      }}
                                      className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                                        isSelected
                                          ? "bg-blue-50 text-blue-700 font-medium"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      <div>
                                        <span>{mgr.label}</span>
                                        {mgr.roleName && (
                                          <span className="ml-2 text-xs text-gray-400">
                                            ({mgr.roleName})
                                          </span>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <svg
                                          className="w-4 h-4 text-blue-500"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </li>
                                  );
                                })
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.ROLE"
                        defaultMessage="Role"
                      />
                    </label>

                    <input
                      name="role"
                      type="text"
                      value={form.role}
                      placeholder="Enter role"
                      readOnly
                      className="input mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.MOBILE_NUMBER"
                        defaultMessage="Mobile Number"
                      />
                    </label>

                    <input
                      name="mobile"
                      type="text"
                      value={form.mobile}
                      onChange={handleInput}
                      placeholder="Enter mobile number"
                      className="input mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.DATE"
                        defaultMessage="Date"
                      />
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleInput}
                      className="input mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.AMOUNT"
                        defaultMessage="Amount"
                      />
                    </label>

                    <input
                      name="amount"
                      type="tel"
                      value={form.amount}
                      onChange={handleInput}
                      placeholder="₹ 0.00"
                      className="input mt-1"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.PAYMENT_TYPE"
                        defaultMessage="Payment Type"
                      />
                    </label>

                    <select
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleInput}
                      className="input mt-1"
                    >
                      <option value="">
                        <FormattedMessage
                          id="COMMON.SELECT_PAYMENT_TYPE"
                          defaultMessage="Select payment type"
                        />
                      </option>
                      <option value="cash">
                        <FormattedMessage
                          id="PAYMENT.CASH"
                          defaultMessage="Cash"
                        />
                      </option>
                      <option value="online">
                        <FormattedMessage
                          id="PAYMENT.ONLINE"
                          defaultMessage="Online"
                        />
                      </option>
                      <option value="upi">
                        <FormattedMessage
                          id="PAYMENT.UPI"
                          defaultMessage="UPI"
                        />
                      </option>
                    </select>
                    <svg
                      className="w-5 h-5 mt-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <FormattedMessage
                      id="COMMON.DESCRIPTION"
                      defaultMessage="Description"
                    />
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Add a description..."
                    className="mt-1 w-full h-24 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <FormattedMessage
                      id="COMMON.REMARKS"
                      defaultMessage="Remarks"
                    />
                  </label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleInput}
                    placeholder="Add any notes here..."
                    className="mt-1 w-full h-24 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowGST((prev) => !prev)}
                    className="text-blue-600 text-sm underline"
                  >
                    {showGST ? (
                      <FormattedMessage
                        id="GST.HIDE"
                        defaultMessage="Hide GST & Address"
                      />
                    ) : (
                      <FormattedMessage
                        id="GST.ADD_OPTIONAL"
                        defaultMessage="Add GST & Address (Optional)"
                      />
                    )}
                  </button>

                  {showGST && (
                    <div className="mt-4 space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          <FormattedMessage
                            id="GST.GSTIN"
                            defaultMessage="GSTIN"
                          />
                        </label>
                        <input
                          type="text"
                          name="gst"
                          value={form.gst}
                          onChange={handleInput}
                          placeholder="GSTIN"
                          className="input mt-1 w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          <FormattedMessage
                            id="ADDRESS.BILLING"
                            defaultMessage="Billing Address"
                          />
                        </label>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <input
                            type="text"
                            name="billFlat"
                            value={form.billFlat || ""}
                            onChange={handleInput}
                            placeholder="Flat / Building Number"
                            className="input w-full"
                          />

                          <input
                            type="text"
                            name="billArea"
                            value={form.billArea || ""}
                            onChange={handleInput}
                            placeholder="Area / Locality"
                            className="input w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <input
                            type="text"
                            name="billPincode"
                            value={form.billPincode || ""}
                            onChange={handleInput}
                            placeholder="Pincode"
                            className="input w-full"
                          />
                          <div>
                            <select
                              value={form.stateId}
                              onChange={handleStateChange}
                              className="input  w-full"
                            >
                              <option value="">Select State</option>
                              {states.map((state) => (
                                <option key={state.id} value={state.id}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <select
                              value={form.cityId}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  cityId: e.target.value,
                                }))
                              }
                              disabled={!form.stateId}
                              className="input  w-full"
                            >
                              <option value="">Select City</option>
                              {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.sameShipping || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev) => ({
                              ...prev,
                              sameShipping: checked,
                              ...(checked
                                ? {
                                    shipFlat: prev.billFlat,
                                    shipArea: prev.billArea,
                                    shipPincode: prev.billPincode,
                                    shipCity: prev.billCity,
                                    shipState: prev.billState,
                                  }
                                : {}),
                            }));
                          }}
                        />
                        <label className="text-sm font-medium text-gray-600">
                          <FormattedMessage
                            id="ADDRESS.BILLING"
                            defaultMessage="Billing Address"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <FormattedMessage
                      id="COMMON.IMAGE"
                      defaultMessage="Image"
                    />
                  </label>

                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFile}
                      id="upload"
                    />
                    <label
                      htmlFor="upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16l5-5 5 5M12 11v10"
                        />
                      </svg>

                      <p className="text-blue-600 font-medium mt-2">
                        <FormattedMessage
                          id="UPLOAD.DRAG_DROP"
                          defaultMessage="Upload a file or drag and drop"
                        />
                      </p>
                      <p className="text-xs text-gray-500">
                        <FormattedMessage
                          id="UPLOAD.FORMAT_INFO"
                          defaultMessage="PNG, JPG, GIF up to 10MB"
                        />
                      </p>

                      {form.image && (
                        <p className="mt-2 text-sm text-green-600">
                          {form.image.name}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-white flex justify-end">
                <button
                  className="btn btn-primary w-half py-3"
                  onClick={handleSubmit}
                >
                  <FormattedMessage
                    id="MANAGER.ADD.BUTTON"
                    defaultMessage="Add Manager"
                  />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
