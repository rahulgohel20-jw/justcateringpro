import { useState, useEffect } from "react";
import { Button, Table, Modal } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { GetInvoice, GetQuotationReport } from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Swal from "sweetalert2";

const InvoiceDetail = ({ Eventid, onInvoiceDataLoad, refreshKey }) => {
  const navigate = useNavigate();
  const { EventId } = useParams();
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [gstInfo, setGstInfo] = useState({});
  const [functionData, setFunctionData] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceData, setInvoiceData] = useState(null);

  
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();

  

  const numberToIndianWords = (num) => {
    if (!num || isNaN(num)) return "";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertLessThanThousand = (n) => {
      let str = "";
      if (n > 99) {
        str += ones[Math.floor(n / 100)] + " Hundred ";
        n = n % 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + " ";
        n = n % 10;
      }
      if (n > 0) {
        str += ones[n] + " ";
      }
      return str.trim();
    };

    let result = "";
    let crore = Math.floor(num / 10000000);
    num %= 10000000;

    let lakh = Math.floor(num / 100000);
    num %= 100000;

    let thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore) result += convertLessThanThousand(crore) + " Crore ";
    if (lakh) result += convertLessThanThousand(lakh) + " Lakh ";
    if (thousand) result += convertLessThanThousand(thousand) + " Thousand ";
    if (num) result += convertLessThanThousand(num);

    return result.trim() + " Only";
  };

  const columns = [
    {
      title: (
        <FormattedMessage
          id="SALES.INVOICE_FUNCTION"
          defaultMessage="Function"
        />
      ),
      dataIndex: "function",
      key: "function",
    },
    {
      title: (
        <FormattedMessage
          id="SALES.INVOICE_DATE_TIME"
          defaultMessage="Date & Time"
        />
      ),
      dataIndex: "date",
      key: "date",
    },
    {
      title: (
        <FormattedMessage id="SALES.INVOICE_PERSON" defaultMessage="Person" />
      ),
      dataIndex: "person",
      key: "person",
    },
    {
      title: (
        <FormattedMessage id="SALES.INVOICE_EXTRA" defaultMessage="Extra" />
      ),
      dataIndex: "extra",
      key: "extra",
    },
    {
      title: <FormattedMessage id="SALES.INVOICE_RATE" defaultMessage="Rate" />,
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: (
        <FormattedMessage id="SALES.INVOICE_AMOUNT" defaultMessage="Amount" />
      ),
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const handleGenerateReport = () => {
    setLoadingPdf(true);

    const userId = localStorage.getItem("userId");
    const activeEventId = Eventid || EventId;

    GetQuotationReport(activeEventId, userId, 1)
      .then((response) => {
        if (response.data) {
          const pdfPath = response.data?.report_path;
          setPdfUrl(pdfPath);
          setIsPdfModalVisible(true);
        }
      })
      .catch((error) => {
        console.error("Error generating report:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to generate PDF report",
          icon: "error",
          confirmButtonColor: "#005BA8",
        });
      })
      .finally(() => {
        setLoadingPdf(false);
      });
  };

  const handleWhatsAppShare = (pdfUrl) => {
    const name = invoiceData?.event?.party?.nameEnglish || "there";
    const mobile = invoiceData?.event?.party?.mobileno || "";

    const message = `Hi ${name},
Hope you're doing well!

Please find the invoice PDF below:
${pdfUrl}

Thanks!`;

    const url = `https://api.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const fetchInvoiceData = async (id) => {
  if (!id) return null;
  try {
    const response = await GetInvoice(id);
    const invoiceArray = response?.data?.data?.["Event Invoice Details"];

    if (
      !invoiceArray ||
      !Array.isArray(invoiceArray) ||
      invoiceArray.length === 0
    ) {
      console.error("No invoice data found");
      return null;
    }

    // Get the first invoice from the array
    const invoice = invoiceArray[0];
    const event = invoice?.event || {};
    const party = event?.party || {};

    setInvoiceData(invoice);

    setSubTotal(invoice?.subTotal || 0);
    setTotalAmount(invoice?.grandTotal || 0);

    setInvoiceInfo({
      invoiceCode: invoice?.invoiceCode || "-",
      billingName: invoice?.billingname || party?.nameEnglish || "-",
      quotationNumber: invoice?.quotationCode || "-",
      invoiceDate: invoice?.createdAt || "-",
      dueDate: invoice?.duedate || "-",
      eventDate: event?.eventStartDateTime
        ? new Date(event.eventStartDateTime).toLocaleDateString("en-GB")
        : "-",
      gstNumber: invoice?.gstnumber || party?.gst || "NA",
      address: invoice?.shipaddress || party?.addressEnglish || "-",
      notes: invoice?.notes || "",
      discount: invoice?.discount || 0,
      terms: invoice?.terms || "Due on Receipt",
    });

    // Set GST information
    setGstInfo({
      cgst: invoice?.cgst || 0,
      cgstAmnt: invoice?.cgstAmnt || 0,
      sgst: invoice?.sgst || 0,
      sgstAmnt: invoice?.sgstAmnt || 0,
      igst: invoice?.igst || 0,
      igstAmnt: invoice?.igstAmnt || 0,
    });

    // Map function items
    const functions =
      invoice?.invoiceFunctionItems?.map((fn, index) => ({
        key: index + 1,
        function: fn?.functionName || "-",
        date: fn?.functionDate || "-",
        person: fn?.pax || "0",
        extra: fn?.extraPax || "0",
        rate: fn?.ratePerPlate?.toFixed(2) || "0.00",
        amount: fn?.amount?.toFixed(2) || "0.00",
      })) || [];

    setFunctionData(functions);

    const invoiceDataForParent = {
  invoiceCode: invoice?.invoiceCode || "-",
  invoiceNo: invoice?.invoiceCode || "-",
  grandTotal: invoice?.grandTotal || 0,
  invoiceAmount: invoice?.grandTotal || 0,
  dueAmount: invoice?.dueAmount || invoice?.grandTotal || 0,
  eventId: event?.id || id,
  billingname: invoice?.billingname || party?.nameEnglish || "-",
  event: event,
  salesInvoiceData: invoice?.salesInvoiceData || {},   // ✅ ADD THIS
};

    // CALL PARENT CALLBACK WITH DATA - ADD THIS
    if (onInvoiceDataLoad) {
      onInvoiceDataLoad(invoiceDataForParent);
    }

    // RETURN DATA - ADD THIS
    return invoiceDataForParent;

  } catch (err) {
    console.error("Error fetching invoice data:", err);
    return null;
  }
};

  useEffect(() => {
  const activeEventId = Eventid || EventId;
  if (activeEventId) {
    fetchInvoiceData(activeEventId);
  }
}, [Eventid, EventId, refreshKey]);  



  return (
    <>
    <div className="relative">
      {/* Badge Container */}
      <div className="absolute top-0 left-0 z-10 overflow-hidden w-32 h-32">
        <div 
          className="absolute top-0 left-0 bg-[#0066CC] text-white text-center font-bold text-sm py-1 shadow-lg"
          style={{
            width: '150px',
            transform: 'rotate(-45deg) translate(-72px, 20px)',
            transformOrigin: 'top left',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)'
          }}
        >
        DRAFT
        </div>
      </div>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg w-full mx-auto border border-gray-100 overflow-hidden min-w-0">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-4 border-b border-gray-100 gap-4 mt-16">
          <div className="flex items-center justify-between gap-2 w-full">
              <h2 className="text-2xl font-bold text-primary">{invoiceInfo.invoiceCode}</h2>
            </div>
          <div className="flex-3">
            <p className="text-gray-500 text-xs sm:text-sm break-words">
              {invoiceInfo.address}
            </p>
          </div>
          {/* <div className="flex flex-row items-end gap-2 w-full sm:w-auto">
            {" "}
            <button
              className="btn btn-sm btn-primary flex-1 sm:flex-initial text-xs sm:text-sm"
              onClick={handleGenerateReport}
              disabled={loadingPdf}
            >
              {loadingPdf ? (
                <>
                  <i className="ki-filled ki-loading animate-spin"></i>
                  <FormattedMessage
                    id="COMMON.LOADING"
                    defaultMessage="Loading..."
                  />
                </>
              ) : (
                <>
                  <i className="ki-filled ki-printer"></i>
                  <FormattedMessage id="COMMON.PRINT" defaultMessage="Print" />
                </>
              )}
            </button>
            <Button
              icon={<SettingOutlined />}
              className="font-semibold border-[#005BA8] text-[#005BA8] hover:bg-[#005BA8] hover:text-white transition-all whitespace-nowrap flex-1 sm:flex-initial text-xs sm:text-sm"
              onClick={() => {
                const activeEventId = Eventid || EventId;
                navigate(`/add-invoice/${activeEventId}`, {
                  state: {
                    eventId: activeEventId,
                    eventTypeId: invoiceData?.event?.eventTypeId,
                  },
                });
              }}
            >
              <FormattedMessage
                id="COMMON.CUSTOMIZE"
                defaultMessage="Customize"
              />
            </Button>
          </div> */}
        </div>
        {/* Invoice Info */}
        <div className="p-4 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm border-t border-gray-300">
          {" "}
          <div className="md:border-r border-gray-300 md:pr-6">
           
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500">
                <FormattedMessage
                  id="INVOICE.INVOICE_NUMBER"
                  defaultMessage="Invoice Number"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.invoiceCode}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500">
                <FormattedMessage
                  id="INVOICE.INVOICE_DATE"
                  defaultMessage="Invoice Date"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.invoiceDate}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500">
                <FormattedMessage
                  id="INVOICE.EVENT_DATE"
                  defaultMessage="Event Date"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.eventDate}
              </span>
            </p>
          </div>
          <div>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500">
                <FormattedMessage
                  id="INVOICE.GST_NUMBER"
                  defaultMessage="GST Number"
                />
              </span>
              <span className="font-medium text-right break-all">
                {invoiceInfo.gstNumber}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500">
                <FormattedMessage
                  id="INVOICE.DUE_DATE"
                  defaultMessage="Due Date"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.dueDate}
              </span>
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <h4 className="p-3 sm:p-4 text-sm sm:text-base font-semibold text-[#005BA8] bg-[#EAF4FB] border-t border-gray-200">
            <FormattedMessage
              id="FUNCTION.DETAILS"
              defaultMessage="Bill To"
            />
          </h4>
          <p className="p-3 sm:p-4 text-sm sm:text-base font-semibold  border-b border-gray-200">
            Name   :  {invoiceInfo.billingName}
          </p>
          <p className="p-3 sm:p-4 text-sm sm:text-base font-semibold  border-b border-gray-200">
           Subject : 
          </p>
        </div>
        {/* Function Table */}
        <div className=" overflow-x-auto">
          <h4 className="p-3 sm:p-4 text-sm sm:text-base font-semibold text-[#005BA8] bg-[#EAF4FB] border-b border-gray-200">
            <FormattedMessage
              id="FUNCTION.DETAILS"
              defaultMessage="Function Details"
            />
          </h4>
          <Table
            columns={columns}
            dataSource={functionData}
            pagination={false}
            className="p-2 !border-0 [&_.ant-table-thead>tr>th]:bg-[#F8FAFC] [&_.ant-table-thead>tr>th]:text-[#005BA8]"
          />
        </div>
        {/* Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="p-3 sm:p-4 text-xs sm:text-sm text-gray-700 min-w-0">
            <p>
              <strong>
                <FormattedMessage
                  id="INVOICE.TOTAL_IN_WORDS"
                  defaultMessage="Total in Words:"
                />
              </strong>{" "}
              <br />
              <p>Indian Rupee : {numberToIndianWords(totalAmount)}</p>
            </p>
            <p className="mt-4">
              <strong>
                <FormattedMessage id="INVOICE.NOTES" defaultMessage="Notes:" />
              </strong>{" "}
              <br />
              <span className="break-words">{invoiceInfo.notes}</span>
            </p>
            <p className="mt-4 text-xs text-gray-500 leading-relaxed">
              <strong>
                <FormattedMessage
                  id="INVOICE.TERMS_CONDITIONS"
                  defaultMessage="Terms & Conditions:"
                />
              </strong>{" "}
              <br />
              <FormattedMessage
                id="INVOICE.TERMS_CONDITIONS_VALUE"
                defaultMessage="Your company's Terms and Conditions will appear here."
              />
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-between p-6 lg:border-l border-t lg:border-t-0 border-gray-100 text-sm">
            <div>
              <div className="flex justify-between mb-1 gap-4">
                <span className="text-gray-500">
                  <FormattedMessage
                    id="INVOICE.SUB_TOTAL"
                    defaultMessage="Sub Total"
                  />
                </span>
                <span>₹ {subTotal}</span>
              </div>
              <div className="flex justify-between mb-1 gap-4">
                <span className="text-gray-500">
                  <FormattedMessage id="INVOICE.CGST" defaultMessage="CGST" />
                </span>
                <span>₹ {gstInfo.cgstAmnt}</span>
              </div>
              <div className="flex justify-between mb-1 gap-4">
                <span className="text-gray-500">
                  <FormattedMessage id="INVOICE.SGST" defaultMessage="SGST" />
                </span>
                <span>₹ {gstInfo.sgstAmnt}</span>
              </div>
              <div className="flex justify-between mb-1 gap-4">
                <span className="text-gray-500">
                  <FormattedMessage id="INVOICE.IGST" defaultMessage="IGST" />
                </span>
                <span>₹ {gstInfo.igstAmnt}</span>
              </div>
              <div className="flex justify-between mb-1 gap-4 mb-2">
                <span className="text-gray-500">
                  <FormattedMessage
                    id="INVOICE.DISCOUNT"
                    defaultMessage="Discount"
                  />
                </span>
                <span>₹ {invoiceInfo.discount}</span>
              </div>
              <hr />
              <div className="mt-2 flex justify-between font-bold text-[#005BA8] text-base gap-4">
                <span>
                  <FormattedMessage id="INVOICE.TOTAL" defaultMessage="Total" />
                </span>
                <span>₹ {totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      <Modal
        title={
          <FormattedMessage
            id="INVOICE.INVOICE_REPORT"
            defaultMessage="Invoice Report"
          />
        }
        k
        open={isPdfModalVisible}
        onCancel={() => {
          setIsPdfModalVisible(false);
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl("");
          }
        }}
        width="60%"
        footer={[
          <div key="footer" className="flex justify-end gap-2">
            <button
              onClick={() => handleWhatsAppShare(pdfUrl)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Share on WhatsApp
            </button>
            <button
              className="btn btn-sm btn-light"
              onClick={() => {
                setIsPdfModalVisible(false);
                if (pdfUrl) {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl("");
                }
              }}
            >
              <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
            </button>
          </div>,
        ]}
        style={{ top: 20 }}
      >
        <div style={{ height: "80vh" }}>
          {pdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[pdfPlugin]}
                // defaultScale={1.0}
              />
            </Worker>
          )}
        </div>
      </Modal>
      </div>
    </>
  );
};

export default InvoiceDetail;
