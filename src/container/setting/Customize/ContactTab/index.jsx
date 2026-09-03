import { ListOrdered, Pen, Plus, Trash } from "lucide-react";
import CardList from "@/components/card-list/CardList";
import { Tooltip } from "antd";

const ContactTab = () => {
  const pipeLine = [
    {
      id: 1,
      name: "Field 1",
      data_type: "text",
      is_required: true,
      pipeline_name: "Pipeline 1",
    },
    {
      id: 2,
      name: "Field 2",
      data_type: "number",
      is_required: false,
      pipeline_name: "Pipeline 2",
    },
    {
      id: 3,
      name: "Field 3",
      data_type: "date",
      is_required: true,
      pipeline_name: "Pipeline 3",
    },
  ];

  const contactTags = [
    {
      id: 1,
      name: "Tag 1",
    },
    {
      id: 2,
      name: "Tag 2",
    },
    {
      id: 3,
      name: "Tag 3",
    },
  ];
  return (
    <div className="pipeline-tab">
      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
        <div className="card px-4 pt-4 rtl:[background-position:top_center] [background-position:top_center] bg-no-repeat bg-[length:500px] bg-[url('/images/bg_01.png')] dark:bg-[url('/images/bg_01_dark.png')]">
          <div className="flex flex-col items-center pt-3 pb-7.5 px-1.5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
              Contact Custom Fields
            </h3>
            <span className="text-gray-700 text-sm text-center mb-4.5 text-center">
              Track goals, progress, and achievements for growth.
            </span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                title="Reorder Contact Field"
              >
                <ListOrdered /> Reorder
              </button>
              <button
                className="btn btn-sm btn-primary"
                title="Add Contact Field"
              >
                <i className="ki-filled ki-plus"></i>Contact Field
              </button>
            </div>
          </div>
          <div className="card-content bg-white dark:bg-dark border-t py-2 px-1.5 h-full">
            {pipeLine && pipeLine.length > 0 ? (
              pipeLine.map((item, index) => {
                let leftContent = (
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900">{item.name}</div>
                    <small>
                      <span className="text-gray-700">Data Type:</span>
                      <span className="ms-1.5 font-semibold text-gray-900">
                        {item.data_type}
                      </span>
                    </small>
                    <small>
                      <span className="text-gray-700">Pipeline:</span>
                      <span className="ms-1.5 font-semibold text-gray-900">
                        {item.pipeline_name}
                      </span>
                    </small>
                    <small>
                      <span className="text-gray-700">Required:</span>
                      <span className="ms-1.5 font-semibold text-gray-900">
                        {item.is_required ? "Yes" : "No"}
                      </span>
                    </small>
                  </div>
                );
                return (
                  <CardList
                    key={index}
                    leftContent={leftContent}
                    rightContent={
                      <>
                        <Tooltip title="Edit">
                          <button type="button" title="Edit">
                            <i className="ki-filled ki-notepad-edit text-primary"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button type="button" title="Delete">
                            <i className="ki-filled ki-trash text-danger"></i>
                          </button>
                        </Tooltip>
                      </>
                    }
                  />
                );
              })
            ) : (
              <EmptyData />
            )}
          </div>
        </div>
        <div className="card px-4 pt-4 rtl:[background-position:top_center] [background-position:top_center] bg-no-repeat bg-[length:500px] bg-[url('/images/bg_01.png')] dark:bg-[url('/images/bg_01_dark.png')]">
          <div className="flex flex-col items-center pt-3 pb-7.5 px-1.5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
              Contact Tags
            </h3>
            <span className="text-gray-700 text-sm text-center mb-4.5 text-center">
              Track goals, progress, and achievements for growth.
            </span>
            <button className="btn btn-sm btn-primary" title="Add Contact Tags">
              <i className="ki-filled ki-plus"></i>Contact Tags
            </button>
          </div>
          <div className="card-content bg-white dark:bg-dark border-t py-2 px-1.5 h-full">
            {pipeLine && pipeLine.length > 0 ? (
              contactTags.map((item, index) => {
                return (
                  <CardList
                    key={index}
                    leftContent={item.name}
                    rightContent={
                      <>
                        <Tooltip title="Edit">
                          <button type="button" title="Edit">
                            <i className="ki-filled ki-notepad-edit text-primary"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button type="button" title="Delete">
                            <i className="ki-filled ki-trash text-danger"></i>
                          </button>
                        </Tooltip>
                      </>
                    }
                  />
                );
              })
            ) : (
              <EmptyData />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ContactTab };
