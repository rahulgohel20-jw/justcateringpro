import { useState } from "react";

const DateInput = ({ label = "Select Date", defaultToday = false, value, onChange }) => {
  // Format today in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // If value not provided, fallback to today (if defaultToday=true)
  const [date, setDate] = useState(value || (defaultToday ? today : ""));

  const handleChange = (e) => {
    setDate(e.target.value);
    if (onChange) onChange(e.target.value); // pass value to parent
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 w-32">{label}</label>
      <input
        type="date"
        value={date}
        onChange={handleChange}
        className="border rounded px-2 py-1"
      />
    </div>
  );
};

export default DateInput;
