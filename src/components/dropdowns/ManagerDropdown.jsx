import { Select } from "antd";

const ManagerDropdown = ({ value, onChange, options, ...rest }) => {
  const handleChange = (val) => {
    onChange({ target: { name: "managerId", value: val } });
  };

  return (
    <Select
      showSearch
      allowClear
      value={value || undefined}
      onChange={handleChange}
      placeholder="Please select"
      options={options}
      className="w-full border-none shadow-none focus:outline-none"
      style={{
        border: "none",
        boxShadow: "none",
      }}
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      {...rest}
    />
  );
};

export default ManagerDropdown;
