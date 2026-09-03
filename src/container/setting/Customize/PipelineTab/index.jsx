import { useState } from "react";
import { toAbsoluteUrl } from "@/utils";
import { Copy, CopyPlus, Eye, Logs, Pen, Plus, Trash } from "lucide-react";
import CardList from "@/components/card-list/CardList";
import EmptyData from "@/components/ui/emptyData";
import AddPipelines from "@/partials/modals/add-pipeline/AddPipelines";
import AddPipelinesTemplate from "@/partials/modals/add-pipeline-template/AddPipelinesTemplate";
import AddPipelinesReason from "@/partials/modals/add-pipeline-reason/AddPipelinesReason";
import { Popconfirm, Tooltip } from "antd";
import { underConstruction } from "@/underConstruction";
const PipelineTab = () => {
  const pipeLine = [
    {
      id: 1,
      name: "Pipeline 1",
    },
    {
      id: 2,
      name: "Pipeline 2",
    },
    {
      id: 3,
      name: "Pipeline 3",
    },
    {
      id: 4,
      name: "Pipeline 4",
    },
  ];

  const pipelineTemplate = [
    {
      id: 1,
      name: "Pipeline Template 1",
    },
    {
      id: 2,
      name: "Pipeline Template 2",
    },
    {
      id: 3,
      name: "Pipeline Template 3",
    },
  ];

  const lostReason = [
    {
      id: 1,
      name: "Lost Reason 1",
    },
    {
      id: 2,
      name: "Lost Reason 2",
    },
    {
      id: 3,
      name: "Lost Reason 3",
    },
    {
      id: 4,
      name: "Lost Reason 4",
    },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalTemplateOpen, setIsModalTemplateOpen] = useState(false);
  const [isModalReasonOpen, setIsModalReasonOpen] = useState(false);
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalTemplateOpen = () => {
    setIsModalTemplateOpen(true)
  }
  const handleModalReasonOpen = () => {
    setIsModalReasonOpen(true)
  }
  return (
    <>
      <div className="pipeline-tab">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
          <div className="card px-4 pt-4 rtl:[background-position:top_center] [background-position:top_center] bg-no-repeat bg-[length:500px] bg-[url('/images/bg_01.png')] dark:bg-[url('/images/bg_01_dark.png')]">
            <div className="flex flex-col items-center pt-3 pb-7.5 px-1.5">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                Pipeline for Personal Satisfaction
              </h3>
              <span className="text-gray-700 text-sm text-center mb-4.5 text-center">
                Track goals, progress, and achievements for growth.
              </span>
              <button className="btn btn-sm btn-primary" title="Add Pipeline" onClick={handleModalOpen}>
                <i className="ki-filled ki-plus"></i>Pipeline
              </button>
            </div>
            <div className="card-content bg-white dark:bg-dark border-t py-2 px-1.5 h-full">
              {pipeLine && pipeLine.length > 0 ? (
                pipeLine.map((item, index) => {
                  return (
                    <CardList
                      key={index}
                      leftContent={item.name}
                      rightContent={
                        <>
                          <Popconfirm
                              title="Are you sure to copy this item?"
                              onConfirm={() => underConstruction()
                              }
                              onCancel={() => console.log('Cancelled')}
                              okText="Yes"
                              cancelText="No"
                            >
                          <Tooltip title="Copy">
                            <button type="button" title="Copy">
                              <i className="ki-filled ki-copy text-success"></i>
                            </button>
                          </Tooltip>
                          </Popconfirm>
                          <Tooltip title="Edit">
                            <button type="button" title="Edit" onClick={handleModalOpen}>
                              <i className="ki-filled ki-notepad-edit text-primary"></i>
                            </button>
                          </Tooltip>
                          <Popconfirm
                              title="Are you sure to delete this item?"
                              onConfirm={() => underConstruction()
                              }
                              onCancel={() => console.log('Cancelled')}
                              okText="Yes"
                              cancelText="No"
                            >
                          <Tooltip title="Delete">
                            <button type="button" title="Delete">
                              <i className="ki-filled ki-trash text-danger"></i>
                            </button>
                          </Tooltip>
                          </Popconfirm>
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
                Pipeline Template for Personal Satisfaction
              </h3>
              <span className="text-gray-700 text-sm text-center mb-4.5 text-center">
                Clear steps to achieve goals and fulfillment.
              </span>
              <button className="btn btn-sm btn-primary" title="Add Template" onClick={handleModalTemplateOpen}>
                <i className="ki-filled ki-plus"></i>Template
              </button>
            </div>
            <div className="card-content bg-white dark:bg-dark border-t py-2 px-1.5 h-full">
              {pipelineTemplate && pipelineTemplate.length > 0 ? (
                pipelineTemplate.map((item, index) => {
                  return (
                    <CardList
                      key={index}
                      leftContent={item.name}
                      rightContent={
                        <>
                        <Popconfirm
                              title="Are you sure to copy this item?"
                              onConfirm={() => underConstruction()
                              }
                              onCancel={() => console.log('Cancelled')}
                              okText="Yes"
                              cancelText="No"
                            >
                          <Tooltip title="Copy">
                            <button type="button" title="Copy">
                              <i className="ki-filled ki-copy text-success"></i>
                            </button>
                          </Tooltip>
                          </Popconfirm>
                          <Tooltip title="Edit">
                            <button type="button" title="Edit" onClick={handleModalTemplateOpen}>
                              <i className="ki-filled ki-notepad-edit text-primary"></i>
                            </button>
                          </Tooltip>
                          <Popconfirm
                              title="Are you sure to delete this item?"
                              onConfirm={() => underConstruction()
                              }
                              onCancel={() => console.log('Cancelled')}
                              okText="Yes"
                              cancelText="No"
                            >
                          <Tooltip title="Delete">
                            <button type="button" title="Delete">
                              <i className="ki-filled ki-trash text-danger"></i>
                            </button>
                          </Tooltip>
                          </Popconfirm>
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
                Lost Reason for Personal Satisfaction
              </h3>
              <span className="text-gray-700 text-sm text-center mb-4.5 text-center">
                Tracks reasons for lost opportunities to improve outcomes.
              </span>
              <button className="btn btn-sm btn-primary" title="Add Reason" onClick={handleModalReasonOpen}>
                <i className="ki-filled ki-plus"></i>Reason
              </button>
            </div>
            <div className="card-content bg-white dark:bg-dark border-t py-2 px-1.5 h-full">
              {lostReason && lostReason.length ? (
                lostReason.map((item, index) => {
                  return (
                    <CardList
                      key={index}
                      leftContent={item.name}
                      rightContent={
                        <>
                          <Popconfirm
                                title="Are you sure to copy this item?"
                                onConfirm={() => underConstruction()
                                }
                                onCancel={() => console.log('Cancelled')}
                                okText="Yes"
                                cancelText="No"
                              >
                            <Tooltip title="Copy">
                              <button type="button" title="Copy">
                                <i className="ki-filled ki-copy text-success"></i>
                              </button>
                            </Tooltip>
                          </Popconfirm>
                          <Tooltip title="Edit">
                            <button type="button" title="Edit" onClick={handleModalReasonOpen}>
                              <i className="ki-filled ki-notepad-edit text-primary"></i>
                            </button>
                          </Tooltip>
                          <Popconfirm
                                title="Are you sure to delete this item?"
                                onConfirm={() => underConstruction()
                                }
                                onCancel={() => console.log('Cancelled')}
                                okText="Yes"
                                cancelText="No"
                              >
                          <Tooltip title="Delete">
                            <button type="button" title="Delete">
                              <i className="ki-filled ki-trash text-danger"></i>
                            </button>
                          </Tooltip>
                          </Popconfirm>
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
      <AddPipelines isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      <AddPipelinesTemplate isModalOpen={isModalTemplateOpen} setIsModalOpen={setIsModalTemplateOpen} />
      <AddPipelinesReason isModalOpen={isModalReasonOpen} setIsModalOpen={setIsModalReasonOpen} />
    </>
  );
};

export { PipelineTab };
