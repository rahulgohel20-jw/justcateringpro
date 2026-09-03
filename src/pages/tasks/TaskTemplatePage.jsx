import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CommonHexagonBadge } from "@/partials/common";
const TaskTemplatePage = () => {
  const itemList = [
    {
      id: "1",
      template: "Task Template 1",
      template_description: "Description for task template 1",
    },
    {
      id: "2",
      template: "Task Template 2",
      template_description: "Description for task template 2",
    },
    {
      id: "3",
      template: "Task Template 3",
      template_description: "Description for task template 3",
    },
    {
      id: "4",
      template: "Task Template 4",
      template_description: "Description for task template 4",
    },
    {
      id: "5",
      template: "Task Template 5",
      template_description: "Description for task template 4",
    },
    {
      id: "6",
      template: "Task Template 6",
      template_description: "Description for task template 4",
    },
  ];

  const renderItem = (item) => {
    return (
      <div className="" key={item.id}>
        <div className="card flex p-5 gap-3">
          <CommonHexagonBadge
            stroke="stroke-success-clarity"
            fill="fill-light"
            size="size-[42px]"
            badge={
              <i className="ki-filled ki-element-8 text-lg text-success"></i>
            }
          />
          <div className="flex flex-col">
            <h4 className="text-md font-medium text-gray-900">
              Template Title
            </h4>
            {/* <h4 className="text-md font-medium text-gray-900">{item.title}</h4> */}
            <small>{item.template_description}</small>
          </div>
        </div>
      </div>
    );
  };
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Tasks Template" }]} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {itemList && itemList.map((item, index) => renderItem(item))}
          <a
            href="#"
            className="p-5 card flex items-center justify-center border-2 border-dashed border-primary/10 bg-center bg-[length:600px] bg-no-repeat add-new-bg"
          >
            <i className="ki-filled ki-element-plus"></i>
            <h4>Add New Template</h4>
          </a>
        </div>
      </Container>
    </Fragment>
  );
};
export { TaskTemplatePage };
