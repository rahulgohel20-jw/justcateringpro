import { useCallback, useEffect, useState, useRef  } from "react";
  import { X, Wallet, Edit, Trash2  , FileText } from "lucide-react";
  import Swal from "sweetalert2";
  import {
    GetAllEventAdvancePayment,
    DeleteEventAdvancePayment,
    getreportpdfforadvancepayment ,
    AddLogs,
  } from "@/services/apiServices";
  import AddAdvancePaymentForm from "../add-advance-payment-status/AddAdvancePaymentForm";
  import { Modal } from "antd";
  import { Worker, Viewer } from "@react-pdf-viewer/core";
  import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
  import "@react-pdf-viewer/core/lib/styles/index.css";
  import "@react-pdf-viewer/default-layout/lib/styles/index.css";
  import { FormattedMessage, useIntl } from "react-intl";


  const AdvancePaymentModal = ({ isOpen, onClose, eventId, userId, canEdit }) => {
    const intl = useIntl();
    const [paymentList, setPaymentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
const [reportModalItem, setReportModalItem] = useState(null);
  const pdfPlugin = defaultLayoutPlugin();

  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
// const [isCompanyDetails, setIsCompanyDetails] = useState(true);
const [isTermsCondition, setIsTermsCondition] = useState(false);

const preSaveListRef = useRef([]);

 const userEmail = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
      );
    } catch {
      return "";
    }
  })();

  const AdvancePaymentReportModal = ({ item, onClose, onConfirm }) => {
  const intl = useIntl();
  const [isTermsCondition, setIsTermsCondition] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[70]" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 z-[70] bg-white rounded-2xl shadow-2xl"
        style={{ transform: "translate(-50%,-50%)", width: "min(420px,95vw)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-base font-bold">
            <FormattedMessage id="USER.ADVANCE_PAYMENT.REPORT_MODAL_TITLE" defaultMessage="Advance Payment Report" />
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                <FormattedMessage id="USER.ADVANCE_PAYMENT.TERMS_TITLE" defaultMessage="Terms &amp; Conditions" />
              </p>
              <p className="text-xs text-gray-400">
                <FormattedMessage id="USER.ADVANCE_PAYMENT.TERMS_DESC" defaultMessage="Include terms &amp; conditions in report" />
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isTermsCondition}
                  onChange={(e) => setIsTermsCondition(e.target.checked)}
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isTermsCondition ? "bg-primary" : "bg-gray-300"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isTermsCondition ? "translate-x-5" : ""}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button className="btn btn-light" onClick={onClose}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.CANCEL_BTN" defaultMessage="Cancel" />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm({ item, isTermsCondition: isTermsCondition ? 1 : 0 })}
          >
            <FormattedMessage id="USER.ADVANCE_PAYMENT.GENERATE_REPORT_BTN" defaultMessage="Generate Report" />
          </button>
        </div>
      </div>
    </>
  );
};

    const fetchPayments = useCallback(async () => {
  if (!eventId) return [];
  try {
    setLoading(true);
    const res = await GetAllEventAdvancePayment(eventId);
    const list =
      res?.data?.data ||
      res?.data?.payments ||
      [];
    const finalList = Array.isArray(list) ? list : [];
    setPaymentList(finalList);
    return finalList; // ← return so callers can diff against it
  } catch (err) {
    console.error("Failed to fetch advance payments:", err);
    setPaymentList([]);
    return [];
  } finally {
    setLoading(false);
  }
}, [eventId]);

    useEffect(() => {
      if (isOpen) {
        fetchPayments();
      } else {
        setShowForm(false);
        setEditingPayment(null);
      }
    }, [isOpen, fetchPayments]);

    const openAddForm = () => {
      preSaveListRef.current = paymentList;
      setEditingPayment(null);
      setShowForm(true);
    };

    const openEditForm = (row) => {
      preSaveListRef.current = paymentList;
      setEditingPayment(row);
      setShowForm(true);
    };

    const handleFormClose = () => {
      setShowForm(false);
      setEditingPayment(null);
    };


    const buildAdvancePaymentChangeSummary = (prevList, newList, wasEditing) => {
  if (!wasEditing) {
    // Find the row(s) present in newList but not prevList — the new addition
    const prevIds = new Set(prevList.map((p) => p.id));
    const added = newList.find((p) => !prevIds.has(p.id));
    if (added) {
      return `Added: ₹${Number(added.amount ?? 0).toLocaleString("en-IN")} via ${
        added.paymentMode || "-"
      } on ${added.paymentDate || "-"}${added.remark ? ` (Remark: ${added.remark})` : ""}`;
    }
    return "New payment added.";
  }


  const prevRow = prevList.find((p) => p.id === wasEditing.id);
  const newRow = newList.find((p) => p.id === wasEditing.id);
  if (!prevRow || !newRow) return "Payment updated.";

  const fields = [
    ["paymentDate", "Date"],
    ["amount", "Amount"],
    ["paymentMode", "Mode"],
    ["remark", "Remark"],
  ];

  const changes = [];
  fields.forEach(([field, label]) => {
    const prevVal = prevRow[field] ?? "-";
    const currVal = newRow[field] ?? "-";
    if (String(prevVal) !== String(currVal)) {
      changes.push(`${label}: ${prevVal} → ${currVal}`);
    }
  });

  return changes.length ? changes.join(", ") : "No field changes detected.";
};

  const handleFormSaved = async () => {
  const wasEditing = editingPayment; // capture before clearing
  setShowForm(false);
  setEditingPayment(null);

  const newList = await fetchPayments();

  // ── Non-blocking activity log ──
  try {
    const changeSummary = buildAdvancePaymentChangeSummary(
      preSaveListRef.current,
      newList,
      wasEditing,
    );

    await AddLogs({
      id: 0,
      eventId: Number(eventId) || 0,
      description: `Advance Payment ${wasEditing ? "updated" : "added"} | Saved By: ${
        userEmail || "Unknown User"
      } | ${changeSummary}`,
      eventType: wasEditing ? "Advance Payment Update" : "Advance Payment Add",
      user: userEmail,
    });
  } catch (logErr) {
    console.error("Log failed (non-blocking):", logErr);
  }
};

   const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: intl.formatMessage({
      id: "USER.ADVANCE_PAYMENT.DELETE_CONFIRM_TITLE",
      defaultMessage: "Delete this payment?",
    }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: intl.formatMessage({
      id: "USER.ADVANCE_PAYMENT.DELETE_BTN",
      defaultMessage: "Delete",
    }),
    confirmButtonColor: "#d33",
  });
  if (!result.isConfirmed) return;

  const deletedRow = paymentList.find((p) => p.id === id); // ← capture before delete

  try {
    const resp = await DeleteEventAdvancePayment(id);
    if (resp?.data?.success !== false) {
      Swal.fire({
        icon: "success",
        title: intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.DELETED_TITLE",
          defaultMessage: "Deleted!",
        }),
        timer: 1000,
        showConfirmButton: false,
      });

      // ── Non-blocking activity log ──
      try {
        await AddLogs({
          id: 0,
          eventId: Number(eventId) || 0,
          description: `Advance Payment deleted | Amount: ₹${
            Number(deletedRow?.amount ?? 0).toLocaleString("en-IN")
          } | Mode: ${deletedRow?.paymentMode || "-"} | Date: ${
            deletedRow?.paymentDate || "-"
          }${deletedRow?.remark ? ` | Remark: ${deletedRow.remark}` : ""} | Deleted By: ${
            userEmail || "Unknown User"
          }`,
          eventType: "Advance Payment Delete",
          user: userEmail,
        });
      } catch (logErr) {
        console.error("Log failed (non-blocking):", logErr);
      }

      fetchPayments();
    } else {
      Swal.fire({
        icon: "error",
        title:
          resp?.data?.msg ||
          intl.formatMessage({
            id: "USER.ADVANCE_PAYMENT.DELETE_FAILED",
            defaultMessage: "Delete failed",
          }),
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title:
        err?.response?.data?.msg ||
        intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.SOMETHING_WRONG",
          defaultMessage: "Something went wrong",
        }),
    });
  }
};

  const getReceiver = (item) => {
    return item.entryByName || "—";
  };
    if (!isOpen) return null;


    const handleGenerateReport = () => {
    setLoadingPdf(true);

    GetQuotationReport(eventId, userId, 1)
      .then((response) => {
        if (response?.data?.report_path) {
          setPdfUrl(response.data.report_path);
          setIsPdfModalVisible(true);
        }
      })
      .catch((error) => {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: intl.formatMessage({
            id: "USER.ADVANCE_PAYMENT.ERROR_TITLE",
            defaultMessage: "Error",
          }),
          text: intl.formatMessage({
            id: "USER.ADVANCE_PAYMENT.REPORT_FAILED",
            defaultMessage: "Failed to generate report",
          }),
        });
      })
      .finally(() => {
        setLoadingPdf(false);
      });
  };

