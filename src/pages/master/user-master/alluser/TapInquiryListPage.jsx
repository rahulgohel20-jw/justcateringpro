  import { useEffect, useState } from "react";
  import { message } from "antd";
  import { getAllInquiryfortapregister } from "@/services/apiServices";
  import { TableComponent } from "@/components/table/TableComponent";

  const TapInquiryListPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const res = await getAllInquiryfortapregister();
        setData(res?.data?.data ?? []);
      } catch (error) {
        message.error("Failed to fetch inquiries");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchInquiries();
    }, []);

    const columns = [
       {
    id: "srNo",
    header: "Sr. No",
    cell: ({ row }) => row.index + 1,
  },
      {
        id: "companyName",
        accessorKey: "companyName",
        header: "Company Name",
      },
      {
        id: "contactNo",
        accessorKey: "contactNo",
        header: "Contact No",
        cell: ({ row }) =>
          `${row.original.countryCode ?? ""} ${row.original.contactNo ?? ""}`.trim(),
      },
      {
        id: "functionName",
        accessorKey: "functionName",
        header: "Function Name",
      },
      {
        id: "location",
        accessorKey: "cityName",
        header: "Location",
        cell: ({ row }) =>
          `${row.original.cityName ?? ""}, ${row.original.stateName ?? ""}`,
      },
      {
        id: "eventDate",
        accessorKey: "eventDate",
        header: "Event Date",
        cell: ({ getValue }) => {
          const val = getValue();
          return val ? new Date(val).toLocaleDateString() : "-";
        },
      },
      {
        id: "eventTime",
        accessorKey: "eventTime",
        header: "Event Time",
      },
      {
        id: "timeSlot",
        accessorKey: "timeSlot",
        header: "Time Slot",
      },
      {
        id: "estimatedBudget",
        accessorKey: "estimatedBudget",
        header: "Est. Budget",
      },
      {
        id: "totalTab",
        accessorKey: "totalTab",
        header: "Total Tab",
      },
      {
        id: "venueAddress",
        accessorKey: "venueAddress",
        header: "Venue Address",
      },
    ];

    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tap Inquiries</h2>
        </div>

        <TableComponent
          columns={columns}
          data={data}
          defaultSorting={{ field: "eventDate", order: "descend" }}
          toolbar={true}
          loading={loading}
        />
      </div>
    );
  };

  export default TapInquiryListPage;