// "use client";
// import { Fragment, useState } from "react";
// import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
// import { Container } from "@/components/container";
// import { DatePicker, Select, Button } from "antd";
// import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";

// const DateWiseReport = () => {
//   const [activeIndex, setActiveIndex] = useState(0);

//   const handleAccordionClick = (index) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   const reports = [
//     { title: "Date Wise Outside Agency Report" },
//     { title: "Date Wise Chef Labour Report" },
//     { title: "Date Wise Labour Report" },
//     { title: "Date Wise Raw Material Supplier Report" },
//     { title: "Date Wise Menu Item Report" },
//     { title: "Date Wise Order Booking Report" },
//   ];

//   const renderReportForm = () => (
//     <div>
//       {/* Form Fields */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {/* Start Date */}
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">
//             Start Date<span className="text-red-500">*</span>
//           </label>
//           <DatePicker className="w-full rounded-lg h-10" />
//         </div>

//         {/* End Date */}
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">
//             End Date<span className="text-red-500">*</span>
//           </label>
//           <DatePicker className="w-full rounded-lg h-10" />
//         </div>

//         {/* Contact Name */}
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">Contact Name</label>
//           <Select
//             className="w-full h-10"
//             defaultValue="All"
//             options={[{ value: "All", label: "All" }]}
//           />
//         </div>

//         {/* Menu Item Category */}
//         <div className="flex flex-col">
//           <label className="text-sm text-gray-600 mb-1">
//             Menu Item Category
//           </label>
//           <Select
//             className="w-full h-10"
//             defaultValue="All"
//             options={[{ value: "All", label: "All" }]}
//           />
//         </div>

//         {/* Status */}
//         <div className="flex flex-col md:col-span-2 lg:col-span-1">
//           <label className="text-sm text-gray-600 mb-1">Status</label>
//           <Select
//             className="w-full h-10"
//             defaultValue="All"
//             options={[{ value: "All", label: "All" }]}
//           />
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex items-center justify-end gap-3 mt-6">
//         <Button
//           type="primary"
//           className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 px-6 font-semibold"
//         >
//           Generate Report
//         </Button>
//       </div>
//     </div>
//   );

//   return (
//     <Fragment>
//       <Container>
//         {/* Breadcrumbs */}
//         <div className="gap-2 pb-2 mb-3">
//           <Breadcrumbs items={[{ title: "Date Wise Reports " }]} />
//         </div>

//         {/* Accordion Section */}
//         <div className="flex flex-col space-y-3">
//           {reports.map((report, index) => (
//             <div
//               key={index}
//               className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden"
//             >
//               {/* Header */}
//               <button
//                 onClick={() => handleAccordionClick(index)}
//                 className="w-full flex justify-between items-center px-5 py-4 text-[15px] font-semibold text-gray-800 hover:bg-gray-50 transition-all"
//               >
//                 {report.title}
//                 <span className="text-gray-500">
//                   {activeIndex === index ? "▾" : "▸"}
//                 </span>
//               </button>

//               {/* Content */}
//               {activeIndex === index && (
//                 <div className="px-6 pb-6 pt-2 border-t border-gray-100">
//                   {renderReportForm()}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </Container>
//     </Fragment>
//   );
// };

// export default DateWiseReport;
