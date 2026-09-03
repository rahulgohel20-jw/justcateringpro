import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { TableComponent } from "@/components/table/TableComponent";
import { Confirmation } from "@/components/confirmation/confirmation";
import { columns, defaultData } from "./constant";
import { Tooltip } from "antd";

const NoteTab = () => {
  const handleEdit = (data) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        action: (
          <div className="flex items-center justify-center gap-1">
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
              <button className="btn btn-sm btn-icon btn-clear" title="Delete">
                <Confirmation
                  trigger={<i className="ki-filled ki-trash text-danger"></i>}
                  content="Do you really want to delete?"
                  yesText="Proceed"
                  noText="Dismiss"
                  onConfirm={() => console.log("User confirmed")}
                  onCancel={() => console.log("User cancelled")}
                ></Confirmation>
              </button>
            </Tooltip>
          </div>
        ),
      };
    });
    return data;
  };

  const [tableData, setTableData] = useState(responseFormate());

  return (
    <>
      <div className="grid grid-cols-9 gap-3 lg:gap-4 mb-5 mt-2">
        <div className="col-span-7 col-start-2">
          <div className="card min-w-full py-5 px-6">
            <div className="flex flex-col">
              <label className="form-label">Add Note</label>
              <div className="flex flex-col">
                <textarea
                  rows={4}
                  type="text"
                  className="textarea h-full"
                  placeholder="Add note here"
                />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button className="btn btn-success">Save Note</button>
            </div>
          </div>
        </div>
      </div>
      <TableComponent columns={columns} data={tableData} paginationSize={10} />
    </>
  );
};

export default NoteTab;
