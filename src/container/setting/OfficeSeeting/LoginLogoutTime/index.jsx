import { Breadcrumbs } from "@mui/material";
import { Container } from "lucide-react";
import { Fragment, useState } from "react";
const LoginLogoutTime = () => {
  const [showTimeSetter, setShowTimeSetter] = useState(false);
  const [selectedTime, setSelectedTime] = useState("04:31 PM");
  const [isToggled, setIsToggled] = useState(true); // State for toggle

  const handleClockClick = () => {
    setShowTimeSetter(true);
  };

  const updateTime = (hours, minutes, period) => {
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    setSelectedTime(`${formattedHours}:${formattedMinutes} ${period}`);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="gap-2 mb-3">
        <Breadcrumbs items={[{ title: "Register Face" }]} />
      </div>
      <div className="p-6 max-w-lg mx-auto bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Office Hour</h2>
        </div>
        <div className="">
          <div className="mb-4">
            <label className="block text-gray-700 text-md font-bold mb-2">
              Login time
            </label>
            <input
              type="time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue="15:54"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-md font-bold mb-2">
              Logout time
            </label>
            <input
              type="time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              defaultValue="15:55"
            />
          </div>
        </div>
        <button className="w-full bg-primary text-white  p-2 rounded hover:bg-primary/90">
          Save
        </button>
      </div>
    </div>
  );
};
export { LoginLogoutTime };
