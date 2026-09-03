import { Fragment, useEffect, useState } from "react";
import { BadgeDollarSign, FileText, Receipt } from "lucide-react";
import { GetAllMemberByUserId } from "@/services/apiServices";
import { Tooltip } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { Link } from "react-router-dom";
import AddMember from "@/partials/modals/add-member/AddMember";
import ViewMemberDetails from "@/partials/modals/view-member-details/ViewMemberDetails";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AssignEventsModal from "@/partials/modals/assign-events/AssignEventsModal";
import { useModuleAccess } from "../../../hooks/useModuleAccess";


const AllMemberMaster = () => {
  const permissions = usePermission("User Master");
  const classes = useStyle();
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isAssignEventModalOpen, setIsAssignEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasModuleAccess } = useModuleAccess();
const canAccessMirrorSecurity = hasModuleAccess("Mirror Security");
const canAccessBanquet = hasModuleAccess("Banquet")
const canAccessStockType = hasModuleAccess("Stock Type")

  const intl = useIntl();

  const Id = localStorage.getItem("userId");

  useEffect(() => {
    FetchMembers();
  }, []);


 


  const FetchMembers = () => {
    setLoading(true);
    GetAllMemberByUserId(Id)
      .then((res) => {
        const userDetails = res?.data.data.userDetails.UserDetails;
        if (userDetails && Array.isArray(userDetails)) {
          const formatted = userDetails.map((member, index) => ({
            id: member.id,
            sr_no: index + 1,
            email: member.email || "-",
            full_name:
              `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
              "-",
            memberid: member.id,
            country: member["userBasicDetails"]?.country?.name || "-",
            contact: member.contactNo || "-",
            role: member["userBasicDetails"]?.role?.name || "-",
            task_access: member["userBasicDetails"]?.isTaskAccess
              ? "Yes"
              : "No",
            leave_attendence_access: member["userBasicDetails"]
              ?.isAttendanceLeaveAccess
              ? "Yes"
              : "No",
            city: member["userBasicDetails"]?.city?.name || "-",
            state: member["userBasicDetails"]?.state?.name || "-",
            companyEmail: member["userBasicDetails"]?.companyEmail || "-",
            isInquiryVisible: !!member.isInquiryVisible,
          }));
          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
      })
      .finally(() => {
        setLoading(false); // ✅ stop loader always
      });
  };

  const handleEdit = (member) => {
    setSelectedMember({ ...member, id: member.memberid });
    setIsMemberModalOpen(true);
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setIsViewMemberModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.SIDEBAR_USERS"
              defaultMessage="User Master"
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
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              {permissions.add && canAccessMirrorSecurity && (
                <button
                  className="btn btn-warning"
                  onClick={() => setIsAssignEventModalOpen(true)}
                >
                  <Receipt size={16} />
                  Assign Events
                </button>
              )}

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
        {/* Modals */}
        <AddMember
          isModalOpen={isMemberModalOpen}
          refreshData={FetchMembers}
          setIsModalOpen={setIsMemberModalOpen}
          selectedMember={selectedMember}
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
            columns={columns(
              handleEdit,
              FetchMembers,
              permissions,
              canAccessBanquet,
              canAccessStockType,
            )}
            data={tableData}
            paginationSize={10}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default AllMemberMaster;