import { Fragment, useEffect, useState } from "react";
import { GetAllMemberByUserId } from "@/services/apiServices";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddMember from "@/partials/modals/add-member/AddMember";
import { FormattedMessage, useIntl } from "react-intl";
import { AlertCircle, Clock, Hourglass, CheckCircle, Bell } from "lucide-react";
import MemberPerformanceSidebar from "./MemberPerformanceSidebar";
import { usePermission } from "../../../../hooks/usePermission";

const SuperadminMember = () => {
  const permissions = usePermission("Users");
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    cancel: 0,
    hot: 0,
    cold: 0,
    inquiry: 0,
  });

  const intl = useIntl();
  const Id = localStorage.getItem("userId");

  const filteredData = tableData.filter((member) => {
    const value = searchTerm.toLowerCase();

    return (
      member.full_name?.toLowerCase().includes(value) ||
      member.email?.toLowerCase().includes(value) ||
      member.contact?.toLowerCase().includes(value) ||
      member.role?.toLowerCase().includes(value) ||
      member.city?.toLowerCase().includes(value) ||
      member.state?.toLowerCase().includes(value) ||
      member.country?.toLowerCase().includes(value)
    );
  });

  useEffect(() => {
    FetchMembers();
  }, []);


  const FetchMembers = () => {
    GetAllMemberByUserId(Id)
      .then((res) => {
        const response = res?.data?.data?.userDetails;
        const userDetails = response?.UserDetails; 
        const leadStatus = response?.LeadStatus || {}; 
        const leadType = response?.LeadType || {}; 

  

        
        setStats({
          pending: (leadStatus.pending || 0) + (leadStatus.Pending || 0),
          confirmed: (leadStatus.confirmed || 0) + (leadStatus.Confirmed || 0),
          cancel: (leadStatus.cancel || 0) + (leadStatus.Cancel || 0),
          hot: (leadType.hot || 0) + (leadType.Hot || 0),
          cold: (leadType.cold || 0) + (leadType.Cold || 0),
          inquiry: (leadType.inquire || 0) + (leadType.Inquire || 0),
        });

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
            leadStatus: member.leadStatus || {},
            leadType: member.leadType || {},
          }));
          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
      });
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  const handleView = (member) => {
    console.log("Selected Member for View:", member);
    setSelectedMember(member);
    setIsViewMemberModalOpen(true);
  };

  const statusCards = [
    {
      id: "pending",
      title: "Pending",
      count: stats.pending,
      icon: Clock,
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      borderColor: "border-gray-200",
      countColor: "text-gray-800",
    },
    {
      id: "confirmed",
      title: "Confirmed",
      count: stats.confirmed,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      countColor: "text-gray-800",
    },
    {
      id: "cancel",
      title: "Cancel",
      count: stats.cancel,
      icon: AlertCircle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
      countColor: "text-gray-800",
    },
    {
      id: "hot",
      title: "Hot",
      count: stats.hot,
      icon: Bell,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200",
      countColor: "text-gray-800",
    },
    {
      id: "cold",
      title: "Cold",
      count: stats.cold,
      icon: Hourglass,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
      countColor: "text-gray-800",
    },
    {
      id: "inquiry",
      title: "Inquiry",
      count: stats.inquiry,
      icon: Bell,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
      countColor: "text-gray-800",
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.ALL_MEMBER_MASTER"
                    defaultMessage="All Member Master"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`${card.bgColor} flex justify-between rounded-lg p-4 border ${card.borderColor} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center">
                  <div
                    className={`${card.bgColor} w-12 h-12 rounded-lg flex items-center justify-center `}
                  >
                    <Icon className={`${card.iconColor} w-6 h-6`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </h3>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${card.countColor}`}>
                      {card.count.toString().padStart(2, "0")}
                    </span>
                  </div>
                  {card.subtitle && (
                    <p className="text-xs text-red-500 mt-1">{card.subtitle}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_MEMBER",
                  defaultMessage: "Search Member...",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  id="USER.MASTER.ADD_MEMBER"
                  defaultMessage="Add Member"
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

        {/* ✅ Pass selectedMember to sidebar */}
        <MemberPerformanceSidebar
          isOpen={isViewMemberModalOpen}
          onClose={() => setIsViewMemberModalOpen(false)}
          staffData={selectedMember}
          userId={Id} // ✅ Pass userId for API calls
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, handleView, permissions)}
          data={filteredData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default SuperadminMember;
