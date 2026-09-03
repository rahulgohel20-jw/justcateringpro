import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage } from "react-intl";
import { paymentColumns } from "./paymentColumns";
import {
  DeleteRecordPayment,
  GETgetPaymentHistoryByInvoiceId,
  DeleteRecordpaymentbyid,
} from "../../services/apiServices";
import Swal from "sweetalert2";

export default function PaymentReceived({
  salesInvoiceData,
  onEditPayment,
  onDueAmountLoad,
  onRefresh,
  refreshKey,
  isSuperAdmin = false,
  invoiceId = null,
}) {
  const [payments, setPayments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const userId = JSON.parse(localStorage.getItem("userId"));
  const [due_amount, setDueAmount] = useState(0);

  useEffect(() => {
    if (!isSuperAdmin || !invoiceId) return;

    GETgetPaymentHistoryByInvoiceId(invoiceId)
      .then((res) => {
        const responseData = res?.data?.data || {};
        const data = responseData.payments || [];
        const due = responseData.totalUnPaidAmount ?? 0;

        setDueAmount(due);
        if (onDueAmountLoad) onDueAmountLoad(due);

        const mapped = data.map((payment, index) => ({
          sr_no: index + 1,
          id: payment.invoicePaymentHistoryId,
          invoiceNo: payment.invoiceCode || "-",
          paymentDate: payment.payment_date || "-",
          totalAmount: payment.amount || 0,
          due_amount: due,
          dueAmount: payment.dueAmount || 0,
          invoiceAmount: payment.invoiceAmount || 0,
          paymentMode: payment.paymentMode || "-",
          reference: payment.transactionId || payment.chequeNo || "",
          status: payment.status || "Pending",
          bankId: payment.bankDetails?.id || null,
          _originalData: payment,
        }));

        setPayments(mapped);
      })
      .catch((err) => console.error("Error fetching payment history:", err));
  }, [isSuperAdmin, invoiceId, refreshKey]);
  useEffect(() => {
    if (isSuperAdmin) return;
    if (!salesInvoiceData) {
      setPayments([]);
      setDueAmount(0);
      return;
    }

    const paymentList = salesInvoiceData?.data || [];
    const due = salesInvoiceData?.due_amount || 0;

    setDueAmount(due);
    if (onDueAmountLoad) onDueAmountLoad(due);

    const mapped = paymentList.map((payment, index) => ({
      sr_no: index + 1,
      id: payment.id,
      invoiceNo: payment.invoiceNo || "-",
      paymentDate: payment.paymentDate
        ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
        : "-",
      totalAmount: payment.totalAmount || 0,
      due_amount: due || 0,
      dueAmount: payment.dueAmount || 0,
      invoiceAmount: payment.invoiceAmount || 0,
      paymentMode: payment.paymentMode || "-",
      reference: payment.reference || "-",
      status: payment.status || "Pending",
      bankId: payment.bankId || null,
      _originalData: payment,
    }));

    setPayments(mapped);
  }, [salesInvoiceData]);
  const handleEdit = (payment) => {
    if (onEditPayment) {
      onEditPayment({
        ...(payment._originalData || payment),
        due_amount: payment.due_amount,
        totalAmount: payment.totalAmount,
        id: payment.id,
        invoiceNo: payment.invoiceNo,
      });
    }
  };
  const handleDelete = async (paymentId) => {
    Swal.fire({
      title: "Are you sure you want to delete this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (isSuperAdmin) {
          await DeleteRecordpaymentbyid(paymentId, invoiceId);
        } else {
          await DeleteRecordPayment(paymentId);
        }
        Swal.fire("Deleted!", "Payment has been deleted.", "success");
        if (onRefresh) onRefresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-4 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            <FormattedMessage
              id="PAYMENT.PAYMENT_RECEIVED"
              defaultMessage="Payment Received"
            />{" "}
            ({payments.length})
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </div>

      {/* Table */}
      {isExpanded && (
        <div className="p-4">
          {payments.length > 0 ? (
            <TableComponent
              columns={paymentColumns(handleEdit, handleDelete)}
              data={payments}
              paginationSize={5}
            />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FormattedMessage
                id="PAYMENT.NO_PAYMENTS"
                defaultMessage="No payments found"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
