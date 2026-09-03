import { Fragment, useRef, useState } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { DragAndDrop } from "@/components/drag-and-drop/DragAndDrop";
import { Badge } from "@/components/ui/badge";
import AddLead from "@/partials/modals/add-lead/AddLead";
import AddLeadNote from "@/partials/modals/add-lead-note/AddLeadNote";
import AddFollowUp from "@/partials/modals/add-follow-up/AddFollowUp";
import { defaultData } from "./constant";
import LeadContext from "./LeadContext";
import { tablecolumns, defaultTableData } from "./tableconstant";

const LeadPage = ({ children }) => {
  const scrollRef = useRef(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [columns, setColumns] = useState(defaultData);
  const [isActive, setIsActive] = useState(0);
  const [tableData, setTableData] = useState(defaultTableData);
  const handleModalOpen = () => {
    setIsLeadModalOpen(true);
  };
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [dndActive, setDndActive] = useState(false);

  const onPointerDown = (e) => {
    isDragging.current = true;
    if (dndActive) return;
    // support touch or mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
    // prevent native text/image drag
    scrollRef.current.classList.add("cursor-grabbing");
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    if (dndActive) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = clientX - startX.current;
    scrollRef.current.scrollLeft = scrollStart.current - dx;
  };

  const onPointerUp = () => {
    isDragging.current = false;
    scrollRef.current.classList.remove("cursor-grabbing");
  };

  const handleToggle = (index) => {
    setIsActive(index);
  };
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}

        <div className="gap-2 pb-2 mb-3">
          <h3>Leads</h3>
        </div>
        {/* filters */}
        <div className="filters flex justify-between items-center gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search lead"
                type="text"
              />
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Select Pipeline</option>
                <option value="1">Pipeline one</option>
                <option value="2">Pipeline two</option>
                <option value="2">Pipeline three</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Select Lead</option>
                <option value="1">Lead one</option>
                <option value="2">Lead two</option>
                <option value="3">Lead three</option>
                <option value="4">Lead four</option>
              </select>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Filter">
                <i className="ki-filled ki-setting-4"></i> Filter
              </button>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Refresh">
                <i className="ki-filled ki-arrows-circle"></i>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="btn-tabs">
              <button
                className={`btn btn-icon ${isActive === 0 ? "active" : ""}`}
                onClick={() => handleToggle(0)}
              >
                <i className="ki-outline ki-element-11"></i>
              </button>
              <button
                className={`btn btn-icon ${isActive === 1 ? "active" : ""}`}
                onClick={() => handleToggle(1)}
              >
                <i className="ki-outline ki-row-horizontal"></i>
              </button>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleModalOpen}
              title="Add Lead"
            >
              <i className="ki-filled ki-plus"></i>Add Lead
            </button>
          </div>
        </div>
        <div className=" flex justify-between items-end gap-2 mb-2">
          <div className="flex flex-wrap gap-2">
            <Badge
              className="badge badge-outline badge-success text-xs"
              title="Type one"
            >
              <span className="flex items-center">
                <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                <span className="flex flex-col">
                  <span>
                    Total: <strong>3</strong>
                  </span>
                  <span>
                    Amount: <strong>&#8377;22,000/-</strong>
                  </span>
                </span>
              </span>
            </Badge>
            <Badge
              className="badge badge-outline badge-dark text-xs"
              title="Type one"
            >
              <span className="flex items-center">
                <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                <span className="flex flex-col">
                  <span>
                    Open: <strong>150</strong>
                  </span>
                  <span>
                    Amount: <strong>&#8377;0/-</strong>
                  </span>
                </span>
              </span>
            </Badge>
            <Badge
              className="badge badge-outline badge-info text-xs"
              title="Type one"
            >
              <span className="flex items-center">
                <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                <span className="flex flex-col">
                  <span>
                    Won: <strong>1</strong>
                  </span>
                  <span>
                    Amount: <strong>&#8377;22.000/-</strong>
                  </span>
                </span>
              </span>
            </Badge>
            <Badge
              className="badge badge-outline badge-danger text-xs"
              title="Type one"
            >
              <span className="flex items-center">
                <i className="ki-filled ki-chart-line-up text-sm me-2"></i>
                <span className="flex flex-col">
                  <span>
                    Lost: <strong>3</strong>
                  </span>
                  <span>
                    Amount: <strong>&#8377;0/-</strong>
                  </span>
                </span>
              </span>
            </Badge>
          </div>
          {isActive === 0 && (
            <div className="flex justify-end items-center gap-2">
              <button
                onClick={scrollLeft}
                className="btn btn-light btn-sm px-3"
              >
                <i className="ki-filled ki-arrow-left"></i> Prev
              </button>
              <button
                onClick={scrollRight}
                className="btn btn-light btn-sm px-3"
              >
                Next <i className="ki-filled ki-arrow-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* amount */}
        {/* <div className="card mb-3">
          <div className="card-body">
            <div className="flex lg:px-10 py-1.5 gap-2">
              <div className="grid grid-cols-1 place-content-center flex-1 gap-1 text-center">
                <span className="text-success text-sm">Total 3</span>
                <span className="text-success text-2xl lg:text-2.5xl leading-none font-semibold ">
                  &#8377;22,000
                </span>
                <span className="text-success text-sm">Total amount</span>
              </div>
              <span className="[&amp;:not(:last-child)]:border-e border-e-gray-300 my-1"></span>
              <div className="grid grid-cols-1 place-content-center flex-1 gap-1 text-center">
                <span className="text-gray-700 text-sm">Open 150</span>
                <span className="text-gray-700 text-2xl lg:text-2.5xl leading-none font-semibold">
                  &#8377;0
                </span>
                <span className="text-gray-700 text-sm">Open amount</span>
              </div>
              <span className="[&amp;:not(:last-child)]:border-e border-e-gray-300 my-1"></span>
              <div className="grid grid-cols-1 place-content-center flex-1 gap-1 text-center">
                <span className="text-info text-sm">Won 1</span>
                <span className="text-info text-2xl lg:text-2.5xl leading-none font-semibold">
                  &#8377;0
                </span>
                <span className="text-info text-sm">Won amount</span>
              </div>
              <span className="[&amp;:not(:last-child)]:border-e border-e-gray-300 my-1"></span>
              <div className="grid grid-cols-1 place-content-center flex-1 gap-1 text-center">
                <span className="text-danger text-sm">Lost 3</span>
                <span className="text-danger text-2xl lg:text-2.5xl leading-none font-semibold">
                  &#8377;0
                </span>
                <span className="text-danger text-sm">Lost amount</span>
              </div>
              <span className="[&amp;:not(:last-child)]:border-e border-e-gray-300 my-1"></span>
            </div>
          </div>
        </div> */}

        {/* Lead Cards */}
        <div className="w-full ">
          {isActive === 0 ? (
            <div
              className="flex-1 flex flex-wrap space-x-4 cursor-grab overflow-x-hidden"
              ref={scrollRef}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            >
              <LeadContext.Provider
                value={{
                  setIsLeadModalOpen,
                  setIsNoteModalOpen,
                  setIsFollowUpModalOpen,
                }}
              >
                <DragAndDrop
                  columns={columns}
                  setColumns={setColumns}
                  setDndActive={setDndActive}
                />
              </LeadContext.Provider>
            </div>
          ) : (
            <TableComponent
              columns={tablecolumns}
              data={defaultTableData}
              paginationSize={10}
            />
          )}
        </div>
      </Container>
      {/* AddLead */}
      <AddLead
        isModalOpen={isLeadModalOpen}
        setIsModalOpen={setIsLeadModalOpen}
      />
      {/* AddLeadNote */}
      <AddLeadNote
        isModalOpen={isNoteModalOpen}
        setIsModalOpen={setIsNoteModalOpen}
      />
      {/* AddFollowUp */}
      <AddFollowUp
        isModalOpen={isFollowUpModalOpen}
        setIsModalOpen={setIsFollowUpModalOpen}
      />
    </Fragment>
  );
};
export { LeadPage };
