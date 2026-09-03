import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import AddContact from "@/partials/modals/add-contact/AddContact";
import { Confirmation } from "@/components/confirmation/confirmation";
import { columns, defaultData } from "./constant";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";

const ContactListPage = () => {
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
            <Tooltip className="cursor-pointer" title="View">
              <Link
                to={`/contacts/details`}
                className="btn btn-sm btn-icon btn-clear"
                title="View"
              >
                <i className="ki-filled ki-eye text-success"></i>
              </Link>
            </Tooltip>
            <Tooltip className="cursor-pointer" title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => handleEdit(item)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
            <Tooltip className="cursor-pointer" title="Delete">
              <span>
                <Confirmation
                  trigger={<i className="ki-filled ki-trash text-danger"></i>}
                  content="Do you really want to delete?"
                  yesText="Proceed"
                  noText="Dismiss"
                  onConfirm={() => "User confirmed"}
                  onCancel={() => "User cancelled"}
                ></Confirmation>
              </span>
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
          <Breadcrumbs items={[{ title: "Contacts" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search contact"
                type="text"
              />
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Please select</option>
                <option value="1">First name</option>
                <option value="2">Last name</option>
                <option value="3">Email address</option>
                <option value="4">City</option>
              </select>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Export">
                <i className="ki-filled ki-folder-down"></i> Export
              </button>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Filter">
                <i className="ki-filled ki-setting-4"></i> Filter
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleModalOpen}
              title="Add Contact"
            >
              <i className="ki-filled ki-plus"></i> Add Contact
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
      <AddContact
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};
export { ContactListPage };
