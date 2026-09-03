import { useEffect, useState } from "react";
import { toAbsoluteUrl } from "@/utils";
import CreatePayment from "./components/CreatePayment";
import { Fetchacoountledger, FetchAccountparty, AccountLedgerExcel, AccountLedgerPdf } from "@/services/apiServices";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";
import { FormattedMessage } from "react-intl";
const AccountLedger = () => {
  const [accountName, setAccountName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isCreatePayment, setIsCreatePayment] = useState(false);
const [vendorCat, setVendorCat] = useState("");
  const [partyList, setPartyList] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState({
    totalCredit: 0,
    totalDebit: 0,
    totalBalance: 0,
  });
  const [loadingParties, setLoadingParties] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [errors, setErrors] = useState({ party: "", fromDate: "", toDate: "" });

  const [loadingPdf,   setLoadingPdf]   = useState(false);
const [loadingExcel, setLoadingExcel] = useState(false);
const userId = localStorage.getItem("userId")

const [ledgerType, setLedgerType] = useState("Both");


const LEDGER_TYPE_OPTIONS = [
  { value: "both", label: "Both" },
  { value: "invoice", label: "Invoice" },
  { value: "quotation", label: "Quotation" },
];

const handleExportPdf = async () => {
  try {
    setLoadingPdf(true);
    const res = await AccountLedgerPdf(
      formatDate(fromDate),
      formatDate(toDate),
      userId,
      selectedPartyId,
      vendorCat,
      ledgerType,
    );
    const fileUrl = res?.data?.data || res?.data?.fileUrl;
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res?.data?.msg || "Failed to generate PDF." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while generating PDF." });
  } finally {
    setLoadingPdf(false);
  }
};

const handleExportExcel = async () => {
  try {
    setLoadingExcel(true);
    const res = await AccountLedgerExcel(
      formatDate(fromDate),
      formatDate(toDate),
      userId,
      selectedPartyId,
      vendorCat,
      ledgerType,
    );
    const fileUrl = res?.data?.data || res?.data?.fileUrl;
    if (fileUrl) {
      const a    = document.createElement("a");
      a.href     = fileUrl;
      a.download = `ledger_${accountName}_${fromDate}_${toDate}.xlsx`;
      a.click();
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res?.data?.msg || "Failed to generate Excel." });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Error", text: "Something went wrong while generating Excel." });
  } finally {
    setLoadingExcel(false);
  }
};

  const fetchParty = async () => {
    try {
      setLoadingParties(true);
      const userId = localStorage.getItem("userId");
      const res = await FetchAccountparty(userId);
      const payments = res.data.data || [];
      setPartyList(payments);
    } catch (err) {
      console.error("Failed to fetch parties:", err);
    } finally {
      setLoadingParties(false);
    }
  };

  const formatDate = (d) => d.split("-").reverse().join("/"); 

 const fetchAccountdata = async (partyId) => {
  if (!partyId) return;
  try {
    setLoadingLedger(true);
    const userId = localStorage.getItem("userId");
    const res = await Fetchacoountledger(
      formatDate(toDate),
      partyId,
      formatDate(fromDate),
      userId,
      vendorCat,
      ledgerType,
    );
    const { ledgerList, summary } = res.data.data;
    setLedgerData(ledgerList || []);
    setSummary(summary || { totalCredit: 0, totalDebit: 0, totalBalance: 0 });
  } catch (err) {
    console.error("Failed to fetch ledger data:", err);
  } finally {
    setLoadingLedger(false);
  }
};

  useEffect(() => {
    fetchParty();
  }, []);

  useEffect(() => {
    if (!selectedPartyId) {
      setLedgerData([]);
      setSummary({ totalCredit: 0, totalDebit: 0, totalBalance: 0 });
    }
  }, [selectedPartyId]);

  const handleApplyFilter = () => {
    const newErrors = { party: "", fromDate: "", toDate: "" };
    let hasError = false;

    if (!selectedPartyId) {
      newErrors.party = "Please select a party.";
      hasError = true;
    }
    if (!fromDate) {
      newErrors.fromDate = "Please select a from date.";
      hasError = true;
    }
    if (!toDate) {
      newErrors.toDate = "Please select a to date.";
      hasError = true;
    }

    setErrors(newErrors);
    if (!hasError) fetchAccountdata(selectedPartyId);
  };

  

