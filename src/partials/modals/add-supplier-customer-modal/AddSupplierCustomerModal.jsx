import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GetAllCustomer,
  Fetchmanager,
  AddExpensemanagement,
  fetchStatesByCountry,
  fetchCitiesByState,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { Select } from "antd";
import { AddLogs } from "../../../services/apiServices";

const getInitialForm = (type) => ({
  type: type || "Supplier",
  name: "",
  amount: "",
  countryCode: "+91",
  mobile: "",
  paymentType: "",
  remarks: "",
  gst: "",
  address: "",
  billFlat: "",
  billArea: "",
  billPincode: "",
  stateId: "",
  cityId: "",
  sameShipping: false,
  roleId: null,
  image: null,
});

export default function AddSupplierCustomerModal({
  open,
  onClose,
  type,
  eventId,
  eventNo,
}) {
  const [partyList, setPartyList] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const userEmail = (() => {
  try {
    return JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || "";
  } catch { return ""; }
})();

  const [form, setForm] = useState(getInitialForm(type));

  const userId = Number(localStorage.getItem("userId"));

  const handleFile = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };
  const [showGST, setShowGST] = useState(false);
  useEffect(() => {
    setForm((prev) => ({ ...prev, type }));
  }, [type]);

  // Always start with a blank form when the modal is opened
  useEffect(() => {
    if (open) {
      setForm(getInitialForm(type));
      setSelectedParty("");
      setShowGST(false);
      setCities([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadStates = async () => {
      try {
        const stateRes = await fetchStatesByCountry(1);
        const stateArray = stateRes?.data?.data?.["state Details"];
        setStates(Array.isArray(stateArray) ? stateArray : []);
      } catch (err) {
        console.error("Failed to load states:", err);
        setStates([]);
      }
    };
    loadStates();
  }, []);

  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setForm((prev) => ({ ...prev, stateId, cityId: "" }));

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

  useEffect(() => {
    if (!open || !userId) return;

    const resetSelection = (list) => {
      setPartyList(list);
      setSelectedParty(""); // reset selection when type changes
      setForm((prev) => ({
        ...prev,
        name: "",
        mobile: "",
        gst: "",
        address: "",
      })); // reset prefilled fields
    };

    // Customer -> same API as the Manager Name dropdown (Fetchmanager)
    if (form.type === "Customer") {
      Fetchmanager(userId)
        .then((res) => {
          const users = res?.data?.data?.userDetails || [];
          // map to the same shape the party dropdown already uses
          const list = users.map((man) => ({
            id: man.id,
            nameEnglish: `${man.firstName || ""} ${man.lastName || ""}`.trim(),
            mobileno: man.contactNo || "",
            gst: man.userBasicDetails?.gstin || "",
            addressEnglish: man.userBasicDetails?.address || "",
            contact: {
              contactType: { id: man.userBasicDetails?.role?.id || null },
            },
          }));
          resetSelection(list);
        })
        .catch((err) => {
          console.error("Failed to fetch customers", err);
          resetSelection([]);
        });
      return;
    }

    // Supplier -> existing party API
    GetAllCustomer(userId)
      .then((res) => {
        const list = res?.data?.data?.["Party Details"] || [];

        // exclude customers
        const filteredList = list.filter((cust) => {
          const typeName =
            cust.contact?.contactType?.nameEnglish?.toLowerCase();
          return typeName !== "customer";
        });

        resetSelection(filteredList);
      })
      .catch((err) => {
        console.error("Failed to fetch parties", err);
      });
  }, [open, userId, form.type]);

  const handlePartySelect = (e) => {
    const id = Number(e.target.value);
    setSelectedParty(id);

    const party = partyList.find((p) => p.id === id);
    if (!party) return;

    setForm((prev) => ({
      ...prev,
      name: party.nameEnglish || "",
      mobile: party.mobileno || "",
      gst: party.gst || "",
      address: party.addressEnglish || "",
      countryCode: "+91",

      roleId: party?.contact?.contactType?.id || null, // ✅ FIX
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!selectedParty || !form.amount) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Please select a party and enter an amount",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const formatDate = () => {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formData = new FormData(); // ✅ CHANGED FROM payload object

      // BASIC
      formData.append("amount", Number(form.amount || 0));
      formData.append("date", formatDate());
      formData.append("description", form.remarks || "");
      formData.append("remark", form.remarks || "");
      formData.append("paymentType", form.paymentType || "");
      formData.append("mobileNo", form.mobile || "");
      formData.append("name", form.name || "");
      formData.append("expenseId", -1);
      // The selected id is always sent as partyId (backend validates it).
      // For the Customer tab the list comes from the manager API, so the same
      // id is also sent as managerId.
      const isManagerSelection = form.type === "Customer";
      formData.append("partyId", Number(selectedParty));
      formData.append(
        "managerId",
        isManagerSelection ? Number(selectedParty) : 0,
      );

      // ADDRESS
      formData.append("buildingAddress", form.billFlat || "");
      formData.append("area", form.billArea || "");
      formData.append("city", form.cityId || "");
      formData.append("state", form.stateId || "");
      formData.append("pincode", form.billPincode || "");
      formData.append("countryCode", form.countryCode || "+91");

      // META
      formData.append("userId", userId);
      formData.append("roleId", form.roleId || 0);
      formData.append("eventId", Number(eventId));
      formData.append("userType", form.type.toUpperCase());
      formData.append("gstin", form.gst || "");

      // FILE  ✅ NEW
      if (form.image) {
        formData.append("file", form.image);
        formData.append("document", "");
      }

      const res = await AddExpensemanagement(formData); // ✅ PASS formData instead of payload

      // API may reply { msg, success: false } without throwing
      if (res?.data?.success === false) {
        Swal.fire({
          title: "Error!",
          text:
            res?.data?.msg ||
            res?.data?.message ||
            "Failed to add expense. Please try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return;
      }

     await Swal.fire({
  title: "Success!",
  text: `${form.type} expense added successfully`,
  icon: "success",
  timer: 2000,
  showConfirmButton: false,
});

try {
    await AddLogs({
    id: 0,
    description: `${form.type} expense added for event No: ${eventNo || eventId} — Party: ${form.name}, Amount: ${form.amount}`,
    eventType: "Expense Save",
    user: userEmail,
  });
} catch (logErr) {
  console.error("Log failed (non-blocking):", logErr);
}

setForm(getInitialForm(form.type));
setSelectedParty("");
setShowGST(false);
setCities([]);

onClose(res?.data?.data || null);
    } catch (err) {
      console.error("Failed to add supplier/customer expense", err);
      Swal.fire({
        title: "Error!",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Failed to add expense. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
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
                  <FormattedMessage
                    id="CONTACT.ADD.TITLE"
                    defaultMessage="Add New Supplier"
                  />
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
                {/* <div className="ps-3">
                  {" "}
                  <FormattedMessage id="CONTACT.TYPE" defaultMessage="Type" />
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
                  {["Supplier", "Customer"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`
        px-5 py-2 rounded-xl text-sm transition-all duration-200
        ${
          form.type === t
            ? "bg-white font-semibold text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }
      `}
                    >
                      {t}
                    </button>
                  ))}
                </div> */}

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {form.type === "Customer" ? (
                      "Select Manager"
                    ) : (
                      <>
                        <FormattedMessage
                          id="CONTACT.TYPE"
                          defaultMessage="Type"
                        />{" "}
                        {form.type}
                      </>
                    )}
                  </label>

                  <Select
                    className="w-full mt-1"
                    showSearch
                    placeholder={
                      form.type === "Customer"
                        ? "Select Manager"
                        : `Select ${form.type}`
                    }
                    value={selectedParty || undefined}
                    optionFilterProp="label"
                    onChange={(value) =>
                      handlePartySelect({ target: { value } })
                    }
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    options={partyList.map((p) => ({
                      value: p.id,
                      label: `${p.nameEnglish}${p.mobileno ? ` (${p.mobileno})` : ""}`,
                    }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    <FormattedMessage
                      id="COMMON.AMOUNT"
                      defaultMessage="Amount"
                    />
                  </label>
                  <input
                    type="tel"
                    name="amount"
                    value={form.amount}
                    onChange={handleInput}
                    placeholder="₹ 0.00"
                    className="input mt-1 w-full"
                  />
                </div>

                <div className="grid grid-cols-[200px_1fr_1fr] gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.COUNTRY_CODE"
                        defaultMessage="Country Code"
                      />
                    </label>
                    <input
                      type="text"
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleInput}
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FormattedMessage
                        id="COMMON.MOBILE_NUMBER"
                        defaultMessage="Mobile Number"
                      />
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleInput}
                      placeholder="Enter mobile number"
                      className="input mt-1 w-[300px]"
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
                        {" "}
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
                    className="text-blue-600 text-sm underline"
                    onClick={() => setShowGST(!showGST)}
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
                              className="input w-full"
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
                              className="input w-full"
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
                                    shipCity: prev.cityId,
                                    shipState: prev.stateId,
                                  }
                                : {}),
                            }));
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          <FormattedMessage
                            id="ADDRESS.SAME_AS_BILLING"
                            defaultMessage="Shipping address same as billing address?"
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t bg-white flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary py-3 px-6"
                  disabled={!selectedParty || !form.amount}
                >
                  {`Add ${form.type}`}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}