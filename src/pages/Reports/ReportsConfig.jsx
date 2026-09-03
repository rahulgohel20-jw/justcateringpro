"use client";
import { Fragment, useState } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Container } from "@/components/container";

const ReportsConfig = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Same reports for all tabs
  const reportsList = [
    "Custom Menu Report",
    "Simple Menu Report",
    "Exclusive Menu Report",
    "Slogan Menu Report",
    "Premium Image Menu Report",
    "Image Report With Menu",
    "Image And Slogan Menu Report",
    "Image Menu Category Report",
    "Two Language Menu Report",
    "Manager Menu Report",
    "Instruction Menu Report",
  ];

  const tableHeaders = [
    { label: "Report Header", type: "checkbox" },
    { label: "Logo", type: "checkbox" },
    { label: "Company Name", type: "checkbox" },
    { label: "Company Address", type: "checkbox" },
    { label: "Company Mobile Number", type: "checkbox" },
    { label: "Company Email", type: "checkbox" },
    { label: "Event Name", type: "checkbox" },
    { label: "Event Date", type: "checkbox" },
    { label: "Event Venue", type: "checkbox" },
    { label: "Extra Left Margin In Report (0px to 50px)", type: "number" },
    { label: "Adjust Logo Size (-20px to 20px)", type: "number" },
    { label: "Font Name", type: "dropdown" },
    { label: "Report Title Font Size", type: "number" },
    { label: "Company Details Font Size", type: "number" },
    { label: "Client Details Font Size", type: "number" },
    { label: "Agent Date Format", type: "number" },
  ];

  const tabs = [
    "Menu Preparation",
    "Menu Allocation",
    "Raw Material Allocation Report",
    "Chef Labour Wise Raw Material Allocation Report",
    "Labour & Agency",
    "General Fix and Crockery Allocation",
    "Admin Hub",
    "Order Report",
  ];

  // Font options for dropdown
  const fontOptions = [
    "Arial Unicode",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
    "Calibri",
  ];

  // Store selections separately for each tab
  const [tabSelections, setTabSelections] = useState({
    0: {}, // Menu Preparation
    1: {}, // Menu Allocation
    2: {}, // Raw Material Allocation Report
    3: {}, // Chef Labour Wise Raw Material Allocation Report
    4: {}, // Labour & Agency
    5: {}, // General Fix and Crockery Allocation
    6: {}, // Admin Hub
    7: {}, // Order Report
  });

  const handleCheckboxChange = (report, header) => {
    setTabSelections((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [report]: {
          ...prev[activeTab]?.[report],
          [header]: !prev[activeTab]?.[report]?.[header],
        },
      },
    }));
  };

  const handleInputChange = (report, header, value) => {
    setTabSelections((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [report]: {
          ...prev[activeTab]?.[report],
          [header]: value,
        },
      },
    }));
  };

  // Handle master checkbox - select/deselect all checkboxes in the table
  const handleMasterCheckboxChange = () => {
    const currentSelections = tabSelections[activeTab] || {};

    // Only check checkbox columns
    const checkboxHeaders = tableHeaders.filter((h) => h.type === "checkbox");

    // Check if all checkboxes are currently checked
    const allChecked = reportsList.every((report) =>
      checkboxHeaders.every(
        (header) => currentSelections[report]?.[header.label],
      ),
    );

    // Toggle all checkboxes
    const newSelections = {};
    reportsList.forEach((report) => {
      newSelections[report] = { ...currentSelections[report] };
      checkboxHeaders.forEach((header) => {
        newSelections[report][header.label] = !allChecked;
      });
    });

    setTabSelections((prev) => ({
      ...prev,
      [activeTab]: newSelections,
    }));
  };

  // Check if all checkboxes in the table are checked
  const isMasterChecked = () => {
    const currentSelections = tabSelections[activeTab] || {};
    const checkboxHeaders = tableHeaders.filter((h) => h.type === "checkbox");

    return reportsList.every((report) =>
      checkboxHeaders.every(
        (header) => currentSelections[report]?.[header.label],
      ),
    );
  };

  // Check if some but not all checkboxes are checked (for indeterminate state)
  const isMasterIndeterminate = () => {
    const currentSelections = tabSelections[activeTab] || {};
    const checkboxHeaders = tableHeaders.filter((h) => h.type === "checkbox");

    let checkedCount = 0;
    let totalCount = reportsList.length * checkboxHeaders.length;

    reportsList.forEach((report) => {
      checkboxHeaders.forEach((header) => {
        if (currentSelections[report]?.[header.label]) {
          checkedCount++;
        }
      });
    });

    return checkedCount > 0 && checkedCount < totalCount;
  };

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const currentSelections = tabSelections[activeTab] || {};

  return (
    <Fragment>
      <Container>
        <div className="w-full pb-2 mb-3 px-0">
          <Breadcrumbs items={[{ title: "Report Configuration" }]} />
        </div>

        {/* Report Category Section */}
        <div className="mb-6">
          {/* Tab Navigation */}
          <div
            className="tab-scroll-container relative overflow-hidden"
            onWheel={(e) => {
              const container = e.currentTarget.querySelector(".tab-scroll");
              if (container && container.scrollWidth > container.clientWidth) {
                e.preventDefault();
                e.stopPropagation();
                container.scrollLeft += e.deltaY;
              }
            }}
          >
            <div className="tab-scroll flex flex-nowrap overflow-x-auto bg-white scroll-smooth border border-gray-200 rounded-lg shadow-sm touch-pan-x">
              {" "}
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`flex-shrink-0 px-4 py-3 text-sm whitespace-nowrap transition-colors font-bold border-r border-gray-200 last:border-r-0 ${
                    index === activeTab
                      ? "text-[#005BA8] bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  } ${index === 0 ? "rounded-l-lg" : ""} ${
                    index === tabs.length - 1 ? "rounded-r-lg" : ""
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div
          className="table-scroll-container relative overflow-hidden"
          onWheel={(e) => {
            const container = e.currentTarget.querySelector(".table-scroll");
            if (container && container.scrollWidth > container.clientWidth) {
              e.preventDefault();
              e.stopPropagation();
              container.scrollLeft += e.deltaY;
            }
          }}
        >
          <div className="table-scroll overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm scroll-smooth">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left font-normal text-gray-700 border-b border-gray-200 min-w-[160px] sm:min-w-[200px]">
                    <input
                      type="checkbox"
                      checked={isMasterChecked()}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = isMasterIndeterminate();
                        }
                      }}
                      onChange={handleMasterCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  {tableHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className="p-3 text-center font-normal text-gray-700 border-b border-gray-200 min-w-[180px]"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportsList.map((report, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="p-3 font-normal text-gray-800 border-b border-gray-100 min-w-[160px] sm:min-w-[200px] sticky left-0 bg-inherit z-10">
                      {report}
                    </td>
                    {tableHeaders.map((header, idx) => (
                      <td
                        key={idx}
                        className="p-3 text-center border-b border-gray-100"
                      >
                        <div className="flex justify-center">
                          {header.type === "checkbox" && (
                            <input
                              type="checkbox"
                              checked={
                                !!currentSelections[report]?.[header.label]
                              }
                              onChange={() =>
                                handleCheckboxChange(report, header.label)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          )}
                          {header.type === "number" && (
                            <input
                              type="tel"
                              value={
                                currentSelections[report]?.[header.label] || 0
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  report,
                                  header.label,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          )}
                          {header.type === "dropdown" && (
                            <select
                              value={
                                currentSelections[report]?.[header.label] ||
                                "Arial Unicode"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  report,
                                  header.label,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer"
                            >
                              {fontOptions.map((font) => (
                                <option key={font} value={font}>
                                  {font}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <button
            onClick={() => {
              // Reset current tab selections
              setTabSelections((prev) => ({
                ...prev,
                [activeTab]: {},
              }));
            }}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg w-full sm:w-auto hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle save logic here

              alert("Configuration saved successfully!");
            }}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#005BA8] rounded-lg w-full sm:w-auto border border-transparent rounded-lg hover:bg-[#005BA8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Save
          </button>
        </div>

        <style jsx>{`
          .tab-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .tab-scroll::-webkit-scrollbar {
            display: none;
          }
          .table-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .table-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </Container>
    </Fragment>
  );
};

export default ReportsConfig;
