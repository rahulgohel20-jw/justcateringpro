import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import {
  GetAllAccountContactMaster,
  deleteAccountconstactMaster,
  GETbyidaccountcontactmaster,
} from "@/services/apiServices";
import AddAccountMaster from "../../../partials/modals/accountmaster/AddAccountMaster";
import { usePermission } from "../../../hooks/usePermission";

const Superaccountmaster = () => {
  const [open, setOpen] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
   const permissions = usePermission("Account Contact");

  const userId = JSON.parse(localStorage.getItem("userId"));

 const fetchData = async () => {
  try {
    const res = await GetAllAccountContactMaster(userId);

    const data = Array.isArray(res?.data?.data)
      ? res.data.data
      : [];

    setTableData(
      data.sort(
        (a, b) => b.accountContactId - a.accountContactId
      )
    );
  } catch (err) {
    console.error("Failed to fetch account contacts", err);
    setTableData([]);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (item) => {
    document.activeElement?.blur();

    try {
      const res = await GETbyidaccountcontactmaster(item.accountContactId);
     

      setSelectedBankDetails(res?.data?.data || item);
      setOpen(true);
    } catch {
      setSelectedBankDetails(item);
      setOpen(true);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete "${item.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteAccountconstactMaster(item.accountContactId);
        Swal.fire("Deleted!", "Record has been deleted.", "success");
        fetchData();
      } catch {
        Swal.fire("Error!", "Failed to delete.", "error");
      }
    }
  };

  const handleAddNew = () => {
    document.activeElement?.blur();
    setSelectedBankDetails(null);
    setOpen(true);
  };

  const filteredData = Array.isArray(tableData)
    ? tableData.filter((item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900 font-semibold">
         <h1 className="text-xl text-gray-900 font-semibold">
  <FormattedMessage
    id="BANK.ACCOUNT_CONTACT_MASTER"
    defaultMessage="Account Contact Master"
  />
</h1>
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "BANK.SEARCH_BANK_DETAILS",
                  defaultMessage: "Search",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
            <button className="btn btn-primary" onClick={handleAddNew}>
              <i className="ki-filled ki-plus"></i>{" "}
            <FormattedMessage
  id="BANK.ADD_ACCOUNT_CONTACT"
  defaultMessage="Add Account Contact"
/>
            </button>
            )}
          </div>
        </div>

        <AddAccountMaster
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedBankDetails(null);
          }}
          onSave={() => {
            fetchData();
            setOpen(false);
            setSelectedBankDetails(null);
          }}
          editData={selectedBankDetails}
        />

        <TableComponent
          columns={columns(handleEdit, handleDelete, {
            edit: permissions.edit,
            delete: permissions.delete,
          })}
          data={filteredData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default Superaccountmaster;
