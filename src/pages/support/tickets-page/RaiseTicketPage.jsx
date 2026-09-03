import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import Addticket from "@/partials/modals/add-ticket/Addticket";
const RaiseTicketPage = () => {
  const [isAddticketOpen, setIsAddticketOpen] = useState(false);

  const [editData] = useState(null);
  const handleModalOpen = () => {
    setIsAddticketOpen(true); // Use correct setter
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Raise Tickets" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm  font-semibold text-gray-900">
            Support Tickets
          </p>
          <button
            onClick={handleModalOpen}
            type="button"
            className="btn btn-primary"
            title="Raise a Ticket"
          >
            <i className="ki-filled ki-plus"></i>
            Raise a Ticket
          </button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Your Tickets</h3>
          </div>
          <div className="card-body">
            <div className="text-center py-10 text-gray-500">
              <i className="ki-filled ki-ticket text-5xl mb-4 block"></i>
              <p>No tickets found. Raise a new ticket to get support.</p>
            </div>
          </div>
        </div>
        <Addticket
          isModalOpen={isAddticketOpen}
          setIsModalOpen={setIsAddticketOpen}
          editData={{}}
        />
      </Container>
    </Fragment>
  );
};

export { RaiseTicketPage };
