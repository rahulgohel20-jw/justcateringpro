import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TableComponent } from "@/components/table/TableComponent";
import { getColumns } from "./constant";
import {
  GetDbAssignedDetails,
  getAllByRoleIdData,
} from "@/services/apiServices";

export default function ViewAssignDatabase({ open, onClose, selectedRow }) {
  const [tableData, setTableData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState({});

  const columns = getColumns();

  const formatData = (data, userMap) => {
    return {
      sr_no: selectedRow?.original?.sr_no || "-",
      database_name: data.dbName || selectedRow?.original?.database_name || "-",
      state: data.state || "-",
      assigned_to: data.user?.toString().trim()
        ? userMap[data.user] || `${data.user} (Unknown UserCode)`
        : "Not Assigned",
      instructions: data.instructions || "-",
      uuid: data.uuid || "",
      createdAt: data.createdAt || "",
    };
  };

  useEffect(() => {
    if (open && selectedRow?.original?.db_planning_id) {
      fetchData(selectedRow.original.db_planning_id);
    }
  }, [open, selectedRow]);

  const fetchData = async (id) => {
    try {
      setLoading(true);
      const response = await GetDbAssignedDetails(id);
      const data = response?.data?.data?.[0];

      if (data) {
        setRawData(data); // <-- FIXED
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rawData) return; // only wait for rawData, NOT userMap

    const formatted = formatData(rawData, userMap);
    setSelectedDetails(formatted);
    setTableData([formatted]);
  }, [userMap, rawData]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllByRoleIdData(1, "member");

        const list = res?.data?.data?.["User Details"].users || [];

        const mapObj = {};

        list.forEach((user) => {
          mapObj[user.userCode] =
            `${user.firstName || ""} ${user.lastName || ""}`.trim();
        });

        setUserMap(mapObj);
      } catch (err) {
        console.error("❌ Error fetching user list:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedDetails?.database_name || "No Name"}
                  <span className="text-sm text-gray-500 ml-1">
                    ({selectedDetails?.state || "No State"})
                  </span>
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <TableComponent
                  columns={columns}
                  data={tableData}
                  loading={loading}
                  paginationSize={10}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
