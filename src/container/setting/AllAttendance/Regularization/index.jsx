import { useState } from "react";
const Regularization = () => {
  const [activeTab, setActiveTab] = useState("all");
  return (
    <>
      {/* filters */}
      <div>
        <div className="flex border-b pt-3 mb-3 bg-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "all"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-700 border-b-2 border-gray-200"
            }`}
          >
            <i className="ki-filled ki-notepad-bookmark me-2"></i>
            All
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "pending"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-700 border-b-2 border-gray-200"
            }`}
          >
            <i className="ki-filled ki-text-circle me-2"></i>
            Pending
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "approved"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-700 border-b-2 border-gray-200"
            }`}
          >
            <i className="ki-filled ki-text-circle me-2"></i>
            Approved
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "rejected"
                ? "border-b-2 border-primary text-primary font-bold"
                : "text-gray-700 border-b-2 border-gray-200"
            }`}
          >
            <i className="ki-filled ki-text-circle me-2"></i>
            Rejected
          </button>
        </div>

        {activeTab === "all" && (
          <div className="max-h-90 relative w-full scrollable-x-auto rounded-md">
            <div className="flex items-center justify-around">
              <div className="flex gap-5">
                <img
                  src="images/user_img.jpg"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <span>Manan Gandhi</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center bg-gray-100 text-green-800 text-md font-semibold px-2.5 py-0.5 rounded">
                  <i className="ki-filled ki-calendar p-1"></i>
                  2025-05-31
                </span>
              </div>
              <div className="flex gap-5">
                <span className="text-gray-700">
                  First In: <strong className="text-success">4:20 PM</strong>
                </span>
                <span className="flex items-center bg-green-100 text-green-800 text-md font-semibold px-2.5 py-0.5 rounded">
                  00:01:48
                </span>
                <span className="text-gray-700">
                  Last out: <strong className="text-danger">4:21 PM</strong>
                </span>
              </div>
              <div>
                <span className="bg-green-100  px-3 py-1 text-green-500">
                  Approved
                </span>
              </div>
              <div>
                <i className="ki-filled ki-trash text-red-500 text-lg"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { Regularization };
