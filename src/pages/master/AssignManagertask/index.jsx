import { Fragment, useEffect, useState } from "react";
import { BadgeDollarSign, FileText, Receipt } from "lucide-react";
import { GETALLAssignaskmanager } from "@/services/apiServices";
import { Tooltip } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { Link } from "react-router-dom";
import AddTask from "../../../partials/modals/add-task/AddTask";
import ViewMemberDetails from "@/partials/modals/view-member-details/ViewMemberDetails";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AssignEventsModal from "@/partials/modals/assign-events/AssignEventsModal";
import { useModuleAccess } from "../../../hooks/useModuleAccess";

const RESOURCE_TYPE_OPTIONS = [
  { id: "TASK.ALL_TYPES", defaultMessage: "All Types", value: "" },
  { id: "TASK.LABOUR", defaultMessage: "Labour", value: "LABOUR" },
  { id: "TASK.OUTSIDE", defaultMessage: "Outside", value: "OUTSIDE" },
  { id: "TASK.CHEF", defaultMessage: "Chef", value: "CHEF" },
  { id: "TASK.INSIDE", defaultMessage: "Inside", value: "INSIDE" },
];

const STATUS_OPTIONS = [
  { id: "TASK.ALL_STATUS", defaultMessage: "All Status", value: "" },
  { id: "COMMON.ACTIVE", defaultMessage: "Active", value: "true" },
  { id: "COMMON.INACTIVE", defaultMessage: "Inactive", value: "false" },
];

const AssignManagertask = () => {
  const permissions = usePermission("Assign Manager");
  const classes = useStyle();
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isAssignEventModalOpen, setIsAssignEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasModuleAccess } = useModuleAccess();
  const canAccessMirrorSecurity = hasModuleAccess("Mirror Security");

  const intl = useIntl();

  const Id = localStorage.getItem("userId");

  // "" = All, "true" = Active, "false" = Inactive
  const [isTrue, setIsActive] = useState("");
  const [resourceType, setResourceType] = useState("");

  useEffect(() => {
    FetchMembers();
  }, [isTrue, resourceType]);

  const FetchMembers = () => {
    setLoading(true);
    // Pass the boolean only when a specific status is chosen; otherwise
    // pass "" so the API returns all statuses.
    const activeParam = isTrue === "" ? "" : isTrue === "true";

    GETALLAssignaskmanager(activeParam, resourceType, Id)
      .then((res) => {
        const tasks = res?.data?.data?.TaskDetails;
        if (tasks && Array.isArray(tasks)) {
          const formatted = tasks.map((task, index) => ({
            id: task.id,
            sr_no: index + 1,
            nameEnglish: task.nameEnglish || "-",
            nameGujarati: task.nameGujarati || "-",
            nameHindi: task.nameHindi || "-",
            resourceType: task.resourceType || "-",
            isTrue: task.isTrue,
            userId: task.userId,
          }));
          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };


  const handleEdit = (task) => {
    setSelectedMember(task);
    setIsMemberModalOpen(true);
  };

  const handleView = (task) => {
    setSelectedMember(task);
    setIsViewMemberModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.ASSIGN_MANAGER"
              defaultMessage="Assign Manager"
            />
          </h1>
        </div>
        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_MEMBER",
                  defaultMessage: "Search Member...",
                })}
                type="text"
              />
            </div>

    <div className="filItems">
  <select
    className="select"
    value={resourceType}
    onChange={(e) => setResourceType(e.target.value)}
  >
    {RESOURCE_TYPE_OPTIONS.map((opt) => (
      <FormattedMessage key={opt.value} id={opt.id} defaultMessage={opt.defaultMessage}>
        {(text) => <option value={opt.value}>{text}</option>}
      </FormattedMessage>
    ))}
  </select>
</div>

<div className="filItems">
  <select
    className="select"
    value={isTrue}
    onChange={(e) => setIsActive(e.target.value)}
  >
    {STATUS_OPTIONS.map((opt) => (
      <FormattedMessage key={opt.value} id={opt.id} defaultMessage={opt.defaultMessage}>
        {(text) => <option value={opt.value}>{text}</option>}
      </FormattedMessage>
    ))}
  </select>
</div>
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsMemberModalOpen(true);
                  setSelectedMember(null);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>
  
        <AddTask
          isModalOpen={isMemberModalOpen}
          refreshData={FetchMembers}
          onSuccess={FetchMembers}
          setIsModalOpen={setIsMemberModalOpen}
          editData={selectedMember}
        />
        <AssignEventsModal
          isModalOpen={isAssignEventModalOpen}
          setIsModalOpen={setIsAssignEventModalOpen}
          members={tableData}
        />
        <ViewMemberDetails
          isModalOpen={isViewMemberModalOpen}
          setIsModalOpen={setIsViewMemberModalOpen}
          memberData={selectedMember}
        />
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
<TableComponent
  columns={columns(handleEdit, FetchMembers, permissions, intl)}
  data={tableData}
  paginationSize={10}
  meta={{ onRefresh: FetchMembers }}
/>
        )}
      </Container>
    </Fragment>
  );
};

export default AssignManagertask;