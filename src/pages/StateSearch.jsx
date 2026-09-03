import { useEffect, useState } from "react";
import { Table, Spin, message } from "antd";

const UserTable = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://103.1.101.244:9091/v1/api/user/getall");
      const json = await res.json();

      if (json.success) {
        const tableData = json.data["User Details"].map((user) => ({
          key: user.id,
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contactNo: user.contactNo,
          companyName: user.userBasicDetails.companyName,
          role: user.userBasicDetails.role.name,
          plan: user.plan.name,
          price: user.plan.price,
          isActive: user.isActive,
          isApprove: user.isApprove,
          createdAt: user.createdAt,
        }));
        setUsers(tableData);
      } else {
        message.error(json.msg || "Failed to fetch users");
      }
    } catch (error) {
      message.error("Error fetching users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Contact No", dataIndex: "contactNo", key: "contactNo" },
    { title: "Company", dataIndex: "companyName", key: "companyName" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Plan", dataIndex: "plan", key: "plan" },
    { title: "Price", dataIndex: "price", key: "price" },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (val) => (val ? "✅ Yes" : "❌ No"),
    },
    {
      title: "Approved",
      dataIndex: "isApprove",
      key: "isApprove",
      render: (val) => (val ? "✅ Yes" : "❌ No"),
    },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Spin>
  );
};

export default UserTable;
