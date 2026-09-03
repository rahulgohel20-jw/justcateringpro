import EmptyData from "@/components/ui/emptyData";

const WhatsAppTab = () => {
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
      <div className="grid grid-cols-9 gap-3 lg:gap-4 mt-5">
        <div className="col-span-3 col-start-4">
          <div className="card min-w-full py-5 px-6">
            <h2 className="text-lg font-semibold mb-3">
              WhatsApp API Connection
            </h2>
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col">
                <div className="input">
                  <i className="ki-filled ki-whatsapp"></i>
                  <input
                    type="text"
                    className="h-full"
                    placeholder="Enter WhatsApp API URL"
                  />
                </div>
              </div>
              <div className="text-center">
                <button
                  className="btn btn-primary justify-center w-full"
                  title="Connect WhatsApp API"
                >
                  <i className="ki-filled ki-file-down"></i>
                  Connect WhatsApp API
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { WhatsAppTab };
