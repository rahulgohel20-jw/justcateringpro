import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetAllManagerTask } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddManagerTaskModal from "../../../partials/modals/add-manager-task/AddManagerTask";

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Pre", value: "PRE" },
  { label: "Post", value: "POST" },
  { label: "Running", value: "RUNNING" },
];

const ManagerTaskMaster = () => {
  const permissions = usePermission("Manager Task");
  const intl = useIntl();
  const userId = localStorage.getItem("userId");

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchTasks = () => {
    setLoading(true);
    GetAllManagerTask(userId)
      .then((res) => {
        
        const list = res?.data?.data["ManagerTasks"] ?? res?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        const formatted = arr.map((task, index) => ({
          ...task,
          sr_no: index + 1,
        }));
        setTableData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching manager tasks:", err);
        setTableData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filtered = tableData.filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MANAGER_TASK_MASTER"
              defaultMessage="Manager Task Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_TASK",
                  defaultMessage: "Search task...",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filItems">
              <select
                className="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {permissions.add && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus" />
              <FormattedMessage id="COMMON.CREATE_NEW" defaultMessage="Create New" />
            </button>
          )}
        </div>

        <AddManagerTaskModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={fetchTasks}
          editData={selectedTask}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <TableComponent
            columns={columns(handleEdit, fetchTasks, permissions)}
            data={filtered}
            paginationSize={10}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default ManagerTaskMaster;