const handleRowReport = (item) => {
  setReportModalItem(item);
};

const handleReportConfirm = async ({ item, isTermsCondition }) => {
  try {
    setLoadingPdf(true);
    setReportModalItem(null);
    const response = await getreportpdfforadvancepayment(
      item.id,
      eventId,
      userId,
      isTermsCondition,
      item.eventFunctionId
    );
    if (response?.data?.data) {
      window.open(response.data.data, "_blank");

      // ── Non-blocking activity log ──
      try {
        await AddLogs({
          id: 0,
          eventId: Number(eventId) || 0,
          description: `Advance Payment report generated | Payment ID: ${item.id} | Amount: ₹${Number(
            item.amount ?? 0
          ).toLocaleString("en-IN")} | Terms Included: ${
            isTermsCondition ? "Yes" : "No"
          } | Generated By: ${userEmail || "Unknown User"}`,
          eventType: "Advance Payment Report",
          user: userEmail,
        });
      } catch (logErr) {
        console.error("Log failed (non-blocking):", logErr);
      }
    } else {
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.ERROR_TITLE",
          defaultMessage: "Error",
        }),
        text:
          response?.data?.msg ||
          intl.formatMessage({
            id: "USER.ADVANCE_PAYMENT.REPORT_FAILED",
            defaultMessage: "Failed to generate report",
          }),
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: intl.formatMessage({
        id: "USER.ADVANCE_PAYMENT.ERROR_TITLE",
        defaultMessage: "Error",
      }),
      text:
        error?.response?.data?.msg ||
        intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.SOMETHING_WRONG",
          defaultMessage: "Something went wrong",
        }),
    });
  } finally {
    setLoadingPdf(false);
  }
};
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />

        {/* Main Modal */}
        <div
          className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl no-scrollbar"
          style={{
            transform: "translate(-50%,-50%)",
            width: "min(1000px,95vw)",
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 32px 64px rgba(0,0,0,.18)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-6 py-5 rounded-t-2xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,.2)" }}
              >
                <Wallet size={18} color="#fff" />
              </div>
              <p className="text-white font-bold text-base leading-tight">
                <FormattedMessage id="USER.ADVANCE_PAYMENT.MODAL_TITLE" defaultMessage="Advance Payment Receipt" />
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: "rgba(255,255,255,.15)" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex justify-end">
            {/* <button
    className="btn btn-success"
    onClick={handleGenerateReport}
    disabled={loadingPdf}
  >
    {loadingPdf ? (
      <>
        <span className="loading loading-spinner loading-xs"></span>
        Loading...
      </>
    ) : (
      "Report"
    )}
  </button> */}
              {canEdit && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="btn btn-primary text-sm ms-3  px-4 py-1.5"
                >
                  <FormattedMessage id="USER.ADVANCE_PAYMENT.ADD_PAYMENT_BTN" defaultMessage="+ Add Payment" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.NO" defaultMessage="No." />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.DATE" defaultMessage="Date" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.AMOUNT" defaultMessage="Amount" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.MODE" defaultMessage="Mode of Payment" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.RECEIVER" defaultMessage="Receiver" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                        <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.REMARK" defaultMessage="Remark" />
                      </th>
                      {canEdit && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                          <FormattedMessage id="USER.ADVANCE_PAYMENT.TABLE.ACTION" defaultMessage="Action" />
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentList.length > 0 ? (
                      paymentList.map((item, index) => (
                        <tr key={item.id || index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.paymentDate || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                            ₹{Number(item.amount ?? 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                              ${item.paymentMode === "Cash"
                                ? "bg-green-100 text-green-700"
                                : item.paymentMode === "UPI"
                                ? "bg-purple-100 text-purple-700"
                                : item.paymentMode === "Cheque"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"}`}>
                              {item.paymentMode || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{getReceiver(item)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate" title={item.remark}>
                            {item.remark || "—"}
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
      type="button"
      title={intl.formatMessage({
        id: "USER.ADVANCE_PAYMENT.VIEW_REPORT_TOOLTIP",
        defaultMessage: "View Report",
      })}
      onClick={() => handleRowReport(item)}
      className="text-green-600 hover:text-green-800 transition-colors"
    >
      <FileText size={16} />
    </button>
                                <button
                                  type="button"
                                  onClick={() => openEditForm(item)}
                                  className="text-primary hover:text-primary/70 transition-colors"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={canEdit ? 7 : 6}
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          <FormattedMessage id="USER.ADVANCE_PAYMENT.NO_DATA" defaultMessage="No advance payments found" />
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* Total row */}
                  {paymentList.length > 0 && (
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-700 border-t">
                          <FormattedMessage id="USER.ADVANCE_PAYMENT.TOTAL_LABEL" defaultMessage="Total" />
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-primary border-t">
                          ₹{paymentList
                            .reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
                            .toLocaleString("en-IN")}
                        </td>
                        <td colSpan={canEdit ? 4 : 3} className="border-t" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Form Modal */}
        {showForm && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
              onClick={handleFormClose}
            />
            <div
              className="fixed top-1/2 left-1/2 z-[60] bg-white rounded-2xl"
              style={{
                transform: "translate(-50%,-50%)",
                width: "min(520px,95vw)",
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: "0 32px 64px rgba(0,0,0,.18)",
              }}
            >
              {/* Form Header */}
              <div className="flex items-center justify-between bg-primary px-6 py-4 rounded-t-2xl sticky top-0 z-10">
                <p className="text-white font-bold text-base">
                  {editingPayment ? (
                    <FormattedMessage id="USER.ADVANCE_PAYMENT.EDIT_TITLE" defaultMessage="Edit Recipte" />
                  ) : (
                    <FormattedMessage id="USER.ADVANCE_PAYMENT.ADD_TITLE" defaultMessage="Add Advance Receipt" />
                  )}
                </p>
                <button
                  onClick={handleFormClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,.15)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <div className="px-6 py-5">
                <AddAdvancePaymentForm
                  eventId={eventId}
                  userId={userId}
                  editingPayment={editingPayment}
                  onCancel={handleFormClose}
                  onSaved={handleFormSaved}
                />
              </div>
             
            </div>
          </>
        )}
         {reportModalItem && (
  <AdvancePaymentReportModal
    item={reportModalItem}
    onClose={() => setReportModalItem(null)}
    onConfirm={handleReportConfirm}
  />
)}
        <Modal
    title={intl.formatMessage({
      id: "USER.ADVANCE_PAYMENT.REPORT_MODAL_TITLE",
      defaultMessage: "Advance Payment Report",
    })}
    open={isPdfModalVisible}
    width="70%"
    onCancel={() => {
      setIsPdfModalVisible(false);

      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl("");
      }
    }}
    footer={[
      <button
        key="close"
        className="btn btn-light"
        onClick={() => {
          setIsPdfModalVisible(false);

          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl("");
          }
        }}
      >
        <FormattedMessage id="USER.ADVANCE_PAYMENT.CLOSE_BTN" defaultMessage="Close" />
      </button>,
    ]}
  >
    <div style={{ height: "80vh" }}>
      {pdfUrl && (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[pdfPlugin]}
          />
        </Worker>
      )}
    </div>
  </Modal>
      </>   
    );
  };

  export default AdvancePaymentModal;