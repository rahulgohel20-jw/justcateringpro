import EmptyData from "@/components/ui/emptyData";
import { toAbsoluteUrl } from "@/utils";

const EmailTab = () => {
  const email = [
    {
      id: 1,
      email_id: "kaushikBhrahmbhatt@gmail.com",
      created_at: "30 May 2025 10:44 AM",
      status: "Active",
    },
    {
      id: 2,
      email_id: "bharatMer@gmail.com",
      created_at: "30 May 2025 10:44 AM",
      status: "Inactive",
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
        <button
          type="button"
          className="btn btn-primary"
          title="Connect Calendar"
        >
          <i className="ki-filled ki-calendar-2"></i>
          Connect Calendar
        </button>
      </div>

      <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
        {email && email.length > 0 ? (
          email.map((item, index) => {
            return (
              <div
                className="card min-w-full py-7 px-5 rtl:[background-position:-240px_center] [background-position:240px_center] bg-no-repeat bg-[length:500px] user-access-bg"
                key={index}
              >
                <div className="flex items-center flex-wrap sm:flex-nowrap justify-between grow gap-2">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col gap-1">
                      <p className="form-info text-gray-700 font-normal">
                        Sending email:
                      </p>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.email_id}
                      </h4>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="form-info text-gray-700 font-normal">
                        Connected at:
                      </p>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.created_at}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    title="Disconnect"
                  >
                    <i className="ki-filled ki-disconnect"></i>
                    Disconnect
                  </button>
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

export { EmailTab };
