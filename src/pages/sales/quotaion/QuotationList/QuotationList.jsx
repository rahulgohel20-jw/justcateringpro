import { useState, useEffect } from "react";
import { Button, Dropdown, Form, Menu, Upload } from "antd";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import {
  EditOutlined,
  ShareAltOutlined,
  SendOutlined,
  PrinterOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import QuotationList from "../../../../components/QuotationTable/QuotationList";
import QuotationDetail from "../../../../components/QuotationTable/QuotationDetail";
import { FormattedMessage } from "react-intl";
import { GetQuotation } from "@/services/apiServices";
import { useParams } from "react-router-dom";

export default function QuotationViewPage() {
  const { eventId } = useParams();

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [quotationId, setQuotationId] = useState(null);

  useEffect(() => {
    if (eventId) {
      FetchQuotation(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    if (selectedEventId) {
      FetchQuotation(selectedEventId);
    }
  }, [selectedEventId]);

  const FetchQuotation = async (eventId) => {
    try {
      const response = await GetQuotation(eventId, 0);

      setQuotationId(response);
    } catch (error) {
      console.error("Error fetching quotation:", error);
    }
  };

  return (
    <>
      <div className="gap-2 mb-3 pl-4 sm:pl-8">
        <h2 className="text-xl sm:text-2xl font-medium text-black">
          <FormattedMessage id="QUOTATION.TITLE" defaultMessage="Quotation" />
        </h2>
      </div>
      <div className="p-2 sm:p-4 flex flex-col lg:flex-row gap-4 overflow-hidden">
        <div className="w-full lg:w-auto lg:flex-shrink-0 overflow-x-auto lg:overflow-x-visible">
          <QuotationList onEventSelect={setSelectedEventId} />
        </div>

        <div className="w-[470px] lg:flex-1 min-w-0">
          <QuotationDetail Eventid={selectedEventId} />
        </div>
      </div>
    </>
  );
}
