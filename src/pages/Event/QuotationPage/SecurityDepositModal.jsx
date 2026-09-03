import { DatePicker, Popconfirm } from "antd";

/**
 * SecurityDepositModal
 *
 * All security-deposit state/handlers stay in the parent (QuotationPage) —
 * this component is purely presentational + fires the callbacks you pass in.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - securityDeposits: array
 *  - bankList: array
 *  - cashAccountList: array
 *  - savingDepositIdx: number | null
 *  - permissionQuotation: { add: boolean, ... }
 *  - onAdd: () => void
 *  - onChange: (idx, field, value) => void
 *  - onSave: (idx) => void
 *  - onRemove: (idx) => void
 *  - formatAccountLabel: (name, accountNumber) => string
 */
const SecurityDepositModal = ({
  open,
  onClose,
  securityDeposits,
  bankList,
  cashAccountList,
  savingDepositIdx,
  permissionQuotation,
  onAdd,
  onChange,
  onSave,
  onRemove,
  formatAccountLabel,
}) => {
  if (!open) return null;

  // Keep each deposit's ORIGINAL array index (so onChange/onSave/onRemove
  // still point at the right item in the parent's array), but reverse the
  // order we render them in, so the most recently added deposit (pushed to
  // the end of the array by onAdd) shows up first in the list.
  const displayDeposits = securityDeposits
    .map((dep, i) => ({ dep, i }))
    .reverse();

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl custom-scrollbar flex flex-col"
        style={{
          transform: "translate(-50%,-50%)",
          width: "min(700px,95vw)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <i className="ki-filled ki-shield-tick text-primary"></i>
            Security Deposit
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 overflow-y-auto flex-1" style={{ maxHeight: "65vh" }}>
          <div className="flex flex-col border border-gray-200 rounded-xl bg-gray-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pb-2 gap-3">
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto sm:ml-auto"
                  onClick={onAdd}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Security Deposit
                </button>
           
            </div>

            {securityDeposits.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="6" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="6" y1="15" x2="10" y2="15" />
                </svg>
                <p className="text-sm">
                  No security deposits added yet. Click "Add Security Deposit" to record one.
                </p>
              </div>
            ) : (
              displayDeposits.map(({ dep, i }, displayIdx) => (
                <div
                  key={dep.id > 0 ? `dep-${dep.id}` : `dep-new-${i}`}
                  className={`flex gap-5 py-3 ${displayIdx > 0 ? "border-t border-gray-200 mt-3 pt-5" : ""}`}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary mt-1">
                    <i className="ki-filled ki-shield-tick text-white text-xs"></i>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-base font-normal text-gray-700">
                        Security Deposit {securityDeposits.length > 1 ? `#${i + 1}` : ""}
                      </div>
                      <div className="flex items-center input text-base text-gray-900 w-full sm:w-[140px]">
                        <span className="text-base font-semibold text-gray-900">&#8377;</span>
                        <input
                          className="h-full text-gray-900 w-full"
                          value={dep.amount}
                          type="text"
                          onChange={(e) => onChange(i, "amount", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                      <div className="flex flex-col gap-1 w-full sm:w-[160px]">
                        <label className="text-xs font-medium text-gray-700">Entry Type</label>
                        <select
                          className="input w-full text-sm"
                          value={dep.entryType || "RECEIPT"}
                          onChange={(e) => onChange(i, "entryType", e.target.value)}
                        >
                          <option value="RECEIPT">Receipt</option>
                          <option value="PAYMENT">Payment</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 w-full sm:w-[160px]">
                        <label className="text-xs font-medium text-gray-700">Payment Mode</label>
                        <select
                          className="input w-full text-sm"
                          value={dep.paymentMode || ""}
                          onChange={(e) => onChange(i, "paymentMode", e.target.value)}
                        >
                          <option value="">Select Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank</option>
                        </select>
                      </div>

                      {dep.paymentMode === "Bank Transfer" && (
                        <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                          <label className="text-xs font-medium text-gray-700">Select Bank</label>
                          <select
                            className="input w-full text-sm"
                            value={dep.bankAccountId || ""}
                            onChange={(e) => onChange(i, "bankAccountId", e.target.value)}
                          >
                            <option value="">Select Bank</option>
                            {bankList.map((bank) => (
                              <option key={bank.id} value={bank.id}>
                                {formatAccountLabel(bank.bankName, bank.accountNo)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {dep.paymentMode === "Cash" && (
                        <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                          <label className="text-xs font-medium text-gray-700">Select Cash Account</label>
                          <select
                            className="input w-full text-sm"
                            value={dep.cashAccountId || ""}
                            onChange={(e) => onChange(i, "cashAccountId", e.target.value)}
                          >
                            <option value="">Select Cash Account</option>
                            {cashAccountList.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name || acc.accountName || `Account ${acc.id}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="bg-white py-3 px-5 rounded-lg border border-gray-200">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <i className="ki-filled ki-calendar text-gray-500"></i>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-medium text-gray-700">Payment date & time</label>
                            <DatePicker
                              className="input w-full"
                              showTime={{ use12Hours: true, format: "hh:mm A" }}
                              format="DD/MM/YYYY hh:mm A"
                              value={dep.date}
                              onChange={(date) => onChange(i, "date", date)}
                              placeholder="Payment date & time"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <i className="ki-filled ki-notepad text-gray-500"></i>
                          <input
                            className="flex-1 mt-2 input text-xs font-normal text-gray-700 bg-transparent w-full"
                            value={dep.description}
                            onChange={(e) => onChange(i, "description", e.target.value)}
                            placeholder="Description"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => onSave(i)}
                        disabled={savingDepositIdx === i}
                      >
                        <i className="ki-filled ki-save-2"></i>
                        {savingDepositIdx === i ? "Saving..." : dep.id > 0 ? "Update" : "Save"}
                      </button>
                      <Popconfirm
                        title="Remove this security deposit?"
                        onConfirm={() => onRemove(i)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button className="btn btn-sm btn-danger" title="Remove">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          </svg>{" "}
                          Remove
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-900 hover:text-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default SecurityDepositModal;