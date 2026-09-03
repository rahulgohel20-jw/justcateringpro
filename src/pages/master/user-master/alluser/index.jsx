import { useEffect, useState } from "react";
import AssignTheme from "../theme";
import { message, Spin, Input, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "../alluser/constant";
import {
  getAllByRoleIdData,
  LoginWithOtp,
  Getgenerateusermenuitemrawmaterialexcel,
} from "@/services/apiServices";
import ApproveOtp from "../approveotp";
import DatabaseAssigntocustomer from "./DatabaseAssigntocustomer";
import ExtendDate from "./ExtendDate";
import { DeleteUserById, UserBlock } from "../../../../services/apiServices";
import SummaryCards from "./SummaryCard";
import { usePermission } from "../../../../hooks/usePermission";
import UpgradeModuleModal from "./UpgradeModuleModal";

const AllUser = () => {
  const permissions = usePermission("Members");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [cardData, setcCardData] = useState([]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExtendModal, setIsExtendModal] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedThemeUserId, setSelectedThemeUserId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAssignRow, setSelectedAssignRow] = useState(null);
  const [otpAction, setOtpAction] = useState(null);
  const [extendPayload, setExtendPayload] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeUserId, setUpgradeUserId] = useState(null);
  const [excelLoadingId, setExcelLoadingId] = useState(null);
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
          isBlock: user?.isBlock,
          enddate: user?.userPlan?.endDate || "",
        };
      });
  };

  const handleFetchByRoleId = async () => {
    try {
      setLoading(true);
      const response = await getAllByRoleIdData(2, "member");
      if (response.data.success) {
        const users = response.data.data?.["User Details"].users || [];
        const formatted = formatUsers(users);
        setTableData(formatted);
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
    let result = tableData;

    if (activeFilter === "active") {
      result = result.filter((u) => u.isActive === true);
    } else if (activeFilter === "inactive") {
      result = result.filter((u) => u.isActive === false);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.companyName?.toLowerCase().includes(lower) ||
          u.plan?.toLowerCase().includes(lower) ||
          u.userCode?.toLowerCase().includes(lower),
      );
    }

    setFilteredData(result);
  }, [searchText, activeFilter, tableData]);

  const handleThemeClick = (userId) => {
    setSelectedThemeUserId(userId);
    setIsThemeModalOpen(true);
  };

  const handleExtendClick = (userId) => {
    setSelectedThemeUserId(userId);
    setOtpAction("extend");
    setIsExtendModal(true);
  };

  const handleUpgradeModule = (userId) => {
    setUpgradeUserId(userId);
    setIsUpgradeModalOpen(true);
    setSelectedThemeUserId(userId);
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
        return;
      }
      if (actionType === "block") {
        const blockRes = await UserBlock(userId, "-1");
        if (blockRes?.data?.msg === "User Block Failed") {
          setSelectedThemeUserId(userId);
          setOtpAction(actionType);
          setIsOtpModalOpen(true);
        } else {
          message.error(blockRes?.data?.msg || "Failed to user block");
        }
        return;
      }
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
  // Add this handler inside the component (alongside other handlers)
  const handleExcelDownload = async (userId) => {
    try {
      setExcelLoadingId(userId); // ← start loader
      const response = await Getgenerateusermenuitemrawmaterialexcel(userId);

      if (response?.data?.success && response?.data?.report_path) {
        const link = document.createElement("a");
        link.href = response.data.report_path;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        link.remove();
        message.success("Excel downloaded successfully!");
      } else {
        message.error(response?.data?.msg || "Failed to generate Excel.");
      }
    } catch (error) {
      console.error("Excel download error:", error);
      message.error("An error occurred while downloading Excel.");
    } finally {
      setExcelLoadingId(null); // ← stop loader
    }
  };
  const activeCount = tableData.filter((u) => u.isActive === true).length;
  const inactiveCount = tableData.filter((u) => u.isActive === false).length;

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Members" }]} />
      </div>
      <SummaryCards data={cardData} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Input.Search
            placeholder="Search users..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full sm:w-64"
          />

          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
                activeFilter === "all"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 bg-transparent"
              }`}
            >
              All
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold">
                {tableData.length}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
                activeFilter === "active"
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-500 hover:text-green-600 bg-transparent"
              }`}
            >
              Active
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 cursor-pointer ${
                activeFilter === "inactive"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-red-500 bg-transparent"
              }`}
            >
              Inactive
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeFilter === "inactive"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {inactiveCount}
              </span>
            </button>
          </div>
        </div>

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
              permissions,
              handleUpgradeModule,
              handleExcelDownload,
              excelLoadingId,
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
      <UpgradeModuleModal
        isModalOpen={isUpgradeModalOpen}
        setIsModalOpen={setIsUpgradeModalOpen}
        userId={selectedThemeUserId}
      />
    </Container>
  );
};

export default AllUser;
