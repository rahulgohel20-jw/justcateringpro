import { Select } from "antd";

const UtilityDropdown = (...rest) => {
  return (
    <Select
      value={undefined}
      className="w-full border-none shadow-none focus:outline-none"
      placeholder="Please select"
      style={{ width: "100%" }}
      options=""
      {...rest}
    />
  );
};

export default UtilityDropdown;