const handlePartyChange = (value, option) => {
  setSelectedPartyId(value);
  setAccountName(option?.label || "");

  const selected = partyList.find((p) => String(p.partyId) === String(value));
  
  setVendorCat(selected?.type || "");

  if (selected?.opbDate) {
    const [day, month, year] = selected.opbDate.split("/");
    setFromDate(`${year}-${month}-${day}`);
  }

  const today = new Date().toISOString().split("T")[0];
  setToDate(today);

  if (value) setErrors((prev) => ({ ...prev, party: "" }));
};

  const totalCredit = summary.totalCredit || 0;
  const totalDebit = summary.totalDebit || 0;
  const totalBalance = summary.totalBalance || 0;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Title and Actions */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
  <FormattedMessage
    id="COMMON.GENERAL_ACCOUNT_LEDGER"
    defaultMessage="General Account Ledger"
  />
</h1>

<p className="text-sm text-gray-500 mt-1">
  <FormattedMessage
    id="COMMON.GENERAL_ACCOUNT_LEDGER_DESCRIPTION"
    defaultMessage="View and manage detailed transaction logs for accounts."
  />
</p>
          </div>
          {ledgerData.length > 0 && (
  <div className="flex flex-wrap items-center gap-3">
    <button
      onClick={handleExportPdf}
      disabled={loadingPdf}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
    >
      {loadingPdf ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : (
        <i className="ki-filled ki-file-text text-base" />
      )}
      Export PDF
    </button>

    <button
      onClick={handleExportExcel}
      disabled={loadingExcel}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
    >
      {loadingExcel ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : (
        <i className="ki-filled ki-file-download text-base" />
      )}
      Export Excel
    </button>
  </div>
)}
        </div>

        {/* Filter Section */}
        <div className="px-6 py-6 border-b border-gray-200">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* ── Party Dropdown ── */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
  <FormattedMessage
    id="COMMON.ACCOUNT_NAME"
    defaultMessage="Account Name"
  />
</label>
              <Select
                showSearch
placeholder={
  loadingParties ? (
    <FormattedMessage
      id="COMMON.LOADING"
      defaultMessage="Loading..."
    />
  ) : (
    <FormattedMessage
      id="COMMON.SELECT_PARTY"
      defaultMessage="Select Party"
    />
  )
}                loading={loadingParties}
                disabled={loadingParties}
                value={selectedPartyId || undefined}
                onChange={handlePartyChange}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={partyList.map((party) => ({
                  value: party.partyId,
                  label: party.partyName,
                }))}
                className="w-full"
                style={{ width: "100%" }}
              />
              {errors.party && (
                <p className="mt-1 text-xs text-red-500">{errors.party}</p>
              )}
            </div>

            <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
  <FormattedMessage
    id="COMMON.FROM_DATE"
    defaultMessage="From Date"
  />
</label>
              <div className="relative">
                <DatePicker
                  format="DD/MM/YYYY"
                  value={fromDate ? dayjs(fromDate) : null}
                  onChange={(date) => {
                    setFromDate(date ? date.format("YYYY-MM-DD") : "");
                    if (date) setErrors((prev) => ({ ...prev, fromDate: "" }));
                  }}
                  className={`w-full ${errors.fromDate ? "border-red-400" : ""}`}
                  style={{ width: "100%" }}
                />
              </div>
              {errors.fromDate && (
                <p className="mt-1 text-xs text-red-500">{errors.fromDate}</p>
              )}
            </div>

            <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
  <FormattedMessage
    id="COMMON.TO_DATE"
    defaultMessage="To Date"
  />
