import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Getallquotationfunction,
  DeleteQuotationFunction,
} from "@/services/apiServices";
import AddQuotationFunction from "./AddQuotationFunction";
import Swal from "sweetalert2";

const QuotationFunction = () => {
  const intl = useIntl();
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchfunction = async () => {
    try {
      let userId = localStorage.getItem("userId");
      const response = await Getallquotationfunction(userId);

      const formateddata = response.data.data.ExtraQuotationFunctions.map(
        (item, index) => ({
          sr_no: index + 1,
          name: item.name,
          id: item.id,
          nameGujarati: item.nameGujarati,
          nameHindi: item.nameHindi,
          price: item.price,
        }),
      );
      setTableData(formateddata);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchfunction();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: intl.formatMessage({
        id: "COMMON.ARE_YOU_SURE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "COMMON.CANNOT_REVERT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "COMMON.YES_DELETE_IT",
        defaultMessage: "Yes, delete it!",
      }),
    });

    if (result.isConfirmed) {
      try {
        await DeleteQuotationFunction(id);

        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.DELETED",
            defaultMessage: "Deleted!",
          }),
          text: intl.formatMessage({
            id: "COMMON.RECORD_DELETED",
            defaultMessage: "Your record has been deleted.",
          }),
          icon: "success",
        });

        fetchfunction();
      } catch (error) {
        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.ERROR",
            defaultMessage: "Error!",
          }),
          text: intl.formatMessage({
            id: "COMMON.SOMETHING_WENT_WRONG",
            defaultMessage: "Something went wrong.",
          }),
          icon: "error",
        });
        console.error(error);
      }
    }
  };

  const handleEdit = (rowData) => {
    setSelectedEvent(rowData);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gpb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MEALSIDEBAR_TYPE"
              defaultMessage="Quotation Function"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2 `}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "QUOTATION_FUNCTION.SEARCH_FUNCTIONS",
                  defaultMessage: "Search Functions",
                })}
                type="text"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsModalOpen(true);
                setSelectedEvent(null);
              }}
            >
              <i className="ki-filled ki-plus"></i>
              <FormattedMessage
                id="USER.MASTER.ADD_CONTACT_CATEGORY"
                defaultMessage="Create New "
              />
            </button>
          </div>
        </div>

        <AddQuotationFunction
          isModalOpen={isModalOpen}
          setIsModalOpen={closeModal}
          refreshData={fetchfunction}
          selectedEvent={selectedEvent}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleDelete, handleEdit)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default QuotationFunction;