import React, { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import useStyles from "./style";
import { PlusCircle } from "lucide-react";
import { Tooltip } from "antd";
import Oderdetail from "@/components/quotation/Oderdetail";
import ActionsSection from "@/components/quotation/ActionSection";
import FunctionSection from "@/components/quotation/FunctionSection/FunctionSection";
import Estimatesection from "@/components/quotation/estimate/Estimatesection";

const EstimatePage = () => {
  const classes = useStyles();

  const [form, setForm] = useState({
    customer_name: "AKSHAY BHAI PBN",
    mobile_number: "8000217871",
    event_type: "get to gather",
    event_date: "30/07/2025",
    venue: "LA GANESHA FARM, CANAL ROAD",
    amount_status: 2,
    tax: "",
    discount: 0,
    round_off: 0,
    grand_total: 0,
    advance: 0,
    remaining_amount: 0,
    note: "",
  });

  const [quotation, setQuotation] = useState([
    {
      name: "DINNER",
      date: "2025-07-30 18:00",
      person: 400,
      extra: 0,
      rate: 0,
      amount: 0,
    },
  ]);

  const handleInput = (index, field, value) => {
    let total_quotation = 0;
    setQuotation((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          let newItem = { ...item, [field]: value };
          let item_total =
            (Number(newItem.person) + Number(newItem.extra)) *
            Number(newItem.rate);
          total_quotation = Number(total_quotation) + Number(item_total);
          return { ...newItem, total: item_total };
        }
        total_quotation = Number(total_quotation) + Number(item.total);
        return item;
      })
    );

    setForm({ ...form, total: total_quotation });
  };

  const handleInputData = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const removequotation = (index) => {
    let newQuotation = quotation.filter((item, i) => i !== index);
    setQuotation(newQuotation);
  };

  const addQuotation = () => {
    setQuotation([
      ...quotation,
      {
        name: "",
        date: "",
        person: 0,
        extra: 0,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs items={[{ title: "Quotation" }]} />
        </div>
        {/* <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="card rtl:[background-position:top_center] [background-position:top_center] bg-no-repeat bg-[length:500px] bg-[url('/images/bg_01.png')] dark:bg-[url('/images/bg_01_dark.png')]">
            <div className="flex flex-col items-start p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                Pipeline for Personal Satisfaction
              </h3>
              <span className="text-gray-700 text-sm text-center text-center">
                Track goals, progress, and achievements for growth.
              </span>
            </div>
            <div className="card-content bg-white rounded-bl-xl rounded-br-xl dark:bg-dark border-t p-4 h-full">
              iuouiouioui
            </div>
          </div>
          <div className="card rtl:[background-position:top_center] [background-position:top_center] bg-no-repeat bg-[length:500px] bg-[url('/images/bg_01.png')] dark:bg-[url('/images/bg_01_dark.png')]">
            <div className="flex flex-col items-start p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                Pipeline for Personal Satisfaction
              </h3>
              <span className="text-gray-700 text-sm text-center text-center">
                Track goals, progress, and achievements for growth.
              </span>
            </div>
            <div className="card-content bg-white rounded-bl-xl rounded-br-xl dark:bg-dark border-t p-4 h-full">
              iuouiouioui
            </div>
          </div>
        </div> */}

        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="quotation-container">
            <Oderdetail />
            <div className="px-5 py-3 font-semibold text-gray-700 bg-gradient-to-b from-blue-100 to-blue-200 border-b border-gray-200"></div>
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700">
              Order Details
            </div>
            {/* Order Info */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="font-medium text-gray-600">
                  Customer Name:
                </span>{" "}
                <span className="text-gray-900">{form.customer_name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  Mobile Number:
                </span>{" "}
                <span className="text-gray-900">{form.mobile_number}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Event Type:</span>{" "}
                <span className="text-gray-900">{form.event_type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Event Date:</span>{" "}
                <span className="text-gray-900">{form.event_date}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">Venue:</span>{" "}
                <span className="text-gray-900">{form.venue}</span>
              </div>
            </div>

            {/* Action + Quotation */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
              <ActionsSection />
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700">
                Quotation
              </div>
              <FunctionSection />

              {/* Estimate Section */}
              <Estimatesection />

              {/* Notes + Save */}
              <div className="p-4 border-t border-gray-200 flex items-start justify-between gap-4">
                <div className="w-1/2">
                  <textarea
                    value={form.note}
                    placeholder="Note:"
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full border px-3 py-2 rounded input"
                    rows="3"
                  />
                </div>
                <div className="flex items-end">
                  <button className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 me-3">
                    <i className="ki-filled ki-copy-success"></i> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default EstimatePage;
