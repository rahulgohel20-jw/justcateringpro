import { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { GetRoleTree } from "@/services/apiServices";

const RoleNode = ({ node, level = 0 }) => {
  const colors = [
    "text-primary",
    "text-success",
    "text-warning",
    "text-danger",
    "text-info",
  ];

  const color = colors[level % colors.length];

  return (
    <div
      className={`${
        level > 0 ? "ml-6 border-l border-gray-200 pl-4 mt-2" : ""
      }`}
    >
      <div className="flex items-center gap-2 py-2">
        <i className={`ki-filled ki-abstract-26 text-sm ${color}`}></i>

        <span className={`text-sm font-semibold ${color}`}>
          {node.roleName || node.name}
        </span>

        {level === 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
            Root
          </span>
        )}
      </div>

      {node.children?.length > 0 && (
        <div>
          {node.children.map((child, idx) => (
            <RoleNode
              key={child.roleId ?? child.id ?? idx}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RoleHierarchyModal = ({ isOpen, onClose, role }) => {
  const userId = localStorage.getItem("userId");

  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !role?.roleId) return;

    fetchTree();
  }, [isOpen, role]);

  const fetchTree = async () => {
    setLoading(true);
    setTreeData([]);

    try {
      const res = await GetRoleTree(role.roleId, userId);

      console.log("Role Tree Response:", res);

      // API Response Format:
      // {
      //   data: {
      //     data: {
      //       childrenRole: { ... }
      //     }
      //   }
      // }

      const rootNode = res?.data?.data?.childrenRole;

      if (rootNode) {
        setTreeData([rootNode]);
      } else {
        setTreeData([]);
      }
    } catch (err) {
      console.error("Error fetching tree:", err);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={550}
      destroyOnClose
      title={
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-tree text-primary text-lg" />
          <span className="font-bold">
            Hierarchy —{" "}
            <span className="text-primary">
              {role?.role_name || role?.roleName}
            </span>
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spin size="large" />
        </div>
      ) : treeData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
          <i className="ki-filled ki-information text-3xl"></i>
          <p className="text-sm">No hierarchy found for this role.</p>
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {treeData.map((node, idx) => (
            <RoleNode
              key={node.roleId ?? node.id ?? idx}
              node={node}
            />
          ))}
        </div>
      )}
    </Modal>
  );
};

export default RoleHierarchyModal;