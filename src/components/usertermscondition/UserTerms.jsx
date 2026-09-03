import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import { GetAllTermsCondition, DeleteTerms } from "@/services/apiServices";
import AddUserTerms from "./AddUserTerms";
import Swal from "sweetalert2";
import { getLocalizedName } from "@/utils/langConfig";

const UserTerms = () => {
  const intl = useIntl();
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const fetchTermsCondition = async () => {
    try {
      let userId = localStorage.getItem("userId");
      const response = await GetAllTermsCondition(userId);

      const formateddata = response.data.data.TermsAndConditions.map(
        (item, index) => ({
          sr_no: index + 1,
          name: getLocalizedName(item, intl.locale),
          id: item.id,
          nameEnglish: item.nameEnglish,
          nameGujarati: item.nameGujarati,
          nameHindi: item.nameHindi,
          description: item.features,
          isActive: item.isActive,
        }),
      );
      setTableData(formateddata);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchTermsCondition();
  }, [intl.locale]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: intl.formatMessage({ id: "COMMON.CONFIRM_TITLE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage({ id: "USER_TERMS.DELETE_CONFIRM_TEXT", defaultMessage: "You won't be able to revert this!" }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({ id: "CAPTAIN_RECIPE.YES_DELETE", defaultMessage: "Yes, delete it!" }),
    });

    if (result.isConfirmed) {
      try {
        const res = await DeleteTerms(id);
        if (res.data.success === true) {
          Swal.fire({
            title: intl.formatMessage({ id: "CAPTAIN_RECIPE.DELETED_TITLE", defaultMessage: "Deleted!" }),
            text: intl.formatMessage({ id: "USER_TERMS.DELETE_SUCCESS_TEXT", defaultMessage: "Your record has been deleted." }),
            icon: "success",
          });
          fetchTermsCondition();
        } else {
          Swal.fire({
            title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
            text: intl.formatMessage({ id: "COMMON.SOMETHING_WENT_WRONG", defaultMessage: "Something went wrong." }),
            icon: "error",
          });
          console.error(error);
        }
      } catch (error) {
        Swal.fire({
          title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
          text: intl.formatMessage({ id: "COMMON.SOMETHING_WENT_WRONG", defaultMessage: "Something went wrong." }),
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
              id="USER_TERMS.PAGE_TITLE"
              defaultMessage="User Terms & Conditions"
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
                placeholder={intl.formatMessage({ id: "COMMON.SEARCH", defaultMessage: "Search" })}
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
                id="COMMON.CREATE_NEW"
                defaultMessage="Create New "
              />
            </button>
          </div>
        </div>

        <AddUserTerms
          isModalOpen={isModalOpen}
          setIsModalOpen={closeModal}
          refreshData={fetchTermsCondition}
          selectedEvent={selectedEvent}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleDelete, handleEdit, intl)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default UserTerms;