import { useState, useEffect, useRef } from "react";
import { AddExpenseItem, GetAllCustomer } from "@/services/apiServices";
import Swal from "sweetalert2";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { AddLogs } from "../../../services/apiServices";

export default function AddExpenseModal({
  open,
  onClose,
  managerName,
  expenseId,
  eventId,
  userId,
  eventNo,
  userType = "MANAGER",
}) {
  const [partyList, setPartyList] = useState([]);
  const [allParties, setAllParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(undefined);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const userEmail = (() => {
  try {
    return JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || "";
  } catch { return ""; }
})();

  const [form, setForm] = useState({
    type: "Supplier",
    itemName: "",
    amount: "",
    date: "",
    paymentType: "cash",
    remarks: "",
  });

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      type: "Supplier",
      itemName: "",
      amount: "",
      date: "",
      paymentType: "cash",
      remarks: "",
    });
    setSelectedParty(undefined);
    setSearchQuery("");
    setDropdownOpen(false);
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        // If nothing selected, clear search
        if (!selectedParty) setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedParty]);

  /* Reset form every time modal opens */
  useEffect(() => {
    if (open) resetForm();
  }, [open]);

  /* Fetch Party List */
  useEffect(() => {
    if (!open) return;
    const fetchSupplier = async () => {
      try {
        const res = await GetAllCustomer(userId);
        const list = res?.data?.data?.["Party Details"] || [];
        setAllParties(list);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSupplier();
  }, [open, userId]);

  /* Filter Supplier / Customer */
  useEffect(() => {
    const filtered = allParties.filter((cust) => {
      const typeName = cust.contact?.contactType?.nameEnglish?.toLowerCase();
      if (form.type === "Supplier") return typeName !== "customer";
      if (form.type === "Customer") return typeName === "customer";
      return true;
    });
    setPartyList(filtered);
    setSelectedParty(undefined);
    setSearchQuery("");
  }, [form.type, allParties]);

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    if (!expenseId) {
      Swal.fire({
        icon: "warning",
        title: "Missing Expense ID",
        text: "Please select a valid expense row.",
      });
      return;
    }

    const payload = {
      amount: Number(form.amount),
      eventId: Number(eventId),
      expenseId: Number(expenseId),
      expenseItemId: -1,
      itemName: form.itemName,
      document: form.document || "",
      itemPurchaseDate: formatDateToDDMMYYYY(form.date),
      paymentType: form.paymentType,
      remarks: form.remarks,
      userId: Number(userId),
      userType: userType,
      supplierId: selectedParty,
    };

    try {
      const res = await AddExpenseItem(payload);
      const msg = res?.data?.msg || "Expense item added successfully.";
      const isSuccess = res?.data?.success !== false;

      if (isSuccess) {
  try {
   await AddLogs({
    id: 0,
    description: `Expense item added: ${form.itemName} — Amount: ${form.amount} for event No: ${eventNo || eventId}`,
    eventType: "Expense Save",
    user: userEmail,
  });
  } catch (logErr) {
    console.error("Log failed (non-blocking):", logErr);
  }

  Swal.fire({
    icon: "success",
    title: "Expense Added",
    text: msg,
    timer: 1500,
    showConfirmButton: false,
  });
  resetForm();
  onClose(true);
}
      
      else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: msg,
        });
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.msg ||
        error?.message ||
        "Failed to add expense item. Please try again.";

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: errMsg,
      });

      console.error("Failed to add expense item", error);
    }
  };

  // Filtered options based on search
  const filteredOptions = partyList.filter((p) => {
    const label = `${p.nameEnglish}${p.mobileno ? ` (${p.mobileno})` : ""}`;
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedLabel = (() => {
    const found = partyList.find((p) => p.id === selectedParty);
    if (!found) return "";
    return `${found.nameEnglish}${found.mobileno ? ` (${found.mobileno})` : ""}`;
  })();

  const handleSelect = (id) => {
    setSelectedParty(id);
    const found = partyList.find((p) => p.id === id);
    if (found)
      setSearchQuery(
        `${found.nameEnglish}${found.mobileno ? ` (${found.mobileno})` : ""}`,
      );
    setDropdownOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedParty(undefined);
    setSearchQuery("");
    setDropdownOpen(false);
  };

  return (
    <CustomModal open={open} onClose={onClose} title="Add Expense for Manager">
      <div className="space-y-4">
        {/* Manager Badge */}
        <div className="bg-gray-100 rounded-xl px-4 py-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-semibold text-sm">
            {managerName
              ? managerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "NA"}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {managerName || "Select Manager"}
          </span>
        </div>

        {/* Custom Party Dropdown */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            {form.type}
          </label>

          <div ref={dropdownRef} className="relative">
            {/* Input trigger */}
            <div
              className={`flex items-center w-full border rounded-lg px-3 py-2 bg-white cursor-text transition-all ${
                dropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onClick={() => {
                setDropdownOpen(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <svg
                className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>

              <input
                ref={inputRef}
                type="text"
                className="flex-1 outline-none text-sm bg-transparent text-gray-800 placeholder-gray-400"
                placeholder={`Search ${form.type}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                  if (selectedParty) setSelectedParty(undefined);
                }}
                onFocus={() => setDropdownOpen(true)}
              />

              {/* Clear button */}
              {(searchQuery || selectedParty) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
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
                className={`w-4 h-4 text-gray-400 ml-1 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
            {dropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <ul className="max-h-52 overflow-y-auto py-1">
                  {filteredOptions.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-gray-400 text-center">
                      No results found
                    </li>
                  ) : (
                    filteredOptions.map((p) => {
                      const label = `${p.nameEnglish}${p.mobileno ? ` (${p.mobileno})` : ""}`;
                      const isSelected = selectedParty === p.id;
                      return (
                        <li
                          key={p.id}
                          onMouseDown={(e) => {
                            e.preventDefault(); // prevent blur before click
                            handleSelect(p.id);
                          }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{label}</span>
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-blue-500 flex-shrink-0"
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

        {/* Item Name */}
        <input
          type="text"
          name="itemName"
          value={form.itemName}
          onChange={handleInput}
          placeholder="Enter item name"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />

        {/* Amount */}
        <input
          type="tel"
          name="amount"
          value={form.amount}
          onChange={handleInput}
          placeholder="₹ Amount"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleInput}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />

        {/* Payment Type Row 1 */}
        <div className="grid grid-cols-3 gap-2">
          {["cash", "online", "card"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm({ ...form, paymentType: type })}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                form.paymentType === type
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Payment Type Row 2 */}
        <div className="grid grid-cols-2 gap-2">
          {["Net Banking", "upi"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setForm({ ...form, paymentType: type.toLowerCase() })
              }
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                form.paymentType === type.toLowerCase()
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Remarks */}
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={handleInput}
          placeholder="Remarks"
          className="w-full h-24 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
        />

        {/* Buttons */}
        <div className="pt-2 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600"
          >
            Save Expense
          </button>
        </div>
      </div>
    </CustomModal>
  );
}
