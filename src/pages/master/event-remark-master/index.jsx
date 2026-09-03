import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { EVENT_REMARK_COLUMNS } from "./xonstant";
import EventRemarkModal from "../../../partials/modals/event-remark-modal/EventRemarkModal";
import { deleteeventremark, GetAllEventRemarks } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const EventRemark = () => {
  const permissions = usePermission("Event Remarks"); // adjust permission key if needed
  const userId = localStorage.getItem("userId");
  const intl = useIntl();

  const [data, setData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await GetAllEventRemarks("", userId);
      setData(res?.data?.data?.["EventRemarks Details"] || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 
  const filteredData = data.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.remark?.toLowerCase().includes(q) ||
      row.nameEnglish?.toLowerCase().includes(q)
    );
  });

  const handleAdd = () => {
    setSelectedRow(null);
    setOpenModal(true);
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_BUTTON",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.MASTER.CANCEL_BUTTON",
        defaultMessage: "Cancel",
      }),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteeventremark(id);
      Swal.fire({
        title: intl.formatMessage({
          id: "USER.MASTER.DELETE_SUCCESS_TITLE",
          defaultMessage: "Removed!",
        }),
        text: intl.formatMessage({
          id: "USER.MASTER.EVENT_TYPE_DELETE_SUCCESS",
          defaultMessage: "Event remark has been removed successfully.",
        }),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
      });
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  const columns = EVENT_REMARK_COLUMNS(handleEdit, handleDelete, permissions);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.EVENT_REMARK_MASTER"
              defaultMessage="Event Remark Master"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_EVENT_REMARK",
                  defaultMessage: "Search Event Remark",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                title={intl.formatMessage({
                  id: "USER.MASTER.ADD_EVENT_REMARK",
                  defaultMessage: "Add Event Remark",
                })}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <TableComponent
            columns={columns}
            data={filteredData}
            paginationSize={10}
          />
        )}

        {/* Modal */}
        <EventRemarkModal
          open={openModal}
          onClose={handleModalClose}
          editData={selectedRow}
          refreshData={fetchData}
        />
      </Container>
    </Fragment>
  );
};

export default EventRemark;
