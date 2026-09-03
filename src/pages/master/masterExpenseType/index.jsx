import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";

import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GETAllByuserIdincomeExpensetype,
  DeleteIncomeexpenseType,
  getbyidincomeexpensettype,
} from "@/services/apiServices";

import AddExpenseType from "../../../partials/modals/AddExpenseType/AddExpenseType";
import { usePermission } from "../../../hooks/usePermission";

const MasterExpenseType = () => {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setType] = useState(null);
  const permissions = usePermission("Income Expense Type");

  const intl = useIntl();
  let userId = JSON.parse(localStorage.getItem("userId"));

  const filteredData = tableData.filter((item) =>
    item.TitleName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const fetchData = async () => {
    try {
      let finalData = [];

      if (!type) {
        // 🔥 Fetch both
        const [incomeRes, expenseRes] = await Promise.all([
          GETAllByuserIdincomeExpensetype(userId, "income"),
          GETAllByuserIdincomeExpensetype(userId, "expense"),
        ]);

        const incomeData = incomeRes?.data?.data || [];
        const expenseData = expenseRes?.data?.data || [];

        finalData = [...incomeData, ...expenseData];
      } else {
        const res = await GETAllByuserIdincomeExpensetype(userId, type);
        finalData = res?.data?.data || [];
      }

      const formatted = finalData.map((item) => ({
        id: item.typeId,
        TitleName: item.name,
        type: item.type,
        createdAt: item.createdAt,
      }));

      setTableData(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setOpen(true);
  };

  const handleEdit = async (item) => {
    try {
      const res = await getbyidincomeexpensettype(item.id);

      const response = res?.data || res;

      if (response?.success) {
        setSelectedItem(response.data);
        setOpen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "Are you sure you want to delete",
      icon: "warning",
      showCancelButton: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await DeleteIncomeexpenseType(item.id);

      const success = res?.success || res?.data?.success;
      const msg = res?.msg || res?.data?.msg;

      if (success) {
        Swal.fire({
          icon: "success",
          text: msg,
          timer: 1500,
          showConfirmButton: false,
        });

        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          text: msg,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Delete failed",
      });
    }
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
           <FormattedMessage
        id="COMMON.EXPENSE_INCOME_TYPE"
        defaultMessage="Expense/Income Type"
      />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
    <div className="flex gap-2">
      <input
        className="input"
        placeholder={intl.formatMessage({
          id: "COMMON.SEARCH",
          defaultMessage: "Search",
        })}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
        className="input"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">
          {intl.formatMessage({
            id: "COMMON.ALL",
            defaultMessage: "All",
          })}
        </option>

        <option value="expense">
          {intl.formatMessage({
            id: "COMMON.EXPENSE",
            defaultMessage: "Expense",
          })}
        </option>

        <option value="income">
          {intl.formatMessage({
            id: "COMMON.INCOME",
            defaultMessage: "Income",
          })}
        </option>
      </select>
    </div>

    {permissions.add && (
      <button className="btn btn-primary" onClick={handleAddNew}>
        <FormattedMessage
          id="COMMON.ADD_TYPE"
          defaultMessage="Add Type"
        />
      </button>
    )}
  </div>

        <AddExpenseType
          open={open}
          onClose={() => setOpen(false)}
          editData={selectedItem}
          onSave={fetchData}
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

export default MasterExpenseType;
