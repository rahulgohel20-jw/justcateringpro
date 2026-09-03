import { useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { ReloadOutlined } from "@ant-design/icons";
import { GetUserlogs } from "@/services/apiServices"; // ✅ your API service
import { useLocation } from "react-router-dom";
import { Spin, message } from "antd";

export default function SuperAdminUserLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { email } = location.state || {};

  useEffect(() => {
    const fetchUserLogs = async () => {
      if (!email) return;

      setLoading(true);
      try {
        const response = await GetUserlogs(email); // ✅ API call

        // The real data is nested: response.data.data
        const apiData = response?.data?.data || [];

        if (Array.isArray(apiData) && apiData.length > 0) {
          // Transform API response into your timeline structure
          const formattedLogs = apiData.map((item) => ({
            id: item.id,
            date: new Date(item.createAt).toLocaleDateString("en-GB"),
            time: new Date(item.createAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            field: item.eventType || "",
            updatedBy: item.user || "Unknown",
            message: item.description || "",
            highlight: item.eventType?.toLowerCase() === "login",
          }));
          setLogs(formattedLogs);
        } else {
          message.warning("No logs found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user logs:", error);
        message.error("Failed to fetch user logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLogs();
  }, [email]);

  return (
    <Container>
      <Breadcrumbs items={[{ title: "Super Admin" }, { title: "User Logs" }]} />

      <div className="bg-white mt-5 rounded-md border border-gray-200 shadow-sm">
        <div className="bg-[#005BA8] text-white px-5 py-3 text-lg font-semibold rounded-t-md">
          Member Logs {email && <span className="text-sm ml-2">({email})</span>}
        </div>

        {/* Timeline section */}
        <div className="relative pl-9 py-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No logs available.
            </p>
          ) : (
            logs.map((log, index) => (
              <div key={log.id} className="relative flex items-start mb-8">
                {/* Date and time */}
                <div className="w-40 text-sm font-semibold text-gray-700">
                  {log.date} <br /> {log.time}
                </div>

                {/* Circle icon */}
                <div
                  className={`relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-dotted bg-white ${
                    log.highlight
                      ? "border-red-500 text-red-500"
                      : "border-[#28375F] text-[#28375F]"
                  }`}
                >
                  <ReloadOutlined className="text-sm" />
                  {index !== logs.length - 1 && (
                    <div className="absolute top-7 left-1/2 -translate-x-1/2 w-[2px] h-8 bg-gray-300"></div>
                  )}
                </div>

                {/* Log message */}
                <div className="ml-6">
                  <p
                    className={`text-sm ${
                      log.highlight
                        ? "text-red-600 font-medium"
                        : "text-gray-800"
                    }`}
                  >
                    {log.message}{" "}
                    <span className="font-semibold text-gray-700">
                      (By: {log.updatedBy})
                    </span>
                    {log.field && (
                      <span className="ml-2 text-gray-600 text-xs">
                        [{log.field}]
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
}
