import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";

const LeadKanbanBoard = ({
  leads,
  onLeadStatusChange,
  onViewLead,
  onEditLead,
  onFollowUp,
}) => {
  const [columns, setColumns] = useState({
    Total: {
      title: "Total",
      items: [],
      color: "bg-blue-100",
      borderColor: "border-blue-400",
    },
    Open: {
      title: "Open",
      items: [],
      color: "bg-yellow-100",
      borderColor: "border-yellow-400",
    },
    Won: {
      title: "Won",
      items: [],
      color: "bg-green-100",
      borderColor: "border-green-400",
    },
    Lost: {
      title: "Lost",
      items: [],
      color: "bg-red-100",
      borderColor: "border-red-400",
    },
    Pending: {
      title: "Pending",
      items: [],
      color: "bg-purple-100",
      borderColor: "border-purple-400",
    },
    Confirmed: {
      title: "Confirmed",
      items: [],
      color: "bg-teal-100",
      borderColor: "border-teal-400",
    },
    Cancel: {
      title: "Cancel",
      items: [],
      color: "bg-gray-100",
      borderColor: "border-gray-400",
    },
    Closed: {
      title: "Closed",
      items: [],
      color: "bg-indigo-100",
      borderColor: "border-indigo-400",
    },
  });

  // Organize leads into columns based on status
  useEffect(() => {
    const updatedColumns = { ...columns };

    // Reset all items
    Object.keys(updatedColumns).forEach((key) => {
      updatedColumns[key].items = [];
    });

    // Distribute leads into appropriate columns
    leads.forEach((lead) => {
      const status = lead.leadStatus || "Open";
      if (updatedColumns[status]) {
        updatedColumns[status].items.push(lead);
      } else {
        updatedColumns.Open.items.push(lead); // Default to Open if status not found
      }
    });

    // Total column gets all leads
    updatedColumns.Total.items = [...leads];

    setColumns(updatedColumns);
  }, [leads]);

  // Calculate total amount for a column
  const calculateAmount = (items) => {
    const total = items.reduce((sum, item) => {
      const amount = parseFloat(item.amount || 0);
      return sum + amount;
    }, 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(total);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Don't allow dragging to/from Total column
    if (source.droppableId === "Total" || destination.droppableId === "Total") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Move",
        text: "Cannot drag leads to or from the Total column",
      });
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return; // Same column, no change needed
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];

    const [movedItem] = sourceItems.splice(source.index, 1);

    // Update the lead status
    const updatedLead = {
      ...movedItem,
      leadStatus: destination.droppableId,
    };

    destItems.splice(destination.index, 0, updatedLead);

    // Update local state immediately for smooth UX
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
      Total: {
        ...columns.Total,
        items: leads.map((l) =>
          l.leadId === updatedLead.leadId ? updatedLead : l,
        ),
      },
    });

    // Call parent component to update the backend
    try {
      await onLeadStatusChange(updatedLead.leadId, destination.droppableId);

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Lead moved to ${destination.droppableId}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update lead status. Please try again.",
      });

      // Revert the change if API call fails
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: [...sourceColumn.items, movedItem],
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destColumn.items.filter(
            (item) => item.leadId !== movedItem.leadId,
          ),
        },
      });
    }
  };

  const getLeadTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "hot":
        return "bg-red-500 text-white";
      case "cold":
        return "bg-blue-500 text-white";
      case "inquire":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col h-full">
              {/* Column Header */}
              <div
                className={`${column.color} rounded-t-lg p-4 border-t-4 ${column.borderColor}`}
              >
                <h3 className="font-bold text-lg text-gray-800">
                  {column.title}
                </h3>
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-semibold">Count: {column.items.length}</p>
                  <p className="font-semibold">
                    Amount: {calculateAmount(column.items)}
                  </p>
                </div>
              </div>

              {/* Column Body */}
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 bg-gray-50 p-3 rounded-b-lg border-2 ${
                      snapshot.isDraggingOver
                        ? "bg-blue-50 border-blue-300"
                        : "border-gray-200"
                    } min-h-[400px] overflow-y-auto`}
                  >
                    {column.items.map((lead, index) => (
                      <Draggable
                        key={lead.leadId.toString()}
                        draggableId={lead.leadId.toString()}
                        index={index}
                        isDragDisabled={columnId === "Total"}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg shadow-sm border p-3 mb-3 ${
                              snapshot.isDragging ? "shadow-lg rotate-2" : ""
                            } ${columnId === "Total" ? "cursor-not-allowed opacity-70" : "cursor-move hover:shadow-md"} transition-all`}
                          >
                            {/* Lead Code & Type Badge */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono text-gray-500">
                                {lead.leadCode}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getLeadTypeColor(lead.leadType)}`}
                              >
                                {lead.leadType}
                              </span>
                            </div>

                            {/* Client Name */}
                            <h4 className="font-semibold text-gray-800 mb-1 truncate">
                              {lead.clientName}
                            </h4>

                            {/* Contact Number */}
                            <p className="text-sm text-gray-600 mb-2">
                              📞 {lead.contactNumber}
                            </p>

                            {/* Product & City */}
                            <div className="text-xs text-gray-500 mb-2">
                              <p className="truncate">
                                🏢 {lead.productType || "-"}
                              </p>
                              <p className="truncate">
                                📍 {lead.cityName || "-"}
                              </p>
                            </div>

                            {/* Assigned To */}
                            {lead.leadAssign && lead.leadAssign !== "-" && (
                              <div className="text-xs text-gray-500 mb-2">
                                <p className="truncate">
                                  👤 Assigned: {lead.leadAssign}
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewLead(lead);
                                }}
                                className="flex-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                                title="View Details"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditLead(lead);
                                }}
                                className="flex-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                                title="Edit Lead"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onFollowUp(lead);
                                }}
                                className="flex-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                                title="Add Follow-up"
                              >
                                📞 Follow
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default LeadKanbanBoard;
