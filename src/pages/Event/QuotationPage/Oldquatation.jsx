import React, { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { toAbsoluteUrl } from "@/utils/Assets";
import { KeenIcon } from "@/components";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import useStyles from "./style";
import { Tooltip } from "antd";
import { useParams } from "react-router-dom";
import { GetQuotation } from "@/services/apiServices";
const QuotationPage = () => {
  const { eventId } = useParams();
  const classes = useStyles();

  // Static Data
  const [quotationData, setQuotationData] = useState({
    eventName: "Wedding Reception",
    partyName: "Kiran Bhandari",
    venueName: "Bhacantha Resort",
    estimateDate: "04 August 2025",
    functions: [
      {
        id: 1,
        name: "",
        date: "",
        persons: "",
        extra: "",
        rate: "",
        totalPrice: "",
      },
    ],
    summaryItems: [
      { label: "Haldi Carnival Total", amount: "15,000.00" },
      { label: "Mayra Groom Side", amount: "25,000.00" },
      { label: "Wedding Reception Total", amount: "60,000.00" },
    ],
    taxDetails: [
      { label: "Discount", percentage: "10", amount: "10,000.00" },
      { label: "CGST", percentage: "9", amount: "8,100.00" },
      { label: "SGST", percentage: "9", amount: "8,100.00" },
    ],
    grandTotal: "1,06,200.00",
    payments: [
      {
        label: "Advance Payment 1",
        amount: "20,000.00",
        description: "Paid Via UPI ON 23th June, 2025. Confirmed",
      },
      {
        label: "Advance Payment 2",
        amount: "30,000.00",
        description: "Paid Via UPI ON 23th June, 2025. Confirmed",
      },
    ],
    totalPaid: "50,000.00",
    remainingPayment: "56,200.00",
    notes: "",
  });

  useEffect(() => {
    FetchGetQuotation();
  }, []);

  const FetchGetQuotation = () => {
    GetQuotation(eventId, 0)
      .then((res) => {})
      .catch((error) => {
        console.log(error);
      });
  };
  const handleAddFunction = () => {
    setQuotationData((prev) => ({
      ...prev,
      functions: [
        ...prev.functions,
        {
          id: Date.now(),
          name: "",
          date: "",
          persons: "",
          extra: "",
          rate: "",
          totalPrice: "",
        },
      ],
    }));
  };

  const handleDeleteFunction = (index) => {
    if (index === 0) return;
    setQuotationData((prev) => ({
      ...prev,
      functions: prev.functions.filter((_, idx) => idx !== index),
    }));
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setQuotationData((prev) => ({ ...prev, notes: value }));
  };

  const handleSaveNotes = () => {};

  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>

      <Container>
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Quotation" }]} />
        </div>

        {/* Event Details */}
        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-wrap items-center justify-between p-4 gap-3">
            <div className="flex flex-col gap-2.5">
              <p className="text-lg font-semibold text-gray-900">
                Event Name: {quotationData.eventName}
              </p>
              <div className="flex items-center gap-7">
                <div className="flex items-center gap-3">
                  <i className="ki-filled ki-user text-success"></i>
                  <div className="flex flex-col">
                    <span className="text-xs">Party name:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quotationData.partyName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ki-filled ki-geolocation-home text-success"></i>
                  <div className="flex flex-col">
                    <span className="text-xs">Venue name:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quotationData.venueName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="ki-filled ki-calendar-tick text-success"></i>
                  <div className="flex flex-col">
                    <span className="text-xs">Estimate Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quotationData.estimateDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-end gap-2">
              <button className="btn btn-sm btn-primary" title="Print">
                <i className="ki-filled ki-printer"></i> Print
              </button>
              <button className="btn btn-sm btn-primary" title="Share">
                <i className="ki-filled ki-exit-right-corner"></i> Share
              </button>
            </div>
          </div>
        </div>

        {/* Functions */}
        <div className="card min-w-full mb-9">
          <div className="flex flex-col flex-1">
            <div className="rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
              <div className="flex flex-wrap justify-between items-center gap-5 p-4 relative">
                <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-6"></i>
                <input
                  className="input pl-8 w-[300px]"
                  placeholder="Search function"
                  type="text"
                />
                <button
                  className="btn btn-sm btn-primary"
                  title="Add Function"
                  onClick={handleAddFunction}
                >
                  <i className="ki-filled ki-plus"></i> Add Function
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center bg-gray-100 font-bold border-y border-gray-200 py-3 px-2">
                <div className="text-sm font-semibold text-gray-900 px-2 w-[80px]">
                  No.
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[220px]">
                  Function
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[220px]">
                  Date
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[170px]">
                  Person
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[170px]">
                  Extra
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[170px]">
                  Rate
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 w-[170px]">
                  Total Price
                </div>
                <div className="text-sm font-semibold text-gray-900 px-2 text-center flex-auto">
                  Action
                </div>
              </div>

              {quotationData.functions.map((fn, index) => (
                <div
                  key={fn.id}
                  className="flex items-center border-b border-gray-200 py-3 px-2"
                >
                  <div className="text-sm font-medium text-gray-700 px-2 w-[80px]">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[220px]">
                    <input
                      className="input"
                      value={fn.name}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].name = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Function"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[220px]">
                    <input
                      className="input"
                      value={fn.date}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].date = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Date"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[170px]">
                    <input
                      className="input"
                      value={fn.persons}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].persons = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Pax"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[170px]">
                    <input
                      className="input"
                      value={fn.extra}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].extra = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Extra"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[170px]">
                    <input
                      className="input"
                      value={fn.rate}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].rate = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Rate"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-[170px]">
                    <input
                      className="input"
                      value={fn.totalPrice}
                      onChange={(e) => {
                        const newFunctions = [...quotationData.functions];
                        newFunctions[index].totalPrice = e.target.value;
                        setQuotationData((prev) => ({
                          ...prev,
                          functions: newFunctions,
                        }));
                      }}
                      placeholder="Total Price"
                      type="text"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 px-2 w-auto text-center flex-auto">
                    <Tooltip
                      title={
                        index === 0
                          ? "Cannot delete first function"
                          : "Delete item"
                      }
                    >
                      <button
                        disabled={index === 0}
                        className={`btn btn-sm btn-icon btn-clear btn-danger ${index === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => handleDeleteFunction(index)}
                      >
                        <KeenIcon icon="trash" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              ))}

              <div className="relative py-4">
                <div className="absolute left-0 right-0 -bottom-4 text-center">
                  <button
                    className="btn btn-sm btn-success rounded-full"
                    title="Add Item"
                    onClick={handleAddFunction}
                  >
                    <i className="ki-filled ki-plus"></i> Add Function
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estimate Summary */}
        <div className="card min-w-full mb-7">
          <div className="flex flex-col flex-1">
            <div className="rtl:[background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
              <h3 className="text-lg font-semibold leading-none text-gray-900 p-4">
                Estimate Summary
              </h3>
            </div>

            <div className="flex flex-col w-full">
              {quotationData.summaryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-t border-gray-200 py-3 px-2"
                >
                  <div className="text-base font-normal text-gray-700 px-2">
                    {item.label}
                  </div>
                  <div className="text-base font-semibold text-gray-900 px-2">
                    &#8377; {item.amount}
                  </div>
                </div>
              ))}

              <div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 font-bold p-4">
                {quotationData.taxDetails.map((tax, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="text-base font-normal text-gray-700">
                      {tax.label}{" "}
                      <span className="ms-1 text-sm text-gray-500">
                        ({tax.percentage}%)
                      </span>
                    </div>
                    <div className="input text-base text-gray-900 w-[140px]">
                      <span className="text-base font-semibold text-gray-900">
                        &#8377;
                      </span>
                      <input
                        className="h-full text-gray-900 w-full"
                        value={tax.amount}
                        type="text"
                        onChange={(e) => {
                          const newTaxDetails = [...quotationData.taxDetails];
                          newTaxDetails[idx].amount = e.target.value;
                          setQuotationData((prev) => ({
                            ...prev,
                            taxDetails: newTaxDetails,
                          }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-5 px-2">
                <div className="text-xl font-bold text-primary px-2">
                  Grand Total
                </div>
                <div className="text-lg font-bold text-primary px-2">
                  &#8377; {quotationData.grandTotal}
                </div>
              </div>

              <div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 p-4">
                <div className="text-base font-semibold text-gray-900 pb-2">
                  Payment Details
                </div>

                {quotationData.payments.map((payment, idx) => (
                  <div key={idx} className="flex gap-5 py-1">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success mt-1">
                      <i className="ki-filled ki-check text-white"></i>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-normal text-gray-700">
                          {payment.label}
                        </div>
                        <div className="input text-base text-gray-900 w-[140px]">
                          <span className="text-base font-semibold text-gray-900">
                            &#8377;
                          </span>
                          <input
                            className="h-full text-gray-900 w-full border border-gray-200 rounded "
                            value={payment.amount}
                            type="text"
                            onChange={(e) => {
                              const newPayments = [...quotationData.payments];
                              newPayments[idx].amount = e.target.value;
                              setQuotationData((prev) => ({
                                ...prev,
                                payments: newPayments,
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <span className="bg-white py-3 px-5 rounded-lg text-xs font-normal text-gray-700 border border-gray-200">
                        {payment.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-5 px-2">
                <div className="text-lg font-bold text-success px-2">
                  Total Paid
                </div>
                <div className="text-base font-bold text-success px-2">
                  &#8377; {quotationData.totalPaid}
                </div>
              </div>

              <div className="flex items-center justify-between border-y border-orange-100 border-dashed bg-orange-50 py-7 px-2">
                <div className="text-xl font-bold text-orange-700 px-2">
                  <i className="ki-filled ki-notification-on"></i> Remaining
                  Payment
                </div>
                <div className="text-lg font-bold text-orange-700 px-2">
                  &#8377; {quotationData.remainingPayment}
                </div>
              </div>

              <div className="flex items-center justify-between font-bold py-5 px-4">
                <input
                  className="input  w-[500px] "
                  placeholder="Add notes"
                  value={quotationData.notes}
                  onChange={handleNotesChange}
                  type="text"
                />
                <button
                  className="btn btn-success"
                  title="Save"
                  onClick={handleSaveNotes}
                >
                  <i className="ki-filled ki-save-2"></i> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default QuotationPage;
