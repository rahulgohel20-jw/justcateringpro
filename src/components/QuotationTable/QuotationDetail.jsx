import { Button, Table, Modal } from "antd";
import { useState, useEffect } from "react";
import { SettingOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { GetQuotation, GetQuotationReport } from "@/services/apiServices";
import { useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Swal from "sweetalert2";
import InvoiceTheme from "../../pages/Event/AddInvoicePage/InvoiceTheme";
const QuotationDetail = ({ Eventid }) => {
  const navigate = useNavigate();
  const { EventId } = useParams();
  const [eventData, setEventData] = useState([]);
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [gstInfo, setGstInfo] = useState({});
  const [functionData, setFunctionData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();
  const [isInvoiceThemeOpen, setIsInvoiceThemeOpen] = useState(false);

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
          id="SALES.QUOTATION_FUNCTIONS"
          defaultMessage="Function"
        />
      ),
      dataIndex: "function",
      key: "function",
    },
    {
      title: (
        <FormattedMessage
          id="SALES.QUOTATION_DATE_TIME"
          defaultMessage="Date & Time"
        />
      ),
      dataIndex: "date",
      key: "date",
    },
    {
      title: (
        <FormattedMessage id="SALES.QUOTATION_PERSON" defaultMessage="Person" />
      ),
      dataIndex: "person",
      key: "person",
    },
    {
      title: (
        <FormattedMessage id="SALES.QUOTATION_EXTRA" defaultMessage="Extra" />
      ),
      dataIndex: "extra",
      key: "extra",
    },
    {
      title: (
        <FormattedMessage id="SALES.QUOTATION_RATE" defaultMessage="Rate" />
      ),
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: (
        <FormattedMessage id="SALES.QUOTATION_AMOUNT" defaultMessage="Amount" />
      ),
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const formatDateDDMMYYYY = (date) => {
    if (!date) return "-";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
  };

  const fetchEventData = async (id) => {
    if (!id) return;
    try {
      const response = await GetQuotation(id, 0);
      const data = response?.data?.data;
      const quotationDetails = data?.["Event Functions Quotation Details"]?.[0];

      if (quotationDetails) {
        setSubTotal(quotationDetails?.subTotal || 0);
        setTotalAmount(quotationDetails?.grandTotal || 0);

        setInvoiceInfo({
          quotationNumber: quotationDetails?.quotationCode || "-",
          customerName: quotationDetails?.event?.party?.nameEnglish || "-",
          Address: quotationDetails?.event?.party?.addressEnglish || "-",
          billingname: quotationDetails?.billingname || "-",
          gstnumber: quotationDetails?.gstnumber || "-",
          duedate: quotationDetails?.duedate || "-",
          notes: quotationDetails?.notes || "",
          discount: quotationDetails?.discount || 0,
          // Use quotationdate if available, otherwise fall back to createdAt
          quotationDate: formatDateDDMMYYYY(
            quotationDetails?.quotationdate || quotationDetails?.createdAt,
          ),

          terms: quotationDetails?.terms || "Due on Receipt",
          eventDate: quotationDetails?.event?.eventStartDateTime
            ? new Date(
                quotationDetails.event.eventStartDateTime,
              ).toLocaleDateString("en-GB")
            : "-",
        });

        setGstInfo({
          gstNumber: quotationDetails?.event?.party?.gstNo || "NA",
          gstTreatment: quotationDetails?.event?.party?.gstType || "NA",
          cgst: quotationDetails?.cgst || 0,
          cgstAmnt: quotationDetails?.cgstAmnt || 0,
          sgst: quotationDetails?.sgst || 0,
          sgstAmnt: quotationDetails?.sgstAmnt || 0,
          igst: quotationDetails?.igst || 0,
          igstAmnt: quotationDetails?.igstAmnt || 0,
        });

        const functions =
          quotationDetails?.functionQuotationItems?.map((fn, index) => ({
            key: index + 1,
            function: fn?.functionName || "-",
            date: fn?.functionDate || "0",
            rate: fn?.ratePerPlate || "0",
            person: fn?.pax || "0",
            extra: fn?.extraPax || "0",
            amount: fn?.amount || "0",
          })) || [];

        setFunctionData(functions);
      }

      setEventData(data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    }
  };

  useEffect(() => {
    if (EventId) {
      fetchEventData(EventId);
    }
  }, [EventId]);

  useEffect(() => {
    if (Eventid) {
      fetchEventData(Eventid);
    }
  }, [Eventid]);

  return (
    <>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg w-full mx-auto border border-gray-100 overflow-hidden">
        {" "}
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 gap-4">
          {" "}
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#005BA8]">
              {" "}
              <FormattedMessage
                id="QUOTATION.TITLE"
                defaultMessage={`Quotation - ${invoiceInfo.quotationNumber}`}
              />
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm break-words">
              {" "}
              {invoiceInfo.Address}
            </p>
          </div>
          <div className="flex flex-row items-end gap-2 w-full sm:w-auto">
            {" "}
            <button
              className="btn btn-sm btn-primary flex-1 sm:flex-initial text-xs sm:text-sm"
              onClick={() => setIsInvoiceThemeOpen(true)}
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
              onClick={() => navigate(`/quotation/${Eventid || EventId}`)}
            >
              <FormattedMessage
                id="COMMON.CUSTOMIZE"
                defaultMessage="Customize"
              />
            </Button>
          </div>
        </div>
        {/* Invoice Details */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm border-b border-gray-100">
          {" "}
          <div className="md:border-r border-gray-200 md:pr-6">
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500 flex-shrink-0">
                <FormattedMessage
                  id="INVOICE.BILLING_NAME"
                  defaultMessage="Billing Name"
                />
              </span>
              <span className="font-medium text-right break-words">
                {invoiceInfo.billingname || invoiceInfo.customerName}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500 flex-shrink-0">
                <FormattedMessage
                  id="INVOICE.QUOTATION_NUMBER"
                  defaultMessage="Quotation Number"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.quotationNumber}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500 flex-shrink-0">
                <FormattedMessage
                  id="INVOICE.QUOTATION_DATE"
                  defaultMessage="Quotation Date"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.quotationDate}
              </span>
            </p>

            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500 flex-shrink-0">
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
              <span className="text-gray-500 flex-shrink-0">
                <FormattedMessage
                  id="INVOICE.GST_NUMBER"
                  defaultMessage="GST Number"
                />
              </span>
              <span className="font-medium text-right break-all">
                {invoiceInfo.gstnumber}
              </span>
            </p>
            <p className="flex justify-between mb-1 gap-4">
              <span className="text-gray-500 flex-shrink-0">
                <FormattedMessage
                  id="INVOICE.DUE_DATE"
                  defaultMessage="Due Date"
                />
              </span>
              <span className="font-medium text-right">
                {invoiceInfo.duedate}
              </span>
            </p>
          </div>
        </div>
        {/* Items Table */}
        <div className="mt-4 sm:mt-6 overflow-x-auto">
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
            className="!border-0 [&_.ant-table-thead>tr>th]:bg-[#F8FAFC] [&_.ant-table-thead>tr>th]:text-[#005BA8]"
          />
        </div>
        {/* Footer / Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="p-4 sm:p-6 text-xs sm:text-sm text-gray-700 min-w-0">
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
              <div className="flex justify-between mb-1 gap-4">
                <span className="text-gray-500">
                  <FormattedMessage
                    id="INVOICE.DISCOUNT"
                    defaultMessage="Discount"
                  />
                </span>
                <span>₹ {invoiceInfo.discount}</span>
              </div>
              <div className="flex justify-between font-bold text-[#005BA8] text-base gap-4">
                <span>
                  <FormattedMessage id="INVOICE.TOTAL" defaultMessage="Total" />
                </span>
                <span>₹ {totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InvoiceTheme
        open={isInvoiceThemeOpen}
        onClose={() => setIsInvoiceThemeOpen(false)}
        eventId={EventId}
        isinvoice={1}
      />
    </>
  );
};

export default QuotationDetail;
