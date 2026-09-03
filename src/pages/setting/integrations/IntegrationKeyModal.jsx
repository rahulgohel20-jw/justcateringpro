import { useState } from "react";
import { AddKeys } from "@/services/apiServices";
import Swal from "sweetalert2";

const IntegrationsKeyModal = ({ isModalOpen, setIsModalOpen, keyId, refreshData,  }) => {
  if (!isModalOpen) return null;
  const [channelName, setChannelName] = useState("");
  const [apiKey1, setApiKey1] = useState("");
  const [apiKey2, setApiKey2] = useState("");

  const handleConnect = async () => {
    try {
      const payload = {
        id: keyId || null,
        key1: apiKey1 || "",
        key2: apiKey2 || "",
        url: channelName || "",
      };

      const res = await AddKeys(payload);
      if (res.data.success === true) {
        Swal.fire({
          title: "Success!",
          text: "Keys Added Successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setIsModalOpen(false);
        refreshData?.();
      } else {
        Swal.fire({
          title: "Failed!",
          text: res?.data?.msg || "Opps! Something Went Wrong Try Again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 relative shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Whatsapp Connection
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-gray-700 sm:w-24 shrink-0">
              Api Key 1
            </label>
            <input
              type="text"
              value={apiKey1}
              onChange={(e) => setApiKey1(e.target.value)}
              placeholder="Enter Api Key"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-gray-700 sm:w-24 shrink-0">
              Api Key 2
            </label>
            <input
              type="text"
              value={apiKey2}
              onChange={(e) => setApiKey2(e.target.value)}
              placeholder="Enter Api Key"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-gray-700 sm:w-24 shrink-0">
              URL
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter Url"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleConnect}
            className="bg-primary  text-white font-semibold px-8 py-2.5 rounded-lg transition-colors text-sm"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsKeyModal;