</label>
              <div className="relative">
                <DatePicker
                  format="DD/MM/YYYY"
                  value={toDate ? dayjs(toDate) : null}
                  onChange={(date) => {
                    setToDate(date ? date.format("YYYY-MM-DD") : "");
                    if (date) setErrors((prev) => ({ ...prev, toDate: "" }));
                  }}
                  className={`w-full ${errors.toDate ? "border-red-400" : ""}`}
                  style={{ width: "100%" }}
                />
              </div>
              {errors.toDate && (
                <p className="mt-1 text-xs text-red-500">{errors.toDate}</p>
              )}
            </div>

              <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
    </label>
    <Select
      value={ledgerType}
      onChange={(value) => setLedgerType(value)}
      options={LEDGER_TYPE_OPTIONS}
      className="w-full"
      style={{ width: "100%" }}
    />
  </div>


            <div className="flex gap-2">
              <button
                onClick={handleApplyFilter}
                disabled={loadingLedger}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingLedger ? (
  <FormattedMessage
    id="COMMON.LOADING"
    defaultMessage="Loading..."
  />
) : (
  <FormattedMessage
    id="COMMON.APPLY_FILTER"
    defaultMessage="Apply Filter"
  />
)}
              </button>
              <button
                onClick={() => {
                  setSelectedPartyId("");
                  setAccountName("");
                  setSelectedPartyId("");
                  setAccountName("");
                  setVendorCat(""); 
                  setLedgerType("Both");   
                  setFromDate("");
                  setToDate("");
                  setLedgerData([]);
                  setSummary({
                    totalCredit: 0,
                    totalDebit: 0,
                    totalBalance: 0,
                  });
                  setErrors({ party: "", fromDate: "", toDate: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FormattedMessage
  id="COMMON.RESET"
  defaultMessage="Reset"
/>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                <p className="text-xs text-gray-600 mb-1">
  <FormattedMessage
    id="COMMON.DR_DEBIT"
    defaultMessage="DR (Debit)"
  />
</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{" "}
                    {totalCredit.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /-
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                </div>
                <div>
                 <p className="text-xs text-gray-600 mb-1">
  <FormattedMessage
    id="COMMON.TOTAL_BALANCE"
    defaultMessage="Total Balance"
  />
</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{" "}
                    {totalDebit.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /-
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
     <p className="text-xs text-gray-600 mb-1">
  <FormattedMessage
    id="COMMON.TOTAL_BALANCE"
    defaultMessage="Total Balance"
  />
</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{" "}
                    {totalBalance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /-
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
  <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[60px]">
 <FormattedMessage
  id="COMMON.SR_NO"
  defaultMessage="SR No."
/>
</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[140px]">
 <FormattedMessage
  id="COMMON.INVOICE_NO"
  defaultMessage="Invoice NO"
/>
</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[140px]">
<FormattedMessage
  id="COMMON.ACCOUNT_NAME"
  defaultMessage="Account Name"
/>

</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[110px]">
  <FormattedMessage
  id="COMMON.DATE"
  defaultMessage="Date"
/>
</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[80px]">
  <FormattedMessage
  id="COMMON.TYPE"
  defaultMessage="Type"
/>

</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[130px]">
  <FormattedMessage
  id="COMMON.SETTLEMENT_AMOUNT"
  defaultMessage="Settlement Amount"
/>
</th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[200px]">
<FormattedMessage
  id="COMMON.REMARKS"
  defaultMessage="Remarks"
/></th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[120px]">
<FormattedMessage
  id="COMMON.CR_CREDIT"
  defaultMessage="Cr (Credit)"
/></th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[110px]">
<FormattedMessage
  id="COMMON.DR_DEBIT"
  defaultMessage="DR (Debit)"
/></th>
<th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider min-w-[120px]">
<FormattedMessage
  id="COMMON.TOTAL_BALANCE"
  defaultMessage="Total Balance"
/></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingLedger ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    Loading ledger data...
                  </td>
                </tr>
              ) : ledgerData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-10 text-center text-sm text-gray-400"
                  >
                    {selectedPartyId
                      ? "No records found."
                      : "Please select a party to view ledger."}
                  </td>
                </tr>
              ) : (
                ledgerData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-center text-sm text-gray-900">{index + 1}.</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">{row.invoiceNo}</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">{row.accountName}</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">{row.date ?? "-"}</td>
<td className="px-4 py-4 text-center text-sm">
  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
    row.type === "CP" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"
  }`}>
    {row.type}
  </span>
</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">
  {(row.settlementAmnt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</td>

{/* Remarks with tooltip */}
<td className="px-4 py-4 text-center text-sm text-gray-700 relative group">
  <span className="block truncate max-w-[180px] mx-auto">
    {row.remarks || row.remark || "-"}
  </span>
  {(row.remarks || row.remark) && (
    <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-normal text-left pointer-events-none">
      {row.remarks || row.remark}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  )}
</td>

<td className="px-4 py-4 text-center text-sm text-gray-900">
  {(row.creditCrAmnt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">
  {(row.debitDrAmnt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</td>
<td className="px-4 py-4 text-center text-sm text-gray-900">
  {(row.totalAmnt || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
         <FormattedMessage
  id="COMMON.AMOUNT_TO_CREDIT"
  defaultMessage="Amount to Credit:"
/>
            </div>
            <div className="flex flex-wrap gap-[26px] items-center">
              <div className="text-sm">
                <span className="text-primary font-semibold">
                  {totalCredit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-primary font-semibold">
                  {totalDebit.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="px-4 py-2 bg-primary text-white font-semibold rounded-md">
                {totalBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreatePayment
        isOpen={isCreatePayment}
        onClose={() => setIsCreatePayment(false)}
      />
    </div>
  );
};

export default AccountLedger;
