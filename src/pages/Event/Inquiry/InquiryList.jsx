import { Fragment, useEffect, useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import { Tooltip, Spin } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { GetAllInquiry, DeleteInquiry } from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import AddInquiryForm from "./AddInquiry";

const InquiryList = () => {
  const [loading, setLoading] = useState(false);
  const permissions = usePermission("Inquiry");
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [allTableData, setAllTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState(null);

  // Default filter window — adjust to whatever range makes sense for your data
  const [startDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
  });
  const [endDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  });

  const userId = localStorage.getItem("userId");

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const FetchInquiry = async () => {
    setLoading(true);
    try {
      const res = await GetAllInquiry(userId, formatDate(endDate), formatDate(startDate));
      const list = res?.data?.data || res?.data?.Inquiry || [];
      const finalList = Array.isArray(list) ? list : [];

      const formatted = finalList.map((item, index) => ({
        sr_no: index + 1,
        id: item.id,
        guestName: item.guestName || "-",
        mobileNo: item.mobileNo || "-",
        emailId: item.emailId || "-",
        function: item.function || "-",
        inquiryDate: item.inquiryDate || "-",
        tentativeDate: item.tentativeDate || "-",
        referralSource: item.referralSource || "-",
        guestAddress: item.guestAddress || "-",
        actions: (
          <div className="flex items-center gap-2">
            {permissions.edit && (
              <Tooltip title="Edit">
                <button
                  type="button"
                  onClick={() => openEditForm(item)}
                  className="text-primary hover:text-primary/70 transition-colors"
                >
                  <Edit size={15} />
                </button>
              </Tooltip>
            )}
            {permissions.delete && (
              <Tooltip title="Delete">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </Tooltip>
            )}
          </div>
        ),
      }));

      setAllTableData(formatted);
      setTableData(formatted);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setAllTableData([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchInquiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);

    const filtered = allTableData.filter(
      (row) =>
        (row.guestName || "").toUpperCase().includes(value) ||
        (row.mobileNo || "").toUpperCase().includes(value) ||
        (row.emailId || "").toUpperCase().includes(value) ||
        (row.function || "").toUpperCase().includes(value) ||
        (row.referralSource || "").toUpperCase().includes(value),
    );

    setTableData(filtered);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.INQUIRY.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.INQUIRY.DELETE_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.INQUIRY.DELETE_BTN",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.INQUIRY.CANCEL_BTN",
        defaultMessage: "Cancel",
      }),
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteInquiry(id, userId)
          .then((response) => {
            if (response?.data?.success !== false) {
              FetchInquiry();
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.INQUIRY.DELETED_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.INQUIRY.DELETED_TEXT",
                  defaultMessage: "Inquiry has been removed successfully.",
                }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.data?.msg || "API call failed");
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: "error",
              title:
                error?.response?.data?.msg ||
                intl.formatMessage({
                  id: "USER.INQUIRY.SOMETHING_WRONG",
                  defaultMessage: "Something went wrong",
                }),
            });
            console.error("Error deleting inquiry:", error);
          });
      }
    });
  };

  const openAddForm = () => {
    setEditingInquiry(null);
    setShowForm(true);
  };

  const openEditForm = (row) => {
    setEditingInquiry(row);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInquiry(null);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    setEditingInquiry(null);
    FetchInquiry();
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: intl.formatMessage({
                  id: "USER.INQUIRY.PAGE_TITLE",
                  defaultMessage: "Inquiry",
                }),
              },
            ]}
          />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH",
                  defaultMessage: "Search...",
                })}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary" title="Add Inquiry" onClick={openAddForm}>
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage id="USER.INQUIRY.ADD_BTN" defaultMessage="Add Inquiry" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body text-center py-8">
              <Spin size="large" />
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
<TableComponent
  columns={columns(permissions)}
  data={tableData}
  paginationSize={10}
/>        )}
      </Container>

      {showForm && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
            onClick={handleFormClose}
          />
          <div
            className="fixed top-1/2 left-1/2 z-[60] bg-white rounded-2xl no-scrollbar"
            style={{
              transform: "translate(-50%,-50%)",
              width: "min(560px,95vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 32px 64px rgba(0,0,0,.18)",
            }}
          >
            <div className="flex items-center justify-between bg-primary px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <p className="text-white font-bold text-base">
                {editingInquiry ? (
                  <FormattedMessage id="USER.INQUIRY.EDIT_TITLE" defaultMessage="Edit Inquiry" />
                ) : (
                  <FormattedMessage id="USER.INQUIRY.ADD_TITLE" defaultMessage="Add Inquiry" />
                )}
              </p>
              <button
                onClick={handleFormClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <AddInquiryForm
                userId={userId}
                editingInquiry={editingInquiry}
                onCancel={handleFormClose}
                onSaved={handleFormSaved}
              />
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
};

export default InquiryList;