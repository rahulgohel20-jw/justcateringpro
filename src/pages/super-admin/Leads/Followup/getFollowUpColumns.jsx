import { MoreVertical } from "lucide-react";
import { Tag, Dropdown } from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export const getFollowUpColumns = () => [
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div>
          <div className="font-medium">{data.contactName}</div>
          <div className="text-gray-500 text-sm">{data.phone}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Followup Description",
  },
  {
    accessorKey: "leadTitle",
    header: "Lead Title",
  },
  {
    accessorKey: "stage",
    header: "Stage",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned To",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;

      const color =
        type === "Call" ? "blue" : type === "Whatsapp" ? "green" : "purple";

      return <Tag color={color}>{type}</Tag>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;

      const menuItems = [
        {
          key: "reschedule",
          label: "Reschedule",
          icon: <ReloadOutlined />,
        },
        {
          key: "remarks",
          label: "Add Remarks",
          icon: <EditOutlined />,
        },
        {
          key: "close",
          label: "Close",
          icon: <CloseOutlined />,
        },
        {
          key: "email",
          label: "Email",
          icon: <MailOutlined />,
        },
        {
          key: "whatsapp",
          label: "whatsapp",
        },
        {
          key: "Edit ",
          label: "edit",
        },
        {
          key: "delete",
          label: "Delete",
          icon: <DeleteOutlined />,
          danger: true,
        },
      ];

      const handleMenuClick = ({ key }) => {
       

        switch (key) {
          case "edit":
            // open edit modal
            break;
          case "delete":
            // call delete function
            break;
          default:
            break;
        }
      };

      return (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <MoreVertical size={18} />
          </button>
        </Dropdown>
      );
    },
  },
];
