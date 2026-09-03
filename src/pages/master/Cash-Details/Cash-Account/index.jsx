import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import {
  CashAccountOPBGetByid,
  CashAccountGetAll,
  DeleteCashAccount,
} from "@/services/apiServices";
import Addcashaccount from "../../../../partials/modals/add-cash-account/Addcashaccount";
import { usePermission } from "../../../../hooks/usePermission.js";

const CashAccountsList = () => {
  const permissions = usePermission("CashOPB");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = JSON.parse(localStorage.getItem("userId"));
  const [tableData, setTableData] = useState([]);

  const handleEdit = async (item) => {
    try {
      const res = await CashAccountOPBGetByid(item.id);
      setSelectedBankDetails(res?.data?.data);
      setIsBankModalOpen(true);
    } catch (error) {
      console.log("edit fetch error", error);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: intl.formatMessage({ id: "COMMON.ARE_YOU_SURE", defaultMessage: "Are you sure?" }),
      text: intl.formatMessage(
        {
          id: "CASH_ACCOUNT.DELETE_CONFIRM_TEXT",
          defaultMessage: 'Delete "{accountName}"? This cannot be undone.',
        },
        { accountName: item.accountName }
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: intl.formatMessage({
        id: "COMMON.YES_DELETE_IT",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({ id: "COMMON.CANCEL", defaultMessage: "Cancel" }),
    });

    if (!result.isConfirmed) return;

    try {
      const res = await DeleteCashAccount(item.id);

      // ✅ BE returned success: false (account in use)
      if (!res?.data?.success) {
        Swal.fire({
          icon: "info", // ✅ info instead of error/success
          title: intl.formatMessage({
            id: "CASH_ACCOUNT.CANNOT_DELETE",
            defaultMessage: "Cannot Delete",
          }),
          text:
            res?.data?.msg ||
            intl.formatMessage({
              id: "CASH_ACCOUNT.CANNOT_DELETE_MSG",
              defaultMessage: "This account cannot be deleted.",
            }),
        });
        return;
      }

      // ✅ success: true
      Swal.fire({
        icon: "success",
        title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted!" }),
        text:
          res?.data?.msg ||
          intl.formatMessage({
            id: "COMMON.DELETED_SUCCESS_MSG",
            defaultMessage: "Deleted successfully",
          }),
        timer: 2000,
        showConfirmButton: false,
      });

      fetchCashAccounts();
    } catch (error) {
      const errMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        intl.formatMessage({
          id: "COMMON.DELETE_FAILED_MSG",
          defaultMessage: "Failed to delete. Please try again.",
        });

      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
        text: errMsg,
      });
    }
  };
  const handleAddNew = () => {
    setSelectedBankDetails(null);
    setIsBankModalOpen(true);
  };

  const fetchCashAccounts = async () => {
    try {
      const res = await CashAccountGetAll(Id, "");
      const list = res?.data?.data || [];
      const mapped = list.map((item) => ({
        id: item.id,
        accountName: item.accountName,
        subTitle: item.description || "-",
        cashType: item.contactType.nameEnglish || "-",
        openingBalance: Number(item.openingBalance || 0).toFixed(2),
        currentBalance: Number(item.currentBalance || 0).toFixed(2),
        status: item.isActive ? "ACTIVE" : "INACTIVE",
        isPrimary: item.isPrimary === true,
        raw: item,
      }));
      setTableData(mapped);
      setOriginalData(mapped);
    } catch (error) {
      console.log("cash list error", error);
    }
  };

  useEffect(() => {
    fetchCashAccounts();
  }, []);

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900 font-semibold">
            <FormattedMessage
              id="COMMON.CASH_OPB"
              defaultMessage="Cash OPB"
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
                  id: "BANK.SEARCH_BANK_DETAILS",
                  defaultMessage: "Search cash OPB",
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
                  id="BANK.ADD_BANK_DETAILS"
                  defaultMessage="Add Cash OPB"
                />
              </button>
            )}
          </div>
        </div>

        <Addcashaccount
          isOpen={isBankModalOpen}
          onClose={setIsBankModalOpen}
          refreshData={fetchCashAccounts}
          bankDetails={selectedBankDetails}
          allBankDetails={tableData}
        />

        {/* ✅ pass handleDelete + delete permission */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, permissions, intl, {
            edit: true,
            delete: true,
          })}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default CashAccountsList;