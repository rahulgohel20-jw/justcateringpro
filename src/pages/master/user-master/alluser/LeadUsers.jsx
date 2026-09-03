import { useEffect, useState } from "react";
import AssignTheme from "../theme";
import { message, Spin, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "../alluser/leadconstant";
import {
  getAllByRoleIdData,
  LoginWithOtp,
  transfermember,
} from "@/services/apiServices";
import ApproveOtp from "../approveotp";
import DatabaseAssigntocustomer from "./DatabaseAssigntocustomer";
import ExtendDate from "./ExtendDate";
import { DeleteUserById, UserBlock } from "../../../../services/apiServices";
import SummaryCards from "./SummaryCard";
import { usePermission } from "../../../../hooks/usePermission";

const LeadUsers = () => {
  const permissions = usePermission("Lead Member");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cardData, setcCardData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExtendModal, setIsExtendModal] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedThemeUserId, setSelectedThemeUserId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignRow, setSelectedAssignRow] = useState(null);
  const [otpAction, setOtpAction] = useState(null);
  const [extendPayload, setExtendPayload] = useState(null);

  const formatUsers = (users) => {
    return users
      .sort((a, b) => b.id - a.id)
      .map((user, index) => {
        const planPrice = Number(user.userPlan?.planAmount) || 0;
        const basePrice = Number(user.userPlan?.planBaseAmount) || 0;

        return {
          sr_no: index + 1,
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          city: user.userBasicDetails?.city?.name || "-",
          contactNo: user.contactNo,
          companyName: user.userBasicDetails?.companyName || "-",
          plan: user.userPlan?.plan?.name || "-",
          isActive: user.isActive,
          isApprove: user.isApprove,
          createdAt: user.createdAt,
          email: user.email,
          userCode: user.userCode || "-",
          remark: user.remarks || "-",
          database: user.database?.parentDbName || user.database?.dbName || "-",
          databaseRaw: user.database || null,
          planPrice,
          basePrice,
          dueAmount: planPrice - basePrice,
          enddate: user?.userPlan?.endDate || "",
        };
      });
  };

  const handleFetchByRoleId = async () => {
    try {
      setLoading(true);
      const response = await getAllByRoleIdData(2, "lead");

      if (response.data.success) {
        const users = response.data.data?.["User Details"].users || [];
        setcCardData(response.data.data?.["User Details"]);
        const formatted = formatUsers(users);
        setTableData(formatted);
        setFilteredData(formatted);
      } else {
        message.error(response.data.msg || "No users found");
      }
    } catch (err) {
      console.error(err);
      message.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchByRoleId();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setFilteredData(tableData);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredData(
        tableData.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower) ||
            u.companyName?.toLowerCase().includes(lower) ||
            u.plan?.toLowerCase().includes(lower) ||
            u.userCode?.toLowerCase().includes(lower),
        ),
      );
    }
  }, [searchText, tableData]);

  const handleThemeClick = (userId) => {
    setSelectedThemeUserId(userId);
    setIsThemeModalOpen(true);
  };

  const handleExtendClick = (userId) => {
    setSelectedThemeUserId(userId);
    setOtpAction("extend");
    setIsExtendModal(true);
  };
  const handleConvertClick = async (userId) => {
    try {
      setLoading(true);
      const otp = "-1";
      const res = await transfermember(otp, "lead", userId);

      if (res?.data?.msg) {
        message.success("OTP sent successfully");
        setSelectedThemeUserId(userId);
        setOtpAction("convert");
        setIsOtpModalOpen(true);
      } else {
        message.error(res?.data?.msg || "Failed to initiate convert");
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleApproveOtp = async (userId, actionType) => {
    try {
      setLoading(true);

      if (actionType === "delete") {
        const deleteRes = await DeleteUserById(userId, "-1",true);

        if (deleteRes?.data?.msg) {
          setSelectedThemeUserId(userId);
          setOtpAction(actionType);
          setIsOtpModalOpen(true);
        } else {
          message.error(deleteRes?.data?.msg || "Failed to initiate deletion");
        }

        return; // Stop here for delete
      }

      if (actionType === "block") {
        const blockRes = await UserBlock(userId, "-1");
       

        if (blockRes?.data?.msg) {
          setSelectedThemeUserId(userId);
          setOtpAction(actionType);
          setIsOtpModalOpen(true);
        } else {
          message.error(blockRes?.data?.msg || "Failed to user block");
        }

        return;
      }

      // For all other actions (approve, block, extend) — just send OTP
      const mobile = 8866889580;
      const res = await LoginWithOtp(mobile);

      if (res?.data?.success) {
        message.success("OTP sent successfully");
        setSelectedThemeUserId(userId);
        setOtpAction(actionType);
        setIsOtpModalOpen(true);
      } else {
        message.error(res?.data?.msg || "Failed to send OTP");
      }
    } catch (error) {
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleAssignUser = (rowData) => {
    setSelectedAssignRow(rowData);
    setIsAssignModalOpen(true);
  };

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Lead Members" }]} />
      </div>

      <SummaryCards data={cardData} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <Input.Search
          placeholder="Search users..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full sm:w-64"
        />
        {permissions.add && (
          <Link to="/auth/signup" className="w-full sm:w-auto">
            <button className="btn btn-primary flex items-center justify-center gap-1 w-full sm:w-auto">
              Add User
            </button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spin size="large" tip="Loading..." />
        </div>
      ) : (
        <div className="relative -webkit-overflow-scrolling-touch">
          <TableComponent
            columns={columns(
              navigate,
              handleThemeClick,
              handleApproveOtp,
              handleAssignUser,
              handleExtendClick,
              handleConvertClick,
              permissions,
            )}
            data={filteredData}
            paginationSize={10}
            rowClassName={(row) =>
              row.dueAmount > 0 ? "bg-red-100 border-l-4 border-red-600" : ""
            }
          />
        </div>
      )}
      <ApproveOtp
        isModalOpen={isOtpModalOpen}
        setIsModalOpen={setIsOtpModalOpen}
        userId={selectedThemeUserId}
        refreshData={handleFetchByRoleId}
        action={otpAction}
        extendPayload={extendPayload}
      />

      <AssignTheme
        isModalOpen={isThemeModalOpen}
        setIsModalOpen={setIsThemeModalOpen}
        userId={selectedThemeUserId}
      />

      <ExtendDate
        isModalOpen={isExtendModal}
        setIsModalOpen={setIsExtendModal}
        userId={selectedThemeUserId}
        openOtpModal={() => setIsOtpModalOpen(true)}
        setExtendPayload={setExtendPayload}
        Alluser={tableData}
      />

      <DatabaseAssigntocustomer
        open={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedAssignRow(null);
        }}
        selectedRow={selectedAssignRow}
        allUsers={tableData}
      />
    </Container>
  );
};

export default LeadUsers;
