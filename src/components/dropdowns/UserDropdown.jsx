import { Select } from "antd";

const UserDropdown = ({ value, onChange, options = [], name, ...rest }) => {
  const handleChange = (val) => {
    onChange({
      target: { name: name, value: val },
    });
  };

  return (
    <Select
      showSearch // 🔍 enables search
      allowClear // optional (clear icon)
      value={value || undefined}
      placeholder="Please select"
      className="w-full"
      style={{ width: "100%" }}
      onChange={handleChange}
      optionFilterProp="label" // 🔥 search by label
      filterOption={(input, option) =>
        option.label.toLowerCase().includes(input.toLowerCase())
      }
      options={options} // must contain {label, value}
      {...rest}
    />
  );
};

export default UserDropdown;
