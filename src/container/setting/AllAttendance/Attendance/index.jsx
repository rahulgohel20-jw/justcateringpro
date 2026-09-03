import { useState } from "react";
const Attendance = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <>
      {/* filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className={`w-5 h-5 transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <div>
            <div className="grid grid-cols-3 gap-4 mt-5 ">
              <div>
                <p>15:00 PM</p>
              </div>
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 text-green-800 text-md font-semibold px-2.5 py-0.5 rounded">
                    <i className="ki-filled ki-time px-2 py-1 text-lg"></i>
                    Login
                  </span>
                </div>
              </div>
              <div>
                <i className="ki-filled ki-pin px-2 py-1 text-lg"></i>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 ">
              <div>
                <p>19:00 PM</p>
              </div>
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 text-red-800 text-md font-semibold px-2.5 py-0.5 rounded">
                    <i className="ki-filled ki-time px-2 py-1 text-lg"></i>
                    Logout
                  </span>
                </div>
              </div>
              <div>
                <i className="ki-filled ki-pin px-2 py-1 text-lg"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <img
              src="images/user_img.jpg"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <span>Rahul Gohel</span>
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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className={`w-5 h-5 transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        {!isCollapsed && (
          <div>
            <div className="grid grid-cols-3 gap-4 mt-5 ">
              <div>
                <p>15:00 PM</p>
              </div>
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 text-green-800 text-md font-semibold px-2.5 py-0.5 rounded">
                    <i className="ki-filled ki-time px-2 py-1 text-lg"></i>
                    Login
                  </span>
                </div>
              </div>
              <div>
                <i className="ki-filled ki-pin px-2 py-1 text-lg"></i>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 ">
              <div>
                <p>19:00 PM</p>
              </div>
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center bg-gray-100 text-red-800 text-md font-semibold px-2.5 py-0.5 rounded">
                    <i className="ki-filled ki-time px-2 py-1 text-lg"></i>
                    Logout
                  </span>
                </div>
              </div>
              <div>
                <i className="ki-filled ki-pin px-2 py-1 text-lg"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { Attendance };
