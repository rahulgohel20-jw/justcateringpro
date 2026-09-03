import { useState } from "react";
import Addticket from "@/partials/modals/add-ticket/Addticket";

const RaiseTicket = () => {
  const [isAddticketOpen, setIsAddticketOpen] = useState(false);

  return (
    <div className="p-4">
      {/* Page header with button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Raise Ticket</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsAddticketOpen(true)}
        >
          Add Ticket
        </button>
      </div>

      {/* Your main page content */}
      <div>
        {/* Example placeholder */}
        <p>List of tickets will go here...</p>
      </div>

      {/* AddTicket modal */}
      <Addticket
        isModalOpen={isAddticketOpen}
        setIsModalOpen={setIsAddticketOpen}
        editData={{}}
      />
    </div>
  );
};

export default RaiseTicket;
