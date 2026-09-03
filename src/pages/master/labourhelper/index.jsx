import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  getalllabourhelperbyuserid,
  GetAllContactCategory,
  deletelabourhelperbyid
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddLabourhelper from "../../../partials/modals/add-labour-helper/AddLabourhelper";

const Labourhelper = () => {
  const permissions = usePermission("Guest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = localStorage.getItem("userId");

 const FetchLabourHelper = () => {
  getalllabourhelperbyuserid(Id)
    .then((res) => {
      const list = res?.data?.data?.["Labor Helper Details"] || [];
      setOriginalData(list);
    })
    .catch((error) => {
      console.error("Error fetching labour helper:", error);
      setOriginalData([]);
    });
};

  const FetchConatctCategory = () => {
    GetAllContactCategory(Id)
      .then((res) => {
        const list = res.data.data["Contact Category Details"] || [];
        setCategoryList(list);
      })
      .catch((error) => console.error("Error fetching:", error));
  };

  useEffect(() => {
    FetchLabourHelper();
    FetchConatctCategory();
  }, []);

  // Map + client-side search
 useEffect(() => {
  let list = originalData.map((item, index) => ({
    sr_no: index + 1,
    id: item.id,
    name: item.name || "-",
    phonenumber: item.phonenumber || "-",
    pancard: item.pancard || "-",
    aadharcard: item.aadharcard || "-",
    category: item.contactCategoryName || "-",
    contactCategoryId: item.contactCategoryId,
    partyId: item.partyId,
    partyName: item.partyName || "-",
    photo: item.photo,
    drivinglicense: item.drivinglicense,
    aadharcarddocpathfront: item.aadharcarddocpathfront,
    aadharcarddocpathback: item.aadharcarddocpathback,
    pancarddocpath: item.pancarddocpath,
    _originalItem: item,
  }));

  if (searchQuery.trim()) {
    const term = searchQuery.toLowerCase();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.phonenumber.toLowerCase().includes(term) ||
        (item.aadharcard || "").toLowerCase().includes(term) ||
        item.pancard.toLowerCase().includes(term),
    );
  }

  setTableData(list);
}, [originalData, searchQuery]);
 
const handleDelete = (id) => {
    Swal.fire({
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
    }).then((result) => {
      if (result.isConfirmed) {
        deletelabourhelperbyid(id)
          .then((res) => {
            if (res?.data?.success !== false) {
              Swal.fire({
                title: "Deleted!",
                text: res?.data?.msg || "Labour helper has been deleted.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
              FetchLabourHelper();
            } else {
              Swal.fire("Error", res?.data?.msg || "Delete failed", "error");
            }
          })
          .catch((error) => {
            console.error("Error deleting labour helper:", error);
            Swal.fire(
              "Error",
              error?.response?.data?.msg || "Something went wrong",
              "error",
            );
          });
      }
    });
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.LABOUR_HELPER_MASTER"
              defaultMessage="Labour Helper"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_LABOUR_HELPER",
                  defaultMessage: "Search Labour Helper",
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
                onClick={() => {
                  setSelectedRow(null);
                  setIsModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddLabourhelper
          isOpen={isModalOpen}
          onClose={handleModalClose}
          refreshData={FetchLabourHelper}
          editData={selectedRow?._originalItem}
          categoryList={categoryList}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default Labourhelper;