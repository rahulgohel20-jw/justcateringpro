import EmptyData from "@/components/ui/emptyData";
import { toAbsoluteUrl } from "@/utils";
import { Tooltip } from "antd";

const StageTemplateTab = () => {
  const emailTemplate = [
    {
      id: 1,
      template_name: "Template 1",
      subject: "Stage subject 1",
      created_by: "Kaushik Brahmbhatt",
      created_by_image: toAbsoluteUrl("/images/user_img.jpg"),
    },
    {
      id: 2,
      template_name: "Template 2",
      subject: "Stage subject 2",
      created_by: "Bharat Mer",
      created_by_image: toAbsoluteUrl("/images/user_img.jpg"),
    },
    {
      id: 3,
      template_name: "Template 3",
      subject: "Stage subject 3",
      created_by: "Kaushik Brahmbhatt",
      created_by_image: toAbsoluteUrl("/images/user_img.jpg"),
    },
  ];
  return (
    <>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>
      {/* filters */}
      <div className="filters flex flex-wrap items-center justify-end gap-2 mb-3">
        <button type="button" className="btn btn-primary" title="Connect Email">
          <i className="ki-filled ki-sms"></i>
          Connect Email
        </button>
      </div>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {emailTemplate && emailTemplate.length > 0 ? (
          emailTemplate.map((item, index) => {
            return (
              <div className="card min-w-full" key={index}>
                <div className="flex items-center justify-between py-6 px-4 rtl:[background-position:center_top] [background-position:center_top] bg-no-repeat bg-[length:500px] user-access-bg">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700">
                      {item.subject}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.template_name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
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
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 p-4 bg-white dark:bg-dark rounded-b-xl border-t">
                  <small className="text-gray-700">Created By:</small>
                  <span className="flex items-center gap-1.5">
                    <img
                      src={item.created_by_image}
                      alt={item.created_by}
                      className="inline-block w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-900 font-semibold">
                      {item.created_by}
                    </span>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyData />
        )}
      </div>
    </>
  );
};

export { StageTemplateTab };
