import { useContext } from "react";
import { useLanguage } from "@/i18n";
import {
  KeenIcon,
  MenuIcon,
  MenuItem,
  MenuSeparator,
  MenuToggle,
  MenuLink,
  MenuSub,
  MenuTitle,
  Menu,
} from "@/components";
import LeadContext from "@/pages/lead/LeadContext";
import { Link } from "react-router-dom";

const Task = ({
  item,
  dropdown,
  index,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onFollowUp,
  onMoveLead,
}) => {
  const { isRTL } = useLanguage();

  // Get lead type badge color
  const getLeadTypeBadge = (type) => {
    switch (type) {
      case "Hot":
        return "badge-danger";
      case "Cold":
        return "badge-info";
      case "Inquire":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  // Get lead status badge color
  const getLeadStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return "badge-success";
      case "Pending":
        return "badge-warning";
      case "Cancel":
        return "badge-danger";
      case "Closed":
        return "badge-dark";
      case "Open":
      default:
        return "badge-primary";
    }
  };

  // Format date to relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Count follow-ups by status
  const getFollowUpCounts = () => {
    const followUps = item.followUpDetails || [];
    const overdue = followUps.filter((f) => {
      const followUpDate = new Date(f.followUpDate);
      return followUpDate < new Date() && f.followUpStatus !== "Closed";
    }).length;
    const open = followUps.filter((f) => f.followUpStatus === "Open").length;
    const closed = followUps.filter(
      (f) => f.followUpStatus === "Closed",
    ).length;

    return { overdue, open, closed };
  };

  const followUpCounts = getFollowUpCounts();

  return (
    <>
      <div
        key={index}
        className="card p-2 lg:p-3 shadow-none hover:shadow-md transition-shadow bg-white"
      >
        <div className="flex flex-col gap-3">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col flex-1">
              <h2 className="font-semibold text-gray-900 leading-none mb-0.5 line-clamp-1">
                {item.title || item.clientName || "Unknown Client"}
              </h2>
              <small className="text-2xs text-gray-600 mt-0.5">
                {item.subtitle || item.leadCode || "No Code"}
              </small>
              <h2 className="text-2xs text-gray-600 mt-0.5">
                Contact No: {item.clientContactNo || "Unknown Client"}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <p className="inline-block  px-3 py-1 bg-yellow-100 border border-yellow text-black rounded-full text-xs font-medium">
                {item.closeDate}
              </p>
              <button
                className="btn btn-sm btn-icon btn-light btn-clear"
                title="View Details"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLead?.(item);
                }}
              >
                <i className="ki-filled ki-eye"></i>
              </button>
              {dropdown && (
                <Menu className="items-stretch">
                  <MenuItem
                    toggle="dropdown"
                    trigger="click"
                    dropdownProps={{
                      placement: isRTL() ? "bottom-start" : "bottom-end",
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: isRTL() ? [0, -10] : [0, 10],
                          },
                        },
                      ],
                    }}
                  >
                    <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                      <KeenIcon icon="dots-vertical" />
                    </MenuToggle>
                    <MenuSub
                      className="menu-default"
                      rootClassName="w-full max-w-[200px]"
                    >
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditLead?.(item);
                        }}
                      >
                        <MenuLink>
                          <MenuIcon>
                            <KeenIcon icon="ki-filled ki-notepad-edit" />
                          </MenuIcon>
                          <MenuTitle>Edit Lead</MenuTitle>
                        </MenuLink>
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onFollowUp?.(item);
                        }}
                      >
                        <MenuLink>
                          <MenuIcon>
                            <KeenIcon icon="ki-filled ki-calendar" />
                          </MenuIcon>
                          <MenuTitle>Add Follow Up</MenuTitle>
                        </MenuLink>
                      </MenuItem>
                      {/* <MenuItem>
                        <MenuLink>
                          <MenuIcon>
                            <KeenIcon icon="ki-filled ki-whatsapp" />
                          </MenuIcon>
                          <MenuTitle>Send WhatsApp</MenuTitle>
                        </MenuLink>
                      </MenuItem>
                      {/* <MenuItem>
                        <MenuLink>
                          <MenuIcon>
                            <KeenIcon icon="ki-filled ki-sms" />
                          </MenuIcon>
                          <MenuTitle>Send Email</MenuTitle>
                        </MenuLink>
                      </MenuItem> */}

                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveLead?.(item); // ✅ ADD THIS
                        }}
                      >
                        <MenuLink>
                          <MenuIcon>
                            <KeenIcon icon="ki-filled ki-copy" />
                          </MenuIcon>
                          <MenuTitle>Move To</MenuTitle>
                        </MenuLink>
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLead?.(item.leadId);
                        }}
                      >
                        <MenuLink path="">
                          <MenuIcon>
                            <KeenIcon
                              icon="ki-filled ki-trash"
                              className="text-danger"
                            />
                          </MenuIcon>
                          <MenuTitle className="text-danger">Delete</MenuTitle>
                        </MenuLink>
                      </MenuItem>
                    </MenuSub>
                  </MenuItem>
                </Menu>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex flex-col gap-0.5 text-2xs text-gray-600">
            <span>
              Created At: {item.createdAt || "N/A"} (
              {getRelativeTime(item.createdAt)})
            </span>
            {/* <span>
              Updated At: {item.updatedAt || item.createdAt || "N/A"} (
              {getRelativeTime(item.updatedAt || item.createdAt)})
            </span> */}
          </div>

          <hr />

          {/* Lead Details */}
          <div className="flex flex-col gap-2">
            {/* Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {/* Contact Number */}
              <div className="col-span-1 flex items-center gap-3">
                <KeenIcon icon="phone" className="text-success" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-0.5">Amount:</span>
                  <p className="text-sm font-medium text-gray-700 leading-none mt-0.5">
                    {item.amount || 0}
                  </p>
                </div>
              </div>

              {/* Close Date */}
              <div className="col-span-1 flex items-center gap-3">
                <KeenIcon icon="calendar" className="text-success" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-0.5">
                    Close Date:
                  </span>
                  <p className="text-sm font-medium text-gray-700 leading-none mt-0.5">
                    {item.closeDate || "NA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {/* City */}
              <div className="col-span-1 flex items-center gap-3">
                <KeenIcon icon="geolocation" className="text-success" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-0.5">City:</span>

                  <p className="text-sm font-medium text-gray-700 leading-none mt-0.5">
                    {item.city && item.city !== "null"
                      ? item.city
                      : item.cityName || "NA"}
                  </p>
                </div>
              </div>

              {/* Assigned To */}
              <div className="col-span-1 flex items-center gap-3">
                <KeenIcon icon="user-tick" className="text-success" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-0.5">
                    Assigned to:
                  </span>
                  <p className="text-sm font-medium text-gray-700 leading-none mt-0.5">
                    {item.assignedTo ||
                      item.leadAssignName ||
                      item.leadAssign ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Stats */}

          <hr />

          {/* Footer - Badges */}
          <div className="flex items-center justify-start gap-2 flex-wrap">
            {/* Lead Type Badge */}
            {item.type && (
              <div
                className={`badge badge-sm badge-pill ${getLeadTypeBadge(item.type)} text-xs`}
                title={`Lead Type: ${item.type}`}
              >
                {item.type}
              </div>
            )}

            {/* Lead Code */}
            <div
              className="badge badge-sm badge-pill badge-secondary text-xs"
              title={`Lead Code: ${item.subtitle || item.leadCode}`}
            >
              {item.subtitle || item.leadCode}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Task };
