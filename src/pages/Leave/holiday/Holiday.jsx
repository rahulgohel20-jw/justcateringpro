import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Confirmation } from "@/components/confirmation/confirmation";
import { columns, defaultData } from "./constant";
import { Link } from "react-router-dom";
import AddHoliday from "@/partials/modals/add-holiday/AddHoliday";
import { Tooltip } from "antd";

const Holiday = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (data) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  const removeContact = () => {};

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        action: (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="View">
              <Link
                to={`/contacts/details`}
                className="btn btn-sm btn-icon btn-clear"
                title="View"
              >
                <i className="ki-filled ki-eye text-success"></i>
              </Link>
            </Tooltip>
            <Tooltip title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => handleEdit(item)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
            <Tooltip title="Delete">
              <Confirmation
                trigger={<i className="ki-filled ki-trash text-danger"></i>}
                content="Do you really want to delete?"
                yesText="Proceed"
                noText="Dismiss"
                onConfirm={() => console.log("User confirmed")}
                onCancel={() => console.log("User cancelled")}
              ></Confirmation>
            </Tooltip>
          </div>
        ),
      };
    });
    return data;
  };

  const [tableData, setTableData] = useState(responseFormate());

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Holidays" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleModalOpen}
              title="Add Contact"
            >
              <i className="ki-filled ki-plus"></i>
              <span className="text-base">Holiday</span>
            </button>
          </div>
        </div>
        {/* TableComponent */}
        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
      </Container>
      <AddHoliday
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};
export { Holiday };
