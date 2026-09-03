import { useState } from "react";
import { Button, Input, Select, Card, Badge, Dropdown, Menu } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getFollowUpColumns } from "./getFollowUpColumns";
import { TableComponent } from "@/components/table/TableComponent";
import FollowUpModal from "../../../../partials/modals/add-followup-lead/FollowUpModal";

const FollowUpPage = () => {
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedPipelines, setSelectedPipelines] = useState([]);

  const [activeStatus, setActiveStatus] = useState("overdue");
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);

  const columns = getFollowUpColumns();

  /* ================= STATIC DATA ================= */
  {
    /* GLOBAL STATUS SUMMARY */
  }

  const defaultData = [
    {
      id: 1,
      contactName: "Shyam Joshi",
      phone: "+917622052205",
      description: "test",
      leadTitle: "shyam joshi",
      stage: "New Inquiry - Sales Pipeline",
      dueDate: "Aug 12, 2025 4:28 PM",
      assignedTo: "Deep",
      type: "Call",
      status: "overdue",
    },
    {
      id: 2,
      contactName: "Pappusingh Chadana Shisoda",
      phone: "+918888888888",
      description: "test",
      leadTitle: "Balu catering",
      stage: "New Inquiry - Sales Pipeline",
      dueDate: "Aug 12, 2025 4:00 PM",
      assignedTo: "Deep",
      type: "Whatsapp",
      status: "open",
    },
    {
      id: 3,
      contactName: "Rajesh Kumar",
      phone: "+919999999999",
      description: "Follow up on proposal",
      leadTitle: "Tech Solutions",
      stage: "New Inquiry - Sales Pipeline",
      dueDate: "Aug 13, 2025 2:00 PM",
      assignedTo: "Deep",
      type: "Email",
      status: "closed",
    },
  ];

  /* ================= USER STATISTICS ================= */

  const userStats = [
    {
      name: "Deep",
      avatar: "D",
      total: 3,
      overdue: 3,
      open: 0,
      closed: 0,
    },
    {
      name: "Manan",
      avatar: "/api/placeholder/40/40",
      total: 0,
      overdue: 0,
      open: 0,
      closed: 0,
    },
  ];

  /* ================= GLOBAL STATISTICS ================= */

  /* ================= PIPELINE OPTIONS ================= */

  const pipelineOptions = [...new Set(defaultData.map((item) => item.stage))];

  const globalStats = {
    overdue: defaultData.filter((d) => d.status === "overdue").length,
    open: defaultData.filter((d) => d.status === "open").length,
    closed: defaultData.filter((d) => d.status === "closed").length,
  };

  /* ================= SEARCH & FILTER ================= */

  const filteredData = defaultData.filter((item) => {
    const matchesSearch =
      item.contactName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.leadTitle.toLowerCase().includes(searchText.toLowerCase());

    const matchesUser =
      selectedUsers.length > 0 ? selectedUsers.includes(item.assignedTo) : true;

    const matchesPipeline =
      selectedPipelines.length > 0
        ? selectedPipelines.includes(item.stage)
        : true;

    const matchesStatus = activeStatus ? item.status === activeStatus : true;

    return matchesSearch && matchesUser && matchesPipeline && matchesStatus;
  });

  /* ================= RENDER USER CARD ================= */

  const renderUserCard = (user) => (
    <Card
      key={user.name}
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 rounded-2xl overflow-hidden"
      onClick={() => setSelectedUser(user.name)}
      style={{
        background:
          selectedUser === user.name
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "#ffffff",
        color: selectedUser === user.name ? "#ffffff" : "#000000",
      }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatar.startsWith("/") ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20"
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                selectedUser === user.name
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
              }`}
            >
              {user.avatar}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-lg">{user.name}</h3>

        {/* Stats */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Total</span>
            <Badge
              count={user.total}
              style={{
                backgroundColor:
                  selectedUser === user.name ? "#ffffff" : "#667eea",
                color: selectedUser === user.name ? "#667eea" : "#ffffff",
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Overdue</span>
            <Badge
              count={user.overdue}
              style={{ backgroundColor: "#ef4444" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Open</span>
            <Badge count={user.open} style={{ backgroundColor: "#f59e0b" }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-80">Closed</span>
            <Badge count={user.closed} style={{ backgroundColor: "#10b981" }} />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen from-slate-50 via-white to-slate-50 p-3 sm:p-6">
      <div className="w-full mx-auto space-y-6">
        {/* TOP FILTER BAR */}
        <div className="rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* LEFT SIDE FILTERS */}
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search"
                prefix={<SearchOutlined className="text-slate-400" />}
                style={{ width: "100%", maxWidth: 220 }}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="rounded-xl"
              />

              <Select
                defaultValue="This Week"
                style={{ width: "100%", maxWidth: 150 }}
                size="md"
                className="rounded-xl"
              >
                <Select.Option value="This Week">This Week</Select.Option>
                <Select.Option value="This Month">This Month</Select.Option>
                <Select.Option value="Custom">Custom</Select.Option>
              </Select>

              <Select
                mode="multiple"
                placeholder="Assigned To"
                style={{ width: "100%", maxWidth: 200 }}
                size="md"
                className="rounded-xl"
                allowClear
                value={selectedUsers}
                onChange={(value) => setSelectedUsers(value)}
                optionLabelProp="label"
              >
                {userStats.map((user) => (
                  <Select.Option
                    key={user.name}
                    value={user.name}
                    label={user.name}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.name)}
                        readOnly
                      />
                      <span>{user.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>

              <Select
                mode="multiple"
                placeholder="Pipeline"
                style={{ width: "100%", maxWidth: 200 }}
                size="md"
                className="rounded-xl"
                allowClear
                value={selectedPipelines}
                onChange={(value) => setSelectedPipelines(value)}
                optionLabelProp="label"
              >
                {pipelineOptions.map((pipeline) => (
                  <Select.Option
                    key={pipeline}
                    value={pipeline}
                    label={pipeline}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPipelines.includes(pipeline)}
                        readOnly
                      />
                      <span>{pipeline}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>

              <Select
                placeholder="Due Date"
                style={{ width: "100%", maxWidth: 150 }}
                size="md"
                className="rounded-xl"
                allowClear
              >
                <Select.Option value="today">Today</Select.Option>
                <Select.Option value="tomorrow">Tomorrow</Select.Option>
                <Select.Option value="this-week">This Week</Select.Option>
                <Select.Option value="overdue">Overdue</Select.Option>
              </Select>
            </div>

            {/* RIGHT SIDE BUTTON */}
           <div className="w-full sm:w-auto">
              <Button
                type="primary"
                onClick={() => setIsFollowUpOpen(true)}
                icon={<PlusOutlined />}
                size="md"
                className="bg-primary border-0 rounded-xl font-semibold h-10 px-3 w-full sm:w-auto"
              >
                Follow Up
              </Button>
            </div>
          </div>
        </div>

        {/* GLOBAL STATUS SUMMARY */}
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center py-4">
          {["overdue", "open", "closed"].map((status) => {
            const colorMap = {
              overdue: "red",
              open: "orange",
              closed: "green",
            };

            const count =
              status === "overdue"
                ? globalStats.overdue
                : status === "open"
                  ? globalStats.open
                  : globalStats.closed;

            const isActive = activeStatus === status;

            return (
              <div
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-full cursor-pointer transition-all duration-200 border
          ${
            isActive
              ? `bg-${colorMap[status]}-100 border-${colorMap[status]}-300`
              : "bg-white border-gray-200"
          }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-${colorMap[status]}-500`}
                ></div>

                <span className="font-medium text-slate-700 capitalize">
                  {status} - {count}
                </span>
              </div>
            );
          })}
        </div>
        <FollowUpModal
          isOpen={isFollowUpOpen}
          onClose={(val) => {
            setIsFollowUpOpen(val);
            setViewingFollowUp(null);
          }}
        />
        {/* TABLE */}
        <div className="   overflow-hidden">
          <div className="p-2 sm:p-4 overflow-x-auto">
            <TableComponent
              columns={columns}
              data={filteredData}
              paginationSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpPage;
