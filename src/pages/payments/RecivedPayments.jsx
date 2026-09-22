import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import RecivePayment from "./components/RecivePayment";
import PayablePayment from "./components/PayablePayment";
import { GetAllPaymentDetails, pdffordebitpaymentinaccount } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between Paymentspy-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const ExportPdfModal = ({ isOpen, onClose, isPayable }) => {
  const [isCompanyDetails, setIsCompanyDetails] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await pdffordebitpaymentinaccount(
        isCompanyDetails ? 1 : 0,
        isPayable ? 1 : 0,
        userId
      );

      const fileUrl = res?.data?.url;
      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } else {
        Swal.fire({
          title: "No file returned",
          text: "The report didn't return a downloadable file.",
          icon: "warning",
        });
      }

      onClose();
    } catch (err) {
      console.error("Export PDF failed:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to generate PDF. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
        <h2 className="text-lg font-semibold text-[#111827] mb-1">
          <FormattedMessage id="COMMON.EXPORT_PDF" defaultMessage="Export PDF" />
        </h2>

        <p className="text-sm text-gray-500 mb-2">
          <FormattedMessage
            id="COMMON.CHOOSE_REPORT_CONTENT"
            defaultMessage="Choose what to include in the report."
          />
        </p>

        <div className="divide-y divide-gray-100">
          <Toggle
            checked={isCompanyDetails}
            onChange={setIsCompanyDetails}
            label={
              <FormattedMessage id="COMMON.COMPANY_DETAILS" defaultMessage="Company Details" />
            }
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-light" onClick={onClose} disabled={loading}>
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>

          <button className="btn btn-primary" onClick={handleExport} disabled={loading}>
            {loading ? (
              <FormattedMessage id="COMMON.GENERATING" defaultMessage="Generating..." />
            ) : (
              <FormattedMessage id="COMMON.EXPORT" defaultMessage="Export" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const mapVendorGroups = (vendors, isPayable) =>
  (vendors || []).map((v) => ({
    vendorId: v.vendorId,
    vendorName: v.vendorName,
    totalAmount: v.totalAmount,
    totalReceived: v.totalReceived,
    totalPayable: v.totalPayable,
    totalRemaining: v.totalRemaining,
    payments: (v.vendorPayments || []).map((p) => ({
      id: p.id,
      voucherno: p.invoiceCode,
      voucherdate: p.date,
      modeofpayment: p.payMode,
      bankId: p.bankId,
      bankname: p.bankName,
      cashId: p.cashId,
      cashname: p.cashName,
      referenceId: p.referenceId,
      amount: isPayable ? p.payAmount : p.receivedAmount,
      settlementAmount: p.settlementAmount,
      eventId: p.eventId,
      eventName: p.eventName,
      remarks: p.remarks,
      isOpb: p.isOpb,
    })),
  }));

const RecivedPayments = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [receivedVendors, setReceivedVendors] = useState([]);
  const [payableVendors, setPayableVendors] = useState([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [payableLoading, setPayableLoading] = useState(false);

  const [receivedSummary, setReceivedSummary] = useState({
    totalReceived: 0,
    remainingBalanced: 0,
  });
  const [payableSummary, setPayableSummary] = useState({
    totalPayable: 0,
    remainingPayable: 0,
  });

  const fetchPayment = async (isPayable) => {
    const userId = localStorage.getItem("userId");
    const setLoading = isPayable ? setPayableLoading : setReceivedLoading;

    setLoading(true);
    try {
      const res = await GetAllPaymentDetails(userId, isPayable);
      const vendors = res?.data?.data?.data || [];
      const mapped = mapVendorGroups(vendors, isPayable);

      // No root-level summary in this response — roll it up from each vendor
      const totalAmountSum = vendors.reduce(
        (acc, v) => acc + (isPayable ? v.totalPayable : v.totalReceived) || 0,
        0,
      );
      const totalRemainingSum = vendors.reduce((acc, v) => acc + (v.totalRemaining || 0), 0);

      if (isPayable) {
        setPayableVendors(mapped);
        setPayableSummary({ totalPayable: totalAmountSum, remainingPayable: totalRemainingSum });
      } else {
        setReceivedVendors(mapped);
        setReceivedSummary({ totalReceived: totalAmountSum, remainingBalanced: totalRemainingSum });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "received" && receivedVendors.length === 0) {
      fetchPayment(false);
    } else if (activeTab === "payable" && payableVendors.length === 0) {
      fetchPayment(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <Fragment>
      <Container>
        <div className="min-h-screen">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">
                <FormattedMessage id="COMMON.PAYMENTS" defaultMessage="Payments" />
              </h1>

              <p className="text-[13px] text-[#6b7280] mt-[2px]">
                <FormattedMessage
                  id="COMMON.PAYMENTS_DESCRIPTION"
                  defaultMessage="Manage and track your incoming and outgoing funds."
                />
              </p>
            </div>

            {/* <button
              className="btn btn-danger"
              onClick={() => setIsExportModalOpen(true)}
              title="Export PDF"
            >
              <i className="ki-filled ki-file-down me-1"></i>
              <FormattedMessage id="COMMON.EXPORT_PDF" defaultMessage="Export PDF" />
            </button> */}
          </div>

          <div className="flex gap-8 border-b border-[#e5e7eb] mb-7">
            <button
              onClick={() => setActiveTab("received")}
              className={`text-lg font-medium pb-3 border-b-2 transition ${
                activeTab === "received"
                  ? "text-primary border-primary"
                  : "text-[#6b7280] border-transparent"
              }`}
            >
              <FormattedMessage id="COMMON.RECEIVED" defaultMessage="Received" />
            </button>

            <button
              onClick={() => setActiveTab("payable")}
              className={`text-lg font-medium pb-3 border-b-2 transition ${
                activeTab === "payable"
                  ? "text-primary border-primary"
                  : "text-[#6b7280] border-transparent"
              }`}
            >
              <FormattedMessage id="COMMON.PAYABLE" defaultMessage="Payable" />
            </button>
          </div>

          {activeTab === "received" && (
            <RecivePayment
              vendors={receivedVendors}
              loading={receivedLoading}
              totalReceived={receivedSummary.totalReceived}
              remainingBalanced={receivedSummary.remainingBalanced}
            />
          )}
          {activeTab === "payable" && (
            <PayablePayment
              vendors={payableVendors}
              loading={payableLoading}
              totalPayable={payableSummary.totalPayable}
              remainingPayable={payableSummary.remainingPayable}
            />
          )}
        </div>
      </Container>

      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isPayable={activeTab === "payable"}
      />
    </Fragment>
  );
};

export default RecivedPayments;