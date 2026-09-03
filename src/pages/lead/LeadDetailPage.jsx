import { Fragment, useState } from "react";
import { KeenIcon } from "@/components";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import AddLead from "@/partials/modals/add-lead/AddLead";
import AddLeadNote from "@/partials/modals/add-lead-note/AddLeadNote";
import AddFollowUp from "@/partials/modals/add-follow-up/AddFollowUp";
import { LeadLeftComponent, LeadRightComponent } from "@/components/lead";

const LeadDetailPage = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);
  const [searchTag, setSearchTag] = useState("");
  const leadTypes = [
    // { id: 1, name: "New Inquiry" },
    { id: 2, name: "Follow Up" },
    { id: 3, name: "Closed" },
    { id: 4, name: "Lost" },
    { id: 5, name: "Won" },
  ];

  const handleEditLead = () => {
    setIsLeadModalOpen(true);
  };

  const handleMoveTo = () => {};

  const handleAddNote = () => {
    setIsNoteModalOpen(true);
  };

  const handleAddFollowUp = () => {
    setIsFollowUpModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button className="btn btn-sm btn-primary" title="New Inquiry">New Inquiry</button>
            {leadTypes.map(({ id, name }, index) => (
              <div className="filItems relative">
                <button className="btn btn-sm btn-primary" title={name} key={index}>
                  {name}
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="filItems relative">
              <button
                type="button"
                onClick={handleMoveTo}
                className="btn btn-sm btn-primary"
                title="Move to"
              >
                <i className="ki-filled ki-arrows-loop"></i> Move to
              </button>
            </div>
            <div className="filItems relative">
              <button
                type="button"
                onClick={handleEditLead}
                className="btn btn-sm btn-primary"
                title="Edit Lead"
              >
                <i className="ki-filled ki-ki-filled ki-abstract-18 text-lg"></i>{" "}
                Edit Lead
              </button>
            </div>
            <div className="filItems relative">
              <button
                type="button"
                onClick={handleAddNote}
                className="btn btn-sm btn-primary"
                title="Edit Notes"
              >
                <i className="ki-filled ki-notepad"></i> Edit Notes
              </button>
            </div>
            <div className="filItems relative">
              <button
                type="button"
                onClick={handleAddFollowUp}
                className="btn btn-sm btn-primary"
                title="Add Follow Up"
              >
                <i className="ki-filled ki-message-text-2"></i> Add Follow Up
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 border rounded-lg">
          <div className="col-span-1">
            <LeadLeftComponent />
          </div>
          <div className="col-span-2 space-y-4">
            <LeadRightComponent />
          </div>
        </div>
        <AddLead
          isModalOpen={isLeadModalOpen}
          setIsModalOpen={setIsLeadModalOpen}
        />
        <AddLeadNote
          isModalOpen={isNoteModalOpen}
          setIsModalOpen={setIsNoteModalOpen}
        />
        <AddFollowUp
          isModalOpen={isFollowUpModalOpen}
          setIsModalOpen={setIsFollowUpModalOpen}
        />
      </Container>
    </Fragment>
  );
};

export { LeadDetailPage };
